const express = require('express')
const app = express()
const { MongoClient } = require('mongodb');
require('dotenv').config();
const port = 5000


const multer  = require('multer');
const upload = multer({ dest: __dirname + '/files' });


const client = new MongoClient(process.env.MONGODB_URI);


async function Init() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (e) {
        console.error(e);
    }
}


Init()


app.get('/', (req, res) => {
    res.status(200).send('')
})


app.post('/upload', upload.single('file'), async (req, res) => {
    const db = client.db("ETFS");
    const database_interaction = await db.collection("Files").insertOne({"Test": false, "id":69420});
    res.status(200).send({ "status": "OK", "result": database_interaction })
})


app.get("/download", async (req, res) => {
    const db = client.db("ETFS");
    const database_interaction = await db.collection("Files").findOne({id: req.query.id});
    res.status(200).send({ "status": "OK", "result": database_interaction })
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})