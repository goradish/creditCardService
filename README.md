# Credit Card Service

This is a single line credit card input in html and JavaScript.


## Install
1. Run `npm install && gulp` to create the `dist` directory.
1. Copy the `dist` directory to your project and load it onto your page
1. The `paymentService.js` file creates a global object called `PaymentService`. Invoke the `init` function with the ID of the div container as the parameter.
1. Access the non-formated user input with the `PaymentService.finalNumbers` object
	1. `PaymentService.finalNumbers.creditCardNumber` - the credit card number `eg. 4242424242424242`
	1. `PaymentService.finalNumbers.expiration` - the card expiration `e.g. 0222`
	1. `PaymentService.finalNumbers.cvv` - the card CVV (4 numbers for Amex cards) `e.g. 222`
	1. `PaymentService.finalNumbers.zip` - the card zip code `e.g. 60604`

## TODO
- [ ] Create Bower package
