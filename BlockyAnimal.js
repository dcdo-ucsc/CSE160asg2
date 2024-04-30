let VERTEX_SHADER = `
    attribute vec4 a_Position;

    uniform mat4 u_ModelMatrix;

    uniform mat4 u_GlobalRotateMatrix;

    void main(){
        gl_Position = u_GlobalRotateMatrix* u_ModelMatrix * a_Position;
    }

`;

let FRAGMENT_SHADER = `
    precision mediump float;

    uniform vec4 u_FragColor;

    void main(){ 
        gl_FragColor = u_FragColor;
    }

`;

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let canvas;
let gl;
let a_position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setUpWebGL() {
    canvas = document.getElementById("webgl");

    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
    if (!gl) {
        console.log("Failed to get WebGL context.");
        return -1;
    }

    gl.enable(gl.DEPTH_TEST);
}

function vGLSL() {

    if (!initShaders(gl, VERTEX_SHADER, FRAGMENT_SHADER)) {
        console.log("Failed to load/compile shaders");
        return -1;
    }

    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

let g_globalAngle = 0;
let g_lastSegmentAngle = 0;
let g_secondLastSegmentAngle = 0;
let g_animation = false;
let mouseDown = false;
let lastMouseX = null;
let lastMouseY = null;

function HTMLactions(){

    document.getElementById("animationOnButton").onclick = function() {g_animation = true;};
    document.getElementById("animationOffButton").onclick = function() {g_animation = false;};

    document.getElementById('lastSegmentAngle').addEventListener('input', function() {g_lastSegmentAngle = this.value;renderScene();});
    document.getElementById('secondLastSegmentAngle').addEventListener('input', function() {g_secondLastSegmentAngle = this.value;renderScene();});    
    document.getElementById('angleSlider').addEventListener('mousemove', function() {g_globalAngle = this.value; renderScene(); });

    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;
}

function main() {

    console.log("Hai :D!!!");

    setUpWebGL();

    vGLSL();

    HTMLactions();

    clearCanvas();

    requestAnimationFrame(tick);

}

var g_shapeList = [];

function clearCanvas() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    g_shapeList = [];
    console.log("Canvas Cleared!");
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick(){

    g_seconds = performance.now()/1000.0 - g_startTime;
    console.log(g_seconds);

    updateAnimationAngles();

    renderScene();

    requestAnimationFrame(tick);
}

function handleMouseDown(event) {
    mouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
}

function handleMouseUp(event) {
    mouseDown = false;
}

function handleMouseMove(event) {
    if (!mouseDown) {
        return;
    }
    const newX = event.clientX;
    const newY = event.clientY;

    const deltaX = newX - lastMouseX;
    const deltaY = newY - lastMouseY;

    const newAngle = g_globalAngle + deltaX / 5;
    g_globalAngle = newAngle % 360;

    lastMouseX = newX;
    lastMouseY = newY;

    renderScene();
}

function convertCoord(ev){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    return [x, y];
}

function updateAnimationAngles() {
    if (g_animation) {
        g_secondLastSegmentAngle = 45 * Math.sin(g_seconds);
        g_lastSegmentAngle = 45 * Math.cos(g_seconds);
    }
}

function renderScene(){

    var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const segmentLength = 0.1;
    const amplitude = 10;
    const waveLength = 1.5;
    const speed = 1;

    let baseMatrix = new Matrix4(); 

    let segment1 = new Cube();
    let phase1 = g_seconds * speed;
    let angle1 = amplitude * Math.sin(phase1);
    baseMatrix.translate(segmentLength, 0, 0);
    baseMatrix.rotate(angle1, 0, 0, 1);
    segment1.color = [0.1, 0.8, 0.1, 1.0];
    segment1.matrix = new Matrix4(baseMatrix);
    segment1.matrix.scale(segmentLength, 0.05, 0.05);
    segment1.render();

    let segment2 = new Cube();
    let phase2 = g_seconds * speed + (1 / 8) * waveLength;
    let angle2 = amplitude * Math.sin(phase2);
    baseMatrix.translate(segmentLength, 0, 0);
    baseMatrix.rotate(angle2, 0, 0, 1);
    segment2.color = [0.1, 0.8, 0.1, 1.0];
    segment2.matrix = new Matrix4(baseMatrix);
    segment2.matrix.scale(segmentLength, 0.05, 0.05);
    segment2.render();

    let segment3 = new Cube();
    let phase3 = g_seconds * speed + (2 / 8) * waveLength;
    let angle3 = amplitude * Math.sin(phase3);
    baseMatrix.translate(segmentLength, 0, 0);
    baseMatrix.rotate(angle3, 0, 0, 1);
    segment3.color = [0.1, 0.8, 0.1, 1.0];
    segment3.matrix = new Matrix4(baseMatrix);
    segment3.matrix.scale(segmentLength, 0.05, 0.05);
    segment3.render();

    let segment4 = new Cube();
    let phase4 = g_seconds * speed + (3 / 8) * waveLength;
    let angle4 = amplitude * Math.sin(phase4);
    baseMatrix.translate(segmentLength, 0, 0);
    baseMatrix.rotate(angle4, 0, 0, 1);
    segment4.color = [0.1, 0.8, 0.1, 1.0];
    segment4.matrix = new Matrix4(baseMatrix);
    segment4.matrix.scale(segmentLength, 0.05, 0.05);
    segment4.render();

    let segment5 = new Cube();
    let phase5 = g_seconds * speed + (4 / 8) * waveLength;
    let angle5 = amplitude * Math.sin(phase5);
    baseMatrix.translate(segmentLength, 0, 0);
    baseMatrix.rotate(angle5, 0, 0, 1);
    segment5.color = [0.1, 0.8, 0.1, 1.0];
    segment5.matrix = new Matrix4(baseMatrix);
    segment5.matrix.scale(segmentLength, 0.05, 0.05);
    segment5.render();

    let segment6 = new Cube();
    let phase6 = g_seconds * speed + (5 / 8) * waveLength;
    let angle6 = amplitude * Math.sin(phase6);
    baseMatrix.translate(segmentLength, 0, 0);
    baseMatrix.rotate(angle6, 0, 0, 1);
    segment6.color = [0.1, 0.8, 0.1, 1.0];
    segment6.matrix = new Matrix4(baseMatrix);
    segment6.matrix.scale(segmentLength, 0.05, 0.05);
    segment6.render();

    let segment7 = new Cube();
    let angle7 = g_secondLastSegmentAngle;
    baseMatrix.translate(segmentLength, 0, 0);
    baseMatrix.rotate(angle7, 0, 0, 1);
    segment7.color = [0.1, 0.8, 0.1, 1.0];
    segment7.matrix = new Matrix4(baseMatrix);
    segment7.matrix.scale(segmentLength, 0.05, 0.05);
    segment7.render();

    let segment8 = new Cube();
    let angle8 = g_lastSegmentAngle;
    baseMatrix.translate(segmentLength, 0, 0);
    baseMatrix.rotate(angle8, 0, 0, 1);
    segment8.color = [0.1, 0.8, 0.1, 1.0];
    segment8.matrix = new Matrix4(baseMatrix);
    segment8.matrix.scale(segmentLength, 0.05, 0.05);
    segment8.render();


    var duration = performance.now() - g_startTime;
    sendTextToHTML( " ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), "performanceData" )
        
}

function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}