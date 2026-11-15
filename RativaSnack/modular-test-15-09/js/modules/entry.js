/* Fragmento preservado do JavaScript original. Não carregar isoladamente; usar build.mjs. */
/* ============ Entrada ============ */
function setPointer(e){const r=canvas.getBoundingClientRect();pointer.x=e.clientX-r.left;pointer.y=e.clientY-r.top;pointer.active=true}
function releaseDrag(){boostHold=false;bid=null;pointer.down=false;pointer.active=false;pointer.hasDirection=false;pointer.id=null}
// O rato anda sempre; a direção vem do vetor âncora→dedo (âncora flutuante). Ao soltar, mantém o último rumo (targetAngle).
canvas.addEventListener('pointerdown',e=>{if(!running||paused||resumeCountdown>0||!player.alive||performance.now()<inputLock)return;e.preventDefault();pointer.down=true;pointer.id=e.pointerId;pointer.hasDirection=false;setPointer(e);if(!ctlDown()){pointer.down=false;pointer.id=null;return}try{canvas.setPointerCapture(e.pointerId)}catch(_){}});
canvas.addEventListener('pointermove',e=>{if(!pointer.down||e.pointerId!==pointer.id)return;e.preventDefault();setPointer(e);ctlUpdate()});
function endDrag(e){if(e&&pointer.id!==null&&e.pointerId!==pointer.id)return;pointer.down=false;pointer.active=false;pointer.id=null}
canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);
// Puxar a aba de notificações no Android costuma só CANCELAR o toque (sem blur/visibilitychange): cancelamento de toque ou saída da tela cheia pausa.
canvas.addEventListener('lostpointercapture',endDrag);bb.classList.toggle('left',prefs.boostLeft);
bb.addEventListener('pointerdown',e=>{if(!running||paused||resumeCountdown>0)return;e.preventDefault();e.stopPropagation();bid=e.pointerId;boostHold=true;try{bb.setPointerCapture(e.pointerId)}catch(_){}});
const bUp=e=>{if(bid!==null&&e&&e.pointerId!==bid)return;bid=null;boostHold=false};
['pointerup','pointercancel','lostpointercapture'].forEach(n=>bb.addEventListener(n,bUp));bb.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('contextmenu',e=>e.preventDefault());

$('menu').addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-sheet]');if(b){if(b.dataset.sheet==='mp')mpOpen();else openSheet(b.dataset.sheet)}});
$('sheetBody').addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-act]');if(b)onAct(b.dataset.act)});
$('sheetBack').onclick=()=>{$('sheet').classList.add('hidden');$('menu').classList.remove('hidden');menuInfo()};
$('play').onclick=()=>{if(!ol.token){location.href='https://vt12gt.github.io/RativaGames/';return}olDoPlay(mode)};applySkillsToCfg();applyControlPrefs();applyA11y();
function startGame(m){if(!mpOnline){if(!ol.token){location.href='https://vt12gt.github.io/RativaGames/';return}olDoPlay(m||mode);return}const mm=m||mode;if(mm==='mundial'){if(!wbOpen()){gAlert(wbMsg());return}if(prog.wbClaim===wbId()){gAlert('👑 Você já derrotou o Colosso Mundial nesta janela! Volte no próximo horário (10:00 ou 22:00).');return}wbRun=true;wbRunId=wbId();wbA0=wbHpNow();m='boss'}else wbRun=false;if(mm==='daily'&&!dcStart())return;startGame0(m);if(!prefs.tut[mode])openTut(mode);else{const e=evtOf();showToast('🌟 '+e.n+': '+e.d,3)}}
function openTut(k){const T=TUT[k];if(!T)return;tutOpen=true;paused=true;$('tutI').textContent=T[0];$('tutT').textContent=T[1];$('tutL').innerHTML='<p>🕹️ Arraste o dedo para guiar • segure ⚡ para acelerar.</p>'+T[2].map(x=>`<p>• ${x}</p>`).join('');$('tut').classList.remove('hidden');syncBoostBtn()}
function closeTut(){if(!tutOpen)return;tutOpen=false;paused=false;prefs.tut[mode]=1;savePrefs();$('tut').classList.add('hidden');releaseDrag();syncBoostBtn()}
$('tutOk').onclick=closeTut;
function showNick(first){$('nickIn').value=prefs.nick||'';$('nick').classList.remove('hidden');$('nick').dataset.first=first?'1':'';setTimeout(()=>{try{$('nickIn').focus()}catch(e){}},50)}
function saveNick(){const v=cleanNick($('nickIn').value);if(v.length<2){$('nickIn').classList.add('bad');return}prefs.nick=v;savePrefs();$('nick').classList.add('hidden');$('nickIn').classList.remove('bad');menuInfo();if(player)player.name=v}
$('nickOk').onclick=saveNick;$('nickIn').addEventListener('keydown',e=>{if(e.key==='Enter')saveNick()});$('whoBtn').onclick=()=>showNick(false);
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;if(sheetName==='settings')renderSheet('settings')});
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').then(r=>{r.addEventListener('updatefound',()=>{const w=r.installing;if(w)w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller){updReady=true;showToast('⬆️ Nova versão disponível! Feche e abra o jogo para atualizar.',5)}})})}).catch(()=>{}));
if(!prefs.nick&&!location.hash.includes('ratopolis_token='))setTimeout(()=>showNick(true),250);$('whoBtn').classList.add('hidden');$('pause').classList.add('hidden');$('again').onclick=()=>startGame(mode);$('revenge').onclick=()=>{pendingRevenge=lastRevenge;startGame(mode)};$('toMenu').onclick=toMenu;$('reviveYes').onclick=doRevive;$('reviveNo').onclick=declineRevive;$('pause').onclick=togglePause;$('resume').onclick=resumeFromPause;$('restart').onclick=()=>{if(ol.token)olExitToLobby();else startGame(mode)};$('quit').onclick=()=>{if(ol.token)olExitToLobby();else toMenu()};
addEventListener('keydown',e=>{if(e.key==='Escape'||(e.key&&e.key.toLowerCase()==='p'))togglePause()});
document.addEventListener('visibilitychange',()=>{releaseDrag();if(document.hidden){flushSave();try{if(ac)ac.suspend()}catch(e){}}else{try{if(ac&&(prefs.music||prefs.sfx))ac.resume()}catch(e){}}syncMusic()});
addEventListener('blur',()=>{releaseDrag();flushSave()});addEventListener('pagehide',flushSave);document.addEventListener('freeze',flushSave);setInterval(()=>{if(running)flushSave()},5000);

init();menuInfo();requestAnimationFrame(frame);
// Entrada direta pelo portal Ratópolis: valida a sessão e inicia a busca de partida online.
if(location.hash.includes('ratopolis_token=')){setTimeout(()=>{mpOpen();olHome()},0)}
if(window.__RATO_TEST__)window.__RATO_TEST__.api={CFG,MODES,BOTS,ARCH,prefs,stats,get player(){return player},get bots(){return bots},get snakes(){return snakes},get foods(){return foods},get particles(){return particles},get cam(){return cam},get world(){return[worldW,worldH]},
 CAT,owns,doBuyCosm,ensureOwn,offerRevive,doRevive,declineRevive,canRevive,reviveCost,goalTarget,goalTick,leaderGet:()=>leader,steerPlayer,updateBoost,spawnSpecial,botTarget,menuInfo,DIFFS,DEVT,evtOf,evtState,TUT,closeTut,cleanNick,get tutOpen(){return tutOpen},CAT,SKINS,doUpgrade,doBuy,skillVal,skillCost,SKILL_CFG,START_ITEMS,SPECIALS,applySkillsToCfg,eco,earn,spend,settleEarn,SYNC,mirrorIDB,bodyFromTrail,initTrail,snapshot,get boss(){return boss},get ev(){return ev},get wave(){return wave},get teamScore(){return teamScore},startEvent,nextWave,bossTick,modeHud,tm,prog,countRound,claimDaily,ensureDay,lvlInfo,checkAch,genMissions,dailyAvail,drawPreview,applyCosmetics,refreshLb,fillEnd,setRevenge:v=>{pendingRevenge=v},get lastRevenge(){return lastRevenge},flushSave,readObj,writeKey,store,get saveFailed(){return saveFailed},get bestQuick(){return bestQuick},setBest:v=>{bestQuick=v;bestDirty=true},setHold:v=>{boostHold=v},st:()=>({running,paused,ended,gameTime,score,kills,mode,threat,dyingT,lastResult,causeText,foodEaten,bestQuick}),setThreat:v=>{threat=v},setMode:m=>{mode=m},start:startGame,die,collisions,eat,mkSnake,spawnFood,endGame,toMenu,applyFood,botThink,probeRisk,sfx,syncMusic,ensureAudio,update,togglePause,get musTimer(){return musTimer}};
})();
