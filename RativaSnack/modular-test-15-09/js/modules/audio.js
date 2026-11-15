/* Fragmento preservado do JavaScript original. Não carregar isoladamente; usar build.mjs. */
/* ============ Áudio (WebAudio, só após toque do usuário) ============ */
let ac=null,sfxG=null,musG=null,musTimer=0,nextT=0,mStep=0,lastEatSfx=0;
function ensureAudio(){try{if(ac){if(ac.state==='suspended')ac.resume();return}const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;ac=new AC();sfxG=ac.createGain();musG=ac.createGain();sfxG.connect(ac.destination);musG.connect(ac.destination);applyVolumes()}catch(e){ac=null}}
function applyVolumes(){if(!ac)return;sfxG.gain.value=prefs.sfx?.9:0;musG.gain.value=prefs.music?.35:0}
function tone(f,dur,type,vol,slide,delay,dest){if(!ac)return;try{const t=ac.currentTime+(delay||0),o=ac.createOscillator(),g=ac.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f*slide),t+dur);g.gain.setValueAtTime((vol||.2)*VOLM[prefs.vol],t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(dest||sfxG);o.start(t);o.stop(t+dur+.03)}catch(e){}}
function sfx(n){if(!ac||!prefs.sfx)return;switch(n){
 case'eat':{const t=performance.now();if(t-lastEatSfx<70)return;lastEatSfx=t;tone(520+Math.random()*120,.07,'triangle',.12,1.5);break}
 case'bonus':tone(520,.1,'square',.12,1.6);tone(780,.14,'square',.12,1.5,.09);break;
 case'kill':tone(300,.12,'sawtooth',.16,2);tone(600,.2,'square',.12,1.6,.1);break;
 case'death':tone(380,.5,'sawtooth',.2,.25);break;
 case'record':[523,659,784,1046].forEach((f,i)=>tone(f,.16,'triangle',.18,1,i*.1));break;
 case'win':[392,523,659,784,1046].forEach((f,i)=>tone(f,.18,'triangle',.18,1,i*.09));break;
 case'start':tone(330,.1,'triangle',.15,1.4);tone(494,.14,'triangle',.15,1.4,.1);break;
 case'tick':tone(660,.05,'square',.08,1);break}}
const PENT=[0,3,5,7,10,12],BASS=[0,0,-5,-5,-3,-3,-5,-5];
function musicTick(){if(!ac)return;while(nextT<ac.currentTime+.3){const t=nextT,b=.3,st=mStep++;try{tone(110*Math.pow(2,BASS[st%8]/12),b*.9,'triangle',.22,1,t-ac.currentTime,musG);if(st%2===0)tone(330*Math.pow(2,PENT[(st*5+(st>>3))%6]/12),b*.8,'sine',.1,1,t-ac.currentTime,musG)}catch(e){}nextT+=b}}
function syncMusic(){const want=!!(ac&&prefs.music&&running&&!paused&&!document.hidden&&dyingT<=0);if(want&&!musTimer){nextT=ac.currentTime+.05;musTimer=setInterval(musicTick,120)}else if(!want&&musTimer){clearInterval(musTimer);musTimer=0}}

