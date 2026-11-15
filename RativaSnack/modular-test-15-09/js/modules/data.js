/* Fragmento preservado do JavaScript original. Não carregar isoladamente; usar build.mjs. */
/* ===== CONFIGURAÇÃO ÚNICA de habilidades (11 níveis), loja e opções ===== */
const SKILL_CFG={max:11,cost:{base:30,growth:1.35},list:{
 boost:{n:'Velocidade',i:'⚡',dur:[7,.9],mul:[1.3,.012]},
 magnet:{n:'Ímã de comida',i:'🧲',dur:[8,1],rad:[170,8]},
 shield:{n:'Escudo',i:'🛡️',dur:[5,.5]},
 mult:{n:'Pontos ×2',i:'✖️',dur:[10,1.2]},
 grow:{n:'Crescimento dobrado',i:'🌱',dur:[10,1.2]},
 dash:{n:'Impulso manual',i:'🚀',dur:[1.6,.14],rech:[5,-.25]}}};
const SKILL_LIST=SKILL_CFG.list,STOCK_MAX=3;
const START_ITEMS={shield:{n:'Escudo inicial',i:'🛡️',price:60,d:'Começa a partida com escudo',fn:s=>{const d=skillVal(s,'shield','dur');s.shieldP=d;s.shield=Math.max(s.shield,d)}},
 magnet:{n:'Ímã inicial',i:'🧲',price:50,d:'Começa com ímã de comida',fn:s=>{s.magnetT=skillVal(s,'magnet','dur')}},
 boost:{n:'Velocidade inicial',i:'⚡',price:50,d:'Começa com velocidade extra',fn:s=>{s.boostT=skillVal(s,'boost','dur')}},
 mult:{n:'Pontos ×2 inicial',i:'✖️',price:70,d:'Começa com pontos em dobro',fn:s=>{s.multT=skillVal(s,'mult','dur')}}};
const MICON={quick:'⚡',survival:'⏳',challenge:'🎯',team:'🔵',boss:'👹',infinite:'🌊',daily:'📅',treino:'🧪',mundial:'👑'};
/* ===== Economia de queijos (moeda) ===== */
const ECO_MAX=1e9;let roundEarn={},ecoDirty=false,foodAcc=0;
function loadEco(){const o=readObj('ratoSnackEco')||{},e={cheese:numOk(o.cheese,0,ECO_MAX)?Math.floor(+o.cheese):0,earned:numOk(o.earned,0,1e12)?Math.floor(+o.earned):0,spent:numOk(o.spent,0,1e12)?Math.floor(+o.spent):0,hist:[]};
 if(Array.isArray(o.hist))for(const h of o.hist.slice(-60))if(h&&numOk(h.d,-ECO_MAX,ECO_MAX)&&typeof h.s==='string')e.hist.push({t:numOk(h.t,0,1e15)?+h.t:0,d:Math.trunc(+h.d),s:h.s.slice(0,24),b:numOk(h.b,0,ECO_MAX)?+h.b:0});e.lv={};for(const k in SKILL_LIST)e.lv[k]=numOk(o.lv&&o.lv[k],1,SKILL_CFG.max)?Math.floor(+o.lv[k]):1;e.inv={};for(const k in START_ITEMS)e.inv[k]=numOk(o.inv&&o.inv[k],0,STOCK_MAX)?Math.floor(+o.inv[k]):0;
 e.own={skin:{},acc:{},tail:{}};const DF={skin:'liso',acc:'nenhum',tail:'normal'};
 for(const c in e.own){const src=o.own&&o.own[c];if(src&&typeof src==='object')for(const id in CAT[c])if(src[id]===1)e.own[c][id]=1;e.own[c][DF[c]]=1}
 if(!o.own){const eq={skin:prefs.skin,acc:prefs.acc,tail:prefs.tail};for(const c in eq)if(CAT[c][eq[c]])e.own[c][eq[c]]=1} // quem já usava um item mantém esse item
 return e}
const eco=loadEco();
const saveEco=()=>{ecoDirty=!writeKey('ratoSnackEco',JSON.stringify(eco),validObj)};
function pushHist(d,src){eco.hist.push({t:Date.now(),d,s:src,b:eco.cheese});if(eco.hist.length>60)eco.hist.shift()}
const GS={comida:1,poder:1,'eliminação':1,'rei da arena':1,'Rei Queijo':1,Tanque:1};let gRem=0;
function earn(n,src){if(onlineServerOnly||(mode==='treino'||mpOnline||mpRole==='client')&&running&&!ended)return 0;const E=evtOf();if(src==='comida'&&E.id==='queijo')n*=2;if(src==='eliminação'&&E.id==='cacada')n*=2;if(src==='poder'&&E.id==='tesouro')n*=3;if(E.id==='cacadaouro'&&(src==='Rei Queijo'||src==='rei da arena'))n*=3;if(GS[src]&&running&&!ended){const v=n*DIFFS[prefs.diff].gain+gRem;n=Math.floor(v);gRem=v-n}else n=Math.floor(n);if(!(n>0))return 0;eco.cheese=Math.min(ECO_MAX,eco.cheese+n);eco.earned+=n;roundEarn[src]=(roundEarn[src]||0)+n;ecoDirty=true;return n}
function spend(n,src,fn){if(onlineServerOnly){showToast('Compras Online aguardam a validação segura do servidor.',4);return false;}n=Math.floor(n);if(!(n>0)||eco.cheese<n)return false;eco.cheese-=n;eco.spent+=n;if(fn)fn();pushHist(-n,src||'compra');saveEco();return true} // compra + efeito gravados juntos (uma só escrita)
function settleEarn(){let t=0;for(const k in roundEarn){pushHist(roundEarn[k],k);t+=roundEarn[k]}roundEarn={};if(t)saveEco();return t}
function cheeseFood(f){if(f.type===0){if(++foodAcc>=5){foodAcc=0;earn(1,'comida')}}else if(f.type===1)earn(5,'comida');else if(f.type<7)earn(3,'poder')}
/* ===== Versão do formato salvo + migração + espelho IndexedDB (somente local) ===== */
const HAD_SAVE=['ratoSnackPrefs','ratoSnackStats','ratoSnackProg','ratoSnackEco','ratoSnackBest'].some(k=>{try{return localStorage.getItem(k)!==null}catch(e){return true}});
const SAVE_V=2,SAVE_BASE=['ratoSnackPrefs','ratoSnackStats','ratoSnackProg','ratoSnackEco','ratoSnackBest','ratoSnackMeta'],SAVE_KEYS=SAVE_BASE.concat(SAVE_BASE.map(k=>k+'.bak'));
(function migrate(){const m=readObj('ratoSnackMeta');if(m&&numOk(m.v,3,1e6))return; // formato mais novo: não mexe
 if(!m||!(m.v>=SAVE_V))writeKey('ratoSnackMeta',JSON.stringify({v:SAVE_V,from:m&&m.v?m.v:1,t:Date.now()}),validObj)})();
const snapshot=()=>{const o={};for(const k of SAVE_KEYS){const v=store.get(k,null);if(v!==null&&(parseObj(v)||numOk(v,0,1e9)))o[k]=v}return o};
let idbT=0;
function idbOpen(){return new Promise(res=>{try{const r=indexedDB.open('ratoSnack',1);r.onupgradeneeded=()=>r.result.createObjectStore('s');r.onsuccess=()=>res(r.result);r.onerror=()=>res(null);r.onblocked=()=>res(null)}catch(e){res(null)}})}
async function mirrorIDB(force){const now=Date.now();if(!force&&now-idbT<3000)return;idbT=now;const snap=snapshot();if(!snap.ratoSnackStats||!snap.ratoSnackProg)return; // nunca espelha dados vazios/incompletos
 try{const d=await idbOpen();if(!d)return;const tx=d.transaction('s','readwrite');tx.objectStore('s').put(snap,'snap');tx.oncomplete=()=>d.close();tx.onerror=()=>d.close()}catch(e){}}
async function restoreIDB(){try{if(HAD_SAVE)return;if(sessionStorage.getItem('ratoRestored'))return;
 const d=await idbOpen();if(!d)return;const rq=d.transaction('s').objectStore('s').get('snap');rq.onsuccess=()=>{d.close();const sn=rq.result;if(!sn||typeof sn!=='object'||!sn.ratoSnackStats)return;for(const k of SAVE_KEYS)if(typeof sn[k]==='string')try{localStorage.setItem(k,sn[k])}catch(e){}try{sessionStorage.setItem('ratoRestored','1')}catch(e){}location.reload()};rq.onerror=()=>d.close()}catch(e){}}
restoreIDB();
/* Sincronização futura com o Ratópolis: DESATIVADA. Sem rede, sem login. Ao ativar no futuro: enviar só eventos {id único, tipo, valor},
   o servidor ignora ids repetidos (idempotente) e mantém o progresso mais recente. */
const SYNC={enabled:false,endpoint:null,queue:[],push(){return false},flush(){return false}};

function skillVal(s,k,f){const L=(!s||!s.isBot)?eco.lv[k]:1,a=SKILL_LIST[k][f];return a[0]+a[1]*(L-1)}
const skillCost=L=>Math.round(SKILL_CFG.cost.base*Math.pow(SKILL_CFG.cost.growth,L-1));
function applySkillsToCfg(){CFG.boostMax=skillVal(null,'dash','dur');CFG.boostRecharge=skillVal(null,'dash','rech')/(evtOf().id==='veloz'?2:1)}
function buzz(ms){if(prefs.vib&&navigator.vibrate)try{navigator.vibrate(ms)}catch(e){}}
function applyStartItems(){const used=[];for(const k in START_ITEMS)if(eco.inv[k]>0){eco.inv[k]--;START_ITEMS[k].fn(player);used.push(START_ITEMS[k].i)}if(used.length){saveEco();showToast('Itens usados: '+used.join(' '),3)}}
function toastFor(t,s){if(t===7)return '👑 Rei Queijo: +100 🧀 e crescimento ×2!';if(t===8)return '🦏 Tanque: +75 🧀 e ímã 4× mais forte!';const m={2:['⚡ Velocidade','boost'],3:['🌱 Crescimento dobrado','grow'],4:['🧲 Ímã de comida','magnet'],5:['🛡️ Escudo','shield'],6:['×2 Pontos em dobro','mult']}[t];return m[0]+' por '+(+skillVal(s,m[1],'dur').toFixed(1))+' s!'}
function skTxt(k,L){const c=SKILL_LIST[k],v=f=>c[f][0]+c[f][1]*(L-1);let t=v('dur').toFixed(1)+' s';if(c.mul)t+=' • +'+Math.round((v('mul')-1)*100)+'% vel.';if(c.rad)t+=' • raio '+Math.round(v('rad'));if(c.rech)t+=' • recarga '+v('rech').toFixed(1)+' s';return t}
let pendingBuy='',shopMsg='',buyLock=0,leader=null,goalIdx=0,revived=0,reviveTimer=null,shopCat='skin',shopSel=null;
function doUpgrade(k){const c=SKILL_LIST[k],L=eco.lv[k];if(L>=SKILL_CFG.max)return '🏆 '+c.n+' já está no nível máximo!';if(Date.now()<buyLock)return '⏳ Aguarde...';const cost=skillCost(L);if(eco.cheese<cost)return '🧀 Saldo insuficiente (faltam '+(cost-eco.cheese)+').';buyLock=Date.now()+600;if(!spend(cost,'Habilidade: '+c.n,()=>{eco.lv[k]=L+1}))return '🧀 Saldo insuficiente.';applySkillsToCfg();return L+1>=SKILL_CFG.max?'🏆 '+c.n+' chegou ao nível máximo ('+SKILL_CFG.max+')!':'✅ '+c.n+' evoluiu para o nível '+(L+1)+'!'}
function doBuy(id){const it=START_ITEMS[id];if(Date.now()<buyLock)return '⏳ Aguarde...';if(eco.inv[id]>=STOCK_MAX)return '📦 Estoque cheio.';if(eco.cheese<it.price)return '🧀 Saldo insuficiente (faltam '+(it.price-eco.cheese)+').';buyLock=Date.now()+600;if(!spend(it.price,'Loja: '+it.n,()=>{eco.inv[id]++}))return '🧀 Saldo insuficiente.';return '✅ Comprou '+it.n+'!'}
/* ===== Controles e opções (aplicados de verdade) ===== */
const COL_NORM=COLORS.slice(),COL_CB=['#e69f00','#56b4e9','#009e73','#f0e442','#0072b2','#d55e00','#cc79a7','#ffffff'];
function applyA11y(){document.body.classList.toggle('bigtxt',!!prefs.bigtxt);document.body.classList.toggle('cblind',!!prefs.cblind);COLORS.length=0;COLORS.push(...(prefs.cblind?COL_CB:COL_NORM))}
function applyControlPrefs(){CFG.stickDead=[4,8,14][prefs.dead];CFG.stickMax=54*SENSM[prefs.sens]*CSZ[prefs.csz];const z=Math.round(64*CSZ[prefs.csz]);bb.style.width=bb.style.height=z+'px';bb.classList.toggle('left',prefs.boostLeft)}
function stickCenter(){const r=CFG.stickMax,m=18;return{x:prefs.stickLeft?r+m+50:W-r-m-50,y:H-r-m-14}}
function ctlDown(){if(prefs.ctl==='joystick'){if(prefs.stickLeft?pointer.x>W*.58:pointer.x<W*.42)return false;const c=stickCenter();pointer.ax=c.x;pointer.ay=c.y}else{pointer.ax=pointer.x;pointer.ay=pointer.y}ctlUpdate();return true}
function ctlUpdate(){if(prefs.ctl==='toque'){const dx=pointer.x-(player.x-cam.x),dy=pointer.y-(player.y-cam.y);if(Math.hypot(dx,dy)>26){pointer.dirX=dx;pointer.dirY=dy;pointer.hasDirection=true}}
 else if(prefs.ctl==='joystick'){const dx=pointer.x-pointer.ax,dy=pointer.y-pointer.ay;if(Math.hypot(dx,dy)>=CFG.stickDead){pointer.dirX=dx;pointer.dirY=dy;pointer.hasDirection=true}}
 else stickUpdate(pointer,pointer.x,pointer.y,CFG.stickMax,CFG.stickDead)}
/* ===== Progressão: XP/nível, missões diárias, recompensa diária, conquistas =====
   Recompensas são idempotentes: missão (flag d), conquista (prog.ach[id]), diária (dailyDay) e rodada (roundCounted). */
const MPOOL=[{id:'food',m:'sum',vals:[30,60,100],xp:30,t:n=>`Coma ${n} queijos`},{id:'kills',m:'sum',vals:[2,4,6],xp:40,t:n=>`Elimine ${n} ratos`},{id:'size',m:'max',vals:[20,30,45],xp:40,t:n=>`Chegue ao tamanho ${n} numa partida`},{id:'time',m:'max',vals:[90,150,240],xp:40,t:n=>`Sobreviva ${n} s numa partida`},{id:'score',m:'max',vals:[300,600,1000],xp:40,t:n=>`Faça ${n} pontos numa partida`},{id:'special',m:'sum',vals:[1],xp:60,t:n=>'Elimine 1 rival especial'},{id:'powers',m:'sum',vals:[3,5],xp:30,t:n=>`Pegue ${n} poderes`},{id:'streak',m:'max',vals:[2,3],xp:50,t:n=>`Faça ${n} eliminações seguidas`}];
const DAILY_XP=[60,80,100,130,160,200,400],DAILY_CH=[40,50,60,80,100,130,300],MALL_XP=60;
const ACH=[
 {id:'first',i:'🧀',n:'Primeira mordida',d:'Jogue 1 partida',xp:20,c:()=>stats.games>=1},{id:'g10',i:'🎮',n:'Veterano',d:'Jogue 10 partidas',xp:40,c:()=>stats.games>=10},{id:'g50',i:'🏟️',n:'Lenda da arena',d:'Jogue 50 partidas',xp:100,c:()=>stats.games>=50},
 {id:'k10',i:'⚔️',n:'Caçador iniciante',d:'10 eliminações no total',xp:40,c:()=>stats.kills>=10},{id:'k100',i:'💀',n:'Terror da arena',d:'100 eliminações no total',xp:100,c:()=>stats.kills>=100},{id:'k500',i:'👹',n:'Pesadelo dos ratos',d:'500 eliminações no total',xp:250,c:()=>stats.kills>=500},
 {id:'f500',i:'🍽️',n:'Banquete',d:'Coma 500 queijos',xp:40,c:()=>stats.food>=500},{id:'f5000',i:'🧀',n:'Rei do queijo',d:'Coma 5000 queijos',xp:200,c:()=>stats.food>=5000},
 {id:'s30',i:'📏',n:'Crescendo',d:'Chegue ao tamanho 30',xp:40,c:()=>stats.bestSize>=30},{id:'s60',i:'🐍',n:'Rato comprido',d:'Chegue ao tamanho 60',xp:100,c:()=>stats.bestSize>=60},{id:'s100',i:'🐉',n:'Rato gigante',d:'Chegue ao tamanho 100',xp:200,c:()=>stats.bestSize>=100},
 {id:'t180',i:'⏱️',n:'Resistente',d:'Sobreviva 3 min',xp:50,c:()=>stats.bestTime>=180},{id:'t300',i:'🛡️',n:'Imortal',d:'Sobreviva 5 min',xp:120,c:()=>stats.bestTime>=300},
 {id:'st3',i:'🔥',n:'Sequência tripla',d:'3 eliminações seguidas',xp:60,c:()=>prog.bestStreak>=3},{id:'st5',i:'☄️',n:'Imparável',d:'5 eliminações seguidas',xp:150,c:()=>prog.bestStreak>=5},
 {id:'sp1',i:'👑',n:'Caça-rei',d:'Elimine 1 rival especial',xp:80,c:()=>prog.specials>=1},{id:'sp10',i:'🏹',n:'Caçador de elite',d:'Elimine 10 rivais especiais',xp:250,c:()=>prog.specials>=10},
 {id:'w1',i:'🏆',n:'Vitória no desafio',d:'Vença o desafio de eliminações',xp:80,c:()=>prog.wins>=1},{id:'d7',i:'🎁',n:'Semana completa',d:'7 dias seguidos de recompensa diária',xp:100,c:()=>prog.dailyStreak>=7},{id:'lv10',i:'⭐',n:'Nível 10',d:'Chegue ao nível 10',xp:100,c:()=>lvlInfo(prog.xp).l>=10},{id:'lv50',i:'🌟',n:'Veterano 50',d:'Chegue ao nível 50',xp:300,c:()=>lvlInfo(prog.xp).l>=50},{id:'lv100',i:'💫',n:'Centenário',d:'Chegue ao nível 100',xp:600,c:()=>lvlInfo(prog.xp).l>=100},{id:'lv250',i:'🔥',n:'Lenda viva',d:'Chegue ao nível 250',xp:1500,c:()=>lvlInfo(prog.xp).l>=250},{id:'lv500',i:'👑',n:'Mestre Rato',d:'Chegue ao nível 500',xp:5000,c:()=>lvlInfo(prog.xp).l>=500}];
(function(){const R=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI'],tr=[['Caçador','⚔️','Elimine {n} ratos',[10,25,50,100,200,400,800,1500,3000,6000,12000],()=>stats.kills],['Comilão','🧀','Coma {n} queijos',[100,300,800,2000,5000,12000,30000,70000,150000],()=>stats.food],['Veterano','🎮','Jogue {n} partidas',[5,15,30,60,120,250,500,1000],()=>stats.games],['Fôlego','⏱️','Jogue {n} minutos',[10,30,60,120,300,600,1200,3000],()=>Math.floor(stats.time/60)],['Sobrevivente','🛡️','Sobreviva {n} segundos',[60,120,180,300,480,600,900,1200,1800],()=>stats.bestTime],['Pontuador','🏆','Faça {n} pontos na partida rápida',[1000,3000,6000,10000,20000,35000,50000,80000,120000],()=>bestQuick],['Gigante','🐍','Chegue ao tamanho {n}',[20,35,50,75,100,150,200,300],()=>stats.bestSize],['Rotina','📅','Faça {n} desafios diários',[1,3,7,14,30,60,100],()=>prog.dcPlays],['Sequência','🔥','Receba {n} dias de recompensa seguidos',[3,7,14,30,60],()=>prog.bestStreak],['Rodada de fogo','💥','Elimine {n} ratos numa partida',[3,5,8,12,16,20,30],()=>stats.bestKills]];
 for(const a of ACH)a.cat='Geral';
 for(let t=0;t<11&&ACH.length<100;t++)for(let k=0;k<tr.length&&ACH.length<100;k++){const x=tr[k],v=x[3][t];if(v===undefined)continue;ACH.push({id:'x'+k+'_'+t,i:x[1],n:x[0]+' '+R[t],d:x[2].replace('{n}',v),xp:30+t*25+k*2,cat:x[0],p:x[4],t:v,c:()=>x[4]()>=v})}})();
const dayNum=()=>{const d=new Date();return Math.floor((d.getTime()-d.getTimezoneOffset()*6e4)/864e5)};
function loadProg(){const o=readObj('ratoSnackProg')||{},p={ach:{},achR:{},missions:[],mAll:o.mAll===1?1:0};
 for(const k of ['xp','dailyDay','dailyStreak','lastDay','mDay','bestStreak','specials','wins','dcDay','dcBest','dcPaid','dcPlays','ssStart','ssG','ssF','ssK','ssT','ssD','ssL','ssClaim','dFace','evDone','bossWins','wkW','wkG','wkF','wkK','wkT','wkB','wkE','wkClaim','mkClaim','ratU','svKey','svF','svK','svClaim','secrets','mRef','mDone','wbClaim','wbWins','wbHp','wbHpId','wbTier','wbDay','wbDayN','wbBestDmg'])p[k]=numOk(o[k],0,1e8)?Math.floor(+o[k]):0;
 p.xp=Math.min(p.xp,XP_TAB[LV_MAX]);p.xpSeq=numOk(o.xpSeq,0,1e9)?Math.floor(+o.xpSeq):0;p.xpAck=numOk(o.xpAck,0,1e9)?Math.floor(+o.xpAck):0;p.lvlRw=numOk(o.lvlRw,1,LV_MAX)?Math.floor(+o.lvlRw):undefined;p.evHist=[];if(Array.isArray(o.evHist))for(const e of o.evHist.slice(-30))if(e&&numOk(e.d,0,1e7)&&typeof e.id==='string')p.evHist.push({d:+e.d,id:e.id.slice(0,12)});p.wbR=[];if(Array.isArray(o.wbR))for(const e of o.wbR.slice(0,10))if(e&&numOk(e.d,0,1e7)&&numOk(e.t,1,1e5))p.wbR.push({d:+e.d,t:Math.round(+e.t)});p.mTier=Array.from({length:10},(_,i)=>numOk(o.mTier&&o.mTier[i],0,50)?Math.floor(+o.mTier[i]):0);p.xpLog=[];if(Array.isArray(o.xpLog))for(const e of o.xpLog.slice(-200))if(e&&numOk(e.q,1,1e9)&&numOk(e.a,1,1e8)&&numOk(e.t,0,1e14))p.xpLog.push({q:+e.q,t:+e.t,a:+e.a,s:String(e.s||'jogo').slice(0,16)});
 p.mrec={};for(const k of ['team','boss','infinite','daily','treino','mundial'])p.mrec[k]=numOk(o.mrec&&o.mrec[k],0,1e8)?Math.floor(+o.mrec[k]):0;
 if(o.ach&&typeof o.ach==='object')for(const a of ACH)if(o.ach[a.id]===1)p.ach[a.id]=1;if(o.achR&&typeof o.achR==='object')for(const a of ACH)if(o.achR[a.id]===1&&!p.ach[a.id])p.achR[a.id]=1;
 if(Array.isArray(o.missions))for(const m of o.missions.slice(0,3)){const d=m&&MPOOL.find(x=>x.id===m.id);if(d&&numOk(m.v,1,1e6)&&numOk(m.p,0,1e9)&&numOk(m.xp,0,1e4))p.missions.push({id:d.id,v:+m.v,xp:+m.xp,p:Math.min(+m.p,+m.v),d:m.d===1?1:0,c:m.c===1||(m.d===1&&m.c===undefined)?1:0})}
 p.top=[];if(Array.isArray(o.top))for(const t of o.top.slice(0,5))if(t&&numOk(t.s,0,1e9)&&MODES[t.m])p.top.push({s:Math.floor(+t.s),m:t.m,d:numOk(t.d,0,1e7)?+t.d:0});p.bestFood=numOk(o.bestFood,0,1e7)?+o.bestFood:0;p.bestCheese=numOk(o.bestCheese,0,1e8)?+o.bestCheese:0;p.dev={day:numOk(o.dev&&o.dev.day,0,1e7)?+o.dev.day:0,p:numOk(o.dev&&o.dev.p,0,1e9)?+o.dev.p:0,d:o.dev&&o.dev.d===1?1:0};
 return p}
// ===== Níveis 1..500 (curva pura e determinística: um servidor futuro pode recalcular o nível só pelo XP total) =====
const LV_MAX=500,xpNeed=l=>l<=50?100+20*(l-1):1100+4*(l-50),XP_TAB=(()=>{const t=[0,0];for(let l=1;l<LV_MAX;l++)t.push(t[l]+xpNeed(l));return t})(); // XP_TAB[l] = XP total para chegar ao nível l
const prog=loadProg();if(prog.dFace)FACES.real='Real 👑';
// XP: toda mudança passa por aqui. Cada ganho vira um evento numerado (xpLog) que um servidor poderá validar/confirmar (xpAck). Offline, só o nível é usado.
const XP={max:XP_TAB[LV_MAX],
 grant(n,src){n=Math.floor(n);if(!(n>0)||prog.xp>=XP.max)return 0;const a=Math.min(n,XP.max-prog.xp);prog.xp+=a;const e={q:++prog.xpSeq,t:Date.now(),a,s:src||'jogo'};prog.xpLog.push(e);if(prog.xpLog.length>200)prog.xpLog.splice(0,prog.xpLog.length-200);SYNC.push({type:'xp',e});return a},
 pending(){return prog.xpLog.filter(e=>e.q>prog.xpAck)},ack(q){prog.xpAck=Math.max(prog.xpAck,q|0);prog.xpLog=prog.xpLog.filter(e=>e.q>prog.xpAck)},
 state(){return{xp:prog.xp,level:lvlInfo(prog.xp).l,seq:prog.xpSeq,ack:prog.xpAck}}};
const owns=(c,id)=>!!(eco.own[c]&&eco.own[c][id]);
function ensureOwn(){let ch=false;const L=lvlInfo(prog.xp).l,DF={skin:'liso',acc:'nenhum',tail:'normal'};
 for(const c in CAT)for(const id in CAT[c]){const r=CAT[c][id][3];if(r&&r.lv&&L>=r.lv&&!eco.own[c][id]){eco.own[c][id]=1;ch=true}}
 for(const c in DF)if(!eco.own[c][prefs[c]]){prefs[c]=DF[c];ch=true}
 if(ch){ecoDirty=true;savePrefs()}}
ensureOwn();
const saveProg=()=>writeKey('ratoSnackProg',JSON.stringify(prog),validObj);
const today=()=>Math.max(dayNum(),prog.lastDay); // relógio voltando nunca reabre recompensa
function lvlInfo(xp){let lo=1,hi=LV_MAX;while(lo<hi){const m=(lo+hi+1)>>1;if(XP_TAB[m]<=xp)lo=m;else hi=m-1}return lo>=LV_MAX?{l:LV_MAX,cur:0,need:0,max:true}:{l:lo,cur:xp-XP_TAB[lo],need:xpNeed(lo)}}
function addXp(n){if(onlineServerOnly)return 0;const L0=lvlInfo(prog.xp).l;XP.grant(n,'jogo');const L1=lvlInfo(prog.xp).l;if(prog.lvlRw===undefined)prog.lvlRw=L0;let g=0;while(prog.lvlRw<L1&&g++<50){prog.lvlRw++;const r=10+Math.min(prog.lvlRw,100)*2+(prog.lvlRw%10===0?100:0);earn(r,'nível');showToast('🆙 Nível '+prog.lvlRw+'! +'+r+' 🧀',3)}}
function bestTitle(){let b=null;for(const a of ACH)if(prog.ach[a.id]&&(!b||a.xp>b.xp))b=a;return b}
function genMissions(t){let a=(t*2654435761)>>>0;const rnd=()=>{a=(a+0x6D2B79F5)>>>0;let x=a;x=Math.imul(x^x>>>15,x|1);x^=x+Math.imul(x^x>>>7,x|61);return((x^x>>>14)>>>0)/4294967296};
 const pool=MPOOL.slice(),out=[];for(let k=0;k<3;k++){const d=pool.splice(Math.floor(rnd()*pool.length),1)[0],vi=Math.floor(rnd()*d.vals.length);out.push({id:d.id,v:d.vals[vi],xp:d.xp+vi*10,p:0,d:0})}return out}
function ensureDay(){const t=today();let ch=false;if(t!==prog.lastDay){prog.lastDay=t;ch=true}if(prog.mDay!==t||prog.missions.length!==3){prog.mDay=t;prog.mAll=0;prog.mRef=0;prog.mDone=0;prog.missions=genMissions(t);ch=true}if(ch)saveProg()}
function checkAch(notes){let n=0;for(const a of ACH)if(!prog.ach[a.id]&&!prog.achR[a.id]&&a.c()){prog.achR[a.id]=1;n++;if(notes)notes.push('🏅 Conquista pronta para coletar: '+a.n)}if(n)showToast('🏅 '+n+' conquista(s) para coletar!',3);return 0}
const dailyAvail=()=>prog.dailyDay<today();
function claimDaily(){ensureDay();if(!dailyAvail())return null;const t=today(),st=prog.dailyDay===t-1?prog.dailyStreak+1:1,r=DAILY_XP[(st-1)%7];prog.dailyDay=t;prog.dailyStreak=st;addXp(r);earn(DAILY_CH[(st-1)%7],'diária');const notes=[];if(st%7===0){if(!prog.dFace){prog.dFace=1;notes.push('👑 Rato Real desbloqueado! Equipe em Visual › Rato');showToast('👑 Rato Real desbloqueado! Equipe em Visual › Rato',4)}else{earn(200,'diária');notes.push('🧀 +200 de bônus do 7º dia')}}checkAch(notes);saveProg();settleEarn();return{xp:r,streak:st,notes}}
// Conta a rodada UMA vez (endGame, toMenu e reinício passam por aqui; roundCounted impede duplicar).
function countRound(kind){if(mode==='treino'||mpOnline)return;if(roundCounted||!player)return;roundCounted=true;ensureDay();
 stats.bestSize=Math.max(stats.bestSize,player.length);stats.bestKills=Math.max(stats.bestKills,kills);
 const before=lvlInfo(prog.xp).l,notes=[];let gain=Math.min(150,kills*10+Math.floor(foodEaten/10)+Math.floor(gameTime/20)+(kind==='win'?50:0));
 const vals={food:foodEaten,kills,size:player.length,time:Math.floor(gameTime),score,special:specialKills,powers:powersTaken,streak:matchStreak,boss:(kind==='win'&&mode==='boss')?1:0};
 for(const m of prog.missions){if(m.d)continue;const d=MPOOL.find(x=>x.id===m.id),v=vals[m.id]||0;m.p=Math.min(m.v,d.m==='sum'?m.p+v:Math.max(m.p,v));if(m.p>=m.v){m.d=1;notes.push('🎯 Missão pronta para resgatar: '+d.t(m.v))}}
 {const e=evtOf(),st=evtState();if(!st.d){const v=vals[e.key]||0;st.p=e.m==='sum'?Math.min(e.v,st.p+v):Math.min(e.v,Math.max(st.p,v));if(st.p>=e.v){st.d=1;prog.evDone++;prog.evHist.push({d:today(),id:e.id});if(prog.evHist.length>30)prog.evHist.shift();gain+=60;earn(120,'evento');notes.push('🌟 Evento do dia: +120🧀 +60 XP')}}}
 
 if(kind==='win'&&mode==='boss'){prog.bossWins++;const rr=evtOf().id==='chefes'?2:1;earn(80*rr,'chefe');gain+=60*rr;notes.push('👹 Chefe derrotado! +'+80*rr+' 🧀 +'+60*rr+' XP');if(wbRun)gain+=wbReward(notes);}prog.bestStreak=Math.max(prog.bestStreak,matchStreak);prog.specials+=specialKills;if(kind==='win')prog.wins++;
 if(evtOf().id==='ouro'||evtOf().id==='sobrev')gain=Math.round(gain*1.5);addXp(gain);gain+=checkAch(notes);const after=lvlInfo(prog.xp).l;if(after>before)notes.push('⬆️ Nível '+after+'!');
 earn(Math.min(25,Math.floor(gameTime/20)+(score>=50?2:0)),'participação');const ch=settleEarn();prog.bestFood=Math.max(prog.bestFood,foodEaten);prog.bestCheese=Math.max(prog.bestCheese,ch);if(score>0){prog.top.push({s:score,m:mode,d:today()});prog.top.sort((a,b)=>b.s-a.s);prog.top.length=Math.min(5,prog.top.length)}saveProg();lastGain={xp:gain,notes,cheese:ch}}
function menuProg(){ensureDay();const L=lvlInfo(prog.xp);$('lvlT').textContent=L.max?`Nível ${L.l} • MÁXIMO 👑 • 🧀 ${eco.cheese}`:`Nível ${L.l} • ${L.cur}/${L.need} XP • 🧀 ${eco.cheese}`;$('lvlB').style.width=(L.max?100:Math.round(L.cur/L.need*100))+'%';$('daily').classList.toggle('hidden',!dailyAvail());$('evtT').textContent=evtOf().n;$('evtI').textContent=evtOf().i;$('evtDot').classList.toggle('hidden',evtState().d===1);{const T=bestTitle();$('nickMenu').textContent=(prefs.nick||'Jogador')+(T?' • '+T.i+' '+T.n:'');$('nickHud').textContent=(prefs.nick||'Rato Snack')+(T?' '+T.i:'')}}
const evtOf=()=>DEVT[today()%DEVT.length];
function evtState(){const t=today();if(!prog.dev||prog.dev.day!==t)prog.dev={day:t,p:0,d:0};return prog.dev}
const evtScale=()=>['chuva','ouro','veloz'].includes(evtOf().id)?.45:1;
const barRow=(cls,t,r,pct)=>`<div class="mrow${cls}"><div class="mt"><b>${t}</b><span>${r}</span></div>${pct===null?'':`<div class="bar"><i style="width:${pct}%"></i></div>`}</div>`;


