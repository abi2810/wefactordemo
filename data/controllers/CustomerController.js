//  For password encryption
const bcrypt = require('bcrypt');
var passwordHash = require('password-hash');
var jwt = require('jsonwebtoken');
var secret = 'supersecret';
// mage upload
var multer = require('multer');

const Customer = require('./../models/customers');

// // Image upload destination
// var upload = multer({ dest: './images/' })
// function imgUpload(upload.single('image_url'),req,res,next){
//   next;
// }
// var upimg = upload.single('image_url')
// console.log('upimg')
// console.log(upimg)

//  Customer Signup
const customerSignup = async function(req,res){
  if (req.body.name && req.body.email && req.body.password && req.body.phoneno) {
    let hashedPassword = bcrypt.hashSync(req.body.password,8)
    let customer = await Customer.create({name: req.body.name, email: req.body.email, password: hashedPassword,phoneno: req.body.phoneno})
    if(customer){
      let token = jwt.sign({id:customer.id}, secret, {expiresIn: 86400})
      res.status(200).send({auth: true, token: token});
    }else{
      res.status(500).send({auth: false, message: "There was a problem registering the user"});
    }
  }
  else{
    res.status(404).send({message:"Please provide all the feilds to continue!"})
  }
}

// Customer LogIn
const customerLogin = async function(req,res){
  console.log("Login request received")
  	if (req.body.email && req.body.password)
  	{
  		const checkcustomer = await Customer.findOne({where: {email: req.body.email}})
  		if (!checkcustomer) { res.status(404).send({auth: false, message: "No user found"})}
  		var passwordIsValid = bcrypt.compareSync(req.body.password, checkcustomer.password)
  		if (!passwordIsValid) { res.status(401).send({auth: false, message:"Check your password",token: null})}
  		var token = jwt.sign({id: checkcustomer.id}, secret, { expiresIn: 86400 })
  		res.status(200).send({auth: true, message:"Login success", token: token})
  	}
  	else{
  		res.status(400).send({message:"Please provide the required parameters to login."})
  	}
}

// View Profile
const profile = async function(req,res){
  let customerId
  if (req.headers.token) {
    await jwt.verify(req.headers.token,secret,function(err,decoded){
      console.log(decoded)
      customerId = decoded.id
    })
    let getProfile = await Customer.findOne({where:{id:customerId},attributes:['id','name','email','phoneno','image_url']})
    res.status(200).send({details:getProfile})
  }else{
    res.status(401).send({message:"Please provide token to see profile details"})
  }
}

// Update Profile
// const uploadProfile = function(upload.single('image_url'))
// const editProfile = async function(req,res,next){
//   upload(req,res,function(err){
//     console.log(req)
//   )}
//   // let upimg = imgUpload(req.file)
//   console.log(upimg)
//   let updateInfo;
//   let filename;
//   if (req.query.customerId) {
//     if (req.file) {
//       filename = req.file.path
//       updateInfo = await Customer.update({image_url:filename},{where:{id: req.query.customerId}})
//     }
//     else if (req.query.name && req.file) {
//       filename = req.file.path
//       updateInfo = await Customer.update({name:req.query.name,image_url:filename},{where:{id:req.query.customerId}})
//     }
//     else{
//       updateInfo = await Customer.update({name:req.query.name},{where:{id: req.query.customerId}})
//     }
//     let fetchDet = await Customer.findOne({where:{id:req.query.customerId}})
//     res.status(200).send({details:fetchDet})
//   }
//   else{
//       res.status(400).send({message:"Please provide the customerId to update the info"})
//   }
// }

module.exports = {
  customerSignup,
  customerLogin,
  profile
  // editProfile

}
