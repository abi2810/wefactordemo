//  For password encryption
const bcrypt = require('bcrypt');
var passwordHash = require('password-hash');
var jwt = require('jsonwebtoken');
var secret = 'supersecret';


const Admin = require('./../models/admin');

// Admin Signup
const adminSignup = async function(req,res){
  const body = req.body
  let hashedPassword = bcrypt.hashSync(req.body.password,8)
  let admin = await Admin.create({name: req.body.name, email: req.body.email, password: hashedPassword})
  if(admin){
    let token = jwt.sign({id:admin.id}, secret, {expiresIn: 86400})
    res.status(200).send({auth: true, token: token});
  }else{
    res.status(500).send({auth: false, message: "There was a problem registering the user"});
  }
}

// Admin Login
const adminLogin = async function(req,res){
  console.log('in AL')
  console.log(req)
  if (req.body.email && req.body.password)
  {
    console.log(req.body.email)
    const checkadmin = await Admin.findOne({where: {email: req.body.email}})
  	if (!checkadmin) { res.status(404).send({auth: false, message: "No user found"})}
  	var passwordIsValid = bcrypt.compareSync(req.body.password, checkadmin.password)
  	if (!passwordIsValid) { res.status(401).send({auth: false, message:"Check your password",token: null})}
  	var token = jwt.sign({id: checkadmin.id}, secret, { expiresIn: 86400 })
  	res.status(200).send({auth: true, message:"Login success", token: token})
  }
  else{
  	res.status(400).send({message:"Please provide the required parameters to login."})
  }
}


module.exports = {
  adminSignup,
  adminLogin
}
