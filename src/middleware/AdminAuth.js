const Servant = require('../models/servant');
const jwt = require('jsonwebtoken');
 let AdminAuth = (req,res,next) => {
    let token =req.header('x-access-token');

    jwt.verify(token,Servant.getJWTSecret(),(err,decoded)=>{
        if(err){
            res.status(401).send(err);
        }else{
            Servant.findById(decoded._id)
              .then( servant=> {
                if(servant.IsAdmin){
                    console.log('Dear{ '+ servant.name + '} you are Admin');
                    
                    req.servant_id  = decoded._id;
                    next();
                 }else{
                   res.status(400).send('Dear{ '+ servant.name + ' } You are not Admin , You can not Add Servants ')
                }
              })
          
            

        }
    });
}

module.exports=AdminAuth;