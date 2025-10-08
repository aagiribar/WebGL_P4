import * as dat from "dat.gui";
import { mat4 } from "gl-matrix";

// Vertex shader source
const vertexShaderSource = `#version 300 es
precision mediump float;

      in vec3 aCoordinates;
      uniform mat4 uModelMatrix;
      uniform mat4 uViewMatrix;

      void main(void) {
        gl_Position = uViewMatrix * uModelMatrix * vec4(aCoordinates, 1.0);
        //gl_Position.z *= -1.0;
        gl_PointSize = 10.0;
      }
`;

// Fragment shader source
const fragmentShaderSource = `#version 300 es
precision mediump float;

out vec4 fragColor;
uniform vec4 uColor;

void main(void) {
  fragColor = uColor;
}
`;

// Global variables
var canvas, gl;
var colorLocation;
var vertex_buffer;
var modelMatrixLoc;
var viewMatrixLoc;
var modelMatrix;
var index_buffer;
var zoomFactor = 1;

// Limits for drawing objects
const xLimit = 8;
const yLimit = 5;
const zLimit = 8;

// Player objects
var player = {
  x: 0,
  y: 0.5,
  z: 10,
  ori: -Math.PI / 2,
  viewAngle: 0,
  playerMovement: 0,
  horizontalCameraMovement: 0,
  verticalCameraMovement: 0,
  playerSpeed: 0.02,
  cameraSpeed: 0.005,
  sprintBoost: 2,
  isSprinting: false,
};

// Calculation of player sprint speed
player.sprintSpeed = player.playerSpeed * player.sprintBoost;

// Scene objects
var blueCube = {
  x: 0,
  y: 0,
  z: 0,
  height: 1,
  width: 1,
  depth: 1,
  color: [0.3, 0.5, 1, 1],
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
}

var orangeCube = {
  x: 0,
  y: 1,
  z: 0,
  height: 0.5,
  width: 0.5,
  depth: 0.5,
  color: [1, 0.7, 0, 1],
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
}

var purpleCube = {
  x: 0,
  y: 1.5,
  z: 0,
  height: 0.25,
  width: 0.25,
  depth: 0.25,
  color: [0.7, 0, 1, 1],
  rotateX: 0,
  rotateY: 45,
  rotateZ: 0,
}

var movementXCube = {
  x: 1.5,
  y: 0,
  z: 1.5,
  height: 1.5,
  width: 0.5,
  depth: 0.5,
  color: [1, 0.4, 0.7, 1],
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  xSpeed: 0.01
}

var movementYCube = {
  x: -1.5,
  y: 0.5,
  z: -1.5,
  height: 0.5,
  width: 1,
  depth: 1.5,
  color: [0.8, 1, 0.6, 1],
  rotateX: 60,
  rotateY: 0,
  rotateZ: 0,
  ySpeed: 0.02
}

var movementZCube = {
  x: -3,
  y: 0,
  z: -4.5,
  height: 1,
  width: 2,
  depth: 2,
  color: [0.2, 0.2, 1, 1],
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  zSpeed: 0.03
}

var chaserCube = {
  x: 5,
  y: 0,
  z: 5,
  height: 1,
  width: 1,
  depth: 0.5,
  color: [1, 1, 1, 1],
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  chasingSpeed: 0.01,
}

var bullet = {
  x: 0,
  y: 0.25,
  z: 10,
  height: 0.1,
  width: 0.1,
  depth: 0.1,
  color: [0, 0, 0, 1],
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  xSpeed: 0,
  ySpeed: 0,
  zSpeed: 0,
  visible: false,
}

// Array of objects
var objects = [
  blueCube,
  orangeCube,
  purpleCube,
  movementXCube,
  movementYCube,
  movementZCube,
  chaserCube,
  bullet
];

// Settings for GUI
var settings = {
  speed: 1.0,
  isChasing: false,
};

// Matrix stack
var matrixStack = [];

// Functions for matrix stack operations
function glPushMatrix() {
  const matrix = mat4.create();
  mat4.copy(matrix, modelMatrix);
  matrixStack.push(matrix);
}

function glPopMatrix() {
  modelMatrix = matrixStack.pop();
}

// Keyboard event handlers
document.onkeydown = onKeyDown;
document.onkeyup = onKeyUp;

// Keyboard key pressed
function onKeyDown(key) {
  key.preventDefault();
  switch (key.keyCode) {
    // up arrow
    case 38: {
      player.playerMovement = player.playerSpeed;
      break;
    }
    // down arrow
    case 40: {
      player.playerMovement = -player.playerSpeed;
      break;
    }
    // left arrow
    case 37: {
      player.horizontalCameraMovement = -player.cameraSpeed;
      break;
    }
    // down arrow
    case 39: {
      player.horizontalCameraMovement = player.cameraSpeed;
      break;
    }
    // A key
    case 65: {
      player.verticalCameraMovement = player.cameraSpeed;
      break;
    }
    // Z key
    case 90: {
      player.verticalCameraMovement = -player.cameraSpeed;
      break;
    }
    // shift key
    case 16: {
      player.isSprinting = true;
      break;
    }
    // space key
    case 32: {
      shootBullet()
      break;
    }
  }
}

// Keyboard key released
function onKeyUp(key) {
  // Stop player movement
  if (key.keyCode == 38 || key.keyCode == 40) {
    player.playerMovement = 0;
  }

  // Stop horizontal camera movement
  if (key.keyCode == 37 || key.keyCode == 39) {
    player.horizontalCameraMovement = 0;
  }

  // Stop vertical camera movement
  if (key.keyCode == 65 || key.keyCode == 90) {
    player.verticalCameraMovement = 0;
  }

  // Stop sprinting
  if (key.keyCode == 16) {
    player.isSprinting = false;
  }
}

function init() {
  // ============ STEP 1: Creating a canvas=================
  canvas = document.getElementById("my_Canvas");
  gl = canvas.getContext("webgl2");

  // create GUI
  var gui = new dat.GUI();
  gui.add(settings, "speed", 0, 2, 0.1);
  gui.add(settings, "isChasing", false);

  // Posicionar el GUI debajo del canvas
  const canvasRect = canvas.getBoundingClientRect();
  gui.domElement.style.position = "absolute";
  gui.domElement.style.top = canvasRect.bottom + window.scrollY + 20 + "px";
  gui.domElement.style.left =
    canvasRect.left +
    window.scrollX +
    (canvasRect.width - gui.domElement.offsetWidth) / 2 +
    "px";

  //========== STEP 2: Create and compile shaders ==========

  // Create a vertex shader object
  const vertShader = gl.createShader(gl.VERTEX_SHADER);

  // Attach vertex shader source code
  gl.shaderSource(vertShader, vertexShaderSource);

  // Compile the vertex shader
  gl.compileShader(vertShader);
  if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
    console.log("vertShader: " + gl.getShaderInfoLog(vertShader));
  }

  // Create fragment shader object
  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);

  // Attach fragment shader source code
  gl.shaderSource(fragShader, fragmentShaderSource);

  // Compile the fragmentt shader
  gl.compileShader(fragShader);
  if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
    console.log("fragShader: " + gl.getShaderInfoLog(fragShader));
  }

  // Create a shader program object to store
  // the combined shader program
  const shaderProgram = gl.createProgram();

  // Attach a vertex shader
  gl.attachShader(shaderProgram, vertShader);

  // Attach a fragment shader
  gl.attachShader(shaderProgram, fragShader);

  // Link both programs
  gl.linkProgram(shaderProgram);

  // Use the combined shader program object
  gl.useProgram(shaderProgram);

  //======== STEP 3: Create buffer objects and associate shaders ========

  // Create an empty buffer object to store the vertex buffer
  vertex_buffer = gl.createBuffer();

  // create index buffer
  index_buffer = gl.createBuffer();

  // Bind vertex buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

  // Get the attribute location
  const coordLocation = gl.getAttribLocation(shaderProgram, "aCoordinates");

  // Point an attribute to the currently bound VBO
  gl.vertexAttribPointer(coordLocation, 3, gl.FLOAT, false, 0, 0);

  // Enable the attribute
  gl.enableVertexAttribArray(coordLocation);

  // Unbind the buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // look up uniform locations
  colorLocation = gl.getUniformLocation(shaderProgram, "uColor");

  modelMatrixLoc = gl.getUniformLocation(shaderProgram, "uModelMatrix");

  viewMatrixLoc = gl.getUniformLocation(shaderProgram, "uViewMatrix");

  gl.enable(gl.DEPTH_TEST);
}

function render() {
  //========= STEP 4: Create the geometry and draw ===============

  // Clear the canvas
  gl.clearColor(0.8, 1.0, 0.5, 1.0);

  // Clear the color buffer bit
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Set the view port
  gl.viewport(0, 0, canvas.width, canvas.height);

  // Bind appropriate array buffer to it
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

  // Update player position
  let actualPlayerMovement = player.isSprinting ? player.playerMovement * player.sprintBoost : player.playerMovement;

  player.x += actualPlayerMovement * Math.cos(player.ori);
  player.z += actualPlayerMovement * Math.sin(player.ori);
  
  // Update camera vector
  let actualHorizontalCameraMovement = player.isSprinting ? player.horizontalCameraMovement * player.sprintBoost : player.horizontalCameraMovement;
  let actualVerticalCameraMovement = player.isSprinting ? player.verticalCameraMovement * player.sprintBoost : player.verticalCameraMovement;

  player.ori += actualHorizontalCameraMovement;
  player.viewAngle += actualVerticalCameraMovement;
  
  // Limit vertical camera angle
  if (player.viewAngle > 5) {
    player.viewAngle = 5;
  }

  if (player.viewAngle < -5) {
    player.viewAngle = -5;
  }

  // Calculate new chaser cube coordinates
  if (settings.isChasing) {
    chaserCube.x = chaserCube.x - (chaserCube.x - player.x) * chaserCube.chasingSpeed * settings.speed;
    chaserCube.z = chaserCube.z - (chaserCube.z - player.z) * chaserCube.chasingSpeed * settings.speed;
  }

  // draw geometry
  // Set the model Matrix.
  modelMatrix = mat4.create();
  mat4.identity(modelMatrix);

  // perspective
  const viewMatrix = mat4.create();
  mat4.perspective(
    viewMatrix,
    Math.PI / 4, // vertical opening angle
    1, // ratio width-height
    0.5, // z-near
    30 // z-far
  );
  gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);

  const eye = [player.x, player.y, player.z];
  const center = [
    player.x + Math.cos(player.ori),
    player.y + player.viewAngle,
    player.z + Math.sin(player.ori),
  ];
  mat4.lookAt(modelMatrix, eye, center, [0, 1, 0]);
  mat4.scale(modelMatrix, modelMatrix, [zoomFactor, zoomFactor, zoomFactor]);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
  
  // Draw objects
  for (let object of objects) {
    // Calculate new bullet coordinates
    // If bullet is away from player, disappears
    if (object === bullet) {
      object.x += object.xSpeed * settings.speed;
      if (Math.abs(object.x - player.x) >= xLimit * 2) {
        object.xSpeed = 0;
        object.visible = false;
      }

      object.z += object.zSpeed * settings.speed;
      if (Math.abs(object.z - player.z) >= zLimit * 2) {
        object.zSpeed = 0;
        object.visible = false;
      }
    }
    // Calculate other objects position
    // If an object reach the limit, it rebounds
    // Color of objects is set depending on the coordinates
    else {
      if (object.xSpeed !== undefined) {
        object.x += object.xSpeed * settings.speed;
        if (object.x > xLimit || object.x < -xLimit) {
          object.xSpeed = -object.xSpeed;
        }
        object.color = [Math.abs(object.x / 8), object.color[1], object.color[2], 1];
      }
      
      if (object.ySpeed !== undefined) {
        object.y += object.ySpeed * settings.speed;
        if (object.y > yLimit || object.y <= object.height) {
          object.ySpeed = -object.ySpeed;
        }
        object.color = [object.color[0], Math.abs(object.y / 5), object.color[2], 1];
      }
      
      if (object.zSpeed !== undefined) {
        object.z += object.zSpeed * settings.speed;
        if (object.z > zLimit || object.z < -zLimit) {
          object.zSpeed = -object.zSpeed;
        }
        object.color = [object.color[0], object.color[1], Math.abs(object.z / 8), 1];
      }
    }

    // Draw visible objects
    if (object.visible === undefined || object.visible === true) {
      drawObject(object);
    }
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  // drawGround
  renderGround(15, 15);

  // Unbind the buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // start animation loop
  window.requestAnimationFrame(render);
}

// Function that render a cube
function renderCube(color) {
  glPushMatrix();

  // Position the cube
  mat4.translate(modelMatrix, modelMatrix, [-0.5, 0, -0.5]);
  gl.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix);
  // create vertices
  const arrayV = new Float32Array([
    0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1,
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, arrayV, gl.STATIC_DRAW);
  // create edges
  const arrayI = new Uint16Array([
    0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7,
  ]);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrayI, gl.STATIC_DRAW);
  // draw cube
  gl.uniform4fv(colorLocation, [0, 0, 0, 1]);
  gl.drawElements(gl.LINES, 24, gl.UNSIGNED_SHORT, 0);

  // create faces
  const arrayF = new Uint16Array([
    1, 0, 3,  1, 3, 2, // cara trasera
    4, 5, 6,  4, 6, 7, // cara delantera
    7, 6, 2,  7, 2, 3, // cara superior
    0, 1, 5,  0, 5, 4, // cara inferior
    5, 1, 2,  5, 2, 6, // cara derecha
    0, 4, 7,  0, 7, 3, // cara izquierda
  ]);

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrayF, gl.STATIC_DRAW);
  // draw cube
  gl.uniform4fv(colorLocation, color);
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

  glPopMatrix();
}

// draw squared floor
function renderGround(size, n) {
  glPushMatrix();

  // Position and scale grouns
  mat4.scale(modelMatrix, modelMatrix, [size, size, size]);
  mat4.translate(modelMatrix, modelMatrix, [-0.5, 0, -0.5]);
  gl.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix);

  // creamos vector vértices
  var k = 0;
  const arrayV = new Float32Array(12 * n);
  for (i = 0; i < n; i++) {
    arrayV[k++] = i / (n - 1);
    arrayV[k++] = 0;
    arrayV[k++] = 0;
    arrayV[k++] = i / (n - 1);
    arrayV[k++] = 0;
    arrayV[k++] = 1;
  }
  for (var i = 0; i <= n; i++) {
    arrayV[k++] = 0;
    arrayV[k++] = 0;
    arrayV[k++] = i / (n - 1);
    arrayV[k++] = 1;
    arrayV[k++] = 0;
    arrayV[k++] = i / (n - 1);
  }

  gl.bufferData(gl.ARRAY_BUFFER, arrayV, gl.STATIC_DRAW);
  gl.uniform4fv(colorLocation, [0, 0, 0, 1]);
  gl.drawArrays(gl.LINES, 0, 4 * n);

  glPopMatrix();
}

// Function that draws an object
function drawObject(object) {
  glPushMatrix();

  // Position and scale the object
  mat4.translate(modelMatrix, modelMatrix, [object.x, object.y, object.z]);
  mat4.scale(modelMatrix, modelMatrix, [object.width, object.height, object.depth]);

  // Rotate the object
  mat4.rotateX(modelMatrix, modelMatrix, object.rotateX);
  mat4.rotateY(modelMatrix, modelMatrix, object.rotateY);
  mat4.rotateZ(modelMatrix, modelMatrix, object.rotateZ);

  gl.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix);
  renderCube(object.color);

  glPopMatrix();
}

// Function that shoots the bullet
function shootBullet() {
  bullet.x = player.x;
  bullet.z = player.z;

  bullet.xSpeed = 0.001 * player.x + Math.cos(player.ori);
  bullet.zSpeed = 0.001 * player.z + Math.sin(player.ori);

  bullet.visible = true;
}

// CÓDIGO PRINCIPAL
init();
render();
