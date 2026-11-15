/* Fragmento preservado do JavaScript original. Não carregar isoladamente; usar build.mjs. */
/* ============ Estado ============ */
const B={x0:0,y0:0,x1:3600,y1:2400,k:0};let OBS=[],ARENA=null,shrW=0;
let W=innerWidth,H=innerHeight,dpr=1,worldW=3600,worldH=2400,player=null,bots=[],snakes=[],foods=[],particles=[];
let running=false,paused=false,resumeCountdown=0,ended=false,last=0,hudT=0,mode=prefs.mode,gameTime=0,score=0,kills=0,foodEaten=0,threat=0,dyingT=0,lastKiller=null,causeText='',specialT=10,toastT=0,inputLock=0,boostHold=false,bid=null,boostPct=-1,boss=null,teamScore=[0,0],wave=1,waveKills=0,ev=null,evT=60,bossWinT=0,roundCounted=false,powersTaken=0,matchStreak=0,streakN=0,lastKillT=-99,lastGain=null,custTab='cor',specialKills=0,revengeDone=false,pendingRevenge=null,lastRevenge=null,lbT=0,lbHtml='',myRank=1,rankTotal=1,lb=$('lb'),specialRivalT=60,bb=$('boost'),mm=$('mm'),mmc=$('mm').getContext('2d'),mmN=0,roundPrevBest=0,nearT=0,nearBots=0;
const cam={x:0,y:0};
const pointer={x:0,y:0,active:false,down:false,id:null,ax:0,ay:0,dirX:1,dirY:0,hasDirection:false};
const rand=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

/*PURE-START*/
function diff(a,b){return Math.atan2(Math.sin(b-a),Math.cos(b-a))}
function stepAngle(a,target,maxStep){const d=diff(a,target);return a+Math.max(-maxStep,Math.min(maxStep,d))}
// Joystick flutuante: a âncora acompanha o dedo a no máximo maxR; abaixo de 'dead' a direção não muda.
function stickUpdate(c,x,y,maxR,dead){let dx=x-c.ax,dy=y-c.ay,d=Math.hypot(dx,dy);if(d>maxR){const k=(d-maxR)/d;c.ax+=dx*k;c.ay+=dy*k;dx=x-c.ax;dy=y-c.ay;d=maxR}if(d>=dead){c.dirX=dx;c.dirY=dy;c.hasDirection=true}return c}
function camTarget(p,view,world,m){return world+2*m<=view?(world-view)/2:Math.max(-m,Math.min(world-view+m,p-view/2))}
// Corpo em cadeia com espaçamento fixo: o comprimento NÃO depende da taxa de quadros.
// Corpo por trilha: a cabeça grava pontos a cada DS px de caminho; o segmento i fica exatamente a i*seg px de caminho da cabeça.
// Isso mantém a espaçamento constante, independe do FPS e evita o colapso/congelamento de segmentos em giros fechados.
const DS=2;
function initTrail(s){const C=Math.ceil(CFG.maxLen*CFG.seg/DS)+80;s.tx=new Float32Array(C);s.ty=new Float32Array(C);s.tn=0;s.th=0;s.lx=0;s.ly=0;const g=s.segments;for(let i=g.length-1;i>=0;i--)pushTrail(s,g[i].x,g[i].y)}
function pushTrail(s,x,y){if(s.tn===0){s.th=0;s.tx[0]=x;s.ty[0]=y;s.tn=1;s.lx=x;s.ly=y;return}
 let dx=x-s.lx,dy=y-s.ly,d=Math.hypot(dx,dy);if(d<DS)return;const C=s.tx.length,ux=dx/d,uy=dy/d;let lx=s.lx,ly=s.ly,g=0;
 while(d>=DS&&g++<600){lx+=ux*DS;ly+=uy*DS;d-=DS;s.th=(s.th+1)%C;s.tx[s.th]=lx;s.ty[s.th]=ly;if(s.tn<C)s.tn++}s.lx=lx;s.ly=ly}
function bodyFromTrail(s){if(!s.tx)initTrail(s);pushTrail(s,s.x,s.y);const seg=s.segments,n=s.length,sp=CFG.seg,C=s.tx.length;seg[0].x=s.x;seg[0].y=s.y;
 const rx=s.x-s.lx,ry=s.y-s.ly,r=Math.hypot(rx,ry);
 for(let i=1;i<n;i++){const t=i*sp;let x,y;
  if(t<=r){const f=t/r;x=s.x-rx*f;y=s.y-ry*f}
  else{const u=(t-r)/DS,j=Math.floor(u),f=u-j;
   if(j+1>=s.tn){const o=(s.th-(s.tn-1)+C)%C;x=s.tx[o];y=s.ty[o]}
   else{const a=(s.th-j+C)%C,b=(a-1+C)%C;x=s.tx[a]+(s.tx[b]-s.tx[a])*f;y=s.ty[a]+(s.ty[b]-s.ty[a])*f}}
  seg[i].x=x;seg[i].y=y}}
function followBody(seg,n,sp){for(let i=1;i<n;i++){const p=seg[i-1],q=seg[i],dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy);if(d>sp){const k=(d-sp)/d;q.x+=dx*k;q.y+=dy*k}}}
// Dificuldade dinâmica (0..0.95): tempo, tamanho, abates e densidade de adversários próximos (alivia se há muitos).
function calcThreat(time,length,kills,near,survival){const tf=Math.min(1,time/(survival?150:240)),sz=Math.min(1,Math.max(0,length-8)/70),kk=Math.min(1,kills/8);return Math.max(0,Math.min(.95,.5*tf+.25*sz+.15*kk-.08*Math.max(0,near-2)))}
function fmtTime(sec){const s=Math.max(0,Math.floor(sec));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
// Giro do jogador: suaviza perto do alvo, velocidade máxima fixa, e mantém o lado do giro em meia-volta (~180°).
function steerPlayer(s,t,vmax,dt){let d=diff(s.angle,t);const ad=Math.abs(d);if(ad>2.8&&s.turnSide)d=ad*s.turnSide;else s.turnSide=d<0?-1:1;const st=Math.min(ad,vmax*dt,Math.max(ad*14*dt,vmax*dt*.3));s.angle+=(d<0?-st:st);return s.angle}
// Impulso manual: gasta energia (boostMax s), recarga após boostDelay, exige boostMin para começar e soltar o botão após esvaziar.
function updateBoost(s,dt,hold,c){if(!hold)s.boostLock=false;let on=!!hold&&!s.boostLock&&s.boostE>0&&(s.boostActive||s.boostE>=c.boostMin);
 if(on){s.boostE=Math.max(0,s.boostE-dt/c.boostMax);s.boostCd=c.boostDelay;if(s.boostE<=0){on=false;s.boostLock=true}}
 else if(s.boostCd>0)s.boostCd-=dt;else s.boostE=Math.min(1,s.boostE+dt/c.boostRecharge);
 s.boostActive=on;return on}
/*PURE-END*/

let vig=null;
function resize(){W=innerWidth;H=innerHeight;dpr=Math.max(1,Math.min(devicePixelRatio||1,mpOnline?1.1:1.5,QUAL[prefs.quality].dpr,1400/Math.max(W,H)));const cw=Math.round(W*dpr),ch=Math.round(H*dpr);if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;ctx.setTransform(dpr,0,0,dpr,0,0);vig=ctx.createRadialGradient(W/2,H/2,20,W/2,H/2,Math.max(W,H)*.7);vig.addColorStop(0,'#2a1b5088');vig.addColorStop(1,'#150f2a00')}}
addEventListener('resize',resize);resize();

