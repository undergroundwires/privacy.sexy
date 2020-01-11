#!/bin/bash

# Parse parameters
while [[ "$#" -gt 0 ]]; do case $1 in
  --paths) PATHS="$2"; shift;;
  --web-stack-name) WEB_STACK_NAME="$2"; shift;;
  --web-stack-cloudfront-arn-output-name) WEB_STACK_CLOUDFRONT_ARN_OUTPUT_NAME="$2"; shift;;
  --profile) PROFILE="$2"; shift;;
  --role-arn) ROLE_ARN="$2";shift;;
  --session) SESSION="$2";shift;;
  --region) REGION="$2";shift;;
  *) echo "Unknown parameter passed: $1"; exit 1;;
esac; shift; done

# Verify parameters
if [ -z "$PATHS" ]; then echo "Paths is not set."; exit 1; fi;
if [ -z "$PROFILE" ]; then echo "Profile is not set."; exit 1; fi;
if [ -z "$ROLE_ARN" ]; then echo "Role ARN is not set."; exit 1; fi;
if [ -z "$SESSION" ]; then echo "Role session is not set."; exit 1; fi;
if [ -z "$WEB_STACK_NAME" ]; then echo "Web stack name is not set."; exit 1; fi;
if [ -z "$WEB_STACK_CLOUDFRONT_ARN_OUTPUT_NAME" ]; then echo "CloudFront ARN output name is not set."; exit 1; fi;


echo Assuming role
ROLE_PROFILE=invalidate-cloudfront
bash "${BASH_SOURCE%/*}/../configure/create-role-profile.sh" \
    --role-profile $ROLE_PROFILE --user-profile $PROFILE \
    --role-arn $ROLE_ARN \
    --session $SESSION \
    --region $REGION

echo Getting CloudFront ARN from stack "$WEB_STACK_NAME" with output "$WEB_STACK_CLOUDFRONT_ARN_OUTPUT_NAME"
CLOUDFRONT_ARN=$(aws cloudformation describe-stacks \
            --stack-name $WEB_STACK_NAME \
            --query "Stacks[0].Outputs[?OutputKey=='$WEB_STACK_CLOUDFRONT_ARN_OUTPUT_NAME'].OutputValue" \
            --output text \
            --profile $ROLE_PROFILE)
if [ -z "$CLOUDFRONT_ARN" ]; then echo "Could not read CloudFront ARN"; exit 1; fi;
echo ::add-mask::$CLOUDFRONT_ARN

echo Syncing folder to S3
aws cloudfront create-invalidation \
    --paths $PATHS \
    --distribution-id $CLOUDFRONT_ARN \
    --profile $ROLE_PROFILE