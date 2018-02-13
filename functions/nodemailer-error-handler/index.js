'use strict';

exports.handler = (event, context, callback) => {
  const aws = require('aws-sdk');
  const nodemailer = require('nodemailer');
  const sesTransport = require('nodemailer-ses-transport');

  const ses = new aws.SES({
    apiVersion: '2010-12-01',
    region: process.env.AWS_REGION
  });

  // Set up ses as tranport for email
  const transport = nodemailer.createTransport(sesTransport({ ses: ses }));

  // Pickup parameters from calling event
  const errorMessage = JSON.stringify(event);

  // Set up email parameters
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_RECIPIENT,
    subject: '⚠️ Error processing image ⚠️',
    text: errorMessage,
    html: `<pre>${errorMessage}</pre>`
  };

  // Send mail with defined transport object
  transport.sendMail(mailOptions, function(error, info) {
    if (error) {
      const errorMessage = `Error in [nodemailer-error-handler].\r Function input [${JSON.stringify(
        event,
        null,
        2
      )}].\r Error [${error}].`;
      console.log(errorMessage);
      return callback(errorMessage, null);
    }

    console.log(`Message sent: ${info}`);
    callback(null, 'Success');
  });
};
