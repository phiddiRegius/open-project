// game.js ¯\_(ツ)_/¯

// GLOBAL 
// let debug = true;

// let player;
let gameIsStarted = false;

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
let mapWidth = 400;
let mapHeight = 400;
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

// play game

window.onkeydown = function (e) {
  let player = mainPlayerInstance;
  // const keyCode = event.key;
  e.preventDefault();
if(gameIsStarted === true) {
  switch (e.keyCode) {
    case 37: // left arrow
      if (player.currentDirection === 'left') {
        //player.stepLeft();
        player.step();
      } else {
        player.setFacingDirection('left');
      }
      break;
    case 38: // up arrow
      if (player.currentDirection === 'up') {
        // player.stepUp();
        player.step();
      } else {
        player.setFacingDirection('up');
      }
      break;
    case 39: // right arrow
      if (player.currentDirection === 'right') {
        // player.stepRight();
        player.step();
      } else {
        player.setFacingDirection('right');
      }
      break;
    case 40: // down arrow
      if (player.currentDirection === 'down') {
        // player.stepDown();
        player.step();
      } else {
        player.setFacingDirection('down');
      }
      break;
  }
}
};

let socket = io();
mainContainer.append(startMenu, gameMap);

startButton.addEventListener('click', () => {
  if (activePlayers.length === 5) {
    console.log("max players");
  } else {
    socket.emit('startGame');
    document.body.classList.add('gameIsStarted');
    startButton.style.display = "none";
    gameIsStarted = true;
  }
});

// gameAssets superclass => environment
// worldObjects & gameSprites
// worldObjects => things in environment
// gameSprites => characters in environment
  // **objectType param defines a thing OR player

class assetManager { // not implementing this yet... will be a mediator for behaviors and interactions
  constructor() {
  }
}
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
    this.elm;
    //
    this.playerId;
    this.zIndex;
    this.isVisible;
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
  setZIndex() {
    let colliderToe = this.posY - this.height;
    let z = 1 + Math.floor(((colliderToe - 1) / mapHeight) *99);
    this.elm.style.zIndex = z;
  }
  updatePosition() {
    this.setZIndex();
    if (this.elm) {
      this.elm.style.left = `${this.posX}px`;
      this.elm.style.top = `${this.posY}px`;
    }
  }
  isColliding(nextStepX, nextStepY) {
    // Check if the player is WITHIN the bounds of the game map
    if (nextStepX >= 0 && nextStepX < mapWidth - this.width && nextStepY >= 0 && nextStepY < mapHeight - this.height) {
      // Check for collisions with all assets
      for (let i = 0; i < gameAsset.instances.length; i++) { //loop
        let asset = gameAsset.instances[i]; 
        // if (asset !== this && asset.collidable) { // not me and is collidable
        //   if ((nextStepX + this.colliderFoot.offsetWidth > asset.posX && nextStepX < asset.posX + asset.width) && 
        //       (nextStepY + this.colliderFoot.offsetHeight > asset.posY && nextStepY < asset.posY + asset.height)) {
        //     return true; // colliding 
        //   }
        // }
        //   let assetToe = asset.posY + asset.height;
        //   let playerToe = nextStepY + this.colliderFoot.offsetHeight;
        //   if (nextStepX + this.colliderFoot.offsetWidth > asset.posX && nextStepX < asset.posX + asset.width &&
        //     playerToe > asset.posY && nextStepY < assetToe) {
        //     return true; // colliding
        //   }
        if (asset !== this && asset.collidable) {
          let assetFootX = asset.posX + asset.colliderFoot.offsetLeft;
          let assetFootY = asset.posY + asset.colliderFoot.offsetTop;
          let playerFootX = nextStepX + this.colliderFoot.offsetLeft;
          let playerFootY = nextStepY + this.colliderFoot.offsetTop;
          if (playerFootX + this.colliderFoot.offsetWidth > assetFootX && playerFootX < assetFootX + asset.colliderFoot.offsetWidth &&
              playerFootY + this.colliderFoot.offsetHeight > assetFootY && playerFootY < assetFootY + asset.colliderFoot.offsetHeight) {
            return true; // colliding
          }
        }
      }
      return false; // !isColliding
    } else {
      // player outside map bounds
      return true;
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

    let elm = elementCreator();
    elm.style.left = `${this.posX}px`;
    elm.style.top = `${this.posY}px`;
    elm.style.width = `${this.width}px`;
    elm.style.height = `${this.height}px`;
    this.elm = elm;

    this.colliderFoot = document.createElement('div');
    this.colliderFoot.classList.add("colliderFoot");
    this.colliderFoot.style.width = `${this.width}px`;
    this.colliderFoot.style.height = `${this.height * 0.25}px`;

 if (className === "mainPlayer" || className === "guestPlayer") {
    elm.setAttribute("id", this.playerId);
    elm.innerHTML = `<p class="debugTag">${this.playerId}</p>`;
  } else {
    elm.innerHTML = `<p class="debugTag">${this.elmId}</p>`;
  }

  this.updatePosition();
  gameMap.append(elm);
  elm.append(this.colliderFoot);

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
    this.playerId = playerElm.id; 
    console.log
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
    this.isCollectable = true;
  }
  collectWorldItem() {
    if (this.isCollectable && this.isColliding(posX, posY)) {
      // Remove the item from the game world
  
      // console.log(`Picked up ${this.objectType}!`);
    }
  }
}
class gameSprite extends gameAsset {
  constructor(objectType, elmId, posX, posY, width, height, currentDirection) {
    super(objectType, elmId, posX, posY, width, height, currentDirection);
    // this.velocity;
    this.inventory = [];
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
  step() {
    let nextStepX = this.posX;
    let nextStepY = this.posY;
    if (this.faceLeft) {
      nextStepX -= this.velocity;
    } else if (this.faceRight) {
      nextStepX += this.velocity;
    } else if (this.faceUp) {
      nextStepY -= this.velocity;
    } else if (this.faceDown) {
      nextStepY += this.velocity;
    }
    if (!this.isColliding(nextStepX, nextStepY)) {
      this.posX = nextStepX;
      this.posY = nextStepY;
      this.updatePosition();
      this.updateServerPosition();
      this.moveTrain();
    } else {
        // stuff for moving if the dist is less than this.velocity but greater than 0
    }
  }
}
class pathFinderSprite extends gameSprite {
  
}
class mainPlayer extends gameSprite {
  static instances
  constructor(objectType, elmId, posX, posY, width, height) {
    super(objectType, elmId, posX, posY, width, height);
    this.maxInventory = 5;
    this.velocity = 5;
    this.staticSprite;
    // this.displayFlowerTrain();
    //
    this.initialPos = 10;
    this.flwrDisplayWidth = 10;
    this.flwrDisplayHeight = 10;
  }
  getElm() {
    return document.getElementById(this.playerId);
  }
  addFlower(flower) {
    if (this.inventory.length < this.maxInventory) {
      this.inventory.push(flower);
      // this.displayFlowerTrain();
    }
  }
  // moveTrain() {
  //   this.flowerTrain.style.width = `${this.flwrDisplayWidth}px`;
  //   this.flowerTrain.style.height = `${this.flwrDisplayHeight}px`;
  //   console.log(this.flwrDisplayWidth, this.flwrDisplayHeight);
  //   if (this.currentDirection === 'up') {
  //     console.log("Player is walking up")
  //     this.flowerTrain.style.left = `${this.posX - this.flwrDisplayWidth/2 + this.width/2}px`;
  //     this.flowerTrain.style.top = `${this.posY + this.height + this.initialPos}px`;
  //   } 
  // }
  // // displayFlowerTrain() {
  // //   this.flowerTrain = document.createElement('div');
  // //   this.flowerTrain.classList.add("flowerTrain");

  // //   this.flowerTrain.style.width = `${this.flwrDisplayWidth}px`;
  // //   this.flowerTrain.style.height = `${this.flwrDisplayHeight}px`;

  // //   this.flowerTrain.style.left = `${this.posX - this.flwrDisplayWidth/2 + this.width/2}px`;
  // //   this.flowerTrain.style.top = `${this.posY + this.height - 15 - this.initialPos}px`;

  // //   gameMap.append(this.flowerTrain);


  // //   for(let i=0; i < this.maxInventory; i++) {
  // //     let flwrFollower = document.createElement('div');
  // //       flwrFollower.classList.add('flowerFollower');

  // //       flwrFollower.style.width = `${this.flwrDisplayWidth}px`;
  // //       flwrFollower.style.height = `${this.flwrDisplayHeight}px`;

  // //       let followerOffset = 15;
  // //       flwrFollower.forEach((follower, index) => {
  // //         follower.style.left = `${this.posX - this.flwrDisplayWidth/2 + this.width/2}px`;
  // //         follower.style.top = `${this.posY + this.height - followerOffset}px`;
  // //         followerOffset += 15;
  // //       });

  // //   gameMap.append(flwrFollower);
  // // }
  // displayFlowerTrain() {
  //   this.flowerTrain = document.createElement('div');
  //   this.flowerTrain.classList.add("flowerTrain");
  
  //   this.flowerTrain.style.width = `${this.flwrDisplayWidth}px`;
  //   this.flowerTrain.style.height = `${this.flwrDisplayHeight}px`;
  
  //   // Set initial position of the leader flower
  //   this.flowerTrain.style.left = `${this.posX - this.flwrDisplayWidth/2 + this.width/2}px`;
  //   this.flowerTrain.style.top = `${this.posY + this.height - 15 - this.initialPos}px`;
  
  //   gameMap.append(this.flowerTrain);
  
  //   let followerOffset = 15;
  
  //   // Create and position the follower flowers
  //   for (let i = 0; i < this.maxInventory; i++) {
  //     let flwrFollower = document.createElement('div');
  //     flwrFollower.classList.add('flowerFollower');
  
  //     flwrFollower.style.width = `${this.flwrDisplayWidth}px`;
  //     flwrFollower.style.height = `${this.flwrDisplayHeight}px`;
  
  //     // Set the position of each follower flower based on the position of the leader flower
  //     flwrFollower.style.left = `${this.posX - this.flwrDisplayWidth/2 + this.width/2}px`;
  //     flwrFollower.style.top = `${this.posY + this.height - followerOffset}px`;
  
  //     // Increase the offset for the next follower
  //     followerOffset += 15;
  
  //     gameMap.append(flwrFollower);
  //   }
  // }
  updatePosition() {
    this.setZIndex();
    this.elm.style.left = `${this.posX}px`;
    this.elm.style.top = `${this.posY}px`;
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

        if(objectType == 'staticSprite') {
          let staticSprite = new staticSpriteObject(objectType, elmId, posX, posY, width, height);
            staticSprite.createElement();
            gameObjects.push(staticSprite);
        } if(objectType == 'flower') {
          let flower = new worldItem(objectType, elmId, posX, posY, width, height);
            flower.createElement();
            gameObjects.push(flower);
        }
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
            // mainPlayerInstance.displayFlowerTrain();

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

  // socket.on('playerToFace', function (playerInfo) {

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




