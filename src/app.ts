//Imports
const express = require('express');
const bodyParser = require('body-parser');
const {v4: uuidv4} = require('uuid')
const {Consumer} = require('sqs-consumer');

import {sendMessageToQueue, purgeQueue} from './utils';
//Express App Configs
const app = express();

//Setting up middlewares.
require('dotenv').config();
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());


app.get('/', async (req, res) => {
        let params = {
            QueueUrl: process.env.AWS_SQS_SOURCE_QUEUE_URL,
            Entries: []
        };
        for (let i = 0; i < 300; i += 1) {
            for (let j = 0; j < 10; j++) {
                params.Entries.push({
                    Id: uuidv4(),
                    MessageBody: JSON.stringify({"Message ": i + " " + j}),
                    // MessageGroupId: 'UserOrders'
                });
            }
            await sendMessageToQueue(params);
            params.Entries = [];
        }
        res.status(200).json({'ok': true, 'message': 'Message Published to Queues'});
    }
)

app.get('/purge', (req, res) => {
    purgeQueue()
    res.status(200).json({'ok': true, 'message': 'Queue purged'});
})


const sqs_consumer = Consumer.create({
    queueUrl: process.env.AWS_SQS_SOURCE_QUEUE_URL,
    visibilityTimeout: 30,
    waitTimeSeconds: 1,
    batchSize: 10,
    handleMessage: async (message) => {
        if (message) {
            console.log(message.Body);
        }
    }
});

sqs_consumer.on('error', (err) => {
    console.error(err.message);
});

sqs_consumer.on('processing_error', (err) => {
    console.error(err.message);
});

sqs_consumer.start();

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));