#!/bin/bash

# Parse parameters
while [[ "$#" -gt 0 ]]; do case $1 in
  --profile) PROFILE="$2";shift;;
  *) echo "Unknown parameter passed: $1"; exit 1;;
esac; shift; done

# Verify parameters
if [ -z "$PROFILE" ]; then echo "Profile name is not set."; exit 1; fi;

aws_identity=$(aws sts get-caller-identity --profile $PROFILE)
echo ::add-mask::$(echo $aws_identity | jq -r '.Account')
echo ::add-mask::$(echo $aws_identity | jq -r '.UserId')
echo ::add-mask::$(echo $aws_identity | jq -r '.Arn')

echo Credentials are masked