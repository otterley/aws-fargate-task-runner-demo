'use strict';

const AWS = require('aws-sdk');

exports.startMachine = async (event) => {
  const sfn = new AWS.StepFunctions();

  try {
    for (const record of event.Records) {
      console.log(`Invoking state machine ${process.env.STATE_MACHINE_ARN}`);
      console.log('Body follows:');
      console.log(JSON.stringify(record.body, null, 4));

      const result = await sfn.startExecution({
        stateMachineArn: process.env.STATE_MACHINE_ARN,
        input: JSON.stringify({
          Record: record
        })
      }).promise();
      console.log(`Execution ARN: ${result.executionArn}`);
    }
  } catch (e) {
    console.log(e);
    throw (e);
  }
};
