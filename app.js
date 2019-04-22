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

//routes
const v1 = require('./routes/v1');
app.use('/v1', v1);


// load models
var Admin = require('./data/models/admin');
var Category = require('./data/models/categories');
var Customer = require('./data/models/customers');
var Service = require('./data/models/services');
var ServiceType = require('./data/models/service_type');
var Profession = require('./data/models/professions');
var Order = require('./data/models/orders');
var ProfessionOrder = require('./data/models/profession_order');
var ProfessionService = require('./data/models/profession_service');

app.get('/hello', (req,res)=>{
	res.send({msg:'Hello World  Checking'})
});

// // Admin Signup
// app.post('/adminsignup',async(req,res) => {
// 	const body = req.body
// 	let hashedPassword = bcrypt.hashSync(req.body.password,8)
// 	let admin = await Admin.create({name: req.body.name, email: req.body.email, password: hashedPassword})
// 	if(admin){
// 		let token = jwt.sign({id:admin.id}, secret, {expiresIn: 86400})
// 		res.status(200).send({auth: true, token: token});
// 	}else{
// 		res.status(500).send({auth: false, message: "There was a problem registering the user"});
// 	}
// })
//
// Admin Login
// app.post('/adminlogin', async(req,res) => {
//   console.log(req)
// 	if (req.body.email && req.body.password)
// 	{
// 		const checkadmin = await Admin.findOne({where: {email: req.body.email}})
// 		if (!checkadmin) { res.status(404).send({auth: false, message: "No user found"})}
// 		var passwordIsValid = bcrypt.compareSync(req.body.password, checkadmin.password)
// 		if (!passwordIsValid) { res.status(401).send({auth: false, message:"Check your password",token: null})}
// 		var token = jwt.sign({id: checkadmin.id}, secret, { expiresIn: 86400 })
// 		res.status(200).send({auth: true, message:"Login success", token: token})
// 	}
// 	else{
// 		res.status(400).send({message:"Please provide the required parameters to login."})
// 	}
//
// })

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


// //  Customer Signup
// app.post('/customersignup',upload.single('image_url'),async(req,res) => {
// 	const body = req.body
// 	if (req.file) {
// 		let filename = req.file.path
// 		let hashedPassword = bcrypt.hashSync(req.body.password,8)
// 		let customer = await Customer.create({name: req.body.name, email: req.body.email, password: hashedPassword,phoneno: req.body.phoneno,image_url: filename})
// 		if(customer){
// 			let token = jwt.sign({id:customer.id}, secret, {expiresIn: 86400})
// 			res.status(200).send({auth: true, token: token});
// 		}else{
// 			res.status(500).send({auth: false, message: "There was a problem registering the user"});
// 		}
// 	}
// 	else{
// 		let hashedPassword = bcrypt.hashSync(req.body.password,8)
// 		let customer = await Customer.create({name: req.body.name, email: req.body.email, password: hashedPassword,phoneno: req.body.phoneno})
// 		if(customer){
// 			let token = jwt.sign({id:customer.id}, secret, {expiresIn: 86400})
// 			res.status(200).send({auth: true, token: token});
// 		}else{
// 			res.status(500).send({auth: false, message: "There was a problem registering the user"});
// 		}
// 	}
//
// })
//
// // Customer Login
// app.post('/customerlogin', async(req,res) => {
// 	console.log("Login request received")
// 	if (req.body.email && req.body.password)
// 	{
// 		const checkcustomer = await Customer.findOne({where: {email: req.body.email}})
// 		if (!checkcustomer) { res.status(404).send({auth: false, message: "No user found"})}
// 		var passwordIsValid = bcrypt.compareSync(req.body.password, checkcustomer.password)
// 		if (!passwordIsValid) { res.status(401).send({auth: false, message:"Check your password",token: null})}
// 		var token = jwt.sign({id: checkcustomer.id}, secret, { expiresIn: 86400 })
// 		res.status(200).send({auth: true, message:"Login success", token: token})
// 	}
// 	else{
// 		res.status(400).send({message:"Please provide the required parameters to login."})
// 	}
//
// })

//  Professions Signup
app.post('/professionsignup',async(req,res) => {
	let profe = await Profession.create({name: req.body.name,phoneno: req.body.phoneno,city:"Chennai",category_id: req.body.category_id})
		if(profe){
			res.status(200).send({auth: true, message:"Thank you for signing up!"});
		}else{
			res.status(500).send({auth: false, message: "There was a problem registering the user"});
		}

})


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
	if (req.headers.token) {
		let getAllCat = await Category.findAll({attributes:['id','name','image_url']})
		res.send({details:getAllCat})
		//res.json(getAllCat)
	}
	else{
		let getAllCat = await Category.findAll({attributes:['id','name','image_url']})
		res.send({details:getAllCat})
		//res.json(getAllCat)
		// res.send('Provide token')
	}
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
app.get('/oneCategoryService/:categoryId',async(req,res) => {
	console.log("I'm in one category service",req.params.categoryId)
	if (req.headers.token) {
		if (req.params.categoryId) {
			let getCat = await Category.findOne({where:{id: req.params.categoryId},attributes:['id','name','image_url','desc']})
			if (getCat) {
				let getAllServ = await Service.findAll({where:{categories_id: req.params.categoryId},attributes:['id','name','image_url']})
				// Professional details
				let profDet = await Profession.findAll({where:{category_id: req.params.categoryId}})
				let hashCat = {}
				hashCat['category'] = getCat
				hashCat['service'] = getAllServ
				hashCat['professionals'] = profDet
				res.send(hashCat)
			}
		}else{
			res.send({message:"Please provide category Id"})
		}
	}else{
		if (req.params.categoryId) {
			let getCat = await Category.findOne({where:{id: req.params.categoryId},attributes:['id','name','image_url','desc']})
			if (getCat) {
				// Service Details
				let getAllServ = await Service.findAll({where:{categories_id: req.params.categoryId},attributes:['id','name','image_url']})
				// Professional details
				let profDet = await Profession.findAll({where:{category_id: req.params.categoryId}})
				let hashCat = {}
				hashCat['category'] = getCat
				hashCat['service'] = getAllServ
				hashCat['professionals'] = profDet
				res.send(hashCat)
			}
		}else{
			res.send({message:"Please provide category Id"})
		}
	}
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
app.get('/oneService/:serviceId',async(req,res) => {
	if (req.headers.token) {
		if (req.params.serviceId) {
			let getServ = await Service.findOne({where:{id:req.params.serviceId}})
			if (getServ) {
				let getServType = await ServiceType.findAll({where:{service_id:req.params.serviceId}})
				let hashServ = {}
				hashServ['service'] = getServ
				hashServ['service_type'] = getServType
				res.send(hashServ)
			}
		}else{
			res.send({message:"Please provide service id"})
		}
	}
	else{
		if (req.params.serviceId) {
			let getServ = await Service.findOne({where:{id:req.params.serviceId}})
			if (getServ) {
				let getServType = await ServiceType.findAll({where:{service_id:req.params.serviceId}})
				let hashServ = {}
				hashServ['service'] = getServ
				hashServ['service_type'] = getServType
				res.send(hashServ)
			}
		}else{
			res.send({message:"Please provide service id"})
		}
	}

})

// Make an Order - Add to Cart
app.post('/addtocart',async(req,res) => {
	console.log("Req body",req)
	if (req.headers.token) {
		let customerId = jwt.verify(req.headers.token,secret)
		let getCustomer = await Customer.findOne({where:{id: customerId.id,is_active:1,is_email_verify:1}})
		console.log(getCustomer)
		let newOrder = await Order.create({service_id: req.query.serviceId,service_type_id: req.query.serviceTypeId,customer_id: customerId.id})
		if (newOrder) {
			let fetchOrder = await Order.findOne({where:{id: newOrder.id}})
			if (fetchOrder && req.query.professionId) {
				let checkProf = await Profession.findOne({where:{id:req.query.professionId}})
				if (checkProf) {
					let sheduleProf = await ProfessionOrder.create({order_id:newOrder.id,profession_id:req.query.professionId})
					if (sheduleProf) {
						let updateOrder = await Order.update({status:"Professional is scheduled for your request"},{where:{id: newOrder.id}})
						let updateProf = await ProfessionOrder.update({status:"Scheduled"},{where:{id: sheduleProf.id}})
					}else{
						res.send({message:"Problem in scheduling"})
					}
				}else{
					res.send({message:"No Professional is available!"})
				}

			}
			res.send({details:fetchOrder})

		}
		// res.send({details:getCustomer})
		// let token = jwt.sign({id:customer.id}, secret, {expiresIn: 86400})
	}else{
		res.send({message:"Please LogIn to continue!"})
	}
})

// Cart List
app.get('/myCart',async(req,res) =>{
	if (req.headers.token) {
		let getCustomer = jwt.verify(req.headers.token,secret)
		let customer_id = getCustomer.id
		let cartDet = await Order.findAll({where:{customer_id:customer_id,status:"Professional is scheduled for your request"}})

		let loopCart = await cartDet.map(async(li) => {
			// let hashDet = {}

			// console.log(li.dataValues['service_name'] = "Abc")
			let getServname = await Service.findOne({where:{id: li.service_id},attributes:['name']})
			// console.log('getServname')
			// console.log(getServname.name)
			let getServType = await ServiceType.findOne({where:{id:li.service_type_id},attributes:['name','price']})
			li.dataValues['service_name'] = getServname.name
			li.dataValues['service_type'] = getServType.name
			li.dataValues['price'] = getServType.price
			// cartDet.push(hashDet)
			console.log(cartDet)
		})
		let loopResponse = await Promise.all(loopCart)
		res.send({details:cartDet})
	}
})

// Professions List
app.get('/myJob',async(req,res) => {
	if (req.query.phoneno) {
		let checkProf = await Profession.findOne({where:{phoneno: req.query.phoneno}})
		if (checkProf) {
			let getJobList = await ProfessionOrder.findAll({where:{profession_id: checkProf.id}})
			res.send({details:getJobList})
		}else{
			res.send({message:"Pofessional is not available in thi snumber."})
		}
	}else{
		res.send({message:"Please provide phone number to proceed."})
	}
})

// Orders List to Admin View
app.get('/orderList',async(req,res) => {
	if (req.headers.token) {
		let adminId = jwt.verify(req.headers.token,secret)
		let checkAdmin = await Admin.findOne({where:{id:adminId.id}})
		if (checkAdmin) {
			let getOrders = await Order.findAll({where:{is_active:1}})
			let loopOrder = await getOrders.map(async(li) => {
				let getServname = await Service.findOne({where:{id: li.service_id},attributes:['name']})
				let getServType = await ServiceType.findOne({where:{id:li.service_type_id},attributes:['name','price']})
				li.dataValues['service_name'] = getServname.name
				li.dataValues['service_type'] = getServType.name
				li.dataValues['price'] = getServType.price
				delete li.dataValues['service_id']
				delete li.dataValues['service_type_id']
				delete li.dataValues['createdAt']
				delete li.dataValues['updatedAt']
				// res.send(li)
				// return li
			})
			let loopResponse = await Promise.all(loopOrder)
			console.log(getOrders)
			res.send({details:getOrders})
		}else{
			res.send({message:"You are not allowed to see this list."})
		}
	}else{
		res.send({message:"Please provide token"})
	}
})


module.exports = app;
