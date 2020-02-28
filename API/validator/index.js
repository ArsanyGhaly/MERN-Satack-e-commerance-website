exports.userSignupValidator = (req, res, next) => {
    req.check('firstname', 'First Name is required').notEmpty();
    req.check('lastname', 'Last Name is required').notEmpty();
    req.check('email', 'Email must be between 3 to 32 characters')
        .matches(/.+\@.+\..+/)
        .withMessage('Email must contain @')
        .isLength({
            min: 4,
            max: 32
        });
    req.check('password', 'Password is required').notEmpty();


    req.check('password')
        .isLength({ min: 6 })
        .withMessage('Password must contain at least 6 characters')
        .matches(/\d/)
        .withMessage('Password must contain a number')
        .custom(() => {
            if (req.body.password === req.body.confirmPassword) {
                return true;
              } else {
                return false;
              }
            }).withMessage("Passwords don't match.");


    const errors = req.validationErrors();
    if (errors) {
        const firstError = errors.map(error => error.msg)[0];
        return res.status(400).json({ error: firstError });
    }
    next();
};

exports.userSigninValidator = (request, response, next) => {
    request
        .check('email', 'Email must be between 3 to 32 characters')
        .matches(
            /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/
        )
        .withMessage('Please type your valid email address')
        .isLength({
            min: 4,
            max: 32
        });
    request.check('password', 'Invalid Social Login Token!').notEmpty();
    request
        .check('password')
        .isLength({ min: 6 })
        .withMessage('Your social login token is invalid!');
    const errors = request.validationErrors();
    if (errors) {
        const firstError = errors.map(error => error.msg)[0];
        return res.status(400).json({ error: firstError });
    }
    next();
};

exports.passwordResetValidator = (req, res, next) => {
    // check for password
    req.check('password', 'Password is required').notEmpty();
    req.check('password')
    .isLength({ min: 6 })
    .withMessage('Password must contain at least 6 characters')
    .matches(/\d/)
    .withMessage('Password must contain a number')
    .custom(() => {
        if (req.body.password === req.body.comfirmpassword) {
            return true;
          } else {
            return false;
          }
        }).withMessage("Passwords don't match.");

    // check for errors
    const errors = req.validationErrors();
    // if error show the first one as they happen
    if (errors) {
        const firstError = errors.map(error => error.msg)[0];
        return res.status(400).json({ error: firstError });
    }
    // proceed to next middleware or ...
    next();
};


exports.productValidator = (req, res, next) => {
    // check for password
    req.check('name', 'Product Name is required').notEmpty();
    req.check('desc', 'Product Description is required').notEmpty();
    req.check('price', 'Product Description is required').notEmpty();
    req.check('category', 'Product\'s category is required').notEmpty();
    req.check('shipping', 'Product\'s shipping is required').notEmpty();
    req.check('quantity', 'Product\'s quantity is required').notEmpty();
    req.check('condition', 'Product\'s condition is required').notEmpty();

    // check for errors
    const errors = req.validationErrors();
    // if error show the first one as they happen
    if (errors) {
        const firstError = errors.map(error => error.msg)[0];
        return res.status(400).json({ error: firstError });
    }
    // proceed to next middleware or ...
    next();
};
