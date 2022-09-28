const express = require('express');
const router = express.Router();
const {phone} = require('phone');

module.exports = function route(client) {
    router.get('/', async (req, res) => {
        const users = client.db('movienight').collection('users');
        if (!req.query.num) {
            return res.sendStatus(400);
        }
        const dataPhone = phone((req.query.num.startsWith('0') ? req.query.num.substring(1) : req.query.num), { country: 'FR' });
        if (!dataPhone.isValid) {
            return res.status(400).json({error: {code: 'PHONENUMNOTVALID'} });
        }
        const user = await users.findOne({ num: dataPhone.phoneNumber });
        return res.status(202).json(user);
    });

    router.post('/', async (req, res) => {
        const users = client.db('movienight').collection('users');
        if (!req.query.num || !req.query.name) {
            return res.sendStatus(400);
        }
        const dataPhone = phone((req.query.num.startsWith('0') ? req.query.num.substring(1) : req.query.num), { country: 'FR' });
        if (!dataPhone.isValid) {
            return res.status(400).json({ error: {code: 'PHONENUMNOTVALID'} });
        }
        const user = await users.findOne({ num: dataPhone.phoneNumber }, {projection: { 
            _id: 1,
            num: 0,
            name: 0
        }});
        if (user != null) {
            return res.status(400).json({ error: {code: 'USEREX'} });
        }
        const result = await users.insertOne({num: dataPhone.phoneNumber, name: req.query.name});
        if (!result?.insertedId) {
            return res.status(400).json({ error: {code: 'INSERR'} });
        }
        return res.status(202).json(result);
    })

    return router;
} 