
'use strict';
(function(){
 const API='https://ratopolis-radio-stream.juniorgmj69.workers.dev';
 try{radioTracks=[];radioLibraryLoaded=true;window.setRadioTrack=function(){}}catch(e){}
 const audio=document.getElementById('radioAudio');
 const play=document.getElementById('radioPlay');
 const label=document.getElementById('radioTrack');
 if(!audio||!play||!label)return;
 let currentState=null,userWantsPlayback=false,livePc=null,liveAudio=null,liveSession=null,listenerId='';
 try{listenerId=localStorage.getItem('rativa_radio_listener_id')||'';if(!listenerId){listenerId='listener_'+Math.random().toString(36).slice(2,14);localStorage.setItem('rativa_radio_listener_id',listenerId)}}catch(e){listenerId='listener_'+Math.random().toString(36).slice(2,14)}
 function request(path,method='GET',body=null){const headers={'Accept':'application/json'};if(body!==null)headers['Content-Type']='application/json';return fetch(API+path,{method,headers,body:body===null?undefined:JSON.stringify(body),cache:'no-store'}).then(async r=>{const d=await r.json().catch(()=>({}));if(!r.ok||d.ok===false)throw new Error(d.error||('HTTP '+r.status));return d})}
 function liveNode(){if(!liveAudio){liveAudio=document.createElement('audio');liveAudio.autoplay=false;liveAudio.playsInline=true;liveAudio.style.display='none';document.body.append(liveAudio);liveAudio.volume=Number(document.getElementById('radioVolume')?.value||.7)}return liveAudio}
 async function subscribeLive(){
  if(livePc)return;
  const offer=await request('/api/live/subscribe','POST',{});
  const pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.cloudflare.com:3478'}]});
  livePc=pc;liveSession=offer.sessionId;
  pc.ontrack=e=>{const node=liveNode();node.srcObject=e.streams[0]||new MediaStream([e.track]);node.play().then(()=>{play.textContent='Ⅱ'}).catch(()=>{play.textContent='▶';label.textContent='Locução ao vivo · toque para ouvir'})};
  await pc.setRemoteDescription(offer.sessionDescription);
  const answer=await pc.createAnswer();await pc.setLocalDescription(answer);
  await new Promise((resolve,reject)=>{if(pc.iceGatheringState==='complete')return resolve();const timeout=setTimeout(()=>reject(new Error('Tempo esgotado ao conectar à locução.')),15000);pc.addEventListener('icegatheringstatechange',()=>{if(pc.iceGatheringState==='complete'){clearTimeout(timeout);resolve()}})});
  await request('/api/live/subscribe/complete','POST',{sessionId:liveSession,sessionDescription:pc.localDescription});
 }
 function closeLive(){if(livePc){livePc.close();livePc=null}liveSession=null;if(liveAudio){liveAudio.pause();liveAudio.srcObject=null}}
 async function syncState(force=false){
  try{
   const [d,l]=await Promise.all([request('/api/on-air'),request('/api/live/status')]);
   const state=d.state||{active:false},live=l.live||{active:false};
   if(live.active){
    label.textContent=(live.title||'Locução ao vivo')+' · AO VIVO';
    if(userWantsPlayback){await subscribeLive();await liveNode().play().catch(()=>{})}
    return;
   }
   if(livePc)closeLive();
   if(!state.active||!state.key){label.textContent='Aguardando programação da Rádio Ratópolis';play.disabled=true;return}
   play.disabled=false;
   const changed=force||!currentState||currentState.key!==state.key||currentState.startedAt!==state.startedAt||currentState.isAd!==state.isAd;
   currentState=state;
   label.textContent=(state.isAd?'📢 Anúncio · ':'')+(state.name||state.key);
   if(changed){
    audio.src=API+'/audio/'+encodeURIComponent(state.key);
    audio.load();
    audio.addEventListener('loadedmetadata',function seekOnce(){
     audio.removeEventListener('loadedmetadata',seekOnce);
     const pos=state.paused?Number(state.pausedPositionMs||0):Math.max(0,Date.now()-Number(state.startedAt||Date.now()));
     try{if(Number.isFinite(audio.duration)&&audio.duration>0)audio.currentTime=Math.min(pos/1000,Math.max(0,audio.duration-1))}catch(e){}
     if(userWantsPlayback&&!state.paused)audio.play().then(()=>play.textContent='Ⅱ').catch(()=>play.textContent='▶');
    });
   }
   if(state.paused){audio.pause();play.textContent='▶'}
   else if(userWantsPlayback&&audio.paused){audio.play().then(()=>play.textContent='Ⅱ').catch(()=>play.textContent='▶')}
  }catch(e){label.textContent='Rádio temporariamente indisponível';console.warn('Rádio Ratópolis:',e.message)}
 }
 async function toggle(){
  userWantsPlayback=!userWantsPlayback;
  if(!userWantsPlayback){audio.pause();if(liveAudio)liveAudio.pause();play.textContent='▶';return}
  try{
   const l=await request('/api/live/status');
   if(l.live?.active){await subscribeLive();await liveNode().play();play.textContent='Ⅱ';return}
   await syncState(true);
   if(audio.src)await audio.play();
   play.textContent='Ⅱ';
  }catch(e){userWantsPlayback=false;play.textContent='▶';label.textContent='Não foi possível iniciar o áudio · tente novamente';console.warn(e.message)}
 }
 play.onclick=toggle;
 audio.addEventListener('ended',async()=>{
  try{await request('/api/playlist/advance','POST',{key:currentState?.key,startedAt:currentState?.startedAt})}catch(e){}
  await syncState(true);
 });
 document.getElementById('radioVolume')?.addEventListener('input',e=>{audio.volume=Number(e.target.value);if(liveAudio)liveAudio.volume=audio.volume});
 async function heartbeat(){try{await request('/api/listeners/heartbeat','POST',{id:listenerId})}catch(e){}}
 syncState(true);setInterval(()=>syncState(false),5000);heartbeat();setInterval(heartbeat,30000);
})();
