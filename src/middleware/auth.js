const Servant = require('../models/servant');
const jwt = require('jsonwebtoken');

 let authenticate = (req,res,next) => {
    let token =req.header('x-access-token');

    jwt.verify(token,Servant.getJWTSecret(),(err,decoded)=>{
        if(err){
            res.status(401).send(err);
        }else{
            console.log(decoded);
            
            req.servant_id  = decoded._id;
            
            next();
        }
    });
}

module.exports=authenticate;