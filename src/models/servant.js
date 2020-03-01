const mongoose=require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const PhoneNumber = require('awesome-phonenumber') ;
let Visit = require('../models/visit');

// *** JWT Secret ***
const jwtSecret = '51957537379623445325pqwugdlasdpoczxkkjjnlsqqpaopk6436004929' ;

const servant_schema=new mongoose.Schema({
    email:{
        type:String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true
    },
    password :{ 
        type: String,
        required: true,
        minlength: 8,
        trim: true,
        unique: true
    },
    name :{ 
        type : String,
        require: true,
        minlength: 1,
        trim: true,
        unique: true
      },
      phoneNumber:{
       type : Number,
       minlength : 10,
       maxlength : 10,
       trim : true,
      },
      IsFather:{
          type : Boolean,
          required:true,
      },
      IsAdmin : {
         type : Boolean,
         required : true
      },

      sessions: [{
        token: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Number,
            required: true
        }
    }]
})

//                ********************* Instance Methods *********************

// ** return the document expect the password & sessions(This Shouldn't be made available)  **
servant_schema.methods.TOJSON = function(){
    const servant = this;
    const servantObject = servant.toObject();

    return _.omit(servantObject , ['password','sessions']); 
}

// *** generate Access Token ***
servant_schema.methods.generateAccessAuthToken = function(){
    const servant = this;
    return new Promise((resolve,reject)=>{
        // Create the JSON Web Token and return that
        jwt.sign(
            { _id : servant._id.toHexString() } ,
             jwtSecret ,
            {expiresIn : "15m"},
            (err,token) => {
                if(!err){
                     resolve(token);
                }else{
                    reject();
                }
            })
    })
}

 // This method simply generates a 64byte hex string - it doesn't save it to the database. saveSessionToDatabase() does that.
 servant_schema.methods.generateRefreshAuthToken = function () {
   
    return new Promise((resolve, reject) => {
        crypto.randomBytes(64, (err, buf) => {
            if (!err) {
                // no error
                let token = buf.toString('hex');

                return resolve(token);
            }
        })
    })
}
// *** Create Session ***
servant_schema.methods.createSession = function () {
    let servant = this;

    return servant.generateRefreshAuthToken().then(refreshToken =>{
        return saveSessionToDatabase(servant , refreshToken);
    }).then((refreshToken) =>{
        //saved to database successfully
        return refreshToken
    }).catch((e)=>{
        return Promise.reject('failed to save session to database .\n' + e);
    })
}
//______________________________________________________________________


//        ********************* MODEL METHODS (static methods) *********************

// *** Get Jwt Secret ***
servant_schema.statics.getJWTSecret = () => {
    return jwtSecret;
}

// *** finds user by id and token  =>> used in auth middleware (verifySession) ** 
servant_schema.statics.findByIdAndToken = function (_id, token) {
    const servant = this ; 
    return servant.findOne({
        _id,
        'sessions.token' : token
    });
}

// *** findByCredentials { email & password } ***
servant_schema.statics.findByCredentials = function (email, password) {
    let Servant = this;
     return Servant.findOne({email}).then((serv)=>{
         if(!serv) return Promise.reject();

         return new Promise ((resolve , reject) =>{
             bcrypt.compare(password , serv.password , (err,res) =>{
                 if(res) resolve(serv);
                 else reject();
             })
         })
     })
}

// *** check tha refresh Token is expired or not ** 
servant_schema.statics.hasRefreshTokenExpired = (expiresAt) => {
    let secondsSinceEpoch = Date.now() / 1000;
    if (expiresAt > secondsSinceEpoch) {
        // hasn't expired
        return false;
    } else {
        // has expired
        return true;
    }
}

//__________________________________________________________________________________

//               ********************* MIDDLEWARE *********************
servant_schema.pre('save', function (next) {
    let servant = this;
    let costFactor = 10; // # of hashing rounds

    if (servant.isModified('password')) {
        // if the password field has been edited/changed then run this code.

        // Generate salt and hash password
        bcrypt.genSalt(costFactor, (err, salt) => {
            bcrypt.hash(servant.password, salt, (err, hash) => {
                servant.password = hash;
                next();
            })
        })
    } else {
        next();
    }
});
//__________________________________________________________________________________

//               ********************* HELPER METHODS *********************

//********* Save Session To DataBase ******************
let saveSessionToDatabase = (servant , refreshToken) =>{

    return new Promise((resolve, reject) => {
        let expiresAt = generateRefreshTokenExpiryTime();
        servant.sessions.push({ 'token': refreshToken, expiresAt });
        servant.save().then(() => {
            // saved session successfully
            return resolve(refreshToken);
        }).catch((e) => {
            reject(e);
        });
    })
}

//*********  Generate RefreshToken ExpiryTime ******************
let generateRefreshTokenExpiryTime = () => {
    let daysUntilExpire = "10";
    let secondsUntilExpire = ((daysUntilExpire * 24) * 60) * 60;
    return ((Date.now() / 1000) + secondsUntilExpire);
}
//______________________________________________________________________
const Servant=mongoose.model('servant',servant_schema);
module.exports=Servant;