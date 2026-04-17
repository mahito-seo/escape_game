// Procedural Dungeon Generation
function genDungeon(){
  const map=Array.from({length:MAP_H},()=>Array(MAP_W).fill(1));
  const rooms=[];
  // More room attempts, varied sizes for complexity
  for(let i=0;i<100;i++){
    const rw=2+~~(Math.random()*5),rh=2+~~(Math.random()*5);
    const rx=1+~~(Math.random()*(MAP_W-rw-2)),ry=1+~~(Math.random()*(MAP_H-rh-2));
    if(rooms.some(r=>rx<r.x+r.w+1&&rx+rw+1>r.x&&ry<r.y+r.h+1&&ry+rh+1>r.y))continue;
    rooms.push({x:rx,y:ry,w:rw,h:rh});
    for(let y=ry;y<ry+rh;y++)for(let x=rx;x<rx+rw;x++)map[y][x]=0;
  }
  // Connect rooms with L-shaped corridors
  for(let i=1;i<rooms.length;i++){
    const a=rooms[i-1],b=rooms[i];let cx=a.x+~~(a.w/2),cy=a.y+~~(a.h/2);
    const bx=b.x+~~(b.w/2),by=b.y+~~(b.h/2);
    // Randomly choose horizontal-first or vertical-first
    if(Math.random()<.5){
      while(cx!==bx){map[cy][cx]=0;cx+=cx<bx?1:-1;}
      while(cy!==by){map[cy][cx]=0;cy+=cy<by?1:-1;}
    }else{
      while(cy!==by){map[cy][cx]=0;cy+=cy<by?1:-1;}
      while(cx!==bx){map[cy][cx]=0;cx+=cx<bx?1:-1;}
    }
  }
  // Extra cross-connections for loops (no dead-end-only paths)
  for(let i=0;i<rooms.length;i++){
    const a=rooms[i];
    // Connect to a random non-adjacent room for looping paths
    const j=(i+2+~~(Math.random()*(rooms.length-3)))%rooms.length;
    if(j===i)continue;
    const b=rooms[j];
    let cx=a.x+~~(a.w/2),cy=a.y+~~(a.h/2);
    const bx=b.x+~~(b.w/2),by=b.y+~~(b.h/2);
    // Only connect ~30% of the time to keep it interesting
    if(Math.random()<.3){
      while(cx!==bx){map[cy][cx]=0;cx+=cx<bx?1:-1;}
      while(cy!==by){map[cy][cx]=0;cy+=cy<by?1:-1;}
    }
  }
  // Add some dead-end alcoves for exploration
  for(let i=0;i<8;i++){
    const r=rooms[~~(Math.random()*rooms.length)];
    const dir=~~(Math.random()*4); // 0=up,1=right,2=down,3=left
    let sx=r.x+~~(r.w/2),sy=r.y+~~(r.h/2);
    const len=2+~~(Math.random()*4);
    for(let s=0;s<len;s++){
      if(dir===0)sy--;else if(dir===1)sx++;else if(dir===2)sy++;else sx--;
      if(sx>0&&sx<MAP_W-1&&sy>0&&sy<MAP_H-1)map[sy][sx]=0;
    }
  }
  // Place spawn, terminal, and exit as far apart as possible
  // Spawn = rooms[0]. Find the farthest room for exit, then farthest from both for terminal.
  const r0=rooms[0];
  const cx0=r0.x+~~(r0.w/2),cy0=r0.y+~~(r0.h/2);
  function rdist(r,rx,ry){const dx=r.x+~~(r.w/2)-rx,dy=r.y+~~(r.h/2)-ry;return dx*dx+dy*dy;}
  // Exit: farthest room from spawn
  let exitRoom=rooms[rooms.length-1],maxD=0;
  for(let i=1;i<rooms.length;i++){const d=rdist(rooms[i],cx0,cy0);if(d>maxD){maxD=d;exitRoom=rooms[i];}}
  const exC={x:exitRoom.x+~~(exitRoom.w/2),y:exitRoom.y+~~(exitRoom.h/2)};
  // Terminal: maximize min distance to both spawn and exit
  let termRoom=rooms[Math.max(1,~~(rooms.length/2))],bestMin=0;
  for(let i=1;i<rooms.length;i++){
    if(rooms[i]===exitRoom)continue;
    const dSpawn=rdist(rooms[i],cx0,cy0),dExit=rdist(rooms[i],exC.x,exC.y);
    const mn=Math.min(dSpawn,dExit);
    if(mn>bestMin){bestMin=mn;termRoom=rooms[i];}
  }
  return{map,rooms,stairX:exC.x,stairY:exC.y,termX:termRoom.x+~~(termRoom.w/2),termY:termRoom.y+~~(termRoom.h/2)};
}

