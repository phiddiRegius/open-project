// game.js

// GLOBAL 
// let debug = true;

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

// DIV ELEMENTS & GUI
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
startMenu.append(startButton);

let gameMap = document.createElement('div');
gameMap.setAttribute('id', 'gameMap');
gameMap.style.width = mapWidth  + 'px';
gameMap.style.height = mapHeight + 'px';

// DEBUG PANEL
// add toggle and popup to check properties of instances in different arrays

// variable for each key
let LEFT_KEY = "ArrowLeft";
let RIGHT_KEY = "ArrowRight";
let UP_KEY = "ArrowUp";
let DOWN_KEY = "ArrowDown";

// Set initial facing directions to false
let isFacingLeft = false;
let isFacingRight = false;
let isFacingUp = false;
let isFacingDown = false;

// Add an event listener for keydown events
window.addEventListener("keydown", function(event) {
  // Get the pressed key's code
  let keyCode = event.key;

  // Prevent default browser behavior for the pressed key
  event.preventDefault();

  // Check if the player is already facing a direction
  if (isFacingLeft || isFacingRight || isFacingUp || isFacingDown) {
    // Clear the facing direction if the player is moving in a different direction
    if (keyCode === LEFT_KEY && !isFacingLeft) {
      isFacingRight = false;
      isFacingUp = false;
      isFacingDown = false;
    } else if (keyCode === RIGHT_KEY && !isFacingRight) {
      isFacingLeft = false;
      isFacingUp = false;
      isFacingDown = false;
    } else if (keyCode === UP_KEY && !isFacingUp) {
      isFacingLeft = false;
      isFacingRight = false;
      isFacingDown = false;
    } else if (keyCode === DOWN_KEY && !isFacingDown) {
      isFacingLeft = false;
      isFacingRight = false;
      isFacingUp = false;
    }
  }

  // Set the facing direction based on the pressed key
  if (keyCode === LEFT_KEY) {
    isFacingLeft = true;
    player.stepLeft();
  } else if (keyCode === RIGHT_KEY) {
    isFacingRight = true;
    player.stepRight();
  } else if (keyCode === UP_KEY) {
    isFacingUp = true;
    player.stepUp();
  } else if (keyCode === DOWN_KEY) {
    isFacingDown = true;
    player.stepDown();
  }
});

// play game
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


// Game Objects & Players
class gameAsset {
  static instances = [];
  constructor(elmId, objectType, posX, posY, width, height) {
    // this.elm = document.getElementById(elmId);
    this.elmId = elmId;
    this.posX = posX;
    this.posY = posY;
    this.width = width;
    this.height = height;
    //
    // this.objectType = ""; // player or element
    this.debugTag = document.createElement("p");
    // this.setTag();
    // this.getElm = this.getElm.bind(this);
    // this.removeElm = this.removeElm.bind(this);
    gameAsset.instances.push(this);
  }
  updatePosition() {
    if (this.elm) {
      this.elm.style.left = `${this.posX}px`;
      this.elm.style.top = `${this.posY}px`;
    }
  }
  createInstance() {
    const elm = this.createElement();
    const instance = {
      elmId: this.elmId,
      posX: this.posX,
      posY: this.posY,
      width: this.width,
      height: this.height,
      debugTag: this.debugTag,
      updatePosition: this.updatePosition.bind(this),
      getElm: this.getElm.bind(this),
      removeElm: this.removeElm.bind(this)
    };
    // this.setObjectType(this.elmId, true);
    return instance;
  }
  // createInstance() {
  //   const elm = this.createElement();
  //   if (this.debug === true) {
  //     this.debugTag.innerHTML = this.objectType;
  //     elm.append(this.debugTag);
  //   }
  //   return this;
  // }
  createElement(debug) {
    const elementCreators = {
      worldObject: () => this.createObject("world"),
      interactiveObject: () => this.createObject("interactive"),
      staticSpriteObject: () => this.createObject("staticSprite"),
      item: () => this.createItem(),
      gameSprite: () => this.createGameSprite(),
      mainPlayer: () => this.createPlayer("main"),
      guestPlayer: () => this.createPlayer("guest")
    };
    const className = this.constructor.name;
    const elementCreator = elementCreators[className];

    if (!elementCreator) {
      throw new Error("Invalid class");
    }

    // const nameTag = document.createElement("p");
    // nameTag.innerHTML = this.elmId;

    const elm = elementCreator();
    elm.style.left = `${this.posX}px`;
    elm.style.top = `${this.posY}px`;
    elm.style.width = `${this.width}px`;
    elm.style.height = `${this.height}px`;
    elm.innerHTML = `<p class="debugTag">${this.elmId}</p>`;
    elm.setAttribute("id", this.elmId);
    this.elm = elm;
    this.updatePosition();

    if (debug === true) {
      // this.debugTag = document.createElement("p");
      // this.debugTag.className = "debug";
      this.debugTag.innerHTML = this.objectType;
      elm.append(this.debugTag);
    }

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
  createObject(objectType) {
    let worldObjectElm = document.createElement("div");
    worldObjectElm.classList.add("worldObject");
    worldObjectElm.classList.add(objectType + "Object");
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
  createPlayer(playerType) {
    let playerElm = document.createElement("div");
    playerElm.id = this.objectType;
    // playerElm.classList.add("gameSprite");
    playerElm.classList.add(playerType + "Player");
    return playerElm;
  }
}

class worldObject extends gameAsset {
  constructor(elmId, objectType, posX, posY, width, height) {
    super(elmId, objectType, posX, posY, width, height);
    //
    gameAsset.instances.push(this);
  }
}
class interactiveObject extends worldObject {
  constructor(elmId, objectType, posX, posY, width, height) {
    super(elmId, objectType, posX, posY, width, height);
    this.canInteract = true;
    //
    gameAsset.instances.push(this);
  }
}
class  staticSpriteObject extends interactiveObject {
  constructor(elmId, objectType, posX, posY, width, height) {
    super(elmId, objectType, posX, posY, width, height);
    this.canInteract = true;
    //
    gameAsset.instances.push(this);
  }
}

class Item extends worldObject {
  constructor(elmId, objectType, posX, posY, width, height) {
    super(elmId, objectType, posX, posY, width, height);
    this.isCollectable = true;
    //
    gameAsset.instances.push(this);
  }

}

class GameSprite extends gameAsset {
  constructor(elmId, objectType, posX, posY, width, height) {
    super(elmId, objectType, posX, posY, width, height);
    // this.objectType = objectType;
    //
    gameAsset.instances.push(this);
  }
  
}
class mainPlayer extends GameSprite {
  constructor(elmId, objectType, posX, posY, width, height) {
    super(elmId, objectType, posX, posY, width, height);
    this.isPlayer = true;

    gameAsset.instances.push(this);
  }
  updatePosition() {
    gameMap.style.left = `${- this.posX}px`;
    gameMap.style.top = `${- this.posY}px`;

  }
}

class guestPlayer extends GameSprite {
  constructor(elmId, objectType, posX, posY, width, height) {
    super(elmId, objectType, posX, posY, width, height);
    this.isPlayer = true;
    //
    gameAsset.instances.push(this);
  }
}

socket.on('gameObjects', function (objectInfo) {
  objectInfo.forEach((info) => {
        let { elmId, objectType, posX, posY, width, height } = info;
        let newObject = new staticSpriteObject(elmId, objectType, posX, posY, width, height);
        newObject.createElement();
        
        // sprite.createElement();
        gameObjects.push(newObject);
    });
  });

  socket.on('currentPlayers', function (players) {
    // Loop through each player in the list
    Object.keys(players).forEach(function (playerId) {
      // Check if this player is the main player (i.e. the player using this browser)
      if (playerId == socket.id) {
        // If the player is already in the list of active players, skip to the next player
        let existingPlayerIndex = activePlayers.findIndex(player => player.objectType === playerId);
        if (existingPlayerIndex >= 0) {
          return;
        }
        console.log(`Adding mainPlayer-${playerId} to activePlayers`);
          let assignedSprite = gameObjects.find(staticSprite => staticSprite.elmId == players[playerId].elmId);
            console.log(assignedSprite);
            
          mainPlayerInstance = new mainPlayer(players[playerId].elmId, playerId, assignedSprite.posX, assignedSprite.posY, assignedSprite.width, assignedSprite.height).createInstance();
            console.log(playerId);
            
            mainPlayerInstance.updatePosition();
            
            console.log(mainPlayerInstance instanceof mainPlayer);
          
            activePlayers.push(mainPlayerInstance);
            assignedSprite.removeElm(assignedSprite.elmId);
         
      } else {
        // Otherwise, create a new Player object for another player
        let existingPlayerIndex = activePlayers.findIndex(player => player.objectType === playerId);
        if (existingPlayerIndex >= 0) {
          return;
        }
        console.log(`Adding guestPlayer-${playerId} to activePlayers`);
          // let assignedSprite = gameObjects.find(staticSprite => staticSprite.elmId == players[playerId].elmId);
          //   assignedSprite.removeElm(assignedSprite.elmId);
          //   console.log(assignedSprite);
          //   guestPlayerInstance = new mainPlayer(players[playerId].elmId, playerId, assignedSprite.posX, assignedSprite.posY, assignedSprite.width, assignedSprite.height).createInstance();
          //     activePlayers.push(guestPlayerInstance);
      }
    });
  });
  socket.on('newPlayer', function (playerInfo) {
    console.log("A newPlayer has joined");

    let assignedSprite = gameObjects.find(staticSprite => staticSprite.elmId == playerInfo.elmId);
      assignedSprite.objectType = playerInfo.playerId;
      assignedSprite.isStatic = false;
      assignedSprite.elm.remove(gameMap);

      guestPlayer = new Player (playerInfo.elmId, playerInfo.playerId, assignedSprite.posX, assignedSprite.posY, assignedSprite.width, assignedSprite.height, assignedSprite.isFacing, false, false);
      // guestPlayer.createElement();
      activePlayers.push(guestPlayer);

      console.log(sprites, ' :at new player');
  });
  socket.on('playerToFace', function (playerInfo) {
    let playerTurned = activePlayers.find(player => player.objectType == playerInfo.playerId);
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

  socket.on('playerMoved', function (playerInfo) {
    // console.log("a player moved");

    console.log(playerInfo);

    let movedPlayer = activePlayers.find(player => player.playerId == playerInfo.playerId);
    console.log(movedPlayer);
  
      movedPlayer.posX = playerInfo.posX;
      movedPlayer.posY = playerInfo.posY;

      movedPlayer.updatePosition();
  });

  socket.on('disconnectUser', function (playerId) {
    console.log(`Player ${playerId} has disconnected`);
    
    let playerIndex = activePlayers.findIndex(player => player.playerId === playerId);
    if (playerIndex === -1) {
      console.log('No player to remove');
      return;
    }
    
    let disconnectedPlayer = activePlayers[playerIndex];
    let assignedSprite = sprites.find(sprite => sprite.elmId === disconnectedPlayer.elmId);
    
    assignedSprite.playerId = 'sprite';
    assignedSprite.isSprite = true;
    
    gameMap.append(assignedSprite.elm);
    disconnectedPlayer.elm.remove(gameMap);
    activePlayers.splice(playerIndex, 1);
    
    // console.log(sprites, ' :at disconnect');
  });




