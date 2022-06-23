//Imports
const express = require('express');
const bodyParser = require('body-parser');
import uuid from 'uuid';

const {Consumer} = require('sqs-consumer');

import {sendMessageToQueue, purgeQueue} from './utils';
//Express App Configs
const app = express();

//Setting up middlewares.
require('dotenv').config();
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());


app.get('/', async (req, res) => {
        let start = Date.now();
        let params = {
            QueueUrl: process.env.AWS_SQS_SOURCE_QUEUE_URL,
            Entries: []
        };
        for (let i = 0; i < 100; i += 1) {
            for (let j = 0; j < 10; j++) {
                params.Entries.push({
                    Id: 'id' + i + j,
                    MessageBody: JSON.stringify({"Message ": i + " " + j})
                });
                // const params = {
                //     MessageBody: JSON.stringify({
                //         order_id: Math.random(),
                //         date: (new Date()).toISOString()
                //     }),
                //     QueueUrl: process.env.AWS_SQS_SOURCE_QUEUE_URL
                // };
                await sendMessageToQueue(params);
                params.Entries = [];
            }
        }
        console.log("Executed in:", Date.now() - start);

        res.status(200).json({'ok': true, 'message': 'Message Published to Queues'});
    }
)
;

app.get('/purge', (req, res) => {
    purgeQueue()
    res.status(200).json({'ok': true, 'message': 'Queue purged'});
})


// const sqs_consumer = Consumer.create({
//     queueUrl: process.env.AWS_SQS_SOURCE_QUEUE_URL,
//     visibilityTimeout: 30,
//     waitTimeSeconds: 1,
//     batchSize: 10,
//     handleMessage: async (message) => {
//         if (message) {
//             console.log(message.Body);
//         }
//     }
// });
//
// sqs_consumer.on('error', (err) => {
//     console.error(err.message);
// });
//
// sqs_consumer.on('processing_error', (err) => {
//     console.error(err.message);
// });
//
// sqs_consumer.start();
//
app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));


// consumeFromQueue({
//     QueueUrl: process.env.AWS_SQS_SOURCE_QUEUE_URL,
//     MaxNumberOfMessages: 1,
//     VisibilityTimeout: 5,
//     WaitTimeSeconds: 0
// });

// let params = {
//     QueueUrl: process.env.AWS_SQS_SOURCE_QUEUE_URL,
//     MaxNumberOfMessages: 10,
//     VisibilityTimeout: 30,
//     WaitTimeSeconds: 20
// }

// sqs.receiveMessage(params, (err, data) => {
//     if (err) {
//         console.log(err, err.stack);
//     } else {
//         if (!data.Messages) {
//             console.log('Nothing to process');
//             return;
//         }
//         const orderData = data.Messages.map(message => JSON.parse(message.Body));
//         // const orderData = JSON.parse(data.Messages);

//         //SendGrid Email
//         console.log('Order received', orderData);

//         const deleteParams = {
//             QueueUrl: params.QueueUrl,
//             ReceiptHandle: data.Messages[0].ReceiptHandle
//         };
//         sqs.deleteMessage(deleteParams, (err, data) => {
//             if (err) {
//                 console.log(err, err.stack);
//             } else {
//                 console.log('Successfully deleted message from queue');
//             }
//         });

//     }
// });