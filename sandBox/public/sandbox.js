// sandbox.js

// GLOBAL VARIABLES

let player;
let npc;
let object;

let activePlayers = [];

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

options = {
    spd: 3,
}

let submit = document.getElementById('submit');

let spriteOptions = document.getElementById('spriteOptions');

let inputSpd = document.getElementById('inputSpd');
let inputSprt = document.getElementById('inputSprt');

submit.addEventListener("click", () => {
    
    
    let adjustSpd = inputSpd.value;
    options.spd = Number(adjustSpd);


    player.updateSprite(options);
});


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
    console.log('left key is pressed');
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
        this.width = 60;
        this.height = 100;
        this.collBttm;
        this.collTop;
        this.collWidth = this.width;
        this.collHeight = this.height * 0.25;
        this.elm; 

        // this.isActive;
        // this.inventory = [];
        this.speed = 2; // # of px moved
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
            for(let i = 0; i < activePlayers.length; i++) {
            // main player
            if(activePlayers[i].playerId != this.playerId) {
            // other
            let other = activePlayers[i];
            if((other.posX > nextStepX - other.width) && 
                (other.posX <= nextStepX + this.width) && 
                (other.posY > nextStepY - other.height) && 
                (other.posY <= nextStepY + this.height) ) {
                    return true // is colliding with other player
                }
            }   
            }
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
    updateSprite(options) {
        this.speed = options.spd;
    }
    createElement() {
        // if me...
        this.elm = document.createElement('div');
        
        if(this.isMe === true) {
            // this.elm.setAttribute('class', 'mainPlayer');
            this.elm.setAttribute('class', 'spriteTemp02');
        // if not me...
        } else {
            this.elm.setAttribute('class', 'otherPlayer');
        }
        // element id 
        this.elm.id = this.playerId;

        this.elm.style.width = this.width + 'px';
        this.elm.style.height = this.height + 'px';

        this.collTop = document.createElement('div');
        this.collTop.setAttribute('class', 'top');

        this.collTop.style.width = this.collWidth + 'px';
        this.collTop.style.height = this.collHeight + 'px';

        this.collBttm = document.createElement('div');
            this.collBttm.setAttribute('class', 'bottom');

        this.collBttm.style.width =   this.collWidth + 'px';
        this.collBttm.style.height = this.collHeight + 'px';

        this.elm.append(this.collTop, this.collBttm);

        this.updatePosition();

        // append main player to the map
        gameMap.append(this.elm)
    }
};

class NPC {
    constructor(elmId, posX, posY, isFacing) {
        this.elmId = elmId; 
        this.posX = posX; 
        this.posY = posY; 
        this.isFacing = isFacing; 
        this.width = 60;
        this.height = 100;
        this.collBttm;
        this.collTop;
        this.collWidth = this.width;
        this.collHeight = this.height * 0.25;
        this.elm; 

    }
    createElement() {
        this.elm = document.createElement('div');
        this.elm.setAttribute('class', 'spriteTemp03');

        this.elm.style.left = this.posX + 'px';
        this.elm.style.top = this.posY  + 'px';

        this.elm.style.width = this.width + 'px';
        this.elm.style.height = this.height + 'px';

        this.collTop = document.createElement('div');
        this.collTop.setAttribute('class', 'top3');

        this.collTop.style.width =   this.collWidth + 'px';
        this.collTop.style.height = this.collHeight + 'px';

        this.collBttm = document.createElement('div');
            this.collBttm.setAttribute('class', 'bottom3');

        this.collBttm.style.width =   this.collWidth + 'px';
        this.collBttm.style.height = this.collHeight + 'px';

        this.elm.append(this.collTop, this.collBttm);

        gameMap.append(this.elm)
    }
}

class worldObjects {
    constructor(elmId, posX, posY) {
        this.elmId = elmId; 
        this.posX = posX; 
        this.posY = posY; 
        this.width = 31;
        this.height = 27;
    }
    createElement() {
        this.elm = document.createElement('div');
        this.elm.setAttribute('class', 'object');

        this.elm.style.width = this.width + 'px';
        this.elm.style.height = this.height + 'px';

        this.elm.style.left = this.posX + 'px';
        this.elm.style.top = this.posY  + 'px';

        gameMap.append(this.elm)
    }
}


player = new Player ('sprite01', 'player01', 100, 100, "down", true);
player.createElement();

activePlayers.push(player);

npc = new NPC ('sprite02', 'npc01', 20, 30, "down");
npc.createElement();

activePlayers.push(npc);


// object = new worldObjects ('cactus', 200, 200);
// object.createElement();