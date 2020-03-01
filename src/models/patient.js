const mongoose=require('mongoose');


const patient_schema=new mongoose.Schema({
    
    name :{ 
      type : String,
      require: true,
      trim:true,
    },
    gender :{ 
        type : String,
        require: true,
        trim:true,
      },
      healthStatus :{ 
        type : String,
        require: true,
        trim:true,
      },
      notes :{ 
        type : String,
        trim:true,
      },
      place :{ 
        type : String,
        require: true,
        trim:true,
      },

})

const Patient=mongoose.model('patient',patient_schema);

module.exports=Patient;