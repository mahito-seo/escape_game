// Sound System (Web Audio API) - SFX + BGM
let audioCtx=null;
function ensureAudio(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();}

function playTone(freq,dur,type='sine',vol=.15){
  ensureAudio();const o=audioCtx.createOscillator(),g=audioCtx.createGain();
  o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(vol,audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+dur);
  o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+dur);
}

function playSound(name){
  try{
    if(name==='hit'){playTone(200,.15,'sawtooth',.1);setTimeout(()=>playTone(150,.1,'sawtooth',.08),50);}
    else if(name==='correct'){playTone(523,.1,'sine',.12);setTimeout(()=>playTone(659,.1,'sine',.12),100);setTimeout(()=>playTone(784,.2,'sine',.12),200);}
    else if(name==='wrong'){playTone(200,.2,'square',.1);setTimeout(()=>playTone(150,.3,'square',.08),150);}
    else if(name==='clear'){playTone(523,.15,'sine',.15);setTimeout(()=>playTone(659,.15,'sine',.15),120);setTimeout(()=>playTone(784,.15,'sine',.15),240);setTimeout(()=>playTone(1047,.4,'sine',.15),360);}
    else if(name==='levelup'){playTone(440,.1,'sine',.12);setTimeout(()=>playTone(554,.1,'sine',.12),80);setTimeout(()=>playTone(659,.1,'sine',.12),160);setTimeout(()=>playTone(880,.3,'sine',.15),240);}
    else if(name==='pickup'){playTone(880,.08,'sine',.1);setTimeout(()=>playTone(1100,.1,'sine',.08),60);}
    else if(name==='step'){playTone(80+Math.random()*40,.05,'triangle',.03);}
    else if(name==='portal'){playTone(330,.3,'sine',.1);setTimeout(()=>playTone(440,.3,'sine',.1),200);setTimeout(()=>playTone(550,.5,'sine',.12),400);}
    else if(name==='battle'){playTone(300,.1,'sawtooth',.12);setTimeout(()=>playTone(400,.1,'sawtooth',.12),80);setTimeout(()=>playTone(500,.15,'sawtooth',.1),160);}
    else if(name==='swap'){playTone(660,.1,'sine',.1);setTimeout(()=>playTone(880,.15,'sine',.12),100);}
  }catch(e){}
}

// ═══════════════════════════════════
//  BGM SYSTEM (procedural per-floor)
// ═══════════════════════════════════
// Each floor has a unique looping BGM built from oscillators
// BGM definitions: array of { freq, type, vol, detune } per voice
const BGM_TRACKS = [
  // Floor 1: Ancient Ruins - slow, haunting minor drone
  { bpm:40, voices:[
    {type:'sine',notes:[147,147,139,147,131,131,139,131],vol:.04},  // D3 drone, dips to C#/C
    {type:'sine',notes:[220,220,208,220,196,196,208,196],vol:.025}, // A3 fifth, minor shifts
    {type:'triangle',notes:[73,73,73,73,66,66,73,66],vol:.035},     // deep sub bass
  ]},
  // Floor 2: Ice Cave - cold, high, sparse with long pauses
  { bpm:35, voices:[
    {type:'sine',notes:[659,622,659,587,659,622,587,554],vol:.02},  // E5 descending, cold
    {type:'sine',notes:[330,311,330,294,330,311,294,277],vol:.025},  // octave below
    {type:'triangle',notes:[165,165,156,165,147,147,156,147],vol:.03}, // low anchor
  ]},
  // Floor 3: Lava Corridor - ominous rumble, tritone tension
  { bpm:50, voices:[
    {type:'sine',notes:[82,82,87,82,78,78,82,78],vol:.04},          // low E2 rumble
    {type:'triangle',notes:[116,116,123,116,110,110,116,110],vol:.03}, // tritone Bb2
    {type:'sine',notes:[165,156,165,147,165,156,147,139],vol:.02},   // creeping melody
  ]},
  // Floor 4: Dark Forest - dissonant, whispery, unsettling
  { bpm:30, voices:[
    {type:'sine',notes:[185,175,185,165,175,165,156,165],vol:.03},   // F#3 wandering
    {type:'sine',notes:[277,262,277,247,262,247,233,247],vol:.02},   // minor third above
    {type:'triangle',notes:[93,87,93,82,87,82,78,82],vol:.035},      // sub octave
  ]},
  // Floor 5: Abyss Temple - deep, grand, slow organ-like
  { bpm:28, voices:[
    {type:'sine',notes:[110,104,110,98,104,98,93,98],vol:.04},      // A2 descending
    {type:'sine',notes:[165,156,165,147,156,147,139,147],vol:.03},   // fifth above
    {type:'triangle',notes:[55,52,55,49,52,49,46,49],vol:.04},       // sub bass
    {type:'sine',notes:[330,311,330,294,311,294,277,294],vol:.015},   // high whisper
  ]},
  // Floor 6 (Extra): Phoenix Furnace - aggressive, pulsing, fiery
  { bpm:65, voices:[
    {type:'triangle',notes:[110,110,131,110,104,104,131,104],vol:.04},// pulsing bass E2
    {type:'sine',notes:[220,220,262,220,208,208,262,208],vol:.025},   // octave drive
    {type:'sine',notes:[330,349,392,349,330,311,370,311],vol:.018},   // wild melody
  ]},
];

let bgmOscillators=[];
let bgmGainNode=null;
let bgmInterval=null;
let bgmNoteIdx=0;
let bgmPlaying=false;
let bgmCurrentFloor=-1;

function startBGM(floorNum){
  ensureAudio();
  // Don't restart if same floor
  if(bgmPlaying && bgmCurrentFloor===floorNum) return;
  stopBGM();

  const trackIdx=(floorNum-1)%BGM_TRACKS.length;
  const track=BGM_TRACKS[trackIdx];
  bgmCurrentFloor=floorNum;
  bgmNoteIdx=0;

  // Master gain for BGM
  bgmGainNode=audioCtx.createGain();
  bgmGainNode.gain.setValueAtTime(1,audioCtx.currentTime);
  bgmGainNode.connect(audioCtx.destination);

  // Create persistent oscillators for each voice
  bgmOscillators=track.voices.map(v=>{
    const o=audioCtx.createOscillator();
    const g=audioCtx.createGain();
    o.type=v.type;
    o.frequency.value=v.notes[0];
    g.gain.value=v.vol;
    o.connect(g);
    g.connect(bgmGainNode);
    o.start();
    return {osc:o,gain:g,notes:v.notes,vol:v.vol};
  });

  // Step through notes on beat
  const beatMs=60000/track.bpm;
  bgmInterval=setInterval(()=>{
    if(gameState==='paused'||gameState==='swap'||gameState==='dead') return;
    bgmNoteIdx=(bgmNoteIdx+1)%track.voices[0].notes.length;
    const t=audioCtx.currentTime;
    bgmOscillators.forEach(v=>{
      const targetFreq=v.notes[bgmNoteIdx%v.notes.length];
      // Slow glide to next note (creepy portamento)
      v.osc.frequency.setTargetAtTime(targetFreq,t,.5);
      // Gentle volume swell
      v.gain.gain.setTargetAtTime(v.vol*1.15,t,.1);
      v.gain.gain.setTargetAtTime(v.vol,t+.2,.4);
    });
  },beatMs);

  bgmPlaying=true;
}

function stopBGM(){
  if(bgmInterval){clearInterval(bgmInterval);bgmInterval=null;}
  bgmOscillators.forEach(v=>{
    try{v.osc.stop();v.osc.disconnect();}catch(e){}
    try{v.gain.disconnect();}catch(e){}
  });
  bgmOscillators=[];
  if(bgmGainNode){try{bgmGainNode.disconnect();}catch(e){} bgmGainNode=null;}
  bgmPlaying=false;
  bgmCurrentFloor=-1;
}

function setBGMVolume(vol){
  if(bgmGainNode){
    bgmGainNode.gain.setTargetAtTime(vol,audioCtx.currentTime,.1);
  }
}

// Mute BGM during battle/cipher, restore after
function muteBGM(){setBGMVolume(.15);} // quiet, not silent
function unmuteBGM(){setBGMVolume(1);}
