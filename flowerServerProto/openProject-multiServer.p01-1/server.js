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
sprites = [];

let numOfSprites = 5;

function randomPosition() {
  let random = parseInt( (50 + Math.random()*200) );
  // let random = parseInt( (50 + Math.random()*100) );

  return random
}

for(let i=0; i< numOfSprites; i++) {
  npc = {
    elmId: 'sprite' + (i + 1),
    playerId: 'sprite',
    posX: randomPosition(),
    posY: randomPosition(),
    width: 24,
    height: 36,
    isActive: false,
  };

  sprites.push(npc);
};

// console.log(sprites)

io.on('connection', function (socket) {
  console.log('a user connected: ', socket.id);

  // emit the non-active player elements to the map
  socket.emit('inactiveSprites', sprites);

  // emit current players to all users on the main page
  // console.log("length of players object", Object.keys(players).length);

  socket.emit('currentPlayers', players);

  socket.on('startGame', function () {
    let inactiveSprite = sprites.find(sprite => sprite.isActive === false);
    // can I change this to a random sprite based on the ones that are not active?
    console.log("Loading this sprite:", inactiveSprite.elmId);
    console.log(inactiveSprite);

    players[socket.id] = {
      playerId: socket.id,
      elmId: inactiveSprite.elmId,
      posX: inactiveSprite.posX,
      posY: inactiveSprite.posY,
    };

    inactiveSprite.isActive = true;
    inactiveSprite.playerId = socket.id;

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
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;

    // emit a message to all players about the player that moved
    socket.broadcast.emit('playerMoved', players[socket.id]);
    // console.log(players);
  });

  // when a player disconnects, remove them from our players object
  socket.on('disconnect', function () {
    console.log('user disconnected: ', socket.id);
    console.log(Object.keys(players));

    if(Object.keys(players).length > 0) {
      let disconnectedPlayer = sprites.find(sprite => sprite.playerId === socket.id);

      if(disconnectedPlayer == undefined) {
        console.log("undefined");
      } else {
        console.log(disconnectedPlayer);

      disconnectedPlayer.playerId = 'sprite';
      disconnectedPlayer.isActive = false;

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