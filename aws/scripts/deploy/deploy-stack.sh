#!/bin/bash

# Parse parameters
while [[ "$#" -gt 0 ]]; do case $1 in
  --template-file) TEMPLATE_FILE="$2"; shift;;
  --stack-name) STACK_NAME="$2"; shift;;
  --profile) PROFILE="$2"; shift;;
  --capabilities) CAPABILITY_IAM="$2"; shift;;
  --role-arn) ROLE_ARN="$2";shift;;
  --session) SESSION="$2";shift;;
  --region) REGION="$2";shift;;
  *) echo "Unknown parameter passed: $1"; exit 1;;
esac; shift; done

# Verify parameters
if [ -z "$TEMPLATE_FILE" ]; then echo "Template file is not set."; exit 1; fi;
if [ -z "$STACK_NAME" ]; then echo "Template file is not set."; exit 1; fi;
if [ -z "$PROFILE" ]; then echo "Profile is not set."; exit 1; fi;
if [ -z "$ROLE_ARN" ]; then echo "Role ARN is not set."; exit 1; fi;
if [ -z "$SESSION" ]; then echo "Role session is not set."; exit 1; fi;


echo Validating stack "$STACK_NAME"
aws cloudformation validate-template \
    --template-body file://$TEMPLATE_FILE \
    --profile $PROFILE

ROLE_PROFILE=$STACK_NAME

echo Assuming role
bash "${BASH_SOURCE%/*}/../configure/create-role-profile.sh" \
    --role-profile $ROLE_PROFILE --user-profile $PROFILE \
    --role-arn $ROLE_ARN \
    --session $SESSION \
    --region $REGION

echo Deploying stack "$TEMPLATE_FILE"
aws cloudformation deploy \
    --template-file $TEMPLATE_FILE \
    --stack-name $STACK_NAME \
    ${CAPABILITY_IAM:+ --capabilities $CAPABILITY_IAM} \
    --no-fail-on-empty-changeset \
    --profile $ROLE_PROFILE