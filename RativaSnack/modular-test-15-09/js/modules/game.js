/* Fragmento preservado do JavaScript original. Não carregar isoladamente; usar build.mjs. */
/* ============ Partida ============ */

/* ===== Metas da rodada ===== */
const GOALS_S=[100,250,500,1000,1500,2500,4000,6000,8000],GOALS_T=[60,120,180,300,420,600,900];
const goalActive=()=>mode==='quick'||mode==='survival'||mode==='infinite';
function goalTarget(i){if(i===undefined)i=goalIdx;if(i<0)return 0;const a=mode==='survival'?GOALS_T:GOALS_S;return i<a.length?a[i]:a[a.length-1]+(i-a.length+1)*(mode==='survival'?300:2000)}
const goalCur=()=>mode==='survival'?gameTime:score;
function goalTick(){if(!goalActive()||!player||!player.alive||!running)return;let g=0;while(goalCur()>=goalTarget()&&g++<3){const r=Math.min(40,5+goalIdx*5);earn(r,'meta');showToast(`🎯 Meta ${mode==='survival'?fmtTime(goalTarget()):goalTarget()+' pts'} concluída! +${r} 🧀`,2.6);sfx('bonus');goalIdx++}}
function goalHud(){const ge=$('goal');if(goalActive()&&player&&running&&!ended){const t=goalTarget(),p0=goalTarget(goalIdx-1),c=goalCur(),txt='🎯 '+(mode==='survival'?fmtTime(t):t+' pts'),pct=Math.max(0,Math.min(100,Math.round((c-p0)/(t-p0)*100)));ge.classList.remove('hidden');if(ge._t!==txt){ge._t=txt;$('goalT').textContent=txt}if(ge._p!==pct){ge._p=pct;$('goalB').style.width=pct+'%'}}else ge.classList.add('hidden')}
/* ===== Continuar após perder ===== */
const reviveCost=()=>Math.min(200,30+Math.floor(score/40)*5);
const canRevive=()=>revived<1&&(mode==='quick'||mode==='survival'||mode==='infinite')&&gameTime>=20&&player.length>=12&&(mpOnline&&ol.token?true:eco.cheese>=reviveCost());
function offerRevive(){paused=true;releaseDrag();syncBoostBtn();const n=Math.max(10,Math.floor(player.length*.6));$('reviveTxt').textContent=`Volte com tamanho ${n} e escudo por 3 s. Sua pontuação (${score}) é mantida.`;$('reviveYes').textContent=mpOnline&&ol.token?'REVIVER • GRÁTIS':'CONTINUAR • 🧀 '+reviveCost();const b=$('rvB');b.style.animation='none';void b.offsetWidth;b.style.animation='';$('revive').classList.remove('hidden');clearTimeout(reviveTimer);reviveTimer=setTimeout(declineRevive,6000)}
function declineRevive(){clearTimeout(reviveTimer);if($('revive').classList.contains('hidden'))return;$('revive').classList.add('hidden');paused=false;endGame('dead')}
function doRevive(){clearTimeout(reviveTimer);if($('revive').classList.contains('hidden'))return;$('revive').classList.add('hidden');
 if(!(mpOnline&&ol.token)&&!spend(reviveCost(),'Continuar')){paused=false;endGame('dead');return}
 const old=player;let x=0,y=0,t=0;do{x=rand(300,worldW-300);y=rand(300,worldH-300);t++}while(t<25&&snakes.some(q=>q.alive&&q!==old&&Math.hypot(q.x-x,q.y-y)<300));
 const np=mkSnake(x,y,Math.atan2(worldH/2-y,worldW/2-x),prefs.color,'Você',false,Math.max(10,Math.floor(old.length*.6)),null);applyCosmetics(np);np.shield=3;np.kills=old.kills;
 player=np;rebuildSnakes();revived++;dyingT=0;lastKiller=null;causeText='';
 cam.x=CFG.solidWalls?camTarget(np.x,W,worldW,CFG.camMargin):np.x-W/2;cam.y=CFG.solidWalls?camTarget(np.y,H,worldH,CFG.camMargin):np.y-H/2;
 pointer.dirX=Math.cos(np.angle);pointer.dirY=Math.sin(np.angle);inputLock=performance.now()+400;paused=false;$('pause').classList.remove('hidden');$('pause').textContent='Ⅱ';syncBoostBtn();syncMusic();showToast('💪 De volta! Escudo por 3 s',2.5);saveEco()}
/* ===== Setas de aviso fora da tela ===== */
function edgeArrow(x,y,col,icon,a){const sx=x-cam.x,sy=y-cam.y;if(sx>=0&&sx<=W&&sy>=0&&sy<=H)return;const cx=W/2,cy=H/2,dx=sx-cx,dy=sy-cy,kx=dx>0?(W-34-cx)/dx:(34-cx)/dx,ky=dy>0?(H-34-cy)/dy:(98-cy)/dy,k=Math.min(Math.abs(kx),Math.abs(ky)),px=cx+dx*k,py=cy+dy*k,an=Math.atan2(dy,dx);
 ctx.save();ctx.globalAlpha=a;ctx.translate(px,py);ctx.rotate(an);ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(15,0);ctx.lineTo(-7,-10);ctx.lineTo(-7,10);ctx.closePath();ctx.fill();ctx.restore();
 ctx.save();ctx.globalAlpha=a;ctx.font='15px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(icon,px-Math.cos(an)*22,py-Math.sin(an)*22);ctx.restore()}
function indicators(t){if(!prefs.arrows||!running||paused||!player||!player.alive)return;
 let best=null,bd=1e9;for(const f of foods)if(f.type>=2){const d=Math.hypot(f.x-player.x,f.y-player.y);if(d<bd&&d<1100){bd=d;best=f}}
 if(best)edgeArrow(best.x,best.y,'#ffd34e',FOODICON[best.type]||'⭐',.85);
 const pulse=.55+.35*Math.sin(t*9);for(const b of bots){if(!b.alive)continue;if(mode==='team'&&tm(b)===tm(player))continue;if(!(b.length>=player.length*1.15||b.special||b.boss))continue;if(Math.hypot(b.x-player.x,b.y-player.y)<520)edgeArrow(b.x,b.y,'#ff5d73','⚠️',pulse)}}
function showToast(t,d){const el=$('toast');el.textContent=t;el.classList.remove('hidden');toastT=d||2.2}
function updateHud(force){
 const set=(id,v)=>{const el=$(id);if(el._v!==v){el._v=v;el.textContent=v}};
 set('score',score);set('size',player?player.length:0);set('kills',kills);
 const M=MODES[mode];if(M.limit){set('timeLbl','Restante');set('timeval',fmtTime(Math.max(0,M.limit-gameTime)))}else{set('timeLbl','Tempo');set('timeval',fmtTime(gameTime))}
 set('best',mode==='quick'?bestQuick:mode==='survival'?fmtTime(stats.bestTime):stats.bestChallenge);goalTick();goalHud();
 let b='';if(player){if(player.boostT>0)b+='⚡ '+Math.ceil(player.boostT)+'s  ';if(player.growT>0)b+='🌱 ×2 '+Math.ceil(player.growT)+'s  ';if(player.magnetT>0)b+='🧲 '+Math.ceil(player.magnetT)+'s  ';if(player.shieldP>0)b+='🛡️ '+Math.ceil(player.shieldP)+'s  ';if(player.multT>0)b+='×2 pts '+Math.ceil(player.multT)+'s'}
 const be=$('bonus');if(b){be.textContent=b;be.classList.remove('hidden')}else be.classList.add('hidden');
 set('mini','Ameaça: '+(threat<.25?'baixa':threat<.55?'média':'alta')+' • '+(modeHud()||'Coma queijos • Evite ratos e paredes'));syncBoostBtn()}
// Ranking ao vivo por tamanho (desempate por abates): top 5 + sua posição.
function refreshLb(){const arr=[];for(const x of snakes)if(x&&x.alive)arr.push(x);const authoritative=!!mpServerAuthoritative;arr.sort((a,b)=>authoritative?((b.score||0)-(a.score||0)||(b.length||0)-(a.length||0)):b.length-a.length||b.kills-a.kills);leader=arr.length>3&&arr[0]!==player&&!arr[0].boss?arr[0]:null;
 const idx=arr.indexOf(player);myRank=idx>=0?idx+1:0;rankTotal=arr.length;
 const row=(x,i)=>`<div class="r${x===player?' me':''}"><i>${i+1}</i><b>${x.special?SPECIALS[x.special].icon+' ':''}${x.name||'Jogador'}</b><span>${authoritative?Math.floor(x.score||0).toLocaleString('pt-BR')+' pts':x.length+'·'+(x.kills||0)}</span></div>`;
 let h=`<div class="h">RANKING DA PARTIDA · ${arr.length}</div>`;if(!arr.length)h+='<div class="r">Aguardando jogadores...</div>';for(let i=0;i<Math.min(5,arr.length);i++)h+=row(arr[i],i);
 if(idx>=5)h+='<div class="sep"></div>'+row(player,idx);
 if(h!==lbHtml){lbHtml=h;lb.innerHTML=h}}
function syncBoostBtn(){bb.classList.toggle('hidden',!(running&&!paused&&!resumeCountdown&&!ended&&player&&player.alive));mm.classList.toggle('hidden',!(running&&!ended&&player));lb.classList.toggle('hidden',!(running&&!ended&&player));$('pause').classList.toggle('hidden',!(mpOnline&&running&&!ended))}
function update(dt){
 if(olDeathActive){olDeathTimer-=dt;const ce=document.getElementById('olDeathCount');if(ce)ce.textContent=String(Math.max(0,Math.ceil(olDeathTimer)));if(olDeathTimer<=0)olFinishDeathSummary();return}
 if(!running||(paused&&!mpOnline))return;
 if(mpOnline&&player)player.localPaused=!!(paused||resumeCountdown>0);
 if(!paused&&resumeCountdown>0){resumeCountdown=Math.max(0,resumeCountdown-dt);const rc=$('resumeCount');if(rc)rc.textContent=String(Math.max(0,Math.ceil(resumeCountdown)));if(resumeCountdown<=0){$('resumeWait').classList.add('hidden');if(player)player.localPaused=false;syncBoostBtn()}}
 if(mpRole==='client'){mpClientTick(dt);return}if(mpRole==='host')mpHostTick(dt);secretTick();wbTick();
 if(player.alive||mpOnline)gameTime+=dt;if(mode==='survival')shrinkTick(dt);bossTick(dt);
 for(let i=0;i<snakes.length;i++)move(snakes[i],dt);
 {const pc=Math.round(player.boostE*100);if(pc!==boostPct){boostPct=pc;bb.style.setProperty('--p',pc)}bb.classList.toggle('on',!!player.boostActive);bb.classList.toggle('cd',player.boostE<CFG.boostMin&&!player.boostActive)}
 for(let i=0;i<snakes.length;i++){const s=snakes[i];if(s.magnetT>0&&s.alive&&!s.localPaused){const pw=s.magnetPow||1,RR=skillVal(s,'magnet','rad')*Math.sqrt(pw),R2=RR*RR,SP=300*pw;for(const f of foods){const dx=s.x-f.x,dy=s.y-f.y,d2=dx*dx+dy*dy;if(d2<R2&&d2>1){const d=Math.sqrt(d2),m=Math.min(d,SP*dt);f.x+=dx/d*m;f.y+=dy/d*m}}}}
 for(let i=0;i<snakes.length;i++)eat(snakes[i]);
 collisions();
 for(let i=0;i<bots.length;i++)if(!bots[i].alive&&gameTime>=bots[i].respawnAt&&(player.alive||mpOnline)&&(i<botTarget(threat)||(mpSlots[i]&&mpSlots[i].open)))respawnBot(i);
 specialRivalT-=dt;if(specialRivalT<=0&&player.alive&&mode!=='boss'&&!mpOnline){if(bots.some(b=>b.alive&&b.special))specialRivalT=10;else{const i=bots.findIndex(b=>!b.alive);if(i>=0){spawnSpecial(i,evtOf().id==='noite'?2:evtOf().id==='cacadaouro'?1:1+((Math.random()*3)|0));specialRivalT=rand(80,110)*(evtOf().id==='tesouro'?.55:evtOf().id==='noite'?.5:evtOf().id==='cacadaouro'?.45:1)}else specialRivalT=8}}
 if(!running)return;
 if(foods.length<foodTarget()&&Math.random()<dt*8)randFood(Math.random()<.05?1:0);
 specialT-=dt;if(specialT<=0){specialT=rand(9,15);let c=0;for(const f of foods)if(f.type>=2)c++;if(c<3)randFood(2+((Math.random()*5)|0))}
 for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.96;p.vy*=.96;p.life-=dt;if(p.life<=0){particles[i]=particles[particles.length-1];particles.pop()}}
 if(player.alive){nearT-=dt;if(nearT<=0){nearT=.5;nearBots=0;for(const b of bots)if(b.alive&&Math.hypot(b.x-player.x,b.y-player.y)<320)nearBots++}
  const tgt=calcThreat(gameTime,player.length,kills,nearBots,mode==='survival');threat+=(tgt-threat)*Math.min(1,dt*.25);if(mode==='infinite')threat=Math.min(1,.2+wave*.1)}
 const M=MODES[mode];if(M.limit&&player.alive&&gameTime>=M.limit)endGame(mode==='team'&&teamScore[0]>teamScore[1]?'win':'time');
 if(mode==='team'&&player.alive){if(teamScore[0]>=M.tgoal)endGame('win');else if(teamScore[1]>=M.tgoal)endGame('time')}
 if(bossWinT>0){bossWinT-=dt;if(bossWinT<=0)endGame('win')}
 evT-=dt;if(!ev&&evT<=0&&player.alive)startEvent();eventTick(dt);
 if(dyingT>0){dyingT-=dt;if(dyingT<=0){if(mpOnline){respawnOnlinePlayer()}else if(canRevive())offerRevive();else endGame('dead')}}
 if(toastT>0){toastT-=dt;if(toastT<=0)$('toast').classList.add('hidden')}
 const tx=CFG.solidWalls?camTarget(player.x,W,worldW,CFG.camMargin):player.x-W/2,ty=CFG.solidWalls?camTarget(player.y,H,worldH,CFG.camMargin):player.y-H/2;
 cam.x+=(tx-cam.x)*Math.min(1,dt*5);cam.y+=(ty-cam.y)*Math.min(1,dt*5);
 if(pointer.active)$('tip').style.opacity='0';
 lbT-=dt;if(lbT<=0){lbT=.4;refreshLb()}
 hudT-=dt;if(hudT<=0){hudT=.1;updateHud()}}

function endGame(kind){if(mpOnline)return;document.body.classList.remove('playing');mpBroadcastEnd();dcEnd();
 if(ended)return;if(player.alive)refreshLb();ended=true;running=false;releaseDrag();syncBoostBtn();syncMusic();$('pause').classList.add('hidden');
 const M=MODES[mode];
 if(mode==='challenge'&&kind==='win')score+=Math.round(M.limit-gameTime)*2;if(mode==='boss'&&kind==='win')score+=1000+Math.max(0,Math.round(240-gameTime))*5;if(mode==='team'&&kind==='win')score+=500;
 if(mode==='survival')score=Math.max(score,0);
 const m=mode==='quick'?score:mode==='survival'?gameTime:score,prev=roundPrevBest,isRec=m>prev&&m>0;
 stats.games++;stats.kills+=kills;stats.food+=foodEaten;stats.time+=gameTime;stats.bestSize=Math.max(stats.bestSize,player.length);stats.bestKills=Math.max(stats.bestKills,kills);
 if(mode==='survival'&&isRec)stats.bestTime=gameTime;if(mode==='challenge'&&isRec)stats.bestChallenge=score;if(mode==='quick'&&isRec){bestQuick=score;bestDirty=true}if((mode==='team'||mode==='boss'||mode==='infinite'||mode==='daily')&&isRec)prog.mrec[mode]=score;
 saveStats();flushSave();countRound(kind);
 let title='Fim de jogo!',text='';
 if(kind==='win'){title='Vitória! 🏆';text=mode==='boss'?`Você derrotou o Rei Rato em ${fmtTime(gameTime)}!`:mode==='team'?teamTxt('win'):`Você eliminou ${kills} ratos em ${fmtTime(gameTime)}.`}
 else if(kind==='time'){title='Tempo esgotado!';text=mode==='team'?teamTxt('time'):`Você eliminou ${kills} de ${M.goal} ratos.`}
 else if(mode==='survival')text=`${causeText} Você sobreviveu ${fmtTime(gameTime)}.`;
 else if(mode==='challenge')text=`${causeText} Abates: ${kills} de ${M.goal}.`;
 else if(mode==='infinite')text=`${causeText} Você chegou à onda ${wave} com ${score} pontos.`;else if(mode==='boss')text=`${causeText} O chefe ainda tinha ${boss&&boss.alive?Math.round(boss.hp):0}% de vida.`;else if(mode==='team')text=teamTxt('dead');else text=`${causeText} Rodada: ${score} pontos • Tamanho: ${player.length}. ${isRec?'':`Seu recorde continua em ${bestQuick} pontos.`}`;
 $('overLogo').textContent=kind==='win'?'🏆🐭':kind==='time'?'⏱️🐭':'💥🐭';$('overTitle').textContent=title;$('endText').textContent=text.trim()+(saveFailed?' ⚠️ Não foi possível salvar neste aparelho.':'');
 $('overStats').innerHTML=`<div><small>Pontuação</small><b>${score}</b></div><div><small>Recorde</small><b>${isRec?(mode==='survival'?fmtTime(gameTime):m):fmtBest().replace(' pts','')}</b></div><div><small>Abates</small><b>${kills}</b></div><div><small>Tempo</small><b>${fmtTime(gameTime)}</b></div><div><small>Tamanho</small><b>${player.length}</b></div><div><small>Posição</small><b>#${myRank}/${rankTotal}</b></div>`;
 $('recordBanner').classList.toggle('hidden',!isRec);fillEnd(kind,isRec);$('over').classList.remove('hidden');
 sfx(isRec?'record':kind==='win'?'win':'tick');lastResult={kind,isRec,score,kills,time:gameTime};olSaveRecord(kind)}
let lastResult=null;
function fillEnd(kind,isRec){const k=$('killer'),rw=$('rewards');lastRevenge=null;
 if(kind==='dead'){let t='';if(lastKiller){const ic=lastKiller.special?SPECIALS[lastKiller.special].icon:(ARCH[lastKiller.arch]?ARCH[lastKiller.arch].i:'🐭');t=`${ic} Eliminado por <b>${lastKiller.name}</b> • tamanho ${lastKiller.length} • ${lastKiller.kills} abates`;lastRevenge={name:lastKiller.name,special:lastKiller.special||0}}else t='🧱 Você bateu na parede';k.innerHTML=t;k.classList.remove('hidden')}else k.classList.add('hidden');
 $('revenge').classList.toggle('hidden',!lastRevenge);
 const r=[];if(isRec)r.push('🏆 Novo recorde');if(specialKills)r.push(`👑 ${specialKills} rival(is) especial(is)`);if(revengeDone)r.push('🎯 Revanche cumprida');if(lastGain){if(lastGain.cheese)r.unshift('🧀 +'+lastGain.cheese);r.unshift('+'+lastGain.xp+' XP');for(const n of lastGain.notes)r.push(n)}
 rw.textContent=r.length?'🎁 Destaques: '+r.join(' • '):'';rw.classList.toggle('hidden',!r.length)}
// Revanche: o rival que eliminou você volta marcado (🎯); eliminá-lo vale +100.
function applyRevenge(){if(!pendingRevenge)return;const r=pendingRevenge;pendingRevenge=null;let b=null;
 if(r.special){const i=bots.findIndex(x=>!x.alive);if(i>=0){spawnSpecial(i,r.special);b=bots[i]}}
 else{b=bots.find(x=>x.name===r.name&&x.alive);if(!b){const i=BOTS.findIndex(n=>n[0]===r.name);if(i>=0&&!bots[i].alive){respawnBot(i);b=bots[i]}}}
 if(b){b.rival=true;showToast('🎯 Revanche: '+b.name+' está marcado!',3)}}

function startGame0(m){
 document.body.classList.remove('online-access');document.body.classList.add('playing');if(mpOnline)resize();
 if(running&&!ended&&player){stats.food+=foodEaten;stats.kills+=kills;stats.time+=gameTime;countRound();saveStats()}
 if(m)mode=m;prefs.mode=mode;savePrefs();init();applyRevenge();initMode();applyStartItems();
 ['menu','over','paused','sheet'].forEach(id=>$(id).classList.add('hidden'));$('pause').classList.remove('hidden');$('pause').classList.toggle('online-exit',!!mpOnline);$('pause').textContent='SAIR';
 running=true;paused=false;resumeCountdown=0;$('resumeWait').classList.add('hidden');ended=false;releaseDrag();pointer.dirX=1;pointer.dirY=0;$('tip').style.opacity='1';inputLock=performance.now()+300;
 ensureAudio();sfx('start');syncMusic();tryFullscreen()}
function expandGameScreen(){try{const el=document.documentElement;if(document.fullscreenElement){if(document.exitFullscreen)document.exitFullscreen().catch(()=>{});return}if(el.requestFullscreen){const p=el.requestFullscreen({navigationUI:'hide'});if(p&&p.then)p.then(()=>{try{const o=screen.orientation;if(o&&o.lock)o.lock('landscape').catch(()=>{})}catch(e){}}).catch(()=>{})}}catch(e){}}
function tryFullscreen(){if(!prefs.fullscreen)return;try{const el=document.documentElement;if(document.fullscreenElement||!el.requestFullscreen)return;const p=el.requestFullscreen({navigationUI:'hide'});if(p&&p.then)p.then(()=>{try{const o=screen.orientation;if(o&&o.lock)o.lock('landscape').catch(()=>{})}catch(e){}}).catch(()=>{})}catch(e){}}
function fillPause(){const rc=Object.values(roundEarn).reduce((a,b)=>a+b,0);$('pauseStats').innerHTML=[['Pontos',score],['Tamanho',player.length],['Abates',kills],['Tempo',fmtTime(gameTime)],['Queijos','+'+rc]].map(c=>`<div><small>${c[0]}</small><b>${c[1]}</b></div>`).join('')}
function togglePause(){if(tutOpen||!running||ended||!player.alive)return;if(paused){resumeFromPause();return}paused=true;resumeCountdown=0;player.localPaused=!!mpOnline;$('resumeWait').classList.add('hidden');releaseDrag();player.boostActive=false;fillPause();$('paused').classList.remove('hidden');$('pause').textContent='▶';if(mpRole==='client'&&mpDC&&mpDC.readyState==='open')mpDC.send(JSON.stringify({p:true,a:+mpAng.toFixed(2),b:0}));flushSave();syncBoostBtn();syncMusic()}
function resumeFromPause(){if(!paused||!running||ended)return;paused=false;resumeCountdown=mpOnline?5:0;if(player)player.localPaused=!!resumeCountdown;$('pause').textContent='SAIR';$('paused').classList.add('hidden');if(resumeCountdown>0){$('resumeCount').textContent='5';$('resumeWait').classList.remove('hidden')}else if(player)player.localPaused=false;syncBoostBtn();syncMusic()}
function toMenu(){document.body.classList.remove('playing');if(mpRole)mpLeave();else if(ol.inRoom)olLeaveRoom();mpOnline=false;mpPending=false;mpRole=null;if(running&&!ended&&player){stats.food+=foodEaten;stats.kills+=kills;stats.time+=gameTime;countRound()}running=false;paused=false;resumeCountdown=0;$('resumeWait').classList.add('hidden');ended=true;releaseDrag();saveStats();flushSave();syncMusic();['over','paused','sheet'].forEach(id=>$(id).classList.add('hidden'));$('pause').classList.add('hidden');init();ended=false;$('menu').classList.remove('hidden');olApplyIdentity();menuInfo()}

