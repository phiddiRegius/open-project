const express = require('express');
const app = express();
const http = require('http');
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

let numOfGameObjects = 5;
let numOfFlowers = 5;

let mapWidth = 400;
let mapHeight = 400;
let minDist = 20;

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
  static setZIndex() {
    let colliderToe = this.posY - this.height;
    let z = 1 + Math.floor(((colliderToe - 1) / mapHeight) *99);
    this.elm.style.zIndex = z;
  }
  static updatePosition() {
    this.setZIndex();
    if (this.elm) {
      this.elm.style.left = `${this.posX}px`;
      this.elm.style.top = `${this.posY}px`;
    }
  }
  static isColliding(nextStepX, nextStepY) {
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

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) { 
      let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
  }
  return array;
}

function randomPosition(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

for (let i = 0; i < numOfGameObjects; i++) { //flowerPots
  let coordinate = getNewCoordinate();
  // console.log(":", coordinate);

  let flowerPot = {
    elmId: 'pot' + (i + 1),
    objectType: 'staticSprite',
    playerId: 'pot',
    posX: coordinate[0],
    posY: coordinate[1],
    width: 24,
    height: 36,
    isStatic: true,
  };
  gameObjects.push(flowerPot);
}

for (let i = 0; i < numOfGameObjects; i++) { // slugs
  // let coordinate = getNewCoordinate();
  // console.log(":", coordinate);

  let slug = {
    elmId: 'slug' + (i + 1),
    objectType: 'enemySprite',
    playerId: 'slug',
    posX:  randomPosition(50, mapWidth - 50),
    posY:  randomPosition(50, mapWidth - 50),
    width: 24,
    height: 36,
  };
  gameObjects.push(slug);
}

for (let i = 0; i < numOfFlowers; i++) { // flowers
  // let coordinate = getNewCoordinate();
  // console.log(":", coordinate);

  // states: 
    // 0: Seed
    // 1: Sapling
    // 2: Mature

  let flower = {
    elmId: "flwr" + (i + 1),
    objectType: "flower",
    posX:  randomPosition(50, mapWidth - 50), //randomPosition(50, 250),
    posY:  randomPosition(50, mapWidth - 50), //randomPosition(50, 250),
    width: 10,
    height: 10,
    isObject: true,
    objectType: "flower",
    // canInteract: true,
    // inInventory: false,
    state: 0,
  };
  gameObjects.push(flower);
}

// console.log(sprites)
io.on('connection', function (socket) {
  const playerId = uuidv4();

  console.log('a user connected: ', playerId);

  

  // emit the non-active player elements to the map
  socket.emit('gameObjects', gameObjects);

  // emit current players to all users on the main page
  // console.log("length of players object", Object.keys(players).length);

  socket.emit('currentPlayers', players);


  // I need to update this where the server first receives a request to get the movement
  let gettingTargets = gameObjects.filter(object => object.objectType == 'flower' ||  object.objectType == 'player');
  // console.log("Can assign these targets: ", gettingTargets);
  shuffleArray(gettingTargets); // so I dont have to randomize 
  // console.log(gettingTargets);
  socket.emit('updateHitList', gettingTargets);

  // class moveToTarget {
  //   constructor(objectType, elmId, posX, posY, width, height, currentDirection) {
  //     super(objectType, elmId, posX, posY, width, height, currentDirection);
      
      
  //     this.currentDirection;
  //     this.velocity = 1;
  //     this.collidable = false; // I just dont want the headache right now
  //     this.isTargetting = false;
  
  //     // console.log(gameAsset.instances);
  //     // console.log(this.targetPlayer);
  //   }
  //   static followTarget(follower, target) { // the static method needs to receive objects
  //     follower.isTargetting = true;
  //     console.log(`${follower.elmId} is going to follow ${target.elmId}`);
  
  //     let moveInterval = setInterval(() => {
  //       let finishedMoving = follower.move(target);
  //       if (finishedMoving) {
  //         clearInterval(moveInterval);
  //         console.log(`reached destination, clear interval`);
  //       }
  //     }, 100);
  // }
  // move(target) {
  //   let dx = Math.abs(target.posX - this.posX);
  //   let dy = Math.abs(target.posY - this.posY);
  //   let distance = dx + dy;
  
  //   // Check if follower is already at the target position
  //   if (distance === 0) {
  //     console.log(`${this.elmId} caught the thing`);
  //     return true;
  //   }
  //   let direction = "";
  //   if (dx > dy) {
  //     direction = target.posX < this.posX ? "left" : "right";
  //   } else {
  //     direction = target.posY < this.posY ? "up" : "down";
  //   }
  //   if (direction === "left") {
  //     this.posX -= this.velocity;
  //   } else if (direction === "right") {
  //     this.posX += this.velocity;
  //   } else if (direction === "up") {
  //     this.posY -= this.velocity;
  //   } else if (direction === "down") {
  //     this.posY += this.velocity;
  //   }
  
  //   // Update follower element position
  //   // this.updatePosition(this.posX, this.posY); // I think this needs to change to an emitter
  //   // socket.emit('updatePosition', { elmId: this.elmId, x: this.posX, y: this.posY, currentDirection: this.currentDirection });

  //   return false;
  // }
  // }

  socket.on('startGame', function () {
    // if (players[playerId]) { // maybe this should go before the player is created and after the client is updated? 
    //   return;
    // }
    shuffleArray(gameObjects);
    
    let staticSprite = gameObjects.find(object => object.isStatic === true);
      // console.log("Loading this object:", staticSprite.elmId);
      // console.log(staticSprite);

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

  socket.on('updateGameAssets', function (assets) {
    // console.log(`Receiving ${JSON.stringify(assets)}`);
    let parsedAssets = JSON.parse(assets);
      gameAsset.instances.push(...parsedAssets);
      console.log(gameAsset.instances); 
  });

  // socket.on('playerIsFacing', function (player) {
  //   players[playerId].isFacing = player.isFacing;
  //   // console.log(players[playerId]);

  //   socket.broadcast.emit('playerToFace', players[playerId]);
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
  socket.on('worldItemCollected', function (itemData) { //NEED TO ADD PROPERTY FOR IF ISCOLLECTED NOT GONNA DO IT RN
    // console.log('collectedItem: ', itemData);
      socket.broadcast.emit('updateWorldItem', itemData);
  });

  socket.on('disconnect', function () {
    console.log('user disconnected: ', playerId);
    // console.log(Object.keys(players));
    // console.log(gameObjects);

    if(Object.keys(players).length > 0) { // why did I write this again? feck 
      let getAssignedSprite = gameObjects.find(assignedSprite => assignedSprite.playerId === playerId);

      if(getAssignedSprite == undefined) {
        console.log("undefined");
      } else {
        // console.log(disconnectedPlayer);

        getAssignedSprite.posX = players[playerId].posX;
        getAssignedSprite.posY = players[playerId].posY;
        getAssignedSprite.playerId = 'pot';
        getAssignedSprite.isStatic = true;

        // io.emit('updateSprites', sprites);
        delete players[playerId];
        io.emit('disconnectUser', playerId);
      }
      // console.log(disconnectedPlayer);
    } else {
      delete players[playerId];
    }
  });
});

// 3000 for local
// port for glitch
server.listen(3000, () => {
  console.log('listening on *:3000');
});