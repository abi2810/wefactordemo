//  For password encryption
const bcrypt = require('bcrypt');
var passwordHash = require('password-hash');
var jwt = require('jsonwebtoken');
var secret = 'supersecret';
// mage upload
var multer = require('multer');

const Customer = require('./../models/customers');

// // Image upload destination
var upload = multer({ dest: './images/' })
var upimg = upload.single('image_url')

//  Customer Signup
const customerSignup = async function(req,res,upimg){
  console.log(req)
  // const body = req.body
	if (req.file) {
		let filename = req.file.path
		let hashedPassword = bcrypt.hashSync(req.query.password,8)
		let customer = await Customer.create({name: req.query.name, email: req.query.email, password: hashedPassword,phoneno: req.query.phoneno,image_url: filename})
		if(customer){
			let token = jwt.sign({id:customer.id}, secret, {expiresIn: 86400})
			res.status(200).send({auth: true, token: token});
		}else{
			res.status(500).send({auth: false, message: "There was a problem registering the user"});
		}
	}
	else{
		let hashedPassword = bcrypt.hashSync(req.body.password,8)
		let customer = await Customer.create({name: req.body.name, email: req.body.email, password: hashedPassword,phoneno: req.body.phoneno})
		if(customer){
			let token = jwt.sign({id:customer.id}, secret, {expiresIn: 86400})
			res.status(200).send({auth: true, token: token});
		}else{
			res.status(500).send({auth: false, message: "There was a problem registering the user"});
		}
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

module.exports = {
  customerSignup
}
