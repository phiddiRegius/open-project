// game.js

// GLOBAL 

let debug = true;
let foundIndex = -1;

let player; 
let sprite;
let el;

let worldObjects = [];
let sprites = [];
let activePlayers = [];

let numOfSpriteElms = 5;
let minDist = 50;

// DIV ELEMENTS & GUI

let mapWidth = 300;
let mapHeight = 300;

let mainContainer = document.createElement('div');
  mainContainer.setAttribute('id', 'mainContainer');
  mainContainer.style.width = window.innerWidth;
  mainContainer.style.width = window.innerHeight;

  document.body.append(mainContainer);
  
let startMenu = document.createElement('div');
startMenu.setAttribute('id', 'startMenu');

let startButton = document.createElement('button');
  startButton.setAttribute('id', 'startButton');
  startButton.innerHTML = 'Start';

  startMenu.append(startButton);

let gameMap = document.createElement('div');
gameMap.setAttribute('id', 'gameMap');
gameMap.style.width = mapWidth  + 'px';
gameMap.style.height = mapHeight + 'px';

// DIRECTIONAL FUNCTIONS

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

function spriteMoveToRandomlyWhileTrue() {

}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


// play game
let socket = io();

mainContainer.append(startMenu, gameMap);

startButton.addEventListener('click', () => {
  if(activePlayers.length === 5) {
    console.log("max players")
  } else {
    socket.emit('startGame');
    startButton.style.display = "none";
  }
});

  // Game Objects & Players
// class Sprite {
//   constructor(elmId, posX, posY) {
//     this.elmId = elmId;
//     this.posX = posX;
//     this.posY = posY;
//     this.width = 24;
//     this.height = 36;
//     this.elm;
//   }
//   createElement() {
//     this.elm = document.createElement('div');
//       this.elm.setAttribute('class', 'inactivePlayer');
//       this.elm.id =  this.elmId;

//       this.elm.style.width = this.width + 'px';
//       this.elm.style.height = this.height + 'px';

//       this.elm.style.left = this.posX + 'px';
//       this.elm.style.top = this.posY  + 'px';

//       // append inactive player element to the map
//       gameMap.append(this.elm);

//       //name tag for debug tracking
//       let nameTag = document.createElement("p");
//       nameTag.innerHTML = this.elmId;
//       this.elm.append(nameTag);
//   }
// }

class Player {
  constructor(elmId, playerId, posX, posY, width, height, isFacing, isSprite, isMe) {
      // this.posX = 0; // for debugging
      // this.posY = 0; // for debugging
      this.elmId = elmId; 
      this.playerId = playerId; 
      this.posX = posX; 
      this.posY = posY; 
      this.width = width;
      this.height = height;
      this.isFacing = isFacing; 
      this.isSprite = isSprite;
      this.isMe = isMe;  
      //
      this.elm; 
      this.collider;
      this.colliderWidth = this.width;
      this.colliderHeight = this.height * 0.25;
      // this.inventory = [];
      this.speed = 3; // # of px moved
  }
  // moveSpriteDiv(div) {
  //   const direction = randomInt(0, 3); // 0 = up, 1 = down, 2 = right, 3 = left
  //   switch (direction) {
  //     case 0: // up
  //     div.posY = div.posY - div.speed;
  //     this.updatePosition();
  //       break;
  //     case 1: // down
  //     div.posY = div.posY - div.speed;
  //     this.updatePosition();
  //       break;
  //     case 2: // right
  //     div.posY = div.posY - div.speed;
  //     this.updatePosition();
  //       break;
  //     case 3: // left
  //     div.posY = div.posY - div.speed;
  //     this.updatePosition();
  //       break;
  //   }
  // }
  // updateSprite() {
  //   for(let i = 0; i < sprites.length; i++) {
  //     if(sprites[i].playerId == 'sprite') {
  //       console.log(sprites[i].elm);

  //       let div = document.getElementById(sprites[i].elmId);
  //       console.log(div);
  //       this.moveSpriteDiv(div);
  //     }

  //   }
  // }
  // PLAYER MOVEMENT & FACING FUNCTIONS
    // 
  isFacingRight() {
    if(this.isMe === true) {
      faceRight = true;
      this.isFacing = "right";
        // this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionRight.png)';
      socket.emit('playerIsFacing', player); 
    } else {
      // this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionRight.png)';
    }
  }
  isFacingLeft() {
    if(this.isMe === true) {
      faceLeft = true;
      this.isFacing = "left";
        // this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionLeft.png)';
      socket.emit('playerIsFacing', player); 
    } else {
      // this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionLeft.png)';
    }
  }
  isFacingUp() {
    if(this.isMe === true) {
      faceUp = true;
      this.isFacing = "up";
        // this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionBack.png)';
      socket.emit('playerIsFacing', player); 
    } else {
      // this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionBack.png)';
    }
  }
  isFacingDown() {
    if(this.isMe === true) {
      faceDown= true;
      this.isFacing = "down";
        // this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionFront.png)';
      socket.emit('playerIsFacing', player); 
    } else {
      // this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionFront.png)';
    }
  }
  stepRight(){
    // check if step would collide
    if( this.isColliding(this.posX + this.speed, this.posY) == true ){

    }else{
      this.posX = this.posX + this.speed;
      socket.emit('playerMovement', ({x: this.posX, y: this.posY})); 
      this.updatePosition();
    }
  }
  stepLeft() {
    if( this.isColliding(this.posX - this.speed, this.posY) == true ){
    } else {
      this.posX = this.posX - this.speed;
      socket.emit('playerMovement', ({x: this.posX, y: this.posY})); 
      this.updatePosition();
    }
  }
  stepUp() {
    if( this.isColliding(this.posX, this.posY - this.speed) == true ){
    } else {
      this.posY = this.posY - this.speed;
      socket.emit('playerMovement', ({x: this.posX, y: this.posY})); 
      this.updatePosition();
    }
  }
  stepDown() {
    if( this.isColliding(this.posX, this.posY + this.speed) == true ){
    } else {
      this.posY = this.posY + this.speed;
      socket.emit('playerMovement', ({x: this.posX, y: this.posY})); 
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
  updateWorldObjects() {
    // push activePlayers to worldObjects array?
  }
  createElement() {
    this.elm = document.createElement('div');
    this.collider = document.createElement('div');

    // name tag for debug tracking elements
    let nameTag = document.createElement("p");
    nameTag.innerHTML = this.elmId;

    if(this.isSprite === true) {
      this.elm.id = this.elmId;
      this.elm.setAttribute('class', 'sprite');
      this.collider.setAttribute('class', 'colliderS');
    } else {
      // if me....
      if(this.isMe === true) {
        this.elm.setAttribute('class', 'mainPlayer');
        this.collider.setAttribute('class', 'collider1');
      // if not me...
      } else {
        this.elm.setAttribute('class', 'otherPlayer');
        this.collider.setAttribute('class', 'collider2');
      }
      this.elm.id = this.playerId;
      nameTag.innerHTML = this.playerId;
    }
      if(debug === true) {
        this.elm.append(nameTag)
        // this.posX = 0;
        // this.posY = 0;
      }

      this.elm.style.width = this.width + 'px';
      this.elm.style.height = this.height + 'px';

      this.collider.style.width = this.colliderWidth + 'px';
      this.collider.style.height = this.colliderHeight + 'px';

      this.elm.append(this.collider);
      gameMap.append(this.elm);

      this.updatePosition();
      // this.updateWorldObjects();
  }
};

class Sprite extends Player {
  constructor(elmId, playerId, posX, posY, width, height, isFacing, isSprite, isMe) {
    super(elmId, playerId, posX, posY, width, height, isFacing, isSprite, isMe)
    // this.posX = 0; // for debugging
    // this.posY = 0; // for debugging
    // this.elmId = elmId; 
    // this.playerId = playerId; 
    // this.posX = posX; 
    // this.posY = posY; 
    // this.width = width;
    // this.height = height;
    // this.isFacing = isFacing; 
    // this.isSprite = isSprite;
    this.isMe = isMe;  
    //
    this.elm; 
    this.collider;
    this.colliderWidth = this.width;
    this.colliderHeight = this.height * 0.25;
    // this.inventory = [];
    this.speed = 3; // # of px moved

    this.moveInterval = setInterval(() => {
      if (this.playerId === 'sprite') {
        this.generateRandomMovement();
      }
    }, 1000);
  }
  generateRandomMovement() {
    if (this.playerId !== "sprite") {
      return;
    }
    const directions = ["left", "right", "up", "down"];
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    switch (randomDirection) {
      case 'up':
        if (this.posY - this.speed >= 0) {
          this.posY -= this.speed;
          this.elm.style.top = `${this.posY}px`;
        }
        break;
      case 'down':
        if (this.posY + this.speed <= mapHeight - this.height) {
          this.posY += this.speed;
          this.elm.style.top = `${this.posY}px`;
        }
        break;
      case 'left':
        if (this.posX - this.speed >= 0) {
          this.posX -= this.speed;
          this.elm.style.left = `${this.posX}px`;
        }
        break;
      case 'right':
        if (this.posX + this.speed <= mapWidth - this.width) {
          this.posX += this.speed;
          this.elm.style.left = `${this.posX}px`;
        }
        break;
      default:
        break;
    }
  }
}

  // [1A] Receives element locations from server
  socket.on('inactiveSprites', function (spriteInfo) {
    for(let i = 0; i < spriteInfo.length; i++) {
        // create instance 
        // elmId, playerId, posX, posY, isFacing, isSprite, isMe
        sprite = new Sprite (spriteInfo[i].elmId, 'sprite', spriteInfo[i].posX, spriteInfo[i].posY, spriteInfo[i].width, spriteInfo[i].height, 'down', true, false);
          sprite.createElement();
          sprites.push(sprite);
          // console.log(sprites, ' :at inactiveSprites')
    }
});

  // [1B] Receives current players from server
  socket.on('currentPlayers', function (players) {
    // console.log('players received: ', players);
    // console.log(activePlayers);

    Object.keys(players).forEach(function (id) {
      // me:
      // console.log(players[id].playerId, typeof players[id].playerId);
      // console.log(socket.id, id)
      if (players[id].playerId == socket.id) {
        // console.log("main player?", players[id].playerId)
        // create instance for main player
        for (let i=0; i < activePlayers.length; i++) {
          if (activePlayers[i].playerId == players[id].playerId) {
            let foundIndex = i;
            break;
          }
          console.log(foundIndex);
          console.log(activePlayers);
        } if (foundIndex === -1) {
          // console.log("adding main player");

          let assignedSprite = sprites.find(sprite => sprite.elmId == players[id].elmId);
            assignedSprite.playerId = players[id].playerId;
            assignedSprite.isSprite = false;
            assignedSprite.elm.remove(gameMap);

          player = new Player (players[id].elmId, players[id].playerId, assignedSprite.posX, assignedSprite.posY, assignedSprite.width, assignedSprite.height, assignedSprite.isFacing, false, true);
            player.createElement();
            activePlayers.push(player);

            console.log(sprites, ' :at mainplayer');
        }
        // or them:
      } else {
        // otherwise, create an other player
        for (let i=0; i < activePlayers.length; i++) {
          if (activePlayers[i].playerId == players[id].playerId) {
            let foundIndex = i;
            break;
          }
        } if (foundIndex === -1) {
          console.log("adding other player on currentPlayers");

          let assignedSprite = sprites.find(sprite => sprite.elmId == players[id].elmId);
            assignedSprite.playerId = players[id].playerId;
            assignedSprite.isSprite = false;
            assignedSprite.elm.remove(gameMap);

          player = new Player (players[id].elmId, players[id].playerId, assignedSprite.posX, assignedSprite.posY, assignedSprite.width, assignedSprite.height, assignedSprite.isFacing, false, false);
            player.createElement();
            activePlayers.push(player);

            console.log(sprites, ' :at otherplayer');
        }
      }
    });
  });

    socket.on('newPlayer', function (playerInfo) {
    console.log("A newPlayer has joined");

    let assignedSprite = sprites.find(sprite => sprite.elmId == playerInfo.elmId);
      assignedSprite.playerId = playerInfo.playerId;
      assignedSprite.isSprite = false;
      assignedSprite.elm.remove(gameMap);

    player = new Player (playerInfo.elmId, playerInfo.playerId, assignedSprite.posX, assignedSprite.posY, assignedSprite.width, assignedSprite.height, assignedSprite.isFacing, false, false);
      player.createElement();
      activePlayers.push(player);

      console.log(sprites, ' :at new player');
    });
  
  socket.on('playerToFace', function (playerInfo) {
    let playerTurned = activePlayers.find(player => player.playerId == playerInfo.playerId);
  
    playerTurned.isFacing = playerInfo.isFacing;
  
    if(playerInfo.isFacing == "right") {
      playerTurned.isFacingRight();
    } else if(playerInfo.isFacing == "left") {
      playerTurned.isFacingLeft();
    } else if(playerInfo.isFacing == "up") {
      playerTurned.isFacingUp();
    } else if(playerInfo.isFacing == "down") {
      playerTurned.isFacingDown();
    }
  
  });

  socket.on('playerMoved', function (playerInfo) {
    // console.log("a player moved");

    console.log(playerInfo);

    let movedPlayer = activePlayers.find(player => player.playerId == playerInfo.playerId);
    console.log(movedPlayer);
  
      movedPlayer.posX = playerInfo.posX;
      movedPlayer.posY = playerInfo.posY;

      movedPlayer.updatePosition();
  });

  socket.on('disconnectUser', function (playerId) {
    // remove the div element of the disconnected player
    for (let i=0; i < activePlayers.length; i++) {
      if (activePlayers[i].playerId == playerId) {
        // let foundIndex = i;
        break;
      }
    }
    if (foundIndex === -1) {
    // if(activePlayers.indexOf(playerId) === -1) {
      console.log('No player to remove'); 
    } else {
        let disconnectedPlayer = activePlayers.find(player => player.playerId == playerId);
        let assignedSprite = sprites.find(sprite => sprite.elmId == disconnectedPlayer.elmId);
            assignedSprite.playerId = 'sprite';
            assignedSprite.isSprite = true;
        //update sprite location, sprite facing
        gameMap.append(assignedSprite.elm);

        // console.log(assignedSprite);
        disconnectedPlayer.elm.remove(gameMap);
        activePlayers.splice(disconnectedPlayer, 1);

        console.log(sprites, ' :at disconnect');
        console.log("A player has left the game");
    }
  });




