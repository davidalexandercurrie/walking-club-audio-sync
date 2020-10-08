let sounds = [];
let buttons = [];
let listeningTo;
let previousSound;
let playing = false;
let audioEnabled = false;
let startTime = Date.now() + 10000000000000;
let socket;
let playbackStarted = false;

function onSoundLoadSuccess(e) {
  console.log('load sound success', e);
}
function onSoundLoadError(e) {
  console.log('load sound error', e);
}
function onSoundLoadProgress(e) {
  console.log('load sound progress', e);
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
  for (let i = 0; i < sounds.length; i++) {
    buttons[i] = createButton(String(i + 1))
      .addClass('buttonList')
      .parent('buttonList')
      .mousePressed(() => buttonSelected(i));
  }
  socket = io.connect();
  socket.on('moment', receiveMoment);
}

function draw() {
  if (listeningTo != undefined && !playing && Date.now() > startTime) {
    playbackStarted = true;
    startTime = Date.now() + 10000000000000;

    sounds[listeningTo].play();
    previousSound = listeningTo;
    playing = true;
    console.log('PLAYING');
  }
  if (playbackStarted) {
    if (!sounds[listeningTo].isPlaying() && playing) {
      playing = false;
      playbackStarted = false;
      document.getElementById('playButton').style.border = '2px solid #2274A5';
    }
  }
}

function buttonSelected(e) {
  for (let i = 0; i < buttons.length; i++) {
    if (i === e) {
      buttons[i].style('border: 10px solid #D90368');
      listeningTo = i;
    } else {
      buttons[i].style('border: 2px solid #2274A5');
    }
  }
}

function receiveMoment(time) {
  console.log('receiving moment', time.moment);
  if (previousSound != undefined) {
    sounds[previousSound].stop();
  }
  playbackStarted = false;
  document.getElementById('playButton').style.border = '10px solid #03d90e';
  startTime = time.moment;
}

function playClicked() {
  if (audioEnabled) {
    if (previousSound != undefined) {
      sounds[previousSound].stop();
    }
    document.getElementById('playButton').style.border = '10px solid #03d90e';
    startTime = Date.now() + 5000;
    sendMoment(startTime);
  }
}
function sendMoment(moment) {
  console.log('sending moment: ', moment);
  var data = {
    moment: moment,
  };
  socket.emit('moment', data);
}
function enableAudio() {
  userStartAudio();
  audioEnabled = true;
  document.getElementById('enableAudio').style.border = '10px solid #D90368';
}
