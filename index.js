const express = require('express');
const cors = require('cors');
// const SSLCommerzPayment = require('sslcommerz-lts')
const port = process.env.PORT || 5000;
require('dotenv').config();

const app = express();

//middleware
app.use(cors());
app.use(express.json());

//employeeManagement
//GTL0gi4FLV4ZehMR


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://employeeManagement:GTL0gi4FLV4ZehMR@cluster0.efsdsdy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
    client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");


    const employeeCollections = client.db("EmployeeManagement").collection("employee");

    app.get('/employee', async (req, res) => {
        await client.connect();
        const query = {};
        const result = await employeeCollections.find(query).toArray()
        res.send(result);
    });

    app.post('/employee', async (req, res) => {
        await client.connect()
       const employee = req.body;
       const result = await employeeCollections.insertOne(employee);
       res.send(result); 
    })

    app.put('/employee', async(req, res) => {
        await client.connect()
        const id = req.query.id;
        console.log(id)
        const employee = req.body;
        const query = {_id: new ObjectId(id)}
        const options = { upsert: true };
      const updatedDoc = {
        $set: {
          name: employee.name,
          email: employee.email,
          phone: employee.phone,
          image: employee.image
        }
      }
      const result = await employeeCollections.updateOne(query, updatedDoc, options);
      res.send(result);
    })

    app.delete('/employee/:id', async(req, res) => {
        await client.connect()
        const id = req.params.id;
        const result = await employeeCollections.deleteOne({_id: new ObjectId(id)});
        res.send(result);
    });

    app.get('/search-employee', async(req, res) => {
        await client.connect();
        const search = req.query;
        // Destructure query parameters
        const { name, phone, email, bDate } = req.query;

        // Construct the search criteria dynamically
        const searchCriteria = {};
        if (name) searchCriteria.name = { $regex: name, $options: 'i' };  // Partial match with case-insensitive option
        if (phone) searchCriteria.phone = phone;  // Exact match for phone
        if (email) searchCriteria.email = { $regex: email, $options: 'i' };  // Partial match with case-insensitive option
        if (bDate) searchCriteria.bDate = bDate;  // Exact match for birth date

        // Log the search criteria for debugging
        console.log('Search Criteria:', searchCriteria);

        // Fetch the matching employees
        const employees = await employeeCollections.find(searchCriteria).toArray();

        // Return the found employees or empty array if none match
        console.log(employees)
        res.send(employees);
    })

  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })