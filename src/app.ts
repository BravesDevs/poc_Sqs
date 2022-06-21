//Imports
const express = require('express');
const bodyParser = require('body-parser');

//Express App Configs
const app = express();

//Setting up middlewares.
require('dotenv').config();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());