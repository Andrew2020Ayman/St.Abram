const router=require('express').Router();
let Servant =require('../models/servant');
let auth = require('../middleware/auth')
let AdminAuth = require('../middleware/AdminAuth')
let nodemailer = require('../middleware/nodemailer')
const lodash = require('lodash');


//  -------------------------------- Middle ware --------------------------------------
let verifySession = (req, res, next) => {
    // grab the refresh token from the request header
    let refreshToken = req.header('x-refresh-token');
    // grab the _id from the request header
    let _id = req.header('_id');
    Servant.findByIdAndToken(_id, refreshToken).then((servant) => {
        if (!servant) {
            // servant couldn't be found
            return Promise.reject({
                'error': 'User not found. Make sure that the refresh token and user id are correct'
            });
        }
        /* if the code reaches here - the user was found
         therefore the refresh token exists in the database 
         but we still have to check if it has expired or not */
         
         
         req.servant_id = servant._id;
        req.servantObject = servant;
        req.refreshToken = refreshToken;

        let isSessionValid = false;
        servant.sessions.forEach((session) => {
            if (session.token === refreshToken) {
                // check if the session has expired
                if (Servant.hasRefreshTokenExpired(session.expiresAt) === false) {
                    // refresh token has not expired
                    isSessionValid = true;
                }
            }
        });
        if (isSessionValid) {
            // the session is VALID - call next() to continue with processing this web request
            next();
        } else {
            // the session is not valid
            return Promise.reject({
                'error': 'Refresh token has expired or the session is invalid'
            })
        }

    }).catch((e) => {
        res.status(401).send(e);
    })
}

//  -------------------------------- Servant Router --------------------------------------

// ** Post New Servant => Add New servant { Admin role }
router.post('/add',AdminAuth,(req,res)=>{

    let body = req.body;
    let phoneNum = body.phoneNumber;
    
    if(phoneNum.length !== 11 && phoneNum[0] !== 1)
    {  return res.status(400).send('phone number should be 11 number must begin with 01');  }
    else{
        body.phoneNumber = phoneNum;
    }
    /* This generate Random Password for new Servant 
      => Should Send This Generated Password to servant's email => to use it  */
      let passWord = '';
      while(passWord.length !== 8){  passWord = Math.random().toString(36).substring(5); }
    body["password"] = passWord;
    
    // Sent password to new Servant on his mail****
     const servantMail = req.body.email;
     nodemailer({
        from: 'andrew13ayman@gmail.com',
        to: servantMail,
        subject: 'Sending your password',
        text: 'your password in StAbram App is : { ' + passWord + '  }' 
     }); 
    /****************************************************/
    let AdminRole = body.IsAdmin;
    let newServant =new Servant(body);
    newServant.save()
    
    .then(()=>{
        return newServant.createSession();
    }).then((refreshToken) =>{
         /* Session created successfully - refreshToken returned.
             => now we geneate an access auth token for the servant  */
        return newServant.generateAccessAuthToken().then((accessToken)=>{
         /* access auth token generated successfully
            => now we return an object containing the auth tokens  */
          return {accessToken, refreshToken}
        });
    }).then((authTokens)=>{
          /* Now we construct and send the response to the servant
              with their auth tokens in the header and the servant object in the body */
         res
         .header('x-refresh-token', authTokens.refreshToken)
         .header('x-access-token', authTokens.accessToken)
         .send(newServant);
    }).catch((e) => {
        res.status(400).send(e);
    })
    console.log(body);
})

// ** Post Servant => Login servant { servant role }
router.post('/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    Servant.findByCredentials(email, password).then((servant) => {
        return servant.createSession().then((refreshToken) => {
            /* Session created successfully - refreshToken returned.
              now we geneate an access auth token for the servant  */

            return servant.generateAccessAuthToken().then((accessToken) => {
                /* access auth token generated successfully
                 now we return an object containing the auth tokens  */
                return { accessToken, refreshToken }
            });
        }).then((authTokens) => {
            /* Now we construct and send the response to the servant
              with their auth tokens in the header and the servant object in the body */
            res
                .header('x-refresh-token', authTokens.refreshToken)
                .header('x-access-token', authTokens.accessToken)
                .send(servant);
        })
    }).catch((e) => {
        res.status(400).send(e);
    });
})


router.get('/',auth,(req,res)=>{
    Servant.find()
     .then( (servants)=>{
         res.json(servants);
        })
     .catch(err => res.status(400).json('Error : '+err));
});

/*   Access-token  */
router.get('/me/access-token',verifySession,(req,res)=>{
    req.servantObject.generateAccessAuthToken().then((accessToken)=>{
        res.header('x-access-token',accessToken).send({accessToken});
    }).catch((e)=>{
          res.status(400).send(e);
    });
})

// ---------------------------------------------------------------------------------------
module.exports=router;