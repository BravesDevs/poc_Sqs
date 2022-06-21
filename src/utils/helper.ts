const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-west-2', accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY });

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

export const sendMessageToQueue = async (params) => {
    try {
        await sqs.sendMessage(params).promise();
    }
    catch (err) {
        params.QueueUrl = process.env.AWS_SQS_DEAD_LETTER_QUEUE_URL;
        await sqs.sendMessage(params).promise();
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
            sqs.deleteMessage(deleteParams, (err, data) => {
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
    sqs.purgeQueue({ QueueUrl: process.env.AWS_SQS_SOURCE_QUEUE_URL }, (err, data) => {
        if (err) {
            console.log(err, err.stack);
        } else {
            console.log('Successfully purged queue');
        }
    })
}

