'use strict';

const BUCKET = '__BUCKET_NAME__';
const PUBLIC_URL = '__PUBLIC_URL__';

const AWS = require('aws-sdk');
const S3 = new AWS.S3({
  signatureVersion: 'v4',
});
const JIMP = require("jimp");

module.exports.manipulate = (event, context, callback) => {
  
  let dimensions = event.pathParameters.size.toLowerCase().split("x")
  dimensions[0] = (dimensions[0] == 'auto') ? JIMP.AUTO : parseInt(dimensions[0]);
  dimensions[1] = (dimensions[1] == 'auto') ? JIMP.AUTO : parseInt(dimensions[1]);

  S3.getObject({Bucket: BUCKET, Key: event.pathParameters.image})
    .promise()
    .then((data) => JIMP.read(data.Body))
    .then((image) => {
      image
        .resize(dimensions[0], dimensions[1])
        .getBuffer(JIMP.MIME_JPEG, (err, buffer) => {
          if (err) throw err;

          return S3.putObject({
            Body: buffer,
            Bucket: BUCKET,
            ContentType: JIMP.MIME_JPEG,
            Key: event.pathParameters.size + '/' + event.pathParameters.image,
          }).promise()
          .then(() => {
            return callback(null, {
              statusCode: '301',
              headers: {
                'location': PUBLIC_URL + event.pathParameters.size + '/' + event.pathParameters.image
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
