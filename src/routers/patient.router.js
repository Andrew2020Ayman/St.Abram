const router=require('express').Router();
let Patient =require('../models/patient')
let auth = require('../middleware/auth')

// Patient Router ----------------------------------------------------------------------
// GET All Patients___________________________________
router.get('/',(req,res)=>{
    Patient.find()
     .then(patents=>res.json(patents))
     .catch(err => res.status(400).json('Error : '+err));
});

// Get patient By id ____________________________________
router.get('/:id',auth,(req,res)=>{
    Patient.findById(req.params.id)
     .then(patient=>res.json(patient))
     .catch(err => res.status(400).json('Error : '+err));
});

// Delete patient By id -----------------------------------------
router.delete('/:id',auth,(req,res)=>{

    Patient.findOneAndDelete(req.params.id)
     .then(()=>res.json('patient deleted'))
     .catch(err => res.status(400).json('Error : '+err));
});

// Add New Patient_________________________
router.post('/add',auth,(req,res)=>{

    const patientname=req.body.username;
    const gender=req.body.gender;
    const healthStatus=req.body.healthStatus;
    const place=  req.body.place;
    const notes=  req.body.notes;
    
    const NewPatient=new Patient({
       patientname,
       gender,
       healthStatus,
       place,
       notes
    });
    NewPatient.save()
    
    .then(()=>res.json('patient Added! '))
    .catch(err=> res.status(400).send('Error :'+err));
});

// Update Exercise--------------------------------------

router.patch('/update/:id',auth,(req,res)=>{
   
    Patient.findById(req.params.id)
    .then(patient =>{
        
        patient.username=req.body.username;
        patient.description=req.body.description;
        patient.duration=Number( req.body.duration) ;
        patient.date=new Date( req.body.date) ;
        

        patient.save()
    .then(()=>res.json('patient Updated'))
    .catch(err=>res.status(400).json('Error: '+err))
    })

    .catch(err=>res.status(400).json('Error : '+err));
});
//---------------------------------------------------------------------------------------------   

module.exports=router;