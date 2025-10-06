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

var canvas, gl;
var colorLocation;
var vertex_buffer;
var modelMatrixLoc;
var viewMatrixLoc;
var modelMatrix;
var index_buffer;

var zoomFactor = 1;

var player = {
  x: 0,
  y: 0.5,
  z: 10,
  ori: -Math.PI / 2,
};

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

var objects = [
  blueCube,
  orangeCube,
  purpleCube,
  movementXCube,
  movementYCube,
  movementZCube,
];

/*var settings = {
  translateX: 0.0,
  translateY: 0.0,
  rotateZ: 0.0,
};*/

var matrixStack = [];
function glPushMatrix() {
  const matrix = mat4.create();
  mat4.copy(matrix, modelMatrix);
  matrixStack.push(matrix);
}

function glPopMatrix() {
  modelMatrix = matrixStack.pop();
}

/*
var rotateX = 0,
  rotateY = 0;
var mouseX, mouseY;

// add mouse handlers
document.onmousedown = onMouseDown;
document.onmousemove = onMouseMove;
document.onwheel = zoom;

function onMouseDown(e) {
  if (e.buttons == 1 && e.srcElement == canvas) {
    mouseX = e.pageX;
    mouseY = e.pageY;
  }
}
function onMouseMove(e) {
  if (e.buttons == 1 && e.srcElement == canvas) {
    rotateY = rotateY + (e.pageX - mouseX) * 0.01;
    rotateX = rotateX + (e.pageY - mouseY) * 0.01;
    mouseX = e.pageX;
    mouseY = e.pageY;
    //console.log("move = ("+mouseX+","+mouseY+")");
  }
}


function zoom(e) {
  if (e.deltaY < 0) zoomFactor *= 1.1;
  else zoomFactor *= 0.9;
}
*/

document.onkeydown = onKeyDown;
function onKeyDown(key) {
  key.preventDefault();
  switch (key.keyCode) {
    // up arrow
    case 38: {
      player.x = player.x + 0.1 * Math.cos(player.ori);
      player.z = player.z + 0.1 * Math.sin(player.ori);
      break;
    }
    // down arrow
    case 40: {
      player.x = player.x - 0.1 * Math.cos(player.ori);
      player.z = player.z - 0.1 * Math.sin(player.ori);
      break;
    }
    // left arrow
    case 37: {
      player.ori -= 0.02;
      break;
    }
    // down arrow
    case 39: {
      player.ori += 0.02;
      break;
    }
  }
}

function init() {
  // ============ STEP 1: Creating a canvas=================
  canvas = document.getElementById("my_Canvas");
  gl = canvas.getContext("webgl2");

  /*// create GUI
  var gui = new dat.GUI();
  gui.add(settings, "translateX", -1.0, 1.0, 0.01);
  gui.add(settings, "translateY", -1.0, 1.0, 0.01);
  gui.add(settings, "rotateZ", -180, 180);

  // Posicionar el GUI debajo del canvas
  const canvasRect = canvas.getBoundingClientRect();
  gui.domElement.style.position = "absolute";
  gui.domElement.style.top = canvasRect.bottom + window.scrollY + 20 + "px";
  gui.domElement.style.left =
    canvasRect.left +
    window.scrollX +
    (canvasRect.width - gui.domElement.offsetWidth) / 2 +
    "px";
    */

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
    player.y,
    player.z + Math.sin(player.ori),
  ];
  mat4.lookAt(modelMatrix, eye, center, [0, 1, 0]);

  // mouse transformations
  mat4.scale(modelMatrix, modelMatrix, [zoomFactor, zoomFactor, zoomFactor]);
  // rotate scene
  //mat4.rotateY(modelMatrix, modelMatrix, rotateY);
  //mat4.rotateX(modelMatrix, modelMatrix, rotateX);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
  
  for (let object of objects) {
    if (object.xSpeed !== undefined) {
      object.x += object.xSpeed;
      if (object.x > 8 || object.x < -8) {
        object.xSpeed = -object.xSpeed;
      }
      object.color = [Math.abs(object.x / 8), object.color[1], object.color[2], 1];
    }

    if (object.ySpeed !== undefined) {
      object.y += object.ySpeed;
      if (object.y > 5 || object.y <= object.height) {
        object.ySpeed = -object.ySpeed;
      }
      object.color = [object.color[0], Math.abs(object.y / 5), object.color[2], 1];
    }

    if (object.zSpeed !== undefined) {
      object.z += object.zSpeed;
      if (object.z > 8 || object.z < -8) {
        object.zSpeed = -object.zSpeed;
      }
      object.color = [object.color[0], object.color[1], Math.abs(object.z / 8), 1];
    }

    drawObject(object);
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  // drawGround
  renderGround(15, 15);

  // Unbind the buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  //document.getElementById("debug").textContent = "y = " + player1.y.toFixed(2);

  // start animation loop
  window.requestAnimationFrame(render);
}

function renderCube(color) {
  glPushMatrix();
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

function drawObject(object) {
  glPushMatrix();
  mat4.translate(modelMatrix, modelMatrix, [object.x, object.y, object.z]);
  mat4.scale(modelMatrix, modelMatrix, [object.width, object.height, object.depth]);
  mat4.rotateX(modelMatrix, modelMatrix, object.rotateX);
  mat4.rotateY(modelMatrix, modelMatrix, object.rotateY);
  mat4.rotateZ(modelMatrix, modelMatrix, object.rotateZ);
  gl.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix);
  renderCube(object.color);
  glPopMatrix();
}

// CÓDIGO PRINCIPAL
init();
render();
