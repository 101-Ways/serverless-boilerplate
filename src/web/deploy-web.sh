#!/bin/bash

if [ -z $1 ] || [ -z $2 ] || [ -z $3 ]; then
    echo "Please provide stackName, a domain and bucket name"
    echo "Example: ./deploy.sh johndoe mydomain.example.com myBucket"
    echo "The domain should already be setup in ApiGateway custom domains."
    exit
fi

function zipFile {
    echo "artifacts/`basename $1`"
}

lowercaseStackName=$(echo "$1" | tr '[:upper:]' '[:lower:]')
domain=$2
s3Bucket=$3
stackName=$lowercaseStackName
region="eu-west-1"
templateFile="../web.yaml"
timestamp=$(date '+%Y%m%d%H%M%S')

echo "Install dependencies and generating bundles"
npm install
npm run build

echo "Building a CDN for the static assets"
aws s3 sync build/ s3://$cdnBucket/$lowercaseStackName/$githash/
publicUrl="https://$domain/$lowercaseStackName/$githash"

# Zip artifacts
file="/tmp/web-$lowercaseStackName-$timestamp.zip"
zip -r $file build/* node_modules/* lambda.js

# Upload the application bundle
aws s3 cp $file --region $region s3://$s3Bucket/artifacts/
rm $file

# Create/Update stack
echo "Rebuilding the stack"
aws cloudformation describe-stacks --stack-name $stackName --output text --query 'Stacks[0].StackName' --region $region > /dev/null
if [ $? -eq 0 ]; then
  cfnCommand=update-stack
  cfnWait=stack-update-complete
else
  echo Please ignore the previous message
  cfnCommand=create-stack
  cfnWait=stack-create-complete
fi

aws cloudformation $cfnCommand --stack-name $stackName --capabilities CAPABILITY_IAM --template-body file://$templateFile --region $region --parameters \
ParameterKey=StackName,ParameterValue=$lowercaseStackName ParameterKey=Bucket,ParameterValue=$s3Bucket ParameterKey=WebZip,ParameterValue=$(zipFile $file) \
ParameterKey=DomainName,ParameterValue=$domain ParameterKey=PublicUrl,ParameterValue=$publicUrl

aws cloudformation wait $cfnWait --stack-name $stackName --region $region
