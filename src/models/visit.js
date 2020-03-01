const mongoose=require('mongoose');
const Patient = require('../models/patient')
const Servant = require('../models/servant')

const visit_schema=new mongoose.Schema({
    patients:{
      type : { Patient} ,
      required:true,
      trim:true
    },
    servants :{ 
     type : { Servant },
     required:true,
     trim:true
    },
    place :{ 
        type : String,
        require: true,
        trim:true,
      },
      date :{ 
        type : Date,
        require: true,
        trim:true,
      },
      status:{
        type : String,
        required:true,

      }
})

const Visit=mongoose.model('visit',visit_schema);

module.exports=Visit;