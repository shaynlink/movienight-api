const path = require('node:path');
require('dotenv').config({path: path.resolve(path.join(__dirname, '..', '.env'))});
const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const http = require('node:http');

const users = require('./users');
const events = require('./events');

const app = express();

const client = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all('/healthcheck', (req, res) => res.sendStatus(204));

app.use('/users', users(client));
app.use('/events', events(client));

http.createServer(app).listen(process.env.PORT, () => client.connect().then(() => console.log('MONGO CONNECTED')));