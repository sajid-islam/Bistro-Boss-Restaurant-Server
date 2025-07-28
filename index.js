const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY);
const port = process.env.PORT || 3000;

//middleware
app.use(cookieParser());
app.use(
    cors({
        credentials: true,
        origin: "http://localhost:5173",
    })
);
app.use(express.json());

//Verify jwt middle ware
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(403).send({ message: "Forbidden" });
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized" });
        }
        req.decoded = decoded;
        next();
    });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xweyicz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const usersCollection = client.db("BistroDB").collection("users");
        const menuCollection = client.db("BistroDB").collection("menu");
        const reviewsCollection = client.db("BistroDB").collection("reviews");
        const cartCollection = client.db("BistroDB").collection("cart");

        //jwt
        app.post("/jwt", async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: "1h",
            });
            res.cookie("token", token, {
                httpOnly: true,
                secure: false,
                sameSite: "Strict",
            }).send(token);
        });

        app.delete("/jwt", async (req, res) => {
            res.cookie("token", "", { maxAge: 0 });
            res.send("Logged out");
        });
        //users collection
        app.get("/users", verifyToken, async (req, res) => {
            console.log(req.decoded.email);
            const result = await usersCollection.find().toArray();
            res.send(result);
        });
        app.post("/users", async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const existUser = await usersCollection.findOne(query);
            if (existUser) {
                return res.send({
                    message: "user already exist",
                    insertId: null,
                });
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        app.get("/users/admin/:email", verifyToken, async (req, res) => {
            const email = req?.params?.email;
            if (email !== req?.decoded?.email) {
                return res.status(403).send({ message: "Unauthorized" });
            }
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let admin = false;
            if (user) {
                admin = user?.role === "admin";
            }
            res.send({ admin });
        });

        app.patch("/users/admin/:id", async (req, res) => {
            const id = req.params;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: "admin",
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        app.delete("/users/:id", async (req, res) => {
            const id = req.params;
            const query = { _id: new ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        });

        // menu operation
        app.get("/menu", async (req, res) => {
            let query = req.query.category;
            const cursor = menuCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });
        app.get("/menuCount", async (req, res) => {
            const count = await menuCollection.estimatedDocumentCount();
            res.send({ count });
        });

        //reviews operation
        app.get("/reviews", async (req, res) => {
            const cursor = reviewsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        //Cart collection
        app.post("/cart", async (req, res) => {
            const item = req.body;
            const result = await cartCollection.insertOne(item);
            res.send(result);
        });
        app.get("/cart", async (req, res) => {
            const email = req.query.email;
            const query = {
                email: email,
            };
            const result = await cartCollection.find(query).toArray();
            res.send(result);
        });
        app.delete("/cart/:id", async (req, res) => {
            const id = req.params;
            const query = { _id: new ObjectId(id) };
            const result = await cartCollection.deleteOne(query);
            res.send(result);
        });

        //payment related apis
        app.post("/create-payment-intent", verifyToken, async (req, res) => {
            const { price } = req.body;
            const amount = parseInt(price * 100);
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: "usd",
                payment_method_types: ["card"],
            });

            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("BISTRO BOSS SERVER IS RUNNING");
});

app.listen(port, () => {
    console.log("BISTRO BOSS RUNNING ON PORT", port);
});
