
const express = require('express');
const cors = require('cors')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;


// middeleWare 
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://e-learn-online.netlify.app'
    ],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser());


const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.c5gs6mm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version     
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// middleWares
const logger = (req, res, next) => {
    console.log(req.method, req.url);
    next();
}

const verrifyToken = (req, res, next) => {
    const token = req?.cookies?.token;
    // console.log('tooken i the midle', token)
    // if(!token){
    //     return res.status(401).send({message: 'unauthorized access'})
    // }
    // jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err, decoded)=>{
    //     if(err){
    //         return res.send({message: 'unauthorized access'})
    //     }
    //     req.user = decoded;

    // })
    next()

}

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const assignCollection = client.db('learnDB').collection('learn');
        const submittedCollection = client.db('submittedDB').collection('submitted');

        //    Auth related api
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            console.log('user for token', user)
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                // sameSite:'none'
            }
            )
                .send({ success: true })
        })

        app.post('/logOut', async (req, res) => {
            const user = req.body;
            console.log('looging ouut', user)
            res.clearCookie('token', { maxAge: 0 }).send({ success: true })
        })



        //  services related api 
        app.get('/assignments', async (req, res) => {
            const cursor = assignCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/assignments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await assignCollection.findOne(query);
            res.send(result)
        })

        app.post('/assignments', async (req, res) => {
            const crteAssaign = req.body;
            console.log(crteAssaign)
            const result = await assignCollection.insertOne(crteAssaign)
            res.send(result)
        })
        app.put('/assignments/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateAssaign = req.body;
            const update = {
                $set: {
                    assign: updateAssaign.assign,
                    date: updateAssaign.date,
                    description: updateAssaign.description,
                    mark: updateAssaign.mark,
                    photo: updateAssaign.photo,
                    title: updateAssaign.title
                }
            }
            const result = await assignCollection.updateOne(filter, update, options);
            res.send(result)
        })

        app.delete('/assignments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await assignCollection.deleteOne(query);
            res.send(result);
        })

        //submited

        app.get('/data', logger, verrifyToken, async (req, res) => {
            console.log(req.query.userEmail);
            console.log('token owner info', req.user)
            // if(req.user.email !== req.query.userEmail){
            //     return res.status(403).send({message: 'forbidden access'})
            // }
            let query = {};
            if (req.query?.userEmail) {
                query = { userEmail: req.query.userEmail }
            }
            const result = await submittedCollection.find(query).toArray();
            res.send(result)
        })

        app.get('/data', async (req, res) => {
            const cursor = submittedCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        // app.get('/data/:id', async(req, res)=>{
        //     const id = req.params.id;
        //     const query ={_id: new ObjectId(id)}
        //     const result = await submittedCollection.findOne(query);
        //     res.send(result)

        // })

        app.post('/data', async (req, res) => {
            const submit = req.body;
            console.log(submit)
            const result = await submittedCollection.insertOne(submit);
            res.send(result)
        })

        // app.put('/data/:id', async (req, res) => {
        //     console.log(req.params.id)
        //     const id = req.params.id;
        //     const filter = { _id: new ObjectId(id) }
        //     const options = { upsert: true };
        //     const updateData = req.body;
        //     const update = {
        //         $set: {
        //             assignTitle: updateData.assignTitle,
        //             assignment_mark: updateData.assignment_mark,
        //             pdf: updateData.pdf,
        //             note: updateData.note,
        //             userEmail: updateData.photo,

        //             status: updateData.status,
        //             feedback: updateData.feedback
        //         }
        //     }
        //     const result = await submittedCollection.updateOne(filter, update, options);
        //     res.send(result)
        // })


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
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