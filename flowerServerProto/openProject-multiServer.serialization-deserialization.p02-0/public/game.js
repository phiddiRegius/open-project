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
let mapWidth = 800;
let mapHeight = 800;
let mainContainer = document.createElement('div');
  mainContainer.setAttribute('id', 'mainContainer');
  mainContainer.style.width = window.innerWidth;
  mainContainer.style.width = window.innerHeight;
  document.body.append(mainContainer);

let playerGUI = document.createElement('div');
  playerGUI.setAttribute('id', 'playerGUI');

let currencyCounter = document.createElement('div');
currencyCounter.setAttribute('id', 'currencyCounter');

playerGUI.append(currencyCounter);
  
let startMenu = document.createElement('div');
  startMenu.setAttribute('id', 'startMenu');

let startButton = document.createElement('button');
  startButton.setAttribute('id', 'startButton');
  startButton.innerHTML = 'Start';

let plantButton = document.createElement('button');
  plantButton.setAttribute('id', 'plantButton');
  plantButton.innerHTML = 'Plant Flower';

  plantButton.addEventListener('click', function() {
    for (let i = 0; i < gameAsset.instances.length; i++) {
      if (gameAsset.instances[i] instanceof mainPlayer) {
        // call the plantFlower method on the mainPlayer instance
        gameAsset.instances[i].plantFlower();
        break; // break out of the loop once the mainPlayer instance is found
      }
    }
  })

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



// key stuff
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
mainContainer.append(playerGUI, startMenu, gameMap);

startButton.addEventListener('click', () => {
  if (activePlayers.length === 5) {
    console.log("max players");
  } else {
    socket.emit('startGame');
    document.body.classList.add('gameIsStarted');
    startButton.style.display = "none";
    startMenu.append(plantButton);
    playerGUI.style.display = "block";
    gameIsStarted = true;
    backgroundAudio();
  }
});

function backgroundAudio() {
  let forestSound = new Audio('assets/sound/forest.mp3');
  forestSound.play();
  forestSound.loop = true;
}
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

    this.canvas = document.createElement('canvas');
    this.canvas.style.width = this.width;
    this.canvas.style.height = this.height;
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';

    this.ctx = this.canvas.getContext('2d');
    // elm.append(this.canvas);
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
    // request server to move instead of moving here => isColliding and updatePosition
    if (!this.isColliding(nextStepX, nextStepY)) {
      this.posX = nextStepX;
      this.posY = nextStepY;
      this.updatePosition();
      this.updateServerPosition();
      // this.renderSheet();
      // this.moveTrain();
    } else {
        // for moving if the dist is less than this.velocity but greater than 0
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
    this.inventory;

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
  collectWorldItem(asset) {
    let exclSound = new Audio('assets/sound/exclamation.mp3');
        exclSound.play();
        
    console.log(asset);
    console.log(`Picked up a ${asset.objectType}!`);

    console.log(this.playerId, asset.elmId);

    socket.emit('worldItemCollected', {asset: asset});
    this.inventory.push(asset);
    console.log(`${this.playerId} inventory: ${JSON.stringify(this.inventory.length)}`);
    gameAsset.delete(asset);

    asset.removeElm(asset.elmId);
    this.updateCurrencyCounter();
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

    // Update follower element position
    this.updatePosition(this.posX, this.posY);

    return false;
  }
}
class mainPlayer extends gameSprite {
  constructor(objectType, elmId, posX, posY, width, height, currentDirection) {
    super(objectType, elmId, posX, posY, width, height, currentDirection);
    //this.flwrTrain = new pathFinderSprite(this.elmId, this.posX, this.posY, this.width, this.height, this.currentDirection);
  //  console.log(this.colliderFoot);
    console.log(this);
    // this.flwrTrain = new pathFinderSprite(this);
    this.currencyCounter = document.getElementById('currencyCounter');
    
    this.velocity = 5;
    this.inventory = [];
    //
    this.numFrames = 4;
    this.currentFrame = 0;

    this.spriteSheet = new Image();
    this.spriteSheet.src = 'assets/player/playerSheet.png'
    // this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionFront.png)';
    // this.renderSheet();
    // this.staticSprite;
    let self = this;
      this.spriteSheet.onload = function() {
      // self.renderSheet();
    }
  }
  // renderSheet() {
  //   let spriteSheetX = 0;
  //   let spriteSheetY = 0;

  //   if (this.currentFrame < this.numFrames) {
  //     spriteSheetX = this.currentFrame * this.width;
  //     this.currentFrame++;
  //   } else {
  //     this.currentFrame = 0;
  //   }

  //   if (this.faceDown) {
  //     spriteSheetY = 0;
  //   } else if (this.faceUp) {
  //     spriteSheetY = this.height;
  //   } else if (this.faceLeft) {
  //     spriteSheetY = this.height * 2;
  //   } else if (this.faceRight) {
  //     spriteSheetY = this.height * 3;
  //   }
  //   // image, sx, sy, sWidth, sHeight, dx, dy, dWith, dHeight
  //   this.ctx.drawImage(this.spriteSheet, spriteSheetX, spriteSheetY, this.width, this.height, this.posX, this.posY, this.width, this.height);
  // }
  updateCurrencyCounter() {
    this.currencyCounter.innerHTML = this.inventory.length; 
  }
  plantFlower() {
    if (this.inventory.length > 0) {

      let flowerToPlant = this.inventory.pop();

      flowerToPlant.posX = this.posX + this.width + 10;
      flowerToPlant.posY = this.posY + this.height - 10;
      flowerToPlant.elm.style.left = flowerToPlant.posX + 'px';
      flowerToPlant.elm.style.top = flowerToPlant.posY + 'px';

      flowerToPlant.elm.style.backgroundColor = 'pink';
      flowerToPlant.collidable = true;

      gameAsset.instances.push(flowerToPlant);

      gameMap.append(flowerToPlant.elm)
      console.log(flowerToPlant);
      this.updateCurrencyCounter();

      socket.emit('planted', {flower: flowerToPlant});
    } else {
      console.log('no flowers in inventory')
    }
  }
  collectWorldItem(asset) {
    // if (this.isCollectable && this.isColliding(posX, posY)) {
    // }
    // let exclSound = new Audio('public/assets/sound/exclamation.mp3');
    //     exclSound.play();
        
    console.log(asset);
    console.log(`Picked up a ${asset.objectType}!`);

    // console.log(this.flwrTrain.flwrTrain); //need to change this array name
    // let trainElms = this.flwrTrain.flwrTrain;

    // let emptySlot = -1;
    // for (let i = 0; i < trainElms.length; i++) {
    //   if (!trainElms[i].hasChildNodes()) {
    //     emptySlot = i;
    //     break;
    //   }
    // }
    // if (emptySlot !== -1) {
    //   let flwr = document.createElement('div');
    //   trainElms[emptySlot].append(flwr);
    //   trainElms[emptySlot].style.backgroundColor = 'yellow'; //im dumb

      console.log(this.playerId, asset.elmId);

      socket.emit('worldItemCollected', {asset: asset});
      this.inventory.push(asset);
      console.log(`${this.playerId} inventory: ${JSON.stringify(this.inventory.length)}`);
      gameAsset.delete(asset);

      asset.removeElm(asset.elmId);
      this.updateCurrencyCounter();
    // } else {
    //   console.log("no empty slot");
    // }
  }
  step() { 
    super.step(); 
    // if (this.faceLeft) {
    //   this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionLeft.png)';
    // } else if (this.faceRight) {
    //   this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionRight.png)';
    // } else if (this.faceUp) {
    //   this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionBack.png)';
    // } else if (this.faceDown) {
    //   this.elm.style.backgroundImage = 'url(assets/rabillion/rabillionFront.png)';
    // }
    // this.flwrTrain.moveTrain(); 
  }
  getElm() {
    return document.getElementById(this.playerId);
  }
  setFacingDirection(direction) {
    super.setFacingDirection(direction);
   
   

    // this.flwrTrain.currentDirection = direction;
    // this.flwrTrain.moveTrain();
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
// console.log(gameAsset.instances);
socket.on('gameObjects', function (objectInfo) {
  console.log(objectInfo);
  objectInfo.forEach((info) => {
        let { objectType, elmId, posX, posY, width, height, currentDirection } = info; // deconstruct objectInfo

        if(objectType == 'staticSprite') {
          let staticSprite = new staticSpriteObject(objectType, elmId, posX, posY, width, height);
            staticSprite.createElement();
            // gameObjects.push(staticSprite);
        } if(objectType == 'flower') {
          let flower = new worldItem(objectType, elmId, posX, posY, width, height);
            flower.createElement();
          //   gameObjects.push(flower);
        } if(objectType == 'enemySprite') {
          let slug = new followerSprite(objectType, elmId, posX, posY, width, height, currentDirection);
            slug.createElement();
            //socket.emit('assignTarget', { slugId: slug.elmId, targetType: 'player', targetId: playerId });
        }
    });

    // console.log(gameAsset.instances);
    // socket.emit('updateGameAssets', gameAsset.instances);
    // socket.emit('updateGameAssets', JSON.stringify(gameAsset.instances));

    // let gettingFollowers = gameAsset.instances.filter(asset => asset instanceof followerSprite);
    
    // if(gameAsset.instances.length > 0) {
    //     let gettingTargets = gameAsset.instances.filter(asset => asset instanceof mainPlayer || asset instanceof guestPlayer || asset instanceof worldItem);
    //       console.log(gettingTargets);

    //       socket.emit('hitList', {list: gettingTargets}); 
    //       // should emit potential targets to the server then determine => 
    //       // let randomIndex = Math.floor(Math.random() * gettingTargets.length);
    //       // let target = gettingTargets[randomIndex];

    //       // console.log(target);
    //       // followerSprite.followTarget(target); // what if I emit first => tell server to give everyone this one?
    //       // // no need to tell server who the potential targets are then update
    //   }
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
          let assignedSprite = gameAsset.instances.find(staticSprite => staticSprite.elmId == players[playerId].elmId);
            // console.log(assignedSprite); // check if param values are correct for the assigned'static'Sprite 
          mainPlayerInstance = new mainPlayer('player', assignedSprite.elmId,  players[playerId].posX,  players[playerId].posY, assignedSprite.width, assignedSprite.height, players[playerId].currentDirection);
            mainPlayerInstance.playerId = playerId
            mainPlayerInstance.createElement();
            mainPlayerInstance.updatePosition();  

          // mainPlayerTrain = new pathFinderSprite();
            // mainPlayerInstance.displayFlowerTrain();

            activePlayers.push(mainPlayerInstance);
            // console.log(assignedSprite);
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
        let assignedSprite = gameAsset.instances.find(staticSprite => staticSprite.elmId == players[playerId].elmId);
            // console.log(assignedSprite); // check if parameter values are correct for the assigned'static'Sprite 
          guestPlayerInstance = new guestPlayer('player', assignedSprite.elmId,  players[playerId].posX,  players[playerId].posY, assignedSprite.width, assignedSprite.height, players[playerId].currentDirection);
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
    let assignedSprite = gameAsset.instances.find(staticSprite => staticSprite.elmId == playerInfo.elmId);
  
    guestPlayerInstance = new guestPlayer('player', assignedSprite.elmId, playerInfo.posX, playerInfo.posY, assignedSprite.width, assignedSprite.height, playerInfo.currentDirection);
    guestPlayerInstance.playerId = playerInfo.playerId;
    guestPlayerInstance.createElement();
  
    activePlayers.push(guestPlayerInstance);
    assignedSprite.elm.style.display = 'none';
    assignedSprite.collidable = false;
  });
  socket.on('playerMoved', function (playerInfo) {
      //console.log(playerInfo.posX, playerInfo.posY, playerInfo.currentDirection);
    let movedPlayer = activePlayers.find(player => player.playerId === playerInfo.playerId);
    //  console.log(movedPlayer);
      // if (!movedPlayer) { // return from fn() => false
      //   return;
      // }
      // console.log("before updating movement: ", movedPlayer.posX, movedPlayer.posY);
      // returning undefined
      movedPlayer.posX = playerInfo.posX;
      movedPlayer.posY = playerInfo.posY;
      movedPlayer.currentDirection = playerInfo.currentDirection;
      // movedPlayer.currentDirection = playerInfo.direction;
      // console.log("after updating movement: ", movedPlayer.posX, movedPlayer.posY);
      movedPlayer.updatePosition();
      // console.log(movedPlayer);
  });
  socket.on('updateWorldItem', function (itemInfo) {
    console.log(itemInfo);

    let item = itemInfo.asset;

    let gameAssetInstance = gameAsset.instances.find(asset => asset.elmId === item.elmId);

    console.log(gameAssetInstance);

    gameAsset.delete(gameAssetInstance);
    // console.log(gameAsset.instances);
    gameAssetInstance.removeElm();

    // if (typeof asset === 'object') {
    //   console.log('asset is an object');
    // } else {
    //   console.log('asset is not an object');
    // }

    // if (typeof asset.removeElm === 'function') {
    //   console.log('asset.removeElm is a function');
    // } else {
    //   console.log('asset.removeElm is not a function');
    // }

    // console.log(asset);

    // gameAsset.delete(asset);
    // // console.log(gameAsset.instances);
    // asset.removeElm();
  });
  socket.on('updateClientPosition', function (movementData) {
    // console.log(movementData);

    for (let i = 0; i < gameAsset.instances.length; i++) {
      if (gameAsset.instances[i].elmId === movementData.id) {
        // Update posX and posY properties with new values
        gameAsset.instances[i].posX = movementData.x;
        gameAsset.instances[i].posY = movementData.y;

        gameAsset.instances[i].updatePosition();
        break; // Exit loop once instance is found and updated
      }
    }

  });
  socket.on('plantedItem', function (itemData) { 
    console.log(itemData);

    let newElm = document.createElement('div');
      //  newElm.setAttribute('id', itemData.elmId);
      newElm.id = itemData.flower.elmId;
      newElm.style.position = 'absolute';
      newElm.style.left = itemData.flower.posX + 'px';
      newElm.style.top = itemData.flower.posY + 'px';
      newElm.style.width = itemData.flower.width + 'px';
      newElm.style.height = itemData.flower.height + 'px';
      newElm.style.backgroundColor = 'pink';

      let objectType = itemData.flower.objectType;
      let elmId = itemData.flower.elmId;
      let posX = itemData.flower.posX;
      let posY = itemData.flower.posY;
      let width = itemData.flower.width;
      let height = itemData.flower.height;

        let flower = new worldItem(objectType, elmId, posX, posY, width, height);

        // flower.isCollectable = false;
        // flower.collidable = true;

        console.log(flower instanceof gameAsset)
        gameAsset.instances.push(flower);

    // itemData.flower.isCollectable = false;
    // itemData.flower.collidable = true;

    
    // console.log(itemData.elm);
    gameMap.append(newElm);

    console.log(newElm);

  });
  socket.on('disconnectUser', function (playerId) {
    let playerIndex = activePlayers.findIndex(player => player.playerId === playerId);
    if (playerIndex === -1) {
      console.log("No player to remove");
      return;
    }
    let disconnectedPlayer = activePlayers[playerIndex];

      activePlayers.splice(playerIndex, 1);

    let gameAssetInstance = gameAsset.instances.find(asset => asset.playerId === playerId);
      if (gameAssetInstance) {
        console.log(gameAssetInstance);

        let assignedSprite = gameAsset.instances.find(staticSprite => staticSprite.elmId == disconnectedPlayer.elmId);
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




