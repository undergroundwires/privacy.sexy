#!/bin/bash

# Parse parameters
while [[ "$#" -gt 0 ]]; do case $1 in
  --user-profile) USER_PROFILE="$2"; shift;;
  --role-profile) ROLE_PROFILE="$2"; shift;;
  --role-arn) ROLE_ARN="$2"; shift;;
  --session) SESSION="$2";shift;;
  --region) REGION="$2";shift;;
  *) echo "Unknown parameter passed: $1"; exit 1;;
esac; shift; done

# Verify parameters
if [ -z "$USER_PROFILE" ]; then echo "User profile name is not set."; exit 1; fi;
if [ -z "$ROLE_PROFILE" ]; then echo "Role profile name is not set."; exit 1; fi;
if [ -z "$ROLE_ARN" ]; then echo "Role ARN is not set"; exit 1; fi;
if [ -z "$SESSION" ]; then echo "Session name is not set."; exit 1; fi;
if [ -z "$REGION" ]; then echo "Region is not set."; exit 1; fi;

creds=$(aws sts assume-role --role-arn $ROLE_ARN --role-session-name $SESSION --profile $USER_PROFILE)

aws_access_key_id=$(echo $creds | jq -r '.Credentials.AccessKeyId')
echo ::add-mask::$aws_access_key_id
aws_secret_access_key=$(echo $creds | jq -r '.Credentials.SecretAccessKey')
echo ::add-mask::$aws_secret_access_key
aws_session_token=$(echo $creds | jq -r '.Credentials.SessionToken')
echo ::add-mask::$aws_session_token

aws configure --profile $ROLE_PROFILE set aws_access_key_id $aws_access_key_id
aws configure --profile $ROLE_PROFILE set aws_secret_access_key $aws_secret_access_key
aws configure --profile $ROLE_PROFILE set aws_session_token $aws_session_token
aws configure --profile $ROLE_PROFILE set region $REGION

echo Profile $ROLE_PROFILE is created

bash "${BASH_SOURCE%/*}/mask-identity.sh" --profile $ROLE_PROFILE