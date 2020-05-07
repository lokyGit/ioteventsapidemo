# IoT Events API Demo Install Guide

## Overview

This demo shows how you can use the IoT Events API together with Amplify to build custom user experiences. In this demo, the IoT Events API is used to create new detector models using a template.

## Steps to deploy

1) Prior to installing, you need to have the CLI for Amplify installed. 
[Amplify Getting Started](https://docs.amplify.aws/start)

2) Some parts of the code contains hardcoded items like the roleArn and the SNS arn in the lambda function.

3) Run this script in your terminal. Cloud9 can also be used to perform this step. This may take while:
```bash
mkdir react-amplified
cd react-amplified
npm install -g @aws-amplify/cli
amplify init --app https://github.com/krazers/ioteventsapidemo.git
```
[Amplify Blog for Installing Amplify projects from git](https://aws.amazon.com/blogs/mobile/amplify-cli-adds-scaffolding-support-for-amplify-apps-and-authoring-plugins/)

4) Execute this command
```bash
amplify publish
```

5) Copy the URL for cloudfront after the publish is completed.
