const express = require('express')
const app = express()
const { MongoClient } = require('mongodb');
require('dotenv').config();
const port = 5000
const { v4: uuidv4 } = require("uuid");


const multer = require('multer');


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
    res.status(200).send('<form enctype="multipart/form-data" target="dummyframe" method="post" action="/upload"><input id="fileupload" name="file" type="file" /><input type="submit" value="submit" id="submit" /></form><iframe name="dummyframe" id="dummyframe" style="display: none;"></iframe>')
})


app.post('/upload', upload.single('file'), async (req, res) => {
    const db = client.db("ETFS");
    const id = uuidv4()
    await db.collection("Files").insertOne({ "id": id, "time": Date.now(), "location": req.file.filename, "extension": req.file.originalname.split(".").pop(), "original_name": req.file.originalname });
    res.status(200).send({ "status": "OK", "id": id })
})


app.get("/download", async (req, res) => {
    const db = client.db("ETFS");
    const database_interaction = await db.collection("Files").findOne({ id: req.query.id });
    res.status(200).download(__dirname + "/files/" + database_interaction.location, database_interaction.original_name)
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})