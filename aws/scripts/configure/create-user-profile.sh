#!/bin/bash

# Parse parameters
while [[ "$#" -gt 0 ]]; do case $1 in
  --profile) PROFILE="$2"; shift;;
  --access-key-id) ACCESS_KEY_ID="$2"; shift;;
  --secret-access-key) SECRET_ACCESS_KEY="$2"; shift;;
  --region) REGION="$2";shift;;
  *) echo "Unknown parameter passed: $1"; exit 1;;
esac; shift; done

# Verify parameters
if [ -z "$PROFILE" ]; then echo "Profile name is not set."; exit 1; fi;
echo $PROFILE
if [ -z "$ACCESS_KEY_ID" ]; then echo "Access key ID is not set"; exit 1; fi;
if [ -z "$SECRET_ACCESS_KEY" ]; then echo "Secret access key is not set."; exit 1; fi;
if [ -z "$REGION" ]; then echo "Region is not set."; exit 1; fi;

aws configure --profile $PROFILE set aws_access_key_id $ACCESS_KEY_ID
aws configure --profile $PROFILE set aws_secret_access_key $SECRET_ACCESS_KEY
aws configure --profile $PROFILE set region $REGION

echo Profile $PROFILE is created

bash "${BASH_SOURCE%/*}/mask-identity.sh" --profile $PROFILE