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
    await client.connect();
     
   const userCollection = client.db("athleticDb").collection("users");
   const subscriberCollection = client.db("athleticDb").collection("subscribers")
   const imageCollection = client.db("athleticDb").collection("images");
    const trainerCollection = client.db("athleticDb").collection("trainers");
    const newTrainerCollection = client.db("athleticDb").collection("newTrainers");
    const bookingsCollection = client.db("athleticDb").collection("bookings");
    const classesCollection = client.db("athleticDb").collection("classes");
 const forumPostCollection = client.db("athleticDb").collection("forumPosts");
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

    //user api
    app.get('/users', async (req, res) => {
      try {
        const user = await userCollection.find().toArray();
        res.json(user);
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


//class details api
app.get('/classes/:id', async (req, res) => {
  const classId = req.params.id;
  try {
    const classes = await classesCollection.findOne({_id : new ObjectId(classId)})
    if (!classes) {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    res.json(classes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


  // Fetch forum posts with pagination
app.get('/api/forum-posts', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  console.log(page)
  const pageSize = 6;

  try {
    const totalPosts = await forumPostCollection.countDocuments();
    const totalPages = Math.ceil(totalPosts / pageSize);

    const forumPosts = await forumPostCollection
      .find()
      .sort({ _id: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    res.json({ forumPosts, totalPages });
  } catch (error) {
    console.error(error);
  }
});




      // Handle upvote/downvote
app.post('/api/forum-posts/:id/vote', async (req, res) => {
  const postId = req.params.id;
  const voteType = req.body.voteType; 

  try {
    const forumPost = await forumPostCollection.findOne({ _id: new ObjectId(postId) });

    if (!forumPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (voteType === "upvote") {
      forumPost.upvotes = (forumPost.upvotes || 0) + 1;
    } else if (voteType === "downvote") {
      forumPost.downvotes = (forumPost.downvotes || 0) + 1;
    }

    await forumPostCollection.updateOne(
      { _id: new ObjectId(postId) },
      { $set: { upvotes: forumPost.upvotes, downvotes: forumPost.downvotes } }
    );

    res.json({ upvotes: forumPost.upvotes, downvotes: forumPost.downvotes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





   //newsletter subscription api
   app.get('/subscribers', async (req,res) => {
    const result = await subscriberCollection.find().toArray();
    res.send(result)
   })
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




app.put('/users/:id', async (req, res) => {
  const userId = req.params.id;
  const updatedUserData = req.body;
  try {
    const query = { _id: new ObjectId(userId) };
    const existingUser = await userCollection.findOne(query);

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    existingUser.name = updatedUserData.name || existingUser.name;
    existingUser.phone = updatedUserData.phone || existingUser.phone;
    existingUser.membershipID = updatedUserData.membershipID || existingUser.membershipID;
    const result = await userCollection.updateOne(query, { $set: existingUser });
    if (result.modifiedCount === 1) {
      return res.json({ message: 'User updated successfully' });
    } else {
      return res.status(500).json({ message: 'Failed to update user' });
    }
  } catch (error) {
    console.error(error);
  }
});




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