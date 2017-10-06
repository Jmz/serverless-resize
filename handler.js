'use strict';

const BUCKET = 'image-resize-test-bucket';

const AWS = require('aws-sdk');
const S3 = new AWS.S3({
  signatureVersion: 'v4',
});
const JIMP = require("jimp");

module.exports.manipulate = (event, context, callback) => {
  
  let dimensions = event.pathParameters.size.split("x")

  S3.getObject({Bucket: BUCKET, Key: event.pathParameters.image})
    .promise()
    .then((data) => JIMP.read(data.Body))
    .then((image) => {
      image
        .resize(parseInt(dimensions[0]), parseInt(dimensions[1]))
        .getBuffer(JIMP.MIME_JPEG, (err, buffer) => {
          if (err) throw err;

          return S3.putObject({
            Body: buffer,
            Bucket: BUCKET,
            ContentType: JIMP.MIME_JPEG,
            Key: event.pathParameters.size + '-' + event.pathParameters.image,
          }).promise()
          .then(() => {
            return callback(null, {
              statusCode: '301',
              headers: {
                'location': 'https://s3-eu-west-1.amazonaws.com/image-resize-test-bucket/' + event.pathParameters.size + '-' + event.pathParameters.image
              },
              body: '',
            });
          })
        })
    })
    .catch(err => callback(err))

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
