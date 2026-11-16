
'use strict';
let radioPlaylistTracks=[],radioAdTracks=[],radioPrograms=[];
let publisherPc=null,publisherStream=null,publisherSession=null,publisherLease=null,publisherHeartbeat=null;
async function radioApi(path,method='GET',body=null){
 const headers={Accept:'application/json'};
 if(token)headers.Authorization='Bearer '+token;
 if(body!==null)headers['Content-Type']='application/json';
 const r=await fetch(RADIO_API+path,{method,headers,body:body===null?undefined:JSON.stringify(body),cache:'no-store'});
 const d=await r.json().catch(()=>({}));
 if(!r.ok||d.ok===false)throw new Error(d.message||d.error||('HTTP '+r.status));
 return d;
}
async function ensureTrackDurations(){
 const missing=(cloudTracks||[]).filter(t=>!(Number(t.durationMs)>0));
 for(let i=0;i<missing.length;i+=3){
  await Promise.all(missing.slice(i,i+3).map(async t=>{
   try{
    const ms=await new Promise(resolve=>{const a=new Audio();a.preload='metadata';a.onloadedmetadata=()=>resolve(Number.isFinite(a.duration)?Math.round(a.duration*1000):0);a.onerror=()=>resolve(0);a.src=RADIO_API+'/audio/'+encodeURIComponent(t.key)});
    if(ms>0){await radioApi('/api/tracks/'+encodeURIComponent(t.key),'PATCH',{durationMs:ms});t.durationMs=ms}
   }catch(e){console.warn('Duração não identificada para '+t.name,e.message)}
  }));
 }
}
function renderSharedList(boxId,items,type){
 const box=$(boxId);box.replaceChildren();
 if(!items.length){box.innerHTML='<div class="empty">Nenhum item cadastrado no servidor.</div>';return}
 items.forEach((item,i)=>{
  const row=document.createElement('div');row.className='track';
  const n=document.createElement('span');n.className='num';n.textContent=(i+1)+'.';
  const name=document.createElement('span');name.className='name';name.textContent=item.name||item.key;
  const play=document.createElement('button');play.className='btn';play.textContent='▶ Ouvir';
  play.onclick=()=>{$('preview').src=RADIO_API+'/audio/'+encodeURIComponent(item.key);$('preview').play().catch(()=>{});$('nowName').textContent=item.name||item.key;$('nowType').textContent=type==='ad'?'Prévia · anúncio':'Prévia · playlist musical'};
  const del=document.createElement('button');del.className='btn danger';del.textContent='Remover';
  del.onclick=()=>{if(type==='ad')radioAdTracks.splice(i,1);else radioPlaylistTracks.splice(i,1);renderSharedRadioLists()};
  row.append(n,name,play,del);box.append(row);
 });
}
function renderSharedRadioLists(){
 $('musicCount').textContent=radioPlaylistTracks.length+' faixas';
 $('adCount').textContent=radioAdTracks.length+' anúncios';
 renderSharedList('musicList',radioPlaylistTracks,'music');
 renderSharedList('adList',radioAdTracks,'ad');
}
async function loadRadioConfig(){
 $('sharedPlaylistStatus').textContent='Sincronizando com o servidor…';
 try{
  const result=await Promise.all([radioApi('/api/tracks'),radioApi('/api/playlist'),radioApi('/api/ads'),radioApi('/api/programs')]);
  cloudTracks=result[0].tracks||[];
  await ensureTrackDurations();
  radioPlaylistTracks=(result[1].playlist?.tracks||[]).map(t=>({...t,durationMs:Number(t.durationMs)||Number(cloudTracks.find(x=>x.key===t.key)?.durationMs)||0}));
  radioAdTracks=result[2].ads?.tracks||[];
  radioPrograms=result[3].programs||[];
  $('cloudCount').textContent=cloudTracks.length+' arquivos';
  $('adsEnabled').checked=result[2].ads?.enabled===true;
  $('adInterval').value=result[2].ads?.intervalMinutes||30;
  renderCloudTracks();renderSharedRadioLists();
  if(radioPrograms.length){
   const p=radioPrograms[0];$('programName').value=p.name||'';$('programStart').value=p.start||'';$('programEnd').value=p.end||'';$('programDays').value=(p.days||[]).join(',');
   $('programStatus').textContent=p.name+' · '+p.start+'–'+p.end;
  }else $('programStatus').textContent='Sem programa específico; playlist geral mantém a rádio contínua.';
  $('sharedPlaylistStatus').textContent='Playlist, anúncios e programação carregados do servidor.';
 }catch(e){$('sharedPlaylistStatus').textContent='Falha ao sincronizar: '+e.message;toast('Falha ao carregar configurações: '+e.message)}
}
async function saveSharedPlaylist(){
 try{
  await ensureTrackDurations();
  radioPlaylistTracks=radioPlaylistTracks.map(t=>({...t,durationMs:Number(t.durationMs)||Number(cloudTracks.find(x=>x.key===t.key)?.durationMs)||0}));
  if(!radioPlaylistTracks.length)radioPlaylistTracks=(cloudTracks||[]).map(t=>({key:t.key,name:t.name,durationMs:Number(t.durationMs||0)}));
  if(!radioPlaylistTracks.length)throw new Error('Envie músicas para a biblioteca antes de criar a playlist.');
  const d=await radioApi('/api/playlist','POST',{tracks:radioPlaylistTracks});
  radioPlaylistTracks=d.playlist?.tracks||radioPlaylistTracks;renderSharedRadioLists();
  $('sharedPlaylistStatus').textContent='Playlist compartilhada salva. Esta fila é usada como programação geral 24 horas.';
  toast('Playlist central atualizada.');
 }catch(e){toast('Falha ao salvar playlist: '+e.message)}
}
async function uploadAdFiles(ev){
 const files=[...ev.target.files];ev.target.value='';if(!files.length)return;
 for(const file of files){
  if(!file.type.startsWith('audio/'))continue;
  try{
   $('uploadStatus').textContent='Enviando anúncio: '+file.name;
   const r=await fetch(RADIO_API+'/api/upload?name='+encodeURIComponent(file.name),{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':file.type||'application/octet-stream'},body:file});
   const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.error||'Falha no upload');
   const durationMs=await new Promise(resolve=>{
    const a=new Audio();a.preload='metadata';
    a.onloadedmetadata=()=>{const ms=Number.isFinite(a.duration)?Math.round(a.duration*1000):0;URL.revokeObjectURL(a.src);resolve(ms)};
    a.onerror=()=>resolve(0);a.src=URL.createObjectURL(file);
   });
   if(!durationMs)throw new Error('Não foi possível ler a duração. O arquivo foi enviado, mas não entrou na fila.');
   radioAdTracks.push({key:d.track.key,name:d.track.name,durationMs});
  }catch(e){toast(file.name+': '+e.message)}
 }
 renderSharedRadioLists();$('uploadStatus').textContent='Upload concluído. Salve a fila no servidor.';
}
async function saveSharedAds(){
 try{
  const interval=Math.max(5,Math.min(240,Number($('adInterval').value)||30));
  const d=await radioApi('/api/ads','POST',{enabled:$('adsEnabled').checked,intervalMinutes:interval,tracks:radioAdTracks});
  radioAdTracks=d.ads?.tracks||radioAdTracks;renderSharedRadioLists();
  $('settingsStatus').textContent='Anúncios sincronizados com o servidor';toast('Fila de anúncios salva.');
 }catch(e){toast('Falha ao salvar anúncios: '+e.message)}
}
async function saveProgram(){
 const name=$('programName').value.trim(),start=$('programStart').value.trim(),end=$('programEnd').value.trim();
 const days=[...new Set(($('programDays').value||'').split(',').map(x=>Number(x.trim())).filter(x=>Number.isInteger(x)&&x>=0&&x<=6))];
 if(!name||!/^([01]\d|2[0-3]):[0-5]\d$/.test(start)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(end)||start>=end||!days.length){toast('Confira nome, horários e dias do programa.');return}
 try{
  const tracks=radioPlaylistTracks.length?radioPlaylistTracks:cloudTracks.map(t=>({key:t.key,name:t.name,durationMs:Number(t.durationMs||0)}));
  if(!tracks.length)throw new Error('A playlist musical está vazia.');
  const programId=radioPrograms[0]?.id||('program_'+Date.now());
  const nextProgram={id:programId,name,start,end,days,tracks,repeatMode:'playlist',enabled:true};
  const nextPrograms=radioPrograms.filter(p=>p.id!==programId).concat(nextProgram);
  const d=await radioApi('/api/programs','POST',{programs:nextPrograms});
  radioPrograms=d.programs||[];$('programStatus').textContent=name+' · '+start+'–'+end+' · salvo no servidor';toast('Programação salva no servidor.');
 }catch(e){toast('Falha ao salvar programação: '+e.message)}
}
async function startLive(){
 if(publisherPc){toast('A transmissão já está ativa neste painel.');return}
 try{
  if(!navigator.mediaDevices?.getUserMedia)throw new Error('Este navegador não oferece acesso ao microfone.');
  $('liveDescription').textContent='Solicitando permissão para usar o microfone…';
  publisherStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});
  publisherPc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.cloudflare.com:3478'}]});
  publisherStream.getTracks().forEach(track=>publisherPc.addTrack(track,publisherStream));
  const offer=await publisherPc.createOffer();await publisherPc.setLocalDescription(offer);
  await new Promise((resolve,reject)=>{
   if(publisherPc.iceGatheringState==='complete')return resolve();
   const timeout=setTimeout(()=>reject(new Error('Tempo esgotado ao preparar WebRTC.')),18000);
   publisherPc.addEventListener('icegatheringstatechange',()=>{if(publisherPc.iceGatheringState==='complete'){clearTimeout(timeout);resolve()}});
  });
  const audioTransceiver=publisherPc.getTransceivers().find(t=>t.sender.track?.kind==='audio');
  if(!audioTransceiver?.mid)throw new Error('Faixa de áudio WebRTC não identificada.');
  const pub=await radioApi('/api/live/publish','POST',{sessionDescription:publisherPc.localDescription,mid:audioTransceiver.mid});
  publisherSession=pub.sessionId;publisherLease=pub.leaseId;
  await publisherPc.setRemoteDescription(pub.sessionDescription);
  await radioApi('/api/live/publish/complete','POST',{sessionId:publisherSession,leaseId:publisherLease,title:$('liveTitleInput').value.trim()||'Locução ao vivo'});
  publisherHeartbeat=setInterval(async()=>{
   try{await radioApi('/api/live/heartbeat','POST',{sessionId:publisherSession,leaseId:publisherLease})}
   catch(e){$('liveDescription').textContent='A conexão caiu: '+e.message;await stopLive()}
  },20000);
  $('liveDot').className='dot green';$('liveState').textContent='Transmitindo ao vivo';$('liveTitle').textContent='RÁDIO AO VIVO';
  $('liveDescription').textContent='Microfone conectado ao servidor. Mantenha esta página aberta durante a locução.';
  $('goLive').disabled=true;$('endLive').disabled=false;toast('Transmissão ao vivo iniciada.');
 }catch(e){
  if(publisherPc){publisherPc.close();publisherPc=null}
  if(publisherStream){publisherStream.getTracks().forEach(t=>t.stop());publisherStream=null}
  publisherSession=null;publisherLease=null;$('liveDescription').textContent='Não foi possível iniciar: '+e.message;toast('Falha ao iniciar: '+e.message);
 }
}
async function stopLive(){
 clearInterval(publisherHeartbeat);publisherHeartbeat=null;const lease=publisherLease;
 if(publisherPc){publisherPc.close();publisherPc=null}
 if(publisherStream){publisherStream.getTracks().forEach(t=>t.stop());publisherStream=null}
 publisherSession=null;publisherLease=null;
 try{if(lease)await radioApi('/api/live/stop','POST',{leaseId:lease})}catch(e){toast('Microfone encerrado localmente; servidor verificará a queda em até 75 segundos.')}
 $('liveDot').className='dot';$('liveState').textContent='Fora do ar';$('liveTitle').textContent='A RÁDIO ESTÁ OFFLINE';
 $('liveDescription').textContent='Transmissão encerrada.';$('endLive').disabled=true;$('goLive').disabled=false;
}
window.saveSettings=async function(){
 const name=$('stationName').value.trim()||'Rádio Ratópolis';
 try{localStorage.setItem('radio_settings',JSON.stringify({name,interval:Math.max(5,Math.min(240,Number($('adInterval').value)||30))}));await saveSharedAds();$('settingsStatus').textContent='Intervalo dos anúncios salvo no servidor; nome salvo neste dispositivo.'}
 catch(e){toast('Falha ao salvar preferências: '+e.message)}
};
const oldCloudUpload=window.uploadCloudFiles;
window.uploadCloudFiles=async function(ev){
 const before=new Set((cloudTracks||[]).map(t=>t.key));
 await oldCloudUpload(ev);
 try{
  const fresh=await radioApi('/api/tracks');
  for(const t of (fresh.tracks||[])){
   if(before.has(t.key)||Number(t.durationMs)>0)continue;
   const ms=await new Promise(resolve=>{
    const a=new Audio();a.preload='metadata';
    a.onloadedmetadata=()=>{const n=Number.isFinite(a.duration)?Math.round(a.duration*1000):0;resolve(n)};
    a.onerror=()=>resolve(0);a.src=RADIO_API+'/audio/'+encodeURIComponent(t.key);
   });
   if(ms>0)await radioApi('/api/tracks/'+encodeURIComponent(t.key),'PATCH',{durationMs:ms});
  }
 }catch(e){console.warn('Não foi possível registrar duração de todas as músicas:',e.message)}
 await loadRadioConfig();
};
const oldCheckAccess=window.checkAccess;
window.checkAccess=async function(){const ok=await oldCheckAccess();if(ok)await loadRadioConfig();return ok};
