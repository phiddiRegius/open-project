// game.js

let mapWidth = 400;
let mapHeight = 400;

let minDist = 50;

let player; 

numOfFlowers = 5;

let gameMap = document.createElement('div');
gameMap.setAttribute('id', 'gameMap');
gameMap.style.width = mapWidth  + 'px';
gameMap.style.height = mapHeight + 'px';

let activePlayers = [];
let activeObjects = [];
let activeFlowers = [];

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

// play game
document.body.append(gameMap);

  // Game Objects & Players
class Player {
  constructor(posX, posY, isFacing, playerId, isMe) {
      // this.posX = 0; // for debugging
      // this.posY = 0; // for debugging
      this.posX = posX; // x position
      this.posY = posY; // y position
      this.width = 24;
      this.height = 36;
      this.playerId = playerId; // socket.id
      this.isMe = isMe; // true or false
      this.elm; 
      this.myFlowers = []; // flower inventory
      this.isFacing = isFacing;
      this.speed = 3; // # of px moved
  }
  // PLAYER MOVEMENT & FACING FUNCTIONS
    // 
  isFacingRight() {
    if(this.isMe === true) {
      faceRight = true;
      this.isFacing = "right";
        this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionRight.png)';
      socket.emit('playerIsFacing', player); 
    } else {
      this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionRight.png)';
    }
  }
  isFacingLeft() {
    if(this.isMe === true) {
      faceLeft = true;
      this.isFacing = "left";
        this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionLeft.png)';
      socket.emit('playerIsFacing', player); 
    } else {
      this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionLeft.png)';
    }
  }
  isFacingUp() {
    if(this.isMe === true) {
      faceUp = true;
      this.isFacing = "up";
        this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionBack.png)';
      socket.emit('playerIsFacing', player); 
    } else {
      this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionBack.png)';
    }
  }
  isFacingDown() {
    if(this.isMe === true) {
      faceDown= true;
      this.isFacing = "down";
        this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionFront.png)';
      socket.emit('playerIsFacing', player); 
    } else {
      this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionFront.png)';
    }
  }
  stepRight(){
    // check if step would collide
    if( this.isColliding(this.posX + this.speed, this.posY) == true ){

    }else{
      this.posX = this.posX + this.speed;
      socket.emit('playerMovement', ({x: this.posX, y: this.posY})); 
      this.updatePosition();
      // if(this.isCollectingFlower(this.posX, this.posY) == true) {
      //   // console.log('pickup the flower');
      // }
    }
  }
  stepLeft() {
    if( this.isColliding(this.posX - this.speed, this.posY) == true ){

    } else {
      this.posX = this.posX - this.speed;
      socket.emit('playerMovement', ({x: this.posX, y: this.posY})); 
      this.updatePosition();
      // if(this.isCollectingFlower(this.posX, this.posY) == true) {
      //   // console.log('pickup the flower');
      // }
    }
  }
  stepUp() {
    if( this.isColliding(this.posX, this.posY - this.speed) == true ){

    } else {
      this.posY = this.posY - this.speed;
      socket.emit('playerMovement', ({x: this.posX, y: this.posY})); 
      this.updatePosition();
      // if(this.isCollectingFlower(this.posX, this.posY) == true) {
      //   // console.log('pickup the flower');
      // }
    }

  }
  stepDown() {
    if( this.isColliding(this.posX, this.posY + this.speed) == true ){

    } else {
      this.posY = this.posY + this.speed;
      socket.emit('playerMovement', ({x: this.posX, y: this.posY})); 
      this.updatePosition();
      // if(this.isCollectingFlower(this.posX, this.posY) == true) {
      //   // console.log('pickup the flower');
      // }
    }
  }
  isColliding(nextStepX, nextStepY) {
    //    - bounds of map
    if(nextStepX >= 0 && nextStepX < mapWidth - this.width && nextStepY >= 0 && nextStepY < mapHeight - this.height) {
    //    - other players
      for(let i = 0; i < activePlayers.length; i++) {
        
        if(activePlayers[i].playerId != this.playerId) {
         // other
         let other = activePlayers[i];
         if((other.posX > nextStepX - other.width) && 
            (other.posX <= nextStepX + this.width) && 
            (other.posY > nextStepY - other.height) && 
            (other.posY <= nextStepY + this.height) ) {
              return true
          }
        }
        // console.log(activePlayers[i]);      
      }
       return false
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
      // let currentX = this.elm.style.left.substring(0, this.elm.style.left.length-2)
      // let currentY = this.elm.style.top.substring(0, this.elm.style.top.length-2)
      // // console.log(currentX, this.posX);

      // if(currentX > this.posX){
      //   //moving left
      //   this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionLeft.png)';
      // }else if(currentX < this.posX){
      //   //moving right
      //   this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionRight.png)';
      // }
      this.elm.style.left = this.posX + 'px';
      this.elm.style.top = this.posY  + 'px';
    }
  }
  createElement(){
    this.elm = document.createElement('div');
    // if me....
    if(this.isMe === true) {
      this.elm.setAttribute('class', 'mainPlayer');
    // if not me...
    } else {
      this.elm.setAttribute('class', 'otherPlayer');
    }
    // else
    //  ///
    // ASSIGN ELEMENT ID AS SOCKET ID
      this.elm.id =  this.playerId;
      
      this.elm.style.width = this.width + 'px';
      this.elm.style.height = this.height + 'px';

      // APPEND THE MAINPLAYER TO THE MAP
      gameMap.append(this.elm)

      // PLAYER BACKGROUND IMAGE
      this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionFront.png)';
    
      this.updatePosition();

      // NAME TAG FOR DEBUG TRACKING ELEMENTS
        // let nameTag = document.createElement("p");
        // nameTag.innerHTML = this.playerId;
        // this.elm.append(nameTag)
  }
 };

class worldObject {
    constructor(name, elmId, posX, posY, width, height) {
        this.name = name;
        this.elmId = elmId;
        this.posX = posX;
        this.posY = posY;
        this.width = width;
        this.height = height;
    }
  };
  
  class Flower extends worldObject { 
    constructor (elmId, posX, posY, isPicked, flwrImage, flwrIcon) {
        super(elmId, posX, posY); 
        // this.scientific = scientific;
        // this.rarity = rarity;
        this.elmId = elmId; // div id of the flower element
        this.posX = posX;
        this.posY = posY;
        this.width = 14;
        this.height = 22;
        this.flowerElm;
        this.isPicked = isPicked;
        this.whoPicked;
        this.flwrImage = flwrImage;
        this.flwrIcon = flwrIcon;
    }
    createElement(){
      this.flowerElm = document.createElement('div');

      this.flowerElm.setAttribute('class', 'flower');
      this.flowerElm.setAttribute('id', this.elmId);

      this.flowerElm.style.width = this.width + 'px';
      this.flowerElm.style.height = this.height + 'px';

      this.flwrIcon = 'url(assets/world/blueFlowerIcon.png)'
      this.flwrImage = 'url(assets/world/blueFlowerPlant.png)';
      this.flowerElm.style.backgroundImage = this.flwrImage;

      gameMap.append(this.flowerElm)

      this.updatePosition();
    }
    updatePosition() {
      this.flowerElm.style.left = this.posX + 'px';
      this.flowerElm.style.top = this.posY  + 'px';
    }
  };

  let collectibleFlowers = [
    // ghostOrchid = new Flower ("Ghost Orchid", "Dendrophylax Lindenii", 10, randomPosition() - 5, randomPosition() - 5, 10, 10),
    {name: 'Ghost Orchid', scientificName: 'Dendrophylax lindenii', rarity: 10, flwrIcon: 'url(assets/world/blueFlowerIcon.png)', flwrImage: 'url(assets/world/blueFlowerPlant.png)'},
    {name: 'Ghost Orchid', scientificName: 'Dendrophylax lindenii', rarity: 10, flwrIcon: 'url(assets/world/blueFlowerIcon.png)', flwrImage: 'url(assets/world/blueFlowerPlant.png)'}
  ];

let socket = io();
 
socket.on('currentPlayers', function (players) {
  Object.keys(players).forEach(function (id) {
    // me:
    if (players[id].playerId === socket.id) {
      // create an asset for the main player
      if(activePlayers.indexOf(socket.id) === -1) {
        // console.log("adding main player");
        // addPlayer(players[id]);
        player = new Player (players[id].x, players[id].y, players[id].isFacing, players[id].playerId, true);
        // push player (mainPlayer) instance to activePlayers array
        activePlayers.push(player);
        // create mainPlayer element 
        player.createElement();
      }
      // or them:
    } else {
      // otherwise, create an other player
      if(activePlayers.indexOf(socket.id) === -1) {
        // console.log("adding other player");
        // addOtherPlayers(players[id]);
        let guestPlayer = new Player (players[id].x, players[id].y, players[id].isFacing, players[id].playerId, false);
        // push player (mainPlayer) instance to activePlayers array
        activePlayers.push(guestPlayer);
        // create mainPlayer element 
        guestPlayer.createElement();
      }
    }
  });
  // console.log(activePlayers);
});
socket.on('newPlayer', function (playerInfo) {
  console.log("A new player has joined");
  // addOtherPlayers(playerInfo);
  let guestPlayer = new Player (playerInfo.x, playerInfo.y, playerInfo.isFacing, playerInfo.playerId, false);
  // push player (mainPlayer) instance to activePlayers array
  activePlayers.push(guestPlayer);
  // create mainPlayer element 
  guestPlayer.createElement();
});
socket.on('playerMoved', function (playerInfo) {
  // console.log("a player moved");

  // console.log('delete this: ', players[i].playerId.indexOf(socket.id));
  let movedPlayer = activePlayers.find(player => player.playerId === playerInfo.playerId);
  // console.log(movedPlayer);

  movedPlayer.posX = playerInfo.x;
  movedPlayer.posY = playerInfo.y;

  movedPlayer.updatePosition();
});

socket.on('playerToFace', function (playerInfo) {
  let playerTurned = activePlayers.find(player => player.playerId === playerInfo.playerId);

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

socket.on('plantFlowers', function (flowerInfo) {
  for(let i=0; i < numOfFlowers; i++) {
    // console.log(flowerInfo[i].x, flowerInfo[i].y);
    let flower = new Flower (flowerInfo[i].elmId, flowerInfo[i].x, flowerInfo[i].y, flowerInfo[i].isPicked);

    activeFlowers.push(flower);
    // create mainPlayer element 
    flower.createElement();
  }
});
socket.on('disconnectUser', function (playerId) {
    // remove the div element of the disconnected player
    let el = document.getElementById(playerId);
    // console.log(el);
    el.remove(gameMap);

    console.log(activePlayers);
    for(let i = 0; i < activePlayers.length; i++) {
      // console.log('delete this: ', players[i].playerId.indexOf(socket.id));
      let disconnectedPlayer = activePlayers[i].playerId.indexOf(socket.id);
      activePlayers.splice(disconnectedPlayer, 1);
    }

    console.log("A player has left the game");
});





















