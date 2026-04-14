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
  // Floor 1: Ancient Ruins - mysterious, slow pads
  { bpm:60, voices:[
    {type:'sine',notes:[220,262,330,294],vol:.04},
    {type:'sine',notes:[330,392,440,370],vol:.03},
    {type:'triangle',notes:[110,131,110,147],vol:.035},
  ]},
  // Floor 2: Ice Cave - ethereal, high, cold
  { bpm:50, voices:[
    {type:'sine',notes:[523,587,659,587],vol:.03},
    {type:'sine',notes:[784,880,784,740],vol:.025},
    {type:'triangle',notes:[262,294,262,247],vol:.03},
  ]},
  // Floor 3: Lava Corridor - dark, ominous, bass-heavy
  { bpm:75, voices:[
    {type:'sawtooth',notes:[110,117,104,110],vol:.03},
    {type:'square',notes:[220,233,208,220],vol:.015},
    {type:'triangle',notes:[55,58,52,55],vol:.04},
  ]},
  // Floor 4: Dark Forest - eerie, sparse, minor key
  { bpm:55, voices:[
    {type:'sine',notes:[196,185,175,185],vol:.035},
    {type:'triangle',notes:[294,277,262,277],vol:.025},
    {type:'sine',notes:[98,93,87,93],vol:.03},
  ]},
  // Floor 5: Abyss Temple - grand, reverberant, deep
  { bpm:45, voices:[
    {type:'sine',notes:[165,175,196,185],vol:.035},
    {type:'sine',notes:[330,349,392,370],vol:.025},
    {type:'triangle',notes:[82,87,98,93],vol:.04},
  ]},
  // Floor 6 (Extra): Phoenix Furnace - intense, fast, fiery
  { bpm:90, voices:[
    {type:'sawtooth',notes:[147,165,175,165],vol:.025},
    {type:'square',notes:[294,330,349,330],vol:.015},
    {type:'triangle',notes:[73,82,87,82],vol:.035},
    {type:'sawtooth',notes:[440,494,523,494],vol:.012},
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
      // Smooth glide to next note
      v.osc.frequency.setTargetAtTime(targetFreq,t,.15);
      // Slight volume swell on beat
      v.gain.gain.setTargetAtTime(v.vol*1.2,t,.05);
      v.gain.gain.setTargetAtTime(v.vol,t+.1,.2);
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
