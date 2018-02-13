'use strict';

exports.handler = (event, context) => {
  //
  // Activated by upload of new images to s3 bucket.  Kicks off step function that will process images.
  //

  const AWS = require('aws-sdk');
  const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    region: process.env.AWS_REGION
  });

  // Derive the bucket and filename from the event
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, ' ')
  );
  const params = { Bucket: bucket, Key: key };

  // Get the image (validate that an object is there)
  s3.getObject(params, (err, data) => {
    if (err) {
      console.log(err);
      const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
      return console.log(message);
    }

    console.log('New file uploaded:', { bucket: bucket, key: key });

    // Setup the parameters for triggering the step function
    const params = {
      stateMachineArn: process.env.STATE_MACHINE_ARN,
      input: `{"bucket":"${bucket}", "key":"${key}"}`
    };

    // Instansiate and run the step function
    const stepfunctions = new AWS.StepFunctions();

    stepfunctions.startExecution(params, function(err, data) {
      if (err) {
        return console.log(err, err.stack); // an error occurred
      }

      console.log(data); // successful response
    });
  });
};
