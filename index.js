const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const app = express()
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 3000

//middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xweyicz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        await client.connect();

        const usersCollection = client.db("BistroDB").collection("users")
        const menuCollection = client.db("BistroDB").collection("menu")
        const reviewsCollection = client.db("BistroDB").collection("reviews")
        const cartCollection = client.db("BistroDB").collection("cart")

        //users collection
        app.get('/users', async(req,res)=>{
            const result = await usersCollection.find().toArray()
            res.send(result)
        })
        app.post('/users',async(req,res)=>{
            const user = req.body;
            const query = {email:user.email}
            const existUser = await usersCollection.findOne(query)
            if(existUser){
                return res.send({message:'user already exist',insertId:null})
            }
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })

        // menu operation
        app.get('/menu', async(req,res)=>{
            let query = req.query.category
            const cursor = menuCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })
        app.get('/menuCount',async(req,res)=>{
            const count = await menuCollection.estimatedDocumentCount()
            res.send({count})
        })

        //reviews operation
        app.get('/reviews', async(req,res)=>{
            const cursor = reviewsCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        //Cart collection
        app.post('/cart' , async(req,res)=>{
            const item = req.body;
            const result = await cartCollection.insertOne(item)
            res.send(result)
        })
        app.get('/cart',async(req,res)=>{
            const email = req.query.email
            const query ={
                email:email
            }
            const result = await cartCollection.find(query).toArray()
            res.send(result)
        })
        app.delete('/cart/:id', async(req,res)=>{
            const id = req.params
            const query = {_id: new ObjectId(id)}
            const result = await cartCollection.deleteOne(query)
            res.send(result)
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
    res.send('BISTRO BOSS SERVER IS RUNNING')
})

app.listen(port, () => {
    console.log('BISTRO BOSS RUNNING ON PORT', port);
})