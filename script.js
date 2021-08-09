let deck = [];
let playerHand = [];
let dealerHand = [];
let playerHandValue = 0;
let dealerHandValue = 0;

function Deck() {
	//creates a new deck of 52 cards [{face: 'A', suit: 'spades', value: 11}, {face: 'J', suit: 'hearts', value: 10}, ...]
	const faces = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
	const suits = ['S', 'C', 'H', 'D'];
	const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11];
	
	for (let f = 0; f < faces.length; f++) {
		for (let s = 0; s < suits.length; s++) {
			deck.push({face: faces[f], suit: suits[s], value: values[f]});
		}
	}
}

function getCard() {
	//picks random card from deck
	let deckIndex = Math.floor(Math.random() * (deck.length - 1));
	return deck.splice(deckIndex, 1)[0];
}

function dealCards() {
	//deals cards in alternate order
	let count = 0;
	while (count < 4) {
		let card = getCard();
		switch(count) {
			case 0:
			case 2:
				playerHand.push(card);
				break;
			case 1:
			case 3:
				dealerHand.push(card);
		}
		count++;
	}
}

function handValue(hand) {
	//sums the value of each card in a player's/dealer's hand
	if (hand === playerHand) {
		playerHandValue = 0;
		for (let i = 0; i < playerHand.length; i++) {
			playerHandValue += playerHand[i].value;
	  	}
  	} else {
  		dealerHandValue = 0;
    	for (let i = 0; i < dealerHand.length; i++) {
			dealerHandValue += dealerHand[i].value;
		}
	}
}

function evaluateAce(hand) {
	//allow an Ace to have a value of 1 if the player/dealer busts
	if (hand.some(card => card.face === 'A')) {
		let index = hand.findIndex(card => card.value === 11);
		if (index !== -1) {
			hand[index].value = 1;
  			handValue(hand);
  			index = hand.findIndex(card => card.value === 11);
		}
	}
}

function Hit(hand) {
	//updates player/dealer hand and hand value when they hit
	hand.push(getCard());
	playerHandValue = 0;
	dealerHandValue = 0;
  	handValue(playerHand);
  	handValue(dealerHand);
  	if (Bust(hand)) {
		evaluateAce(hand);
	}
}

function Stand(hand) {
	//flip dealer's second card and deal the rest of their cards
	if (Bust(hand)) {
		evaluateAce(hand);
	}
	while (dealerHandValue <= 16) {
		Hit(hand);
		$('#dealer-card').append(makeHTML(hand, hand.length - 1));
		$('#dealerHandValue').text(dealerHandValue);
	}
}

function Bust(hand) {
	//determines whether or not a player/dealer hand has gone over 21
	if (hand === playerHand && playerHandValue <= 21) {
		return false;
	} else if (hand === dealerHand && dealerHandValue <= 21) {
		return false;
	}
	return true;
}

function resetGame() {
	//reset variables and enable buttons
	playerHandValue = 0;
	dealerHandValue = 0;
	playerHand = [];
	dealerHand = [];

	$('.card').empty();
	$('#result').empty();
	$('#hit-button').prop({'disabled': false});
	$('#stand-button').prop({'disabled': false});
}

function startGame() {
	//start new game by refreshing hands and dealing new cards
	deck.splice(0, deck.length);
	Deck();
	resetGame();
	dealCards();
	$('audio#shuffle')[0].play();
	$('.score').fadeTo('fast', 1);
  	handValue(playerHand);
  	handValue(dealerHand);
  	if (Bust(playerHand)) {
		evaluateAce(playerHand);
		}
	if (Bust(dealerHand)) {
		evaluateAce(dealerHand);
	}
}

function makeHTML(hand, index) {
	//create an img tag of a card in a player/dealer hand
	let card = hand[index].face + hand[index].suit;
	return `<img src="cards/${card}.png" />`
}

$(document).ready(function() {
	$('#result').append('<h2>Press Deal to Play!</h2>');
	$('#hit-button').prop({'disabled': true});
	$('#stand-button').prop({'disabled': true});

	$('#deal-button').on('click', function() {
		startGame();

		$('#playerHandValue').text(playerHandValue);
		$('#dealerHandValue').text(dealerHand[0].value);

		$('#player-card').append(makeHTML(playerHand, 0));
		$('#player-card').append(makeHTML(playerHand, 1));
		$('#dealer-card').append(makeHTML(dealerHand, 0));
		$("#dealer-card").append('<img id="flip" src="cards/back-red.png" />');

	})	

	$('#hit-button').on('click', function() {
		Hit(playerHand);
		if (playerHandValue <= 21) {
			$('audio#hit')[0].play();
		}

		$('#player-card').append(makeHTML(playerHand, playerHand.length - 1));
		$('#playerHandValue').text(playerHandValue);

		if (playerHandValue > 21) {
			$('#hit-button').prop({'disabled': true});
			$('#stand-button').prop({'disabled': true});
			$('#flip').attr('src', `cards/${dealerHand[1].face + dealerHand[1].suit}.png`);
			$('#dealerHandValue').text(dealerHandValue);
			$('#result').append('<h2>Dealer Won!</h2>');
			$('audio#lose')[0].play();
		}
	})

	$('#stand-button').on('click', function() {
		$('#hit-button').prop({'disabled': true});
		$('#stand-button').prop({'disabled': true});
		$('#flip').attr('src', `cards/${dealerHand[1].face + dealerHand[1].suit}.png`);
		$('#dealerHandValue').text(dealerHandValue);

		Stand(dealerHand);

		if (dealerHandValue > 21 || dealerHandValue < playerHandValue) {
			$('#result').append('<h2>You Won!</h2>');
			$('audio#win')[0].play();
		} else if (dealerHandValue > playerHandValue) {
			$('#result').append('<h2>Dealer Won!</h2>');
			$('audio#lose')[0].play();
		} else {
			$('#result').append('<h2>Push!</h2>');
			$('audio#neutral')[0].play();
		}
	})
});