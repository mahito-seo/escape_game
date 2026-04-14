// Sound System - SFX (Web Audio API) + BGM (MP3 files)
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
//  BGM SYSTEM (MP3 files in audio/)
// ═══════════════════════════════════
// Place MP3 files as: audio/bgm1.mp3 ~ audio/bgm6.mp3
// If a file doesn't exist, that floor plays in silence.
// Try .mp3 first (Safari), then .ogg (Chrome/Firefox)
const BGM_BASES=['audio/bgm1','audio/bgm2','audio/bgm3','audio/bgm4','audio/bgm5','audio/bgm6'];
const BGM_VOL=0.15; // master BGM volume
const BGM_VOL_MUTED=0.04; // during battle/cipher
let bgmAudio=null;
let bgmPlaying=false;
let bgmCurrentFloor=-1;

function startBGM(floorNum){
  if(bgmPlaying && bgmCurrentFloor===floorNum) return;
  stopBGM();
  bgmCurrentFloor=floorNum;
  const base=BGM_BASES[(floorNum-1)%BGM_BASES.length];
  // Determine supported format
  const testA=new Audio();
  const canMP3=testA.canPlayType('audio/mpeg')!=='';
  const canOGG=testA.canPlayType('audio/ogg')!=='';
  const exts=[];
  if(canMP3)exts.push('.mp3');
  if(canOGG)exts.push('.ogg');
  if(!exts.length){bgmPlaying=false;return;}
  // Try each extension
  function tryExt(i){
    if(i>=exts.length){bgmPlaying=false;return;}
    const a=new Audio(base+exts[i]);
    a.loop=true;a.volume=BGM_VOL;
    a.play().then(()=>{bgmAudio=a;bgmPlaying=true;}).catch(()=>tryExt(i+1));
  }
  tryExt(0);
}

function stopBGM(){
  if(bgmAudio){
    bgmAudio.pause();
    bgmAudio.currentTime=0;
    bgmAudio=null;
  }
  bgmPlaying=false;
  bgmCurrentFloor=-1;
}

function setBGMVolume(vol){
  if(bgmAudio) bgmAudio.volume=vol;
}

function muteBGM(){setBGMVolume(BGM_VOL_MUTED);}
function unmuteBGM(){setBGMVolume(BGM_VOL);}
