// create web audio api context
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// create Oscillator and gain node
var oscillator = audioCtx.createOscillator();
var gainNode = audioCtx.createGain();
var analyser = audioCtx.createAnalyser();
var javascriptNode = audioCtx.createScriptProcessor(2048, 1, 1);
analyser.smoothingTimeConstant = 0.3;
analyser.fftSize = 1024;
javascriptNode.connect(audioCtx.destination);

// connect oscillator to gain node to speakers

oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);
oscillator.connect(analyser);
analyser.connect(javascriptNode);

// create initial theremin frequency and volumn values

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

var maxFreq = 6000;
var maxVol = 0.04;

var initialFreq = 3000;
var initialVol = 0.001;

// set options for the oscillator

oscillator.type = 'square';
oscillator.frequency.value = initialFreq; // value in hertz
oscillator.detune.value = 100; // value in cents
oscillator.start(0);

oscillator.onended = function() {
  console.log('Your tone has now stopped playing!');
}

gainNode.gain.value = initialVol;

// Mouse pointer coordinates

var CurX;
var CurY;

// Get new mouse pointer coordinates when mouse is moved
// then set new gain and pitch values

document.onmousemove = updatePage;

function updatePage(e) {
    KeyFlag = false;

    CurX = (window.Event) ? e.pageX : event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
    CurY = (window.Event) ? e.pageY : event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
    
    oscillator.frequency.value = (CurX/WIDTH) * maxFreq;
    gainNode.gain.value = (CurY/HEIGHT) * maxVol;

    canvasDraw();
}

// mute button

var mute = document.querySelector('.mute');

mute.onclick = function() {
  if(mute.getAttribute('data-muted') === 'false') {
    gainNode.disconnect(audioCtx.destination);
    mute.setAttribute('data-muted', 'true');
    mute.innerHTML = "Unmute";
  } else {
    gainNode.connect(audioCtx.destination);
    mute.setAttribute('data-muted', 'false');
    mute.innerHTML = "Mute";
  };
}



// canvas visualization

function random(number1,number2) {
  var randomNo = number1 + (Math.floor(Math.random() * (number2 - number1)) + 1);
  return randomNo;
} 

var canvas = document.querySelector('.canvas');
canvas.width = WIDTH;
canvas.height = HEIGHT; 

var canvasCtx = canvas.getContext('2d');
var gradient = canvasCtx.createLinearGradient(0,0,0,200);
gradient.addColorStop(1,'#4F448C');
gradient.addColorStop(0.5,'#B6A9D1');
gradient.addColorStop(0,'#ffffff');
canvasCtx.fillStyle = gradient;

function canvasDraw() {
      
}

javascriptNode.onaudioprocess = function() {
    // get the average, bincount is fftsize / 2
    var array =  new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    canvasCtx.clearRect(0, 0, canvas.clientWidth + 10, canvas.clientHeight);
    drawSpectrum(array);
};

function drawSpectrum(array) {
    for ( var i = 0; i < (array.length); i++ ){
        var value = array[i];
        canvasCtx.fillRect(i*5,canvas.clientHeight-value,4,canvas.clientHeight);
    }
};

// clear screen

var clear = document.querySelector('.clear');

clear.onclick = function() {
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
}

// keyboard controls

var body = document.querySelector('body');

var KeyX = 1;
var KeyY = 0.01;
var KeyFlag = false;

body.onkeydown = function(e) {
  KeyFlag = true;

  // 37 is arrow left, 39 is arrow right,
  // 38 is arrow up, 40 is arrow down

  if(e.keyCode == 37) {
    KeyX -= 20;
  };

  if(e.keyCode == 39) {
    KeyX += 20;
  };

  if(e.keyCode == 38) {
    KeyY -= 20;
  };

  if(e.keyCode == 40) {
    KeyY += 20;
  };

  // set max and min constraints for KeyX and KeyY

  if(KeyX < 1) {
    KeyX = 1;
  };

  if(KeyX > WIDTH) {
    KeyX = WIDTH;
  };

  if(KeyY < 0.01) {
    KeyY = 0.01;
  };

  if(KeyY > HEIGHT) {
    KeyY = HEIGHT;
  };

  oscillator.frequency.value = (KeyX/WIDTH) * maxFreq;
  gainNode.gain.value = (KeyY/HEIGHT) * maxVol;

  canvasDraw();
}
