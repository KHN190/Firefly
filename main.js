let swarm;
let clock;

let nFireflies = 200;
let nConstraint = 3; // [0, 5]
let observeDistance = 100;

let flashSpeed = 0.15;   // [0.1, 0.4]
let flashChance = 0.05; // [0, 1]

let margin = 0.05;
let displayNetwork = true;

function setup() {
  createCanvas(displayWidth, displayHeight);
  createP("Firefly simulation.");

  noStroke();
  frameRate(30);

  observeDistance = displayWidth * 0.1;

  clock = new Cycle();
  swarm = new Swarm();
  for (let i = 0; i < nFireflies; i++) {
    let x = random(0, width);
    let y = random(0, height);
    let b = new Firefly(x, y);
    swarm.bugs.push(b);
  }

  for (let i = 0; i < nFireflies; i++) {
    swarm.bugs[i].init(swarm);
  }
}

function draw() {
  background(51);

  clock.run();
  swarm.run();
}

// Clock for the system
//
function Cycle() {
  this.cycle = 0;
  this.time = 0;
  this.every = 1; // tick every 1 second
}

Cycle.prototype.run = function() {
  if (this.time <= 0) {
    this.time = this.every;
    this.tick();
  }
  this.time -= deltaTime;
}

Cycle.prototype.tick = function() {
  // tick clock
  this.cycle += 1;
  // tick all fireflies
  for (let i = 0; i < swarm.bugs.length; i++) {
    let firefly = swarm.bugs[i];
    if (firefly.wait > 0) firefly.wait -= 1;
    firefly.init(swarm);
  }
}
