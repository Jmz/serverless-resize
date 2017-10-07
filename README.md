# Image Resizer

This app uses AWS API Gateway and Lambda to resize images on the fly.

## How it works

![ama](https://user-images.githubusercontent.com/465552/31307598-9a718e80-ab5f-11e7-9ffd-f88766e67824.png)

*Thanks to [@damian_kidd](https://www.instagram.com/damian_kidd/) for the image*

1. The user makes a request to your S3 bucket in the format `https://YOUR_BUCKET/HEIGHTxWIDTH/IMAGE_KEY`. 
2. If the image exists, it is served immediately. If not the user is redirected to a Lambda function (via an Amazon API Gateway).
3. The Lambda function grabs the original image from your S3 bucket, resizes it, pushes it to S3 and then returns a redirect which sends the user back to S3 where the newly processed image is stored.

## To do

- Nice handling for images that don't exist in S3
- Maybe limit the sizes that can be requested
- More processing options? Quality, grayscale, blur etc

## Setup

1. [Install Serverless](https://serverless.com/framework/docs/getting-started/)
2. [Configure](https://serverless.com/framework/docs/providers/aws/guide/credentials/) your AWS credentials
3. Add an S3 bucket which allows anonymous access.
4. Go to `Properties` > `Static Website Hosting` & select "Use this bucket to host a website". Add `index.html` as your index document and use the redirection rules from below.
4. Replace all occurrences of `__BUCKET_NAME__` with the name of your bucket in this app.
5. Replace `__PUBLIC_URL__` with the PUBLIC URL of your S3 bucket. This is found in the "Static Web Hosting" section of the S3 options.
5. `serverless deploy`

### S3 Bucket Policy

This policy will allow anybody to read items from your bucket. Replace `__BUCKET_NAME__` with your S3 bucket name.

```
{
    "Version": "2012-10-17",
    "Id": "Policy1507289356629",
    "Statement": [
        {
            "Sid": "Stmt1507289351422",
            "Effect": "Allow",
            "Principal": {
                "AWS": "*"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::__BUCKET_NAME__/*"
        }
    ]
}
```

### Redirection Rules

This XML tells S3 to redirect 404 requests to your Lambda function for processing.

Add this to the "Redirection Rules" box in the "Static Web Hosting" options of your S3 bucket. Replace `__LAMBDA_URL__` with the root URL of your Lambda function.

```
<RoutingRules>
  <RoutingRule>
    <Condition>
      <HttpErrorCodeReturnedEquals>404</HttpErrorCodeReturnedEquals>
    </Condition>
    <Redirect>
      <Protocol>https</Protocol>
      <HostName>__LAMBDA_URL__</HostName>
      <ReplaceKeyPrefixWith>dev/</ReplaceKeyPrefixWith>
      <HttpRedirectCode>307</HttpRedirectCode>
    </Redirect>
  </RoutingRule>
</RoutingRules>
```
