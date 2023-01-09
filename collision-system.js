"use strict";
let canvas;
let context;
let secondsPassed = 0;
let oldTimeStamp = 0;
let movingSpeed = 50;
let fps;
let rectX = 0;
let rectY = 0;

window.onload = init;

function init() {
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");

  // Start the first frame request
  window.requestAnimationFrame(gameLoop);
}

function gameLoop(timeStamp) {
  // Calculate how much time has passed
  secondsPassed = (timeStamp - oldTimeStamp) / 1000;
  oldTimeStamp = timeStamp;
  //update
  update(secondsPassed);
  // Perform the drawing operation
  draw();

  // The loop function has reached it's end. Keep requesting new frames
  window.requestAnimationFrame(gameLoop);
}

function update(secondsPassed) {
  rectX += movingSpeed * secondsPassed;
  rectY += movingSpeed * secondsPassed;
}

function draw() {
  // Clear the entire canvas
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#ff8080";
  context.fillRect(rectX, rectY, 150, 100);
}
