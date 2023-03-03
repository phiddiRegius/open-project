const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
// const { Server } = require("socket.io");
const io = new Server(server);

const port = process.env.PORT;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

players = {};
let gameObjects = [];
let flowers = [];
let environmentObjects = [];
// let worldObjects = [];
let worldObjects = [...gameObjects, ...flowers]; 

let numOfGameObjects = 5;
let numOfFlowers = 5;

let mapWidth = 300;
let mapHeight = 300;
let minDist = 50;

function randomPosition(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getNewCoordinate() {
  let bestCoordinate = [];
  let bestDistance = -Infinity;
  let count = 0;
  
  while (true) {
    let currentCoordinate = [
      randomPosition(50, 250),
      randomPosition(50, 250)
    ];

    let currentDistance = Infinity;
    for (const object of gameObjects) {
      let a = currentCoordinate[0] - object.posX;
      let b = currentCoordinate[1] - object.posY;
      let objectDistance = Math.sqrt(a * a + b * b);

      if (objectDistance < currentDistance) {
        currentDistance = objectDistance;
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
      console.log("Error: Could not find a suitable coordinate after 40 attempts");
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
    playerId: 'pot',
    posX: coordinate[0],
    posY: coordinate[1],
    width: 24,
    height: 36,
    objectType: 'staticSprite',
    isStatic: true,
  };
  gameObjects.push(flowerPot);
}

for (let i = 0; i < numOfFlowers; i++) {
  // let coordinate = getNewCoordinate();
  // console.log(":", coordinate);

  // states: 
    // 0: Seed
    // 1: Sapling
    // 2: Mature

  let flower = {
    elmId: "flwr" + (i + 1),
    posX: randomPosition(50, 250),
    posY: randomPosition(50, 250),
    width: 10,
    height: 10,
    isObject: true,
    objectType: "flower",
    canInteract: true,
    inInventory: false,
    state: 0,
  };
  flowers.push(flower);
}

// console.log(sprites)

io.on('connection', function (socket) {
  console.log('a user connected: ', socket.id);

  // emit the non-active player elements to the map
  socket.emit('gameObjects', gameObjects);

   // emit all worldObjects to the map
   socket.emit('placeFlowers', flowers);

  // emit current players to all users on the main page
  // console.log("length of players object", Object.keys(players).length);

  socket.emit('currentPlayers', players);

  socket.on('startGame', function () {

    let staticSprite = gameObjects.find(object => object.objectType == 'staticSprite');
    // can I change this to a random sprite based on the ones that are not active?
    console.log("Loading this object:", staticSprite.elmId);
    console.log(staticSprite);

    players[socket.id] = {
      playerId: socket.id,
      elmId: staticSprite.elmId,
      posX: staticSprite.posX,
      posY: staticSprite.posY,
    };

    staticSprite.isStatic = false;
    staticSprite.playerId = socket.id;

    console.log(players);

    socket.emit('currentPlayers', players);
    socket.broadcast.emit('newPlayer', players[socket.id]);
  })

  socket.on('playerIsFacing', function (player) {
    players[socket.id].isFacing = player.isFacing;
    // console.log(players[socket.id]);

    socket.broadcast.emit('playerToFace', players[socket.id]);
  });
  
  socket.on('playerMovement', function (movementData) {
    // console.log(movementData);
    players[socket.id].posX = movementData.x;
    players[socket.id].posY = movementData.y;

    // emit a message to all players about the player that moved
    socket.broadcast.emit('playerMoved', players[socket.id]);
    // console.log(players);
  });

  // when a player disconnects, remove them from our players object
  socket.on('disconnect', function () {
    console.log('user disconnected: ', socket.id);
    console.log(Object.keys(players));
    console.log(gameObjects);

    if(Object.keys(players).length > 0) {
      let disconnectedPlayer = gameObjects.find(sprite => sprite.playerId === socket.id);

      if(disconnectedPlayer == undefined) {
        console.log("undefined");
      } else {
        console.log(disconnectedPlayer);

        disconnectedPlayer.playerId = 'pot';
        disconnectedPlayer.isStatic = true;

        // io.emit('updateSprites', sprites);
        delete players[socket.id];
        io.emit('disconnectUser', socket.id);
      }
      // console.log(disconnectedPlayer);
    } else {
      delete players[socket.id];
    }
  });

});

// change 3000 to port
server.listen(3000, () => {
  console.log('listening on *:3000');
});