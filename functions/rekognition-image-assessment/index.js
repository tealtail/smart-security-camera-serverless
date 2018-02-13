'use strict';

exports.handler = (event, context, callback) => {
  //
  // Submits image from s3 bucket to Rekognition detectLabels function.
  //

  // Setup Rekognition client
  const AWS = require('aws-sdk');
  const rekognition = new AWS.Rekognition({
    apiVersion: '2016-06-27',
    region: process.env.AWS_REGION
  });

  // Get image details from event object
  const bucket = event.bucket;
  const filename = event.key;

  console.log(`Bucket [${bucket}], Key [${filename}]`);

  // Configure Rekognition client parameters, including image name
  // and location, maximum amount of results, and minimum confidence level
  const params = {
    Image: {
      S3Object: { Bucket: bucket, Name: filename }
    },
    MaxLabels: 100,
    MinConfidence: 0.0
  };

  // Call detectLabels
  rekognition.detectLabels(params, function(err, data) {
    if (err) {
      const errorMessage = `Error in [rekognition-image-assessment].
        Function input [${JSON.stringify(event, null, 2)}].
        Error [${err}].`;
      // Log error
      console.log(errorMessage, err.stack);
      return callback(errorMessage, null);
    }
    console.log(`Retrieved Labels [${JSON.stringify(data)}]`);

    // Return labels as a JavaScript object that can be passed into the
    // subsequent lambda function.
    callback(null, Object.assign(data, event));
  });
};
