// Floor Themes - Per-stage visual settings + decorations
const FLOOR_THEMES=[
  {name:'古代遺跡',
   wall:0x6a5a40,floor:0x3a2a18,ceil:0x2a2010,
   fog:0x0d0a06,fogNear:12,fogFar:45,
   ambient:0x665540,ambientI:1.1,torch:0xff8800,torchI:2.5,
   // Decorations: crumbled pillars, old crates, stone tablets
   decos:[
     {type:'pillar',col:0x8a7a60,h:1.5,w:.3,chance:.3},
     {type:'crate',col:0x5a4a20,h:.4,w:.5,chance:.4},
     {type:'tablet',col:0x6a6a5a,h:.8,w:.6,chance:.2},
   ]},
  {name:'氷の洞窟',
   wall:0x5a7a8a,floor:0x304858,ceil:0x203848,
   fog:0x0a1520,fogNear:10,fogFar:40,
   ambient:0x3a5a7a,ambientI:1.2,torch:0x66aaff,torchI:2.8,
   // Decorations: ice crystals, frozen server racks, frost formations
   decos:[
     {type:'crystal',col:0x88ccff,em:0x4488cc,h:1.0,w:.2,chance:.4},
     {type:'server',col:0x3a4a5a,h:1.2,w:.4,chance:.25},
     {type:'frost',col:0xaaddff,em:0x6699cc,h:.3,w:.5,chance:.3},
   ]},
  {name:'溶岩の回廊',
   wall:0x5a2a18,floor:0x2a0a00,ceil:0x200800,
   fog:0x180400,fogNear:10,fogFar:38,
   ambient:0x6a2a10,ambientI:0.9,torch:0xff4400,torchI:3.0,
   // Decorations: lava rocks, broken pipes, warning signs
   decos:[
     {type:'rock',col:0x3a2a1a,h:.5,w:.6,chance:.4},
     {type:'pipe',col:0x4a4a4a,em:0xff2200,h:.2,w:1.2,chance:.2},
     {type:'barrel',col:0x5a3a1a,h:.6,w:.3,chance:.3},
   ]},
  {name:'闇の森',
   wall:0x2a4a1a,floor:0x0a1a04,ceil:0x061408,
   fog:0x020a02,fogNear:7,fogFar:30,
   ambient:0x1a3a10,ambientI:0.7,torch:0x44ff44,torchI:2.2,
   // Decorations: dead trees, mushrooms, vines, bones
   decos:[
     {type:'tree',col:0x3a2a10,h:2.0,w:.15,chance:.3},
     {type:'mushroom',col:0x44aa44,em:0x22ff22,h:.3,w:.15,chance:.35},
     {type:'bones',col:0xccbb99,h:.15,w:.4,chance:.2},
   ]},
  {name:'深淵の神殿',
   wall:0x4a3060,floor:0x1a0830,ceil:0x0a0418,
   fog:0x060210,fogNear:10,fogFar:42,
   ambient:0x3a2050,ambientI:1.0,torch:0xaa44ff,torchI:2.8,
   // Decorations: altar, rune circles, broken statues, consoles
   decos:[
     {type:'altar',col:0x3a2a4a,em:0x6622aa,h:.6,w:.8,chance:.15},
     {type:'console',col:0x2a2a3a,em:0x4444ff,h:.9,w:.5,chance:.3},
     {type:'statue',col:0x5a4a6a,h:1.5,w:.35,chance:.2},
   ]},
  {name:'不死鳥の炉',
   wall:0x7a3010,floor:0x3a1200,ceil:0x2a0800,
   fog:0x1a0600,fogNear:8,fogFar:35,
   ambient:0x7a3020,ambientI:1.3,torch:0xff2200,torchI:3.5,
   // Decorations: forges, chains, molten metal, anvils
   decos:[
     {type:'forge',col:0x4a3a2a,em:0xff4400,h:.8,w:.6,chance:.25},
     {type:'chain',col:0x6a6a6a,h:2.0,w:.05,chance:.3},
     {type:'anvil',col:0x3a3a3a,h:.4,w:.5,chance:.2},
   ]},
];
let wallMat,floorMat,ceilMat;
