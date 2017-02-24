'use strict';

window.paymentModel = {
	lastCardNumberInput: '',
	oldCardNumber: 0,
	cardType: '',
	oldCardExpiration: '',
	lastCardExpiration: ''
};

function addClass(elem, className) {
	if (!elem) {
		return;
	}
	if (elem.classList) {
		elem.classList.add(className);
	}
	else {
		elem.className += ' ' + className;
	}
	return elem;
}

function removeClass(elem, className) {

	if (!elem) {
		return;
	}
	if (elem.classList) {
		elem.classList.remove(className);
	}
	else {
		elem.className = elem.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
	}
	return elem;
}

function removeAndAddClass(elem, classToRemove, classToAdd) {
	removeClass(elem, classToRemove);
	addClass(elem, classToAdd);
}

function transitionOut(elem) {
	removeAndAddClass(elem, 'transitioning-in', 'transitioning-out');
}

function transitionIn(elem) {
	removeAndAddClass(elem, 'transitioning-out', 'transitioning-in');
}

function moveInputToNumberFromExpiration(e) {
	var currentEl = e.target.parentNode.querySelector('.card-expiration');
	var nextEl = e.target.parentNode.querySelector('.card-number');

	moveInputBack(currentEl, nextEl);

	currentEl.oninput = cardNumberOnInput;
	currentEl.onfocus = cardNumberOnFocus;
	currentEl.onkeydown = null;

	nextEl.oninput = cardExpirationOnInput;
	nextEl.onfocus = cardExpirationOnFocus;
	nextEl.onkeydown = cardExpirationOnKeydown;

	transitionIn(currentEl);
	transitionOut(nextEl);
	var cvvEl = e.target.parentNode.querySelector('.card-cvv');
	transitionOut(cvvEl);

	var zipEl = e.target.parentNode.querySelector('.card-zip');
	transitionOut(zipEl);
}

function moveInputToCvvFromZip(e) {
	var currentEl = e.target.parentNode.querySelector('.card-zip');
	var nextEl = e.target.parentNode.querySelector('.card-cvv');
	var thirdEl = e.target.parentNode.querySelector('.card-expiration');

	moveInputBack(currentEl, nextEl, thirdEl);

	currentEl.oninput = cardCvvOnInput;
	currentEl.onfocus = cardCvvOnFocus;
	currentEl.onkeydown = cardCvvOnKeydown;

	nextEl.oninput = cardZipOnInput;
	nextEl.onfocus = cardZipOnFocus;
	nextEl.onkeydown = cardZipOnKeydown;
}

function moveInput(currentEl, nextEl, thirdEl) {
	if (!!thirdEl) {
		removeClass(thirdEl, 'start');
		removeClass(thirdEl, 'transitioning-out');
		removeClass(thirdEl, 'transitioning-in');
	}
	removeClass(nextEl, 'start');
	removeClass(nextEl, 'transitioning-out');
	removeClass(nextEl, 'transitioning-in');
	removeClass(currentEl, 'start');
	removeClass(currentEl, 'transitioning-out');
	removeClass(currentEl, 'transitioning-in');

	var currentVal = currentEl.value.toString();
	var currentClass = currentEl.classList.toString();
	var currentPlaceholder = currentEl.placeholder.toString();
	var nextPlaceholder = nextEl.placeholder.toString();
	var nextVal = nextEl.value.toString();
	var nextClass = nextEl.classList.toString();

	currentEl.value = nextVal;
	currentEl.className = nextClass;
	currentEl.placeholder = nextPlaceholder;

	nextEl.value = currentVal;
	nextEl.className = currentClass;
	nextEl.placeholder = currentPlaceholder;
}

function moveInputToExpirationFromCvv(e) {
	var currentEl = e.target.parentNode.querySelector('.card-cvv');
	var nextEl = e.target.parentNode.querySelector('.card-expiration');
	var thirdEl = e.target.parentNode.querySelector('.card-zip');

	moveInputBack(currentEl, nextEl, thirdEl);

	currentEl.oninput = cardExpirationOnInput;
	currentEl.onfocus = cardExpirationOnFocus;
	currentEl.onkeydown = cardExpirationOnKeydown;

	nextEl.oninput = cardCvvOnInput;
	nextEl.onfocus = cardCvvOnFocus;
	nextEl.onkeydown = cardCvvOnKeydown;
}

function getCreditCardType(number) {
	// start without knowing the credit card type
	var result = 'unknown';
	// first check for MasterCard
	if (/^5[1-5]/.test(number))
	{
		result = 'mastercard';
	}

	// then check for Visa
	else if (/^4/.test(number))
	{
		result = 'visa';
	}

	// then check for AmEx
	else if (/^3[47]/.test(number))
	{
		result = 'amex';
	}

	return result;
}

function moveInputBack(currentEl, nextEl, thirdEl) {
	moveInput(currentEl, nextEl, thirdEl);
	nextEl.parentNode.removeChild(nextEl);
	currentEl.parentNode.insertBefore(nextEl, currentEl.nextSibling);
}

function moveInputForward(currentEl, nextEl, thirdEl) {
	moveInput(currentEl, nextEl, thirdEl);
	nextEl.parentNode.removeChild(nextEl);
	currentEl.parentNode.insertBefore(nextEl, currentEl);
}

function cardNumberOnInput(e) {
	var numbers = e.target.value.replace(/[\D]*/g, '');
	var imgEl = e.target.parentNode.parentNode.querySelector('.cc-type-img');
	var ccType;

	if (numbers.length > 1) {
		ccType = getCreditCardType(numbers);
		addClass(imgEl, ccType);
	}
	else {
		removeClass(imgEl, 'visa');
		removeClass(imgEl, 'amex');
		removeClass(imgEl, 'mastercard');
		removeClass(imgEl, 'unknown');
	}

	if (e.target.value.length < window.paymentModel.lastCardNumberInput.length) {
		window.paymentModel.oldCardNumber = window.paymentModel.oldCardNumber.substr(0, window.paymentModel.oldCardNumber.length - 1);
	}
	else if ((numbers.length < 17 && ccType !== 'amex') || numbers.length < 16) {
		window.paymentModel.oldCardNumber = numbers;
	}

	var newNumber = '';
	var i = 0;

	if (ccType === 'amex') {
		while (i < window.paymentModel.oldCardNumber.length) {
			if (i === 4) {
				newNumber += '  ';
				i += 6;
				newNumber += window.paymentModel.oldCardNumber.substr(4, 6);
			}
			else if (i === 10) {
				newNumber += '  ';
				i += 5;
				newNumber += window.paymentModel.oldCardNumber.substr(10, 5);
			}
			else {
				i += 4;
				newNumber += window.paymentModel.oldCardNumber.substr(0, 4);
			}
		}
	}
	else {
		for (i = 0; i < window.paymentModel.oldCardNumber.length; i += 4) {
			if (i !== 0) {
				newNumber += ' ';
			}
			newNumber += window.paymentModel.oldCardNumber.substr(i, 4);
		}
	}

	e.target.value = newNumber;
	window.paymentModel.lastCardNumberInput = newNumber;

	var newJustNumberLength = newNumber.replace(/[\D]*/g, '').length;

	if (newJustNumberLength === 16 || (ccType === 'amex' && newJustNumberLength === 15)) {
		window.paymentModel.cardType = ccType;
		var currentEl = e.target.parentNode.querySelector('.card-number');
		var nextEl = e.target.parentNode.querySelector('.card-expiration');

		moveInputForward(currentEl, nextEl);

		currentEl.oninput = cardExpirationOnInput;
		currentEl.onfocus = cardExpirationOnFocus;
		currentEl.onkeydown = cardExpirationOnKeydown;

		nextEl.oninput = cardNumberOnInput;
		nextEl.onfocus = cardNumberOnFocus;
		nextEl.onkeydown = null;

		transitionOut(nextEl);
		transitionIn(currentEl);
		var cvvEl = e.target.parentNode.querySelector('.card-cvv');
		transitionIn(cvvEl);

		var zipEl = e.target.parentNode.querySelector('.card-zip');
		transitionIn(zipEl);
	}
}

function cardNumberOnFocus(e) {
	if (e.target.value.length > 0) {
		var zip = e.target.parentNode.querySelector('.card-zip');
		var cvv = e.target.parentNode.querySelector('.card-cvv');
		var expiration = e.target.parentNode.querySelector('.card-expiration');

		transitionIn(e.target.parentNode.querySelector('.card-number'));
		transitionOut(expiration);
		transitionOut(cvv);
		transitionOut(zip);
	}
}

function cardExpirationOnKeydown(e) {
	if (e.keyCode === 8 && e.target.value.length === 0) {
		moveInputToNumberFromExpiration(e);
		e.preventDefault();
	}
}

function cardExpirationOnInput(e) {
	var numbers = e.target.value.replace(/[\D]*/g, '');
	if (e.target.value.length < window.paymentModel.lastCardExpiration.length) {
		window.paymentModel.oldCardExpiration = window.paymentModel.oldCardExpiration.substr(0, window.paymentModel.oldCardExpiration.length - 1);
	}
	else if (numbers.length < 5) {
		window.paymentModel.oldCardExpiration = numbers;
	}

	var parsedInt;

	if (numbers.length === 0) {
		moveInputToNumberFromExpiration(e);
	}
	else {
		if (numbers.length === 1) {
			parsedInt = parseInt(numbers);
			if (parsedInt > 1) {
				window.paymentModel.oldCardExpiration = '';
			}
		}

		if (numbers.length === 2) {
			parsedInt = parseInt(numbers);

			if (parsedInt > 12) {
				window.paymentModel.oldCardExpiration = numbers.substr(0, 1);
			}
		}

		if (numbers.length === 3) {
			parsedInt = parseInt(numbers.substr(2));
			if (parsedInt === 0) {
				window.paymentModel.oldCardExpiration = numbers.substr(0, 2);
			}
		}

		if (numbers.length === 4) {
			parsedInt = parseInt(numbers.substr(2));
			if (parsedInt < 16) {
				window.paymentModel.oldCardExpiration = numbers.substr(0, 3);
			}
		}

		numbers = window.paymentModel.oldCardExpiration;

		if (numbers.length >= 2) {
			e.target.value = numbers.substr(0, 2) + '/' + numbers.substr(2, 2);
		}
		else if (numbers.length < 2) {
			e.target.value = numbers;
		}

		if (numbers.length === 4) {
			var currentEl = e.target.parentNode.querySelector('.card-expiration');
			var nextEl = e.target.parentNode.querySelector('.card-cvv');
			var thirdEl = e.target.parentNode.querySelector('.card-zip');

			moveInputForward(currentEl, nextEl, thirdEl);

			currentEl.oninput = cardCvvOnInput;
			currentEl.onfocus = cardCvvOnFocus;
			currentEl.onkeydown = cardCvvOnKeydown;

			nextEl.oninput = cardExpirationOnInput;
			nextEl.onfocus = cardExpirationOnFocus;
			nextEl.onkeydown = cardExpirationOnKeydown;
		}

		window.paymentModel.lastCardExpiration = e.target.value;
	}
}

function cardExpirationOnFocus(e) {
	if (e.target.value.length > 0 && e.target.parentNode.querySelector('.card-expiration').className.indexOf('transitioning') > -1) {
		var zip = e.target.parentNode.querySelector('.card-zip');
		var cvv = e.target.parentNode.querySelector('.card-cvv');
		var expiration = e.target.parentNode.querySelector('.card-expiration');

		transitionOut(e.target.parentNode.querySelector('.card-number'));
		transitionIn(expiration);
		transitionIn(cvv);
		transitionIn(zip);
	}
}

function cardCvvOnKeydown(e) {
	if (e.keyCode === 8 && e.target.value.length === 0) {
		moveInputToExpirationFromCvv(e);
		e.preventDefault();
	}
}

function cardCvvOnInput(e) {
	var currentEl;
	var nextEl;
	var thirdEl;
	var numbers = e.target.value.replace(/[\D]*/g, '');
	if (numbers.length === 0) {
		moveInputToExpirationFromCvv(e);
	}
	else {
		if ((e.target.value.length >= 3 && window.paymentModel.cardType !== 'amex') || (window.paymentModel.cardType === 'amex' && e.target.value.length >= 4)) {
			if (window.paymentModel.cardType === 'amex') {
				e.target.value = e.target.value.substr(0, 4);
			}
			else {
				e.target.value = e.target.value.substr(0, 3);
			}
			currentEl = e.target.parentNode.querySelector('.card-cvv');
			nextEl = e.target.parentNode.querySelector('.card-zip');
			thirdEl = e.target.parentNode.querySelector('.card-expiration');

			moveInputForward(currentEl, nextEl, thirdEl);

			currentEl.oninput = cardZipOnInput;
			currentEl.onfocus = cardZipOnFocus;
			currentEl.onkeydown = cardZipOnKeydown;

			nextEl.oninput = cardCvvOnInput;
			nextEl.onfocus = cardCvvOnFocus;
			nextEl.onkeydown = cardCvvOnKeydown;
		}
	}
}

function cardCvvOnFocus(e) {
	if (e.target.value.length > 0 && e.target.parentNode.querySelector('.card-cvv').className.indexOf('transitioning') > -1) {
		transitionOut(e.target.parentNode.querySelector('.card-number'));
		transitionIn(e.target.parentNode.querySelector('.card-expiration'));
		transitionIn(e.target.parentNode.querySelector('.card-cvv'));
		transitionIn(e.target.parentNode.querySelector('.card-zip'));
	}
}

function cardZipOnKeydown(e) {
	if (e.keyCode === 8 && e.target.value.length === 0) {
		moveInputToCvvFromZip(e);
		e.preventDefault();
	}
}

function cardZipOnInput(e) {
	var numbers = e.target.value.replace(/[\D]*/g, '');
	if (numbers.length === 0) {
		moveInputToCvvFromZip(e);
	}
	else if (e.target.value > 6) {
		e.target.value = e.target.value.substr(0, 5);
	}
}

function cardZipOnFocus(e) {
	if (e.target.value.length > 0 && e.target.parentNode.querySelector('.card-zip').className.indexOf('transitioning') > -1) {
		transitionOut(e.target.parentNode.querySelector('.card-number'));
		transitionIn(e.target.parentNode.querySelector('.card-expiration'));
		transitionIn(e.target.parentNode.querySelector('.card-cvv'));
		transitionIn(e.target.parentNode.querySelector('.card-zip'));
	}
}

window.PaymentService = {
	init: function (divContainerId) {
		var paymentContainer = document.getElementById(divContainerId);
		var creditCardTypeContainer = document.createElement('div');
		creditCardTypeContainer.className = 'credit-card-type';

		var cardType = document.createElement('div');
		cardType.className = 'card-type';
		creditCardTypeContainer.appendChild(cardType);
		paymentContainer.appendChild(creditCardTypeContainer);

		var creditCardNumbersContainer = document.createElement('div');
		creditCardNumbersContainer.className = 'credit-card-numbers';

		var cardNumberInput = document.createElement('input');
		cardNumberInput.className = 'card-number';
		cardNumberInput.oninput = cardNumberOnInput;
		cardNumberInput.onfocus = cardNumberOnFocus;
		cardNumberInput.placeholder = '0000 0000 0000 0000';
		cardNumberInput.type = 'tel';

		var cardExpirationInput = document.createElement('input');
		cardExpirationInput.className = 'card-expiration start';
		cardExpirationInput.placeholder = 'mm/yy';
		cardExpirationInput.type = 'tel';

		var cardCvvInput = document.createElement('input');
		cardCvvInput.className = 'card-cvv start';
		cardCvvInput.placeholder = 'cvv';
		cardCvvInput.type = 'tel';

		var cardZipInput = document.createElement('input');
		cardZipInput.className = 'card-zip start';
		cardZipInput.placeholder = 'zip code';
		cardZipInput.type = 'tel';

		creditCardNumbersContainer.appendChild(cardNumberInput);
		creditCardNumbersContainer.appendChild(cardExpirationInput);
		creditCardNumbersContainer.appendChild(cardCvvInput);
		creditCardNumbersContainer.appendChild(cardZipInput);

		paymentContainer.appendChild(creditCardNumbersContainer);

	}
};
