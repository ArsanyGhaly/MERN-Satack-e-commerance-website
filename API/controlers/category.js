const Category = require("../models/category");
const Product  = require("../models/product")
const {errorHandler}   = require("../helpers/dbErrorHandler");
const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');

exports.addNew = (req,res) => {
    // get gthe date form the form using formidable.IncomingForm
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    // parse the form that we got fileds and fileds
    //it takes the req and handle err,fildes,fils
    form.parse(req,(err,fildes,files) => {
          if (err) {
            return res.status(400).json({
              error : "image can not be uploaded"
            })

          }
          //extract the rest of the fileds from fildes
           const { name } = fildes;

          //validation all required
          if (!name) {
               return res.status(400).json({
                   error: 'Name  are required'
               });
           }


           let category = new Category(fildes);
           if (files.image) {
               // console.log("FILES PHOTO: ", files.photo);
               if (files.image.size > 1000000) {
                   return res.status(400).json({
                       error: 'Image should be less than 1mb in size'
                   });
               }
               category.image.data = fs.readFileSync(files.image.path);
               category.image.contentType = files.image.type;
           }

           //save the product
           category.save((err,cat) => {
             if(err){
               return res.status(400).json({
                 error : "The category Already exist"
               });
             }
             res.json({
               cat
             })
           })

})
};
exports.categoryById = (req, res, next, id) => {
    Category.findById(id).exec((err, category) => {
        if (err || !category) {
            return res.status(400).json({
                error: 'Category does not exist'
            });
        }
        req.category = category;
        next();
    });
};
exports.read = (req, res) => {
    return res.json(req.category);
};

exports.update = (req, res) => {
    console.log('req.body', req.body);
    console.log('category update param', req.params.categoryId);

    const category = req.category;
    category.name = req.body.name;
    category.save((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(data);
    });
};

exports.remove = (req, res) => {
    const category = req.category;
    Product.find({ category }).exec((err, data) => {
        if (data.length >= 1) {
            return res.status(400).json({
                message: `Sorry. You cant delete ${category.name}. It has ${data.length} associated products.`
            });
        } else {
            category.remove((err, data) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json({
                    message: 'Category deleted'
                });
            });
        }
    });
};

exports.list = (req, res) => {
    Category.find().exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(data);
    });
};

//working as a middle ware to get the image
exports.image = (req, res, next) => {
        if (req.category.image.data) {
            res.set('Content-Type', req.category.image.contentType);
            return res.send(req.category.image.data);
        }
        next();
    };
