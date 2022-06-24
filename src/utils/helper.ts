import {AWSError} from "aws-sdk";

const AWS = require('aws-sdk');
const https = require('https');

const agent = new https.Agent({maxSockets: 25});

AWS.config.update({
    region: 'us-west-2',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const sqs = new AWS.SQS({apiVersion: '2012-11-05', httpOptions: {agent}});

export const sendMessageToQueue = async (params) => {
    try {
        sqs.sendMessageBatch(params).promise().then(data => {
            console.log(data);
        }).catch(err => {
            console.log(err);
        })
    } catch (err) {
        return err;
    }
}

export const consumeFromQueue = (params) => {
    sqs.receiveMessage(params, (err, data) => {
        if (err) {
            console.log(err, err.stack);
        } else {
            if (!data.Messages) {
                console.log('Nothing to process');
                return;
            }
            const orderData = JSON.parse(data.Messages[0].Body);

            //SendGrid Email
            console.log('Order received', orderData);

            const deleteParams = {
                QueueUrl: params.QueueUrl,
                ReceiptHandle: data.Messages[0].ReceiptHandle
            };
            sqs.deleteMessage(deleteParams, (err) => {
                if (err) {
                    console.log(err, err.stack);
                } else {
                    console.log('Successfully deleted message from queue');
                }
            });

        }
    });
}

export const purgeQueue = () => {
    sqs.purgeQueue({QueueUrl: process.env.AWS_SQS_SOURCE_QUEUE_URL}, (err: AWSError) => {
        if (err) {
            console.log(err, err.stack);
        } else {
            console.log('Successfully purged queue');
        }
    })
}

