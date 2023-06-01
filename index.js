const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

// middleWare;
app.use(cors());
app.use(express.json());

//mongodb connection
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster-1.vbj8kjp.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const database = client.db("resutrant").collection("food");
    const review = client.db("resutrant").collection("review");
    const cart = client.db("resutrant").collection("cart");
    const users = client.db("resutrant").collection("users");

    // uses api

    app.get("/users", async (req, res) => {
      const result = await users.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const userDetails = req.body;
      const userMail = req.body.email;
      const query = { email: userMail };
      const remainingUser = await users.findOne(query);

      if (remainingUser) {
        return res.send({ message: "user already have in the database" });
      }

      const result = await users.insertOne(userDetails);
      res.send(result);
    });

    // all food api
    app.get("/menu", async (req, res) => {
      const result = await database.find().toArray();
      res.send(result);
    });

    // all review api
    app.get("/review", async (req, res) => {
      const result = await review.find().toArray();
      res.send(result);
    });

    // add to cart
    app.post("/foodcart", async (req, res) => {
      const cartData = req.body;
      const result = await cart.insertOne(cartData);
      res.send(result);
    });

    // make user admin
    app.patch("/users/admin/:id", async (req, res) => {
      const editId = req.params.id;
      const filter = { _id: new ObjectId(editId) };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await users.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete("/users/admin/:id", async (req, res) => {
      const deletedId = req.params.id;
      const query = { _id: new ObjectId(deletedId) };
      const result = await users.deleteOne(query);
      res.send(result);
    });

    // delete a product
    app.delete("/foodcart/:id", async (req, res) => {
      const delId = req.params.id;
      const query = { _id: new ObjectId(delId) };
      const result = await cart.deleteOne(query);
      res.send(result);
    });

    app.get("/foodcart", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await cart.find(query).toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
