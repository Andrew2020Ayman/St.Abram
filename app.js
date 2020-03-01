const express = require('express');
const cors=require('cors');
const mongoose=require('mongoose');
/* const db = require('./src/DB/db') */
require('dotenv').config();


const app = express();
const port = process.env.port || 3000;

app.use(cors());
app.use(express.json());

// DB Connection____________________________________________
const uri =  process.env.ATLAS_URI;
var options = {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    promiseLibrary: global.Promise
};
 mongoose.connect(uri, options);
  const connection =mongoose.connection;  
 
connection.once('connected', ()=>{
    console.log('MongoDB database connection established successfully');
})  

//__________________________________________________________________________

//Routers-------------------------------------------------------------------
const patient_router = require('./src/routers/patient.router');
const visit_router   = require('./src/routers/visit.router')
const servant_router = require('./src/routers/servant.router');

//patient Routers-------------------
app.use('/patients',patient_router);
app.use('/visits',visit_router);
app.use('/servants', servant_router);

//___________________________________________________________________________
// Listening to Port
app.listen(port,()=>{
    console.log(`server is running on port : ${port}`); 
})