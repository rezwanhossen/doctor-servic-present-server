const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5001;
const app = express();
const corsOption = {
  origin: ["http://localhost:5173", "http://localhost:5001"],
  Credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOption));
app.use(express.json());

//=========================================================

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.p5jkrsj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const serviccol = client.db("serviceDB").collection("service");

    //get all data from db
    app.get("/service", async (req, res) => {
      const cursor = serviccol.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    //single data
    app.get("/sinleservic/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await serviccol.findOne(query);
      //console.log(result);
      res.send(result);
    });
    // spasific email
    app.get("/service/:email", async (req, res) => {
      const email = req.params.email;
      const result = await serviccol.find({ email: email }).toArray();
      res.send(result);
    });
    // post data
    app.post("/service", async (req, res) => {
      const newServics = req.body;
      console.log(newServics);
      const result = await serviccol.insertOne(newServics);
      res.send(result);
    });

    //update data

    app.put("/updatsingleservic/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const query = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updatData = {
        $set: {
          ...data,
        },
      };
      const result = await serviccol.updateOne(query, updatData, option);
      res.send(result);
    });

    //deleted data in servic
    app.delete("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await serviccol.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

//=============================================================================
app.get("/", (req, res) => {
  res.send("hello from doccare...");
});

app.listen(port, () => {
  console.log(`server running on ,${port}`);
});
