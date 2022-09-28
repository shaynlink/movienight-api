const express = require('express');
const router = express.Router();
const {ObjectId} = require('mongodb');

module.exports = function route(client) {
    router.get('/', async (req, res) => {
        const events = client.db('movienight').collection('events');
        if (!req.query.id) {
            const cursor = await events.find({
                forDate: {
                    $gt: new Date()
                }
            })
            return res.status(202).json(await cursor.toArray());
        }
        const event = await events.findOne({
            _id: ObjectId.createFromHexString(req.query.id)
        });
        return res.status(202).json(event);
    })
    
    const dataNeeded = [
        ['by', 'ObjectID'],
        ['forDate', Date],
        ['longitude', 'number'],
        ['latitude', 'number'],
        ['movies', [
            ['name', 'string'],
            ['picture', 'string'],
            ['selected', 'string[]']
        ]]
    ];

    router.post('/', async (req, res) => {
        const events = client.db('movienight').collection('events');
        if (!proceduralVerifyingData(req.body, dataNeeded)) {
            return res.sendStatus(400);
        }
        const result = await events.insertOne(req.body);
        if (!result?.insertedId) {
            return res.status(400).json({ error: {code: 'INSERR'} });
        }
        return res.status(202).json(result);
    })

    return router;
}

function proceduralController(target, key, value, check) {
    let controller = false;
    if (check == 'ObjectID') {
        controller = ObjectId.isValid(value);
    } else if (check == 'string' || check == 'number') {
        controller = typeof value == check;
    } else if (check == Date) {
        controller = !isNaN(Date.parse(value));
    } else if (Array.isArray(check)) {
        controller = proceduralVerifyingData(target[key], check);
    } else if (check.endsWith('[]')) {
        controller = value.every((el) => proceduralController(target, key, el, check.slice(-check.length, -2)));
    }

    return controller;
}

function proceduralVerifyingData(target, schema) {
    return Object.entries(target)
        .every(([key, value]) => {
            const element = schema.find(element => element[0] == key);
            if (!element) {
                return false;
            }
            return proceduralController(target, key, value, element[1]);
        });
}