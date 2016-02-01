// Define all constants and starting variables
var CANVAS_WIDTH = 505,
  minSpeed = 150,
  maxSpeed = 500,
  playerStartX = 202,
  playerStartY = 390,
  lives = 3,
  score = 0,
  playerStepX = 101,
  playerStepY = 83;


// Define a random number generating function for later use in randomly distributing enemies in rows
var getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}


// Add a starting score of 0 to coresponding div in index.html
var scoreDisplay = function() {
  document.getElementById("score-counter").innerHTML = score;
}


// Add starting number of lives to coresponding div in index.html
var livesDisplay = function() {
  document.getElementById("lives-counter").innerHTML = lives;
}

var gameStatus = function() {
  if(lives <= 0) {
    document.getElementById("game-message").innerHTML = "Game Over! :(";
    document.getElementById("button").className = "display-normal";
    Engine.main();

  }
  else if(lives > 0 && score == 100) {
    document.getElementById("game-message").innerHTML = "You won! :)";
    document.getElementById("button").className = "display-normal";
  }
}

// Define the enemy object
var Enemy = function() {
  this.sprite = 'images/enemy-bug.png';
  this.x = -101 * getRandomInt(0, 5);
  this.y = 65 + 83 * getRandomInt(1, 4);
  this.width = 101;
  this.height = 171;
  this.speed = getRandomInt(minSpeed, maxSpeed);


// Defining enemies movement and speed, when they leave canvas bounds they're moved back to the begining
// If there are two or more enemies in one row, ones behind shouldn't be faster that the one in front, to avoid bugs going over each other
  this.update = function(dt) {
    this.x = this.x + this.speed * dt;
    if (this.x > CANVAS_WIDTH) {
      this.x = -101;
      this.y = getRandomInt(1, 4) * 83 + 65;
      var slowestSpeed = maxSpeed;

      allEnemies.forEach(function(enemy) {
        if (this.y == enemy.y && this.x != enemy.x) {
          if (enemy.x < 0) {
            this.x -= 101 + (this.x - enemy.x);
          }
          if (enemy.speed < slowestSpeed) {
            slowestSpeed = enemy.speed;
          }
        }
      }, this);
      this.speed = getRandomInt(minSpeed, slowestSpeed);
    }
  };

  this.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  };
};


// Define the player object
var Player = function() {
  this.sprite = 'images/char-pink-girl.png';
  this.alive = true;
  this.invisible = false;
  this.x = playerStartX;
  this.y = playerStartY;
  this.width = 101;
  this.height = 171;

  this.update = function(dt) {
    if (this.alive == true && this.invisible == false){
      this.collisionWithBugs();
   }
    this.collisionWithGem();
  };

  this.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  };

  this.collisionWithBugs = function() {
    allEnemies.forEach(function(enemy) {
      if (Math.abs(this.x - enemy.x) < 70 && Math.abs(this.y - enemy.y) < 50) {
        this.sprite = 'images/char-pink-girl-dead.png';
        this.alive = false;
        lives -= 1;
        document.getElementById('lives-counter').className = 'score-minus';
        setTimeout(this.resetPlayer, 100);
      }
    }, this);
  };

  this.collisionWithGem = function() {
    if (Math.abs(this.x - gem.x) < 70 && Math.abs(this.y - gem.y) < 50) {
        this.sprite = 'images/char-pink-girl-t.png';
        gem.y = -500;
        this.invisible = true;
      }
    }

// Reset player position to a starting one
  this.resetPlayer = function() {
    player.sprite = 'images/char-pink-girl.png';
    player.alive = true;
    player.invisible = false;
    player.x = playerStartX;
    player.y = playerStartY;
    document.getElementById('score-counter').className = 'score';
    document.getElementById('lives-counter').className = 'score';
    gem.reset();
  }

  this.gameOver = function() {

  }
};


// Determine movement of the player, count times the player reaches water and add score to HTML
Player.prototype.handleInput = function(key) {
  if (key == 'left') {
    this.x -= playerStepX;
    if (this.x < 0) {
      this.x = 0;
    }
    allRocks.forEach(function(rock) {
      if (Math.abs(this.y - rock.y) < 50 && this.x == rock.x && this.invisible == false) {
        this.x = rock.x + playerStepX;
      }
    }, this);
  }

  else if (key == 'right') {
    this.x += playerStepX;
    if (this.x > CANVAS_WIDTH - playerStepX) {
      this.x = CANVAS_WIDTH - playerStepX;
    }
    allRocks.forEach(function(rock) {
      if (Math.abs(this.y - rock.y) < 50 && this.x == rock.x && this.invisible == false) {
        this.x = rock.x - playerStepX;
      }
    }, this);
  }

  else if (key == 'up') {
    this.y -= playerStepY;
    if (this.y <= 0) {
      this.resetPlayer();
      score += 10;
    }
    allRocks.forEach(function(rock) {
      if (Math.abs(this.y - rock.y) < 50 && this.x == rock.x && this.invisible == false) {
        this.y = playerStartY - playerStepY * 3;
      }
    }, this);
  }

  else if (key == 'down') {
    this.y += playerStepY;
    if (this.y > playerStartY) {
      this.y = playerStartY;
    }
  }
};


// Gem appears in a random position when game starts, collision with bugs resets it to a new random position

var Gem = function() {
  this.sprite = 'images/gem-blue.png';
  this.active = true;
  this.x = 101 * getRandomInt(0, 5);
  this.y = 55 + 83 * getRandomInt(1, 4);
  this.width = 101;
  this.height = 171;

  this.update = function(dt) {
    if (this.active == true) {
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
    this.x = 101 * getRandomInt(0, 5);
    this.y = 55 + 83 * getRandomInt(1, 4);
  };
};


// Rock object blocks player from reaching the water

var Rock = function() {
  this.sprite = 'images/rock.png';
  this.x = 101;
  this.y = 50;
  this.width = 101;
  this.height = 171;

  this.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  };
};


// Instantiate all game objects

var allEnemies = [];
for (var i = 0; i < 4; i++) {
  allEnemies.push(new Enemy);
}

var player = new Player;

var gem = new Gem;

var allRocks = [];


// Get an array of numbers from 0 - 4 in a random order for use in rendering row of rocks

var allowedNums = [0,1,2,3,4],
randomizedNums = [],
i = allowedNums.length,
j = 0;

while (i--) {
  j = Math.floor(Math.random() * (i+1));
  randomizedNums.push(allowedNums[j]);
  allowedNums.splice(j,1);
}


// Using first 4 numbers from the randomized array to define x positions of rocks makes
// different rock layouts every time game starts and makes sure rocks aren't overlapping

for (var i = 0; i < 4; i++) {
  allRocks.push(new Rock);
  allRocks[i].x = 101 * randomizedNums[i];
}


// This listens for key presses and sends the keys to Player.handleInput() method

document.addEventListener('keydown', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});


// game over popup
// game won popup
// refactor