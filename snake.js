var canvas, ctx, WIDTH, HEIGHT, FPS, tileSize, playing;
var snake;
var globalTouch = [], offset = [];
var snd = new Audio("https://www.soundjay.com/button/beep-07.wav");
var socket = io();

var keys = {
  left: 37,
  up: 38,
  right: 39,
  down: 40
}

socket.on('chat message', function(msg){
  keyDown(msg);
});

window.addEventListener("touchstart", touchStart);
window.addEventListener("touchmove", touchMove);
window.addEventListener("touchend", touchEnd);

window.addEventListener("keydown", keyDown);
window.addEventListener("resize", resizeWindow);

function touchEnd(e){
  if(Math.abs(offset[0]) > Math.abs(offset[1]))
    snake.direction = [offset[0]/Math.abs(offset[0]), 0];
  else
    snake.direction = [0, offset[1]/Math.abs(offset[1])];
}

function touchMove(e) {
  var touch = e.touches[0];

  offse = [touch.pageX - globalTouch[0], touch.pageY - globalTouch[1]];
}

function touchStart(e){
  e.preventDefault();
  var touch = e.touches[0];
  globalTouch= [touch.pageX, touch.pageY];

}

function keyDown(e) {

  e = e || e.keyCode;

  if(!playing && (e == keys.up || e == keys.rigth || e == keys.down || e == keys.left))
    playing = true;

  switch (e) {
    case keys.left:
      snake.direction = [-1, 0];
      break;

    case keys.up:
      snake.direction = [0, -1];
      break;

    case keys.right:
      snake.direction = [1, 0];
      break;

    case keys.down:
      snake.direction = [0, 1];
      break;
  }
}

function resizeWindow() {
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;

  canvas.width = 0.5*WIDTH;
  canvas.height = 0.5*HEIGHT;

  tileSize = Math.max(Math.floor(canvas.width/60), Math.floor(canvas.height/60))
}

function init() {
  canvas = document.createElement("canvas");
  resizeWindow();
  document.body.appendChild(canvas);
  ctx = canvas.getContext("2d");

  FPS = 15;

  newGame();
  run();

}

function newGame() {
  snake = new Snake();
  comida = new Comida();
  playing = false;
}

function Comida() {
  this.body = [20, 20];
  this.color = "#d00";

  this.draw = function() {
    ctx.fillStyle = this.color;
      ctx.fillRect(this.body[0]*tileSize, this.body[1]*tileSize, tileSize, tileSize);
  }
}

function Snake() {
  this.body = [[10, 10], [10, 11], [10, 12]];
  this.color = "#000";
  this.direction = [0, -1];

  this.update = function() {
    var nextPos = [this.body[0][0] + this.direction[0], this.body[0][1] + this.direction[1]];

    if(!playing){
      if(this.direction[1] == -1 && nextPos[1] <= (0.5*HEIGHT*0.1/tileSize))
        this.direction = [1, 0];

      else if(this.direction[0] == 1 && nextPos[0] >= (0.5*WIDTH*0.9/tileSize))
        this.direction = [0, 1];

      else if(this.direction[1] == 1 && nextPos[1] >= (0.5*HEIGHT*0.9/tileSize))
        this.direction = [-1, 0];

      else if(this.direction[0] == -1 && nextPos[0] <= (0.5*WIDTH*0.1/tileSize))
        this.direction = [0, -1];
    }

    if(nextPos[0] == this.body[1][0] && nextPos[1] == this.body[1][1]){
      this.body.reverse();
      nextPos = [this.body[0][0] + this.direction[0], this.body[0][1] + this.direction[1]];
    }

    if(this.direction[0] != 0 || this.direction[1] != 0){
      this.body.pop();
      this.body.splice(0, 0, nextPos);
    }
  }

  this.draw = function() {
    ctx.fillStyle = this.color;

    for (var i = 0; i < this.body.length; i++) {
      ctx.fillRect(this.body[i][0]*tileSize, this.body[i][1]*tileSize, tileSize, tileSize);
    }
  }
}

function colisao(){
  //Verifica colisao com a comida
  if(snake.body[0][0] == comida.body[0] && snake.body[0][1] == comida.body[1]){
    nextPos =  [snake.body[0][0] + snake.direction[0], snake.body[0][1] + snake.direction[1]];
    snake.body.splice(0, 0, nextPos);
    play_beep();
    comida.body = [Math.floor((Math.random() * 60)), Math.floor((Math.random() * 30))];
  }
  //Verifica a colisao com o fim do mapa
  if(snake.body[0][1] + snake.direction[1] >= Math.floor(canvas.height/tileSize)+1 || snake.body[0][1] + snake.direction[1] <= -1 || snake.body[0][0] + snake.direction[0] >= Math.floor(canvas.width/tileSize)+1 || snake.body[0][0] + snake.direction[0] <= -1){
    snake.direction = [0, 0];
  }
}

function play_beep() {
  snd.play();
  return false;
}

function update() {
  snake.update();
  colisao();
}

function run() {
    update();
    draw();

    setTimeout(run, 1000/FPS);
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  snake.draw();
  comida.draw();
}

init();
