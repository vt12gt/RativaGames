/* Fragmento preservado do JavaScript original. Não carregar isoladamente; usar build.mjs. */
/* ============ Eliminações ============ */
function killPts(){return mode==='challenge'?CFG.challengeKillPts:CFG.killPts}
// ===== Etapa 5: equipes, chefe, eventos, ondas =====
const tm=s=>mode!=='team'?-1:s===player?0:s.special?-2:(s.tm===undefined?(s.tm=bots.indexOf(s)%2===0?1:0):s.tm);
function initMode(){if(mode==='boss'){const i=bots.length-1;spawnSpecial(i,4);boss=bots[i];boss.boss=true;boss.hp=100;boss.stun=0;boss.phase='chase';boss.pt=3;boss.speedBase=90;bossVariant(boss);showToast('👹 '+boss.name+' apareceu! Desvie das investidas.',3)}
 else if(mode==='team')showToast('🔵 Seu time (azul) × 🔴 vermelho: 15 eliminações!',3);else if(mode==='infinite')showToast('🌊 Onda 1: elimine 5 ratos',3)}
function bossCrash(b){b.x=Math.min(worldW-b.radius-5,Math.max(b.radius+5,b.x));b.y=Math.min(worldH-b.radius-5,Math.max(b.radius+5,b.y));if(b.phase==='dash'){b.stun=b.stunT||6;b.phase='stun';b.speedBase=0;showToast('💥 Chefe atordoado! Acerte a cabeça dele!',3)}else b.targetAngle=Math.atan2(worldH/2-b.y,worldW/2-b.x)}
function bossTick(dt){const b=boss;if(!b||!b.alive||!player.alive||player.localPaused)return;b.pt-=dt;b.hitCd=(b.hitCd||0)-dt;b.flash=(b.flash||0)-dt;const ang=Math.atan2(player.y-b.y,player.x-b.x);
 if(b.stun>0){b.stun-=dt;b.speedBase=0;if(b.hitCd<=0&&Math.hypot(player.x-b.x,player.y-b.y)<b.radius+player.radius+46){b.hp-=(b.dmg||20);b.hitCd=.4;b.flash=.25;burst(b.x,b.y,'#ffe477',28);sfx('kill');showToast('💥 Acertou o chefe! '+Math.max(0,Math.round(b.hp))+'%',1.2);
   if(b.hp<=0){addScore(1000+500*(b.bv||0));die(b,'body',player);bossWinT=1.8;return}}
  if(b.stun<=0){b.phase='chase';b.pt=3;b.speedBase=90}return}
 if(b.phase==='chase'){b.targetAngle=ang;b.speedBase=(90+(100-b.hp)*.6)*(b.chaseMul||1);if(b.pt<=0){b.phase='aim';b.pt=1.1;b.dashAng=ang}}
 else if(b.phase==='aim'){b.speedBase=15;b.targetAngle=ang;b.dashAng=ang;if(b.pt<=0){b.phase='dash';b.pt=1.4}}
 else if(b.phase==='dash'){b.angle=b.dashAng;b.targetAngle=b.dashAng;b.speedBase=b.dashSpd||330;if(b.pt<=0){b.phase='chase';b.pt=b.bv===2?rand(2,3.4):rand(3,5);b.speedBase=90}}}
const EVENTS=[{id:'chuva',n:'Chuva de queijos',icon:'🌧️',d:12},{id:'ouro',n:'Hora do ouro (×2 em comida)',icon:'✨',d:15},{id:'vento',n:'Vento veloz (todos +15%)',icon:'💨',d:12}];
function startEvent(id){const e=EVENTS.find(x=>x.id===id)||(Math.random()<.6&&THEMEEV[evtOf().id]?EVENTS.find(x=>x.id===THEMEEV[evtOf().id]):null)||EVENTS[(Math.random()*EVENTS.length)|0];ev={id:e.id,n:e.n,icon:e.icon,t:e.d,acc:0};showToast(`${e.icon} Evento: ${e.n}!`,3)}
function eventTick(dt){if(!ev)return;ev.t-=dt;if(ev.id==='chuva'){ev.acc+=dt*7;while(ev.acc>=1){ev.acc--;spawnFood(Math.min(worldW-40,Math.max(40,player.x+rand(-700,700))),Math.min(worldH-40,Math.max(40,player.y+rand(-500,500))),Math.random()<.1?1:0,false)}}if(ev.t<=0){ev=null;evT=rand(60,90)*evtScale()}}
function nextWave(){wave++;waveKills=0;addScore(100*wave);showToast(`🌊 Onda ${wave}! Meta: ${3+wave*2} ratos — mais rápidos`,3);if(wave%3===0&&player.alive){const i=bots.findIndex(b=>!b.alive);if(i>=0)spawnSpecial(i,evtOf().id==='noite'?2:evtOf().id==='cacadaouro'?1:1+((Math.random()*3)|0))}}
function modeHud(){const t=[];if(mode==='team'){const a=teamScore[0],b=teamScore[1],g=MODES.team.tgoal;t.push(`🔵 ${a} × ${b} 🔴 • meta ${g} • faltam 🔵${Math.max(0,g-a)} 🔴${Math.max(0,g-b)} • ⏱ ${fmtTime(Math.max(0,MODES.team.limit-gameTime))}`)};if(mode==='boss'&&boss&&boss.alive)t.push(`👹 Chefe ${Math.max(0,Math.round(boss.hp))}%${boss.stun>0?' • ATORDOADO!':''}`);if(mode==='infinite')t.push(`🌊 Onda ${wave} • ${waveKills}/${3+wave*2}`);{const rc=Object.values(roundEarn).reduce((a,b)=>a+b,0);if(rc)t.push('🧀 +'+rc)}if(ev)t.push(`${ev.icon} ${Math.ceil(ev.t)}s`);return t.join(' • ')}
function die(s,reason,by){if(!s.alive||s.localPaused)return;if(s.armor>0&&reason!=='wall'){s.armor--;s.shield=s.special?.12:1.5;burst(s.x,s.y,'#ffffff',14);return}if(s===player)buzz(140);s.alive=false;burst(s.x,s.y,s.color,s===player?30:20);dropFood(s);
 if(by&&by!==s){by.kills++;if(by===player){kills++;if(gameTime-lastKillT<=8)streakN++;else streakN=1;lastKillT=gameTime;matchStreak=Math.max(matchStreak,streakN);addScore(killPts());earn(mode==='challenge'?20:10,'eliminação');buzz(35);sfx('kill');showToast(`🐭 Você eliminou ${s.name}! +${killPts()}`);const M=MODES[mode];if(M.goal&&kills>=M.goal&&player.alive)endGame('win')}}
 if(s===leader&&by===player&&player.alive){leader=null;addScore(100);earn(15,'rei da arena');showToast('👑 Rei da arena derrubado! +100 pts • +15 🧀',3)}
 if(mode==='team'&&by&&by!==s){const a=tm(by),b=tm(s);if(a>=0&&a!==b)teamScore[a]++}
 if(mode==='infinite'&&s.isBot&&!s.special&&++waveKills>=3+wave*2)nextWave();
 if(s.rival&&by===player&&player.alive){revengeDone=true;addScore(100);showToast('🎯 Revanche cumprida! +100',3)}
 if(s.special){const sp=SPECIALS[s.special];for(let k=0;k<sp.drops;k++)spawnFood(s.x+rand(-60,60),s.y+rand(-60,60),1,true,'#ffd23e',9);
  if(s.special===1)spawnFood(s.x,s.y,7,true,'#ffd34e',15);if(s.special===3)spawnFood(s.x,s.y,8,true,'#c78bff',15);
  if(by===player&&player.alive){specialKills++;applyFood(player,{type:sp.power});addScore(sp.pts);showToast(`${sp.icon} ${s.name} eliminado! +${sp.pts}`,3)}}
 if(s===player){lastKiller=by||null;causeText=reason==='wall'?'Você bateu na parede.':by?(by===s?'Seu rato foi pego!':`Você colidiu com o corpo de ${by.name}.`):'Seu rato foi pego!';
  if(reason==='head'&&by)causeText=`Choque de frente com ${by.name}, que era maior.`;
  dyingT=.9;releaseDrag();$('pause').classList.add('hidden');sfx('death');syncMusic()}
 else{s.respawnLength=s.remote?Math.max(3,Math.floor(s.length*.3)):0;s.respawnAt=gameTime+1.2}}
const vics=[],byk=[];
const dd=(x1,y1,x2,y2)=>{const a=x1-x2,b=y1-y2;return a*a+b*b};
function sd(px,py,ax,ay,bx,by){const abx=bx-ax,aby=by-ay,t=Math.max(0,Math.min(1,((px-ax)*abx+(py-ay)*aby)/(abx*abx+aby*aby||1)));return dd(px,py,ax+abx*t,ay+aby*t)}
