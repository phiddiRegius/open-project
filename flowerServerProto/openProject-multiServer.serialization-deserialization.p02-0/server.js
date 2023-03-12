const express = require('express');
const app = express();
const http = require('http');
const { emit } = require('process');
const server = http.createServer(app);
const { Server } = require("socket.io");
// const { Server } = require("socket.io");
const { v4: uuidv4 } = require('uuid');
const io = new Server(server);

const port = process.env.PORT;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

players = {};
// let gameAssets = [];

let gameObjects = [];
let gameSprites = [];
let flowers = [];
// let worldObjects = [];
// let gameAssets = [...gameObjects, ...flowers]; 
// let gameAssets = [...gameObjects]; 

let numOfStaticSprites = 5;
let numOfGameObjects = 5;
let numOfFlowers = 5;

let mapWidth = 400;
let mapHeight = 400;
let minDist = 20;

 /**
 * numOfGameAssets => javaScript 'touples' that pairs an objectType with the quantity of objects to be generated
 */
 function randomPosition(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function generateRandomCoordinates(numOfInstances, mapWidth) {
  let coordinates = [];
  for(let i = 0; i < numOfInstances; i++) {
    let x = Math.floor(Math.random() * (mapWidth - 100) + 50);
    let y = Math.floor(Math.random() * (mapWidth - 100) + 50);
    coordinates.push([x, y]);
  }
  return coordinates;
}

let numOfGameAssets = [
  ['staticSprite', 6], 
  ['enemySprite', 3],
  ['flower', 10],
];

let coordinates = {};
for (let [objectType, numOfInstances] of numOfGameAssets) {
  coordinates[objectType] = generateRandomCoordinates(numOfInstances, mapWidth);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) { 
      let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
  }
  return array;
}

function getNewCoordinate() {
  let bestCoordinate = [];
  let bestDistance = -Infinity;
  let count = 0;
  
  while (true) {
    let currentCoordinate = [
      randomPosition(50, mapWidth - 50),
      randomPosition(50, mapHeight - 50)
    ];

    let currentDistance = Infinity;
    // let currentDistance = minDist;
    for (const asset of gameObjects) {
      let a = currentCoordinate[0] - asset.posX;
      let b = currentCoordinate[1] - asset.posY;
      let assetDistance = Math.sqrt(a * a + b * b);
      let assetCenterPointX = asset.posX + asset.width / 2;
      let assetCenterPointY = asset.posY + asset.height / 2;
      let assetRadius = Math.sqrt(asset.width * asset.width + asset.height * asset.height);
      let newMinDist = assetRadius / 2 + minDist;

      if (assetDistance < newMinDist) {
        currentDistance = newMinDist;
        break;
      }
      if (assetDistance < currentDistance) {
        currentDistance = assetDistance
      }
    }

    if (currentDistance >= minDist) {
      return currentCoordinate;
    }

    if (currentDistance > bestDistance) {
      bestDistance = currentDistance;
      bestCoordinate = currentCoordinate;
    }

    count++;
    if (count > 40) {
      console.log("Error: Coordinate <=> after 40 attempts");
      break;
    }
  }

  return bestCoordinate;
}

 
// for tracking if assets have already been generated
let gameAssetsInitialized = false;

class eventManager { // not implementing this yet... will be a mediator for behaviors and interactions
  constructor() {
  }
  static emit(eventName, eventData) {
    io.emit(eventName, eventData);
    // console.log('emitting things?')
  }
}

// for (let i = 0; i < numOfGameObjects; i++) { //flowerPots
//   let coordinate = getNewCoordinate();
//   // console.log(":", coordinate);

//   // let flowerPot = {
//   //   elmId: 'pot' + (i + 1),
//   //   objectType: 'staticSprite',
//   //   playerId: 'pot',
//   //   posX: coordinate[0],
//   //   posY: coordinate[1],
//   //   width: 24,
//   //   height: 36,
//   //   isStatic: true,
//   // };
//   let staticSprite = new staticSpriteObject(`staticSprite`, `pot${i+1}`, coordinate[0], coordinate[1], 24, 36);
//     staticSprite.createElement();
//     // gameObjects.push(staticSprite);
//     // gameObjects.push(flowerPot);
// }
// for (let i = 0; i < numOfGameObjects; i++) { // slugs
//   // let coordinate = getNewCoordinate();
//   // console.log(":", coordinate);

//   let slug = {
//     elmId: 'slug' + (i + 1),
//     objectType: 'enemySprite',
//     playerId: 'slug',
//     posX:  randomPosition(50, mapWidth - 50),
//     posY:  randomPosition(50, mapWidth - 50),
//     width: 24,
//     height: 36,
//   };
//   gameObjects.push(slug);
// }
// for (let i = 0; i < numOfFlowers; i++) { // flowers
  
//   // let coordinate = getNewCoordinate();
//   // console.log(":", coordinate);

//   // states: 
//     // 0: Seed
//     // 1: Sapling
//     // 2: Mature

//   let flower = {
//     elmId: "flwr" + (i + 1),
//     objectType: "flower",
//     posX:  randomPosition(50, mapWidth - 50), //randomPosition(50, 250),
//     posY:  randomPosition(50, mapWidth - 50), //randomPosition(50, 250),
//     width: 10,
//     height: 10,
//     isObject: true,
//     objectType: "flower",
//     // canInteract: true,
//     // inInventory: false,
//     state: 0,
//   };
//   gameObjects.push(flower);
// }

// console.log(sprites)
io.on('connection', function (socket) {
  const playerId = uuidv4();

  

  console.log('a user connected: ', playerId);
 /**
   * For each game asset, I defined an objectType and numOfInstances to be generated.
   * Each instance is pushed to the temp objectsToEmit array.
   * The array is emitted then cleared.
   */
  if (gameAssetsInitialized) {
    socket.emit('gameObjects', gameAsset.instances);
  } else {
    let objectsToEmit = [];
    for(let [objectType, numOfInstances, posX, posY] of numOfGameAssets) {
      let coordinate = generateRandomCoordinates(numOfInstances, mapWidth);

      switch (objectType) {
        case 'staticSprite':
          for (let i = 0; i < numOfInstances; i++) {
            let staticSprite = new staticSpriteObject(`staticSprite`, `pot${i+1}`, coordinate[i][0], coordinate[i][1], 24, 36);
            gameObjects.push(staticSprite);
          }
          break;
        case 'enemySprite':
          for (let i = 0; i < numOfInstances; i++) {
            let slug = new followerSprite(`enemySprite`, `slug${i+1}`, coordinate[i][0], coordinate[i][1], 24, 36);
            gameObjects.push(slug);
          }
          break;
        case 'flower':
          for (let i = 0; i < numOfInstances; i++) {
            let flower = new worldItem(`flower`, `flwr${i+1}`, coordinate[i][0], coordinate[i][1], 10, 10);
            gameObjects.push(flower);
          }
          break;
        default: 
          console.log(`I do not recognize the objectType: ${objectType}`)
        break;
      }
    }
    
    let gettingTargets = gameAsset.instances.filter(asset => asset.objectType == 'flower' ||  asset.objectType == 'player');
    console.log("Can assign these targets: ", gettingTargets);
    shuffleArray(gettingTargets); // so I dont have to randomize 
    console.log(gettingTargets);
  // socket.emit('assignTargets', gettingTargets);

    let gettingFollowers = gameAsset.instances.filter(asset => asset instanceof followerSprite);

    let numOfTargets = gettingTargets.length;
    let numOfFollowers = gettingFollowers.length;
    
    for (let i = 0; i < numOfFollowers; i++) {
      let targetIndex = i % numOfTargets;
      let target = gettingTargets[targetIndex];
      let follower = gettingFollowers[i];
      followerSprite.followTarget(follower, target);
    }

    // socket.emit('playerId', playerId);
    gameAssetsInitialized = true;
  }

  // emit the non-active player elements to the map
  // socket.emit('gameObjects', gameObjects);
  // let objectsToEmit = [];
  // for(let [objectType, numOfInstances, posX, posY] of numOfGameAssets) {
  //   // let coordinate = getNewCoordinate();
  //   let coordinate = coordinates[objectType];

  //   switch (objectType) {
  //     case 'staticSprite':
  //       for (let i = 0; i < numOfInstances; i++) {
  //         let staticSprite = new staticSpriteObject(`staticSprite`, `pot${i+1}`, coordinate[i][0], coordinate[i][1], 24, 36);
  //         objectsToEmit.push(staticSprite);
  //       }
  //       // console.dir(gameAsset.instances);
  //       socket.emit('gameObjects', objectsToEmit);
  //       objectsToEmit.length = 0;
  //       break;
  //     case 'enemySprite':
  //       for (let i = 0; i < numOfInstances; i++) {
  //         let slug = new followerSprite(`enemySprite`, `slug${i+1}`, coordinate[i][0], coordinate[i][1], 24, 36);
  //         objectsToEmit.push(slug);
  //       }
  //       // console.dir(gameAsset.instances);
  //       socket.emit('gameObjects', objectsToEmit);
  //       objectsToEmit.length = 0;
  //       break;
  //     case 'flower':
  //       for (let i = 0; i < numOfInstances; i++) {
  //         let flower = new worldItem(`flower`, `flwr${i+1}`, coordinate[i][0], coordinate[i][1], 10, 10);
  //         objectsToEmit.push(flower);
  //       }
  //       // console.dir(gameAsset.instances);
  //       socket.emit('gameObjects', objectsToEmit);
  //       objectsToEmit.length = 0;
  //       break;
  //     default: 
  //       console.log(`I do not recognize the objectType: ${objectType}`)
  //     break;
  //   }
  // }

  // emit current players to all users on the main page
  socket.emit('currentPlayers', players);

  socket.on('startGame', function () {
    shuffleArray(gameAsset.instances);
    
    // let staticSprite = gameAsset.instances.find(object => object.isStatic === true);
    //let staticSprite = gameAsset.instances.filter(asset => asset.objectType == 'staticSprite' && asset.isStatic === true).shift();
    let staticSprite = gameAsset.instances.filter(asset => asset.objectType == 'staticSprite' && asset.isStatic === true)[0];
      console.log("Loading this object:", staticSprite);

    players[playerId] = {
      // playerId: playerId,
      socketId: socket.id,
      playerId: playerId,
      elmId: staticSprite.elmId,
      posX: staticSprite.posX,
      posY: staticSprite.posY,
      currentDirection: 'down',
    };

    staticSprite.isStatic = false;
    staticSprite.playerId = playerId;

    //console.log(players);
  //   let gettingTargets = gameObjects.filter(object => object.objectType == 'flower' ||  object.objectType == 'player');
  // // console.log("Can assign these targets: ", gettingTargets);
  //     shuffleArray(gettingTargets); // so I dont have to randomize 
  //     console.log(gettingTargets);
  //     socket.emit('assignTargets', gettingTargets);

    // socket.emit('playerId', playerId);
    socket.emit('currentPlayers', players);
    socket.broadcast.emit('newPlayer', players[playerId]);
  })

  // socket.on('updateGameAssets', function (assets) {
  //   // console.log(`Receiving ${JSON.stringify(assets)}`);
  //   let parsedAssets = JSON.parse(assets);
  //     gameAsset.instances.push(...parsedAssets);
  //     console.log(gameAsset.instances); 
  // });

  socket.on('playerMovement', function (movementData) {
    // console.log('playerMovement: ', movementData);
    if (players[movementData.playerId]) {

      players[movementData.playerId].posX = movementData.x;
      players[movementData.playerId].posY = movementData.y;
      players[movementData.playerId].currentDirection = movementData.currentDirection;

      // console.log(players[movementData.playerId]);
      socket.broadcast.emit('playerMoved', players[movementData.playerId]);
    } else {
      console.log(`Error: ${movementData.playerId} is not a players object`);
    }
  });

  socket.on('worldItemCollected', function (itemData) { //NEED TO ADD PROPERTY FOR IF ISCOLLECTED 
    // console.log('collectedItem: ', itemData);
      socket.broadcast.emit('updateWorldItem', itemData);
  });

  socket.on('disconnect', function () {
    console.log('user disconnected: ', playerId);
    /**
     * The conditional statement below is to prevent the server from emitting when
     * a browser user has not joined the game, in which case, there would be
     * no element to remove. 
     */
    if(Object.keys(players).length > 0) { 
      // let getAssignedSprite = gameAsset.instances.find(assignedSprite => assignedSprite.playerId === playerId);
      // console.log(`Getting ${JSON.stringify(getAssignedSprite)} on disconnect`);

      let index = gameAsset.instances.findIndex(assignedSprite => assignedSprite.playerId === playerId);
        if (index !== -1) {
          console.log(`Getting ${JSON.stringify(gameAsset.instances[index])} on disconnect`);

          gameAsset.instances[index].posX = players[playerId].posX;
          gameAsset.instances[index].posY = players[playerId].posY;
          gameAsset.instances[index].playerId = 'pot';
          gameAsset.instances[index].isStatic = true;
        console.log(`Checking updated values for: ${JSON.stringify(gameAsset.instances[index])} on disconnect`);

        // io.emit('updateSprites', sprites);
        delete players[playerId];
        io.emit('disconnectUser', playerId);
      }
      // console.log(disconnectedPlayer);
    } else {
      delete players[playerId];
    }

    //   if(getAssignedSprite == undefined) {
    //     console.log("undefined");
    //   } else {
       
    //     getAssignedSprite.posX = players[playerId].posX;
    //     getAssignedSprite.posY = players[playerId].posY;
    //     getAssignedSprite.playerId = 'pot';
    //     getAssignedSprite.isStatic = true;

    //     console.log(`Checking updated values for: ${JSON.stringify(getAssignedSprite)} on disconnect`);

    //     // io.emit('updateSprites', sprites);
    //     delete players[playerId];
    //     io.emit('disconnectUser', playerId);
    //   }
    //   // console.log(disconnectedPlayer);
    // } else {
    //   delete players[playerId];
    // }
  });
});

// 3000 for local
// port for glitch
server.listen(3000, () => {
  console.log('listening on *:3000');
});

/**
 * gameAsset
 * 
 */
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
    this.colliderFoot;
    // this.elm;
    //
    this.playerId;
    // this.zIndex;
    // this.isVisible;
    this.collidable = true;
    // this.currentDirection = 'down';
    // this.faceLeft = false;
    // this.faceRight = false;
    // this.faceUp = false;
    // this.faceDown = true;

    gameAsset.instances.push(this);
  }
  static delete(instance) {
    let index = gameAsset.instances.indexOf(instance);
    if (index !== -1) {
      gameAsset.instances.splice(index, 1);
      gameSprite.instances.splice(index, 1);
    }
  }
  // setZIndex() {
  //   let colliderToe = this.posY - this.height;
  //   let z = 1 + Math.floor(((colliderToe - 1) / mapHeight) *99);
  //   this.elm.style.zIndex = z;
  // }
  // updatePosition() {
  //   this.setZIndex();
  //   if (this.elm) {
  //     this.elm.style.left = `${this.posX}px`;
  //     this.elm.style.top = `${this.posY}px`;
  //   }
  // }
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
        // could actually use this to know at all time what the player is colliding with?
        if (asset !== this && asset.isCollectable) {
          // let assetFootX = asset.posX + asset.colliderFoot.offsetLeft;
          // let assetFootY = asset.posY + asset.colliderFoot.offsetTop;
          let playerFootX = nextStepX + this.colliderFoot.offsetLeft;
          let playerFootY = nextStepY + this.colliderFoot.offsetTop;
          if (playerFootX + this.colliderFoot.offsetWidth > asset.posX && playerFootX < asset.posX + asset.width &&
              playerFootY + this.colliderFoot.offsetHeight > asset.posY && playerFootY < asset.posY + asset.height) {
              this.collectWorldItem(asset);
              return false;
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
      followerSprite: () => this.createGameSprite("follower"),
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
    itemElm.id = this.elmId;
    itemElm.classList.add("item");
    return itemElm;
  }
  createGameSprite(type) { // need to have different types
    let gameSpriteElm = document.createElement("div");
    gameSpriteElm.id = this.elmId;
    gameSpriteElm.classList.add("gameSprite");
    gameSpriteElm.classList.add(type + "Sprite");
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
    
  }
}
class interactiveObject extends worldObject {
  constructor(objectType, elmId, posX, posY, width, height) {
    super(objectType, elmId, posX, posY, width, height);
  }
}
class staticSpriteObject extends interactiveObject {
  constructor(objectType, elmId, posX, posY, width, height) {
    super(objectType, elmId, posX, posY, width, height);
    this.isStatic = true;
  }
}
class worldItem extends worldObject {
  constructor(objectType, elmId, posX, posY, width, height) {
    super(objectType, elmId, posX, posY, width, height);
    this.collidable = false;
    this.isCollectable = true;
    // console.log(this);
  }
  // static collectWorldItem() {
  //   if (this.isCollectable && this.isColliding(posX, posY)) {
  //     console.log(`Picked up ${this.objectType}!`);
  //   }
  // }
}
class pathFinderSprite { // using this for the flowerTrain
  constructor(player) {
    this.player = player;
    this.currentDirection = player.currentDirection;
    this.colliderFoot = player.colliderFoot;
    // train stuff
    this.maxPassengers = 5;
    this.flwrTrain = [];
    this.flwrDisplayWidth = 10;
    this.flwrDisplayHeight = 10;
    this.initialPos = 10;
    this.collidable = false;
    // slug stuff?
  }
  moveTrain() {
    let buffer = 15; // space
    let x = this.player.posX + this.player.width / 2 - this.flwrDisplayWidth / 2;
    let y = this.player.posY + this.player.height - this.initialPos * 3;
    let currentX = x;
    let currentY = y;
    for (let i = 0; i < this.maxPassengers; i++) {
      switch (this.currentDirection) {
        case 'down':
          currentY = y - (i+1)*buffer;
          break;
        case 'right':
          currentX = x - (i+1)*buffer;
          break;
        case 'up':
          // currentY = y - (i+1)*distance;
          currentY = y + (i+1)*buffer;
          break;
        case 'left':
          currentX = x + (i+1)*buffer;
          break;
      }
      let trainElm = this.flwrTrain[i];
      if (!trainElm) {
        // create a new train element if it doesn't exist yet
        let newTrainElm = document.createElement('div');
        newTrainElm.style.width = this.flwrDisplayWidth + 'px';
        newTrainElm.style.height = this.flwrDisplayHeight + 'px';
        newTrainElm.classList.add('flowerTrain');
        this.flwrTrain.push(newTrainElm);
        gameMap.append(newTrainElm);
        trainElm = newTrainElm;
      }
      trainElm.style.top = currentY + 'px';
      trainElm.style.left = currentX + 'px';
    }
  }
}
class gameSprite extends gameAsset {
  constructor(objectType, elmId, posX, posY, width, height, currentDirection) {
    super(objectType, elmId, posX, posY, width, height, currentDirection);
    this.currentDirection;
    // this.velocity;
    this.inventory = [];
  }
  updateServerPosition() {
    // console.log('updateServerPosition: ', this.playerId, this.posx, this.posY, this.currentDirection);
    // this.updateFlowerTrainPosition() 
    socket.emit('playerMovement', { playerId: this.playerId, x: this.posX, y: this.posY, currentDirection: this.currentDirection });
    // pathFinderSprite.moveTrain();
  }
  setFacingDirection(direction) {
    this.faceLeft = direction === 'left';
    this.faceRight = direction === 'right';
    this.faceUp = direction === 'up';
    this.faceDown = direction === 'down';
    
    this.currentDirection = direction;
    this.updateServerPosition();
    // console.log('setFacingDirection: ', this.currentDirection);
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
      // this.moveTrain();
    } else {
        // stuff for moving if the dist is less than this.velocity but greater than 0
    }
  }
}
class followerSprite extends gameSprite {
  constructor(objectType, elmId, posX, posY, width, height, currentDirection) {
    super(objectType, elmId, posX, posY, width, height, currentDirection);
    this.currentDirection;
    this.velocity = 1;
    this.collidable = false; // I just dont want the headache right now
    this.isTargetting = false;

    // console.log(gameAsset.instances);
    // console.log(this.targetPlayer);
  }
  static followTarget(follower, target) {
    follower.isTargetting = true;
    console.log(`${follower.elmId} is going to follow ${target.elmId}`);

    let moveInterval = setInterval(() => {
      let finishedMoving = follower.move(target);
      if (finishedMoving) {
        clearInterval(moveInterval);
        console.log(`reached destination, clear interval`);
      }
    }, 100);
}
move(target) {
  let dx = Math.abs(target.posX - this.posX);
  let dy = Math.abs(target.posY - this.posY);
  let distance = dx + dy;

  // Check if follower is already at the target position
  if (distance === 0) {
    console.log(`${this.elmId} caught the thing`);
    return true;
  }
  let direction = "";
  if (dx > dy) {
    direction = target.posX < this.posX ? "left" : "right";
  } else {
    direction = target.posY < this.posY ? "up" : "down";
  }
  if (direction === "left") {
    this.posX -= this.velocity;
  } else if (direction === "right") {
    this.posX += this.velocity;
  } else if (direction === "up") {
    this.posY -= this.velocity;
  } else if (direction === "down") {
    this.posY += this.velocity;
  }

  eventManager.emit('updateClientPosition', { id: this.elmId, x: this.posX, y: this.posY });
  // socket.emit('updateClientPosition', { id: this.elmId, x: this.posX, y: this.posY });

  // Update follower element position
  // this.updatePosition(this.posX, this.posY);

  return false;
}
}
class mainPlayer extends gameSprite {
  constructor(objectType, elmId, posX, posY, width, height, currentDirection) {
    super(objectType, elmId, posX, posY, width, height, currentDirection);
    //this.flwrTrain = new pathFinderSprite(this.elmId, this.posX, this.posY, this.width, this.height, this.currentDirection);
  //  console.log(this.colliderFoot);
    console.log(this);
    this.flwrTrain = new pathFinderSprite(this);
    
    this.velocity = 5;
    this.inventory = [];
    // this.staticSprite;
  }
 collectWorldItem(asset) {
      // if (this.isCollectable && this.isColliding(posX, posY)) {
      // }
    console.log(asset);
    console.log(`Picked up a ${asset.objectType}!`);

    // let trainElms = this.flwrTrain.getElementsByClassName('flowerTrain');
    console.log(this.flwrTrain.flwrTrain); //need to change this array name
    let trainElms = this.flwrTrain.flwrTrain;

    let emptySlot = -1;
    for (let i = 0; i < trainElms.length; i++) {
      if (!trainElms[i].hasChildNodes()) {
        emptySlot = i;
        break;
      }
    }
    if (emptySlot !== -1) {
      let flwr = document.createElement('div');
      trainElms[emptySlot].append(flwr);
      trainElms[emptySlot].style.backgroundColor = 'yellow'; //im dumb

      console.log(this.playerId, asset.elmId);

      gameAsset.delete(asset);
      asset.removeElm(asset.elmId);
      socket.emit('worldItemCollected', {asset: asset});
    } else {
      console.log("no empty slot");
    }
  }
  step() { // going insane 
    super.step(); 
    this.flwrTrain.moveTrain(); 
  }
  getElm() {
    return document.getElementById(this.playerId);
  }
  setFacingDirection(direction) {
    super.setFacingDirection(direction);
    this.flwrTrain.currentDirection = direction;
    this.flwrTrain.moveTrain();
  }
  updatePosition() {
    this.setZIndex();
    this.elm.style.left = `${this.posX}px`;
    this.elm.style.top = `${this.posY}px`;
    // this.flwrTrain.moveTrain();
  }
}
class guestPlayer extends mainPlayer {
  constructor(objectType, elmId, posX, posY, width, height, currentDirection) {
    super(objectType, elmId, posX, posY, width, height, currentDirection);
    // this.flwrTrain = new pathFinderSprite(elmId, posX, posY, width, height);
  }
}

