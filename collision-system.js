let oldTimeStamp = 0;
let secondsPassed;
let timeStamp = 0;
let canvas;
let context;
let totalFrame = 0;
const g = 9.81;
const canvasWidth = 750;
const canvasHeight = 400;
const restitution = 0.9;

class GameObject {
  constructor(context, x, y, vx, vy) {
    this.context = context;
    this.x = x;
    this.y = y;
    this.k = x;
    this.x = x;
    this.vx = vx;
    this.vy = vy;

    this.isColliding = false;
  }
}

class Square extends GameObject {
  constructor(context, x, y, vx, vy) {
    super(context, x, y, vx, vy);

    // Set default width and height
    this.width = 50;
    this.height = 50;
    this.mass = this.width * this.height;
  }

  draw() {
    // Draw a simple square
    this.context.fillStyle = this.isColliding ? "#ff8080" : "#0099b0";
    this.context.fillRect(this.x, this.y, this.width, this.height);
  }

  update(secondsPassed) {
    // Move with set velocity
    this.x += this.vx * secondsPassed;
    this.y += this.vy * secondsPassed;
  }
}

class Circle extends GameObject {
  constructor(context, x, y, vx, vy, r) {
    super(context, x, y, vx, vy);

    // Set default radius
    this.radius = r;
    this.mass = Math.PI * Math.pow(this.radius, 2);
    this.restitution = restitution;
  }

  draw() {
    // Draw a simple circle
    this.context.fillStyle = this.isColliding ? "#ff8080" : "#0099b0";
    context.beginPath();
    this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    this.context.fill();

    // Draw heading vector
    this.context.beginPath();
    this.context.moveTo(this.x, this.y);
    this.context.lineTo(this.x + this.vx, this.y + this.vy);
    this.context.stroke();
  }

  update(secondsPassed) {
    // Apply acceleration
    this.vy += g * secondsPassed * 90;

    totalFrame += 1;

    console.log(totalFrame);
    // Move with set velocity
    this.x += this.vx * secondsPassed;
    this.y += this.vy * secondsPassed;
    // Calculate the angle (vy before vx)
    let radians = Math.atan2(this.vy, this.vx);

    // Convert to degrees
    let degrees = (180 * radians) / Math.PI;
  }
}

let gameObjects;

function createWorld() {
  gameObjects = [
    new Circle(context, 250, 50, 0, 50, 15),
    new Circle(context, 250, 300, 0, -50, 10),
    new Circle(context, 150, 0, 50, 50, 15),
    new Circle(context, 250, 150, 50, 50, 20),
    new Circle(context, 350, 75, -50, 50, 30),
    new Circle(context, 300, 300, 50, -50, 20),
  ];
}

window.onload = init;

function init() {
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");

  
  createWorld();
  // Start the first frame request
  window.requestAnimationFrame(gameLoop);
}

function gameLoop(timeStamp) {
  secondsPassed = (timeStamp - oldTimeStamp) / 1000;
  oldTimeStamp = timeStamp;

  // Loop over all game objects
  for (let i = 0; i < gameObjects.length; i++) {
    gameObjects[i].update(secondsPassed);
  }
  detectCollisions();
  detectEdgeCollisions();
  clearCanvas();
  // Do the same to draw
  for (let i = 0; i < gameObjects.length; i++) {
    gameObjects[i].draw();
  }

  window.requestAnimationFrame(gameLoop);
}

function detectCollisions() {
  let obj1;
  let obj2;

  // Reset collision state of all objects
  for (let i = 0; i < gameObjects.length; i++) {
    gameObjects[i].isColliding = false;
  }

  // Start checking for collisions
  for (let i = 0; i < gameObjects.length; i++) {
    obj1 = gameObjects[i];
    for (let j = i + 1; j < gameObjects.length; j++) {
      obj2 = gameObjects[j];

      // Compare object1 with object2
      if (
        // rectIntersect(
        //   obj1.x,
        //   obj1.y,
        //   obj1.width,
        //   obj1.height,
        //   obj2.x,
        //   obj2.y,
        //   obj2.width,
        //   obj2.height
        // ) ||
        circleIntersect(
          obj1.x,
          obj1.y,
          obj1.radius,
          obj2.x,
          obj2.y,
          obj2.radius
        )
      ) {
        obj1.isColliding = true;
        obj2.isColliding = true;
        let vCollision = { x: obj2.x - obj1.x, y: obj2.y - obj1.y };
        let distance = Math.sqrt(
          (obj2.x - obj1.x) * (obj2.x - obj1.x) +
            (obj2.y - obj1.y) * (obj2.y - obj1.y)
        );
        let vCollisionNorm = {
          x: vCollision.x / distance,
          y: vCollision.y / distance,
        };
        let vRelativeVelocity = { x: obj1.vx - obj2.vx, y: obj1.vy - obj2.vy };
        let speed =
          vRelativeVelocity.x * vCollisionNorm.x +
          vRelativeVelocity.y * vCollisionNorm.y;
        // Apply restitution to the speed
        speed *= Math.min(obj1.restitution, obj2.restitution);
        if (speed < 0) {
          break;
        }
        let impulse = (2 * speed) / (obj1.mass + obj2.mass);
        obj1.vx -= impulse * obj2.mass * vCollisionNorm.x;
        obj1.vy -= impulse * obj2.mass * vCollisionNorm.y;
        obj2.vx += impulse * obj1.mass * vCollisionNorm.x;
        obj2.vy += impulse * obj1.mass * vCollisionNorm.y;
      }
    }
  }
}

function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
  // Check x and y for overlap
  if (x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2) {
    return false;
  }
  return true;
}

function circleIntersect(x1, y1, r1, x2, y2, r2) {
  // Calculate the distance between the two circles
  let squareDistance = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);

  // When the distance is smaller or equal to the sum
  // of the two radius, the circles touch or overlap
  return squareDistance <= (r1 + r2) * (r1 + r2);
}

function clearCanvas() {
  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function detectEdgeCollisions() {
  let obj;
  for (let i = 0; i < gameObjects.length; i++) {
    obj = gameObjects[i];

    // Check for left and right
    if (obj.x < obj.radius) {
      obj.vx = Math.abs(obj.vx) * restitution;
      obj.x = obj.radius;
    } else if (obj.x > canvasWidth - obj.radius) {
      obj.vx = -Math.abs(obj.vx) * restitution;
      obj.x = canvasWidth - obj.radius;
    }

    // Check for bottom and top
    if (obj.y < obj.radius) {
      obj.vy = Math.abs(obj.vy) * restitution;
      obj.y = obj.radius;
    } else if (obj.y > canvasHeight - obj.radius) {
      obj.vy = -Math.abs(obj.vy) * restitution;
      obj.y = canvasHeight - obj.radius;
    }
  }
}
