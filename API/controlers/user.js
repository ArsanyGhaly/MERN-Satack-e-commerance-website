const User = require("../models/user");


//read the user date from the req but exculde the salt and password
exports.read =(req,res) => {
      req.profile.hashed_password = undefined;
      req.profile.salt = undefined;
      return res.json(req.profile);
}
exports.update = (req,res) => {
      User.findOneAndUpdate(
          { _id : req.profile._id },
          { $set: req.body },
          {new:true},
          (err,user) => {
            if (err) {
              res.status(400).json({
                error: "you are not authorized to do that "
              })
            }

            user.hased_password = undefined;
            user.salt           = undefined;
            res.json(user);

          }




      );



}

exports.list = (req, res) => {
    User.find().exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(data);
    });
};
exports.addOrderToUserHistory = (req, res, next) => {
    let history = [];

    req.body.order.products.forEach(item => {
        history.push({
            _id: item._id,
            name: item.name,
            description: item.description,
            category: item.category,
            quantity: item.count,
            transaction_id: req.body.order.transaction_id,
            amount: req.body.order.amount
        });
    });

    User.findOneAndUpdate({ _id: req.profile._id }, { $push: { history: history } }, { new: true }, (error, data) => {
        if (error) {
            return res.status(400).json({
                error: 'Could not update user purchase history'
            });
        }
        next();
    });
};
exports.purchaseHistory = (req, res) => {
    Order.find({ user: req.profile._id })
        .populate('user', '_id name')
        .sort('-created')
        .exec((err, orders) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(orders);
        });
};

exports.allUsers = (req, res) => {
    User.find((err, users) => {
        if (err) {
            return res.status(400).json({
                error: err
            });
        }
        res.json(users);
    }).select('name email updated created role block');
};
exports.deleteUser = (req, res, next) => {
    let user = req.target;
    user.remove((err, user) => {
        if (err) {
            return res.status(400).json({
                error: err
            });
        }
        res.json({ message: 'User deleted successfully' });
    });
};
