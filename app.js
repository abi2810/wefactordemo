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
// To send OTP
const SendOtp = require('sendotp');

var sequelize = require('sequelize');
// Image upload destination
var upload = multer({ dest: 'public/images/' })

const cors = require('cors')
// create our Express app
const app = express();
app.set('view engine', 'ejs')
app.use(express.static('/images'))
// app.use(bodyParser);
// serves up static files from the public folder. Anything in public/ will just be served up as the file it is
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/public',express.static(__dirname + '/images'))
// put the HTML file containing your form in a directory named "public" (relative to where this script is located)
// app.get("/", express.static(path.join(__dirname, "./public")));

//logger
app.use(morgan());
// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cors())
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
var ProfessionCategory = require('./data/models/profession_category');
var Address = require('./data/models/address');

app.get('/hello', (req,res)=>{
	res.send({msg:'Hello World  Checking'})
});

// ##ommon API's
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
  const host = req.host;
  const filePath = req.protocol + "://" + host + '/' + req.file.path;
  //home/tbc1/Documents/wefactordemo/images/1c09e54e680f964d678edcad97058889
  console.log(filePath)
	res.send(req.file)
})

// ##CUSTOMER API's
// Customer Edit Profile
app.put('/v1/editProfile',upload.single('image_url'), async(req,res) => {
  let updateInfo;
  let filename;
  if (req.query.customerId) {
    if (req.file && req.query.name) {
      filename = req.file.path
      updateInfo = await Customer.update({image_url:filename,name:req.query.name},{where:{id:req.query.customerId}})
    }
    else if(req.file){
      filename = req.file.path
      updateInfo = await Customer.update({image_url:filename},{where:{id:req.query.customerId}})
    }
    else{
      updateInfo = await Customer.update({name:req.query.name},{where:{id:req.query.customerId}})
    }
    let fetchInfo = await Customer.findOne({where:{id:req.query.customerId},attributes:['id','name','email','phoneno','image_url']})
    res.status(200).send({details:fetchInfo})
  }
  else{
    res.status(401).send({message:"Please provide customer Id to update"})
  }
})

//Add Address
app.post('/newAddress',async(req,res) => {
  let customerId;
  if (req.headers.token) {
    await jwt.verify(req.headers.token,secret,function(err,decoded){
      customerId = decoded.id
    })
    let newAd = await Address.create({
      customer_id: customerId,
      house_flat_no: req.query.house_flat_no,
      landmark: req.query.landmark,
      type: req.query.type,
      lat:req.query.lat,
      lang:req.query.lang
    });
    let getAddress = await Address.findAll({where:{customer_id: customerId}})
    res.status(200).send({details:getAddress})
  }
  else{
    res.send({message:"Please provide token"})
  }
})

// Address List
app.get('/viewAddress',async(req,res) => {
  let customerId;
  if (req.headers.token) {
    await jwt.verify(req.headers.token,secret,function(err,decoded){
      customerId = decoded.id
    })
    let fetchAd = await Address.findAll({where:{customer_id:customerId}})
    res.status(200).send({details:fetchAd})
  }
  else{
    res.send({message:"Please provide token"})
  }
})

// ##PROFESSIONALS API
//  Professions Signup
app.post('/professionsignup',async(req,res) => {
  if (req.body.name && req.body.phoneno && req.body.category_id && req.body.area && req.body.pincode) {
    let categoryId = req.body.category_id
    let checkProf = await Profession.findAll({where:{phoneno:req.body.phoneno,is_verify:1}})
    console.log(checkProf)
    if (checkProf.length === 0) {
      let newprofessional = await Profession.create({name: req.body.name,phoneno: req.body.phoneno,area:req.body.area,pincode:req.body.pincode,city:"Chennai"})
      let profession_id = newprofessional.id
      let catLoop = await categoryId.map(async(id) =>{
        let newProfCat = await ProfessionCategory.create({profession_id:profession_id,category_id:id})
        console.log(newProfCat)
      })
      let responseLoop = await Promise.all(catLoop)
      let fetchProf = await Profession.findOne({where:{id:profession_id}})
      res.send({message:"Successfully registered.",details:fetchProf})
    }
    else{
      res.send({message:"You are already registered,Please login with your credentials provided by company."})
    }
  }
  else{
    res.status(401).send({message: "Please provide all the required arguments to continue!"});
  }
})

// Professions LogIn
app.post('/sendOTPtoProfessions',async(req,res,callback) =>{
  const sendOtp = new SendOtp('AuthKey');
  sendOtp.send('contactNumber', 'SenderId', callback);
  // console.log(sendToProf)
  res.send('Done')
})

// Professions job List
app.get('/myJob',async(req,res) => {
	if (req.query.phoneno) {
		let checkProf = await Profession.findOne({where:{phoneno: req.query.phoneno}})
		if (checkProf) {
			let getJobList = await ProfessionOrder.findAll({where:{profession_id: checkProf.id}})
			res.send({details:getJobList})
		}else{
			res.send({message:"Pofessional is not available in this number."})
		}
	}else{
		res.send({message:"Please provide phone number to proceed."})
	}
})

app.put('/jobAcceptRejectComplete',async(req,res) =>{
  let updateOrderStatus
  let updateProfstatus
  if (req.query.phoneno && req.query.orderId){
    let checkPro = await Profession.findOne({where:{phoneno:req.query.phoneno}})
    if (!checkPro) {
      res.send({message:"No professional is available in this number."})
    }
    let checkProfOrder = await ProfessionOrder.findOne({where:{profession_id:checkPro.id,order_id:req.query.orderId,is_active:1}})
    if (checkProfOrder) {
      // Start or Reject
      if (req.query.jobAction === "Start") {
          if (checkProfOrder.status === "Scheduled") {
            updateOrderStatus = await Order.update({status:"Our Professional is at your place,hope you like the job we do :)"},{where:{id:req.query.orderId}})
            updateProfstatus = await ProfessionOrder.update({status:"InProgress"},{where:{order_id:req.query.orderId}})
          }
      }
      else if(req.query.jobAction === "Cancel"){
        if (checkProfOrder.status === "Scheduled") {
          updateOrderStatus = await Order.update({status:"Our Professional is refused to come to your place.Dont worry our technical people will assign another professional shortly."},{where:{id:req.query.orderId}})
          updateProfstatus = await ProfessionOrder.update({status:"Cancelled"},{where:{order_id:req.query.orderId}})
        }
      }
      // Finish Job
      else if(req.query.jobAction === "Finish"){
        console.log('in Finish')
        if (checkProfOrder.status === "InProgress") {
          updateOrderStatus = await Order.update({status:"Thank you for using out service.Hope you our professionals did their job good."},{where:{id:req.query.orderId}})
          updateProfstatus = await ProfessionOrder.update({status:"Completed"},{where:{order_id:req.query.orderId}})
        }
        else{
          res.send({message:"Without starting the job you cant finish it."})
        }
      }
      let fetchProOrder = await ProfessionOrder.findOne({where:{order_id:req.query.orderId}})
      console.log(fetchProOrder)
      res.send(fetchProOrder)
    }else{
      res.send({message:"No Orders assigned for this profession."})
    }
  }
  else{
      res.send({message:"Please provide required arguments"})
  }
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
app.get('/oneCategoryService',async(req,res) => {
	// console.log("I'm in one category service",req.params.categoryId)
	if (req.headers.token) {
		if (req.query.categoryId) {
			let getCat = await Category.findOne({where:{id: req.query.categoryId},attributes:['id','name','image_url','desc']})
			if (getCat) {
				let getAllServ = await Service.findAll({where:{categories_id: req.query.categoryId},attributes:['id','name','image_url']})
				// Professional details
				let profCat = await ProfessionCategory.findAll({where:{category_id: req.query.categoryId}})
        let professionId = await profCat.map(x => x.profession_id)
        console.log(professionId)
        let profDet = await Profession.findAll({
          where:{
            id:professionId,
            is_active:1,
            is_verify:1
          },
          attributes:['id','name','phoneno','city']
        })
        console.log(profDet)
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
		if (req.query.categoryId) {
			let getCat = await Category.findOne({where:{id: req.query.categoryId},attributes:['id','name','image_url','desc']})
			if (getCat) {
				// Service Details
				let getAllServ = await Service.findAll({where:{categories_id: req.query.categoryId},attributes:['id','name','image_url']})
				// Professional details
				let profDet = await Profession.findAll({where:{category_id: req.query.categoryId}})
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

// Available Professionals list to select from cart
app.get('/availableProfessions',async(req,res) => {
  if(req.headers.token){
    let getId = jwt.verify(req.headers.token,secret)
    let checkCustomer = await Customer.findOne({where:{id:getId.id}})
    if (req.query.pincode && req.query.serviceId) {
      let getCat = await Service.findOne({where:{id:req.query.serviceId}})
      let checkProfCat = await ProfessionCategory.findAll({where:{category_id:getCat.categories_id}})
      let professionId = await checkProfCat.map(x => x.profession_id)
      let getProf = await Profession.findAll({
        where:{id:professionId,pincode:req.query.pincode,is_active:1,is_verify:1},
        attributes:['id','name','phoneno','area','city','pincode','is_active','is_verify']
      })
      console.log(getProf)
      if (getProf.length !== 0) {
        res.send({details:getProf})
      }
      else{
        res.send({message:"No professionals available here.Try again later."})
      }
    }
    else{
        res.send({message:"Please provide pincode to get know about professionals."})
    }
  }
  else{
      res.send({message:'Please provide token'})
  }
})



// Make an Order - Add to Cart
// Allow customer to add to cart,when they click continue to select addresses ask them to logIn.
app.post('/addtocart',async(req,res) => {
  if (req.headers.token) {
    let customerId = jwt.verify(req.headers.token,secret)
    let getCustomer = await Customer.findOne({where:{id: customerId.id,is_active:1,is_email_verify:1}})
    if (getCustomer) {
      let newOrder = await Order.create({
        service_id: req.query.serviceId,
        service_type_id: req.query.serviceTypeId,
        customer_id: customerId.id,
        schedule_date: req.query.scheduleDate,
        schedule_time: req.query.scheduleTime
      })
      if (newOrder && req.query.professionId && req.query.pincode) {
        // let checkProf = await Profession.findOne({where:{id:req.query.professionId,pincode:req.query.pincode,is_active:1,is_verify:1}})
        let checkProf = await Profession.findOne({where:{id:req.query.professionId,pincode:req.query.pincode}})
        console.log(checkProf)
        if (checkProf) {
          let sheduleProf = await ProfessionOrder.create({order_id:newOrder.id,profession_id:req.query.professionId})
          if (sheduleProf) {
            let updateOrder = await Order.update({status:"Professional is scheduled for your request",is_active:1},{where:{id: newOrder.id}})
            let updateProf = await ProfessionOrder.update({status:"Scheduled"},{where:{id: sheduleProf.id}})
          }else{
            res.send({message:"Problem in scheduling"})
          }
        }
        else{
          res.send({message:"No Profession found.Try again later."})
        }
      }else{
        res.send({message:"Pincode is missing"})
      }
      res.send({deatils:newOrder})
    }
    else{
        res.send({message:"No customer found."})
    }
  }
  // else{
    // let newOrder = await Order.create({
    //   service_id: req.query.serviceId,
    //   service_type_id: req.query.serviceTypeId,
    // })
  // }
})

// app.post('/addtocart',async(req,res) => {
// 	console.log("Req body",req)
// 	if (req.headers.token) {
// 		let customerId = jwt.verify(req.headers.token,secret)
// 		let getCustomer = await Customer.findOne({where:{id: customerId.id,is_active:1,is_email_verify:1}})
// 		console.log(getCustomer)
//     console.log(req.query)
// 		let newOrder = await Order.create({service_id: req.query.serviceId,service_type_id: req.query.serviceTypeId,customer_id: customerId.id,schedule_date:req.query.scheduleDate,schedule_time:req.query.scheduleTime})
// 		if (newOrder) {
// 			let fetchOrder = await Order.findOne({where:{id: newOrder.id}})
// 			if (fetchOrder && req.query.professionId) {
// 				let checkProf = await Profession.findOne({where:{id:req.query.professionId}})
// 				if (checkProf) {
// 					let sheduleProf = await ProfessionOrder.create({order_id:newOrder.id,profession_id:req.query.professionId})
// 					if (sheduleProf) {
// 						let updateOrder = await Order.update({status:"Professional is scheduled for your request"},{where:{id: newOrder.id}})
// 						let updateProf = await ProfessionOrder.update({status:"Scheduled"},{where:{id: sheduleProf.id}})
// 					}else{
// 						res.send({message:"Problem in scheduling"})
// 					}
// 				}else{
// 					res.send({message:"No Professional is available!"})
// 				}
//
// 			}
// 			res.send({details:fetchOrder})
//
// 		}
// 		// res.send({details:getCustomer})
// 		// let token = jwt.sign({id:customer.id}, secret, {expiresIn: 86400})
// 	}else{
// 		res.send({message:"Please LogIn to continue!"})
// 	}
// })

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


// Admin to reassign the professionals to an order.
app.put('/assignProfession',async(req,res) => {
  if (req.headers.token) {
    let adminId = jwt.verify(req.headers.token,secret)
    let checkAdmin = await Admin.findOne({where:{id:adminId.id}})
    if (checkAdmin && req.query.orderId) {
      let checkOrder = await Order.findOne({where:{id:req.query.orderId,is_added:1,is_active:0}})
      if (checkOrder && req.query.professionId && req.query.pincode){
        let checkProf = await Profession.findOne({where:{id:req.query.professionId,pincode:req.query.pincode}})
        console.log(checkProf)
        if (checkProf) {
          let sheduleProf = await ProfessionOrder.create({order_id:req.query.orderId,profession_id:req.query.professionId})
          if (sheduleProf) {
              let updateOrder = await Order.update({status:"Professional is scheduled for your request",is_active:1},{where:{id: req.query.orderId}})
              let updateProf = await ProfessionOrder.update({status:"Scheduled"},{where:{id: sheduleProf.id}})
          }else{
            res.send({message:"Problem in scheduling"})
          }
        }
        else{
          res.send({message:"No Profession found.Try again later."})
        }
        // res.send({details:checkOrder})
        res.send({message:"Profession is assigned to the order" + req.query.orderId})
      }
      else{
          res.send({message:"You are order is already placed."})
      }
    }
    else{
        res.send({message:"You are not allowed to do this action."})
    }
  }else{
    res.send({message:"Please provide token to continue."})
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
