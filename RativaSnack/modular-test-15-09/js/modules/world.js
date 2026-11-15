/* Fragmento preservado do JavaScript original. Não carregar isoladamente; usar build.mjs. */
/* ============ Mundo ============ */
function mkSnake(x,y,angle,color,name,isBot,n,arch){const segs=[];for(let i=0;i<n;i++)segs.push({x:x-Math.cos(angle)*CFG.seg*i,y:y-Math.sin(angle)*CFG.seg*i});
 return{x,y,angle,targetAngle:angle,color,name,isBot,arch,segments:segs,length:n,pending:0,growAcc:0,radius:10,speedBase:isBot?rand(112,150):160,ai:rand(.05,.3),lastAi:.2,alive:true,shield:isBot?CFG.spawnShield:1.5,boostT:0,magnetT:0,multT:0,shieldP:0,boostE:1,boostCd:0,boostActive:false,boostLock:false,turnSide:0,growT:0,tf:null,huntFor:0,huntCool:0,tfBest:1e9,tfStall:0,bad:null,badT:0,kills:0,respawnAt:0,skin:isBot&&Math.random()<.5?pickCos('skin'):'liso',acc:isBot&&Math.random()<.45?pickCos('acc'):'nenhum',tail:isBot&&Math.random()<.35?pickCos('tail'):'normal',hitWall:false,mood:rand(0,6.28),jit:rand(.9,1.1)}}
function pickCos(c){const ids=Object.keys(CAT[c]).filter(k=>!CAT[c][k][3]&&CAT[c][k][1]>0);return ids[Math.floor(Math.random()*ids.length)]}
function spawnFood(x,y,type,drop,color,r){if(foods.length>=CFG.foodCap&&!(type>=7))return null;const f={x,y,r:r||(type?9:rand(4,7)),color:color||(type===1?'#ffd23e':type===2?'#46e6ff':type===3?'#7dff6b':type===4?'#c78bff':type===5?'#5ad1ff':type===6?'#ffb347':COLORS[(Math.random()*COLORS.length)|0]),phase:rand(0,6.28),type:type||0,drop:!!drop,dead:false};foods.push(f);return f}
const randFood=type=>{let x,y,t=0;do{x=rand(B.x0+40,B.x1-40);y=rand(B.y0+40,B.y1-40);t++}while(t<8&&OBS.length&&inObs(x,y,24));return spawnFood(x,y,type||0,false)};
const foodTarget=()=>Math.min(CFG.foodCap-60,Math.round(worldW*worldH/24000));
function bestValue(){return mode==='quick'?bestQuick:mode==='survival'?stats.bestTime:mode==='challenge'?stats.bestChallenge:(prog.mrec[mode]||0)}
function fmtBest(m){m=m||mode;return m==='quick'?bestQuick+' pts':m==='survival'?fmtTime(stats.bestTime):m==='challenge'?stats.bestChallenge+' pts':(prog.mrec[m]||0)+' pts'}
function rebuildSnakes(){snakes.length=0;snakes.push(player);for(const b of bots)snakes.push(b)}
function init(){const r0=Math.random;if(mode==='daily')Math.random=mulb((today()*2654435761)>>>0);try{init1()}finally{Math.random=r0}}
function init1(){
 setArena();setB(0);shrW=0;shrFood=0;goalIdx=0;revived=0;leader=null;specialKills=0;revengeDone=false;lbHtml='';roundCounted=false;powersTaken=0;matchStreak=0;streakN=0;lastKillT=-99;lastGain=null;boss=null;teamScore=[0,0];wave=1;waveKills=0;ev=null;evT=rand(50,80)*evtScale();bossWinT=0;score=0;kills=0;foodEaten=0;gameTime=0;threat=0;dyingT=0;lastKiller=null;causeText='';specialT=rand(8,12);specialRivalT=rand(50,70);toastT=0;nearT=0;nearBots=0;
 roundPrevBest=bestValue();foods=[];particles=[];bots=[];
 player=mkSnake(worldW/2,worldH/2,0,prefs.color,prefs.nick||'Você',false,8,null);applyCosmetics(player);
 for(let i=0;i<BOTS.length;i++){let x=0,y=0,t=0;do{x=rand(260,worldW-260);y=rand(260,worldH-260);t++}while(t<10&&(Math.hypot(x-player.x,y-player.y)<420||inObs(x,y,70)));
  const ang=Math.atan2(worldH/2-y,worldW/2-x)+rand(-.6,.6);bots.push(mkSnake(x,y,ang,COLORS[i%COLORS.length],BOTS[i][0],true,Math.floor(rand(7,17)),BOTS[i][1]))}
 rebuildSnakes();for(let i=botTarget(0);i<bots.length;i++){bots[i].alive=false;bots[i].respawnAt=0}
 const target=foodTarget();for(let i=0;i<target;i++)randFood(Math.random()<.05?1:0);
 cam.x=player.x-W/2;cam.y=player.y-H/2;$('toast').classList.add('hidden');updateHud(true);mpAttach();secretsInit();canvas.style.filter=(evtOf().id==='noite'||(seasActive()&&seasActive().id==='halloween'))?'brightness(.72) contrast(1.08)':'';EVM=evtOf().id==='corrida'?1.22:1;if(evtOf().id==='gigante')for(const b of bots)if(b.alive)b.length+=22;if(ARENA&&ARENA.o.length)showToast('🗺️ Arena: '+ARENA.n+(ARENA.o.some(a=>a[4])?' • evite as zonas vermelhas':''),3)}
function respawnOnlinePlayer(){if(!mpOnline||!player||player.alive)return;const old=player;let x=0,y=0,t=0;const far=(px,py)=>{for(const q of snakes){if(!q.alive||q===old)continue;if(Math.hypot(q.x-px,q.y-py)<300)return false;for(let j=3;j<q.segments.length;j+=3)if(Math.hypot(q.segments[j].x-px,q.segments[j].y-py)<150)return false}return true};do{x=rand(B.x0+260,B.x1-260);y=rand(B.y0+260,B.y1-260);t++}while(t<24&&(!far(x,y)||inObs(x,y,70)));const n=Math.max(3,Math.floor(old.length*.3)),ang=Math.atan2(worldH/2-y,worldW/2-x)+rand(-.6,.6);const np=mkSnake(x,y,ang,old.color,old.name,false,n,null);applyCosmetics(np);np.kills=old.kills;np.shield=3;np.localPaused=!!(paused||resumeCountdown>0);player=np;snakes[0]=np;dyingT=0;lastKiller=null;causeText='';resumeCountdown=0;$('resumeWait').classList.add('hidden');cam.x=CFG.solidWalls?camTarget(np.x,W,worldW,CFG.camMargin):np.x-W/2;cam.y=CFG.solidWalls?camTarget(np.y,H,worldH,CFG.camMargin):np.y-H/2;pointer.dirX=Math.cos(np.angle);pointer.dirY=Math.sin(np.angle);inputLock=performance.now()+450;syncBoostBtn();showToast('💫 Você reapareceu! Perdeu 70% do tamanho e recebeu 3 s de proteção.',3);}function respawnBot(i){const previous=bots[i],respawnSize=previous&&previous.remote?Math.max(3,Math.floor(previous.length*.3)):Math.floor(rand(7,15));let x=0,y=0,t=0;const far=(px,py)=>{for(const s of snakes){if(!s.alive)continue;if(Math.hypot(s.x-px,s.y-py)<260)return false;for(let j=3;j<s.segments.length;j+=3)if(Math.hypot(s.segments[j].x-px,s.segments[j].y-py)<140)return false}return true};
 do{x=rand(B.x0+260,B.x1-260);y=rand(B.y0+260,B.y1-260);t++}while(t<12&&(!far(x,y)||inObs(x,y,70)));
 const ang=Math.atan2(worldH/2-y,worldW/2-x)+rand(-.6,.6);const b=mkSnake(x,y,ang,previous&&previous.remote?previous.color:COLORS[(Math.random()*COLORS.length)|0],previous&&previous.remote?previous.name:BOTS[i][0],true,respawnSize,BOTS[i][1]);bots[i]=b;snakes[i+1]=b;mpRebind(i);if(evtOf().id==='gigante')b.length+=22}

// Quantidade de adversários ativos acompanha a ameaça (8 a 11); os demais ficam em reserva.
function botTarget(T){if(mpOnline)return 3;if(mode==='boss'||mode==='treino')return 4;return Math.max(8,Math.min(BOTS.length-1,Math.round(8+3.2*T)+DIFFS[prefs.diff].count))}
function spawnSpecial(i,type){respawnBot(i);const o=bots[i],sp=SPECIALS[type];const b=mkSnake(o.x,o.y,o.angle,sp.color,sp.name,true,sp.len,sp.arch);b.speedBase=sp.speed;b.radius=sp.radius;b.special=type;b.shield=2;if(type===3)b.armor=1;bots[i]=b;snakes[i+1]=b;showToast(`${sp.icon} ${sp.name} apareceu! ${sp.msg}`,3)}
const ARENAS=[{n:'Aberta',o:[]},
 {n:'Pilares',o:[[.2,.22,.045,.07,0],[.735,.22,.045,.07,0],[.2,.71,.045,.07,0],[.735,.71,.045,.07,0],[.47,.1,.06,.05,0],[.47,.85,.06,.05,0]]},
 {n:'Corredores',o:[[.12,.33,.3,.035,0],[.58,.33,.3,.035,0],[.12,.635,.3,.035,0],[.58,.635,.3,.035,0]]},
 {n:'Zona de perigo',o:[[.08,.1,.14,.2,1],[.78,.7,.14,.2,1],[.78,.1,.14,.2,1],[.08,.7,.14,.2,1],[.3,.47,.05,.07,0],[.65,.47,.05,.07,0]]}];
function setArena(){ARENA=mode==='daily'?ARENAS[1+((Math.random()*(ARENAS.length-1))|0)]:(mode==='quick'||mode==='survival'||mode==='infinite'||mode==='team')?ARENAS[(Math.random()*ARENAS.length)|0]:ARENAS[0];OBS=ARENA.o.map(a=>({x:a[0]*worldW,y:a[1]*worldH,w:a[2]*worldW,h:a[3]*worldH,k:a[4]}))}
function setB(k){B.k=k;B.x0=k*worldW*.2;B.x1=worldW-B.x0;B.y0=k*worldH*.2;B.y1=worldH-B.y0}
function obsHit(s){const r=s.radius*.85;for(const o of OBS){const dx=Math.max(o.x-s.x,0,s.x-o.x-o.w),dy=Math.max(o.y-s.y,0,s.y-o.y-o.h);if(dx*dx+dy*dy<r*r&&(!o.k||s.shield<=0))return true}return false}
function obsRisk(x,y){let r=0;for(const o of OBS){const dx=Math.max(o.x-x,0,x-o.x-o.w),dy=Math.max(o.y-y,0,y-o.y-o.h),d=Math.sqrt(dx*dx+dy*dy);if(d<70)r+=(70-d)*4}return r}
function inObs(x,y,m){for(const o of OBS)if(x>o.x-m&&x<o.x+o.w+m&&y>o.y-m&&y<o.y+o.h+m)return true;return false}
let shrFood=0;function shrinkTick(dt){const k=gameTime<180?0:Math.min(1,(gameTime-180)/150);if(!shrW&&gameTime>=170){shrW=1;showToast('⚠️ O mapa começa a fechar em 10 s!',3)}if(shrW===1&&gameTime>=180){shrW=2;showToast('🔥 O mapa está fechando! Fique na área clara.',3.5)}
 if(k!==B.k){setB(k);shrFood-=dt;if(shrFood<=0){shrFood=1;for(const f of foods)if(f.x<B.x0+20||f.x>B.x1-20||f.y<B.y0+20||f.y>B.y1-20){f.x=rand(B.x0+40,B.x1-40);f.y=rand(B.y0+40,B.y1-40)}}}}
function edge(s){
 if(CFG.solidWalls){const r=s.radius;if(s.x<B.x0+r||s.x>B.x1-r||s.y<B.y0+r||s.y>B.y1-r){s.x=clamp(s.x,B.x0+r,B.x1-r);s.y=clamp(s.y,B.y0+r,B.y1-r);s.hitWall=true}return}
 const ox=s.x,oy=s.y;s.x=(s.x+worldW)%worldW;s.y=(s.y+worldH)%worldH;const dx=s.x-ox,dy=s.y-oy;
 if(dx||dy){for(const q of s.segments){if(Math.abs(q.x-s.x)>worldW/2)q.x+=dx;if(Math.abs(q.y-s.y)>worldH/2)q.y+=dy}if(s===player){cam.x+=dx;cam.y+=dy}}}
function wallRisk(x,y){let r=OBS.length?obsRisk(x,y):0;if(!CFG.solidWalls)return r;const m=110;if(x<B.x0+m)r+=(B.x0+m-x)*3;if(x>B.x1-m)r+=(x-(B.x1-m))*3;if(y<B.y0+m)r+=(B.y0+m-y)*3;if(y>B.y1-m)r+=(y-(B.y1-m))*3;return r}
function deltaWorld(a,b,size){let d=b-a;if(CFG.solidWalls)return d;if(d>size/2)d-=size;else if(d< -size/2)d+=size;return d}

/* ============ IA dos adversários ============ */
// Decide em intervalos (~0.13-0.24 s), enxerga só até um raio de visão e nunca usa informação oculta.
const OFFS=[0,-.35,.35,-.7,.7,-1.1,1.1,-1.6,1.6,-2.3,2.3,Math.PI];
function probeRisk(s,a,L){const px=s.x+Math.cos(a)*L,py=s.y+Math.sin(a)*L;let r=wallRisk(px,py);
 for(let k=0;k<snakes.length;k++){const o=snakes[k];if(o===s||!o.alive)continue;
  const hx=o.x+Math.cos(o.angle)*45-px,hy=o.y+Math.sin(o.angle)*45-py,hd2=hx*hx+hy*hy;
  if(hd2<6400)r+=(80-Math.sqrt(hd2))*(o.length>=s.length?2.2:.9);
  const sg=o.segments;for(let j=1;j<sg.length;j+=2){const dx=sg[j].x-px;if(dx>36||dx<-36)continue;const dy=sg[j].y-py;if(dy>36||dy<-36)continue;const d2=dx*dx+dy*dy;if(d2<1296)r+=(36-Math.sqrt(d2))*2.4}}
 return r}
function foodCost(s,f,A,vis){if(f===s.bad&&s.badT>0)return Infinity;if(s.coBan>gameTime&&Math.hypot(f.x-s.coBx,f.y-s.coBy)<s.coBr)return Infinity;const dx=f.x-s.x,dy=f.y-s.y,d2=dx*dx+dy*dy;if(d2>vis*vis)return Infinity;const d=Math.sqrt(d2);
 // zona morta de curva: queijo dentro do círculo de giro que o rato não consegue fechar (raio = velocidade/giro) só gera órbita
 if(d<130){const R=s.speedBase/3.6,sn=Math.sin(s.angle),cs=Math.cos(s.angle),cap=s.radius+5+f.r,c1x=s.x-sn*R-f.x,c1y=s.y+cs*R-f.y,c2x=s.x+sn*R-f.x,c2y=s.y-cs*R-f.y,dm=Math.sqrt(Math.min(c1x*c1x+c1y*c1y,c2x*c2x+c2y*c2y));if(dm<R-cap*.9)return Infinity}
 const turn=Math.abs(diff(s.angle,Math.atan2(dy,dx)));const w=f.type===0?(f.drop?1.2:1):f.type===1?1.9:1.5*A.special;return d*(1+turn*.19)/(A.food*w*s.jit)}
const nearRiv=[];
// Evita cruzar a frente da cabeça de um rato maior (posição prevista).
function headRisk(s,a){let r=0;const px=s.x+Math.cos(a)*85,py=s.y+Math.sin(a)*85;for(const o of nearRiv){if(o.length<s.length*.9)continue;const d=Math.hypot(px-(o.x+Math.cos(o.angle)*60),py-(o.y+Math.sin(o.angle)*60));if(d<95)r+=(95-d)*1.3}return r}
function botThink(s){if(s.remote&&s.remote.open){s.targetAngle=s.remote.ang;s.bHold=!!s.remote.boost;s.ai=.03;return}botThink0(s);if(s.special===3)tankAdjust(s);antiCoil(s)}
// Anti-bola: se o rato gira sem sair do lugar (órbita em volta de um queijo inacessível ou do próprio corpo), ele abandona a região e foge em linha reta.
function antiCoil(s){if(s.boss)return;const t=gameTime;
 if(s.coT===undefined){s.coT=t;s.cox=s.x;s.coy=s.y;s.coRot=0;s.coA=s.angle;s.coUntil=0;s.coBan=0}
 s.coRot+=Math.abs(diff(s.coA,s.angle));s.coA=s.angle;
 if(s.coUntil<=t&&t-s.coT>=2){const mv=Math.hypot(s.x-s.cox,s.y-s.coy),rot=s.coRot;s.coT=t;s.cox=s.x;s.coy=s.y;s.coRot=0;
  if(rot>5&&mv<120){let cx=0,cy=0,n=0;const sg=s.segments;for(let i=0;i<sg.length;i+=3){cx+=sg[i].x;cy+=sg[i].y;n++}cx/=n;cy/=n;
   const away=Math.atan2(s.y-cy,s.x-cx),ctr=Math.atan2(worldH/2-s.y,worldW/2-s.x),wall=Math.min(s.x,worldW-s.x,s.y,worldH-s.y)<200;
   s.coBase=wall?ctr:away;s.coUntil=t+1.6;s.coBan=t+7;s.coBx=cx;s.coBy=cy;s.coBr=170;s.tf=null;s.bad=null;s.badT=0;s.tfStall=0}}
 if(s.coUntil>t){let ba=s.coBase,bc=1e9;for(const o of [0,-.5,.5,-1,1]){const a=s.coBase+o,c=probeRisk(s,a,90)+Math.abs(o)*4;if(c<bc){bc=c;ba=a}}s.targetAngle=ba}}
// Tanque: anti-travamento (foge de cantos), antecipa o jogador, trajetória pouco previsível. Sem teleporte, mesma velocidade máxima.
function tankAdjust(s){const t=gameTime;if(s.stT===undefined){s.stT=t;s.stx=s.x;s.sty=s.y;s.escUntil=0;s.seed=Math.random()*6.28}
 if(t-s.stT>1.5){const mv=Math.hypot(s.x-s.stx,s.y-s.sty);s.stT=t;s.stx=s.x;s.sty=s.y;if(mv<45){s.escUntil=t+1.4;s.escAng=Math.atan2(worldH/2-s.y,worldW/2-s.x)+rand(-.7,.7)}}
 if(s.escUntil>t){s.targetAngle=s.escAng;return}
 if(player.alive&&s.length>=player.length*.8&&!nearRiv.some(o=>o!==player&&o.length>=s.length)){const d=Math.hypot(player.x-s.x,player.y-s.y);if(d<650&&d>40&&Math.min(s.x,worldW-s.x,s.y,worldH-s.y)>220){const lead=Math.min(.8,d/260),pa=Math.atan2(player.y+Math.sin(player.angle)*160*lead-s.y,player.x+Math.cos(player.angle)*160*lead-s.x);s.targetAngle+=diff(s.targetAngle,pa)*.4}}
 s.targetAngle+=Math.sin(t*1.3+s.seed)*.18}
function botThink0(s){if(s.boss){s.ai=.1;return}
 const D=DIFFS[prefs.diff],A=ARCH[s.arch]||ARCH.guloso,T=threat,vis=480+110*T+D.vis,interval=(.2-.07*T)*rand(.85,1.15)*D.react;
 s.ai=interval;s.lastAi=interval;s.huntCool-=interval;
 let fx=0,fy=0,threatD=1e9,prey=null,preyD=1e9;nearRiv.length=0;
 for(let k=0;k<snakes.length;k++){const o=snakes[k];if(o===s||!o.alive||(mode==='team'&&tm(o)===tm(s)))continue;const dx=o.x-s.x,dy=o.y-s.y,d=Math.hypot(dx,dy);if(d>vis||d<1)continue;
  if(d<190){const danger=(190-d)/190*(o.length>=s.length?1.2:.6);fx-=dx/d*danger*A.caution;fy-=dy/d*danger*A.caution}
  if(o.length>=s.length&&d<threatD)threatD=d;if(d<300)nearRiv.push(o);
  if((A.hunt+D.hunt)*(.35+T)>=.3&&s.huntCool<=0&&s.length>=10&&o.length<s.length*.9&&o.shield<=0&&d<420+D.vis&&d<preyD){preyD=d;prey=o}}
 // objetivo: presa (caçadores) > comida (com histerese) > vagar
 let goalAng=null,hunting=false;
 let cur=Infinity;if(s.tf&&!s.tf.dead)cur=foodCost(s,s.tf,A,vis+80);else s.tf=null;
 let best=null,bestC=Infinity;for(let i=0;i<foods.length;i++){let c=foodCost(s,foods[i],A,vis);if(c<bestC){if(nearRiv.length){const f=foods[i],ds=Math.hypot(f.x-s.x,f.y-s.y);for(const o of nearRiv)if(Math.hypot(f.x-o.x,f.y-o.y)<ds*.7)c*=o.length>=s.length*.9?1.7:.85}if(c<bestC){bestC=c;best=foods[i]}}}
 if(s.badT>0)s.badT-=interval;
 if(best&&(!s.tf||bestC<cur*.8)){if(s.tf!==best){s.tfBest=1e9;s.tfStall=0}s.tf=best}
 if(s.tf){const d=Math.hypot(s.tf.x-s.x,s.tf.y-s.y);if(d<s.tfBest-8){s.tfBest=d;s.tfStall=0}else s.tfStall+=interval;
  // não consegue chegar (órbita por causa do raio de curva): desiste desse queijo por alguns segundos
  if(s.tfStall>1.1&&d<140){s.bad=s.tf;s.badT=5;s.tf=null;s.tfBest=1e9;s.tfStall=0}}
 if(prey){const ps=prey.speedBase*(prey.boostActive?1.5:1),lt=Math.min(1.3,preyD/Math.max(80,s.speedBase*(s.boostActive?1.5:1))),px=prey.x+Math.cos(prey.angle)*ps*lt,py=prey.y+Math.sin(prey.angle)*ps*lt;goalAng=Math.atan2(py-s.y,px-s.x);hunting=true;s.huntFor+=interval;if(s.huntFor>3.5){s.huntCool=5;s.huntFor=0}}
 else{s.huntFor=0;if(s.tf)goalAng=Math.atan2(s.tf.y-s.y,s.tf.x-s.x);else goalAng=s.angle+Math.sin(gameTime/1.7+s.mood)*A.wander*1.2}
 const fleeing=threatD<170,fleeAng=Math.atan2(fy,fx),sloppy=Math.random()<.25*(1-T),far=70+60*T+30;s.bHold=!s.special&&D.boost>0&&((hunting&&preyD<340)||(fleeing&&threatD<150))&&Math.random()<.4+.6*D.boost;
 let bestA=s.angle,bc=Infinity;const nC=OFFS.length+(goalAng!==null?1:0);
 for(let k=0;k<nC;k++){const off=k<OFFS.length?OFFS[k]:diff(s.angle,goalAng),a=s.angle+off;let c=probeRisk(s,a,70)+headRisk(s,a);if(!sloppy)c+=probeRisk(s,a,far)*.8;
  c+=Math.abs(off)*3-(off===0?5:0);if(goalAng!==null)c-=Math.cos(diff(a,goalAng))*16*(hunting?1.2:1);if(fleeing)c-=Math.cos(diff(a,fleeAng))*22;if(c<bc){bc=c;bestA=a}}
 s.targetAngle=bestA}

/* ============ Movimento, comida, bônus ============ */
function addSeg(s){const t=s.segments[s.segments.length-1];s.segments.push({x:t.x,y:t.y});s.length++}
function move(s,dt){
 if(!s.alive||s.localPaused)return;
 if(s.isBot){s.ai-=dt;if(s.ai<=0)botThink(s)}else if(pointer.down&&pointer.hasDirection){s.targetAngle=Math.atan2(pointer.dirY,pointer.dirX)}
 if(s.isBot){s.angle=stepAngle(s.angle,s.targetAngle,(s.special?3.6:DIFFS[prefs.diff].turn)*dt);if(!s.special&&DIFFS[prefs.diff].boost)updateBoost(s,dt,!!s.bHold,CFG)}else{updateBoost(s,dt,boostHold,CFG);steerPlayer(s,s.targetAngle,TURNS[prefs.turn].v,dt)}
 const spd=s.speedBase*(s.isBot?(1+.08*threat+(mode==='infinite'?Math.min(.35,.03*wave):0))*(s.special?1:DIFFS[prefs.diff].spd):1)*(ev&&ev.id==='vento'?1.15:1)*Math.max(s.boostT>0?skillVal(s,'boost','mul'):1,s.boostActive?CFG.boostMult:1);
 s.px=s.x;s.py=s.y;s.x+=Math.cos(s.angle)*spd*EVM*dt;s.y+=Math.sin(s.angle)*spd*EVM*dt;edge(s);if(OBS.length&&obsHit(s))s.hitWall=true;
 bodyFromTrail(s);
 if(s.boostT>0)s.boostT=Math.max(0,s.boostT-dt);if(s.growT>0)s.growT=Math.max(0,s.growT-dt);if(s.magnetT>0)s.magnetT=Math.max(0,s.magnetT-dt);if(s.magnetT<=0)s.magnetPow=1;if(s.multT>0)s.multT=Math.max(0,s.multT-dt);if(s.shieldP>0)s.shieldP=Math.max(0,s.shieldP-dt);if(s.shield>0)s.shield=Math.max(0,s.shield-dt);
 if(s.pending>0){if(s.length>=CFG.maxLen)s.pending=0;else{s.growAcc+=dt;while(s.growAcc>=.05&&s.pending>0){s.growAcc-=.05;s.pending--;addSeg(s)}}}
 if(s.hitWall){s.hitWall=false;if(s.boss)bossCrash(s);else die(s,'wall',null)}}
function burst(x,y,c,n){n=Math.min(Math.round(n*QUAL[prefs.quality].part),CFG.particleCap-particles.length);for(let i=0;i<n;i++){const a=rand(0,6.28),v=rand(25,120);particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rand(.25,.7),max:.7,color:c,r:rand(2,4)})}}
function addScore(n){if(player&&player.multT>0)n*=2;score+=n;if(mode==='quick'&&score>bestQuick){bestQuick=score;bestDirty=true}}
function applyFood(s,f){const dbl=s.growT>0?2:1;let pts=10;
 if(f.type===0)s.pending+=dbl;
 else if(f.type===1){s.pending+=3*dbl;pts=50}
 else if(f.type===2){s.boostT=skillVal(s,'boost','dur');pts=15}
 else if(f.type===3){s.growT=skillVal(s,'grow','dur');s.pending+=4;pts=15}else if(f.type===4){s.magnetT=skillVal(s,'magnet','dur');s.magnetPow=1;pts=15}else if(f.type===5){const d=skillVal(s,'shield','dur');s.shieldP=d;s.shield=Math.max(s.shield,d);pts=15}
 else if(f.type===7){s.pending+=3*2*dbl;pts=50;if(!s.isBot)earn(100,'Rei Queijo')}
 else if(f.type===8){s.magnetT=skillVal(s,'magnet','dur');s.magnetPow=4;pts=40;if(!s.isBot)earn(75,'Tanque')}
 else{s.multT=skillVal(s,'mult','dur');pts=15}
 if(!s.isBot){cheeseFood(f);if(ev&&ev.id==='ouro')pts*=2;addScore(pts);foodEaten++;if(f.type>=2){powersTaken++;sfx('bonus');showToast(toastFor(f.type,s))}else if(f.type===1){sfx('bonus');showToast('⭐ Queijo raro! +50')}else sfx('eat')}}
function eat(s){if(!s.alive||s.localPaused)return;const rr=s.radius+5;
 for(let i=foods.length-1;i>=0;i--){const f=foods[i],dx=f.x-s.x,dy=f.y-s.y,l=rr+f.r;if(dx*dx+dy*dy<l*l){f.dead=true;foods[i]=foods[foods.length-1];foods.pop();applyFood(s,f);burst(f.x,f.y,f.color,f.type?8:3)}}}
function dropFood(s){for(let i=2;i<s.segments.length;i+=2){const q=s.segments[i];spawnFood(q.x+rand(-5,5),q.y+rand(-5,5),0,true,s.color,rand(5,7))}}

