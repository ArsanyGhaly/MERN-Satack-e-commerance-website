var nodemailer = require('nodemailer');

//allow the less secure apps on gmail to make it work
 var transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.E_MAIL,
      pass: process.env.PASSWORD
      }
   });

module.exports= {
	sendEmail(mailOptions){

	   transport.sendMail(mailOptions,(err,info)=>{
		if (err) {
			console.log(err)
		 }else{
			console.log('Email sent: ' + info.response);
				}

			});


}
}
