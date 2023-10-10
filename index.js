const express = require('express')
const cors =require('cors');
require('dotenv').config();
const stripe = require("stripe")(process.env.APP_SECRATE_KEY)
const app = express()
// middleWere
app.use(express.json())
app.use(cors())
const port = process.env.PORT || 4000;

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.APP_USER}:${process.env.APP_PASS}@cluster0.3kcnoe6.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const usersCollection =client.db('deepetch').collection("users");
const dataCollection =client.db('deepetch').collection("data");
const paymentCollection =client.db('deepetch').collection("payment");
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    app.post("/users",async(req,res)=>{
      const user =req.body;
     
      const result =await usersCollection.insertOne(user)
      res.send(result)
    })
    app.get("/users/:email",async(req,res)=>{
      const email=req.params.email
     
      const query ={email:email}
      const result =await usersCollection.find(query).toArray()
      res.send(result)

    })
    app.patch("/user/:id",async(req,res)=>{
      const id =req.params.id;
      const data =req.body
      const filter = { _id: new ObjectId(id) };
      console.log(data)
      console.log(id)
      const updateDoc = {
        $set: {
          trail: data.trail
        },
        
      };
      const result =await usersCollection.updateOne(filter,updateDoc)
    })
    app.post("/data",async(req,res)=>{
      const data =req.body
      const result =await dataCollection.insertOne(data)
      res.send(result)
    })
    app.get("/data/:email",async(req,res)=>{
        const email=req.params.email
        const query ={email:email}
      const result =await dataCollection.find(query).toArray()
      res.send(result)
    })
    app.delete("/data/:id",async(req,res)=>{
      const id =req.params.id
      const query = { _id: new ObjectId(id) };
    const result = await dataCollection.deleteOne(query);
    res.send(result)
    })
    app.get("/data",async(req,res)=>{
        const result =await dataCollection.find().toArray()
        res.send(result)
    })

    // Payment 
    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount =price*100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount:amount,
        currency: "usd",
        payment_method_types: [
          "card"
        ]
      })
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
      
      });

      app.post("/payment",async(req,res)=>{
        const payment =req.body
          console.log(payment)
          const paymentResult =await paymentCollection.insertOne(payment)
          const query ={_id:{$in:payment.OrderData.map(d=>new ObjectId(d._id))}}
          const deleteResult =await dataCollection.deleteMany(query);
          res.send({paymentResult,deleteResult})
      })

      app.get("/payments",async(req,res)=>{
        const result =await paymentCollection.find().toArray();
        res.send(result)

      })
      app.get("/payments/:email",async(req,res)=>{
        const email=req.params.email
        const query ={email:email}
        const result =await paymentCollection.find(query).toArray();
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
  res.send('deepetch server is running.....')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})