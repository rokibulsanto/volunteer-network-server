const express = require('express')
require('dotenv').config()
const bodyParser = require('body-parser');
const cors = require('cors');
const { ObjectID, ObjectId } = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const admin = require('firebase-admin');
const objectID = require('mongodb').ObjectID;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rccbp.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;



const app = express()
app.use(bodyParser.json());
app.use(cors());




var serviceAccount = require("./configs/volunteer-network-client-site-firebase-adminsdk-h2cfy-f860cf0e1a.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DB_FIRE
});




const port = 5000



const client = new MongoClient(uri, { useNewUrlParser: true,  useUnifiedTopology: true });
client.connect(err => {
  const ProductsCollection = client.db("volunteerNetwork").collection("events");
 
  app.post('/addEvent', (req, res) => {
    const newEvevnt = req.body;
    ProductsCollection.insertOne(newEvevnt)
    .then(result => {
      res.send(result.insertedCount > 0);
    })
    

  })

  app.get('/event', (req, res) => {
    const bearer = req.headers.authorization;
     if(bearer && bearer.startsWith('Bearer ')){
       const idToken = bearer.split(' ')[1];
       admin.auth().verifyIdToken(idToken)
     .then(function(decodedToken) {
       let tokenEmail = decodedToken.email;
       if(tokenEmail == req.query.email){
        ProductsCollection.find({email: req.query.email})
        .toArray((err, documents) => {
          res.status(200).send(documents);
        })
       }
       else{
          res.status(401).send('Unauthorized access');
       }
      
     })
     .catch(function(error) {
      res.status(401).send('Unauthorized access');
     });
     }

     else{
       res.status(401).send('Unauthorized access');
     }
    
    
  })

  app.delete('/delete/:id', (req, res) => {
    ProductsCollection.deleteOne({_id: ObjectId(req.params.id)})
    .then( result => {
      res.send(result.deletedCount > 0)
     
    })
  })

});


app.listen(port);