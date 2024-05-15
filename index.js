const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 5001;
const app = express();
const corsOption = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://doctoe-servics.web.app",
  ],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOption));
app.use(express.json());
app.use(cookieParser());

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

//================================================================

const verifytoken = (req, res, next) => {
  const token = req.cookies?.token;
  // console.log("middel wire token", token);
  if (!token) {
    return res.status(401).send({ message: "unauthoroje" });
  }
  jwt.verify(token, process.env.DB_TOKEN, (err, decode) => {
    if (err) {
      return res.status(401).send({ message: "you are not parmeted" });
    }
    req.user = decode;
    next();
  });
};

//==============================================================

async function run() {
  try {
    const serviccol = client.db("serviceDB").collection("service");
    const bookcol = client.db("serviceDB").collection("booked");

    //jwt generator
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.DB_TOKEN, {
        expiresIn: "10h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });
    //cler token in logout
    app.post("/logout", async (req, res) => {
      const user = req.body;
      res
        .clearCookie("token", {
          maxAge: 0,
        })
        .send({ success: true });
    });

    //get all data from db
    app.get("/service", async (req, res) => {
      const cursor = serviccol.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    //single data
    app.get("/singleservic/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await serviccol.findOne(query);
      //console.log(result);
      res.send(result);
    });
    //search data
    // app.get("/all-servic", async (req, res) => {
    //   try {
    //     const search = req.query.search;
    //     let query = {
    //       sName: { $regex: search, $options: "i" },
    //     };
    //     // Your MongoDB query logic here...
    //   } catch (error) {
    //     console.error("Error:", error);
    //     res.status(500).json({ error: "Internal Server Error" });
    //   }
    // });

    // spasific email
    app.get("/service/:email", async (req, res) => {
      const email = req.params.email;
      const result = await serviccol.find({ email: email }).toArray();
      res.send(result);
    });
    //book data
    app.post("/booked", async (req, res) => {
      const bookdata = req.body;
      const result = await bookcol.insertOne(bookdata);
      res.send(result);
    });
    //get all booked data from db
    app.get("/booked", async (req, res) => {
      const cursor = bookcol.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // spasific email in booked collection
    app.get("/booked/:cemail", verifytoken, async (req, res) => {
      const cemail = req.params.cemail;
      // console.log("token ouner info", req.user);
      // console.log(cemail);
      // console.log(req.user?.email);
      if (req.user?.cemail !== req.query.cemail) {
        return res.status(403).send({});
      }
      const result = await bookcol.find({ cemail }).toArray();
      res.send(result);
    });
    //to do servic
    app.get("/to-do-booked/:email", verifytoken, async (req, res) => {
      const email = req.params.email;

      if (req.user?.email == req.query.email) {
        return res.status(403).send({});
      }
      const result = await bookcol.find({ email }).toArray();
      res.send(result);
    });
    //update bookstatus
    app.patch("/updatstaus/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body;
      const query = { _id: new ObjectId(id) };
      const updatstst = {
        $set: status,
      };
      const result = await bookcol.updateOne(query, updatstst);
      res.send(result);
    });

    // post data
    app.post("/service", async (req, res) => {
      const newServics = req.body;
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
