// game.js

let mapWidth = 300;
let mapHeight = 300;

let numOfSpriteElms = 5;
let minDist = 50;

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

let player; 

let activePlayers = [];
let spriteElm = [];
let activeObjects = [];

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

function randomPosition() {
  let random = parseInt( (50 + Math.random()*200) );
  // let random = parseInt( (50 + Math.random()*100) );

  return random
}

// play game
let socket = io();

mainContainer.append(startMenu, gameMap);

startButton.addEventListener('click', () => {
  if(spriteElm.length === 0) {
    console.log("max players")
  } else {
    socket.emit('startGame');
    startButton.style.display = "none";
  }
});

  // Game Objects & Players
class Sprite {
  constructor(elmId, posX, posY) {
    this.elmId = elmId;
    this.posX = posX;
    this.posY = posY;
    this.width = 24;
    this.height = 36;
    this.elm;
  }
  createElement() {
    this.elm = document.createElement('div');
      this.elm.setAttribute('class', 'inactivePlayer');
      this.elm.id =  this.elmId;

      this.elm.style.width = this.width + 'px';
      this.elm.style.height = this.height + 'px';

      this.elm.style.left = this.posX + 'px';
      this.elm.style.top = this.posY  + 'px';

      // append inactive player element to the map
      gameMap.append(this.elm);

      //name tag for debug tracking
      let nameTag = document.createElement("p");
      nameTag.innerHTML = this.elmId;
      this.elm.append(nameTag);
  }
}
  // [1A] Receives element locations from server
  socket.on('npcElements', function (npcInfo) {
      for(let i = 0; i < npcInfo.length; i++) {
        // if(npcInfo[i].isActive === false) {
          // generate
          npcElm = new Sprite (npcInfo[i].elmId, npcInfo[i].posX, npcInfo[i].posY);
          npcElm.createElement();

          spriteElm.push(npcElm);
        // }
      }
  });

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
        this.width = 24;
        this.height = 36;
        this.elm; 
        // this.isActive;
        this.inventory = [];
        this.speed = 3; // # of px moved
    }
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
    createElement(){
      // if me....
      this.elm = document.createElement('div');
        if(this.isMe === true) {
          this.elm.setAttribute('class', 'mainPlayer');
        // if not me...
        } else {
          this.elm.setAttribute('class', 'otherPlayer');
        }
        this.elm.id = this.playerId;
        
        this.elm.style.width = this.width + 'px';
        this.elm.style.height = this.height + 'px';

        // append main player to the map
        gameMap.append(this.elm)

        // player background image
        // this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionFront.png)';
      
        this.updatePosition();

        // name tag for debug tracking elements
          let nameTag = document.createElement("p");
          nameTag.innerHTML = this.playerId;
          this.elm.append(nameTag)
    }
  };
    // [1B] Receives current players from server
    socket.on('currentPlayers', function (players) {
      console.log('players received: ', players);
      Object.keys(players).forEach(function (id) {
        // me:
        if (players[id].playerId === socket.id) {
          // create an asset for the main player
          if(activePlayers.indexOf(socket.id) === -1) {
            console.log("adding main player");
            // Player(Div Elemenet Id, Player's socket.id, X, Y, facing, is.me = true)
            player = new Player (players[id].elmId, players[id].playerId, spriteElm[0].posX, spriteElm[0].posY, "down", true);
            

            // remove the activated npc element from array & game map
            let el = document.getElementById(spriteElm[0].elmId);
              el.remove(gameMap);
              spriteElm.splice(spriteElm[0], 1);
            
            // create element and push to activePlayers array
            player.createElement();
            activePlayers.push(player);

            console.log(players[id].playerId + ' added to ', activePlayers);
            console.log('npc elements: ', spriteElm);
          }
          // or them:
        } else {
          // otherwise, create an other player
          console.log('is this ' + players[id].playerId + ' in this: ', activePlayers);
          console.log(activePlayers.indexOf(players[id].playerId));

          if(activePlayers.indexOf(socket.id) === -1) {
            console.log("adding other player on currentPlayers");

            player = new Player (players[id].elmId, players[id].playerId, spriteElm[0].posX, spriteElm[0].posY, "down", false);

            // emit activated npc element 'player' to server
            // socket.emit('activateNPC', player);

            // remove the activated npc element from array & game map
            let el = document.getElementById(spriteElm[0].elmId);
              el.remove(gameMap);
              spriteElm.splice(spriteElm[0], 1);

            player.createElement();
            activePlayers.push(player);

            console.log('active players: ', activePlayers);
            console.log('inactive players: ', spriteElm);
          }
        }
      });
    });

     socket.on('newPlayer', function (playerInfo) {
     });


    // socket.on('newPlayer', function (playerInfo) {
    //   console.log("A new player has joined");
    //   // console log received information
    //   console.log(playerInfo.Id, playerInfo.Elm);

    //   let inactiveElm = playerInfo.Elm;
    
    //   let player = new Player (inactiveElm.elmId, playerInfo.Id, inactiveElm.posX, inactiveElm.posY, "down", false);

    //   player.createElement();
    //   activePlayers.push(player);
      
    //   let el = document.getElementById(inactiveElm.elmId);
    //     el.remove(gameMap);
    //     spriteElm.splice(playerInfo.elmId, 1);

    //   console.log('active players on newPlayer: ', activePlayers);
    //   console.log('inactive players on newPlayer: ', spriteElm);
    // });

    socket.on('playerMoved', function (playerInfo) {
      // console.log("a player moved");

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

    socket.on('disconnectUser', function (playerId) {
      // remove the div element of the disconnected player
      if(activePlayers.indexOf(playerId) === -1) {
        console.log('No player to remove'); 
      } else {
        let el = document.getElementById(playerId);
          el.remove(gameMap);

        for(let i = 0; i < activePlayers.length; i++) {
          // console.log('delete this: ', players[i].playerId.indexOf(socket.id));
          let disconnectedPlayer = activePlayers[i].playerId.indexOf(socket.id);
            activePlayers.splice(disconnectedPlayer, 1);
        }
        console.log("A player has left the game");
      }
    });




