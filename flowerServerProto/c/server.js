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


// Global Variables 
let minDist = 50;
let numOfFlowers = 5;

function randomPosition() {
  let random = parseInt( (50 + Math.random()*300) );
  // let random = parseInt( (50 + Math.random()*100) );

  return random
}
 
let flowers = []

for(let i=0; i < numOfFlowers; i++) {
  let flower = {
    elemId: "flower" + (i + 1),
    x: randomPosition() - 14,
    y: randomPosition() - 22,
    width: 14,
    height: 22,
    isPicked: false,
  }
  flowers.push(flower);
}

players = {};

function getNewLocation(){
  let d = 999999999;
  let loc = [];
  let count = 0;
  while(d < minDist || d > 999999){
    d = 999999999;
    loc[0] = randomPosition();
    loc[1] = randomPosition();
    if(Object.keys(players).length < 1){
      break
    }
    console.log("new x", loc[0], "y", loc[1], Object.keys(players).length)
    for(const player in players) {
      let a = loc[0] - players[player].x;
      let b = loc[1] - players[player].y;
      let playerDist = Math.sqrt( a*a + b*b );
      // console.log("playerDist", playerDist, "d", d);
      if(playerDist < d) {
        d = playerDist;
      }
    }
    // count ++;
    // if(count>40) break;
  }
  return loc

}

// while debugging. positions will; mot be random,
// let y = 100; // for debugging
// let x = 10; // for debugging

io.on('connection', function (socket) {
  console.log('a user connected: ', socket.id);

  // create a new player and add it to our players object
  let loc = getNewLocation();
  console.log("using loc:", loc);
  players[socket.id] = {
    // x and y positioning of the map:
    // subtract half of the playerWidth and playerHeight 
    x: loc[0],
    y: loc[1],
    // x: x, // for debugging
    // y: y, // for debugging
    width: 24,
    height: 36,
    playerId: socket.id,
    myFlowers: [],
    isFacing: 'down',
  };
  // x += 50; // for debugging
  // if(x>200) x=10; // for debugging

  socket.broadcast.emit('newPlayer', players[socket.id]);
  // console.log(players[socket.id]);

  // send the players object to the new player
  socket.emit('currentPlayers', players);

  // when a player moves, update the player data
  socket.on('playerMovement', function (movementData) {
    // console.log(movementData);
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    // console.log(movementData.x, movementData.y)
    // emit a message to all players about the player that moved
    socket.broadcast.emit('playerMoved', players[socket.id]);
    // console.log(players);
  });

  socket.on('playerIsFacing', function (player) {
    players[socket.id].isFacing = player.isFacing;
    console.log(players[socket.id]);

    socket.broadcast.emit('playerToFace', players[socket.id]);
  });

  // send the flower object to the new player
  socket.emit('plantFlowers', flowers);

  // when a player disconnects, remove them from our players object
  socket.on('disconnect', function () {
    console.log('user disconnected: ', socket.id);
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit('disconnectUser', socket.id);
  });
});


server.listen(3000, () => {
  console.log('listening on *:3000');
});