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
  const bucket = event.bucket;
  const filename = event.key;
  const labels = event.Labels;

  // Add timestamp to file name
  const localFile = filename.replace('upload/', '');

  // Set up HTML Email
  let htmlString =
    '<pre><u><b>Label &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Confidence</u></b><br>';
  for (let i = 0; i < labels.length; i++) {
    htmlString += `${labels[i].Name} ${Array(22 - labels[i].Name.length).join(
      '&nbsp;'
    )}`;
    htmlString += `${labels[i].Confidence.toFixed(1)} </b><br>`;
  }
  htmlString += '</pre>';
  htmlString += '<p><img src="cid:alert-image@example.com"/></p>';

  // Set up Text Email
  let textString = 'Label          Confidence\n';
  for (let i = 0; i < labels.length; i++) {
    textString += `${labels[i].Name} ${Array(22 - labels[i].Name.length).join(
      ' '
    )}`;
    textString += `${labels[i].Confidence.toFixed(1)}\n`;
  }

  // Set up email parameters
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_RECIPIENT,
    subject: '⏰ Alarm Event detected! ⏰',
    text: textString,
    html: htmlString,
    attachments: [
      {
        filename: localFile,
        path: `${process.env.S3_URL_PREFIX}${bucket}/${filename}`,
        cid: 'alert-image@example.com'
      }
    ]
  };

  transport.sendMail(mailOptions, function(error, info) {
    if (error) {
      const errorMessage = `Error in [nodemailer-send-notification].\r
        Function input [${JSON.stringify(event, null, 2)}].\r
        Error [${error}].`;
      console.log(errorMessage);
      callback(errorMessage, null);
    } else {
      console.log(`Message sent: ${info}`);
      callback(null, event);
    }
  });
};
