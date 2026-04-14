// Three.js Engine Initialization & Core State
const canvas=document.getElementById('canvas');
const pCanvas=document.getElementById('particles');
const pCtx=pCanvas.getContext('2d');
let W=window.innerWidth,H=window.innerHeight;
canvas.width=W;canvas.height=H;pCanvas.width=W;pCanvas.height=H;

const renderer=new THREE.WebGLRenderer({canvas,antialias:false}); // antialias off for perf
renderer.setSize(W,H);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)); // cap pixel ratio
renderer.shadowMap.enabled=false; // shadows off for perf
renderer.toneMapping=THREE.ReinhardToneMapping;renderer.toneMappingExposure=2.0;

const scene=new THREE.Scene();
scene.fog=new THREE.Fog(0x0a0d08,12,45);
const camera=new THREE.PerspectiveCamera(75,W/H,.1,100);

const TILE=4,MAP_W=28,MAP_H=28;
let gameState='title';
let player=mkPlayer();
function mkPlayer(){return{x:0,z:0,yaw:0,pitch:0,hp:200,maxHp:200,mp:100,maxMp:100,level:6,xp:0,xpNext:760,kills:0,attackPower:62,defense:15,speed:.035,skills:[{name:'火球',cd:0,maxCd:3,cost:15},{name:'雷撃',cd:0,maxCd:5,cost:25},{name:'回復',cd:0,maxCd:8,cost:20}]};} // DEBUG: Lv6 start (TODO: revert to Lv1)

let keys={},mouse={dx:0,dy:0},pointerLocked=false;
let floor=1,dungeon=null;
let enemies=[],pParticles=[],projectiles=[],items=[],torches=[];
let stairMesh,stairLight;
let terminalMesh,terminalLight,terminalGlow;
let terminalX=0,terminalZ=0;
let battleCooldown=0;

