'use strict';

exports.handler = (event, context, callback) => {
  //
  // Moves processed files from upload to archive directory.  Normally the
  // last processing step.
  //

  const AWS = require('aws-sdk');
  const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    region: process.env.AWS_REGION
  });

  // Retrieve parameters from export handler event
  const bucket = event.bucket;
  const oldFilename = event.key;
  const alert = event.Alert;

  const fileDestination =
    alert === true ? 'archive/alerts/' : 'archive/falsepositives/';

  // Parameters for copy function
  const archiveParams = {
    Bucket: bucket,
    CopySource: `${bucket}/${oldFilename}`,
    Key: event.key.replace('upload/', fileDestination)
  };

  // Parameters for delete function
  const deleteParams = {
    Bucket: bucket,
    Key: oldFilename
  };

  // Moving requires first a copy...
  s3.copyObject(archiveParams, function(err, data) {
    if (err) {
      const errorMessage = `Error in in [s3-archive-image].
        Error copying [${oldFilename}] to [${fileDestination}] in bucket [${bucket}].
        Function input [${JSON.stringify(event, null, 2)}].
        Error [${err}].`;

      console.log(errorMessage, err);
      return callback(errorMessage, null);
    }
    // ...followed by a delete
    s3.deleteObject(deleteParams, function(err, data) {
      if (err) {
        const errorMessage = `Error in in [s3-archive-image].
          Error deleting [${oldFilename}] from bucket [${bucket}].
          Function input [${JSON.stringify(event, null, 2)}].
          Error [${err}].`;

        console.log(errorMessage, err);
        return callback(errorMessage, null);
      }

      console.log(`Successful archiving [${archiveParams.Key}]`);
      callback(null, `Successful archiving [${archiveParams.Key}]`);
    });
  });
};
