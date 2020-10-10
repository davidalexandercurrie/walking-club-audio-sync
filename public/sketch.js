let sounds = [];
let buttons = [];
let listeningTo;
let previousSound;
let playing = false;
let startTime = Date.now() + 10000000000000;
let audioEnabled = false;
let socket;
let playbackStarted = false;
let loadbar = 0;
let trackIsSelected = false;
let playButton;
let resetButton;

function onSoundLoadSuccess(e) {
  // console.log('load sound success', e);
  loadbar += 10;
  document.getElementById('p5_loading').style.width = loadbar.toString() + '%';
}
function onSoundLoadError(e) {
  // console.log('load sound error', e);
}
function onSoundLoadProgress(e) {
  // console.log('load sound progress', e);
}

function preload() {
  soundFormats('ogg', 'mp3');
  for (let i = 0; i < 10; i++) {
    sounds[i] = loadSound(
      `sounds/track${i + 1}.ogg`,
      onSoundLoadSuccess,
      onSoundLoadError,
      onSoundLoadProgress
    );
  }
}

function setup() {
  getAudioContext().suspend();
  noCanvas();
  playButton = createButton('play').parent('buttonList');
  playButton.mousePressed(playClicked);
  resetButton = createButton('reset all devices').parent('buttonList');
  resetButton.mousePressed(resetClicked);

  for (let i = 0; i < sounds.length; i++) {
    buttons[i] = createButton(String(i + 1))
      .addClass('buttonList')
      .parent('buttonList')
      .mousePressed(() => buttonSelected(i));
  }
  socket = io.connect();
  socket.on('msg', receiveMsg);
}
setInterval(runProgram, 0.1);
function runProgram() {
  program();
  if (playing) {
    document.getElementById('instructions').style.backgroundColor = 'black';
  } else {
    document.getElementById('instructions').style.backgroundColor = 'white';
  }
}

function program() {
  if (listeningTo != undefined && !playing && Date.now() > startTime) {
    startTime = Date.now() + 10000000000000;

    sounds[listeningTo].play();
    previousSound = listeningTo;
    playing = true;
  }
  if (playing) {
    if (!sounds[listeningTo].isPlaying() && playing) {
      playing = false;
      playButton.style('border: 2px solid #2274A5');
    }
  }
}

function buttonSelected(e) {
  trackIsSelected = true;
  if (!audioEnabled) {
    userStartAudio();
  }
  if (!playbackStarted) {
    for (let i = 0; i < buttons.length; i++) {
      if (i === e) {
        buttons[i].style('border: 10px solid #D90368');
        listeningTo = i;
      } else {
        buttons[i].style('border: 2px solid #2274A5');
      }
    }
  }
}

function playClicked() {
  console.log('play is clicked');
  if (!trackIsSelected) {
    alert('No track selected');
  }
  playbackStarted = true;
  playButton.style('border: 10px solid #03d90e');
  startTime = Date.now() + 5000;
  sendMoment(startTime);
}

function receiveMsg(data) {
  console.log('data', data);
  if (data.msg == 'reset') {
    reset();
  } else {
    if (previousSound != undefined) {
      sounds[previousSound].stop();
    }
    playbackStarted = true;
    playButton.style('border: 10px solid #03d90e');
    startTime = data.msg;
  }
}

function sendMoment(moment) {
  console.log('sending moment: ', moment);
  var data = {
    msg: moment,
  };
  socket.emit('msg', data);
}

function receiveResetMsg() {
  console.log('receiveReset');
  reset();
}

function resetClicked() {
  reset();
  var data = {
    msg: 'reset',
  };
  socket.emit('msg', data);
}

function reset() {
  startTime = Date.now() + 10000000000000;
  playing = false;
  playbackStarted = false;
  sounds[listeningTo].stop();
  console.log('resetting all devices');
  playButton.style('border: 2px solid #2274A5');
}
