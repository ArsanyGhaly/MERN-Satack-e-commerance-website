const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');
const Product = require("../models/product");
const {errorHandler}   = require("../helpers/dbErrorHandler");

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
      const { name, desc, price, category, quantity, shipping ,condition} = fildes;

      //validation all required
      if (!name || !desc || !price || !category || !quantity || !shipping || !condition ) {
           return res.status(400).json({
               error: 'All fields are required'
           });
       }

      //create product with all the info exept the image
      let product = new Product(fildes);

      //handle the photo size and store the photo and the type
        // 1kb = 1000
        // 1mb = 1000000

        if (files.image) {
            // console.log("FILES PHOTO: ", files.photo);
            if (files.image.size > 1000000) {
                return res.status(400).json({
                    error: 'Image should be less than 1mb in size'
                });
            }
            product.image.data = fs.readFileSync(files.image.path);
            product.image.contentType = files.image.type;
        }

        //save the product
        product.save((err,pro) => {
          if(err){
            return res.status(400).json({
              error : errorHandler(err)
            });
          }
          res.json({
            pro
          })
        })


    })

};
exports.productById = (req,res,next,id) => {
  // try to find the id of the user
  Product.findById(id)
    .populate('comments.postedBy', '_id firstname lastname')
    .populate('category', '_id name')
    .exec((err,product) => {
      if(err || !product){
        return res.status(400).json({
          error:"product not found"
        });
      }
      //if found store the user on the req.profile
      req.product = product;
      next();
  });

};
//read the product based on its id and return it
exports.read = (req,res) => {
  req.product.image = undefined;
  return res.json(req.product);
}
//delet Product
exports.remove = (req, res) => {
    //hold the product that we want to remove using the id
    let product = req.product;

    //remove if there is an error handle it if not delet
    //and return it the deleted one as well
    product.remove((err, deletedProduct) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            deletedProduct,
            message: 'Product deleted successfully'
        });
    });
};
//update is the same as create new but some changes
exports.update = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Image could not be uploaded'
            });
        }

        //get the product info from the require by id
        let product = req.product;
        product = _.extend(product, fields);

        // 1kb = 1000
        // 1mb = 1000000

        if (files.image) {
            // console.log("FILES PHOTO: ", files.photo);
            if (files.image.size > 1000000) {
                return res.status(400).json({
                    error: 'Image should be less than 1mb in size'
                });
            }
            product.image.data = fs.readFileSync(files.image.path);
            product.image.contentType = files.image.type;
        }

        //save with the new info
        product.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);
        });
    });
};
exports.list = (req,res) => {
      // get the arguments from the query
      let order  = req.query.order  ? req.query.order : 'asc';
      let sortBy = req.query.sortBy ? req.query.sortBy : '_id';
      let limit  = req.query.limit  ? parseInt(req.query.limit) : 6;

      //start finding the product based on the mquery
      // populate(), which lets you reference documents in other collections
      Product.find()
        //exclute image from the fildes using " - "
        .select('-image')
        .populate('category', '_id name')
        .sort([[sortBy, order]])
        .limit(limit)
        .exec((err, products) => {
            if (err) {
                return res.status(400).json({
                    error: 'Products not found',
                    errg:err
                });
            }
            res.json(products);
        });
};


//get the related product which are in the same category
//Syntax: {field: {$ne: value} }
//$ne selects the documents where the value of the field is not equal
//to the specified value. This includes documents
//that do not contain the field.
exports.related = (req,res) =>{
  //get the limit from the query or make it 6 by default
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;

//get the prodect that has the same category but not has the same id as this one
Product.find({ _id: { $ne: req.product }, category: req.product.category })
    .limit(limit)
    .populate('Category', '_id name')
    .exec((err, products) => {
        if (err) {
            return res.status(400).json({
                error: 'Products not found'
            });
        }
        res.json(products);
    });

}
exports.byCategory = (req,res) =>{


//get the prodect that has the same category but not has the same id as this one
Product.find({category: req.category })
    .populate('Category', '_id name')
    .exec((err, products) => {
        if (err) {
            return res.status(400).json({
                error: 'Products not found'
            });
        }
        res.json(products);
    });

}
//list the catgeories for products the categories that have pruduct on them
exports.listCategories = (req, res) => {
    Product.distinct('category', {}, (err, categories) => {
            if (err) {
                return res.status(400).json({
                    error: 'Categories not found'
                });
            }
            res.json(categories);
        });
    };


/**
* list products by search
* we will implement product search in react frontend
* we will show categories in checkbox and price range in radio buttons
* as the user clicks on those checkbox and radio buttons
* we will make api request and show the products to users based on what he wants
*/
exports.listBySearch = (req, res) => {
        let order = req.body.order ? req.body.order : "desc";
        let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
        let limit = req.body.limit ? parseInt(req.body.limit) : 100;
        let skip = parseInt(req.body.skip);
        let findArgs = {};

        // console.log(order, sortBy, limit, skip, req.body.filters);
        // console.log("findArgs", findArgs);

        for (let key in req.body.filters) {
            if (req.body.filters[key].length > 0) {
                if (key === "price") {
                    // gte -  greater than price [0-10]
                    // lte - less than
                    findArgs[key] = {
                        $gte: req.body.filters[key][0],
                        $lte: req.body.filters[key][1]
                    };
                } else {
                    findArgs[key] = req.body.filters[key];
                }
            }
        }

        Product.find(findArgs)
            .select("-image")
            .populate("Category")
            .sort([[sortBy, order]])
            .skip(skip)
            .limit(limit)
            .exec((err, data) => {
                if (err) {
                    return res.status(400).json({
                        error: "Products not found"
                    });
                }
                res.json({
                    size: data.length,
                    data
                });
            });
    };
//working as a middle ware to get the image
exports.image = (req, res, next) => {
        if (req.product.image.data) {
            res.set('Content-Type', req.product.image.contentType);
            return res.send(req.product.image.data);
        }
        next();
    };
//to perform the search based on the query object
exports.listSearch = (req, res) => {
        // create query object to hold search value and category value
        const q = {};

        // assign search value to query.name
        if (req.query.search) {
            //set the first search name to the coming search name
            q.name = { $regex: req.query.search, $options: 'i' };
            // assigne category value to query.category

            if (req.query.category && req.query.category != 'All') {
                q.category = req.query.category;
            }
            // find the product based on query object with 2 properties
            // search and category
            Product.find(q, (err, products) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json(products);
            //exclude the image out
            }).select('-image');
        }
        else {
          Product.find({}, (err, products) => {
              if (err) {
                  return res.status(400).json({
                      error: errorHandler(err)
                  });
              }
              res.json(products);
          //exclude the image out
          }).select('-image');
        }
    };
exports.decreaseQuantity = (req, res, next) => {
        let bulkOps = req.body.order.products.map(item => {
            return {
                updateOne: {
                    filter: { _id: item._id },
                    update: { $inc: { quantity: -item.count, sold: +item.count } }
                }
            };
        });

        Product.bulkWrite(bulkOps, {}, (error, products) => {
            if (error) {
                return res.status(400).json({
                    error: 'Could not update product'
                });
            }
            next();
        });
    };

exports.like = (req, res) => {
  let pro     =req.product;
  let user    = req.profile;

        Product.findByIdAndUpdate(pro._id, { $push: { likes: user._id } }, { new: true }).exec(
            (err, result) => {
                if (err) {
                    return res.status(400).json({
                        error: err
                    });
                } else {
                    res.json(result);
                }
            }
        );
    };

exports.unlike = (req, res) => {
  let pro     = req.product;
  let user    = req.profile;
        Product.findByIdAndUpdate(pro._id, { $pull: { likes: user._id } }, { new: true }).exec(
            (err, result) => {
                if (err) {
                    return res.status(400).json({
                        error: err
                    });
                } else {
                    res.json(result);
                }
            }
        );
    };

exports.discountPercent = (req, res) =>{

const discount = req.body.discount
console.log(req.body)
  if(discount <= 0 && discount >= 100){
    return res.status(400).json({
        error: 'discount should be between 0 and 100'
    });
  }
  var product = req.product;
  var {price} = product;
  const newPrice = price-((price * discount)/100);
      const updatedFields = {
            discountPercent: discount,
            discountedPrice: newPrice
            };

        product = _.extend(product, updatedFields);
        product.updated = Date.now();

          product.save((err, result) => {
                if (err) {
                    return res.status(400).json({
                        error: err
                    });
                }
                res.json({
                    message: `The Price After disscount is ${newPrice}`
                });
              });

    };

exports.comment = (req, res) => {
      let comment = {};
      let pro     =req.product;
      comment.postedBy = req.profile;
      comment.text = req.body.comment;
      comment.review = req.body.starsSelected;


    Product.findByIdAndUpdate(pro._id, { $push: { comments: comment } }, { new: true })
            .populate('comments.postedBy', '_id name')
            .populate('postedBy', '_id name')
            .exec((err, result) => {
                if (err) {
                    return res.status(400).json({
                        error: err
                    });
                } else {
                    res.json(result);
                }
            });
    };

exports.uncomment = (req, res) => {
      let id = req.body.commentId;
      let pro     =req.product;

      Product.findByIdAndUpdate(pro._id, { $pull: { comments: { _id: id } } }, { new: true })
          .populate('comments.postedBy', '_id name')
          .populate('postedBy', '_id name')
          .exec((err, result) => {
              if (err) {
                  return res.status(400).json({
                      error: err
                  });
              } else {
                  res.json(result);
              }
          });
  };
