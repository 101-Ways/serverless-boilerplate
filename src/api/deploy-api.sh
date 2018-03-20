#!/bin/bash

if [ -z $1 ] || [ -z $2 ]; then
    echo "Please provide stackName, database connection and bucket name"
    echo "Example: ./deploy.sh johndoe dbConn myBucket"
    exit
fi

function zipFile {
    echo "artifacts/`basename $1`"
}

stackName=$1
dbConn=$2
s3Bucket=$3
region="eu-west-1"
templateFile="../api.yaml"

# Making sure npm install all the things
pushd ..
npm install
popd

# Zip artifacts
file="/tmp/lambda-$stackName-`date '+%Y%m%d%H%M%S'`.zip"
pushd ../src
zip -r $file api -x ".*"
popd
aws s3 cp $file --region $region s3://$s3Bucket/artifacts/
rm $file

# Create/Update stack
echo "Rebuilding the stack"
aws cloudformation describe-stacks --stack-name $stackName --output text --query 'Stacks[0].StackName' --region $region > /dev/null
if [ $? -eq 0 ]; then
  cfnCommand=update-stack
  exit $?
  cfnWait=stack-update-complete
else
  echo Please ignore the previous message
  cfnCommand=create-stack
  cfnWait=stack-create-complete
fi

aws cloudformation $cfnCommand --stack-name $stackName --capabilities CAPABILITY_IAM --template-body file://$templateFile --region $region --parameters \
ParameterKey=StackName,ParameterValue=$stackName ParameterKey=DbConn,ParameterValue=$dbConn \
ParameterKey=Bucket,ParameterValue=$s3Bucket ParameterKey=LambdaZip,ParameterValue=$(zipFile $file)

aws cloudformation wait $cfnWait --stack-name $stackName --region $region
