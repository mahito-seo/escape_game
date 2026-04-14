// Floor Themes - Per-stage visual settings
// Floor themes: each stage has unique look
const FLOOR_THEMES=[
  {name:'古代遺跡',wall:0x5a5040,floor:0x3a3020,ceil:0x2a2518,fog:0x0a0d08,fogNear:12,fogFar:45,
   ambient:0x554030,ambientI:1.0,torch:0xff8800,torchI:2.5},
  {name:'氷の洞窟',wall:0x4a5a6a,floor:0x2a3a4a,ceil:0x1a2a3a,fog:0x081018,fogNear:10,fogFar:40,
   ambient:0x304060,ambientI:1.1,torch:0x66aaff,torchI:2.8},
  {name:'溶岩の回廊',wall:0x5a3020,floor:0x3a1a0a,ceil:0x2a1008,fog:0x180804,fogNear:10,fogFar:38,
   ambient:0x603020,ambientI:0.9,torch:0xff4400,torchI:3.0},
  {name:'闇の森',wall:0x2a3a1a,floor:0x1a2a0a,ceil:0x0a1a08,fog:0x040a04,fogNear:8,fogFar:35,
   ambient:0x203a18,ambientI:0.8,torch:0x44ff44,torchI:2.2},
  {name:'深淵の神殿',wall:0x3a2a4a,floor:0x1a1028,ceil:0x0a0818,fog:0x080410,fogNear:10,fogFar:42,
   ambient:0x302040,ambientI:1.0,torch:0xaa44ff,torchI:2.8},
  {name:'不死鳥の炉',wall:0x6a3a1a,floor:0x3a1a08,ceil:0x2a0a04,fog:0x1a0804,fogNear:8,fogFar:35,
   ambient:0x6a3020,ambientI:1.2,torch:0xff2200,torchI:3.5},
];
let wallMat,floorMat,ceilMat;
