/* app.js
 *
 * Udacity Project made by: Tina Corluka
 *
 * This file defines all game objects and their methods, defines their interactions
 * by which it provides the main game functionality
 *
 */

"use strict";
/* Declare all global variables */
var CANVAS_WIDTH = 505,
	MIN_SPEED = 150,
	MAX_SPEED = 500,
	PLAYER_START_X = 202,
	PLAYER_START_Y = 390,
	PLAYER_STEP_X = 101,
	PLAYER_STEP_Y = 83,
	SPRITE_WIDTH = 101,
	SPRITE_HEIGHT = 171,
	lives = 3,
	score = 0,
	winScore = 100;

/* Random number generating function for later use in randomly distributing enemies in rows */
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

/* Simple function for reloading the game */
function reload() {
	location.reload();
}

/**
 * Define the GameStatus object for displaying score and game status messages
 * if the player loses all lives, "Gama over!" message is displayed
 * if the player reaches winning score of 100, "You won!" message is displayed
 * in both cases there"s a button with a callback to reset the game
 */
var GameStatus = function() {
	this.losingString = "Game over! :(";
	this.winningString = "You won! :)";

	this.update = function(dt) {
		var message = document.getElementById("game-message");
		var button = document.getElementById("button");

		if(lives === 0) {
			message.innerHTML = this.losingString;
			button.className = "display-normal";
		}

		else if(score === winScore) {
			message.innerHTML = this.winningString;
			button.className = "display-normal";
		}
	};

	this.render = function() {
		var button = document.getElementById("button");

		document.getElementById("score-counter").innerHTML = score;
		document.getElementById("lives-counter").innerHTML = lives;

		if (button.addEventListener) {
			button.addEventListener("click", reload, false);
		}

		else if (button.attachEvent) {
			button.attachEvent("onclick", reload);
		}
	};
};


/**
 * Define the Enemy object with starting properties
 * enemies are created outside of canvas at different x position to avoid crowding at the start of the game
 * y position determines in which row the enemies will be created
 * width and height are predetermined and unchanging
 * speed is a number randomly generated within certain parameters
 */
var Enemy = function() {
	this.sprite = "images/enemy-bug.png";
	this.x = -SPRITE_WIDTH * getRandomInt(1, 4);
	this.y = 65 + PLAYER_STEP_Y * getRandomInt(1, 4);
	this.width = SPRITE_WIDTH;
	this.height = SPRITE_HEIGHT;
	this.speed = getRandomInt(MIN_SPEED, MAX_SPEED);

	/**
	 * Define movement and speed of enemies
	 * when they leave canvas bounds they're moved back to the beginning
	 * if there are two or more enemies in one row,
	 * those behind shouldn't be faster that the one in front, to avoid bugs going over each other
	 */
	this.update = function(dt) {
		this.x = this.x + this.speed * dt;
		if (this.x > CANVAS_WIDTH) {
			this.x = -SPRITE_WIDTH;
			this.y = getRandomInt(1, 4) * PLAYER_STEP_Y + 65;
			var slowestSpeed = MAX_SPEED;

			allEnemies.forEach(function(enemy) {
				if (this.y === enemy.y && this.x != enemy.x) {
					if (enemy.x < 0) {
						this.x -= SPRITE_WIDTH + (this.x - enemy.x);
					}
					if (enemy.speed < slowestSpeed) {
						slowestSpeed = enemy.speed;
					}
				}
			}, this);
			this.speed = getRandomInt(MIN_SPEED, slowestSpeed);
		}
	};

	this.render = function() {
		ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
	};
};


/**
 * Define the Player object with starting properties
 * this.alive property set to true by default, and invisible to false
 * when this.invisible property is set to true, player is not affected by collision with bugs and can go through rocks
 */
var Player = function() {
	this.sprite = "images/char-pink-girl.png";
	this.alive = true;
	this.invisible = false;
	this.x = PLAYER_START_X;
	this.y = PLAYER_START_Y;
	this.width = SPRITE_WIDTH;
	this.height = SPRITE_HEIGHT;

	/**
	 * Check for collision with bugs when the player is alive and visible
	 * Check for collision with gems always
	 */
	this.update = function(dt) {
		if (this.alive === true && this.invisible === false){
			this.collisionWithBugs();
		}
		this.collisionWithGem();
	};

	this.render = function() {
		ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
	};

	/**
	 * Define player and enemy collision
	 * player sprite changes
	 * set player alive property to false (then update functions doesn't check for collision anymore until the player reset)
	 * lives variable is reduced by one
	 * player reset method is called with a small delay
	 */
	this.collisionWithBugs = function() {
		allEnemies.forEach(function(enemy) {
			if (Math.abs(this.x - enemy.x) < 70 && Math.abs(this.y - enemy.y) < 50) {
				this.sprite = "images/char-pink-girl-dead.png";
				this.alive = false;
				lives -= 1;
				document.getElementById("lives-counter").className = "score-minus";
				setTimeout(function() {
					this.reset();
				}.bind(this), 100);
			}
		}, this);
	};

	/**
	 * Define player and gem collision
	 * player sprite changes to a semi transparent image, gem position is set outside canvas
	 * player invisible property set to true
	 */
	this.collisionWithGem = function() {
		if (Math.abs(this.x - gem.x) < 70 && Math.abs(this.y - gem.y) < 50) {
				this.sprite = "images/char-pink-girl-t.png";
				gem.y = -500;
				this.invisible = true;
			}
		};

	/**
	 * Reset all player properties to default values
	 * set default class to lives-counter element
	 * call reset gem method
	 */
	this.reset = function() {
		this.sprite = "images/char-pink-girl.png";
		this.alive = true;
		this.invisible = false;
		this.x = PLAYER_START_X;
		this.y = PLAYER_START_Y;
		document.getElementById("lives-counter").className = "";
		gem.reset();
	};
};


/**
 * Determine distance and direction player moves with each allowed key stroke
 * define bounds that player can't pass, like canvas bounds and rocks
 * every time player reaches water add 10 points to the score variable and reset the player
 */
Player.prototype.handleInput = function(key) {
	if (key === "left") {
		this.x -= PLAYER_STEP_X;
		if (this.x < 0) {
			this.x = 0;
		}
		allRocks.forEach(function(rock) {
			if (Math.abs(this.y - rock.y) < 50 && this.x === rock.x && this.invisible === false) {
				this.x = rock.x + PLAYER_STEP_X;
			}
		}, this);
	}

	else if (key === "right") {
		this.x += PLAYER_STEP_X;
		if (this.x > CANVAS_WIDTH - PLAYER_STEP_X) {
			this.x = CANVAS_WIDTH - PLAYER_STEP_X;
		}
		allRocks.forEach(function(rock) {
			if (Math.abs(this.y - rock.y) < 50 && this.x === rock.x && this.invisible === false) {
				this.x = rock.x - PLAYER_STEP_X;
			}
		}, this);
	}

	else if (key === "up") {
		this.y -= PLAYER_STEP_Y;
		if (this.y <= 0) {
			this.reset();
			score += 10;
		}
		allRocks.forEach(function(rock) {
			if (Math.abs(this.y - rock.y) < 50 && this.x === rock.x && this.invisible === false) {
				this.y = PLAYER_START_Y - PLAYER_STEP_Y * 3;
			}
		}, this);
	}

	else if (key === "down") {
		this.y += PLAYER_STEP_Y;
		if (this.y > PLAYER_START_Y) {
			this.y = PLAYER_START_Y;
		}
	}
};


/**
 * Define the Gem object with starting properties
 * gem appears in a random position when game starts, collision with bugs resets it to a new random position
 */
var Gem = function() {
	this.sprite = "images/gem-blue.png";
	this.active = true;
	this.x = SPRITE_WIDTH * getRandomInt(0, 5);
	this.y = 55 + PLAYER_STEP_Y * getRandomInt(1, 4);
	this.width = SPRITE_WIDTH;
	this.height = SPRITE_HEIGHT;

	this.update = function(dt) {
		if (this.active === true) {
			this.collisionWithBugs();
		}
	};

	this.render = function() {
		ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
	};

	this.collisionWithBugs = function() {
		allEnemies.forEach(function(bug) {
			if (Math.abs(this.x - bug.x) < 60 && Math.abs(this.y - bug.y) < 50) {
				this.active = false;
				this.reset();
			}
		}, this);
	};

	this.reset = function() {
		this.active = true;
		this.x = SPRITE_WIDTH * getRandomInt(0, 5);
		this.y = 55 + PLAYER_STEP_Y * getRandomInt(1, 4);
	};
};


/* Define the Rock object that blocks player from reaching the water */
var Rock = function() {
	this.sprite = "images/rock.png";
	this.x = SPRITE_WIDTH;
	this.y = 50;
	this.width = SPRITE_WIDTH;
	this.height = SPRITE_HEIGHT;

	this.render = function() {
		ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
	};
};


/* Instantiate all game objects */
var allEnemies = [];
for (var i = 0; i < 4; i++) {
	allEnemies.push(new Enemy());
}

var player = new Player();
var gem = new Gem();
var gameStatus = new GameStatus();
var allRocks = [];


/* Get an array of numbers from 0 - 4 in a random order for use in rendering a row of rocks */
var allowedNumbers = [0, 1, 2, 3, 4],
randomizedNumbers = [],
i = allowedNumbers.length,
j = 0;

while (i--) {
	j = Math.floor(Math.random() * (i + 1));
	randomizedNumbers.push(allowedNumbers[j]);
	allowedNumbers.splice(j, 1);
}


/**
 * Using first 4 numbers from the randomized array to define x positions of rocks makes different
 * rock layouts every time game starts and makes sure rocks aren't overlapping
 */
for (var i = 0; i < 4; i++) {
	allRocks.push(new Rock());
	allRocks[i].x = SPRITE_WIDTH * randomizedNumbers[i];
}


/**
 * Listen for keyboard key presses and sends the keys to Player.handleInput() method if the game is still running,
 * meaning if there are still lives left and score didn't reach winning score
 */
document.addEventListener("keydown", function(e) {
	var allowedKeys = {
		37: "left",
		38: "up",
		39: "right",
		40: "down"
	};

	if(lives > 0 && score < winScore) {
		player.handleInput(allowedKeys[e.keyCode]);
	}
});
