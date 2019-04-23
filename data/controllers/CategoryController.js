var multer = require('multer');

const Category = require('./../models/categories');

//Image upload destination
var upload = multer({ dest: './images/' })

function imgUpload(upload.single('image_url'),req,res,next){
  next;
}


module.exports = {
  imgUpload
}
