/* Fragmento preservado do JavaScript original. Não carregar isoladamente; usar build.mjs. */
/* ============ Desenho ============ */
function background(){const sw=CFG.solidWalls,wx=-cam.x,wy=-cam.y;ctx.fillStyle=sw?'#0d0a1c':'#150f2a';ctx.fillRect(0,0,W,H);
 if(sw){ctx.fillStyle='#150f2a';ctx.fillRect(wx,wy,worldW,worldH);ctx.save();ctx.beginPath();ctx.rect(wx,wy,worldW,worldH);ctx.clip()}
 const g=70,ox=-((cam.x%g)+g)%g,oy=-((cam.y%g)+g)%g;ctx.strokeStyle='#26334b';ctx.lineWidth=1;ctx.beginPath();for(let x=ox;x<W;x+=g){ctx.moveTo(x,0);ctx.lineTo(x,H)}for(let y=oy;y<H;y+=g){ctx.moveTo(0,y);ctx.lineTo(W,y)}ctx.stroke();
 if(sw){ctx.restore();drawArena(wx,wy);ctx.strokeStyle='#ff6b8bcc';ctx.lineWidth=6;ctx.strokeRect(wx,wy,worldW,worldH)}
 ctx.fillStyle=vig;ctx.fillRect(0,0,W,H)}
function drawFood(t){ctx.textAlign='center';for(const f of foods){const px=f.x-cam.x,py=f.y-cam.y;if(px<-24||py<-24||px>W+24||py>H+24)continue;const r=f.r*(.88+.12*Math.sin(t*3+f.phase));
 if(f.type){ctx.fillStyle=f.color+'40';ctx.beginPath();ctx.arc(px,py,r*(1.7+.25*Math.sin(t*4+f.phase)),0,6.2832);ctx.fill()}
 ctx.fillStyle=f.color;ctx.beginPath();ctx.arc(px,py,r,0,6.2832);ctx.fill();ctx.fillStyle='#ffffffa0';ctx.beginPath();ctx.arc(px-r*.25,py-r*.3,r*.25,0,6.2832);ctx.fill();
 if(f.type>=2){ctx.font='13px system-ui';ctx.fillStyle='#10182a';{if(f.type>=7){ctx.strokeStyle=f.color;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(px,py,f.r+5+Math.sin(gameTime*6)*2,0,6.2832);ctx.stroke()}ctx.fillText(FOODICON[f.type],px,py+4.5)}}}}
// ===== Cosméticos (só visual; sem vantagem) =====
function cleanNick(v){return String(v==null?'':v).replace(/[^\p{L}\p{N} _\-]/gu,'').replace(/\s+/g,' ').trim().slice(0,12)}
function applyCosmetics(s){s.rat=prefs.rat||'nenhum';if(RATS[s.rat])s.color=RATS[s.rat].c;s.skin=prefs.skin;s.face=prefs.face;s.acc=prefs.acc;s.tail=prefs.tail}
function faceDraw(s,R){const f=s.face;ctx.lineCap='round';
  if(f==='real'){ctx.fillStyle='#ffd23f';ctx.strokeStyle='#b8860b';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,-R*.5);ctx.lineTo(-R*.5,-R*.62);ctx.lineTo(-R*.32,-R*.2);ctx.lineTo(-R*.58,0);ctx.lineTo(-R*.32,R*.2);ctx.lineTo(-R*.5,R*.62);ctx.lineTo(0,R*.5);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#ff4d6d';ctx.beginPath();ctx.arc(-R*.14,0,R*.11,0,6.3);ctx.fill()}
  else 
 if(f==='bravo'){ctx.strokeStyle='#172033';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(R*.2,-R*.66);ctx.lineTo(R*.66,-R*.18);ctx.moveTo(R*.2,R*.66);ctx.lineTo(R*.66,R*.18);ctx.stroke()}
 else if(f==='feliz'){ctx.strokeStyle='#172033';ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(R*.5,0,R*.32,-1.1,1.1);ctx.stroke()}
 else if(f==='fofo'){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(R*.55,-R*.33,R*.075,0,6.2832);ctx.arc(R*.55,R*.33,R*.075,0,6.2832);ctx.fill();ctx.fillStyle='#ff9fb2aa';ctx.beginPath();ctx.arc(R*.3,-R*.64,R*.17,0,6.2832);ctx.arc(R*.3,R*.64,R*.17,0,6.2832);ctx.fill()}
 if(s.acc==='oculos'){ctx.fillStyle='#10131cdd';ctx.beginPath();ctx.arc(R*.42,-R*.33,R*.33,0,6.2832);ctx.arc(R*.42,R*.33,R*.33,0,6.2832);ctx.fill();ctx.fillRect(R*.36,-R*.33,R*.12,R*.66)}}
function accDraw(s,hx,hy,R){const a=s.acc;if(!a||a==='nenhum'||a==='oculos')return;const y=hy-R*.8;
 if(a==='coroa'){ctx.fillStyle='#ffd34e';ctx.beginPath();ctx.moveTo(hx-R*.8,y);ctx.lineTo(hx-R*.8,y-R*.8);ctx.lineTo(hx-R*.4,y-R*.4);ctx.lineTo(hx,y-R*.95);ctx.lineTo(hx+R*.4,y-R*.4);ctx.lineTo(hx+R*.8,y-R*.8);ctx.lineTo(hx+R*.8,y);ctx.closePath();ctx.fill();ctx.strokeStyle='#b8860b';ctx.lineWidth=1.2;ctx.stroke()}
 else if(a==='festa'){ctx.fillStyle='#ff6bd6';ctx.beginPath();ctx.moveTo(hx-R*.55,y);ctx.lineTo(hx,y-R*1.5);ctx.lineTo(hx+R*.55,y);ctx.closePath();ctx.fill();ctx.fillStyle='#ffe477';ctx.beginPath();ctx.arc(hx,y-R*1.5,R*.2,0,6.2832);ctx.fill()}
 else if(a==='laco'){ctx.fillStyle='#ff5d8f';ctx.beginPath();ctx.moveTo(hx,y-R*.2);ctx.lineTo(hx-R*.75,y-R*.65);ctx.lineTo(hx-R*.75,y+R*.15);ctx.closePath();ctx.moveTo(hx,y-R*.2);ctx.lineTo(hx+R*.75,y-R*.65);ctx.lineTo(hx+R*.75,y+R*.15);ctx.closePath();ctx.fill();ctx.beginPath();ctx.arc(hx,y-R*.2,R*.2,0,6.2832);ctx.fill()}
 else if(a==='chef'){ctx.fillStyle='#ffffff';ctx.fillRect(hx-R*.6,y-R*.55,R*1.2,R*.6);for(const dx of[-.55,0,.55]){ctx.beginPath();ctx.arc(hx+R*dx,y-R*.75,R*.5,0,6.2832);ctx.fill()}ctx.strokeStyle='#c7d2e6';ctx.lineWidth=1;ctx.strokeRect(hx-R*.6,y-R*.55,R*1.2,R*.6)}
 else if(a==='cowboy'){ctx.fillStyle='#8a5a2b';ctx.beginPath();ctx.ellipse(hx,y,R*1.35,R*.32,0,0,6.2832);ctx.fill();ctx.fillRect(hx-R*.6,y-R*.85,R*1.2,R*.8);ctx.fillStyle='#5e3a18';ctx.fillRect(hx-R*.6,y-R*.3,R*1.2,R*.16)}
 else if(a==='chifres'){ctx.fillStyle='#ff3b4f';for(const sx of[-1,1]){ctx.beginPath();ctx.moveTo(hx+sx*R*.35,y+R*.1);ctx.lineTo(hx+sx*R*.9,y-R*.95);ctx.lineTo(hx+sx*R*.75,y+R*.05);ctx.closePath();ctx.fill()}}
 else if(a==='halo'){ctx.strokeStyle='#ffe36b';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(hx,y-R*.6+Math.sin(gameTime*3)*1.5,R*.85,R*.28,0,0,6.2832);ctx.stroke();ctx.strokeStyle='#fff6c4aa';ctx.lineWidth=1;ctx.stroke()}
 else if(a==='cartola'){ctx.fillStyle='#1c2233';ctx.fillRect(hx-R*.9,y-R*.12,R*1.8,R*.24);ctx.fillRect(hx-R*.55,y-R*1.2,R*1.1,R*1.1);ctx.fillStyle='#ff5d73';ctx.fillRect(hx-R*.55,y-R*.4,R*1.1,R*.2)}}
function tailDraw(s){const t=s.tail;if(!t||t==='normal'){ratTail(s);return}const sg=s.segments,n=sg.length,q=sg[n-1],p=sg[Math.max(0,n-2)],px=q.x-cam.x,py=q.y-cam.y;if(px<-50||py<-50||px>W+50||py>H+50)return;const R=s.radius,ang=Math.atan2(q.y-p.y,q.x-p.x),ca=Math.cos(ang),sa=Math.sin(ang);
 if(t==='pompom'){ctx.fillStyle='#f4f8ff';ctx.beginPath();ctx.arc(px+ca*R*.6,py+sa*R*.6,R*.62,0,6.2832);ctx.fill();ctx.fillStyle='#8fa3c466';ctx.beginPath();ctx.arc(px+ca*R*.6+2,py+sa*R*.6+2,R*.3,0,6.2832);ctx.fill()}
 else if(t==='flor'){for(let k=0;k<5;k++){const a=k*1.2566;ctx.fillStyle='#ff9ad5';ctx.beginPath();ctx.arc(px+Math.cos(a)*R*.55,py+Math.sin(a)*R*.55,R*.38,0,6.2832);ctx.fill()}ctx.fillStyle='#ffe477';ctx.beginPath();ctx.arc(px,py,R*.3,0,6.2832);ctx.fill()}
 else if(t==='estrela'||t==='coracao'){const cx=px+ca*R*1.1,cy=py+sa*R*1.1,rr=R*.95;ctx.fillStyle=t==='estrela'?'#ffd34e':'#ff5d8f';ctx.beginPath();
  if(t==='estrela'){for(let k=0;k<10;k++){const a=k*Math.PI/5-Math.PI/2,r2=k%2?rr*.45:rr;ctx.lineTo(cx+Math.cos(a)*r2,cy+Math.sin(a)*r2)}ctx.closePath()}
  else{ctx.moveTo(cx,cy+rr*.8);ctx.bezierCurveTo(cx-rr*1.3,cy-rr*.1,cx-rr*.6,cy-rr*1.1,cx,cy-rr*.35);ctx.bezierCurveTo(cx+rr*.6,cy-rr*1.1,cx+rr*1.3,cy-rr*.1,cx,cy+rr*.8)}
  ctx.fill();ctx.strokeStyle='#00000033';ctx.lineWidth=1;ctx.stroke()}
 else if(t==='chama'){const tt=gameTime*12;for(let k=1;k<=3;k++){const d=R*(.5+k*.75),w=Math.sin(tt+k*1.7)*R*.25;ctx.fillStyle=k===1?'#ffd34ecc':k===2?'#ff9f43aa':'#ff5d7388';ctx.beginPath();ctx.arc(px+ca*d-sa*w,py+sa*d+ca*w,R*(.55-k*.1),0,6.2832);ctx.fill()}}}
// Pré-visualização: reutiliza drawSnake em um canvas pequeno (troca temporária de ctx/W/H/cam).
function drawPreview(id,ov){const pc=$(id);if(!pc)return;const c2=pc.getContext('2d'),main=ctx,sw=W,sh=H,cx=cam.x,cy=cam.y,gt=gameTime;
 try{ctx=c2;W=pc.width;H=pc.height;cam.x=0;cam.y=0;gameTime=0;c2.clearRect(0,0,W,H);const n=Math.max(5,Math.floor((W-60)/12)),ps=mkSnake(W-34,H/2+6,0,prefs.color,'',false,n,null);applyCosmetics(ps);if(ov)Object.assign(ps,ov);ps.shield=0;drawSnake(ps)}
 catch(e){}finally{ctx=main;W=sw;H=sh;cam.x=cx;cam.y=cy;gameTime=gt}}
function skinFill(sk,s,i,n){const f=i/Math.max(1,n);switch(sk){
 case 'arco':return `hsl(${(i*16)%360},75%,62%)`;case 'neve':return i%4===0?'#f4f8ff':s.color;case 'fogo':return `hsl(${6+f*48},96%,${50+f*10}%)`;case 'gelo':return i%2?'#dff4ff':'#8fd0ff';case 'ouro':return i%2?'#ffd34e':'#e8a417';case 'galaxia':return i%3===0?'#5b3fd0':'#2b1b6b';case 'neon':return '#10131c';
 case 'xadrez':return (i>>1)%2?s.color:'#f4f0ff';case 'camuflagem':return ['#5c7a3a','#3d5226','#8a9a5b','#2b3a1c'][(i*7+(i>>2))%4];case 'tigre':return i%3===2?'#1c1208':'#f08a1c';case 'oceano':return `hsl(${185+f*45},80%,${58-f*22}%)`;case 'doce':return i%2?'#ff8fd0':'#8ff0ff';case 'vulcao':return i%3===1?'#ff6a1a':'#2a1410';case 'ametista':return `hsl(${268+(i%4)*7},68%,${40+(i%4)*7}%)`;case 'cristal':return `hsl(${(200+i*9)%360},70%,${70+(i%3)*4}%)`;case 'aurora':return `hsl(${(i*10+gameTime*70)%360},85%,60%)`;default:return s.color}}
function ratPatch(s,px,py,r,i){const c=RATS[s.rat];if(!c||!c.pat)return;const m=i%6;if(m<2){ctx.fillStyle=c.pat;ctx.beginPath();ctx.arc(px+r*.1,py-r*.05,r*.75,0,6.2832);ctx.fill()}else if(c.pat2&&m<4){ctx.fillStyle=c.pat2;ctx.beginPath();ctx.arc(px,py,r*.7,0,6.2832);ctx.fill()}}
function glowBody(s,seg,R){const n=seg.length;ctx.save();ctx.globalCompositeOperation='lighter';const bo=s.boostActive?1.9:1;for(let i=0;i<n;i+=2){const q=seg[i],x=q.x-cam.x,y=q.y-cam.y;if(x<-70||y<-70||x>W+70||y>H+70)continue;const r=R*(.56+.44*(1-i/Math.max(1,n))),ph=Math.sin(i*.4-gameTime*6);ctx.globalAlpha=(.07+.06*ph)*bo;ctx.fillStyle=s.color;ctx.beginPath();ctx.arc(x,y,r*1.7,0,6.2832);ctx.fill();const sh=Math.sin(i*.5-gameTime*8);if(sh>.55){ctx.globalAlpha=(sh-.55)*.9;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x-r*.28,y-r*.3,r*.28,0,6.2832);ctx.fill()}}ctx.restore()}
function ratPaws(s,seg,R){if(seg.length<8)return;ctx.fillStyle='#00000030';for(const i of [3,6]){const a=seg[i-1],b=seg[i+1],q=seg[i];if(!a||!b)continue;const x=q.x-cam.x,y=q.y-cam.y;if(x<-40||y<-40||x>W+40||y>H+40)continue;const ang=Math.atan2(b.y-a.y,b.x-a.x),r=R*(.56+.44*(1-i/seg.length)),ox=Math.sin(gameTime*14+i*1.7)*r*.4;for(const sy of [-1,1]){const cx=x+Math.cos(ang)*ox+Math.cos(ang+1.5708)*sy*r*.95,cy=y+Math.sin(ang)*ox+Math.sin(ang+1.5708)*sy*r*.95;ctx.beginPath();ctx.ellipse(cx,cy,r*.38,r*.26,ang,0,6.2832);ctx.fill()}}}
function ratX(s,R,c){
 if(c.spiky){ctx.fillStyle=s.color;for(let k=0;k<7;k++){const a=Math.PI*(.62+k*.13),ex=Math.cos(a),ey=Math.sin(a)*.92;ctx.beginPath();ctx.moveTo(ex*R-ey*R*.1,ey*R+ex*R*.1);ctx.lineTo(ex*R*1.42,ey*R*1.42);ctx.lineTo(ex*R+ey*R*.1,ey*R-ex*R*.1);ctx.closePath();ctx.fill()}}
 if(c.gog){ctx.strokeStyle='#4aa3ff';ctx.lineWidth=R*.1;ctx.beginPath();ctx.arc(R*.42,-R*.36,R*.34,0,6.2832);ctx.moveTo(R*.76,R*.36);ctx.arc(R*.42,R*.36,R*.34,0,6.2832);ctx.stroke()}
 if(c.crown){ctx.fillStyle='#ffd23f';ctx.strokeStyle='#b8860b';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-R*.05,-R*.5);ctx.lineTo(-R*.55,-R*.62);ctx.lineTo(-R*.37,-R*.2);ctx.lineTo(-R*.63,0);ctx.lineTo(-R*.37,R*.2);ctx.lineTo(-R*.55,R*.62);ctx.lineTo(-R*.05,R*.5);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#ff4d6d';ctx.beginPath();ctx.arc(-R*.2,0,R*.11,0,6.2832);ctx.fill()}
 if(c.spark){const t=gameTime*3;for(let k=0;k<4;k++){const a=t+k*1.5708,rr=R*(1.5+.15*Math.sin(t*2+k));ctx.globalAlpha=.55+.4*Math.sin(t*3+k);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(Math.cos(a)*rr,Math.sin(a)*rr,R*.1,0,6.2832);ctx.fill()}ctx.globalAlpha=1}}
function ratTail(s){const sg=s.segments,n=sg.length;if(n<2)return;const q=sg[n-1],p=sg[Math.max(0,n-3)],px=q.x-cam.x,py=q.y-cam.y;if(px<-90||py<-90||px>W+90||py>H+90)return;const R=s.radius,ang=Math.atan2(q.y-p.y,q.x-p.x),ca=Math.cos(ang),sa=Math.sin(ang),L=R*5.2,sw=Math.sin(gameTime*5+(s.x||0)*.01)*R*1.1;ctx.strokeStyle='#f2a9bb';ctx.lineCap='round';let lx=px,ly=py;for(let k=1;k<=8;k++){const u=k/8,d=L*u,off=sw*u*u,x=px+ca*d-sa*off,y=py+sa*d+ca*off;ctx.lineWidth=Math.max(1,R*.34*(1-u*.85));ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(x,y);ctx.stroke();lx=x;ly=y}}
function ratHead(s,R){const c=RATS[s.rat]||{ear:'#ffb6c6',nose:'#ff8fa3',eye:'#172033'},col=s.color,wg=Math.sin(gameTime*4+(s.x||0)*.01)*.08,es=c.es||1;if(c.hs){ctx.save();ctx.scale(c.hs,c.hs)}
 // orelhas grandes e redondas, com interior rosa e movimento
 for(const sy of [-1,1]){ctx.fillStyle=c.earc||col;ctx.beginPath();ctx.ellipse(-R*.12,sy*R*.98,R*.66*es,R*.6*es,sy*(-.3+wg),0,6.2832);ctx.fill();
  const eg=ctx.createRadialGradient(-R*.1,sy*R*.98,R*.05,-R*.1,sy*R*.98,R*.45);eg.addColorStop(0,c.ear);eg.addColorStop(1,'#d9748f');ctx.fillStyle=eg;ctx.beginPath();ctx.ellipse(-R*.1,sy*R*.98,R*.42*es,R*.38*es,sy*(-.3+wg),0,6.2832);ctx.fill()}
 // cabeça + focinho
 ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(0,0,R*1.0,R*.92,0,0,6.2832);ctx.fill();
 ctx.beginPath();ctx.moveTo(R*.4,-R*.7);ctx.quadraticCurveTo(R*1.6,-R*.24,R*1.55,0);ctx.quadraticCurveTo(R*1.6,R*.24,R*.4,R*.7);ctx.closePath();ctx.fill();
 if(c.sn){ctx.fillStyle=c.sn;ctx.beginPath();ctx.ellipse(R*1.0,0,R*.55,R*.38,0,0,6.2832);ctx.fill()}
 if(c.pat){ctx.fillStyle=c.pat;ctx.beginPath();ctx.ellipse(-R*.25,-R*.38,R*.42,R*.3,.3,0,6.2832);ctx.fill()}
 // volume do pelo: luz no alto, sombra na borda
 const fg=ctx.createRadialGradient(R*.15,-R*.25,R*.1,0,0,R*1.35);fg.addColorStop(0,'#ffffff40');fg.addColorStop(.6,'#ffffff00');fg.addColorStop(1,'#00000050');ctx.fillStyle=fg;ctx.beginPath();ctx.ellipse(0,0,R*1.0,R*.92,0,0,6.2832);ctx.fill();
 // olhos grandes e brilhantes
 for(const sy of [-1,1]){ctx.fillStyle=c.eye;ctx.beginPath();ctx.arc(R*.42,sy*R*.36,R*.25,0,6.2832);ctx.fill();ctx.fillStyle='#0a0f1c';ctx.beginPath();ctx.arc(R*.46,sy*R*.36,R*.16,0,6.2832);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(R*.5,sy*R*.36-R*.09,R*.08,0,6.2832);ctx.arc(R*.38,sy*R*.36+R*.09,R*.04,0,6.2832);ctx.fill()}
if((gameTime+((s.x||0)*.013%3))%3.4<.12){ctx.fillStyle=col;ctx.beginPath();ctx.arc(R*.44,-R*.36,R*.27,0,6.2832);ctx.arc(R*.44,R*.36,R*.27,0,6.2832);ctx.fill()}
 // nariz rosa com brilho
 ctx.fillStyle=c.nose;ctx.beginPath();ctx.ellipse(R*1.52,0,R*.21,R*.17,0,0,6.2832);ctx.fill();ctx.fillStyle='#ffffff99';ctx.beginPath();ctx.arc(R*1.5,-R*.06,R*.05,0,6.2832);ctx.fill();
 // bigodes longos e curvos
 const w=Math.sin(gameTime*6)*.06*R;ctx.strokeStyle=c.wh||'#ffffffd0';ctx.lineWidth=Math.max(1,R*.06);ctx.lineCap='round';ctx.beginPath();for(const sy of [-1,1])for(const k of [-1,0,1]){ctx.moveTo(R*1.2,sy*R*.12);ctx.quadraticCurveTo(R*1.7,sy*R*(.35+k*.28)+w*sy,R*(1.75+k*.1),sy*R*(.9+k*.4)+w*sy)}ctx.stroke();ratX(s,R,c);if(c.hs)ctx.restore()}
function drawSnake(s){if(!s.alive)return;const seg=s.segments,n=seg.length,R=s.radius;if(s.rat==='lendario')s.color=hslHex((gameTime*70)%360);
 if(s.shield>0&&!(s.shieldP>0))ctx.globalAlpha=.55+.3*Math.sin(gameTime*18);else if(s.special===2)ctx.globalAlpha=.5;if(RATS[s.rat]&&RATS[s.rat].ghost)ctx.globalAlpha=Math.min(ctx.globalAlpha,.7);
 for(let i=n-1;i>=0;i--){const q=seg[i];let px=q.x-cam.x,py=q.y-cam.y;if(px<-40||py<-40||px>W+40||py>H+40)continue;const r=R*(.56+.44*(1-i/Math.max(1,n)));if(i>0&&i<n-1){const a=seg[i+1],b=seg[i-1],an=Math.atan2(b.y-a.y,b.x-a.x)+1.5708,w=Math.sin(i*.55-gameTime*7)*r*.14;px+=Math.cos(an)*w;py+=Math.sin(an)*w}
  const sk=s.skin;if(sk==='neon'){ctx.fillStyle=s.color+'33';ctx.beginPath();ctx.arc(px,py,r*1.55,0,6.2832);ctx.fill()}
  ctx.fillStyle=skinFill(sk,s,i,n);ctx.beginPath();ctx.arc(px,py,r,0,6.2832);ctx.fill();ratPatch(s,px,py,r,i);
  if(sk==='neon'){ctx.strokeStyle=s.color;ctx.lineWidth=2.2;ctx.beginPath();ctx.arc(px,py,r*.86,0,6.2832);ctx.stroke()}
  if(sk==='galaxia'&&i%2===0){ctx.fillStyle='#ffffffcc';ctx.beginPath();ctx.arc(px+r*.3,py-r*.25,r*.14,0,6.2832);ctx.arc(px-r*.35,py+r*.3,r*.1,0,6.2832);ctx.fill()}
  if(sk==='cristal'&&i%3===0){ctx.fillStyle='#ffffffdd';ctx.beginPath();ctx.arc(px-r*.25,py-r*.3,r*.18,0,6.2832);ctx.fill()}if(sk==='vulcao'&&i%3===1){ctx.fillStyle='#ffd34e99';ctx.beginPath();ctx.arc(px,py,r*.4,0,6.2832);ctx.fill()}if(sk==='aurora'){ctx.fillStyle='#ffffff30';ctx.beginPath();ctx.arc(px-r*.2,py-r*.25,r*.3,0,6.2832);ctx.fill()}
  if(sk==='listras'&&i%3===0){ctx.fillStyle='#0000002e';ctx.beginPath();ctx.arc(px,py,r,0,6.2832);ctx.fill()}
  ctx.fillStyle='#ffffff25';ctx.beginPath();ctx.arc(px-r*.22,py-r*.28,r*.52,0,6.2832);ctx.fill();
  if(sk==='pontos'&&i%2===0){ctx.fillStyle='#ffffffc0';ctx.beginPath();ctx.arc(px,py,r*.22,0,6.2832);ctx.fill()}}
 glowBody(s,seg,R);ratPaws(s,seg,R);tailDraw(s);const hx=s.x-cam.x,hy=s.y-cam.y;if(hx<-60||hy<-60||hx>W+60||hy>H+60){ctx.globalAlpha=1;return}
 ctx.save();ctx.translate(hx,hy);ctx.rotate(s.angle);ctx.save();ctx.rotate(Math.sin(gameTime*6+(s.x||0)*.02)*.05);ctx.scale(1.3,1.3);ratHead(s,R);ctx.restore();
 if(s.boostT>0||s.boostActive){ctx.strokeStyle='#46e6ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,R*1.5,0,6.2832);ctx.stroke()}
 if(mode==='team'){const t=tm(s);ctx.strokeStyle=t?'#ff5d73':'#4da3ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,R*1.35,0,6.2832);ctx.stroke()}
 if(s.boss&&s.phase==='aim'){ctx.save();ctx.rotate(s.dashAng-s.angle);ctx.fillStyle='#ff5d7355';ctx.fillRect(0,-R*.7,760,R*1.4);ctx.restore()}
 if(s.boss&&s.stun>0){ctx.strokeStyle='#ffe477';ctx.setLineDash([6,5]);ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,R*1.5,0,6.2832);ctx.stroke();ctx.setLineDash([])}
 if(s.rival){ctx.strokeStyle='#ff5d73';ctx.lineWidth=2.5;ctx.setLineDash([5,4]);ctx.beginPath();ctx.arc(0,0,R*2.1,0,6.2832);ctx.stroke();ctx.setLineDash([])}
 if(s.special){ctx.strokeStyle=s.color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,R*1.65,0,6.2832);ctx.stroke()}
 if(s.shieldP>0){ctx.strokeStyle='#5ad1ffcc';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,R*1.9,0,6.2832);ctx.stroke()}
 if(s===player){ctx.strokeStyle='#ffffff66';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,R*1.25,0,6.2832);ctx.stroke()}
 ctx.restore();ctx.globalAlpha=1;
 accDraw(s,hx,hy,R);ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#0a0f1caa';const label=(s===leader?'👑 ':'')+(s.rival?'🎯 ':'')+(s.arch?ARCH[s.arch].i+' ':'')+s.name;ctx.strokeText(label,hx,hy-R-14);ctx.fillStyle='#f4f7ff';ctx.fillText(label,hx,hy-R-14)}
function drawArena(wx,wy){drawSecrets(wx,wy);if(B.k>0){ctx.fillStyle='rgba(255,50,90,.30)';ctx.beginPath();ctx.rect(wx,wy,worldW,worldH);ctx.rect(wx+B.x0,wy+B.y0,B.x1-B.x0,B.y1-B.y0);ctx.fill('evenodd');ctx.strokeStyle='#ff3b5c';ctx.lineWidth=5;ctx.strokeRect(wx+B.x0,wy+B.y0,B.x1-B.x0,B.y1-B.y0)}
 for(const o of OBS){const x=wx+o.x,y=wy+o.y;if(x>W||y>H||x+o.w<0||y+o.h<0)continue;if(o.k){ctx.fillStyle='rgba(255,60,60,.38)';ctx.fillRect(x,y,o.w,o.h);ctx.strokeStyle='#ff5a5a';ctx.lineWidth=3;ctx.setLineDash([12,8]);ctx.strokeRect(x,y,o.w,o.h);ctx.setLineDash([])}else{ctx.fillStyle='#4b3f7a';ctx.fillRect(x,y,o.w,o.h);ctx.strokeStyle='#b8a6ff';ctx.lineWidth=4;ctx.strokeRect(x,y,o.w,o.h)}}}
function bossBar(t){if(mode!=='boss'||!boss||!boss.alive||!running)return;const b=boss,w=Math.min(W*.6,380),x=(W-w)/2,y=58,hp=Math.max(0,b.hp)/100;ctx.save();ctx.fillStyle='#0a0f1ccc';ctx.fillRect(x-4,y-4,w+8,26);ctx.fillStyle='#3a1320';ctx.fillRect(x,y,w,18);const g=ctx.createLinearGradient(x,0,x+w,0);g.addColorStop(0,'#ff5d73');g.addColorStop(1,'#ffb347');ctx.fillStyle=(b.flash>0&&((t*30)|0)%2)?'#ffffff':g;ctx.fillRect(x,y,w*hp,18);ctx.strokeStyle='#ffffffaa';ctx.lineWidth=2;ctx.strokeRect(x,y,w,18);ctx.font='bold 12px system-ui,sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText('👹 '+(b.name||'Rei Rato')+'  '+Math.max(0,Math.round(b.hp))+'%'+(wbRun&&wbOpen()?' • fecha em '+fmtHM(WB_START[wbSlot()]+WB_LEN-wbMin()):''),W/2,y+13);
 if(b.stun>0){ctx.fillStyle=((t*4)|0)%2?'#ffe477':'#fff';ctx.font='bold 14px system-ui,sans-serif';ctx.fillText('ATORDOADO! Passe pela cabeça dele ('+Math.ceil(b.stun)+'s)',W/2,y+44);const bx=b.x-cam.x,by=b.y-cam.y;ctx.strokeStyle='#ffe47799';ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.beginPath();ctx.arc(bx,by,b.radius+(player?player.radius:10)+46,0,6.2832);ctx.stroke();ctx.setLineDash([])}ctx.restore()}
function edgeWarn(t){if(!CFG.solidWalls||!running||!player||!player.alive)return;const Z=240,k=.6+.4*Math.sin(t*8),wx=-cam.x,wy=-cam.y;
 const band=(x0,y0,x1,y1,rx,ry,rw,rh,d)=>{const g=ctx.createLinearGradient(x0,y0,x1,y1),a=(1-Math.max(0,d)/Z)*.5*k;g.addColorStop(0,`rgba(255,93,115,${a})`);g.addColorStop(1,'rgba(255,93,115,0)');ctx.fillStyle=g;ctx.fillRect(rx,ry,rw,rh)};
 if(player.x<Z)band(wx,0,wx+Z,0,wx,0,Z,H,player.x);if(worldW-player.x<Z)band(wx+worldW,0,wx+worldW-Z,0,wx+worldW-Z,0,Z,H,worldW-player.x);
 if(player.y<Z)band(0,wy,0,wy+Z,0,wy,W,Z,player.y);if(worldH-player.y<Z)band(0,wy+worldH,0,wy+worldH-Z,0,wy+worldH-Z,W,Z,worldH-player.y)}
function drawMini(){if(!(running&&player))return;const w=mm.width,h=mm.height,sx=w/worldW,sy=h/worldH;mmc.clearRect(0,0,w,h);mmc.fillStyle='#0a0f1ccc';mmc.fillRect(0,0,w,h);
 for(const f of foods)if(f.type>=2){mmc.fillStyle=f.color;mmc.fillRect(f.x*sx-1,f.y*sy-1,3,3)}
 for(const b of bots)if(b.alive){mmc.fillStyle=b.color;{const z=b.special?5:2.5;mmc.fillRect(b.x*sx-z/2,b.y*sy-z/2,z,z)}}
 mmc.strokeStyle='#ffffff66';mmc.strokeRect(cam.x*sx,cam.y*sy,W*sx,H*sy);if(player.alive){mmc.fillStyle='#fff';mmc.beginPath();mmc.arc(player.x*sx,player.y*sy,3,0,6.2832);mmc.fill()}}
function draw(t){background();drawFood(t);for(const b of bots)drawSnake(b);if(player)drawSnake(player);
 for(const p of particles){ctx.globalAlpha=clamp(p.life/p.max,0,1);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x-cam.x,p.y-cam.y,p.r,0,6.2832);ctx.fill()}ctx.globalAlpha=1;
 if(dyingT>0&&lastKiller&&lastKiller.alive){const kx=lastKiller.x-cam.x,ky=lastKiller.y-cam.y;ctx.strokeStyle='#ff5d73';ctx.lineWidth=3;ctx.beginPath();ctx.arc(kx,ky,26+4*Math.sin(t*14),0,6.2832);ctx.stroke()}
 edgeWarn(t);indicators(t);bossBar(t);if((mmN=(mmN+1)%3)===0)drawMini();
 if(prefs.ctl==='joystick'&&running&&!paused&&!resumeCountdown&&!pointer.down){const c=stickCenter();ctx.strokeStyle='#ffffff30';ctx.lineWidth=2;ctx.beginPath();ctx.arc(c.x,c.y,CFG.stickMax,0,6.2832);ctx.stroke()}
 if(pointer.active&&running&&!paused&&!resumeCountdown){ctx.strokeStyle='#ffffff40';ctx.lineWidth=2;ctx.beginPath();ctx.arc(pointer.ax,pointer.ay,CFG.stickMax,0,6.2832);ctx.stroke();ctx.fillStyle='#ffffff66';ctx.beginPath();ctx.arc(pointer.x,pointer.y,13,0,6.2832);ctx.fill()}}
function frame(now){const act=(running&&(!paused||mpOnline))||olDeathActive;const interval=act?1000/60:1000/30;if(now-last<interval){requestAnimationFrame(frame);return}
 const dt=Math.min(.05,(now-last)/1000||0);last=now;update(dt);draw(now/1000);autoQ(dt,act);requestAnimationFrame(frame)}

