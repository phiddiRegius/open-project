// game.js ¯\_(ツ)_/¯

// GLOBAL 
// let debug = true;

// let player;
let mainPlayerInstance;
let guestPlayerInstance;
let sprite;
let el;

let gameObjects = [];
let gameSprites = [];
let activePlayers = [];

// gameAssets = gameAssets.concat(activePlayers);
// let gameAssets = [...sprites, ...npcSprites, ...activePlayers]; 
// let gameAssets = [];

let numOfSpriteElms = 5;
let minDist = 50;

// DIV ELEMENTS
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

// DEBUG PANEL
// let debugToggle = document.createElement('input');
// debugToggle.setAttribute('type', 'checkbox');
// debugToggle.setAttribute('id', 'debugToggle');

// let debugLabel = document.createElement('label');
// debugLabel.setAttribute('for', 'debugToggle');
// debugLabel.innerHTML = 'Debug mode';

// let debugDiv = document.createElement('div');
// debugDiv.setAttribute('id', 'debugDiv');
// debugDiv.append(debugToggle, debugLabel);

// let root = document.documentElement;
// debugToggle.addEventListener('change', () => {
//   if (debugToggle.checked) {
//     root.style.setProperty('--display', 'block');
//   } else {
//     root.style.setProperty('--display', 'none');
//   }
// });

startMenu.append(startButton);

let gameMap = document.createElement('div');
  gameMap.setAttribute('id', 'gameMap');
  gameMap.style.width = `${mapWidth}px`;
  gameMap.style.height = `${mapHeight}px`;

// KEY VARS
const leftKey = "ArrowLeft";
const rightKey = "ArrowRight";
const upKey = "ArrowUp";
const downKey = "ArrowDown";

// window.onkeydown = function(event) {
//   let player = mainPlayerInstance;
//   const keyCode = event.key;
//   event.preventDefault();

//   if (keyCode === leftKey) {
//     player.setFacingDirection('left');
//     if (faceLeft) {
//       player.stepLeft();
//     }
//   } else if (keyCode === rightKey) {
//     player.setFacingDirection('right');
//     if (faceRight) {
//       player.stepRight();
//     }
//   } else if (keyCode === upKey) {
//     player.setFacingDirection('up');
//     if (faceUp) {
//       player.stepUp();
//     }
//   } else if (keyCode === downKey) {
//     player.setFacingDirection('down');
//     if (faceDown) {
//       player.stepDown();
//     }
//   }
// };

// play game

window.onkeydown = function (e) {
  let player = mainPlayerInstance;
  // const keyCode = event.key;

  switch (e.keyCode) {
    case 37: // left arrow
      if (player.currentDirection === 'left') {
        player.stepLeft();
      } else {
        player.setFacingDirection('left');
      }
      break;
    case 38: // up arrow
      if (player.currentDirection === 'up') {
        player.stepUp();
      } else {
        player.setFacingDirection('up');
      }
      break;
    case 39: // right arrow
      if (player.currentDirection === 'right') {
        player.stepRight();
      } else {
        player.setFacingDirection('right');
      }
      break;
    case 40: // down arrow
      if (player.currentDirection === 'down') {
        player.stepDown();
      } else {
        player.setFacingDirection('down');
      }
      break;
  }
};


let socket = io();
mainContainer.append(startMenu, gameMap);

startButton.addEventListener('click', () => {
  if (activePlayers.length === 5) {
    console.log("max players");
  } else {
    socket.emit('startGame');
    startButton.style.display = "none";
  }
});

// gameAssets superclass => environment
// worldObjects & gameSprites
// worldObjects => things in environment
// gameSprites => characters in environment
  // **objectType param defines a thing OR player

class gameAsset {
  static instances = [];
  constructor(objectType, elmId, posX, posY, width, height) {
    // this.elm = document.getElementById(elmId);
    this.objectType = objectType;
    this.elmId = elmId;
    this.posX = posX;
    this.posY = posY;
    this.width = width;
    this.height = height;
    //
    this.playerId;
    this.collidable = true;
    this.currentDirection = 'down';
    this.faceLeft = false;
    this.faceRight = false;
    this.faceUp = false;
    this.faceDown = true;

    gameAsset.instances.push(this);
  }
  static delete(instance) {
    let index = gameAsset.instances.indexOf(instance);
    if (index !== -1) {
      gameAsset.instances.splice(index, 1);
      gameSprite.instances.splice(index, 1);
    }
  }
  updatePosition() {
    if (this.elm) {
      this.elm.style.left = `${this.posX}px`;
      this.elm.style.top = `${this.posY}px`;
    }
  }
  createElement() {
    const elementCreators = {
      worldObject: () => this.createObject("world"),
      interactiveObject: () => this.createObject("interactive"),
      staticSpriteObject: () => this.createObject("staticSprite"),
      worldItem: () => this.createItem(),
      gameSprite: () => this.createGameSprite(),
      mainPlayer: () => this.createPlayer("main"),
      guestPlayer: () => this.createPlayer("guest")
    };
    const className = this.constructor.name;
    const elementCreator = elementCreators[className];

    if (!elementCreator) {
      throw new Error("Invalid class");
    }

    const elm = elementCreator();
    elm.style.left = `${this.posX}px`;
    elm.style.top = `${this.posY}px`;
    elm.style.width = `${this.width}px`;
    elm.style.height = `${this.height}px`;
    this.elm = elm;

 if (className === "mainPlayer" || className === "guestPlayer") {
    elm.setAttribute("id", this.playerId);
    elm.innerHTML = `<p class="debugTag">${this.playerId}</p>`;
  } else {
    elm.innerHTML = `<p class="debugTag">${this.elmId}</p>`;
  }

  this.updatePosition();
  gameMap.append(elm);

    return elm;
  }
  getElm() {
    return document.getElementById(this.elmId);
  }
  removeElm() {
    const elm = this.getElm();
    if (elm) {
      elm.remove();
    }
  }
  createObject(type) {
    let worldObjectElm = document.createElement("div");
    worldObjectElm.classList.add("worldObject");
    worldObjectElm.classList.add(type + "Object");
    return worldObjectElm;
  }
  createItem() {
    let itemElm = document.createElement("div");
    itemElm.classList.add("item");
    return itemElm;
  }
  createGameSprite() {
    let gameSpriteElm = document.createElement("div");
    gameSpriteElm.classList.add("game-sprite");
    return gameSpriteElm;
  }
  createPlayer(type) {
    let playerElm = document.createElement("div");
    // this.elmId = this.playerId;
    playerElm.id = this.playerId;
    playerElm.classList.add(type + "Player");
    this.playerId = playerElm.id; // Assign the playerId to this
    return playerElm;
  }
}
class worldObject extends gameAsset {
  constructor(objectType, elmId, posX, posY, width, height) {
    super(objectType, elmId, posX, posY, width, height);
    //
    
  }
}
class interactiveObject extends worldObject {
  constructor(objectType, elmId, posX, posY, width, height) {
    super(objectType, elmId, posX, posY, width, height);
    //
  
  }
}
class staticSpriteObject extends interactiveObject {
  constructor(objectType, elmId, posX, posY, width, height) {
    super(objectType, elmId, posX, posY, width, height);
  }
}
class worldItem extends worldObject {
  constructor(objectType, elmId, posX, posY, width, height) {
    super(objectType, elmId, posX, posY, width, height);

  }

}
class gameSprite extends gameAsset {
  constructor(objectType, elmId, posX, posY, width, height, currentDirection) {
    super(objectType, elmId, posX, posY, width, height, currentDirection);
    // this.velocity;
  }
  updateServerPosition() {
    socket.emit('playerMovement', { playerId: this.playerId, x: this.posX, y: this.posY, direction: this.currentDirection });
  }
  setFacingDirection(direction) {
    this.faceLeft = direction === 'left';
    this.faceRight = direction === 'right';
    this.faceUp = direction === 'up';
    this.faceDown = direction === 'down';
    
    this.currentDirection = direction;
    // this.updateServerPosition();
  }
  turnFace() {
    if (this.faceUp) {
    } else if (this.faceDown) {
    } else if (this.faceLeft) {
    } else if (this.faceRight) {
    }
  }
  stepLeft() {
    let nextStepX = this.posX - this.velocity;
    if (!this.isColliding(nextStepX, this.posY)) {
      this.posX = nextStepX;
      this.updatePosition();
      this.updateServerPosition();
    }
  }
  stepRight() {
    let nextStepX = this.posX + this.velocity;
    if (!this.isColliding(nextStepX, this.posY)) {
      this.posX = nextStepX;
      this.updatePosition();
      this.updateServerPosition();
    }
  }
  stepUp() {
    let nextStepY = this.posY - this.velocity;
    if (!this.isColliding(this.posX, nextStepY)) {
      this.posY = nextStepY;
      this.updatePosition();
      this.updateServerPosition();
    }
  }
  stepDown() {
    let nextStepY = this.posY + this.velocity;
    if (!this.isColliding(this.posX, nextStepY)) {
      this.posY = nextStepY;
      this.updatePosition();
      this.updateServerPosition();
    }
  }
}
class mainPlayer extends gameSprite {
  static instances
  constructor(objectType, elmId, posX, posY, width, height) {
    super(objectType, elmId, posX, posY, width, height);
    this.velocity = 5;
    this.staticSprite;
  }
  getElm() {
    return document.getElementById(this.playerId);
  }
  updatePosition() {
    this.elm.style.left = `${this.posX}px`;
    this.elm.style.top = `${this.posY}px`;
    // gameMap.style.left = `${- this.posX}px`;
    // gameMap.style.top = `${- this.posY}px`;
    // console.log(gameMap.style.left, gameMap.style.top);
  }
  isColliding(nextStepX, nextStepY) {
    // Check if the player is within the bounds of the game map
    if (nextStepX >= 0 && nextStepX < mapWidth - this.width && nextStepY >= 0 && nextStepY < mapHeight - this.height) {
      // Check for collisions with other game asset instances
      for (let i = 0; i < gameAsset.instances.length; i++) {
        const asset = gameAsset.instances[i];
        if (asset !== this && asset.collidable) {
          if ((nextStepX + this.width > asset.posX && nextStepX < asset.posX + asset.width) && 
              (nextStepY + this.height > asset.posY && nextStepY < asset.posY + asset.height)) {
            return true; // Collision detected
          }
        }
      }
      // !isColliding
      return false;
    } else {
      // p => outside map bounds
      return true;
    }
  }
}
class guestPlayer extends mainPlayer {
  constructor(objectType, elmId, posX, posY, width, height) {
    super(objectType, elmId, posX, posY, width, height);
  }
}

// console.log(gameAsset.instances);

socket.on('gameObjects', function (objectInfo) {
  objectInfo.forEach((info) => {
        let { objectType, elmId, posX, posY, width, height } = info; // deconstruct objectInfo
        let newObject = new staticSpriteObject(objectType, elmId, posX, posY, width, height);
        newObject.createElement();
        
        // sprite.createElement();
        gameObjects.push(newObject);
    });
  });
  socket.on('playerId', function(playerId) {
    console.log(`Received ${playerId} from server`);
  });
  socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (playerId) { // loop through players
      console.log(playerId);
      // Is me?
      if (players[playerId].socketId == socket.id) {
        // If the player => active players: skip
        let existingPlayerIndex = activePlayers.findIndex(player => player.playerId == playerId);
        if (existingPlayerIndex >= 0) {
          return;
        }
        console.log(`Adding mainPlayer-${playerId} to activePlayers`);
          let assignedSprite = gameObjects.find(staticSprite => staticSprite.elmId == players[playerId].elmId);
            // console.log(assignedSprite); // check if param values are correct for the assigned'static'Sprite 
          mainPlayerInstance = new mainPlayer('player', assignedSprite.elmId,  players[playerId].posX,  players[playerId].posY, assignedSprite.width, assignedSprite.height);
            mainPlayerInstance.playerId = playerId
            mainPlayerInstance.createElement();
            mainPlayerInstance.updatePosition();  
              

            activePlayers.push(mainPlayerInstance);
            console.log(assignedSprite);
            // assignedSprite.removeElm(assignedSprite.elmId);
            assignedSprite.elm.style.display = 'none';
            assignedSprite.collidable = false;
            // console.log(mainPlayerInstance instanceof mainPlayer); // check if mPI is a mainPlayer instance
            // console.log(gameAsset.instances); 
      } else {
        // Otherwise, create a new Player object for another player
        let existingPlayerIndex = activePlayers.findIndex(player => player.playerId === playerId);
        if (existingPlayerIndex >= 0) {
          return;
        }
        console.log(`Adding guestPlayer-${playerId} to activePlayers`);
        let assignedSprite = gameObjects.find(staticSprite => staticSprite.elmId == players[playerId].elmId);
            // console.log(assignedSprite); // check if parameter values are correct for the assigned'static'Sprite 
          guestPlayerInstance = new guestPlayer('player', assignedSprite.elmId,  players[playerId].posX,  players[playerId].posY, assignedSprite.width, assignedSprite.height);
            guestPlayerInstance.playerId = playerId;
              guestPlayerInstance.createElement();

            activePlayers.push(guestPlayerInstance);
            // assignedSprite.removeElm(assignedSprite.elmId);
            assignedSprite.elm.style.display = 'none';
            assignedSprite.collidable = false;
            
            // console.log(guestPlayerInstance instanceof guestPlayer); // check if gPI is a guestPlayer instance
            // console.log(gameAsset.instances); 
      }
    });
  });
  socket.on('newPlayer', function (playerInfo) {
    let existingPlayerIndex = activePlayers.findIndex(player => player.playerId === playerInfo.playerId);
    if (existingPlayerIndex >= 0) {
      return;
    }
    console.log(`Adding guestPlayer-${playerInfo.playerId} to activePlayers`);
    let assignedSprite = gameObjects.find(staticSprite => staticSprite.elmId == playerInfo.elmId);
  
    guestPlayerInstance = new guestPlayer('player', assignedSprite.elmId, playerInfo.posX, playerInfo.posY, assignedSprite.width, assignedSprite.height);
    guestPlayerInstance.playerId = playerInfo.playerId;
    guestPlayerInstance.createElement();
  
    activePlayers.push(guestPlayerInstance);
    assignedSprite.elm.style.display = 'none';
    assignedSprite.collidable = false;
  });

  // socket.on('playerToFace', function (playerInfo) {
  //   let playerTurned = activePlayers.find(player => player.objectType == playerInfo.playerId);
  //     playerTurned.isFacing = playerInfo.isFacing;
  
  //   if(playerInfo.isFacing == "right") {
  //     playerTurned.isFacingRight();
  //   } else if(playerInfo.isFacing == "left") {
  //     playerTurned.isFacingLeft();
  //   } else if(playerInfo.isFacing == "up") {
  //     playerTurned.isFacingUp();
  //   } else if(playerInfo.isFacing == "down") {
  //     playerTurned.isFacingDown();
  //   }
  
  // });
  socket.on('playerMoved', function (playerInfo) {
      // console.log(playerInfo.posX, playerInfo.posY);
    let movedPlayer = activePlayers.find(player => player.playerId === playerInfo.playerId);
    //  console.log(movedPlayer);
      // if (!movedPlayer) { // return from fn() => false
      //   return;
      // }
      // console.log("before updating movement: ", movedPlayer.posX, movedPlayer.posY);
      // returning undefined
      movedPlayer.posX = playerInfo.posX;
      movedPlayer.posY = playerInfo.posY;
      // movedPlayer.currentDirection = playerInfo.direction;
      // console.log("after updating movement: ", movedPlayer.posX, movedPlayer.posY);
      movedPlayer.updatePosition();
  });

  socket.on('disconnectUser', function (playerId) {
    let playerIndex = activePlayers.findIndex(player => player.playerId === playerId);
    if (playerIndex === -1) {
      console.log("No player to remove");
      return;
    }
    let disconnectedPlayer = activePlayers[playerIndex];
    // let assignedSprite = document.getElementById(disconnectedPlayer.elmId);

      activePlayers.splice(playerIndex, 1);

    let gameAssetInstance = gameAsset.instances.find(asset => asset.playerId === playerId);
      if (gameAssetInstance) {
        console.log(gameAssetInstance);

        let assignedSprite = gameObjects.find(staticSprite => staticSprite.elmId == disconnectedPlayer.elmId);
        // console.log(assignedSprite);
          assignedSprite.posX = gameAssetInstance.posX;
          assignedSprite.posY = gameAssetInstance.posY;
          assignedSprite.updatePosition();
          assignedSprite.elm.style.display = 'block';

        gameAsset.delete(gameAssetInstance)
        gameAssetInstance.removeElm(gameMap);
      }
    console.log(`${playerId} has disconnected`);
  });




