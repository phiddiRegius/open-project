// sandbox.js

// GLOBAL VARIABLES

let player;

let mapWidth = 300;
let mapHeight = 300;

let gameContainer = document.createElement('div');
  gameContainer.setAttribute('id', 'gameContent');
  gameContainer.style.width = window.innerWidth;
  gameContainer.style.width = window.innerHeight;

  document.body.append(gameContainer);


let gameMap = document.createElement('div');
  gameMap.setAttribute('id', 'gameMap');
  gameMap.style.width = mapWidth  + 'px';
  gameMap.style.height = mapHeight + 'px';


gameContainer.append(gameMap);

//

let spd = document.getElementById('velOne');
let sprint = document.getElementById('velTwo');

let sprTemp = document.getElementById('sprite-options');


function optionsForm() {
    console.log(sprTemp.value)
    console.log(spd.value);
    console.log(sprint.value);
  }



const leftKey = "ArrowLeft";
const rightKey = "ArrowRight";
const upKey = "ArrowUp";
const downKey = "ArrowDown";

let faceLeft;
let faceRight;
let faceUp;
let faceDown;

window.onkeydown = function(event) {
const keyCode = event.key;
event.preventDefault();

  checkIsFacing();

  if(keyCode == leftKey) { 
    player.isFacingLeft();
    if(keyCode == leftKey && faceLeft === true) {
      player.stepLeft();
    }
  } else if(keyCode == rightKey) { 
    player.isFacingRight();
    if(keyCode == rightKey && faceRight === true) {
      player.stepRight();
    }
  } else if(keyCode == upKey) { 
    player.isFacingUp();
    if(keyCode == upKey && faceUp === true) {
      player.stepUp();
    }
  } else if(keyCode == downKey) { 
    player.isFacingDown();
    if(keyCode == downKey && faceDown === true) {
      player.stepDown();
    }
  }
}
function checkIsFacing() {
if(faceLeft === true || faceRight === true || faceUp === true || faceDown === true ) {
  if(faceDown === true) {
      faceLeft = false;
      faceRight = false;
      faceUp = false;
  } else if(faceUp === true) {
      faceLeft = false;
      faceRight = false;
      faceDown = false;
  } else if(faceLeft === true) {
      faceRight = false;
      faceDown = false;
      faceUp = false;
  } else if(faceRight === true) {
      faceLeft= false;
      faceDown = false;
      faceUp = false;
  }
}
}


// PLAYER CLASS

class Player {
    constructor(elmId, playerId, posX, posY, isFacing, isMe) {
        // this.posX = 0; // for debugging
        // this.posY = 0; // for debugging
        this.elmId = elmId; // for inactive players
        this.playerId = playerId;
        this.posX = posX; // x position
        this.posY = posY; // y position
        this.isFacing = isFacing; //direction facing
        this.isMe = isMe; // true or false
        this.width = 20;
        this.height = 20;
        this.elm; 
        // this.isActive;
        // this.inventory = [];
        this.speed = 3; // # of px moved
    }
    projectile() {
        
    }
    // PLAYER MOVEMENT & FACING FUNCTIONS
    isFacingRight() {
        if(this.isMe === true) {
        faceRight = true;
        this.isFacing = "right";
            // this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionRight.png)';
        } else {
        // this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionRight.png)';
        }
    }
    isFacingLeft() {
        if(this.isMe === true) {
            faceLeft = true;
            this.isFacing = "left";
            // this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionLeft.png)';
        } else {
            // this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionLeft.png)';
        }
    }
    isFacingUp() {
        if(this.isMe === true) {
            faceUp = true;
            this.isFacing = "up";
            // this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionBack.png)';
        } else {
            // this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionBack.png)';
        }
    }
    isFacingDown() {
        if(this.isMe === true) {
            faceDown= true;
            this.isFacing = "down";
            // this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionFront.png)';
        } else {
            // this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionFront.png)';
        }
    }
    stepRight(){
        // check if step would collide
        if( this.isColliding(this.posX + this.speed, this.posY) == true ){

        }else{
            this.posX = this.posX + this.speed;
            this.updatePosition();
        }
    }
    stepLeft() {
        if( this.isColliding(this.posX - this.speed, this.posY) == true ){
        } else {
            this.posX = this.posX - this.speed;
            this.updatePosition();
        }
    }
    stepUp() {
    if( this.isColliding(this.posX, this.posY - this.speed) == true ){
    } else {
        this.posY = this.posY - this.speed; 
        this.updatePosition();
    }
    }
    stepDown() {
        if( this.isColliding(this.posX, this.posY + this.speed) == true ){
        } else {
            this.posY = this.posY + this.speed;
            this.updatePosition();
        }
    }
    isColliding(nextStepX, nextStepY) {
        // check if player is **WITHIN map bounds
        if(nextStepX >= 0 && nextStepX < mapWidth - this.width && nextStepY >= 0 && nextStepY < mapHeight - this.height) {
        // check for other players
            // for(let i = 0; i < activePlayers.length; i++) {
            // // main player
            // if(activePlayers[i].playerId != this.playerId) {
            // // other
            // let other = activePlayers[i];
            // if((other.posX > nextStepX - other.width) && 
            //     (other.posX <= nextStepX + this.width) && 
            //     (other.posY > nextStepY - other.height) && 
            //     (other.posY <= nextStepY + this.height) ) {
            //         return true // is colliding with other player
            //     }
            // }   
            // }
            return false // is not colliding with other player
        } else {
            return true
        }
    }
    updatePosition() {
        // if me:
        if(this.isMe === true) {
        gameMap.style.left = - this.posX  + 'px';
        gameMap.style.top = - this.posY  + 'px';
        } else {
        this.elm.style.left = this.posX + 'px';
        this.elm.style.top = this.posY  + 'px';
        }
    }
    createElement() {
        // if me...
        this.elm = document.createElement('div');
        if(this.isMe === true) {
            this.elm.setAttribute('class', 'mainPlayer');
        // if not me...
        } else {
            this.elm.setAttribute('class', 'otherPlayer');
        }
        // element id 
        this.elm.id = this.playerId;
        
        this.elm.style.width = this.width + 'px';
        this.elm.style.height = this.height + 'px';

        this.updatePosition();

        // append main player to the map
        gameMap.append(this.elm)
    }
};


player = new Player ('sprite01', 'player01', 100, 100, "down", true);
player.createElement();