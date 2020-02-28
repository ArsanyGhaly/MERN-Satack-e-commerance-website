const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema


const productSchema = new mongoose.Schema (
      {
        name: {
          type :String,
          trim : true,
          required :true,
          maxlength:32

        },
        desc: {
          type :String,
          required :true,
          maxlength:2000
        },
        price: {
          type :Number,
          trim : true,
          required :true,
          maxlength:32

        },
      /**  ratingAverage: {
             type: Number,
             default: 1,
             min: [1.0, 'Rating must be above 0'],
             max: [5.0, 'Rating must be below 5'],
             set: val => Math.round(val * 10) / 10 //round 3.666666667 to 3.7
            },
        ratingQuantity: {
             type: Number,
             default: 0,
           }, **/
        discountPercent: {
            type: Number,
            default: 0
         },
         discountedPrice:{
           type: Number,
           default: null
         },
        category: {
          type :ObjectId,
          ref : "Category",
          required :true,
        },
        quantity: {
          type :Number
        },
        sold: {
          type :Number,
          default:0
        },
        image: {
          data :Buffer,
          contentType: String
        },
        shipping: {
          require :true,
          type:Boolean
        },
        condition: {
          type: String,
          required:true
       // two values new and old
    },

      likes: [{ type: ObjectId, ref: 'User', unique:true }],
      comments: [
       {
           review:{type:Number},
           text: {type:String,required:true},
           created: { type: Date, default: Date.now },
           postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
       }
     ]
      },
      {timestamps :true}

);



module.exports = mongoose.model('Product',productSchema);
