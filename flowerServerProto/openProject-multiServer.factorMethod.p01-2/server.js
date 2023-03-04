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
let gameObjects = [];
let flowers = [];
// let worldObjects = [];
let gameAssets = [...gameObjects, ...flowers]; 

let numOfGameObjects = 5;
let numOfFlowers = 5;

let mapWidth = 400;
let mapHeight = 400;
let minDist = 20;

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) { 
      var j = Math.floor(Math.random() * (i + 1));

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
    for (const asset of gameAssets) {
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

for (let i = 0; i < numOfGameObjects; i++) {
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

for (let i = 0; i < numOfFlowers; i++) {
  let coordinate = getNewCoordinate();
  // console.log(":", coordinate);

  // states: 
    // 0: Seed
    // 1: Sapling
    // 2: Mature

  let flower = {
    elmId: "flwr" + (i + 1),
    objectType: "flower",
    posX: coordinate[0], //randomPosition(50, 250),
    posY: coordinate[1], //randomPosition(50, 250),
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

   // emit all worldObjects to the map
   socket.emit('placeFlowers', flowers);

  // emit current players to all users on the main page
  // console.log("length of players object", Object.keys(players).length);

  socket.emit('currentPlayers', players);

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
      direction: 'down',
    };

    staticSprite.isStatic = false;
    staticSprite.playerId = playerId;

    //console.log(players);

    // socket.emit('playerId', playerId);
    socket.emit('currentPlayers', players);
    socket.broadcast.emit('newPlayer', players[playerId]);
  })
  socket.on('playerIsFacing', function (player) {
    players[playerId].isFacing = player.isFacing;
    // console.log(players[playerId]);

    socket.broadcast.emit('playerToFace', players[playerId]);
  });
  socket.on('playerMovement', function (movementData) {
    //console.log(movementData);
    if (players[movementData.playerId]) {

      players[movementData.playerId].posX = movementData.x;
      players[movementData.playerId].posY = movementData.y;
      // players[movementData.playerId].direction = movementData.direction;

      //console.log(players[movementData.playerId].posX , players[movementData.playerId].posY)

      socket.broadcast.emit('playerMoved', players[movementData.playerId]);
    } else {
      console.log(movementData.playerId);
    }
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

// change 3000 to port
server.listen(3000, () => {
  console.log('listening on *:3000');
});