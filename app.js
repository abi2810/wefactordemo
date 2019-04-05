const express = require('express');
const path = require('path');
const morgan = require('morgan');
var multer = require('multer');
var ejs = require('ejs')
// For password encryption
const bcrypt = require('bcrypt');
var bodyParser = require('body-parser')
var passwordHash = require('password-hash'); 
var jwt = require('jsonwebtoken');
// var bcrypt = require('bcryptjs');
var secret = 'supersecret';

var sequelize = require('sequelize');
// Image upload destination
var upload = multer({ dest: 'images/' })

// create our Express app
const app = express();
app.set('view engine', 'ejs')
app.use(express.static('/images'))
// app.use(bodyParser);
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
var Service = require('./data/models/services'); 
var ServiceType = require('./data/models/service_type'); 

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


// Upload general image
app.post('/uploadfile', upload.single('image_url'), function(req,res) {
	if (req.file) {
		console.log('In Func')
	}
	console.log('req')
	console.log(req.file)
	res.send(req.file)
})

// CATEGORY
// Create the category from admin
app.post('/newCategory',upload.single('image_url'),async(req,res) =>{
	console.log('in cat')
	if (req.headers.token) {
		// return req.headers.token
		let checkCat = await Category.findOne({where:{name:req.query.name}})
		console.log(checkCat)
		if (checkCat === null) {
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
			
		}
		else{
			res.status(200).send({message:'Already Available'})
		}
	}
	else{
		res.send('Provide token')
	}
})

// All Category List
app.get('/allCategory',async(req,res) => {
	// if (req.headers.token) {
		let getAllCat = await Category.findAll({attributes:['id','name','image_url']})
		res.send({details:getAllCat})
	// }
	// else{
		// res.send('Provide token')
	// }
})

// Create Services link to category from admin
app.post('/newService',async(req,res) => {
	if (req.headers.token) {
		if (req.query.categoryId) {
			let checkService = await Service.findOne({where:{name:req.query.name}})
			if (checkService === null) {
				let newServ = await Service.create({categories_id:req.query.categoryId,name:req.query.name,desc:req.query.desc,image_url:req.query.image_url})
				if (newServ) {
					let fetchServ = await Service.findOne({where:{name:newServ.name}})
					res.status(200).send({details:fetchServ})
				}else{
					res.status(500).send({message:"Something went wrong"})
				}
			}

		}
		else{
			res.send({message:"Please select an category to add service"})
		}

	}
	else{
		res.send('Provide token')
	}
})

// Single Category List with details and its services
app.get('/oneCategoryService',async(req,res) => {
	// if (req.headers.token) {
		if (req.query.categoryId) {
			let getCat = await Category.findOne({where:{id: req.query.categoryId},attributes:['id','name','image_url','desc']})
			if (getCat) {
				let getAllServ = await Service.findAll({where:{categories_id: req.query.categoryId},attributes:['id','name','image_url']})
				// let result = getCat.push(getAllServ)
				// console.log(result)
				// res.send(result)
				let hashCat = {}
				hashCat['category'] = getCat
				hashCat['service'] = getAllServ
				res.send(hashCat)
			}
		}else{
			res.send({message:"Please provide category Id"})
		}
	// }else{
		// res.send('Provide token')
	// }
})

// Create Service Type link to services from admin
app.post('/newServiceType',async(req,res) => {
	if (req.headers.token) {
		if (req.query.serviceId) {
			let newServType = await ServiceType.create({service_id:req.query.serviceId,name:req.query.name,price:req.query.price})
			if (newServType) {
				let fetchServType = await ServiceType.findOne({where:{name:newServType.name}})
				res.status(200).send({details:fetchServType})
			}
			else{
				res.status(500).send({message:"Something went wrong"})
			}
		}

	}
	else{
		res.send('Provide token')
	}
})

// Single  Service List
app.get('/oneService',async(req,res) => {
	if (req.query.serviceId) {
		let getServ = await Service.findOne({where:{id:req.query.serviceId}})
		if (getServ) {
			let getServType = await ServiceType.findAll({where:{service_id:req.query.serviceId}})
			let hashServ = {}
			hashServ['service'] = getServ
			hashServ['service_type'] = getServType
			res.send(hashServ)
		}
	}else{
		res.send({message:"Please provide service id"})
	}
})

module.exports = app;