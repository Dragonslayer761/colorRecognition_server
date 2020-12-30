var express = require('express');
const app = require('../app');
const bcrypt = require('bcrypt');
const knex = require('knex');
const saltRounds = 10;


const db=knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : '1234',
    database : 'databaseColorRecognition'
  }
});

db.select('email').from('users').then(data => {
  console.log(data);
});
var router = express.Router();


//send user data
router.get('/',(req,res)=>{
    res.send(database.user);
});



//check email and password and sign in user 
router.post('/signin',(req,res)=>{
  const {email, password} = req.body;
    let result=database.users.filter((i)=>{
      return (i.email === email && i.password === password)
    });
     if(result.length === 1){
       res.json(result[0])
     }else{
       res.status(404).json("failed")
     }
});


//register new user 
router.post('/register', (req, res) => {
  const { email, name, password } = req.body;
  console.log(password);
  const salt = bcrypt.genSaltSync(saltRounds);
  let hash = bcrypt.hashSync(password, salt);

  bcrypt.genSalt(saltRounds, (err, salt) => {
    if (err) {
      throw err;
    }
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) {
        throw err;
      }
      db.transaction(trx => {
        trx.insert({
          email: email,
          name:name,
          joined : new Date()
        }).into('users').returning('email')
          .then(email => {
            trx('login').insert({
              email: email,
              hash: hash
            }).then(user => {
              res.json(user);
            }).catch(err => {
              console.log(err);
              res.status(404).json("unable to register user");
            })
          }).then(trx.commit)
          .catch(trx.rollback)
      })
    });
  });

});



//get user profile  
router.get('/user/:id',async (req,res)=>{
  const {id} =req.params;
  await db.select('*').from('users').where({id:id}).then(response =>{
    if(response.length){
      res.json(response[0])
    }else{
      res.status(404).json("user not found");
    }
  }).catch(err => res.status(404).json("error finding in user"));
});


//update the  entires field for each image search 
router.post('/image',async(req,res)=>{
  const {id} =req.body;
  await db('users').where('id','=',id).increment('entries',1).returning('entries').then(response =>{
    res.json(response[0]);
  }).catch(err =>{
    console.log(err);
  });
});

//export
module.exports = router;

 