const mongoose = require('mongoose');
const crypto   = require('crypto');
const uuidv1   =  require('uuid/v1');



const userSchema = new mongoose.Schema (
      {
        firstname: {
          type :String,
          trim : true,
          required :true,
          maxlength:32
        },
        lastname: {
          type :String,
          trim : true,
          required :true,
          maxlength:32
        },
        email:{
          type: String,
          trim: true,
          required: true,
          unique:true
        },
        hashed_password:{
          type:String,
          required :true
        },
        about :{
          type:String,
          trim:true
        },
        salt : {
          type:String
        },
        role :{
          type:Number,
          default:0
        },
        history:{
          type: Array,
          default:[]
        },
        active:{
          type:Boolean,
          default:false
        },
        block:{
          type:Boolean,
          default:false
        },
        last_active:{
		      type:Date
	       },
        secretToken:{
		       type: String,
           default: ""
	       }
      },
      {timestamps :true}

);


userSchema
.virtual('password')
.set(function(password) {
  this._password = password;
  this.salt = uuidv1();
  this.hashed_password = this.encryptPassword(password);
  })

.get(function () {
    return this._password;
  });




userSchema.methods = {
  // check if the entered password == the hasedpassword
    authenticate : function(plainText) {
      return this.encryptPassword(plainText) === this.hashed_password;
    },
    //hashed the password
    encryptPassword: function(password) {
      if (!password) return '';
      try {
        return crypto
        .createHmac('sha1',this.salt)
        .update(password)
        .digest('hex');
      }
      catch (err){
        return '';
      }
  }
};

var User =module.exports = mongoose.model('User',userSchema);


module.exports.getUserByEmail = function(email, callback){
	var query = {email: email};
	User.findOne(query, callback);
}

module.exports.getUserByToken = function(token, callback){
  var query = {secretToken: token};
  try{	return User.findOne(query, callback);}
	catch(err){
    return '';
  }

}
