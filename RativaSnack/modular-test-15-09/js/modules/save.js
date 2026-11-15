/* Fragmento preservado do JavaScript original. Não carregar isoladamente; usar build.mjs. */
/* ============ Salvamento (falhas de armazenamento nunca interrompem o jogo) ============ */
const mem={};
let importing=false;
const store={get(k,d){try{const v=localStorage.getItem(k);if(v!==null)return v}catch(e){}return k in mem?mem[k]:d},set(k,v){try{localStorage.setItem(k,v);delete mem[k];return true}catch(e){mem[k]=v;return false}}};
let saveFailed=false,bestDirty=false,onlineServerOnly=true;
const numOk=(v,min,max)=>v!==undefined&&v!==null&&v!==''&&Number.isFinite(+v)&&+v>=min&&+v<=max;
const parseObj=t=>{try{const o=JSON.parse(t);return o&&typeof o==='object'&&!Array.isArray(o)?o:null}catch(e){return null}};
// Leitura resistente: JSON inválido é guardado em '.corrupt' (nunca apagado) e a cópia '.bak' é usada.
function readObj(k){if(onlineServerOnly&&k!=='ratoSnackPrefs')return null;const raw=store.get(k,null);let o=raw===null?null:parseObj(raw);if(raw!==null&&!o)store.set(k+'.corrupt',raw);if(!o){const b=store.get(k+'.bak',null);o=b===null?null:parseObj(b);if(o)store.set(k,b)}return o} // usa a cópia e REPARA a chave principal
// Escrita: guarda a versão anterior válida como '.bak' e confere a releitura.
function writeKey(k,str,okFn){if(onlineServerOnly&&k!=='ratoSnackPrefs')return true;if(importing)return true;const prev=store.get(k,null);if(prev!==null&&okFn(prev))store.set(k+'.bak',prev);const ok=store.set(k,str)&&store.get(k,null)===str;saveFailed=!ok;return ok}
function loadJSON(k,def){return Object.assign({},def,readObj(k)||{})}
const prefs=loadJSON('ratoSnackPrefs',{color:PLAYER_COLORS[0],skin:'liso',music:false,sfx:true,fullscreen:true,turn:1,mode:'quick',boostLeft:false,face:'normal',acc:'nenhum',tail:'normal',ctl:'arrastar',sens:1,csz:1,vol:2,vib:true,stickLeft:true,quality:'alta',dead:1,arrows:true,autoq:true,rat:'nenhum'});
const STATS_DEF={games:0,kills:0,food:0,time:0,bestSize:8,bestTime:0,bestChallenge:0,bestKills:0};
const stats=loadJSON('ratoSnackStats',STATS_DEF);
for(const k in STATS_DEF)stats[k]=numOk(stats[k],0,1e9)?+stats[k]:STATS_DEF[k];
for(const k of ['music','sfx','fullscreen','boostLeft','vib','stickLeft','arrows','bigtxt','cblind','autoq'])prefs[k]=prefs[k]===true;
const readBest=k=>{if(onlineServerOnly)return 0;const v=store.get(k,null);return numOk(v,0,1e9)?+v:0};
let bestQuick=Math.max(readBest('ratoSnackBest'),readBest('ratoSnackBest.bak')); // chave original preservada
if(!PLAYER_COLORS.includes(prefs.color))prefs.color=PLAYER_COLORS[0];
if(!SKINS[prefs.skin])prefs.skin='liso';if(!FACES[prefs.face])prefs.face='normal';if(!ACCS[prefs.acc])prefs.acc='nenhum';if(!TAILS[prefs.tail])prefs.tail='normal';if(prefs.rat!=='nenhum'&&!RATS[prefs.rat])prefs.rat='nenhum';if(!['arrastar','joystick','toque'].includes(prefs.ctl))prefs.ctl='arrastar';for(const k of ['sens','csz','vol','dead'])if(!(prefs[k]>=0&&prefs[k]<=2))prefs[k]=k==='vol'?2:1;if(!QUAL[prefs.quality])prefs.quality='alta';prefs.nick=cleanNick(prefs.nick);if(!(prefs.diff>=0&&prefs.diff<=3))prefs.diff=1;if(!prefs.tut||typeof prefs.tut!=='object'||Array.isArray(prefs.tut))prefs.tut={};for(const k in prefs.tut)if(!TUT[k]||prefs.tut[k]!==1)delete prefs.tut[k];
if(!MODES[prefs.mode])prefs.mode='quick';
if(!(prefs.turn>=0&&prefs.turn<TURNS.length))prefs.turn=1;
const validObj=t=>!!parseObj(t);
const savePrefs=()=>writeKey('ratoSnackPrefs',JSON.stringify(prefs),validObj);
const saveStats=()=>writeKey('ratoSnackStats',JSON.stringify(stats),validObj);
// Recorde da partida rápida: marcado como pendente e gravado em pausa, fim, ocultar, pagehide e a cada 5 s (evita gravar a cada ponto).
function flushSave(){if(onlineServerOnly)return;if(ecoDirty)saveEco();mirrorIDB();if(!bestDirty)return;bestDirty=!writeKey('ratoSnackBest',String(bestQuick),v=>numOk(v,0,1e9))}

