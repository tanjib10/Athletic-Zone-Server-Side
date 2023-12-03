const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yfphnhu.mongodb.net/?retryWrites=true&w=majority`;

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
   //  await client.connect();
     
   const userCollection = client.db("athleticDb").collection("users");
   const subscriberCollection = client.db("athleticDb").collection("subscribers")
   const imageCollection = client.db("athleticDb").collection("images");
    const trainerCollection = client.db("athleticDb").collection("trainers");
    const newTrainerCollection = client.db("athleticDb").collection("newTrainers");
    const bookingsCollection = client.db("athleticDb").collection("bookings");
    const classesCollection = client.db("athleticDb").collection("classes");
   //users api
   app.post('/users', async (req,res) => {
      const user = req.body;
      const query = {email: user.email}
      const existingUser = await userCollection.findOne(query);
      if(existingUser){
         return res.send({message: "user exists", insertedId: null}) 
      }
      const result = await userCollection.insertOne(user)
      res.send(result)
   })
  
          // Gallery API for Infinite Scrolling
    app.get('/api/images', async (req, res) => {
      const { skip, limit } = req.query;
      try {
        const images = await imageCollection.find().skip(parseInt(skip)).limit(parseInt(limit)).toArray();
        res.json(images);
      } catch (error) {
        console.log(error)
      }
    });

     // Trainers API
    app.get('/api/trainers', async (req, res) => {
      try {
        const trainers = await trainerCollection.find().toArray();
        res.json(trainers);
      } catch (error) {
        console.log(error);
      }
    });

     // classes API
    app.get('/classes', async (req, res) => {
      try {
        const classes = await classesCollection.find().toArray();
        res.json(classes);
      } catch (error) {
        console.log(error);
      }
    });

    // Trainer Details API
app.get('/api/trainers/:id', async (req, res) => {
  const trainerId = req.params.id;
  try {
    const trainer = await trainerCollection.findOne({_id : new ObjectId(trainerId)})

    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    res.json(trainer);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


   //newsletter subscription api 
   app.post('/subscribers', async (req,res) => {
    const subscriber = req.body;
    const result = await subscriberCollection.insertOne(subscriber);
    res.send(result) 
   })

   //new trainer apply api
   app.post('/api/new/trainers', async (req,res) => {
    const applier = req.body;
    const result = await newTrainerCollection.insertOne(applier);
    res.send(result) 
   })

   //trainer booking api
   app.post('/booking', async (req,res) => {
    const booking = req.body;
    const result = await bookingsCollection.insertOne(booking);
    res.send(result) 
   })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   //  await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res)  => {
   res.send('running')
})

app.listen (port, () =>{
   console.log("Server Running")
})