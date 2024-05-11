
const express = require('express');
const cors = require('cors')
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;


// middeleWare 
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.c5gs6mm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version     
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const assignCollection = client.db('learnDB').collection('learn');
        app.get('/assignments', async (req, res) => {
            const cursor = assignCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.post('/assignments', async (req, res) => {
            const crteAssaign = req.body;
            console.log(crteAssaign)
            const result = await assignCollection.insertOne(crteAssaign)
            res.send(result)
        })

        app.delete('/assignments/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await assignCollection.deleteOne(query);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello e-learn')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})