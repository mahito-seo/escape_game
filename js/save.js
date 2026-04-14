// Save/Load System (localStorage)
// ═══════════════════════════════════
//  SAVE / LOAD (localStorage)
// ═══════════════════════════════════
function saveProgress(){
  const data={floor,currentCipherStage,cipherSolved,player:{level:player.level,xp:player.xp,xpNext:player.xpNext,hp:player.hp,maxHp:player.maxHp,mp:player.mp,maxMp:player.maxMp,gold:player.gold,kills:player.kills,attackPower:player.attackPower,defense:player.defense},totalStreak,startTime};
  localStorage.setItem('cipherDungeonSave',JSON.stringify(data));
}
function loadProgress(){
  const raw=localStorage.getItem('cipherDungeonSave');
  if(!raw)return false;
  try{
    const d=JSON.parse(raw);
    floor=d.floor||1;currentCipherStage=d.currentCipherStage||0;cipherSolved=d.cipherSolved||false;
    totalStreak=d.totalStreak||0;startTime=d.startTime||Date.now();
    if(d.player){
      player.level=d.player.level||1;player.xp=d.player.xp||0;player.xpNext=d.player.xpNext||100;
      player.hp=d.player.hp||100;player.maxHp=d.player.maxHp||100;
      player.mp=d.player.mp||50;player.maxMp=d.player.maxMp||50;
      player.gold=d.player.gold||0;player.kills=d.player.kills||0;
      player.attackPower=d.player.attackPower||22;player.defense=d.player.defense||5;
    }
    return true;
  }catch(e){return false;}
}
function clearSave(){localStorage.removeItem('cipherDungeonSave');}

