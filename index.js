const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;

const app = express();


app.use(cors());
app.use(express.json())

console.log(process.env.DB_USER);


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u2v3lxe.mongodb.net/?retryWrites=true&w=majority`;

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


        const toyCollection = client.db("toyDB").collection("toys");


        app.get('/toys', async (req, res) => {
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await toyCollection.find(query).toArray();
            res.send(result)
            console.log(query);
        })


        // -------------- Add New Toy In DataBase ----------------
        app.post('/toys', async (req, res) => {
            const toy = req.body;
            console.log(toy);
            const result = await toyCollection.insertOne(toy);
            res.send(result)
        })

         // -------------- Get All Toys From DataBase ----------------

        // app.get('/toys', async (req, res) =>{
        //     const cursor = toyCollection.find();
        //     const result = await cursor.toArray();
        //     res.send(result)
        // })

        // -------------- Get Updated Toys ID In DataBase ----------------

        app.get('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCollection.findOne(query);
            res.send(result)
        })

        // ------------- Put Updated Toy Data in DB --------------------

        app.put('/toys/:id', async(req, res) =>{
            const id = req.params.id;
            const toy = req.body;
            console.log(toy);
            const filter = {_id: new ObjectId(id)};
            const options = { upsert: true };
            const updatedToy = {
                $set: {
                    price: toy.price,
                    quantity: toy.quantity,
                    description: toy.description,
                }
            }

            const result = await toyCollection.updateOne(filter, updatedToy, options)
            res.send(result)

        })

        // -------------- Delete Toy From DataBase ----------------
        app.delete('/toys/:id', async(req, res) =>{
            const id = req.params.id;
            console.log('Delete', id);
            const query = { _id: new ObjectId(id) };
            const result = await toyCollection.deleteOne(query);
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
    res.send('Server is running');
})


app.listen(port, () => {
    console.log(`Server is running in port ${port}`);
})