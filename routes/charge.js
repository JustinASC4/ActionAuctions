var express = require('express');
var router = express.Router();
var modules = require('../app');
var nodemailer = require('nodemailer');
var dateFormat = require('dateformat');
var ddb = modules.ddb;
var STRIPE_API_KEY = modules.STRIPE_API_KEY;
var STRIPE_PUBLIC_KEY = modules.STRIPE_PUBLIC_KEY;
var stripe = require("stripe")(STRIPE_API_KEY);
var service_email = modules.service_email;
var email_pass = modules.email_pass;


var transporter = nodemailer.createTransport({
  service: 'yahoo',
  auth: {
    user: service_email,
    pass: email_pass
  }
});

router.post('/', function(req, res, next) {
	var amount = req.body.amount;
	amount = parseFloat(amount).toFixed(2);
	var email = req.body.email;
	var first_name = req.body.first_name;
	var last_name = req.body.last_name;
	var stripe_token = req.body.stripeToken;
	var auction_id = req.body.auction_id;

	/*FETCH AUCTION DETAILS FROM DATABASE*/
	var params = {
		TableName: "Auctions",
		Key:{
			"auction_id":auction_id
		}
	};
	ddb.get(params, function(err, data){
		if (err)
        	res.redirect('/');
	    else {
	    	data = data['Item'];
	    	var end_time = dateFormat(data['ending_time'],'dddd, mmmm dS, yyyy "at" h:MM:ss TT');
	    	end_time = end_time.replace('"ap"', 'at');
	    	var charity = data['charity'];


	    	/*CHARGE TOKEN*/
	    	stripe.charges.create({
			  amount: Math.floor(amount*100),
			  currency: "usd",
			  source: stripe_token,
			  description: "Charge from Charity Labs"
			}, function(err, charge) {
				if (err)
					res.redirect('/payment-error');
				else{
					var stripe_id = charge['id'];
					var date = dateFormat(new Date(),"isoDateTime");

					/*CREATE BID ENTRY IN DATABASE*/
					var params = {
					    TableName:'Bids',
					    Item:{
							"stripe_id":stripe_id,
							"auction_id":auction_id,
							"amount": Math.floor(amount*100),
							"email":email,
							"time":date
					    }
					};
					console.log(params);
					ddb.put(params, function(err, data) {
					    if (err) {
					        console.error("Unable to add item");
					    } else {
					        console.log("Added item");
					    }
					});

			    	/*UPDATE AUCTION DATABASE RECORD*/
			    	var current_amount = data['current_amt'] + Math.floor(amount*100);
			   		//If this bid is greater than previous highest, update that
			    	if(Math.floor(amount*100) > data['highest_bid']){
			    		var UpdateExpression = "set highest_bid=:h, highest_bidder=:b, current_amt=:c";
					    var ExpressionAttributeValues = {
					        ":c":current_amount,
					        ":h":Math.floor(amount*100),
					        ":b":stripe_id
					    };
			    	} else{
			    		var UpdateExpression = "set current_amt=:c";
					    var ExpressionAttributeValues = {
					        ":c":current_amount
					    };
			    	}
			    	console.log(ExpressionAttributeValues)
			    	var params = {
			    		TableName:"Auctions",
			    		Key:{
			    			"auction_id":auction_id
			    		},
			    		UpdateExpression: UpdateExpression,
			    		ExpressionAttributeValues: ExpressionAttributeValues,
			  			ReturnValues:"UPDATED_NEW"
			    	}
			    	ddb.update(params, function(err, data) {
					    if (err) {
					        console.error("Unable to update item.", JSON.stringify(err, null, 2));
					    } else {
					        console.log("UpdateItem succeeded");
					    }
					});

			    	/*SEND EMAIL*/
			    	var mailOptions = {
					  from: service_email,
					  to: email,
					  subject: `Confirming your Donation to ${charity}`,
					  text: `Hey, ${first_name}!\n\nThank you for your generous donation to ${charity}!\n\nMake sure to check back in on ${end_time} to see if you've won!\n\n      Donation Total: $${amount}\n\n\nSincerely,\nCharity Labs Team`
					};
					transporter.sendMail(mailOptions, function(error, info){
					  if (error) {
					    console.log(error);
					  } else {
					    console.log('Email sent: ' + info.response);
					  }
					});

					/*RENDER CONFIRMATION PAGE*/
					context = data;
					context['auction_link'] = req.headers.host+'/auction/'+data['auction_id'];
					context['first_name'] = first_name;
					context['amount'] = amount;
					context['end_time'] = end_time;
					delete context['highest_bidder'];
					delete context['highest_bid'];
					res.render('confirmation', context);
				}
			});
	    }
	});
});

router.get('/', function(req, res, next){
	res.redirect('/');
});



module.exports = router;