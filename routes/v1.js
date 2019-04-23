const express = require('express');
const router = express.Router();

// Require the controllers
const AdminController = require('../data/controllers/AdminController');
const CustomerController = require('../data/controllers/CustomerController');

// Set routes
// Admin
router.post('/adminSignup',AdminController.adminSignup)
router.post('/adminLogin',AdminController.adminLogin)

// Customer
// router.post('/customerSignup',CustomerController.customerSignup)
router.post('/customerSignup',CustomerController.customerSignup)
router.post('/customerLogin',CustomerController.customerLogin)
// router.post('/editProfile',CustomerController.editProfile)
router.get('/customerProfile',CustomerController.profile)
// router.post('/Login',AdminController.adminLogin)

module.exports = router;
