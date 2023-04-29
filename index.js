const express = require('express')
const app = express()
const multer = require('multer');
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require("uuid");

var cron = require('node-cron');
var fs = require('fs');

require('dotenv').config();

const upload = multer({ dest: __dirname + '/files' });
const client = new MongoClient(process.env.MONGODB_URI);


cron.schedule('*/5 * * * *', () => {
    deleteOldFiles();
});


async function deleteOldFiles() {
    console.log("Running file deletion CRON job");
    const db = client.db("ETFS");
    const database_interaction = await db.collection("Files").find({ time_expires: { $lte: Date.now() } }).toArray();
    for (const val of database_interaction) {
        fs.unlinkSync(__dirname + "/files/" + val.location);
        await db.collection("Files").deleteOne({ id: val.id });
        console.log("Deleted file with ID of: " + val.id);
    }
}


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
    res.status(200).send({ "status": "OK" });
})


app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (req.query.key === process.env.KEY) {
            const db = client.db("ETFS");
            const id = uuidv4();
            await db.collection("Files").insertOne({ "id": id, "time": Date.now(), "time_expires": Date.now() + 30 * 60000, "location": req.file.filename, "extension": req.file.originalname.split(".").pop(), "original_name": req.file.originalname });
            res.status(200).send({ "status": "OK", "id": id });
        } else {
            res.status(401).send({ error: "Invalid credentials" });
        }
    } catch {
        res.status(500).send({ error: "Invalid parameters" });
    }
})


app.get("/download", async (req, res) => {
    try {
        const db = client.db("ETFS");
        const database_interaction = await db.collection("Files").findOne({ id: req.query.id });
        res.status(200).download(__dirname + "/files/" + database_interaction.location, database_interaction.original_name);
    } catch {
        res.status(500).send({ error: "Invalid parameters" });
    }
})


app.listen(5000, () => {
    console.log(`ETFS listening on port 5000`);
})