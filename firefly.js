// Swarm of Fireflies
//
function Swarm() {
  this.bugs = [];
}

Swarm.prototype.run = function() {
  for (let i = 0; i < this.bugs.length; i++) {
    this.bugs[i].update(this);
    this.bugs[i].draw();
  }
  // todo: trail
}

// Single Firefly
//
function Firefly(x, y) {
  this.pos = createVector(x, y);
  this.recovery = 100; // cycles of recovery
  this.wait = 10; // cycles until next potential flash
  this.size = 10;
  this.r = observeDistance; // radius for neighbours
  this.colors = [
    color(140, 198, 64), // forest
    color(255, 204, 0),  // sunflower
    color(255, 26, 117), // persimon
    color(26, 117, 255), // ocean
  ];

  // runtime vars
  this.timer = 0;
  this.flashing = false;
  this.lastFlashCycle = 0;
  this.observe = [];
  this.color_idx = int(random(0, this.colors.length));

  // movement
  this.acc = createVector(0.0, 0.0);
  this.vel = createVector(0.0, 0.0);
}

Firefly.prototype.init = function(swarm) {
  // subscribe neighbours
  let dists = [];
  for (let i = 0; i < swarm.bugs.length; i++) {
    let other = swarm.bugs[i];
    let dist = this.pos.dist(other.pos);
    if (dist < 0.01) continue; // skip self
    if (dist < this.r) {
      this.observe.push(other);
      dists.push(dist);
    }
  }
  // keep only n closest
  while (this.observe.length > nConstraint) {
    let max = -Infinity;
    let idx = -1;
    for (let i = 0; i < dists.length; i++) {
      if (dists[i] > max) { 
        max = dists[i];
        idx = i;
      }
    }
    dists.splice(idx, 1);
    this.observe.splice(idx, 1);
  }
}

Firefly.prototype.setoff = function() {
  this.wait = this.recovery;
  this.flashing = true;
  this.lastFlashCycle = clock.cycle;
  this.size = 10 + random(-5, 0);
  this.color_idx = (this.color_idx + 1) % this.colors.length;

  // console.log('flash:', clock.cycle);
}

Firefly.prototype.move = function() {
  let cursor = createVector(mouseX, mouseY);
  let cdist = cursor.dist(this.pos);

  if (cdist < this.r) {
    // avoid cursor
    this.acc = p5.Vector.sub(this.pos, cursor);
    this.acc.setMag(0.2);
    this.vel.add(this.acc).limit(1);
    this.pos.add(this.vel);

  }
  // random acceleration
  this.acc.add(random(-1, 1), random(-1, 1)).limit(0.1);
  this.vel.add(this.acc).limit(1);
  this.pos.add(this.vel);
  
  this.pos.x = constrain(this.pos.x, width * margin, width * (1 - margin));
  this.pos.y = constrain(this.pos.y, height * margin, height * (1 - margin));
}

Firefly.prototype.update = function(swarm) {

  this.move();

  // observe close fireflies, set off flash when they do
  if (clock.cycle > 0) {

    for (let i = 0; i < this.observe.length; i++) {
      let other = this.observe[i];
      // if others flash, set off
      if (this.wait <= 0 && other.intensity > 0.1) {
        this.setoff();
        this.color_idx = other.color_idx;
      }

      // display neighbour network
      if (displayNetwork) {
        let dt = this.pos.dist(other.pos) / this.r;
        let gray = 125 + 100 * (1 - dt);
        stroke(gray, gray, gray, 10);
        line(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
        noStroke();
      }
    }
  }

  // set off sponteneous flash
  if (this.wait <= 0 && !this.flashing) {
    // random chance: ~5% to flash
    let rnd = random(0.0, 1.0);
    if (rnd > 1 - flashChance) this.setoff();
  }

  // set size
  if (this.flashing) {
    this.timer += deltaTime * 0.01;
    this.intensity = sin(this.timer * flashSpeed);

    // animate only once after timer is set
    if (this.lastFlashCycle < clock.cycle && this.intensity < 0.01) {
      this.flashing = false;
      this.intensity = -0.8;
      // console.log('done:', clock.cycle);
    }

  } else {
    this.timer = 0;
  }
}

Firefly.prototype.draw = function() {
  // calculate size
  let size = (this.intensity + 1) * this.size;

  // calculate color
  let alpha = 100 * (this.intensity + 0.5) + 50;
  let n = this.colors.length;
  let c1 = this.colors[this.color_idx % n];
  let c2 = this.colors[(this.color_idx + 1) % n];
  let c3 = this.colors[(this.color_idx + 2) % n];

  let clr = lerpColor(lerpColor(c1, c2, size * 0.02), c3, size * 0.05);
  clr.setAlpha(alpha);

  // render
  fill(clr);
  circle(this.pos.x, this.pos.y, size);
}
