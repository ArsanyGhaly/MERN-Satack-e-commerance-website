
const { Order, CartItem } = require('../models/order');
const { errorHandler } = require('../helpers/dbErrorHandler');
const Mailer   = require("../helpers/mailer");

exports.create = (req, res) => {
  //create the
    console.log('CREATE ORDER: ', req.body);
   req.body.order.user = req.profile;
    const order = new Order(req.body.order);
    order.save((error, data) => {
        if (error) {
            return res.status(400).json({
                error: errorHandler(error)
            });
        }

        res.json(data);
    });

};

exports.getStatusValues = (req, res) => {
    res.json(Order.schema.path('status').enumValues);
};

exports.listOrders = (req, res) => {
    Order.find()
        .populate('user', '_id firstname lastname email')

        .sort('-created')
        .exec((err, orders) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(error)
                });
            }
            res.json(orders);
        });
};

exports.updateOrderStatus = (req, res) => {
    Order.update({ _id: req.order }, { $set: { status: req.body.state } }, (err, order) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(order);

    });

};


exports.updateShippingStatus =(req,res) =>{

  Order.update({ _id: req.order }, { $set: { shippingTract: req.body.shippingTract } }, (err, order) => {
      if (err) {
          return res.status(400).json({
              error: errorHandler(err)
          });
      }
      res.json(order);
      var mailOptions = {
                from: process.env.E_MAIL,
                to: req.body.email,
                subject: 'your Product has been Shipped',
                text: `your Product has been Shipped:`,
                html: `<p>your Shipping tracing code is :</p>
                      <p>${req.body.shippingTract}</p>
                `
            };
            Mailer.sendEmail(mailOptions);

})
}

exports.updateOrderAdress = (req, res) => {
    const adress={
      street_address:req.body.street,
      city:req.body.city,
      state:req.body.state,
      zip:req.body.zip,
      country:req.body.country
    }

    Order.update({ _id: req.body.orderId }, { $set: { address: adress } }, (err, order) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(order);
    });
};

exports.orderById = (req, res, next, id) => {
    Order.findById(id)
        .populate('products.product', 'name price')
        .exec((err, order) => {
            if (err || !order) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            req.order = order;
            next();
        });
};
