#!/bin/bash

# Parse parameters
while [[ "$#" -gt 0 ]]; do case $1 in
  --folder) FOLDER="$2"; shift;;
  --web-stack-name) WEB_STACK_NAME="$2"; shift;;
  --web-stack-s3-name-output-name) WEB_STACK_S3_NAME_OUTPUT_NAME="$2"; shift;;
  --storage-class) STORAGE_CLASS="$2"; shift;;
  --profile) PROFILE="$2"; shift;;
  --role-arn) ROLE_ARN="$2";shift;;
  --session) SESSION="$2";shift;;
  --region) REGION="$2";shift;;
  *) echo "Unknown parameter passed: $1"; exit 1;;
esac; shift; done

# Verify parameters
if [ -z "$FOLDER" ]; then echo "Folder is not set."; exit 1; fi;
if [ -z "$PROFILE" ]; then echo "Profile is not set."; exit 1; fi;
if [ -z "$ROLE_ARN" ]; then echo "Role ARN is not set."; exit 1; fi;
if [ -z "$SESSION" ]; then echo "Role session is not set."; exit 1; fi;
if [ -z "$WEB_STACK_NAME" ]; then echo "Web stack name is not set."; exit 1; fi;
if [ -z "$WEB_STACK_S3_NAME_OUTPUT_NAME" ]; then echo "S3 name output name is not set."; exit 1; fi;
if [ -z "$STORAGE_CLASS" ]; then echo "S3 object storage class is not set."; exit 1; fi;

echo Assuming role
ROLE_PROFILE=deploy-s3
bash "${BASH_SOURCE%/*}/../configure/create-role-profile.sh" \
    --role-profile $ROLE_PROFILE --user-profile $PROFILE \
    --role-arn $ROLE_ARN \
    --session $SESSION \
    --region $REGION

echo Getting S3 bucket name from stack "$WEB_STACK_NAME" with output "$WEB_STACK_S3_NAME_OUTPUT_NAME"
S3_BUCKET_NAME=$(aws cloudformation describe-stacks \
            --stack-name $WEB_STACK_NAME \
            --query "Stacks[0].Outputs[?OutputKey=='$WEB_STACK_S3_NAME_OUTPUT_NAME'].OutputValue" \
            --output text \
            --profile $ROLE_PROFILE)
if [ -z "$S3_BUCKET_NAME" ]; then echo "Could not read S3 bucket name"; exit 1; fi;
echo ::add-mask::$S3_BUCKET_NAME # Just being extra cautious

echo Syncing folder to S3

aws s3 sync $FOLDER s3://$S3_BUCKET_NAME \
    --storage-class $STORAGE_CLASS  \
    --no-progress --follow-symlinks --delete \
    --profile $ROLE_PROFILE