'use strict';

exports.handler = (event, context, callback) => {
  //
  // Evaluates labels from Rekognition and decides whether or not an emergency situation has been detected.
  //
  const _ = require('lodash');

  const alertOn = _.split(process.env.ALERT_ON_LABELS, ',');

  const labels = _.map(event.Labels, function(l) {
    return l.Name;
  });

  _.forEach(alertOn, function(trigger) {
    if (_.includes(labels, trigger)) {
      event.Alert = true;
      return false;
    }
  });

  if (event.Alert) {
    return callback(null, event);
  }

  callback(null, _.assign({ Alert: false }, event));
};
