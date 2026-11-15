/* Fragmento preservado do JavaScript original. Não carregar isoladamente; usar build.mjs. */
/* ============ Configuração ============ */
// solidWalls=false restaura o comportamento antigo (mapa que dá a volta).
const CFG={solidWalls:true,stickMax:54,stickDead:8,boostMax:1.6,boostRecharge:5,boostDelay:.6,boostMin:.25,boostMult:1.5,camMargin:60,seg:12,maxLen:320,particleCap:150,foodCap:480,spawnShield:1.2,killPts:50,challengeKillPts:100};
const TOASTS={2:'⚡ Velocidade por 7 s!',3:'🌱 Crescimento dobrado por 10 s!',4:'🧲 Ímã de comida por 8 s!',5:'🛡️ Escudo por 5 s!',6:'×2 Pontos em dobro por 10 s!'},FOODICON={2:'⚡',3:'🌱',4:'🧲',5:'🛡️',6:'×2',7:'👑',8:'🦏'};
const COLORS=['#ff6b8b','#8d7cff','#ff9f43','#4dd8bd','#f16be0','#68b8ff','#c4e65a','#ff765e'];
const PLAYER_COLORS=['#63e5a8','#ffe477','#ffffff','#5ad1ff','#b7ff5a','#ff9ad5','#c9a7ff','#ffb27a','#ff7a7a','#7af0ff','#ffd1a3','#a0ff9f'];
const RAR={comum:['Comum','#9fb4cf'],rara:['Rara','#5ad1ff'],epica:['Épica','#c77dff'],lendaria:['Lendária','#ffd34e']};
// Catálogo da loja: id:[nome, preço em queijos, raridade, {lv:nível} (exclusivo por nível, não se compra)]
const CAT={
 skin:{liso:['Liso',0,'comum'],listras:['Listras',150,'comum'],pontos:['Pontilhado',150,'comum'],xadrez:['Xadrez',200,'comum'],camuflagem:['Camuflagem',250,'comum'],neve:['Neve',350,'rara'],gelo:['Gelo',400,'rara'],tigre:['Tigre',450,'rara'],oceano:['Oceano',500,'rara'],fogo:['Fogo',600,'epica'],doce:['Algodão-doce',650,'epica'],arco:['Arco-íris',700,'epica'],vulcao:['Vulcão',800,'epica'],neon:['Neon',900,'epica'],ametista:['Ametista',950,'epica'],galaxia:['Galáxia',1200,'lendaria'],cristal:['Cristal',1100,'lendaria'],aurora:['Aurora (animada)',1500,'lendaria'],ouro:['Ouro',0,'lendaria',{lv:15}]},
 acc:{nenhum:['Nenhum',0,'comum'],laco:['Laço',100,'comum'],festa:['Chapéu de festa',120,'comum'],oculos:['Óculos escuros',150,'comum'],chef:['Chapéu de chef',220,'comum'],cartola:['Cartola',250,'rara'],cowboy:['Chapéu de cowboy',300,'rara'],chifres:['Chifrinhos',450,'epica'],coroa:['Coroa',600,'epica'],halo:['Auréola',0,'lendaria',{lv:8}]},
 tail:{normal:['Normal',0,'comum'],pompom:['Pompom',100,'comum'],flor:['Flor',200,'comum'],estrela:['Estrela',350,'rara'],coracao:['Coração',400,'rara'],chama:['Chama',500,'epica']}};
const nm=c=>Object.fromEntries(Object.keys(CAT[c]).map(k=>[k,CAT[c][k][0]]));
const SKINS=nm('skin'),ACCS=nm('acc'),TAILS=nm('tail');
const FACES={normal:'Normal',bravo:'Bravo',feliz:'Feliz',fofo:'Fofo'};
try{for(const k of ['ratoSnackProg','ratoSnackProg.bak']){const q=JSON.parse(localStorage.getItem(k)||'null');if(q&&q.dFace===1){FACES.real='Real 👑';break}}}catch(e){}
const RATS={marrom:{n:'Rato marrom',c:'#8b5a2b',ear:'#ffb6c6',nose:'#ff8fa3',eye:'#172033',sn:'#b98a5e'},cinza:{n:'Rato cinza',c:'#8a8f98',ear:'#f2b6c4',nose:'#ff9fb2',eye:'#172033',sn:'#b4b9c2'},branco:{n:'Rato branco',c:'#f4f4f4',ear:'#ffc9d6',nose:'#ff9fb2',eye:'#172033',sn:'#ffffff',wh:'#9aa0aa'},preto:{n:'Rato preto',c:'#2a2a33',ear:'#7a5668',nose:'#ff8fa3',eye:'#172033',sn:'#3b3b46'},albino:{n:'Rato albino',c:'#fff1f1',ear:'#ffb3c0',nose:'#ff7f99',eye:'#d6283a',sn:'#ffffff',wh:'#b08a90'},malhado:{n:'Rato malhado',c:'#f4efe6',pat:'#8b5a2b',ear:'#ffb6c6',nose:'#ff8fa3',eye:'#172033',sn:'#ffffff',wh:'#9aa0aa'},tricolor:{n:'Rato tricolor',c:'#f4efe6',pat:'#2a2a33',pat2:'#d98a3d',ear:'#ffb6c6',nose:'#ff8fa3',eye:'#172033',sn:'#ffffff',wh:'#9aa0aa'},dourado:{n:'Rato dourado',c:'#e8b830',ear:'#ffd9a0',nose:'#ff9fb2',eye:'#172033',sn:'#f6d77a'}};
Object.assign(RATS,{orelhas:{n:'Rato de orelhas grandes',c:'#b08968',ear:'#ffc2d1',nose:'#ff8fa3',eye:'#172033',sn:'#d9b99b',es:1.4,lv:5,r:0},gordinho:{n:'Rato gordinho',c:'#c9a27a',ear:'#ffb6c6',nose:'#ff8fa3',eye:'#172033',sn:'#e6cfae',hs:1.18,lv:8,r:0},arrepiado:{n:'Rato arrepiado',c:'#6b6f7a',ear:'#e9a9bb',nose:'#ff9fb2',eye:'#172033',sn:'#9399a6',spiky:1,lv:12,r:1},siames:{n:'Rato siamês',c:'#efe0c8',earc:'#6b4a3a',ear:'#8a6a58',nose:'#6b4a3a',eye:'#2b5fd9',sn:'#6b4a3a',wh:'#6b4a3a',lv:16,r:1},laboratorio:{n:'Rato de laboratório',c:'#f1f1f4',ear:'#ffb3c0',nose:'#ff8fa3',eye:'#d6283a',sn:'#ffffff',wh:'#9aa0aa',gog:1,lv:20,r:1},campo:{n:'Rato de campo',c:'#a3855a',ear:'#e6b8a2',nose:'#e08a9a',eye:'#172033',sn:'#d8c3a0',lv:25,r:1},azul:{n:'Rato azul fantasia',c:'#4f7bff',ear:'#bcd0ff',nose:'#ff9fd0',eye:'#10204f',sn:'#8aa6ff',spark:1,lv:35,r:2},roxo:{n:'Rato roxo',c:'#8a4fff',ear:'#e0c4ff',nose:'#ff9fd0',eye:'#1c1033',sn:'#b48aff',lv:45,r:2},neve:{n:'Rato de neve',c:'#eaf6ff',ear:'#bfe3ff',nose:'#ff9fb2',eye:'#1b2a44',sn:'#ffffff',wh:'#8fb3d6',spark:1,lv:60,r:2},fantasma:{n:'Rato fantasma',c:'#cfe6ff',ear:'#b3d4ff',nose:'#9fc4ff',eye:'#25324d',sn:'#e8f3ff',wh:'#9fc4ff',ghost:1,lv:80,r:3},rei:{n:'Rato rei',c:'#8b5a2b',ear:'#ffd98a',nose:'#ff8fa3',eye:'#172033',sn:'#d8a868',crown:1,lv:120,r:3},lendario:{n:'Rato lendário',c:'#ff9f43',ear:'#fff1a8',nose:'#ff9fd0',eye:'#1a1033',sn:'#fff1a8',rb:1,spark:1,lv:200,r:3}});
Object.assign(RATS,{ouro:{n:'Rato Dourado de evento',c:'#ffcf3a',ear:'#fff1a8',nose:'#ff9fd0',eye:'#2a1a00',sn:'#ffe58a',spark:1,lv:99999,ex:1,r:2},chefe:{n:'Rato Domador de Chefes',c:'#7a2f4f',ear:'#ffb0c8',nose:'#ff8fa3',eye:'#1a0a14',sn:'#a85a7c',spiky:1,crown:1,lv:99999,ex:2,r:3},abobora:{n:'Rato Abóbora',c:'#ff8a1f',ear:'#ffd7a0',nose:'#ff8fa3',eye:'#2a1200',sn:'#ffb35a',spiky:1,lv:99999,ex:4,r:2},natalino:{n:'Rato Natalino',c:'#d63a3a',ear:'#ffffff',nose:'#ffffff',eye:'#1a0a0a',sn:'#ffffff',spark:1,lv:99999,ex:8,r:2},folia:{n:'Rato Folião',c:'#ff4fa3',ear:'#ffe0f0',nose:'#ffd23f',eye:'#2a0a1a',sn:'#ff8cc6',gog:1,spark:1,lv:99999,ex:16,r:2},junino:{n:'Rato Junino',c:'#c98b3a',ear:'#ffb6c6',nose:'#ff8fa3',eye:'#1a1000',sn:'#e6bd7a',es:1.3,spark:1,lv:99999,ex:32,r:2},real:{n:'Rato Real',c:'#8b5a2b',ear:'#ffd98a',nose:'#ff8fa3',eye:'#172033',sn:'#d8a868',crown:1,spark:1,lv:99999,ex:64,r:3}});
for(const k in RATS){RATS[k].lv=RATS[k].lv||1;RATS[k].r=RATS[k].r||0}
const RAT_LBL=Object.assign({nenhum:'Cor livre'},Object.fromEntries(Object.entries(RATS).map(([k,v])=>[k,['⚪','🔵','🟣','🟡'][v.r]+' '+v.n+(v.ex?' • Evento':v.lv>1?' • Nv '+v.lv:'')])));
const ratOwned=id=>!RATS[id]||lvlInfo(prog.xp).l>=RATS[id].lv||!!(RATS[id].ex&&((prog.ratU|(prog.dFace?64:0))&RATS[id].ex));
function hslHex(h,sa=.85,l=.6){const a=sa*Math.min(l,1-l),f=n=>{const k=(n+h/30)%12,c=l-a*Math.max(-1,Math.min(k-3,9-k,1));return Math.round(255*c).toString(16).padStart(2,'0')};return '#'+f(0)+f(8)+f(4)}

const DIFFS=[{n:'Fácil',react:1.15,vis:-40,boost:0,spd:.95,turn:3.4,hunt:-.1,count:-1,gain:1},{n:'Médio',react:.85,vis:60,boost:.5,spd:1.04,turn:4,hunt:.15,count:0,gain:1},{n:'Difícil',react:.65,vis:120,boost:1,spd:1.12,turn:4.5,hunt:.3,count:1,gain:1.5},{n:'Pro',react:.45,vis:180,boost:1,spd:1.18,turn:5.2,hunt:.5,count:3,gain:3}];
const TUT={mundial:['👑','Boss Mundial',['Abre às 10:00 e às 22:00, por 1 hora.','O Colosso tem barra de vida: bata na parede para atordoá-lo e passe pela cabeça dele.','O prêmio vale uma vez por janela, e o rato exclusivo só na primeira vitória.']],treino:['🧪','Treino',['Só 4 rivais, para praticar os controles.','Nada aqui vale queijos, XP ou recordes.','Use para testar pelagens, rostos e acessórios em ação.']],daily:['📅','Desafio diário',['A arena é a mesma para todo mundo hoje.','Você tem 2:00 para fazer o máximo de pontos.','Compare com seu recorde e volte amanhã: a arena muda.']],quick:['⚡','Partida rápida',['Coma queijos 🧀 para crescer e somar pontos.','Bater na parede ou no corpo de outro rato elimina você.','Elimine ratos menores: eles soltam queijos. Supere seu recorde!']],
 survival:['⏳','Sobrevivência',['Objetivo: ficar vivo pelo maior tempo possível.','A ameaça cresce com o tempo: mais ratos e mais rápidos.','Seu recorde é o tempo sobrevivido. Fuja dos maiores!']],
 challenge:['🎯','Desafio de eliminações',['Elimine 6 ratos em até 2:00 para vencer.','Cada eliminação vale 100 pontos; sobrar tempo dá bônus.','Prenda os rivais contra a parede e use o impulso ⚡.']],
 team:['🔵','Equipes',['Você é do time azul 🔵; os aliados não se ferem.','Vence o time que fizer 15 eliminações primeiro (ou liderar aos 3:00).','Ajude os aliados e cace o time vermelho 🔴.']],
 boss:['👹','Chefe gigante',['Fuja da faixa vermelha: é a investida do Rei Rato!','Se ele bater na parede fica atordoado: encoste na cabeça dele para causar dano.','Derrote o chefe (cerca de 9 acertos) para vencer.']],
 infinite:['🌊','Infinito',['Elimine ratos para avançar de onda.','Cada onda traz mais ratos, mais rápidos e rivais especiais.','Sobreviva o máximo que puder: o recorde são os pontos.']]};
const DEVT=[{id:'queijo',n:'Festival do Queijo',i:'🧀',d:'Comida rende o DOBRO de queijos',m:'sum',key:'food',v:120,g:'Coma 120 queijos'},
 {id:'cacada',n:'Dia da Caçada',i:'⚔️',d:'Eliminações pagam o DOBRO de queijos',m:'sum',key:'kills',v:6,g:'Elimine 6 ratos'},
 {id:'chuva',n:'Chuva de Queijos',i:'🌧️',d:'Chuvas de queijos muito mais frequentes',m:'sum',key:'powers',v:6,g:'Pegue 6 poderes'},
 {id:'ouro',n:'Dia Dourado',i:'✨',d:'XP ×1,5 e Hora do Ouro mais frequente',m:'max',key:'score',v:800,g:'Faça 800 pontos numa partida'},
 {id:'veloz',n:'Dia Veloz',i:'💨',d:'Impulso recarrega 2× mais rápido e ventos frequentes',m:'max',key:'size',v:35,g:'Chegue ao tamanho 35'},
 {id:'tesouro',n:'Dia do Tesouro',i:'💎',d:'Poderes valem 3× queijos e mais rivais especiais',m:'sum',key:'special',v:1,g:'Elimine 1 rival especial'},
 {id:'noite',n:'Noite dos Fantasmas',i:'👻',d:'Arena escura e muitos rivais Fantasma',m:'sum',key:'special',v:2,g:'Elimine 2 rivais especiais'},
 {id:'gigante',n:'Invasão dos Ratos Gigantes',i:'🐀',d:'Os rivais nascem enormes e perigosos',m:'sum',key:'kills',v:5,g:'Elimine 5 ratos'},
 {id:'corrida',n:'Corrida Maluca',i:'🏁',d:'Todos os ratos correm 22% mais rápido',m:'max',key:'score',v:1000,g:'Faça 1000 pontos numa partida'},
 {id:'sobrev',n:'Evento de Sobrevivência',i:'🛡️',d:'XP ×1,5 para quem resistir',m:'max',key:'time',v:150,g:'Sobreviva 150 segundos'},
 {id:'cacadaouro',n:'Caçada ao Rato Dourado',i:'🏆',d:'Rivais Rei aparecem sem parar e pagam o TRIPLO de queijos',m:'sum',key:'special',v:2,g:'Elimine 2 rivais especiais'},
 {id:'chefes',n:'Evento de Chefes',i:'👹',d:'Vencer o Chefe gigante paga o DOBRO',m:'sum',key:'boss',v:1,g:'Derrote o Chefe gigante'}];
const THEMEEV={chuva:'chuva',ouro:'ouro',veloz:'vento'};
let pgState={shop:0,vis:0},achSel='',tutOpen=false,deferredInstall=null;
const SENSM=[1.5,1.15,.85],CSZ=[.85,1,1.25],VOLM=[.45,.75,1],QUAL={alta:{dpr:1.5,part:.85},media:{dpr:1.2,part:.55},baixa:{dpr:1,part:.3}};
const TURNS=[{n:'Suave',v:4.1},{n:'Normal',v:5.3},{n:'Rápido',v:6.7}];
const MODES={
 quick:{name:'Partida rápida',desc:'Entre na arena, coma queijos, cresça e supere seu recorde de pontos. Termina quando seu rato é eliminado.',limit:0},
 survival:{name:'Sobrevivência',desc:'Fique vivo pelo maior tempo possível. A ameaça cresce mais rápido. O recorde é o tempo sobrevivido.',limit:0},
 challenge:{name:'Desafio de eliminações',desc:'Elimine 6 ratos em até 2:00 para vencer. Cada eliminação vale 100 pontos.',limit:120,goal:6},
 team:{name:'Equipes',desc:'Azul × Vermelho: você e seus aliados (anel azul) não se ferem. Faça 15 eliminações antes do time rival ou lidere em 3:00.',limit:180,tgoal:15},
 boss:{name:'Chefe gigante',desc:'Enfrente o Rei Rato! Fuja da investida marcada em vermelho: se ele bater na parede fica atordoado e você pode acertar a cabeça dele.',limit:0},
 infinite:{name:'Infinito',desc:'Ondas sem fim: cada onda traz mais ratos, mais rápidos, e rivais especiais. Sobreviva o máximo que puder.',limit:0},
 daily:{name:'Desafio diário',desc:'A mesma arena para todos no dia. Você tem 2:00 para fazer o máximo de pontos e bater seu recorde.',limit:120},
 treino:{name:'Treino',desc:'Pratique sem pressão: só 4 rivais, sem recordes, XP nem queijos. Ótimo para testar visuais e controles.',limit:0},
 mundial:{name:'Boss Mundial',desc:'Só abre às 10:00 e às 22:00 (1 hora cada). Colosso gigante com prêmio especial, uma vez por janela.',limit:0}};
const ARCH={
 guloso:{n:'Guloso',i:'🧀',food:1.35,special:1,caution:1,hunt:0,wander:.15},
 cacador:{n:'Caçador',i:'⚔️',food:.9,special:.9,caution:.9,hunt:1,wander:.1},
 cauteloso:{n:'Cauteloso',i:'🛡️',food:1,special:.8,caution:1.5,hunt:0,wander:.05},
 oportunista:{n:'Oportunista',i:'🎯',food:.95,special:1.9,caution:1.1,hunt:.4,wander:.1},
 explorador:{n:'Explorador',i:'🧭',food:1.05,special:1.2,caution:1.1,hunt:0,wander:.5},
 pro:{n:'Pro',i:'⚔️',food:1.2,special:1.35,caution:1.35,hunt:1.05,wander:.04},
 superpro:{n:'Super Pro',i:'👑',food:1.35,special:1.55,caution:1.6,hunt:1.2,wander:.02},
 rei:{n:'Rei Queijo',i:'👑',food:1.1,special:1.5,caution:.8,hunt:.6,wander:.1},fantasma:{n:'Fantasma',i:'👻',food:1,special:1,caution:1.4,hunt:.8,wander:.2},tanque:{n:'Tanque',i:'🦏',food:1.2,special:.8,caution:.6,hunt:1,wander:.05}};
// Rivais especiais: recompensa = pontos + comida rara + um poder.
const SPECIALS={1:{name:'Rei Queijo',arch:'rei',color:'#ffd34e',len:26,radius:13,speed:120,pts:300,drops:14,power:5,icon:'👑',msg:'Elimine-o por um bônus!'},2:{name:'Fantasma',arch:'fantasma',color:'#cfd8ff',len:14,radius:9,speed:185,pts:150,drops:6,power:2,icon:'👻',msg:'Rápido e quase invisível!'},3:{name:'Tanque',arch:'tanque',color:'#b0714a',len:40,radius:16,speed:88,pts:250,drops:18,power:4,icon:'🦏',msg:'Lento, enorme e valioso!'},4:{name:'Rei Rato',arch:'tanque',color:'#8a4dff',len:60,radius:26,speed:90,pts:0,drops:60,power:5,icon:'👹',msg:'Derrote o chefe!'}};
const BOTS=[['PRO • Pipoca','pro'],['SUPER PRO • Tico','superpro'],['PRO • Nina','pro'],['Bolota','oportunista'],['Fubá','guloso'],['Mingau','cauteloso'],['Pingo','cacador'],['Cacau','explorador'],['Biscoito','oportunista'],['Pudim','guloso'],['Churros','cacador'],['Queijinho','explorador']];

