/* Fragmento preservado do JavaScript original. Não carregar isoladamente; usar build.mjs. */
/* ===== Multiplayer ONLINE: conta + salas automáticas por WebSocket. Nada disso roda no modo offline. ===== */
const RATO_SERVER_URL='https://rativasnack-system-host-test.onrender.com';   // servidor Node.js multiplayer publicado na Render
let mpOnline=false;const OL_KEY='ratoSnackOnline',ol={url:RATO_SERVER_URL,token:'',id:'',nick:'',ws:null,inRoom:false,isHost:false,hostId:null,players:[],tries:0,bye:false,view:false,profile:null,serverOnly:false};
const olEsc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const OL_ERR={campos_obrigatorios:'Informe seu usuário/e-mail e senha.',credenciais:'Usuário/e-mail ou senha incorretos.',muitas_tentativas:'Muitas tentativas. Aguarde 1 minuto.',sessao_invalida:'Sessão Ratópolis expirada. Entre novamente.',ratopolis_indisponivel:'O serviço de login do Ratópolis está indisponível.'};
function olLoad(){ol.url=RATO_SERVER_URL;try{localStorage.removeItem(OL_KEY)}catch(e){}if(!ol.token){ol.id='';ol.nick='';ol.level=1;ol.xp=0;try{const params=new URLSearchParams(location.hash.slice(1));const handedToken=params.get('ratopolis_token'),handedNick=params.get('ratopolis_nick');if(handedNick)ol.nick=String(handedNick).slice(0,24);if(handedToken&&handedToken.length<=4096){ol.token=handedToken;ol.ssoPending=true;ol.serverOnly=true;onlineServerOnly=true;history.replaceState(null,'',location.pathname+location.search)}}catch(e){}}}
function olSave(){/* Sessão e perfil Online nunca são persistidos neste aparelho. O Portal entrega um token temporário a cada entrada. */}
const olHttp=u=>u.replace(/^ws/,'http').replace(/\/+$/,''),olWs=u=>u.replace(/^http/,'ws').replace(/\/+$/,'');
async function olSyncProgress(){if(!ol.token)throw new Error('sessao_ausente');const remote=await olApi('/api/rato-snack/sync',null,ol.token);if(remote.s!==200||!remote.profile)throw new Error('perfil_online_indisponivel');const profile=remote.profile;ol.profile=profile;ol.xp=Math.max(0,Number(profile.xp)||0);ol.level=Math.max(1,Number(profile.level)||1);prog.xp=Math.min(XP.max,ol.xp);prog.lvlRw=ol.level;prog.xpLog=[];prog.xpSeq=0;prog.xpAck=0;eco.cheese=Math.max(0,Number(profile.coins)||0);bestQuick=Math.max(0,Number(profile.best_score)||0);stats.games=Math.max(0,Number(profile.games_played)||0);stats.wins=Math.max(0,Number(profile.wins)||0);for(const a of (remote.achievements||[])){const id=String(a.achievement_code||'');if(ACH.some(x=>x.id===id)){prog.ach[id]=1;delete prog.achR[id]}}for(const item of (remote.inventory||[])){const parts=String(item.item_code||'').split(':');if(parts.length!==2)continue;const cat=parts[0],id=parts[1];if(eco.own[cat]&&CAT[cat]&&CAT[cat][id])eco.own[cat][id]=1}return true}
async function olApi(path,body,tok){const r=await fetch(olHttp(ol.url)+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(tok?{Authorization:'Bearer '+tok}:{})},body:body?JSON.stringify(body):undefined});let j={};try{j=await r.json()}catch(e){}return Object.assign({s:r.status},j)}
function olSaveRecord(kind){if(!mpOnline||!ol.token||!ol.inRoom)return;const finalSize=Math.max(0,Math.floor(player?player.length:0));const payload={mode,size:finalSize,total_size:finalSize,score:Math.max(0,Math.floor(score)),duration_ms:Math.max(0,Math.floor(gameTime*1000)),result:kind==='win'?'win':'finish',details:{mode,kills,food:foodEaten,size:finalSize,total_size:finalSize,special_kills:specialKills}};olApi('/api/rato-snack/records',payload,ol.token).then(r=>{if(r.s===409)showToast('Ranking protegido: resultado aguardando validação do servidor.',4);else if(r.s!==201&&r.s!==200)showToast('Não foi possível registrar a pontuação no servidor.',4)}).catch(e=>showToast('Falha ao enviar pontuação ao servidor.',4))}
function olSetAuth(j){ol.token=j.token;ol.id=j.id;ol.nick=j.nick;olSave()}
async function olConnect(){if(ol.ws&&ol.ws.readyState===1)return;const issued=await olApi('/api/ws-ticket',{},ol.token);if(issued.s!==200||!issued.ticket)throw new Error('ticket');return new Promise((res,rej)=>{let done=false;const ws=new WebSocket(olWs(ol.url)+'/ws?ticket='+encodeURIComponent(issued.ticket));ol.ws=ws;
 ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch(_){return}if(m.t==='hello'&&!done){done=true;res()}olMsg(m)};ws.onerror=()=>{if(!done){done=true;rej(new Error('conexao'))}};ws.onclose=ev=>{if(ol.ws===ws)ol.ws=null;if(!done){done=true;rej(new Error('fechada'))}olClosed(ev.code)}})}
function olSend(o){if(ol.ws&&ol.ws.readyState===1){ol.ws.send(JSON.stringify(o));return true}return false}
async function olPlay(){ol.mode='quick';await olConnect();ol.inRoom=true;ol.bye=false;olSend({t:'play',mode:'quick'})}
function olDC(uid){return{get readyState(){return ol.ws&&ol.ws.readyState===1?'open':'closed'},get bufferedAmount(){return ol.ws?ol.ws.bufferedAmount:0},send(str){olSend({t:'st',to:uid,d:str})},close(){}}}
function olGuestDC(){return{get readyState(){return ol.ws&&ol.ws.readyState===1?'open':'closed'},send(str){olSend({t:'in',d:str})},close(){}}}
function olHello(){olSend({t:'in',d:JSON.stringify({h:ol.nick,rat:prefs.rat,col:prefs.color,sk:prefs.skin})})}
function olFinalizeLeave(){mpServerAuthoritative=false;if(ol.leaveTimer){clearTimeout(ol.leaveTimer);ol.leaveTimer=0}ol.leavePending=false;ol.inRoom=false;ol.players=[];ol.bye=false;mpConns.length=0;mpSlots.length=0}
function olBeginLeave(onDone){if(ol.leavePending)return;const ws=ol.ws;if(!ws||ws.readyState!==1){olFinalizeLeave();if(onDone)onDone();return}ol.leavePending=true;ol.leaveDone=onDone||null;const command=ol.isHost?{t:'ctl',k:'end'}:{t:'leave'};if(!olSend(command)){olFinalizeLeave();if(onDone)onDone();return}ol.leaveTimer=setTimeout(()=>{const done=ol.leaveDone;const stale=ol.ws;ol.ws=null;try{if(stale&&stale.readyState<2)stale.close(1000,'leave_timeout')}catch(_){}olFinalizeLeave();if(done)done()},1200)}
function olLeaveRoom(){olBeginLeave()}
function olClosed(code){if(ol.bye){ol.bye=false;return}if(code===4001){showToast('⚠️ Sua conta entrou em outro aparelho.',4);ol.inRoom=false;if(mpOnline){mpLeave();toMenu()}return}
 if(!ol.inRoom)return;ol.tries++;if(ol.tries>12){showToast('Conexão perdida.',3);ol.inRoom=false;if(mpOnline){mpLeave();toMenu()}return}showToast('📶 Conexão perdida. Reconectando…',3);setTimeout(()=>{if(ol.inRoom)olConnect().then(()=>{ol.tries=0}).catch(()=>olClosed(1006))},Math.min(8000,1000*ol.tries))}
function olSlotBind(c){const i=Math.max(0,c.slot-1);mpSlots[i]=c;if(bots[i]){if(!bots[i].alive)respawnBot(i);mpBind(bots[i],c)}}
function olHostStart(selectedMode){mpSlots.length=0;for(const c of mpConns)if(c.open)mpSlots[Math.max(0,c.slot-1)]=c;mpRole='host';mpPending=true;mpOnline=true;mpClose();startGame(selectedMode||ol.mode||'quick')}
function olMsg(m){
 switch(m.t){
  case 'joined':ol.hostId=m.host;ol.isHost=m.isHost;ol.players=m.players;if(ol.view)olRoomView();break;
  case 'roster':ol.players=m.players;if(ol.view)olRoomView();break;
  case 'countdown':if(ol.view)olRoomView('A partida começa em '+Math.round(m.ms/1000)+' s…');break;
  case 'start':ol.view=false;ol.mode=m.mode||ol.mode||'quick';if(m.authoritative){mpServerAuthoritative=true;mpRole='client';mpOnline=true;mpClose();startGame0(ol.mode||'quick');olSend({t:'appearance',color:prefs.color,skin:prefs.skin,rat:prefs.rat,turnRate:olTurnRate()});showToast('☁️ Partida simulada pelo servidor',2.5)}else if(ol.isHost){if(mpRole!=='host')olHostStart(ol.mode)}else if(mpRole!=='client'){mpOnline=true;mpClientMsg({data:JSON.stringify({start:1,mode:ol.mode})});olHello()}break;
  case 'state':if(mpServerAuthoritative&&mpRole==='client')mpApply(m);break;
  case 'mode_unsupported':ol.inRoom=false;ol.view=false;mpBox('<div class="ol-screen"><div class="ol-mark">🛠️</div><h2>MODO EM MIGRAÇÃO</h2><p>Este teste já roda a partida no servidor, mas por enquanto somente Partida rápida foi migrada.</p>'+mpB('Voltar e escolher Partida rápida','toMenu()')+'</div>');break;
  case 'peer_join':{if(!ol.isHost)break;let c=mpConns.find(x=>x.uid===m.id);if(!c){c={pc:null,dc:olDC(m.id),open:true,nick:m.nick,ang:0,boost:0,uid:m.id,slot:m.slot};mpConns.push(c)}c.open=true;c.nick=m.nick;c.slot=m.slot;if(mpRole==='host'&&running)olSlotBind(c);break}
  case 'peer_offline':{const c=mpConns.find(x=>x.uid===m.id);if(c){c.open=false;const i=mpSlots.indexOf(c);if(i>=0&&bots[i])bots[i].alive=false}break}
  case 'peer_back':{const c=mpConns.find(x=>x.uid===m.id);if(c){c.open=true;const i=mpSlots.indexOf(c);if(i>=0&&bots[i])bots[i].respawnAt=0;else if(mpRole==='host'&&running)olSlotBind(c)}break}
  case 'peer_leave':{const k=mpConns.findIndex(x=>x.uid===m.id);if(k>=0){const c=mpConns[k],i=mpSlots.indexOf(c);if(i>=0){if(bots[i])bots[i].alive=false;mpSlots[i]=null}mpConns.splice(k,1)}break}
  case 'in':{const c=mpConns.find(x=>x.uid===m.from);if(c)mpHostMsg(c,m.d);break}
  case 'st':if(mpRole==='client')mpClientMsg({data:m.d});break;
  case 'left':{const done=ol.leaveDone;olFinalizeLeave();if(done)done();break}
  case 'end':if(mpRole==='client'){mpClientMsg({data:'{"end":1}'})}else if(ol.view){ol.view=false;olHome();olMsgSet('A sala foi encerrada.')}break;
  case 'kicked':break}}
let olDeathTimer=0,olDeathActive=false,olDeathInterval=0,olExitReason='VOCÊ FOI ELIMINADO';
function olDeathModeExempt(){return mode==='boss'||mode==='mundial'||wbRun===true}
function olShowExitSummary(reason){
 if(!mpOnline)return false;
 olExitReason=reason||'VOCÊ SAIU DA PARTIDA';olDeathActive=true;olDeathTimer=3;
 running=false;paused=false;document.body.classList.remove('playing');releaseDrag();syncMusic();$('pause').classList.add('hidden');
 if(olDeathInterval)clearInterval(olDeathInterval);
 olDeathInterval=setInterval(()=>{if(!olDeathActive){clearInterval(olDeathInterval);olDeathInterval=0;return}olDeathTimer=Math.max(0,olDeathTimer-1);const c=document.getElementById('olDeathCount');if(c)c.textContent=String(olDeathTimer);if(olDeathTimer<=0)olFinishDeathExit()},1000);
 let el=document.getElementById('olDeathSummary');if(!el){el=document.createElement('div');el.id='olDeathSummary';el.style.cssText='position:fixed;inset:0;z-index:100001;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(8,5,24,.92);color:#fff;font-family:system-ui';document.body.appendChild(el)}
 el.innerHTML='<div style="width:min(440px,100%);padding:24px;border:1px solid #8b5cf6;border-radius:22px;background:linear-gradient(145deg,#25134b,#101026);text-align:center;box-shadow:0 18px 60px #0009"><div style="font-size:42px">🚪🐭</div><h2 style="margin:8px 0;color:#ffd166">SAINDO DA PARTIDA</h2><p style="margin:0 0 16px;color:#d7c9ff">Preparando seu retorno ao Lobby Online…</p><p style="margin:18px 0 0">Voltando em <b id="olDeathCount" style="font-size:28px;color:#ffd166">'+olDeathTimer+'</b> segundos</p></div>';
 return true;
}
function olShowDeathSummary(){
 if(olDeathModeExempt())return false;
 if(!mpOnline)return false;
 running=false;paused=false;document.body.classList.remove('playing');releaseDrag();syncMusic();$('pause').classList.add('hidden');
 olDeathActive=true;olDeathTimer=5;
 const el=document.getElementById('olDeathSummary')||document.createElement('div');
 el.id='olDeathSummary';el.style.cssText='position:fixed;inset:0;z-index:100001;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(8,5,24,.92);color:#fff;font-family:system-ui';
 if(!el.parentNode)document.body.appendChild(el);
 const detail=lastKiller&&lastKiller.name?('Eliminado por '+lastKiller.name):causeText||'Você foi eliminado';
 el.innerHTML='<div style="width:min(460px,100%);padding:22px;border:1px solid #8b5cf6;border-radius:22px;background:linear-gradient(145deg,#25134b,#101026);text-align:center;box-shadow:0 18px 60px #0009"><div style="font-size:42px">💥🐭</div><h2 style="margin:8px 0;color:#ffd166">VOCÊ FOI ELIMINADO</h2><p style="margin:0 0 14px;color:#d7c9ff">'+olEsc(detail)+'</p><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:9px"><div style="padding:11px;background:#ffffff12;border-radius:12px"><small>PONTOS</small><h2>'+Math.floor(score)+'</h2></div><div style="padding:11px;background:#ffffff12;border-radius:12px"><small>TAMANHO</small><h2>'+Math.floor(player&&player.length||0)+'</h2></div><div style="padding:11px;background:#ffffff12;border-radius:12px"><small>ABATES</small><h2>'+kills+'</h2></div><div style="padding:11px;background:#ffffff12;border-radius:12px"><small>TEMPO</small><h2>'+fmtTime(gameTime)+'</h2></div></div><p style="margin:14px 0 0;color:#ffe08a">Resumo da partida • <b id="olDeathCount" style="font-size:25px;color:#ffd166">5</b>s</p></div>';
 return true;
}
function olFinishDeathSummary(){
 if(!olDeathActive)return;
 olDeathActive=false;olDeathTimer=0;
 const el=document.getElementById('olDeathSummary');if(el)el.remove();
 // Mantém a partida/sessão Online ativa: primeiro oferece o revive, sem encerrar a sala.
 running=true;paused=false;
 if(canRevive()){offerRevive();return}
 endGame('dead');
}
function olFinishDeathExit(){
 if(!olDeathActive)return;
 olDeathActive=false;olDeathTimer=0;if(olDeathInterval){clearInterval(olDeathInterval);olDeathInterval=0}
 const el=document.getElementById('olDeathSummary');if(el)el.remove();
 running=false;paused=false;ended=true;releaseDrag();ol.view=false;
 // Encerra os canais locais sem fechar o WebSocket antes da confirmação do servidor.
 mpOnline=false;mpPending=false;try{if(mpDC)mpDC.close();if(mpPC)mpPC.close()}catch(_){}mpDC=mpPC=null;
 for(const c of mpConns){try{if(c.dc)c.dc.close();if(c.pc)c.pc.close()}catch(_){}}
 mpConns.length=0;mpSlots.length=0;mpRole=null;
 // Envia a saída ao servidor, mas não prende a navegação esperando o ACK.
 // O Lobby é aberto imediatamente; a confirmação/limpeza do socket acontece em segundo plano.
 try{olBeginLeave()}catch(e){olFinalizeLeave()}
 try{olHome()}catch(e){onlineServerOnly=true;mpBox('<div class="ol-screen"><div class="ol-mark">🐭🌐</div><h2>LOBBY ONLINE</h2><p>Você saiu da partida. A conexão da sala está sendo encerrada.</p>'+mpB('Voltar ao Lobby','olHome()')+'</div>')}
}
/* ---- telas ---- */
const olIn=(id,ph,t)=>`<input id="${id}" type="${t||'text'}" placeholder="${ph}" autocomplete="off" autocapitalize="off" style="width:100%;margin-top:6px;padding:8px;border-radius:8px;border:1px solid #7f5fd0;background:#1b1140;color:#fff;font-size:14px;box-sizing:border-box">`,olBack=mpB('Voltar','mpHome()','background:#5b2f48;color:#fff'),olVal=id=>{const e=mpEl(id);return e?String(e.value||'').trim():''};
function olMsgSet(t){const e=mpEl('olMsg');if(e)e.textContent=t}
function olIdentityValue(o,keys){for(const k of keys){const v=o&&o[k];if(typeof v==='string'&&v.trim()&&!['rativa games','rativo games','ratópolis','ratopolis','ratosnack'].includes(v.trim().toLowerCase()))return v.trim()}return ''}
function olReadIdentity(me){const p=[];const add=o=>{if(!o||typeof o!=='object'||p.includes(o))return;p.push(o);['user','account','profile','perfil','data','player','jogador','usuario'].forEach(k=>add(o[k]))};add(me);let nick='';for(const o of p){nick=olIdentityValue(o,['nickname','apelido','nick','displayName','display_name','username','userName','name']);if(nick)break}return{nick}}
async function olApplyIdentity(){if(!ol.nick)return;prefs.nick=ol.nick;savePrefs();if(player)player.name=ol.nick;const w=$('whoBtn');if(w){w.classList.remove('hidden');w.setAttribute('aria-label','Jogador Online: '+ol.nick);w.style.pointerEvents='none'}const n=$('nick');if(n)n.classList.add('hidden');const lvl=Math.max(1,Number(ol.level)||1);const nm=$('nickMenu');if(nm)nm.textContent=ol.nick+' · Nv. '+lvl;const hud=$('nickHud');if(hud)hud.textContent=ol.nick+' · Nv. '+lvl;const lv=$('lvlT');if(lv)lv.textContent='NÍVEL RATIVASNACK: '+lvl+' · '+Math.max(0,Number(ol.xp)||0)+' XP'}
async function olVerifyRatopolisSession(){ol.ssoPending=false;olMsgSet('Validando sua conta do Portal…');try{if(!ol.token)throw new Error('portal_token_missing');const me=await olApi('/api/me',null,ol.token);if(me.s!==200||!me.id)throw new Error('sessao_invalida');const ident=olReadIdentity(me);ol.id=me.id;if(ident.nick)ol.nick=ident.nick;await olSyncProgress();olApplyIdentity();document.body.classList.remove('online-access');menuInfo();resize();const gate=mpEl('mp');if(gate)gate.style.display='none';ol.view=false;if(!ol.nick)throw new Error('nickname_missing');showToast('Bem-vindo ao RativaSnack, '+ol.nick+'!',3);return}catch(e){ol.token='';ol.id='';ol.nick='';ol.serverOnly=false;onlineServerOnly=true;const gate=mpEl('mp');if(gate)gate.style.display='none';ol.view=false;mpBox('<b>🔒 Acesso pelo Portal RativaGames</b><p>Não foi possível validar sua sessão ou carregar seu perfil exclusivo do RativaSnack. Volte ao Portal, entre na sua conta e abra o jogo novamente.</p>'+mpB('Ir para o Portal','location.href=\'https://vt12gt.github.io/RativaGames/\'')+'<p id="olMsg">Seu progresso não foi alterado.</p>');console.warn('RativaSnack: sessão/perfil Online não validado',e)}}
function olHome(){document.body.classList.remove('playing');document.body.classList.add('online-access');olLoad();ol.view=false;if(!ol.token){onlineServerOnly=true;mpBox('<div class="ol-screen"><div class="ol-mark">🐭🌐</div><h2>RATIVASNACK ONLINE</h2><p>O Online é exclusivo para jogadores que entram pelo Portal RativaGames com uma conta autenticada.</p>'+mpB('Abrir Portal RativaGames','location.href=\'https://vt12gt.github.io/RativaGames/\'')+'</div>');return}onlineServerOnly=true;ol.serverOnly=true;if(ol.ssoPending){mpBox('<div class="ol-screen"><div class="ol-mark">🐭🧀</div><h2>Conectando ao servidor</h2><div class="ol-spinner"></div><p id="olMsg">Validando sua conta RativaGames…</p><div class="ol-steps"><span>🔐 Conta</span><span>☁️ Perfil Online</span><span>🌐 Servidor</span></div></div>');olVerifyRatopolisSession()}else if(ol.nick&&ol.profile){mpBox('<div class="ol-screen"><div class="ol-mark">🐭🧀</div><h2>LOBBY ONLINE</h2><div class="ol-player">👤 '+olEsc(ol.nick)+' · Nv. '+Math.max(1,Number(ol.level)||1)+'</div><p>Conectado ao servidor. Escolha Jogar para procurar uma sala.</p>'+mpB('⛶ EXPANDIR TELA','expandGameScreen()','background:#4b3475;color:#fff')+mpB('▶ JOGAR ONLINE','olDoPlay()')+'</div>')}else{ol.ssoPending=true;olHome()}}
function olSetUrl(){const e=mpEl('olU');if(!e){ol.url='';olSave();return olHome()}const u=olVal('olU');if(!/^(https?|wss?):\/\/[^\s]+$/i.test(u)){olMsgSet('Endereço inválido. Use http(s):// ou ws(s)://');return}ol.url=u;olSave();olHome()}
async function olAuth(path,b){olMsgSet('Conectando…');if(navigator.onLine===false){olMsgSet('Sem internet.');return}try{const j=await olApi(path,b);if(j.s===200&&j.token&&j.id&&j.nick){olSetAuth(j);olHome()}else olMsgSet(OL_ERR[j.error]||'Não foi possível entrar ('+j.s+').')}catch(e){olMsgSet('Não consegui falar com o servidor.')}}
function olDoLogin(){olAuth('/api/login',{identifier:olVal('olL'),password:mpEl('olP').value})}
async function olDoLogout(){try{await olApi('/api/logout',{},ol.token)}catch(e){}ol.token=ol.id=ol.nick='';olSave();olHome()}
async function olDoPlay(selectedMode){if(navigator.onLine===false){olMsgSet('Sem Internet. Conecte-se para jogar Online.');return}if(!ol.token||!ol.serverOnly||!ol.profile||!ol.id){olHome();return}ol.view=true;olLoading('Procurando uma sala…');try{olApplyIdentity();await olPlay();if(ol.players.length)olRoomView();}catch(e){ol.inRoom=false;ol.view=false;olLoadingError('Não foi possível conectar à sala. Sua sessão será validada novamente ao reconectar. Nenhum progresso local foi usado.')}}
function olLoading(message){mpBox('<div class="ol-screen"><div class="ol-mark">🐭⚡</div><h2>PROCURANDO UMA SALA</h2><div class="ol-spinner"></div><p id="olLoadText">'+olEsc(message||'Conectando…')+'</p><div class="ol-steps"><span>🔐 Conta validada</span><span>☁️ Perfil carregado</span><span>🎮 Sala online</span></div><p><small>Estamos procurando jogadores reais para esta modalidade.</small></p></div>')}function olLoadText(message){const e=mpEl('olLoadText');if(e)e.textContent=message}function olLoadingError(message){mpBox('<div class="ol-screen"><div class="ol-mark">⚠️</div><h2>Não foi possível conectar</h2><p>'+olEsc(message)+'</p>'+mpB('Tentar novamente','olDoPlay()')+mpB('Voltar ao Portal','location.href=\'https://vt12gt.github.io/RativaGames/\'')+'</div>')}function olRoomView(extra){const modeName=(MODES[ol.mode||mode]||MODES.quick).name;mpBox(`<div class="ol-screen"><div class="ol-mark">🌐</div><h2>SALA ONLINE · ${olEsc(modeName)}</h2><p>${ol.players.map(p=>(p.id===ol.id?'⭐ ':'• ')+olEsc(p.nick||(p.id===ol.id?ol.nick:'Jogador'))+' · Nv. '+Math.max(1,Number(p.level)||1)+(p.id===ol.hostId?' 👑':'')+(p.online?'':' (reconectando)')).join('<br>')||'Aguardando jogadores…'}</p><p>${olEsc(extra||'Sala encontrada. Aguardando jogadores e início da partida…')}</p>${mpB('Sair da sala','olCancel()','background:#5b2f48;color:#fff')}</div>`)}
function olExitToLobby(){
 // A tela volta imediatamente ao menu local. A saída da sala é confirmada em segundo plano.
 if(olDeathInterval){clearInterval(olDeathInterval);olDeathInterval=0}
 olDeathActive=false;olDeathTimer=0;
 const summary=document.getElementById('olDeathSummary');if(summary)summary.remove();
 ol.view=false;
 try{olBeginLeave()}catch(e){try{olFinalizeLeave()}catch(_){}}
 // toMenu() é o equivalente Online do retorno instantâneo usado pelo Offline.
 toMenu();
}
function olCancel(){if(ol.token){olExitToLobby();return}toMenu()}
let wbRun=false,wbRunId=0,wbA0=100;const WB_TIERS=[{p:25,c:100,x:0},{p:50,c:200,x:100},{p:75,c:300,x:150}];
const WB_START=[600,1320],WB_LEN=60,wbMin=()=>{const d=new Date();return d.getHours()*60+d.getMinutes()},wbSlot=()=>{const m=wbMin();for(let i=0;i<2;i++)if(m>=WB_START[i]&&m<WB_START[i]+WB_LEN)return i;return -1},wbOpen=()=>wbSlot()>=0,wbId=()=>today()*2+Math.max(0,wbSlot());
function wbWait(){const m=wbMin();let best=1e9;for(const st of WB_START){let w=st-m;if(w<=0)w+=1440;best=Math.min(best,w)}return best}
const fmtHM=m=>(m>=60?Math.floor(m/60)+'h ':'')+(m%60)+'min',wbMsg=()=>'👑 O Boss Mundial só abre às 10:00 e às 22:00 (1 hora cada). Faltam '+fmtHM(wbWait())+'.',wbReady=()=>wbOpen()&&prog.wbClaim!==wbId();
const wbHpNow=()=>prog.wbHpId===wbRunId?prog.wbHp:100;
function wbTick(){if(onlineServerOnly||!wbRun||mode!=='boss'||!boss||!player)return;const id=wbRunId,hp=Math.max(0,boss.hp);if(prog.wbHpId!==id){prog.wbHpId=id;prog.wbHp=100;prog.wbTier=0}
 if(hp<prog.wbHp){prog.wbHp=hp;const dmg=100-hp,att=Math.round(wbA0-hp);if(att>(prog.wbBestDmg||0))prog.wbBestDmg=att;for(let k=0;k<3;k++){const t=WB_TIERS[k];if(dmg>=t.p&&!(prog.wbTier>>k&1)){prog.wbTier|=1<<k;earn(t.c,'mundial');if(t.x)addXp(t.x);showToast('🎁 Boss Mundial: '+t.p+'% de dano! +'+t.c+' 🧀'+(t.x?' +'+t.x+' XP':''),3.5)}}saveProg()}}
function wbReward(notes){if(onlineServerOnly){notes.push('Recompensa do Boss Mundial aguardando validação segura do servidor.');return 0}const id=wbRunId;if(prog.wbClaim===id){return 0}prog.wbClaim=id;prog.wbHpId=id;prog.wbHp=0;prog.wbWins=(prog.wbWins||0)+1;const t=Math.round(gameTime);earn(800,'mundial');
 if(!(prog.ratU&128)){prog.ratU|=128;notes.push('🐀 Rato Campeão Mundial desbloqueado!')}else{earn(300,'mundial');notes.push('🧀 +300 de bônus pela vitória repetida')}
 if(t<60){earn(500,'mundial');notes.push('⚡ Vitória relâmpago (menos de 1 min): +500 🧀');if(!(prog.ratU&512)){prog.ratU|=512;notes.push('🐀 Rato Relâmpago desbloqueado!')}}else if(t<120){earn(250,'mundial');notes.push('⚡ Vitória rápida (menos de 2 min): +250 🧀')}
 const d=today();if(prog.wbDay===d)prog.wbDayN=(prog.wbDayN||0)+1;else{prog.wbDay=d;prog.wbDayN=1}if(prog.wbDayN===2){earn(400,'mundial');notes.push('🔥 Combo do dia (as duas janelas): +400 🧀')}
 prog.wbR.push({d,t:Math.max(1,t)});prog.wbR.sort((a,b)=>a.t-b.t);prog.wbR.length=Math.min(prog.wbR.length,10);
 notes.push('👑 Colosso Mundial derrotado em '+Math.floor(t/60)+':'+String(t%60).padStart(2,'0')+'! +800 🧀 +1000 XP');return 1000}
function wbHtmlOld(){const open=wbOpen(),endIn=open?(WB_START[wbSlot()]+WB_LEN-wbMin()):0;return `<div class="seas"><b>👑 Boss Mundial</b><span>${open?'ABERTO agora • fecha em '+fmtHM(endIn):'Fechado • abre em '+fmtHM(wbWait())}</span><small>Horários: 10:00 e 22:00 (1 hora). Escolha o modo 👑 Boss Mundial na lista de modos. Prêmio por janela: +500 🧀 +400 XP e o 🐀 Rato Campeão Mundial (1ª vez). ${open&&prog.wbClaim===wbId()?'✓ Já recompensado nesta janela.':''}</small></div>`}
function wbHtml(){const open=wbOpen(),endIn=open?(WB_START[wbSlot()]+WB_LEN-wbMin()):0,id=wbId(),hp=prog.wbHpId===id?Math.round(prog.wbHp):100,won=open&&prog.wbClaim===id,w=prog.wbWins||0,rank=w>=15?'Lenda do Colosso':w>=5?'Matador de Colosso':w>=1?'Caçador de Colosso':'Novato',fm=t=>Math.floor(t/60)+':'+String(t%60).padStart(2,'0'),dm=d=>{const x=new Date(d*864e5);return String(x.getUTCDate()).padStart(2,'0')+'/'+String(x.getUTCMonth()+1).padStart(2,'0')};
 return `<div class="seas"><b>👑 Boss Mundial</b><span>${open?'ABERTO agora • fecha em '+fmtHM(endIn):'Fechado • abre em '+fmtHM(wbWait())+' (10:00 e 22:00)'}</span>${open?`<div class="bar"><i style="width:${won?0:hp}%"></i></div><small>Vida do Colosso: ${won?'derrotado ✓':hp+'%'} • o dano acumula entre as tentativas da janela</small>`:''}<small>🎯 Objetivo: derrubar a barra de vida do Colosso em até 1 hora. Faça-o bater na parede para atordoá-lo e passe pela cabeça dele. Escolha o modo 👑 Boss Mundial.</small><small>🎁 Dano: 25% = 100 🧀 • 50% = 200 🧀 +100 XP • 75% = 300 🧀 +150 XP • Derrotar = 800 🧀 +1000 XP + 🐀 Rato Campeão Mundial (1ª vez; depois +300 🧀) • ⚡ Menos de 2 min = +250 🧀; menos de 1 min = +500 🧀 e o 🐀 Rato Relâmpago • 🔥 Vencer as 2 janelas do dia = +400 🧀 • Vitórias 1/5/15/30 = 800/1500/3000/4000 🧀 (15 libera o 🐀 Rato Colosso)</small><small>🏆 Ranking local — patente: ${rank} • vitórias: ${w} • melhor dano numa tentativa: ${prog.wbBestDmg||0}%</small><small>⏱️ Mais rápidos: ${prog.wbR.length?prog.wbR.slice(0,5).map((e,i)=>(i+1)+'º '+fm(e.t)+' ('+dm(e.d)+')').join(' • '):'ninguém ainda — seja o primeiro!'}</small></div>`}
let achCat=0;
Object.assign(RATS,{boss0:{n:'Rei Rato',hid:1,lv:1,r:3,c:'#8a4dff',ear:'#e0c4ff',nose:'#ff8fa3',eye:'#ffe477',sn:'#a77bff',crown:1,spiky:1},boss1:{n:'Titã de Ferro',hid:1,lv:1,r:3,c:'#8d99a8',ear:'#c9d3de',nose:'#ff8fa3',eye:'#ff5d73',sn:'#aab4c0',gog:1,spiky:1,hs:1.12},boss2:{n:'Rato Sombra',hid:1,lv:1,r:3,c:'#2b1f3d',ear:'#5b3f7a',nose:'#b48aff',eye:'#7dff8a',sn:'#40305a',wh:'#b48aff',ghost:1,spark:1},boss3:{n:'Colosso Mundial',hid:1,lv:1,r:3,c:'#d4a017',ear:'#fff1a8',nose:'#ff8fa3',eye:'#ff3b3b',sn:'#f0cf6a',crown:1,spiky:1,spark:1,hs:1.2},mundial:{n:'Rato Campeão Mundial',c:'#ffd23f',ear:'#fff1a8',nose:'#ff9fd0',eye:'#2a1a00',sn:'#ffe58a',crown:1,spark:1,hs:1.1,lv:99999,ex:128,r:3},relampago:{n:'Rato Relâmpago',c:'#7dd3ff',ear:'#dff4ff',nose:'#ff9fd0',eye:'#10204f',sn:'#b9e6ff',spark:1,spiky:1,lv:99999,ex:512,r:3},colosso:{n:'Rato Colosso',c:'#ff9f43',ear:'#ffe0a8',nose:'#ff8fa3',eye:'#ff3b3b',sn:'#ffc46b',crown:1,spiky:1,spark:1,gog:1,hs:1.2,lv:99999,ex:256,r:3}});
MARCOS[MARCOS.length-1].t=Object.keys(RATS).filter(k=>!RATS[k].hid).length;
const BOSSV=[{n:'Rei Rato',c:'#8a4dff',r:26,rat:'boss0',chase:1,dash:330,stun:6},{n:'Titã de Ferro',c:'#8d99a8',r:32,rat:'boss1',chase:.8,dash:280,stun:7},{n:'Rato Sombra',c:'#2b1f3d',r:22,rat:'boss2',chase:1.3,dash:400,stun:5},{n:'Colosso Mundial',c:'#d4a017',r:36,rat:'boss3',chase:1.15,dash:360,stun:5,dmg:12}];
function bossVariant(b){if(wbRun)b.hp=wbHpNow();const k=wbRun?3:(prog.bossWins||0)%3,v=BOSSV[k];b.bv=k;b.name=v.n;b.color=v.c;b.radius=v.r;b.rat=v.rat;b.chaseMul=v.chase;b.dashSpd=v.dash;b.stunT=v.stun;b.dmg=v.dmg}
function missionClaim(i){const m=prog.missions[i];if(!m||!m.d||m.c)return;m.c=1;addXp(m.xp);earn(Math.round(m.xp/2),'missão');prog.mDone=(prog.mDone||0)+1;if(!prog.mAll&&prog.mDone>=3){prog.mAll=1;addXp(MALL_XP);earn(30,'missão');showToast('🏆 3 missões do dia! +'+MALL_XP+' XP',3)}
 if((prog.mRef||0)<6){prog.mRef=(prog.mRef||0)+1;const used=new Set(prog.missions.map(x=>x.id)),g=genMissions(today()+prog.mRef*31+7).find(x=>!used.has(x.id))||genMissions(today()+prog.mRef*53+11)[0];prog.missions[i]={id:g.id,v:g.v,xp:g.xp,p:0,d:0,c:0}}
 checkAch();saveProg();sfx('bonus')}
function achCollect(id){const a=ACH.find(x=>x.id===id);if(!a||!prog.achR[id]||prog.ach[id])return;delete prog.achR[id];prog.ach[id]=1;addXp(a.xp);earn(Math.round(a.xp/2),'conquista');checkAch();saveProg();sfx('bonus')}
const achReady=()=>ACH.some(a=>prog.achR[a.id]),ladReady=()=>ladHeads().some(h=>LT[h.k].v()>=h.T)||prog.missions.some(m=>m.d&&!m.c)||rwReady()||seasReady()||wbReady();
function dotsUpdate(){const a=$('dotA'),m=$('dotM');if(a)a.classList.toggle('hidden',!achReady());if(m)m.classList.toggle('hidden',!ladReady())}
function drawChip(pc,ov,z){const c2=pc.getContext('2d'),main=ctx,sw=W,sh=H,cx=cam.x,cy=cam.y,gt=gameTime;try{ctx=c2;W=pc.width;H=pc.height;cam.x=0;cam.y=0;gameTime=0;c2.clearRect(0,0,W,H);const n=Math.max(5,Math.floor((W-60)/12)),hx=W-34,hy=H/2+6,ps=mkSnake(hx,hy,0,prefs.color,'',false,n,null);applyCosmetics(ps);Object.assign(ps,ov);if(RATS[ps.rat])ps.color=RATS[ps.rat].c;ps.shield=0;c2.save();if(z>1){c2.translate(W/2-hx*z,H/2-hy*z);c2.scale(z,z)}drawSnake(ps);c2.restore()}catch(e){}finally{ctx=main;W=sw;H=sh;cam.x=cx;cam.y=cy;gameTime=gt}}
function gDlg(msg,yes,no){window.__lastDlg=String(msg);let o=document.getElementById('gdlg');if(!o){o=document.createElement('div');o.id='gdlg';o.style.cssText='position:fixed;inset:0;z-index:100000;background:#0a0620d9;display:flex;align-items:center;justify-content:center;padding:2vh 4vw';o.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-g]');if(!b)return;const f=o._cb;o.style.display='none';if(b.dataset.g==='y'&&f)f()});document.body.appendChild(o)}
 o._cb=yes||null;o.style.display='flex';const bt='padding:1.4vh 5vw;border:0;border-radius:14px;font-weight:900;font-size:inherit;';
 o.innerHTML='<div style="max-width:min(680px,88vw);max-height:84vh;overflow:auto;background:linear-gradient(#3b2490,#2a1773);border:3px solid #ffd84a;border-radius:18px;padding:3vh 3vw;color:#fff;text-align:center;font-weight:700;font-size:clamp(14px,3.8vh,22px);line-height:1.35;box-shadow:0 10px 40px #000a"><div class="gm" style="white-space:pre-line"></div><div style="margin-top:2.4vh;display:flex;gap:2vw;justify-content:center">'+(no?'<button data-g="n" style="'+bt+'background:#5b2f48;color:#fff">Cancelar</button>':'')+'<button data-g="y" style="'+bt+'background:linear-gradient(#ffd84a,#f5a815);color:#3a2100;box-shadow:0 4px 0 #b0670a">OK</button></div></div>';
 o.querySelector('.gm').textContent=String(msg)}
const gAlert=m=>gDlg(m),gConfirm=(m,cb)=>gDlg(m,cb,true);
const mulb=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
function teamTxt(kind){const a=teamScore[0],b=teamScore[1],g=MODES.team.tgoal,pl=`🔵 ${a} × ${b} 🔴`;
 if(kind==='win')return a>=g?`A equipe azul (a sua) venceu ao chegar a ${g} eliminações! Placar de eliminações: ${pl}.`:`Tempo esgotado: a equipe azul (a sua) venceu por ${a} × ${b} em eliminações. Nenhuma equipe chegou à meta de ${g}. ${pl}`;
 if(kind==='time')return b>=g?`A equipe vermelha chegou a ${g} eliminações primeiro. Placar de eliminações: ${pl}.`:a===b?`Tempo esgotado: empate em ${a} × ${b} eliminações (meta de ${g}). ${pl}`:`Tempo esgotado: a equipe vermelha venceu por ${b} × ${a} em eliminações. Nenhuma equipe chegou à meta de ${g}. ${pl}`;
 return `${causeText} Placar parcial de eliminações: ${pl} — ${a>b?'a sua equipe estava na frente':a<b?'a equipe vermelha estava na frente':'empatado'} (meta de ${g}).`}
let dcRound=0;
function dcStart(){const t=today();if(prog.dcDay===t){gAlert('Você já fez o Desafio diário de hoje ('+prog.dcBest+' pts). Volte amanhã para um novo desafio!');return false}prog.dcDay=t;prog.dcBest=0;saveProg();dcRound=0;return true}
function dcEnd(){if(mode!=='daily'||!player||dcRound)return;dcRound=1;const t=today();if(score>prog.dcBest)prog.dcBest=score;if(prog.dcPaid!==t){prog.dcPaid=t;prog.dcPlays++;earn(50,'desafio diário')}saveProg()}
const SEASON=[{n:'Jogue 30 partidas',t:30,v:()=>stats.games-prog.ssG,r:150},{n:'Coma 3000 queijos',t:3000,v:()=>stats.food-prog.ssF,r:200},{n:'Elimine 150 ratos',t:150,v:()=>stats.kills-prog.ssK,r:250},{n:'Jogue 1 hora',t:3600,v:()=>Math.floor(stats.time-prog.ssT),r:200},{n:'Faça 10 desafios diários',t:10,v:()=>prog.dcPlays-prog.ssD,r:250},{n:'Suba 10 níveis',t:10,v:()=>lvlInfo(prog.xp).l-prog.ssL,r:300}];
function ssEnsure(){const t=today();if(!prog.ssStart||t-prog.ssStart>=30){prog.ssStart=t;prog.ssG=stats.games;prog.ssF=stats.food;prog.ssK=stats.kills;prog.ssT=Math.floor(stats.time);prog.ssD=prog.dcPlays;prog.ssL=lvlInfo(prog.xp).l;prog.ssClaim=0;saveProg()}}
function ssClaim(i){ssEnsure();const g=SEASON[i];if(!g||(prog.ssClaim>>i&1)||g.v()<g.t)return false;prog.ssClaim|=1<<i;earn(g.r,'temporada');addXp(Math.round(g.r/2));if(prog.ssClaim===63)earn(500,'temporada');saveProg();return true}
function ssHtml(){ssEnsure();const left=Math.max(0,30-(today()-prog.ssStart));return `<div class="fit"><p class="note">📅 Temporada de 30 dias • ${left} dia(s) restante(s) • complete tudo e ganhe +500 🧀</p>${SEASON.map((g,i)=>{const v=Math.min(g.t,Math.max(0,g.v())),done=prog.ssClaim>>i&1;return `<div class="srow"><span>${g.n} (${v}/${g.t})</span>${done?'✓ resgatado':v>=g.t?`<button class="tgs on" data-act="ssc:${i}">Resgatar 🧀 ${g.r}</button>`:'🧀 '+g.r}</div>`}).join('')}</div>`}
const GC=96,grid=new Map(),gpool=[],elig=[],hitB=[];
function gridBuild(){for(const a of grid.values()){a.length=0;gpool.push(a)}grid.clear();for(let b=0;b<snakes.length;b++){const o=snakes[b];if(!o.alive)continue;const sg=o.segments;for(let i=2;i<sg.length;i++){const k=(Math.floor(sg[i].x/GC)+2)*4096+Math.floor(sg[i].y/GC)+2;let c=grid.get(k);if(!c){c=gpool.pop()||[];grid.set(k,c)}c.push(b,i)}}}
function collisions(){vics.length=0;byk.length=0;const n=snakes.length;gridBuild();let gm=0;for(let b=0;b<n;b++)if(snakes[b].radius>gm)gm=snakes[b].radius;
 for(let a=0;a<n;a++){const s=snakes[a];if(!s.alive||s.localPaused)continue;let any=false;
  for(let b=0;b<n;b++){elig[b]=0;hitB[b]=0;const o=snakes[b];if(a===b||!o.alive||o.localPaused||s.shield>0||o.shield>0||s.stun>0||o.stun>0||(mode==='team'&&tm(s)===tm(o)))continue;
   const hx=s.x-o.x,hy=s.y-o.y,lim=(s.radius+o.radius)*.8,hd2=hx*hx+hy*hy;
   if(hd2<lim*lim*2.56){ // cabeças muito próximas: só vale a regra de choque frontal (o maior vence; empate elimina ambos)
    if(a<b&&hd2<lim*lim){if(Math.abs(s.length-o.length)<=1){vics.push(s,o);byk.push(o,s)}else if(s.length<o.length){vics.push(s);byk.push(o)}else{vics.push(o);byk.push(s)}}if(hd2<lim*lim)continue}
   elig[b]=1;any=true}
  if(!any)continue;
  const x0=s.px===undefined?s.x:s.px,y0=s.py===undefined?s.y:s.py,mx=(x0+s.x)/2,my=(y0+s.y)/2,mv=Math.hypot(s.x-x0,s.y-y0),RR=s.radius+gm*.72+CFG.seg+mv;
  const c0=Math.floor((s.x-RR)/GC),c1=Math.floor((s.x+RR)/GC),r0=Math.floor((s.y-RR)/GC),r1=Math.floor((s.y+RR)/GC);
  for(let cx=c0;cx<=c1;cx++)for(let cy=r0;cy<=r1;cy++){const c=grid.get((cx+2)*4096+cy+2);if(!c)continue;
   for(let j=0;j<c.length;j+=2){const b=c[j];if(!elig[b]||hitB[b])continue;const o=snakes[b],i=c[j+1],sg=o.segments,q=sg[i],l=s.radius+o.radius*.72,l2=l*l,rr=l+CFG.seg+mv;if(Math.abs(s.x-q.x)>rr||Math.abs(s.y-q.y)>rr)continue;
    let hit;if(i===2)hit=dd(s.x,s.y,q.x,q.y)<l2||dd(x0,y0,q.x,q.y)<l2||dd(mx,my,q.x,q.y)<l2;
    else{const p=sg[i-1];hit=sd(s.x,s.y,p.x,p.y,q.x,q.y)<l2||sd(x0,y0,p.x,p.y,q.x,q.y)<l2||sd(mx,my,p.x,p.y,q.x,q.y)<l2}
    if(hit)hitB[b]=1}}
  for(let b=0;b<n;b++)if(hitB[b]){vics.push(s);byk.push(snakes[b])}}
 for(let k=0;k<vics.length;k++){const v=vics[k];if(!v.alive||v.boss)continue;const by=byk[k],head=Math.hypot(v.x-by.x,v.y-by.y)<(v.radius+by.radius)*.8;die(v,head?'head':'body',by)}}

