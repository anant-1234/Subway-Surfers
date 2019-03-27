var cubeRotation = 0.0;



function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
    width, height, border, srcFormat, srcType,
    pixel);

  const image = new Image();
  image.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
      srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      // Yes, it's a power of 2. Generate mips.
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      // No, it's not a power of 2. Turn of mips and set
      // wrapping to clamp to edge
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}




main();

//
// Start here
//

var score = 0;
var star_enabled = 0;
var c;
var c1;
var p;
var dogs;
var grnd;
var rail1;
var rail2;
var wall1, wall2;
var coins;
var trains;
var flyboosts;
var jumpboosts;
var _obs1;
var _obs2;
var cones;
var stars;
var orig_y = 0.25;
var y_vel = 0.25;
var in_air = 0;
var timer_air = 0;
var high_jump = 0;
var timer_jump = 0;
var thres_z = -50;
var cur_zspeed = -0.09;
var risk = 0;
var risk_timer = 0;
var camera_height = 3;
var flash = 0;
var cleg;
var pleg;
var leg_timer = 0;
var new_grnd = 0.8;
var face;
var p_face;

var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;
var gPressed = false;
var fPressed = false;

function keyDownHandler(event) {
  if (event.keyCode == 39) {
    rightPressed = true;
  }
  else if (event.keyCode == 37) {
    leftPressed = true;
  }
  if (event.keyCode == 40) {
    downPressed = true;
  }
  if (event.keyCode == 38) {
    upPressed = true;
  }
  if (event.keyCode == 71) {
    gPressed = true;
  }
  if (event.keyCode == 70) {
    fPressed = true;
  }
}

function keyUpHandler(event) {
  if (event.keyCode == 39) {
    rightPressed = false;
  }
  if (event.keyCode == 37) {
    leftPressed = false;
  }
  if (event.keyCode == 40) {
    downPressed = false;
  }
  if (event.keyCode == 38) {
    upPressed = false;
  }
  if (event.keyCode == 71) {
    gPressed = false;
  }
  if (event.keyCode == 70) {
    fPressed = false;
  }
}

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

function main() {
  const canvas = document.querySelector("#glcanvas");
  const gl =
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);
  // gl.disable(gl.DEPTH_TEST);
  flyboosts = [];
  coins = [];
  jumpboosts = [];
  rail1 = [];
  rail2 = [];
  wall1 = [];
  wall2 = [];
  trains = [];
  _obs1 = [];
  _obs2 = [];
  cones = [];
  cleg = [];
  pleg = [];
  stars = []
  c = new cube(gl, [-1.75, 0.8, -4]);
  face = new faces(gl, [-1.75, 0.8, -4], 'face.jpg');
  p_face = new faces(gl, [-1.75, 0.8, 0], 'police.jpeg');
  c1 = new cube(gl, [1.5, 0.0, -6.0]);
  grnd = new ground(gl, [0, -1.0, 0]);
  p = new police(gl, [-1.75, 0.8, 0]);
  dogs = new dog(gl, [-1.0, 0, 1]);
  cleg.push(new legs(gl, [-2.00, 0, -4], 15));
  cleg.push(new legs(gl, [-1.5, 0, -4], -15));
  pleg.push(new legs(gl, [-2.00, 0, 0], 15));
  pleg.push(new legs(gl, [-1.5, 0, 0], -15));

  // Scenery
  for (var i = 0; i < 100; i++) {
    coins.push(new coin(gl, [-1.75, 0.2, -Math.floor(Math.random() * 500)]));
    coins.push(new coin(gl, [1.75, 0.2, -Math.floor(Math.random() * 500) - 120]));
  }
  for (var i = 0; i < 4; i += 1) {
    trains.push(new train(gl, [2.0, 0.4, -5 - 120 * i]));
    trains.push(new train(gl, [-2.0, 0.4, -115 - 120 * i]));
    _obs1.push(new obs1(gl, [-1.95, -0.5, -30 - 120 * i]));
    _obs1.push(new obs1(gl, [-1.95, -0.5, -60 - 120 * i]));
    cones.push(new cone(gl, [-1.95, -0.3, -45 - 120 * i]));
    cones.push(new cone(gl, [1.95, -0.3, -60 - 120 * i]));
    _obs2.push(new obs2(gl, [-1.95, 1.4, -80 - 120 * i]));
    _obs2.push(new obs2(gl, [1.95, 1.4, -90 - 120 * i]));
    jumpboosts.push(new jumpboost(gl, [-1.75, 0.2, -100 - 120 * i]));
    jumpboosts.push(new jumpboost(gl, [1.75, 0.2, -30 - 120 * i]));
    stars.push(new star(gl, [1.95, -0.5, -50 - 120 * i]));
    flyboosts.push(new flyboost(gl, [1.75, 0.2, -75 - 120 * i]));
    for (var j = 0; j < 20; j += 1) {
      coins.push(new coin(gl, [1.75, 3.4, -75 - 120 * i - 4 * j]));
      coins.push(new coin(gl, [-1.75, 3.4, -75 - 120 * i - 4 * j]));
    }
  }


  for (var z = -300; z <= 10; z += 10) {
    rail1.push(new rail(gl, [-2.0, -0.95, z]));
    rail2.push(new rail(gl, [2.0, -0.95, z]));
    wall1.push(new wall(gl, [0.0, -0.95, z]));
    wall2.push(new wall(gl, [8.0, -0.95, z]));
  }



  // If we don't have a GL context, give up now

  if (!gl) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
    return;
  }

  // Vertex shader program

  const vsSource = `
  attribute vec4 aVertexPosition;
  attribute vec2 aTextureCoord;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  varying highp vec2 vTextureCoord;
  void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;
  }
`;
  // Fragment shader program

  const fsSource = `
  varying highp vec2 vTextureCoord;
  uniform sampler2D uSampler;
  void main(void) {
    gl_FragColor = texture2D(uSampler, vTextureCoord);
  }
`;
  // GreyScale
  const fsSource2 = `
  precision mediump float;
  varying highp vec2 vTextureCoord;
  highp vec4 temp;
  uniform sampler2D uSampler;

  void main(void) {
    temp = texture2D(uSampler, vTextureCoord);
    float sum = (temp.r + temp.g + temp.b)/ 3.0;
    gl_FragColor = vec4(sum, sum, sum, 1);
}
`;
  // Flash
  const fsSource3 = `
  precision mediump float;
  varying highp vec2 vTextureCoord;
  highp vec4 temp;
  uniform sampler2D uSampler;

  void main(void) {
    temp = texture2D(uSampler, vTextureCoord);
    gl_FragColor = vec4(temp.r * 1.3, temp.g * 1.3, temp.b * 1.3, 1);
}
`;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  const shaderProgram2 = initShaderProgram(gl, vsSource, fsSource2);
  const shaderProgram3 = initShaderProgram(gl, vsSource, fsSource3);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
    },
  };
  const programInfo2 = {
    program: shaderProgram2,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram2, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgram2, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram2, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram2, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram2, 'uSampler'),
    },
  };
  const programInfo3 = {
    program: shaderProgram3,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram3, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgram3, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram3, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram3, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram3, 'uSampler'),
    },
  };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  //const buffers
  var pinfo = programInfo;
  function keep_legs() {
    cleg[0].pos[2] = c.pos[2];
    cleg[1].pos[2] = c.pos[2];
    cleg[0].pos[0] = c.pos[0] - 0.25;
    cleg[1].pos[0] = c.pos[0] + 0.25;
    cleg[0].pos[1] = c.pos[1] - 0.8;
    cleg[1].pos[1] = c.pos[1] - 0.8;

    pleg[0].pos[2] = p.pos[2];
    pleg[1].pos[2] = p.pos[2];
    pleg[0].pos[0] = p.pos[0] - 0.25;
    pleg[1].pos[0] = p.pos[0] + 0.25;
    pleg[0].pos[1] = p.pos[1] - 0.8;
    pleg[1].pos[1] = p.pos[1] - 0.8;
    for (var i = 0; i < 3; i++) {
      face.pos[i] = c.pos[i];
      p_face.pos[i] = p.pos[i];
    }
  }
  function tick_elements() {
    flash += 1;
    if (flash >= 50) {
      flash = 0;
      if (gPressed) {
        pinfo = programInfo2;
      }
      else if (fPressed) {
        if (pinfo == programInfo3) {
          pinfo = programInfo;
        }
        else {
          pinfo = programInfo3;
        }
      }
      else {
        pinfo = programInfo;
      }
    }
    leg_timer += 1;
    if (leg_timer >= 10 && c.pos[1] == 0.8) {
      cleg[0].tick();
      cleg[1].tick();
      pleg[0].tick();
      pleg[1].tick();
      leg_timer = 0;
    }
    dogs.pos[2] += c.speed_z;
    dogs.tick();
    c.tick(in_air);
    p.tick(in_air);
    // console.log("Dog's Speed");
    // console.log(dogs.speed_z);
    // console.log("Person's Speed");
    // console.log(c.speed_z);
    for (var i = 0; i < coins.length; i++) {
      coins[i].tick();
    }
    for (var i = 0; i < flyboosts.length; i++) {
      flyboosts[i].tick();
    }
    for (var i = 0; i < jumpboosts.length; i++) {
      jumpboosts[i].tick();
    }
    for (var i = 0; i < stars.length; i++) {
      stars[i].tick();
    }
  }

  function check_stat() {
    timer_air += 1;
    timer_jump += 1;
    risk_timer += 1;
    if (in_air == 1 && timer_air >= 200) {
      in_air = 0;
      camera_height = 3.0;
    }
    if (timer_jump >= 300) {
      high_jump = 0;
      y_vel = orig_y;
    }
    if (risk_timer >= 400) {
      risk = 0;
    }
  }

  function game_over() {
    alert("Sorry!! Game Over. Final Score = " + score);
    return 0;
  }
  var then = 0;

  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001; // convert to seconds
    const deltaTime = now - then;
    then = now;
    // console.log(c.pos[2]);
    // console.log(c.speed_z);
    // c.speed_z = cur_zspeed;
    document.getElementById("score").innerHTML = "Score : " + score;
    drawScene(gl, pinfo, deltaTime);
    tick_elements();
    check_stat();
    check_input();
    keep_legs();

    // Check collision for coins
    for (var i = 0; i < coins.length; i++) {
      var a = {};
      var b = {};
      a.x = c.pos[0];
      a.y = c.pos[1] - 0.8;
      a.z = c.pos[2];
      b.x = coins[i].pos[0];
      b.y = coins[i].pos[1];
      b.z = coins[i].pos[2];
      a.height = 0.5;
      a.width = 0.5;
      if (detect_collision(a, b)) {
        // console.log("HUAAAAA");
        if (star_enabled)
          score += 10;
        else
          score += 5;
        var idx = coins.indexOf(coins[i]);
        coins.splice(idx, 1);
      }
    }

    // Check collision for stars
    for (var i = 0; i < stars.length; i++) {
      var a = {};
      var b = {};
      a.x = c.pos[0];
      a.y = c.pos[1] - 0.8;
      a.z = c.pos[2];
      b.x = stars[i].pos[0];
      b.y = stars[i].pos[1];
      b.z = stars[i].pos[2];
      a.height = 0.5;
      a.width = 0.5;
      if (detect_collision(a, b)) {
        star_enabled = 1;
        var idx = stars.indexOf(stars[i]);
        stars.splice(idx, 1);
      }
    }
    // Check collision for flying boosts
    for (var i = 0; i < flyboosts.length; i++) {
      var a = {};
      var b = {};
      a.x = c.pos[0];
      a.y = c.pos[1] - 0.8;
      a.z = c.pos[2];
      b.x = flyboosts[i].pos[0];
      b.y = flyboosts[i].pos[1];
      b.z = flyboosts[i].pos[2];
      a.height = 0.5;
      a.width = 0.5;
      if (detect_collision(a, b)) {
        var idx = flyboosts.indexOf(flyboosts[i]);
        flyboosts.splice(idx, 1);
        in_air = 1;
        camera_height += 2.0;

        timer_air = 0;
      }
    }
    // Check collision for jumping boosts
    for (var i = 0; i < jumpboosts.length; i++) {
      var a = {};
      var b = {};
      a.x = c.pos[0];
      a.y = c.pos[1] - 0.8;
      a.z = c.pos[2];
      b.x = jumpboosts[i].pos[0];
      b.y = jumpboosts[i].pos[1];
      b.z = jumpboosts[i].pos[2];
      a.height = 0.5;
      a.width = 0.5;
      if (detect_collision(a, b)) {
        var idx = jumpboosts.indexOf(jumpboosts[i]);
        jumpboosts.splice(idx, 1);
        high_jump = 1;
        y_vel = 0.5;
        timer_jump = 0;
      }
    }

    // Check collision for obs2
    for (var i = 0; i < _obs2.length; i++) {
      var a = {};
      var b = {};
      a.x = c.pos[0];
      a.y = c.pos[1] - 0.8;
      a.z = c.pos[2];
      b.x = _obs2[i].pos[0];
      b.y = _obs2[i].pos[1] - 1.4;
      b.z = _obs2[i].pos[2];
      a.height = 0.5;
      a.width = 0.5;
      if (detect_collision(a, b)) {
        game_over();
        return 0;
        // var idx = _obs2.indexOf(_obs2[i]);
        // _obs2.splice(idx, 1);
        // console.log(a);
        // console.log(b);
        // console.log("bye");
        // return 0;
        // console.log("HHHHHHHH/");
      }
    }

    // Check collision for obs1 SLOW DOWN
    for (var i = 0; i < _obs1.length; i++) {
      var a = {};
      var b = {};
      a.x = c.pos[0];
      a.y = c.pos[1] - 0.8;
      a.z = c.pos[2];
      b.x = _obs1[i].pos[0];
      b.y = _obs1[i].pos[1];
      b.z = _obs1[i].pos[2];
      a.height = 0.5;
      a.width = 0.5;
      // console.log(a);
      // console.log(b);
      if (detect_collision(a, b)) {
        if (risk == 1) {
          game_over();
          return 0;
        }
        risk = 1;
        p.pos[2] = c.pos[2] + 3;
        risk_timer = 0;
        var idx = _obs1.indexOf(_obs1[i]);
        _obs1.splice(idx, 1);
      }
    }

    // Check collision for cones SLOW DOWN
    for (var i = 0; i < cones.length; i++) {
      var a = {};
      var b = {};
      a.x = c.pos[0];
      a.y = c.pos[1] - 0.8;
      a.z = c.pos[2];
      b.x = cones[i].pos[0];
      b.y = cones[i].pos[1];
      b.z = cones[i].pos[2];
      a.height = 0.5;
      a.width = 0.5;
      // console.log(a);
      // console.log(b);
      if (detect_collision(a, b)) {
        if (risk == 1) {
          game_over()
          return 0;
        }
        risk = 1;
        p.pos[2] = c.pos[2] + 3;
        risk_timer = 0;
        var idx = cones.indexOf(cones[i]);
        cones.splice(idx, 1);
      }
    }

    // Check collision for trains DIE
    for (var i = 0; i < trains.length; i++) {
      var a = {};
      var b = {};
      a.x = c.pos[0];
      a.y = c.pos[1] - 0.8;
      a.z = c.pos[2];
      b.x = trains[i].pos[0];
      b.y = trains[i].pos[1];
      b.z = trains[i].pos[2];
      a.height = 0.5;
      a.width = 0.5;
      a.depth = 0.5;
      b.width = 1.0;
      b.height = 1.25;
      b.depth = 5.0;
      // console.log(a);
      // console.log(b);
      if (detect_collisionC(a, b)) {
        if (a.y > b.y) {
          c.pos[1] = 2.7;
          keep_legs();
        }
        else {
          game_over();
          var idx = trains.indexOf(trains[i]);
          trains.splice(idx, 1);
          return 0;
        }
      }
    }
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}
function check_input() {
  if (rightPressed) {
    c.speed_x = 0.1;
    p.speed_x = 0.1;
    dogs.speed_x = 0.1;
  }
  if (leftPressed) {
    c.speed_x = -0.1;
    p.speed_x = -0.1;
    dogs.speed_x = -0.1;

  }
  if (upPressed && c.pos[1] == new_grnd && ((in_air == 0) || (c.pos[1] == 2.7))) {
    c.speed_y = y_vel;
    p.speed_y = y_vel;
  }
  if (downPressed && c.pos[1] == new_grnd) {
    c.pos[1] = -0.4;
  }
}

//
// Draw the scene.
//

function detect_collision(a, b) {
  if (Math.abs(a.z - b.z) <= a.width && Math.abs(a.y - b.y) <= a.height && Math.abs(a.x - b.x) <= a.height)
    return true;
  return false;
}

function detect_collisionC(a, b) {
  if (Math.abs(a.z - b.z) <= a.depth + b.depth && Math.abs(a.y - b.y) <= a.height + b.height && Math.abs(a.x - b.x) <= a.width + b.width)
    return true;
  return false;
}
function drawScene(gl, pinfo, deltaTime) {
  gl.clearColor(1.0, 1.0, 1.0, 1.0); // Clear to black, fully opaque
  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = (45 * Math.PI) / 180; // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  var cameraMatrix = mat4.create();
  mat4.translate(cameraMatrix, cameraMatrix, [0, c.pos[1] + 1, c.pos[2] + 13]);
  var cameraPosition = [cameraMatrix[12], cameraMatrix[13], cameraMatrix[14]];

  var up = [0, 1, 0];

  mat4.lookAt(cameraMatrix, cameraPosition, [0, c.pos[1] + 1, c.pos[2]], up);

  var viewMatrix = cameraMatrix; //mat4.create();

  //mat4.invert(viewMatrix, cameraMatrix);

  var viewProjectionMatrix = mat4.create();
  mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);
  // trains[0].drawCube(gl, viewProjectionMatrix, pinfo, deltaTime);
  c.drawCube(gl, viewProjectionMatrix, pinfo, deltaTime);
  face.drawCube(gl, viewProjectionMatrix, pinfo, deltaTime);
  p_face.drawCube(gl, viewProjectionMatrix, pinfo, deltaTime);
  p.drawCube(gl, viewProjectionMatrix, pinfo, deltaTime);
  dogs.drawCube(gl, viewProjectionMatrix, pinfo, deltaTime);
  grnd.drawGround(gl, viewProjectionMatrix, pinfo, deltaTime);
  for (var i = 0; i < rail1.length; i++) {
    rail1[i].drawCube(gl, viewProjectionMatrix, pinfo, deltaTime);
    rail2[i].drawCube(gl, viewProjectionMatrix, pinfo, deltaTime);
    wall1[i].drawCube(gl, viewProjectionMatrix, pinfo, deltaTime);
    wall2[i].drawCube(gl, viewProjectionMatrix, pinfo, deltaTime);
  }
  for (var i = 0; i < cleg.length; i++) {
    cleg[i].drawCube(gl, viewProjectionMatrix, pinfo, deltaTime);
  }
  for (var i = 0; i < cleg.length; i++) {
    pleg[i].drawCube(gl, viewProjectionMatrix, pinfo, deltaTime);
  }
  for (var i = 0; i < cones.length; i++) {
    cones[i].drawCube(gl, viewProjectionMatrix, pinfo, deltaTime);
  }
  for (var i = 0; i < stars.length; i++) {
    stars[i].drawCube(gl, viewProjectionMatrix, pinfo, deltaTime);
  }
  for (var i = 0; i < trains.length; i++) {
    trains[i].drawCube(gl, viewProjectionMatrix, pinfo, deltaTime);
  }
  for (var i = 0; i < coins.length; i++) {
    coins[i].drawCube(gl, viewProjectionMatrix, pinfo, deltaTime);
  }
  for (var i = 0; i < flyboosts.length; i++) {
    flyboosts[i].drawCube(gl, viewProjectionMatrix, pinfo, deltaTime);
  }
  for (var i = 0; i < jumpboosts.length; i++) {
    jumpboosts[i].drawCube(gl, viewProjectionMatrix, pinfo, deltaTime);
  }
  for (var i = 0; i < _obs1.length; i++) {
    _obs1[i].drawCube(gl, viewProjectionMatrix, pinfo, deltaTime);
  }
  for (var i = 0; i < _obs2.length; i++) {
    _obs2[i].drawCube(gl, viewProjectionMatrix, pinfo, deltaTime);
  }

  //c1.drawCube(gl, projectionMatrix, pinfo, deltaTime);
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, appearance) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, appearance);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      "Unable to initialize the shader program: " +
      gl.getProgramInfoLog(shaderProgram)
    );
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      "An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader)
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
