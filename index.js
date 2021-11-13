const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//middleaware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xohwd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        //Database Collections 
        await client.connect();
        const database = client.db("carVenture");
        const carsCollection = database.collection('car-brands');
        const ordersCollection = database.collection('orders');
        const usersCollection = database.collection('users');
        const reviewsCollection = database.collection('reviews');


        //GET API for all the products showing UI
        app.get('/cars', async (req, res) => {
            const result = carsCollection.find({});
            const cars = await result.toArray();
            res.send(cars);

        });
        //get api for specific product 
        app.get('/cars/:id', async (req, res) => {
            const carDetails = await carsCollection.findOne({ _id: ObjectId(req.params.id) });
            res.send(carDetails);
        });

        //POST API for  new products
        app.post("/cars", async (req, res) => {
            const newPackage = (req.body);
            const result = await carsCollection.insertOne(newPackage);
            console.log(result);
            res.json(result);
        })

        //Delete API- delete products
        app.delete('/cars/:id', async (req, res) => {
            const deletedProduct = await carsCollection.deleteOne({ _id: ObjectId(req.params.id) });
            res.json(deletedProduct)
        });

        //POST API for Products order
        app.post('/orders', async (req, res) => {
            const orders = await ordersCollection.insertOne(req.body);
            res.json(orders);
        });

        //GET API-orders 
        app.get('/orders', async (req, res) => {
            const orders = await ordersCollection.find({}).toArray();
            res.send(orders);
        });

        //Delete API- delete order
        app.delete('/orders/:id', async (req, res) => {
            const deletedOrder = await ordersCollection.deleteOne({ _id: ObjectId(req.params.id) });
            res.json(deletedOrder)
        });

        // Update user status
        app.put('/orders/:id', async (req, res) => {
            const order = req.body;
            const options = { upsert: true };
            const updatedOrder = {
                $set: { status: order.status }
            };

            const updateStatus = await ordersCollection.updateOne({ _id: ObjectId(req.params.id) }, updatedOrder, options,)
            res.json(updateStatus);
        });

        //POST API- all users siging with email
        app.post('/users', async (req, res) => {
            const users = await usersCollection.insertOne(req.body);
            res.json(users);
        });

        //PUT API -user
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })

        //Update user role 
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: "admin" } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })


        //POST new review
        app.post("/reviews", async (req, res) => {
            const newReview = (req.body);
            const result = await reviewsCollection.insertOne(newReview);
            res.json(result);
        })
        //GET API-reviews
        app.get('/reviews', async (req, res) => {
            const reviews = await reviewsCollection.find({}).toArray();
            res.send(reviews);
        });

        console.log('database connected successfully');

    } finally {
        //await client.close();
    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send(' server is running');
});

app.listen(port, () => {
    console.log('server running at port', port);
});