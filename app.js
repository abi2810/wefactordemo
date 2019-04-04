const express = require('express');
const path = require('path');
const morgan = require('morgan');
var multer = require('multer');
// For password encryption
const bcrypt = require('bcrypt');
var bodyParser = require('body-parser')
var passwordHash = require('password-hash'); 
var jwt = require('jsonwebtoken');
// var bcrypt = require('bcryptjs');
var secret = 'supersecret';

var sequelize = require('sequelize');
// create our Express app
const app = express();
// serves up static files from the public folder. Anything in public/ will just be served up as the file it is
app.use(express.static(path.join(__dirname, 'public')));
//logger
app.use(morgan());
// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// load models
var Admin = require('./data/models/admin'); 
var Category = require('./data/models/categories'); 
console.log('Category')
console.log(Category)

app.get('/hello', (req,res)=>{
	res.send({msg:'Hello World  Checking'})
});

// Admin Signup
app.post('/adminsignup',async(req,res) => {
	const body = req.body
	let hashedPassword = bcrypt.hashSync(req.body.password,8)
	let admin = await Admin.create({name: req.body.name, email: req.body.email, password: hashedPassword})
	if(admin){
		let token = jwt.sign({id:admin.id}, secret, {expiresIn: 86400})
		res.status(200).send({auth: true, token: token});
	}else{
		res.status(500).send({auth: false, message: "There was a problem registering the user"});
	}
})

// Admin Login
app.post('/adminlogin', async(req,res) => {
	if (req.body.email && req.body.password) 
	{
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
	
})

/** 
* ### LogIn Middleware
* @param { String } token as header from web admin.
* @param { String } deviceid as header from mobile device.
* @returns  { json }If no header returns an error message.
*/
function loginMiddleware(req,res,next) {
	if (req.headers.token){
		jwt.verify(req.headers.token,secret,function(err,decoded){ 
		if (err) { return res.status(401).send({auth: false, message: 'Failed to authenticate token'})}
		})
	}
	else{
		if(!req.headers.deviceid){
		res.status(401).send({auth: false, message: 'Not suficent headers'})
		}
	}
	next()
}

var upload = multer({ dest: 'images/' })

// Upload general image
app.post('/uploadfile', upload.single('image'), function(req, res) {
	console.log('req')
	console.log(req.body)
	console.log(req.file.path)
	res.send(req.body)
})

// Create the category from admin
app.post('/newCategory',upload.single('image'),async(req,res) =>{
	console.log('in cat')
	if (req.headers.token) {
		// return req.headers.token
		let checkCat = await Category.findOne({where:{name:req.query.name}})
		console.log(checkCat)
		// if (checkCat !== null) {
			console.log('in not null func')
			// Image upload
			if (req.file) {
				console.log('in req file')
				let filename = req.file.path
				let newCat = await Category.create({name:req.query.name,desc:req.query.desc,image_url:filename})
				if (newCat) {
					let fetchCat = await Category.findOne({where:{name:newCat.name}})
					res.status(200).send({details:fetchCat})
				}
				else{
					res.status(500).send({message:'Something went wrong'})
				}
			}
			
		// }
		// else{
			// res.status(200).send({message:'Already Available'})
		// }
	}
	else{
		res.send('Provide token')
	}
})

module.exports = app;