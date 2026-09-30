const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const names=["Rafael Santos","João Vitor","Lucas Pereira","Diego Alves","Matheus Silva","Gabriel Souza","Lucas Silva","Pedro Henrique","Everton Costa","Rafael Lima","Bruno Santos","Caio Melo"];
const positions=["GOL","LD","ZAG","ZAG","LE","VOL","MC","MEI","MD","ATA","AE","ATA"];
const personalities=["Líder","Profissional","Ambicioso","Reservado","Competitivo","Equilibrado","Ambicioso","Profissional","Impaciente","Líder","Reservado","Promissor"];
const basePlayers=names.map((n,i)=>({name:n,pos:positions[i],ovr:[73,70,71,70,69,72,74,71,70,75,73,62][i],form:[7.4,7,7.1,6.9,6.8,7.2,7.5,7.1,7,7.6,7.3,6.4][i],morale:[78,74,81,72,70,76,84,73,68,87,79,72][i],cond:[93,86,90,88,85,87,92,78,76,80,79,95][i],potential:[76,72,84,69,71,79,88,74,65,91,83,78][i],relation:[76,72,84,69,71,79,88,74,65,91,83,58][i],age:i===11?17:22+(i%8),personality:personalities[i],status:i===11?"base":"profissional",injury:null,goals:0,assists:0,minutes:0,training:"Equilibrado",fatigue:0}));
const clubNames=["RB Academia","Vila Nova","Ceará","Sport","Avaí","Novorizontino","Ponte Preta","CRB","Operário","Amazonas","Botafogo-SP","Brusque"];
const managerNames=["Marcelo Duarte","Ricardo Alves","André Costa","Paulo Mendes","Carlos Nunes","Fábio Moura","Renato Lima","Diego Rocha"];
const defaultState={version:5,date:"2025-04-26",day:26,minute:0,sec:0,running:false,speed:1,matchStarted:false,homeScore:0,awayScore:0,rep:42,trust:68,fans:61,money:8.4,mental:"Equilibrada",press:"Média",line:"Normal",formation:"4-2-3-1",season:1,week:15,leaguePos:9,points:22,played:14,club:"RB Academia FC",nextOpponent:"Vila Nova",nextDate:"26/04",nextTime:"16:00",events:[],news:["Diretoria mantém confiança no treinador antes da rodada.","Vila Nova promete neutralizar os corredores laterais."],worldLog:[],lastResult:null,history:[],injuries:[],trophies:0,games:14,wins:6,draws:4,losses:4,individualFocus:0,training:"Equilibrado",deals:[],scouting:[],jobOffers:[],facilities:{estadio:62,ct:68,base:55,medical:64,scouting:58},objectives:[{text:"Terminar no Top 10",progress:9,target:10},{text:"Desenvolver 2 jovens",progress:0,target:2},{text:"Manter folha sob controle",progress:1,target:1}],fixtures:[],competitions:[{name:'Brasileirão Série B',type:'liga',status:'em andamento',progress:15},{name:'Copa Nacional',type:'copa',status:'a definir',progress:0},{name:'Copa Regional',type:'copa',status:'a definir',progress:0}],seasonHistory:[],seasonPhase:'Liga',board:{result:7,finance:6,young:6},managers:[],clubs:[],players:[]};
let S=JSON.parse(JSON.stringify(defaultState));
S.players=JSON.parse(JSON.stringify(basePlayers));
S.managers=managerNames.map((name,i)=>({name,club:clubNames[i]||"Clube Nacional",style:["Equilibrado","Contra-ataque","Posse/pressão","Transição","Jogo direto","Bloco baixo","Pressão","Posse"][i],skill:61+i*3}));
S.clubs=clubNames.map((name,i)=>({name,played:14,points:Math.max(9,35-i*2),gd:Math.floor(9-i/2),form:Math.max(40,72-i*2),manager:S.managers[i%S.managers.length].name}));
let ball={x:700,y:300,vx:-1.1,vy:.4},canvas=$("#pitch"),ctx=canvas.getContext("2d");
const homePos=[[85,300],[220,130],[230,260],[230,410],[215,490],[400,235],[400,385],[570,130],[570,485],[760,270],[720,400]],awayPos=[[1015,300],[875,125],[875,250],[875,410],[875,485],[690,230],[690,385],[560,115],[560,495],[350,260],[350,420]];
function go(id){$$('.page').forEach(x=>x.classList.remove('active'));$('#'+id).classList.add('active');$$('[data-tab]').forEach(x=>x.classList.toggle('on',x.dataset.tab===id));render()}
$$('[data-tab]').forEach(b=>b.onclick=()=>go(b.dataset.tab));
function toast(x){$('#toast').textContent=x;$('#toast').style.display='block';clearTimeout(window.__toast);window.__toast=setTimeout(()=>$('#toast').style.display='none',1800)}
function clamp(v,a=0,b=100){return Math.max(a,Math.min(b,v))}
function rand(a,b){return a+Math.random()*(b-a)}
function weightedChance(base){return Math.random()<base*S.speed}
function add(text,icon='◉'){S.events.push({m:S.minute,text,icon});if(S.events.length>30)S.events.shift();render()}
function world(text){S.worldLog.unshift(`${fmtDate()} — ${text}`);if(S.worldLog.length>25)S.worldLog.pop();S.news.push(text);if(S.news.length>20)S.news.shift()}
function fmtDate(){return new Date(S.date+'T12:00:00').toLocaleDateString('pt-BR')}
function render(){
 if(!S.fixtures.length)generateFixtures(); const currentFixture=S.fixtures.find(f=>f.round===S.week)||S.fixtures[0]; if(currentFixture){S.nextOpponent=currentFixture.opponent;S.nextDate=currentFixture.date;}
 $('#date').textContent=fmtDate();$('#seasonLabel').textContent=`Temporada ${S.season} • Semana ${S.week}`;$('#clubName').textContent=S.club.toUpperCase();$('#rep').textContent=Math.round(S.rep);$('#trust').textContent=Math.round(S.trust)+'%';$('#fans').textContent=Math.round(S.fans)+'%';$('#money').textContent='R$ '+S.money.toFixed(1)+' mi';
 $('#homeTeam').textContent=S.club.toUpperCase();$('#awayTeam').textContent=S.nextOpponent.toUpperCase();$('#fixtureInfo').textContent=`Brasileirão Série B • Rodada ${S.week} • ${S.nextDate} • ${S.nextTime} • Estádio Municipal`;
 const status=S.trust>=65?'Emprego estável':S.trust>=45?'Pressão crescente':'🚨 Cargo em risco';$('#jobStatus').textContent=status;$('#jobStatus').className='warning '+(S.trust>=65?'ok':'bad');$('#jobMeter').style.width=S.trust+'%';$('#jobText').textContent=S.trust>=65?'Diretoria considera o trabalho dentro das expectativas.':S.trust>=45?'Resultados abaixo do plano podem iniciar reunião.':'A diretoria está avaliando alternativas.';
 $('#objectives').innerHTML=S.objectives.map(o=>`<div class="metric"><span>${o.text}</span><b>${o.progress}/${o.target}</b></div>`).join('');
 $('#agenda').innerHTML=[`Hoje • ${S.nextOpponent}`,`${addDays(2)} • Recuperação`,`${addDays(4)} • Treino tático`,`${addDays(7)} • Próxima rodada`].map(x=>`<div class="metric">${x}<b>›</b></div>`).join('');
 $('#news').innerHTML=S.news.slice(-7).reverse().map(x=>`<div class="news">${x}</div>`).join('');
 const unhappy=S.players.filter(p=>p.morale<65);const leader=S.players.find(p=>p.personality==='Líder')||S.players[0];$('#locker').innerHTML=`<div class="metric"><span>Capitão • ${leader.name}</span><b>${leader.relation}% relação</b></div><div class="metric"><span>Grupo</span><b>${unhappy.length?'tensão moderada':'estável'}</b></div>${unhappy.slice(0,2).map(p=>`<div class="metric"><span>Insatisfeito • ${p.name}</span><b>${p.morale}% moral</b></div>`).join('')}`;
 $('#score').textContent=`${S.homeScore} - ${S.awayScore}`;$('#clock').textContent=`${String(S.minute).padStart(2,'0')}:${String(S.sec).padStart(2,'0')}`;$('#matchHome').textContent=S.club;$('#matchAway').textContent=S.nextOpponent;
 $('#players').innerHTML=S.players.map(p=>`<tr><td><b>${p.name}</b><small class="small"> ${p.age} anos</small></td><td>${p.pos}</td><td>${p.ovr}</td><td>${p.form.toFixed(1)}</td><td class="${p.morale<60?'bad':'good'}">${p.morale}%</td><td>${p.cond}%</td><td>${p.potential}</td><td>${p.relation}%</td><td>${p.personality}</td></tr>`).join('');
 $('#lineup').innerHTML=S.players.filter(p=>p.status!=='base').slice(0,11).map((p,i)=>`<div class="line"><b>${i+1}</b><span>${p.name}<small> ${p.pos}</small></span><span class="green">${p.cond}%</span><b>${p.form.toFixed(1)}</b></div>`).join('');
 $('#bench').innerHTML=S.players.slice(11).concat(S.players.slice(7,10)).slice(0,4).map(p=>`<div class="metric"><span>${p.name}<small>${p.pos}</small></span><b>${p.cond}%</b></div>`).join('');
 $('#events').innerHTML=S.events.slice(-9).reverse().map(e=>`<div class="event"><b>${e.m}'</b>${e.icon} ${e.text}</div>`).join('')||`<div class="event">Partida ainda não iniciada.</div>`;
 $('#matchstats').innerHTML=matchStats().map(x=>`<div class="metric"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('');$('#tacticalRead').innerHTML=`<div class="metric"><span>Formação</span><b>${S.formation}</b></div><div class="metric"><span>Mentalidade</span><b>${S.mental}</b></div><div class="metric"><span>Pressão</span><b>${S.press}</b></div><div class="metric"><span>Linha</span><b>${S.line}</b></div>`;
 $('#oppAI').innerHTML=`<div class="metric"><span>Formação</span><b>${S.minute>60?'4-4-2':'4-2-3-1'}</b></div><div class="metric"><span>Estilo</span><b>${S.minute>45?'ajustando':'contra-ataque'}</b></div><div class="metric"><span>Foco</span><b>${S.minute>35?'explorar seu lateral':'fechar o meio'}</b></div>`;
 $('#decision').innerHTML=S.running?decisionHTML():`<button class="primary" onclick="startMatch()">▶ Iniciar partida</button>`;
 $('#commands').innerHTML=[['🧠','Mentalidade',()=>{S.mental=S.mental==='Equilibrada'?'Ofensiva':S.mental==='Ofensiva'?'Defensiva':'Equilibrada';add('Mentalidade alterada.','🧠')}],['🔥','Pressão',()=>{S.press=S.press==='Alta'?'Média':S.press==='Média'?'Baixa':'Alta';add('Pressão alterada.','🔥')}],['🛡️','Linha baixa',()=>{S.line='Baixa';add('Linha defensiva recuou.','🛡️')}],['⚡','Transição',()=>{S.mental='Ofensiva';S.press='Alta';add('Equipe recebeu instrução de transição agressiva.','⚡')}]].map(x=>`<button class="choice" onclick="(${x[2].toString()})()">${x[0]} ${x[1]}</button>`).join('');
 $('#trainingCards').innerHTML=['Equilibrado','Tático','Físico','Recuperação','Finalização','Base'].map(x=>`<div class="card"><h3>${x.toUpperCase()}</h3><p>${trainingDesc(x)}</p><div class="metric"><span>Efeito</span><b>${x==='Físico'?'desgaste alto':x==='Recuperação'?'fadiga reduzida':'desenvolvimento'}</b></div><button class="primary" onclick="train('${x}')">Aplicar</button></div>`).join('');
 $('#individualTraining').innerHTML=S.players.slice(0,8).map(p=>`<div class="metric"><span>${p.name} • ${p.training}</span><div class="rowActions"><button class="secondary" onclick="focusPlayer('${p.name}')">Mudar foco</button></div></div>`).join('');
 $('#squadDynamics').innerHTML=`<div class="metric"><span>Moral média</span><b>${avg('morale')}%</b></div><div class="metric"><span>Condição média</span><b>${avg('cond')}%</b></div><div class="metric"><span>Relação média</span><b>${avg('relation')}%</b></div><div class="metric"><span>Jogadores em tensão</span><b>${unhappy.length}</b></div>`;
 $('#medical').innerHTML=S.players.filter(p=>p.injury).map(p=>`<div class="metric"><span>${p.name}</span><b class="bad">${p.injury.days} dias</b></div>`).join('')||'<div class="metric"><span>Departamento médico</span><b class="good">Sem lesões relevantes</b></div>';
 $('#academy').innerHTML=`<div class="metric"><span>Melhor jovem</span><b>Caio Melo • ${S.players[11].ovr}</b></div><div class="metric"><span>Potencial</span><b>${S.players[11].potential}</b></div><button class="secondary" onclick="promoteYouth()">Promover jovem</button>`;
 $('#marketCards').innerHTML=[['João Mendes','ATA',78,4.2,90],['Mateus Rocha','VOL',75,2.8,70],['Caio Nascimento','ZAG',76,3.1,82],['Pedro Alves','MEI',80,6.7,110]].map(x=>`<div class="card"><h3>${x[0]}</h3><p>${x[1]} • OVR ${x[2]} • valor estimado R$ ${x[3].toFixed(1)} mi<br>Salário esperado R$ ${x[4]} mil/mês</p><span class="tag">Scout ${Math.round(rand(72,94))}%</span><button class="primary" onclick="negotiate('${x[0]}',${x[3]})">Iniciar negociação</button></div>`).join('');
 $('#scouting').innerHTML=(S.scouting.length?S.scouting:[['Mercado sul','Laterais jovens',76],['Mercado regional','Atacantes',73],['Base','Meias',81]]).map(x=>`<div class="metric"><span>${x[0]} • ${x[1]}</span><b>${x[2]}% confiança</b></div>`).join('');$('#deals').innerHTML=S.deals.length?S.deals.map(d=>`<div class="metric"><span>${d.player}</span><b>${d.status}</b></div>`).join(''):'<div class="metric"><span>Nenhuma</span><b>sem negociações</b></div>';
 $('#board').innerHTML=`<h3>DIRETORIA</h3><div class="metric"><span>Objetivo</span><b>Top 10</b></div><div class="metric"><span>Posição</span><b>${S.leaguePos}º</b></div><div class="metric"><span>Confiança</span><b>${Math.round(S.trust)}%</b></div><div class="metric"><span>Resultado</span><b>${S.board.result}/10</b></div><div class="metric"><span>Finanças</span><b>${S.board.finance}/10</b></div><div class="metric"><span>Base</span><b>${S.board.young}/10</b></div>`;
 $('#finance').innerHTML=`<h3>FINANÇAS</h3><div class="metric"><span>Caixa</span><b>R$ ${S.money.toFixed(1)} mi</b></div><div class="metric"><span>Folha</span><b>R$ 1,24 mi/mês</b></div><div class="metric"><span>Transferências</span><b>R$ 3,0 mi</b></div><div class="metric"><span>Patrocínio</span><b>R$ 3,8 mi</b></div>`;
 $('#staff').innerHTML=`<h3>COMISSÃO</h3>${[['Auxiliar',74],['Analista',78],['Preparador físico',81],['GK coach',76],['Fisiologista',79],['Scout chefe',83]].map(x=>`<div class="metric"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('')}`;
 $('#contract').innerHTML=`<h3>SEU CONTRATO</h3><div class="metric"><span>Vínculo</span><b>até 30/06/2027</b></div><div class="metric"><span>Salário</span><b>R$ 68 mil/mês</b></div><div class="metric"><span>Cláusula</span><b>não prevista</b></div><div class="metric"><span>Jogos</span><b>${S.games}</b></div>`;
 $('#facilities').innerHTML=Object.entries(S.facilities).map(([k,v])=>`<div class="metric"><span>${facilityName(k)}</span><b>${v}/100</b></div>`).join('');
 $('#managers').innerHTML=S.managers.map(x=>`<div class="metric"><span>${x.name}<small>${x.club}</small></span><b>${x.style}</b></div>`).join('');$('#table').innerHTML=tableData().map((c,i)=>`<div class="metric"><span>${i+1}º ${c.name}</span><b>${c.points} pts</b></div>`).join('');$('#rumors').innerHTML=S.news.slice(-5).reverse().map(x=>`<div class="news">${x}</div>`).join('');$('#worldLog').innerHTML=S.worldLog.slice(0,10).map(x=>`<div class="news">${x}</div>`).join('')||'<div class="news">O mundo começará a gerar acontecimentos conforme os dias avançarem.</div>';
 $('#fixtures').innerHTML=(S.fixtures.length?S.fixtures.slice(0,8):generateFixtures().slice(0,8)).map((f,i)=>`<div class="metric"><span>${f.date} • ${f.competition}<small>${f.home?'Casa':'Fora'}</small></span><b>${f.opponent}</b></div>`).join('');
 $('#competitions').innerHTML=S.competitions.map(c=>`<div class="metric"><span>${c.name}<small>${c.type}</small></span><b>${c.status} ${c.progress?`• ${c.progress}`:''}</b></div>`).join('');
 $('#seasonState').innerHTML=`<div class="metric"><span>Temporada</span><b>${S.season}</b></div><div class="metric"><span>Fase</span><b>${S.seasonPhase}</b></div><div class="metric"><span>Rodada</span><b>${S.week}/38</b></div><div class="metric"><span>Pontos</span><b>${S.points}</b></div>`;
 $('#careerRep').textContent=Math.round(S.rep);$('#careerRepText').textContent=S.rep>75?'Reputação nacional consolidada.':S.rep>50?'Treinador em ascensão.':'Reputação ainda em construção.';$('#trophies').textContent=S.trophies;$('#careerGames').textContent=S.games;$('#careerRecord').textContent=`${S.wins} • ${S.draws} • ${S.losses}`;$('#history').innerHTML=S.history.slice(-12).reverse().map(x=>`<div class="news">${x}</div>`).join('')||'<div class="news">Sua história começará aqui.</div>';$('#jobOffers').innerHTML=S.jobOffers.length?S.jobOffers.map((o,i)=>`<div class="metric"><span>${o.club} • ${o.role}</span><b>R$ ${o.salary} mil</b></div>`).join(''):'<div class="news">Nenhuma proposta no momento.</div>';
}
function generateFixtures(){if(S.fixtures&&S.fixtures.length)return S.fixtures;let rivals=S.clubs.filter(c=>c.name!==S.club.replace(' FC','')).map(c=>c.name);S.fixtures=[];for(let i=0;i<38;i++){let opp=rivals[i%rivals.length];let d=new Date(S.date+'T12:00:00');d.setDate(d.getDate()+(i-S.week+1)*7);S.fixtures.push({round:i+1,date:d.toLocaleDateString('pt-BR').slice(0,5),opponent:opp,home:i%2===0,competition:'Brasileirão Série B'});}return S.fixtures}
function checkSeasonEnd(){if(S.week<38||S.played<38)return;let finalPos=Math.max(1,Math.min(12,Math.round(7+(S.points-45)*-.12)));let champion=finalPos===1;if(champion){S.trophies++;S.rep+=12;S.news.push('🏆 RB Academia conquistou o título nacional.');}else if(finalPos<=4){S.news.push(`Temporada encerrada: ${finalPos}º lugar e campanha de destaque.`);S.rep+=6;}else{S.news.push(`Temporada encerrada em ${finalPos}º lugar.`);}S.seasonHistory.unshift({season:S.season,pos:finalPos,points:S.points,wins:S.wins,draws:S.draws,losses:S.losses,trophy:champion});S.season++;S.week=1;S.played=0;S.points=0;S.leaguePos=9;S.wins=0;S.draws=0;S.losses=0;S.homeScore=0;S.awayScore=0;S.seasonPhase='Liga';S.competitions.forEach(c=>{c.progress=0;c.status=c.name==='Brasileirão Série B'?'em andamento':'a definir'});S.fixtures=[];generateFixtures();world(`Nova temporada começou. A diretoria definiu novos objetivos para o clube.`);}
function avg(k){return Math.round(S.players.reduce((a,p)=>a+p[k],0)/S.players.length)}
function addDays(n){let d=new Date(S.date+'T12:00:00');d.setDate(d.getDate()+n);return d.toLocaleDateString('pt-BR').slice(0,5)}
function trainingDesc(x){return {Equilibrado:'Carga geral, entrosamento e evolução estável.',Tático:'Organização, bolas paradas e comportamento sem bola.',Físico:'Resistência e força; maior desgaste e risco de sobrecarga.',Recuperação:'Reduz fadiga e recupera condição.',Finalização:'Finalização, decisão e ataque à área.',Base:'Desenvolvimento acelerado de jovens.'}[x]}
function facilityName(k){return {estadio:'Estádio',ct:'Centro de treinamento',base:'Academia de base',medical:'Departamento médico',scouting:'Scouting'}[k]||k}
function decisionHTML(){let options=['Recuar lateral','Ponta recompor','Mudar para 3-4-3','Não alterar'];return `<b>${S.minute}:${String(S.sec).padStart(2,'0')}</b> — o auxiliar detectou ${S.minute>50?'espaço nas costas da sua linha':'pressão no corredor lateral'}.<br>`+options.map((x,i)=>`<button class="choice" onclick="choose(${i})"><b>${'ABCD'[i]}</b> ${x}</button>`).join('')}
function matchStats(){let p=Math.round(clamp(50+(S.mental==='Ofensiva'?8:0)+(S.press==='Alta'?5:0)+rand(-8,8)));return [['Posse',`${p}% / ${100-p}%`],['Finalizações',`${3+Math.floor(S.minute/12)} / ${2+Math.floor(S.minute/16)}`],['No gol',`${1+Math.floor(S.minute/30)} / ${Math.floor(S.minute/30)}`],['xG',`${(0.18+S.homeScore*.72+S.minute*.006).toFixed(2)} / ${(0.15+S.awayScore*.7+S.minute*.005).toFixed(2)}`],['Passes',`${78+Math.floor(rand(0,10))}% / ${72+Math.floor(rand(0,10))}%`],['Faltas',`${Math.floor(S.minute/13)} / ${Math.floor(S.minute/11)}`]]}
function startMatch(){if(S.matchStarted&&S.minute<90)return;S.running=true;S.matchStarted=true;S.minute=0;S.sec=0;S.homeScore=0;S.awayScore=0;S.events=[];ball={x:700,y:300,vx:-1.1,vy:.4};$('#status').textContent='Partida iniciada. O motor simulará o contexto, as decisões e as consequências.';add('Apito inicial.','⚽');render();draw()}
function choose(i){if(i===0){S.line='Baixa';S.press='Baixa'}if(i===1){S.press='Alta';S.players[8].cond=clamp(S.players[8].cond-3)}if(i===2){S.formation='3-4-3';S.mental='Ofensiva'}if(i===3)S.mental='Equilibrada';add('Sua decisão alterou o comportamento da equipe.','🧠');toast('Decisão aplicada.')}
function tick(){if(!S.running)return;S.sec+=S.speed;if(S.sec>=60){S.minute++;S.sec=0;matchMinute()}ball.x+=ball.vx*S.speed;ball.y+=ball.vy*S.speed;if(ball.x<45||ball.x>1055)ball.vx*=-1;if(ball.y<40||ball.y>560)ball.vy*=-1;if(S.minute>=90){S.running=false;finishMatch()}render();draw()}
function matchMinute(){const fatigue=avg('cond');let tactical=(S.mental==='Ofensiva'?0.0009:S.mental==='Defensiva'?0.00045:0.00065);tactical+=S.press==='Alta'?0.0002:0;const opponent=0.00065+(S.awayScore<S.homeScore?0.00025:0);if(weightedChance(.12)){let events=[['RB constrói por baixo','⚽'],['Vila Nova acelera transição','↗'],['Seu volante recupera a bola','●'],['Cruzamento perigoso','◒'],['Pressão força erro adversário','🔥'],['Seu zagueiro bloqueia finalização','🛡️'],['Ponta encontra espaço','⚡']];let e=events[Math.floor(Math.random()*events.length)];add(e[0],e[1])}if(Math.random()<tactical*(fatigue/85)){S.homeScore++;const p=S.players[Math.floor(Math.random()*11)];p.goals++;p.form=clamp(p.form+.3,4,10);S.rep+=.4;add(`GOOOOL! ${p.name} marcou para ${S.club}.`,'🟢')}if(Math.random()<opponent){S.awayScore++;add(`Gol do ${S.nextOpponent}.`,'🔴')}if(weightedChance(.006)){const p=S.players[Math.floor(Math.random()*11)];if(Math.random()<.35){p.injury={days:Math.floor(rand(3,28))};S.injuries.push(p.name);add(`${p.name} sente lesão e pede atendimento.`,'🩺')}}if([25,55,75].includes(S.minute))render()}
function finishMatch(){let r=S.homeScore>S.awayScore?'Vitória':S.homeScore===S.awayScore?'Empate':'Derrota';S.lastResult=r;S.games++;if(r==='Vitória'){S.wins++;S.trust=clamp(S.trust+7);S.fans=clamp(S.fans+5);S.rep+=2}else if(r==='Empate'){S.draws++;S.trust=clamp(S.trust);S.fans=clamp(S.fans+1)}else{S.losses++;S.trust=clamp(S.trust-11);S.fans=clamp(S.fans-5);S.rep=Math.max(0,S.rep-1)}S.history.push(`${fmtDate()} • ${r}: ${S.club} ${S.homeScore}–${S.awayScore} ${S.nextOpponent}`);S.news.push(`${r}: ${S.club} ${S.homeScore}–${S.awayScore} ${S.nextOpponent}.`);S.leaguePos=clampLeague(S.leaguePos+(r==='Vitória'?-1:r==='Derrota'?1:0));S.points+=r==='Vitória'?3:r==='Empate'?1:0;S.played++;if(S.fixtures.length){let f=S.fixtures.find(x=>x.round===S.week);if(f)f.result=`${S.homeScore}-${S.awayScore}`;}S.week++;S.objectives[0].progress=Math.max(0,11-S.leaguePos);if(S.trust<25){S.news.push('🚨 Diretoria convocou reunião sobre o futuro do treinador.')}checkSeasonEnd();$('#status').textContent=`Fim: ${r}. A carreira continuará com as consequências do resultado.`;advanceWorld();render()}
function clampLeague(v){return Math.max(1,Math.min(12,v))}
function train(x){S.training=x;S.players.forEach(p=>{if(x==='Recuperação'){p.cond=clamp(p.cond+8);p.fatigue=Math.max(0,p.fatigue-12)}else{p.cond=clamp(p.cond-(x==='Físico'?7:3));p.fatigue+=x==='Físico'?8:3;p.form=clamp(p.form+(x==='Tático'?.15:x==='Finalização'?.12:.05),4,10);if(x==='Base'&&p.age<21)p.ovr=Math.min(p.potential,p.ovr+.2)}});S.news.push(`Plano semanal definido: ${x}.`);toast(`Treino ${x} aplicado.`);render()}
function focusPlayer(n){let p=S.players.find(x=>x.name===n);if(!p)return;p.training=p.training==='Equilibrado'?'Finalização':p.training==='Finalização'?'Físico':'Equilibrado';p.relation=clamp(p.relation+2);toast(`${n}: foco ${p.training}.`);render()}
function promoteYouth(){let p=S.players.find(x=>x.age<20);if(!p)return;p.status='profissional';p.morale=clamp(p.morale+10);S.objectives[1].progress=Math.min(2,S.objectives[1].progress+1);S.rep+=1;S.news.push(`${p.name} foi promovido da base ao elenco profissional.`);toast('Jovem promovido.');render()}
function negotiate(n,value){let chance=.45+(S.rep-40)/250;if(Math.random()<chance){S.deals.push({player:n,status:'Agente aberto a negociar'});S.money=Math.max(0,S.money-value*.05);S.news.push(`Negociação iniciada por ${n}. O agente pediu garantias esportivas.`);toast('Negociação aberta.')}else{S.news.push(`Negociação por ${n} fracassou: o agente recusou as condições.`);toast('Negociação recusada.')}render()}
function advanceDay(){if(!S.fixtures.length)generateFixtures();let d=new Date(S.date+'T12:00:00');d.setDate(d.getDate()+1);S.date=d.toISOString().slice(0,10);S.day++;dailySimulation();checkSeasonEnd();render();toast('Um dia passou. O mundo continuou se movimentando.')}
function advanceWeek(){for(let i=0;i<7;i++)advanceDay();toast('Uma semana simulada.');}
function dailySimulation(){S.players.forEach(p=>{if(p.injury){p.injury.days--;if(p.injury.days<=0){p.injury=null;world(`${p.name} voltou ao treinamento após recuperação.`)}}p.cond=clamp(p.cond+(p.training==='Recuperação'?3:1));p.fatigue=Math.max(0,p.fatigue-3);if(p.morale<55&&Math.random()<.06){p.relation=clamp(p.relation-2);world(`${p.name} está insatisfeito com sua situação no elenco.`)}});if(Math.random()<.25)generateWorldEvent();if(S.day%7===0){S.clubs.forEach(c=>{c.form=clamp(c.form+Math.floor(rand(-8,9)));c.points+=c.form>70?3:c.form>55?1:0});generateMarketRumor()}if(S.day%30===0)monthlyFinance();if(S.trust<18&&Math.random()<.15){world('A diretoria decidiu encerrar o contrato após uma reunião extraordinária.');S.trust=0;}}
function advanceWorld(){for(let i=0;i<3;i++)generateWorldEvent();generateMarketRumor()}
function generateWorldEvent(){let pool=['Treinador rival mudou para 3-4-3.','Clube da liga demitiu o treinador após sequência negativa.','Jovem da base de um rival chamou atenção no treino.','Agente colocou jogador importante no mercado.','Diretoria de um clube aprovou investimento no centro de treinamento.','Rival mudou o sistema de scouting.','Atacante de um concorrente entrou em conflito contratual.'];world(pool[Math.floor(Math.random()*pool.length)])}
function generateMarketRumor(){let targets=['um atacante jovem','um volante experiente','um lateral veloz','um goleiro reserva'];world(`Mercado: ${targets[Math.floor(Math.random()*targets.length)]} entrou no radar de vários clubes.`)}
function monthlyFinance(){S.money+=1.1-(S.players.length*.03);S.money=Math.max(0,S.money);S.objectives[2].progress=S.money>3?1:0;if(S.money<1)world('Financeiro alerta para restrição de orçamento.')}
function tableData(){return [...S.clubs.map(c=>c.name===S.club.replace(' FC','')?{...c,name:S.club,points:S.points}:c)].sort((a,b)=>b.points-a.points)}
function saveGame(){localStorage.fmUltraWorld=JSON.stringify(S);toast('Carreira salva no dispositivo.')}
function loadGame(){try{let x=JSON.parse(localStorage.fmUltraWorld||'null');if(x&&x.version>=3){S=Object.assign(S,x);S.date=x.date;S.players=x.players||JSON.parse(JSON.stringify(basePlayers));S.fixtures=x.fixtures||[];S.competitions=x.competitions||defaultState.competitions;S.seasonHistory=x.seasonHistory||[];S.seasonPhase=x.seasonPhase||'Liga';S.managers=x.managers||S.managers;S.clubs=x.clubs||S.clubs}}catch(e){console.warn(e)}}
function toggleSpeed(){S.speed=S.speed===1?2:S.speed===2?4:1;$('#speedBtn').textContent=`Velocidade ${S.speed}x`}
$('#pause').onclick=()=>{S.running=!S.running;$('#pause').textContent=S.running?'⏸':'▶'};
loadGame();if(!S.fixtures.length)generateFixtures();render();draw();setInterval(tick,1000);
function draw(){if(!ctx)return;ctx.clearRect(0,0,1100,600);ctx.fillStyle='#176f34';ctx.fillRect(0,0,1100,600);for(let x=0;x<1100;x+=100){ctx.fillStyle=x%200?'#fff1':'#0002';ctx.fillRect(x,0,100,600)}ctx.strokeStyle='#d9ebda99';ctx.lineWidth=2;ctx.strokeRect(18,18,1064,564);ctx.beginPath();ctx.moveTo(550,18);ctx.lineTo(550,582);ctx.stroke();ctx.beginPath();ctx.arc(550,300,75,0,7);ctx.stroke();ctx.strokeRect(18,155,145,290);ctx.strokeRect(937,155,145,290);function tm(a,c){a.forEach((p,i)=>{ctx.beginPath();ctx.fillStyle=c;ctx.arc(p[0],p[1],13,0,7);ctx.fill();ctx.strokeStyle='#fff9';ctx.stroke();ctx.fillStyle='#fff';ctx.font='10px Arial';ctx.textAlign='center';ctx.fillText(i+1,p[0],p[1]+3)})}tm(homePos,'#161c27');tm(awayPos,'#d93b47');ctx.fillStyle='#fff5d5';ctx.beginPath();ctx.arc(ball.x,ball.y,7,0,7);ctx.fill()}

/* FM ULTRA v3 — Career Simulation Expansion */
(function(){
  const oldRender=render, oldSave=saveGame;
  const POS=['GOL','LD','ZAG','LE','VOL','MC','MEI','PD','PE','ATA'];
  const FIRST=['Arthur','Bernardo','Caio','Daniel','Eduardo','Felipe','Gabriel','Henrique','Igor','João','Kaique','Leonardo','Mateus','Nicolas','Otávio','Pedro','Rafael','Samuel','Thiago','Vinícius','Wesley','Yuri'];
  const LAST=['Almeida','Barbosa','Cardoso','Dias','Ferreira','Gomes','Lima','Mendes','Nogueira','Oliveira','Pereira','Ramos','Rocha','Santos','Silva','Souza'];
  const CLUB_POOL=['RB Academia FC','Vila Nova','Ceará','Sport','Avaí','Novorizontino','Ponte Preta','CRB','Operário','Amazonas','Botafogo-SP','Brusque','Guarani','Chapecoense','Mirassol','Paysandu','Coritiba','Goiás','Atlético-GO','Criciúma','Vitória','Juventude','Náutico','Remo'];
  const STYLES=['Posse/pressão','Contra-ataque','Jogo direto','Bloco baixo','Pressão alta','Transição','Equilibrado'];
  const randInt=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const uid=()=>Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-4);
  const dateObj=s=>new Date(s+'T12:00:00');
  const iso=d=>d.toISOString().slice(0,10);
  function newPlayer(club,young=false){
    const age=young?randInt(16,20):randInt(18,34), pos=pick(POS), pot=clamp(randInt(58,91)+(young?randInt(0,7):0),45,95), ovr=clamp(pot-randInt(4,22)+(age>28?randInt(-2,3):0),45,89);
    return {id:uid(),name:pick(FIRST)+' '+pick(LAST),pos,ovr,form:+(randInt(62,82)/10).toFixed(1),morale:randInt(55,90),cond:randInt(76,100),potential:pot,relation:randInt(45,82),age,personality:pick(personalities),status:young?'base':'profissional',injury:null,goals:0,assists:0,minutes:0,training:'Equilibrado',fatigue:randInt(0,18),club,marketValue:+(Math.max(.15,ovr*ovr/2500+Math.random()*2)).toFixed(2),salary:+(randInt(4,35)/10).toFixed(1),contractUntil:2027+randInt(0,3),nationality:'Brasil'};
  }
  function ensureWorld(){
    S.version=7;
    S.manager={name:'Lucas Matheus',age:32,reputation:S.rep||42,licenses:2,style:'Flexível',careerYears:0};
    S.club=S.club||'RB Academia FC';
    S.worldSeason=S.worldSeason||S.season||1;
    S.window=S.window||'fechada';
    S.transferDeadline=S.transferDeadline||null;
    S.fixtureIndex=Number.isInteger(S.fixtureIndex)?S.fixtureIndex:0;
    S.cup={round:0,stage:'Primeira fase',drawn:false,opponent:null,score:null,active:false,winner:null};
    S.regionalCup=S.regionalCup||{round:0,stage:'Quartas',opponent:null,active:false,winner:null};
    S.transfers=S.transfers||[]; S.transferHistory=S.transferHistory||[];
    S.squadBudget=Number.isFinite(S.squadBudget)?S.squadBudget:Math.max(2,S.money*.45);
    S.wageBudget=Number.isFinite(S.wageBudget)?S.wageBudget:1.8;
    S.nextScouting=S.nextScouting||[];
    if(!Array.isArray(S.clubs)||S.clubs.length<18) S.clubs=[];
    const names=[...new Set([S.club,...CLUB_POOL])].slice(0,24);
    const oldMap=Object.fromEntries((S.clubs||[]).map(c=>[c.name,c]));
    S.clubs=names.map((name,i)=>Object.assign({id:'club_'+i,name,played:0,points:0,gd:0,form:60,manager:managerNames[i%managerNames.length],strength:58+i%12,finance:randInt(45,80),stadium:randInt(35,75),academy:randInt(35,75)},oldMap[name]||{}));
    if(!S.managers||S.managers.length<18) S.managers=S.clubs.map((c,i)=>({name:managerNames[i%managerNames.length]+' '+(i+1),club:c.name,style:pick(STYLES),skill:randInt(58,82)}));
    S.clubs.forEach(c=>{const m=S.managers.find(x=>x.club===c.name);if(m)c.manager=m.name;});
    if(!Array.isArray(S.players))S.players=[];
    if(S.players.length<80){ for(let i=S.players.length;i<180;i++)S.players.push(newPlayer(pick(S.clubs).name,i>150)); }
    S.players.forEach(p=>{if(!p.id)p.id=uid();if(!p.club)p.club=S.club;});
    // Ensure the user's squad is always large enough.
    let mine=S.players.filter(p=>p.club===S.club);
    if(mine.length<25){for(let i=mine.length;i<28;i++)S.players.push(newPlayer(S.club,i>=22));}
    S.players.filter(p=>p.club===S.club).slice(0,18).forEach((p,i)=>{if(i<basePlayers.length){const b=basePlayers[i];Object.assign(p,{name:b.name,pos:b.pos,ovr:b.ovr,age:b.age,personality:b.personality,status:b.status,relation:b.relation});}});
    S.players=S.players.map(p=>p.club===S.club?p:Object.assign(p,{marketValue:p.marketValue||+(p.ovr*p.ovr/2500).toFixed(2)}));
    S.competitions=[{name:'Brasileirão Série B',type:'liga',status:'em andamento',progress:S.played||0},{name:'Copa Nacional',type:'copa',status:S.cup.winner?'encerrada':'em andamento',progress:S.cup.round||0},{name:'Copa Regional',type:'regional',status:S.regionalCup.winner?'encerrada':'em andamento',progress:S.regionalCup.round||0}];
  }
  function makeSchedule(){
    ensureWorld();
    const others=S.clubs.filter(c=>c.name!==S.club).map(c=>c.name);
    const start=dateObj(S.date||'2025-04-26');
    const fs=[];
    for(let r=1;r<=38;r++){let opp=others[(r-1)%others.length];fs.push({id:'L'+r,type:'liga',competition:'Brasileirão Série B',round:r,date:iso(new Date(start.getTime()+(r-1)*6*86400000)),time:pick(['16:00','18:30','19:00','21:00']),home:r%2===0,opponent:opp,status:'scheduled',result:null});}
    // Knockout competition dates are interleaved around league rounds.
    const cupOpp=()=>pick(others);
    [6,14,22,30].forEach((r,i)=>fs.push({id:'C'+(i+1),type:'copa',competition:'Copa Nacional',round:i+1,date:iso(new Date(start.getTime()+(r-1)*6*86400000)),time:pick(['19:00','20:00','21:30']),home:i%2===0,opponent:cupOpp(),status:'scheduled',result:null,stage:['Primeira fase','Oitavas de final','Quartas de final','Semifinal'][i]}));
    [10,26].forEach((r,i)=>fs.push({id:'R'+(i+1),type:'regional',competition:'Copa Regional',round:i+1,date:iso(new Date(start.getTime()+(r-1)*6*86400000)),time:'20:00',home:i===0,opponent:cupOpp(),status:'scheduled',result:null,stage:['Quartas de final','Semifinal'][i]}));
    S.fixtures=fs.sort((a,b)=>a.date.localeCompare(b.date)); S.fixtureIndex=0; S.nextOpponent=S.fixtures[0]?.opponent||others[0]; S.nextDate=S.fixtures[0]?.date||S.date;
  }
  function currentFixture(){
    if(!Array.isArray(S.fixtures)||!S.fixtures.length)makeSchedule();
    return S.fixtures.find(f=>f.status==='scheduled')||null;
  }
  function buildLeagueTable(){
    ensureWorld();
    const rows=S.clubs.map(c=>({name:c.name,played:c.played||0,points:c.points||0,gd:c.gd||0,w:c.w||0,d:c.d||0,l:c.l||0,strength:c.strength||60}));
    const mine=rows.find(x=>x.name===S.club); if(mine){mine.played=S.played||mine.played;mine.points=S.points||mine.points;}
    // The rest of the league simulates autonomously, with form/strength producing plausible but variable progress.
    rows.forEach(r=>{if(r.name!==S.club){const target=Math.max(r.played,Math.min(38,(S.played||0)+randInt(-1,1)));while(r.played<target){const p=randInt(0,100);if(p<42){r.points+=3;r.w++;}else if(p<69){r.points+=1;r.d++;}else r.l++;r.played++;r.gd+=randInt(-2,2);}}});
    rows.sort((a,b)=>b.points-a.points||b.gd-a.gd||b.w-a.w||a.name.localeCompare(b.name));
    return rows.map((r,i)=>Object.assign(r,{pos:i+1}));
  }
  function simulateOtherClubs(){
    ensureWorld();
    const table=buildLeagueTable();
    S.clubs.forEach(c=>{const r=table.find(x=>x.name===c.name);if(r){c.played=r.played;c.points=r.points;c.gd=r.gd;c.form=clamp(55+(r.points/(Math.max(1,r.played)*3))*40+randInt(-8,8));}});
    // Transfers, injuries and managerial movement happen independently.
    if(Math.random()<.22){const c=pick(S.clubs.filter(x=>x.name!==S.club)), m=S.managers.find(x=>x.club===c.name);if(m&&c.form<48&&Math.random()<.55){const old=m.name;m.club='Disponível';const nm='Técnico '+pick(FIRST)+' '+pick(LAST);m.name=nm;const newM={name:nm,club:c.name,style:pick(STYLES),skill:randInt(55,83)};S.managers.push(newM);c.manager=nm;world(`Mudança de treinador: ${c.name} substituiu ${old}.`);}}
    if(Math.random()<.35){const sellers=S.players.filter(p=>p.club!==S.club&&p.age<27&&p.ovr>65);if(sellers.length){const p=pick(sellers),to=pick(S.clubs.filter(c=>c.name!==p.club));const from=p.club;p.club=to.name;S.transferHistory.unshift(`${p.name}: ${from} → ${to.name} por R$ ${p.marketValue.toFixed(1)} mi`);if(S.transferHistory.length>30)S.transferHistory.pop();world(`Mercado: ${p.name} transferiu-se para ${to.name}.`);}}
  }
  function transferWindow(){const d=dateObj(S.date);const month=d.getMonth()+1;const day=d.getDate();return (month===1&&day>=1&&day<=31)||(month===7&&day>=1&&day<=31)||(month===8&&day<=15);}
  function refreshWindow(){const open=transferWindow();S.window=open?'aberta':'fechada';if(open&&!S.transferDeadline)S.transferDeadline=iso(new Date(dateObj(S.date).getTime()+Math.min(15,31-dateObj(S.date).getDate())*86400000));}
  function scoutPlayer(){
    ensureWorld();const candidates=S.players.filter(p=>p.club!==S.club&&p.age<30&&!p.injury);if(!candidates.length)return;
    const p=pick(candidates);const uncertainty=randInt(2,9);S.nextScouting.push({id:p.id,name:p.name,club:p.club,pos:p.pos,reportedOvr:clamp(p.ovr+randInt(-uncertainty,uncertainty),45,95),potential:clamp(p.potential+randInt(-uncertainty,uncertainty),45,95),value:p.marketValue,confidence:100-uncertainty*6});if(S.nextScouting.length>8)S.nextScouting.shift();toast('Relatório de scout recebido.');render();
  }
  function signPlayer(id){
    ensureWorld();refreshWindow();if(S.window!=='aberta'){toast('A janela de transferências está fechada.');return;}const p=S.players.find(x=>x.id===id);if(!p||p.club===S.club)return;const fee=p.marketValue*(.85+Math.random()*.55);if(S.money<fee){toast('Orçamento insuficiente.');return;}S.money-=fee;S.squadBudget=Math.max(0,S.squadBudget-fee);p.club=S.club;p.morale=clamp(p.morale+8);p.relation=clamp(p.relation+4);S.transfers.unshift(`${p.name} • R$ ${fee.toFixed(2)} mi • contrato até ${p.contractUntil}`);S.news.push(`Contratação concluída: ${p.name}.`);world(`${S.club} contratou ${p.name} por R$ ${fee.toFixed(2)} mi.`);toast('Transferência concluída.');render();
  }
  function loanPlayer(id){const p=S.players.find(x=>x.id===id);if(!p||p.club===S.club)return;if(!transferWindow()){toast('Janela fechada.');return;}p.club=S.club;p.status='empréstimo';p.morale=clamp(p.morale+5);S.transfers.unshift(`${p.name} • empréstimo`);toast('Empréstimo fechado.');render();}
  function createCupOpponent(f){if(!f)return;const pool=S.clubs.filter(c=>c.name!==S.club).map(c=>c.name);f.opponent=pick(pool);}
  function completeCup(f,r){
    if(f.type==='copa'){if(r==='Vitória'){S.cup.round++;if(S.cup.round>=4){S.cup.winner=true;S.trophies++;S.rep+=8;world(`${S.club} conquistou a Copa Nacional.`);}else{S.cup.stage=['Oitavas de final','Quartas de final','Semifinal','Final'][S.cup.round-1]||'Final';} } else if(r==='Derrota'){S.cup.round=4;S.cup.stage='Eliminado';S.cup.winner=false;}}
    if(f.type==='regional'){if(r==='Vitória'){S.regionalCup.round++;if(S.regionalCup.round>=2){S.regionalCup.winner=true;S.trophies++;S.rep+=5;world(`${S.club} conquistou a Copa Regional.`);}else S.regionalCup.stage='Final';}else if(r==='Derrota'){S.regionalCup.round=2;S.regionalCup.stage='Eliminado';}}
  }
  function finishMatchV3(){
    const f=currentFixture(); if(!f)return;
    const r=S.homeScore>S.awayScore?'Vitória':S.homeScore===S.awayScore?'Empate':'Derrota';
    f.result=`${S.homeScore}-${S.awayScore}`;f.status='played';
    S.lastResult=r;S.games++;
    if(r==='Vitória'){S.wins++;S.trust=clamp(S.trust+7);S.fans=clamp(S.fans+5);S.rep+=2;}else if(r==='Empate'){S.draws++;S.trust=clamp(S.trust+1);S.fans=clamp(S.fans+1);}else{S.losses++;S.trust=clamp(S.trust-9);S.fans=clamp(S.fans-5);S.rep=Math.max(0,S.rep-1);}
    if(f.type==='liga'){S.played++;S.points+=r==='Vitória'?3:r==='Empate'?1:0;const c=S.clubs.find(x=>x.name===S.club);if(c){c.played=S.played;c.points=S.points;c.gd+=S.homeScore-S.awayScore;c.w=r==='Vitória'?(c.w||0)+1:c.w||0;c.d=r==='Empate'?(c.d||0)+1:c.d||0;c.l=r==='Derrota'?(c.l||0)+1:c.l||0;}S.week=S.played+1;}
    else completeCup(f,r);
    S.history.push(`${fmtDate()} • ${f.competition} • ${r}: ${S.club} ${S.homeScore}–${S.awayScore} ${f.opponent}`);S.news.push(`${f.competition}: ${r} contra ${f.opponent}.`);S.objectives[0].progress=Math.max(0,11-(buildLeagueTable().find(x=>x.name===S.club)?.pos||11));
    simulateOtherClubs();advanceWorld();
    if(S.played>=38)finishSeasonV3();
    $('#status').textContent=`Fim: ${r}. ${f.competition} — ${S.club} ${S.homeScore}–${S.awayScore} ${f.opponent}`;render();
  }
  function finishSeasonV3(){
    const table=buildLeagueTable(),pos=table.find(x=>x.name===S.club)?.pos||12;
    const season={season:S.season,position:pos,points:S.points,games:S.played,wins:S.wins,draws:S.draws,losses:S.losses,trophies:S.trophies};S.seasonHistory.push(season);
    if(pos<=4){S.rep+=6;S.trust=clamp(S.trust+8);world(`${S.club} terminou a temporada em ${pos}º lugar.`);}else if(pos>=20){S.trust=clamp(S.trust-12);}
    S.season++;S.manager.careerYears++;S.date=iso(new Date(dateObj(S.date).getTime()+20*86400000));S.played=0;S.points=0;S.week=1;S.wins=0;S.draws=0;S.losses=0;S.cup={round:0,stage:'Primeira fase',drawn:false,opponent:null,score:null,active:false,winner:null};S.regionalCup={round:0,stage:'Quartas',opponent:null,active:false,winner:null};S.transfers=[];S.window='fechada';S.transferDeadline=null;makeSchedule();world(`Nova temporada ${S.season} começou. O mercado e os objetivos foram renovados.`);toast(`Temporada ${season.season} encerrada.`);
  }
  function renderV3(){
    ensureWorld();refreshWindow();
    const f=currentFixture();
    if(f){S.nextOpponent=f.opponent;S.nextDate=f.date;S.nextTime=f.time;}
    // Calendar
    const upcoming=S.fixtures.filter(x=>x.status==='scheduled').slice(0,10);
    const fi=$('#fixtures');if(fi)fi.innerHTML=upcoming.map(x=>`<div class="metric"><span><b>${x.competition}</b><small>${x.date} • ${x.time} • ${x.stage||('Rodada '+x.round)}</small></span><b>${x.home?S.club:x.opponent} ${x.home?'×':'×'} ${x.home?x.opponent:S.club}</b></div>`).join('')||'<div class="metric">Sem jogos pendentes.</div>';
    const co=$('#competitions');if(co)co.innerHTML=`<div class="metric"><span>Brasileirão Série B</span><b>${S.played}/38 • ${S.points} pts</b></div><div class="metric"><span>Copa Nacional</span><b>${S.cup.stage}</b></div><div class="metric"><span>Copa Regional</span><b>${S.regionalCup.stage}</b></div><div class="metric"><span>Janela de transferências</span><b>${S.window==='aberta'?'ABERTA':'FECHADA'}</b></div>`;
    const ss=$('#seasonState');if(ss)ss.innerHTML=`<div class="metric"><span>Temporada</span><b>${S.season}</b></div><div class="metric"><span>Rodada da liga</span><b>${S.played+1}</b></div><div class="metric"><span>Caixa de transferências</span><b>R$ ${S.squadBudget.toFixed(2)} mi</b></div><div class="metric"><span>Folha estimada</span><b>R$ ${S.wageBudget.toFixed(1)} mi/mês</b></div>`;
    // Market becomes a procedural database rather than 3 hard-coded cards.
    const candidates=S.players.filter(p=>p.club!==S.club&&p.age<=30).sort((a,b)=>b.ovr-a.ovr).slice(0,9);
    const mc=$('#marketCards');if(mc)mc.innerHTML=candidates.map(p=>`<div class="card"><h3>${p.name}</h3><p>${p.pos} • ${p.age} anos • ${p.club}</p><div class="metric"><span>Scout</span><b>${p.ovr} OVR</b></div><div class="metric"><span>Potencial</span><b>${p.potential}</b></div><div class="metric"><span>Valor</span><b>R$ ${p.marketValue.toFixed(2)} mi</b></div><button class="primary" onclick="signPlayer('${p.id}')">Negociar contratação</button><button class="secondary" onclick="loanPlayer('${p.id}')">Tentar empréstimo</button></div>`).join('');
    const sc=$('#scouting');if(sc)sc.innerHTML=`<button class="primary" onclick="scoutPlayer()">🔎 Enviar scout</button>`+(S.nextScouting||[]).slice().reverse().map(x=>`<div class="metric"><span>${x.name}<small>${x.club} • ${x.pos} • confiança ${x.confidence}%</small></span><b>${x.reportedOvr}/${x.potential}</b></div>`).join('');
    const de=$('#deals');if(de)de.innerHTML=(S.transfers||[]).slice(0,8).map(x=>`<div class="metric"><span>${x}</span><b>✓</b></div>`).join('')||'<div class="metric">Nenhuma operação concluída nesta janela.</div>';
    // World and league table.
    const table=buildLeagueTable();const tb=$('#table');if(tb)tb.innerHTML=table.map(r=>`<div class="metric"><span><b>${r.pos}º</b> ${r.name}<small>${r.w}V ${r.d}E ${r.l}D</small></span><b>${r.points}</b></div>`).join('');
    const wl=$('#worldLog');if(wl)wl.innerHTML=(S.worldLog||[]).slice(0,18).map(x=>`<div class="news">${x}</div>`).join('')||'<div class="news">O mundo está começando a se movimentar.</div>';
    const mm=$('#managers');if(mm)mm.innerHTML=S.managers.slice(0,14).map(m=>`<div class="metric"><span>${m.name}<small>${m.club} • ${m.style}</small></span><b>${m.skill}</b></div>`).join('');
    const rr=$('#rumors');if(rr)rr.innerHTML=(S.transferHistory||[]).slice(0,10).map(x=>`<div class="news">${x}</div>`).join('')||'<div class="news">Nenhuma transferência recente.</div>';
    const ac=$('#academy');if(ac){const youth=S.players.filter(p=>p.club===S.club&&p.age<21);ac.innerHTML=`<div class="metric"><span>Jovens no clube</span><b>${youth.length}</b></div>`+youth.slice(0,5).map(p=>`<div class="metric"><span>${p.name}<small>${p.age} anos • ${p.pos}</small></span><b>${p.ovr}/${p.potential}</b></div>`).join('');}
    const med=$('#medical');if(med)med.innerHTML=`<div class="metric"><span>Lesionados</span><b>${S.players.filter(p=>p.club===S.club&&p.injury).length}</b></div><div class="metric"><span>Capacidade médica</span><b>${S.facilities.medical}</b></div>`;
    const careerHistory=$('#history');if(careerHistory)careerHistory.innerHTML=S.seasonHistory.slice().reverse().map(x=>`<div class="metric"><span>Temporada ${x.season}<small>${x.games} jogos • ${x.wins}V ${x.draws}E ${x.losses}D</small></span><b>${x.position}º • ${x.points} pts</b></div>`).join('')||'<div class="metric">Primeira temporada em andamento.</div>';
    $('#careerRep').textContent=Math.round(S.rep);$('#trophies').textContent=S.trophies;$('#careerGames').textContent=S.games;$('#careerRecord').textContent=`${S.wins} • ${S.draws} • ${S.losses}`;
  }
  render=function(){oldRender();try{renderV3();}catch(e){console.error(e);}};
  finishMatch=finishMatchV3;
  saveGame=function(){ensureWorld();localStorage.fmUltraWorld=JSON.stringify(S);toast('Carreira completa salva no dispositivo.');};
  // Replace day simulation with autonomous world progression and window-aware player development.
  const oldAdvanceDay=advanceDay;
  advanceDay=function(){ensureWorld();const d=dateObj(S.date);d.setDate(d.getDate()+1);S.date=iso(d);S.day=d.getDate();refreshWindow();dailySimulationV3();simulateOtherClubs();render();toast('Dia avançado: o mundo continuou sem esperar por você.');};
  dailySimulation=function(){dailySimulationV3();};
  function dailySimulationV3(){
    ensureWorld();refreshWindow();
    S.players.forEach(p=>{if(p.injury){p.injury.days--;if(p.injury.days<=0){p.injury=null;if(p.club===S.club)world(`${p.name} voltou ao treinamento.`);}}p.cond=clamp(p.cond+(p.training==='Recuperação'?3:1));p.fatigue=Math.max(0,p.fatigue-3);if(p.club===S.club&&p.age<25&&Math.random()<.035)p.ovr=clamp(p.ovr+(p.ovr<p.potential?.1:0),40,95);});
    if(Math.random()<.18)generateWorldEvent();
    if(S.day%7===0){generateMarketRumor();S.money=Math.max(0,S.money+1.1-S.players.filter(p=>p.club===S.club).length*.025);}
    if(S.day%30===0){S.rep+=S.trust>60?.5:-.3;}
  }
  // Generate a new world on first load, but retain saves.
  ensureWorld();
  if(!S.fixtures||S.fixtures.length<45||!S.fixtures.some(x=>x.type==='copa'))makeSchedule();
  // Current match start always uses the actual next fixture.
  startMatch=function(){const f=currentFixture();if(!f){toast('Não há partida disponível.');return;}if(S.matchStarted&&S.minute<90)return;S.running=true;S.matchStarted=true;S.minute=0;S.sec=0;S.homeScore=0;S.awayScore=0;S.events=[];S.nextOpponent=f.opponent;S.nextDate=f.date;S.nextTime=f.time;ball={x:700,y:300,vx:-1.1,vy:.4};$('#status').textContent=`Partida iniciada: ${f.competition} — ${f.stage||('Rodada '+f.round)}.`;add('Apito inicial.','⚽');render();draw();};
  // Ensure save migration is persisted only when user explicitly saves.
  render();
})();


/* =========================================================
   FM ULTRA v4 — DEEP MATCH ENGINE
   Escalação real, funções, instruções individuais, banco,
   substituições, cartões, lesões, impedimentos, pênaltis,
   bolas paradas, xG por zona, ajustes do adversário e
   acompanhamento minuto a minuto.
   ========================================================= */
(function(){
  const MATCH_POSITIONS = ['GOL','LD','ZAG','ZAG','LE','VOL','MC','MEI','MD','ATA','ATA'];
  const ROLE_BY_POS = {
    GOL:'Goleiro', LD:'Lateral', LE:'Lateral', ZAG:'Zagueiro',
    VOL:'Volante', MC:'Meio-campista', MEI:'Armador', MD:'Ponta',
    AE:'Ponta', ATA:'Atacante'
  };
  const ZONES = ['Construção','Corredor esquerdo','Meio','Corredor direito','Área'];
  const INSTRUCTIONS = {
    GOL:['Construir curto','Lançar longo','Sair do gol'],
    LD:['Apoiar ataque','Equilibrado','Ficar atrás'],
    LE:['Apoiar ataque','Equilibrado','Ficar atrás'],
    ZAG:['Sair jogando','Marcar homem','Cobrir profundidade'],
    VOL:['Proteger defesa','Equilibrar','Chegar à área'],
    MC:['Controlar ritmo','Apoiar','Infiltrar'],
    MEI:['Criar entrelinhas','Apoiar ponta','Chegar à área'],
    MD:['Abrir campo','Atacar espaço','Recompor'],
    AE:['Abrir campo','Atacar espaço','Recompor'],
    ATA:['Fixar zagueiros','Atacar profundidade','Pressionar saída']
  };
  const ROLE_EFFECT = {
    'Proteger defesa':{def:.08,atk:-.03}, 'Chegar à área':{def:-.03,atk:.08},
    'Atacar profundidade':{atk:.09,off:.06}, 'Fixar zagueiros':{atk:.07,off:.03},
    'Pressionar saída':{press:.09,def:.02}, 'Recompor':{def:.08,atk:-.02},
    'Apoiar ataque':{atk:.06,def:-.02}, 'Ficar atrás':{def:.07,atk:-.04},
    'Sair jogando':{build:.08,def:.02}, 'Cobrir profundidade':{def:.09},
    'Marcar homem':{def:.07,press:.02}, 'Controlar ritmo':{build:.08,atk:.03},
    'Infiltrar':{atk:.08,off:.05}, 'Criar entrelinhas':{build:.09,off:.06},
    'Apoiar':{atk:.04}, 'Abrir campo':{atk:.05,off:.04},
    'Atacar espaço':{atk:.08,off:.06}, 'Equilibrado':{atk:.02,def:.02},
    'Lançar longo':{build:-.03,off:.04}, 'Construir curto':{build:.08,atk:.02},
    'Sair do gol':{def:.05,press:.03}
  };

  function ensureMatchEngine(){
    S.match = S.match || {};
    const m=S.match;
    m.started=!!m.started;
    m.homeXI=Array.isArray(m.homeXI)?m.homeXI:[];
    m.bench=Array.isArray(m.bench)?m.bench:[];
    m.instructions=m.instructions||{};
    m.playerStats=m.playerStats||{};
    m.cards=m.cards||{};
    m.substitutions=Array.isArray(m.substitutions)?m.substitutions:[];
    m.minuteLog=Array.isArray(m.minuteLog)?m.minuteLog:[];
    m.shots=Array.isArray(m.shots)?m.shots:[];
    m.possession=m.possession||{home:50,away:50};
    m.zones=m.zones||{home:'Meio',away:'Meio'};
    m.tactical=m.tactical||{home:'Plano inicial',away:'Contra-ataque'};
    m.setPieces=m.setPieces||{home:0,away:0};
    m.penalties=m.penalties||{home:0,away:0};
    m.offsides=m.offsides||{home:0,away:0};
    m.corners=m.corners||{home:0,away:0};
    m.fouls=m.fouls||{home:0,away:0};
    m.yellow=m.yellow||{home:0,away:0};
    m.red=m.red||{home:0,away:0};
    m.xg=m.xg||{home:0,away:0};
    m.lastEvent=m.lastEvent||'Aguardando o apito inicial.';
    m.phase=m.phase||'Pré-jogo';
    m.subsUsed=m.subsUsed||0;
    m.maxSubs=m.maxSubs||5;
    m.pauseReason='';
    return m;
  }

  function squadPlayers(){
    ensureWorld();
    return S.players.filter(p=>p.club===S.club && !p.injury);
  }

  function setupLineup(){
    const m=ensureMatchEngine();
    const squad=squadPlayers();
    const used=new Set();
    const xi=[];
    // Prefer an XI that respects the base positional order.
    MATCH_POSITIONS.forEach(pos=>{
      let p=squad.find(x=>!used.has(x.id)&&x.pos===pos);
      if(!p) p=squad.find(x=>!used.has(x.id)&&['ZAG'].includes(pos)&&x.pos==='ZAG');
      if(!p) p=squad.find(x=>!used.has(x.id));
      if(p){ used.add(p.id); xi.push(p.id); }
    });
    m.homeXI=xi.slice(0,11);
    m.bench=squad.filter(p=>!used.has(p.id)).slice(0,9).map(p=>p.id);
    m.instructions={};
    m.playerStats={};
    m.homeXI.forEach(id=>{
      const p=S.players.find(x=>x.id===id);
      if(!p)return;
      const options=INSTRUCTIONS[p.pos]||['Equilibrado'];
      m.instructions[id]=options[1]||options[0];
      m.playerStats[id]={minutes:0,shots:0,keyPasses:0,tackles:0,passes:0,duels:0,goals:0,assists:0,rating:6.5};
    });
    return m;
  }

  function activePlayers(){
    const m=ensureMatchEngine();
    return m.homeXI.map(id=>S.players.find(p=>p.id===id)).filter(Boolean);
  }

  function benchPlayers(){
    const m=ensureMatchEngine();
    return m.bench.map(id=>S.players.find(p=>p.id===id)).filter(Boolean);
  }

  function playerInstruction(p){
    const m=ensureMatchEngine();
    return m.instructions[p.id] || (INSTRUCTIONS[p.pos]||['Equilibrado'])[0];
  }

  function playerRoleScore(p){
    const ins=playerInstruction(p), e=ROLE_EFFECT[ins]||{};
    return {
      atk:(p.ovr/80)+(e.atk||0)+(e.off||0),
      def:(p.ovr/80)+(e.def||0),
      press:e.press||0,
      build:e.build||0
    };
  }

  function teamPower(){
    const m=ensureMatchEngine(), ps=activePlayers();
    if(!ps.length)return {atk:0,def:0,press:0,build:0,cond:0,morale:0};
    let out={atk:0,def:0,press:0,build:0,cond:0,morale:0};
    ps.forEach(p=>{
      const q=playerRoleScore(p);
      out.atk+=q.atk; out.def+=q.def; out.press+=q.press; out.build+=q.build;
      out.cond+=p.cond; out.morale+=p.morale;
    });
    out.atk/=ps.length;out.def/=ps.length;out.cond/=ps.length;out.morale/=ps.length;
    out.atk*=S.mental==='Ofensiva'?1.08:S.mental==='Defensiva'?.91:1;
    out.def*=S.mental==='Defensiva'?1.08:S.mental==='Ofensiva'?.94:1;
    out.press*=S.press==='Alta'?1.18:S.press==='Baixa'?.82:1;
    return out;
  }

  function oppPower(){
    const f=currentFixture();
    const c=S.clubs.find(x=>x.name===f?.opponent);
    const m=ensureMatchEngine();
    const style=m.tactical.away||'Contra-ataque';
    let base=(c?.strength||64)/64;
    if(style==='Pressão alta') return {atk:base*1.05,def:base*.94,press:.16,build:.08};
    if(style==='Bloco baixo') return {atk:base*.92,def:base*1.09,press:-.04,build:.03};
    if(style==='Posse/pressão') return {atk:base*1.02,def:base*1.0,press:.12,build:.12};
    if(style==='Jogo direto') return {atk:base*1.04,def:base*.97,press:.02,build:-.02};
    return {atk:base,def:base,press:.05,build:.04};
  }

  function tacticalStyleByMinute(){
    const m=ensureMatchEngine(), minute=S.minute;
    if(minute<25)return 'Plano inicial';
    if(S.homeScore<S.awayScore && minute>=55)return 'Pressão alta';
    if(S.homeScore>S.awayScore && minute>=70)return 'Bloco baixo';
    if(minute>=60 && m.possession.away>55)return 'Explorar transição';
    if(minute>=40)return 'Atacar corredor';
    return 'Contra-ataque';
  }

  function updateOpponentAI(){
    const m=ensureMatchEngine();
    const old=m.tactical.away;
    const next=tacticalStyleByMinute();
    if(old!==next){
      m.tactical.away=next;
      m.lastEvent=`Adversário alterou o plano: ${next}.`;
      add(`Adversário mudou: ${next}.`,'🧩');
    }
    m.zones.away = next==='Atacar corredor' ? (Math.random()<.5?'Corredor esquerdo':'Corredor direito')
      : next==='Pressão alta'?'Construção':'Meio';
  }

  function addMatchLog(text,icon='•'){
    const m=ensureMatchEngine();
    m.minuteLog.unshift({minute:S.minute,text,icon});
    if(m.minuteLog.length>120)m.minuteLog.pop();
    m.lastEvent=text;
    add(text,icon);
  }

  function weighted(a,b){
    return Math.random()*(a+b)<a;
  }

  function zoneDifficulty(zone){
    return {Construção:.78,'Corredor esquerdo':.9,Meio:1,'Corredor direito':.9,Área:1.18}[zone]||1;
  }

  function createShot(team, zone, quality, player){
    const m=ensureMatchEngine();
    const base={Construção:.055,'Corredor esquerdo':.075,Meio:.09,'Corredor direito':.075,Área:.24}[zone]||.08;
    let xg=Math.max(.02,Math.min(.62,base*quality*zoneDifficulty(zone)));
    if(S.mental==='Ofensiva'&&team==='home')xg*=1.10;
    if(S.mental==='Defensiva'&&team==='home')xg*=.88;
    m.xg[team]+=xg;
    m.shots.push({minute:S.minute,team,zone,xg:+xg.toFixed(3),player:player?.name||'Adversário',onTarget:Math.random()<Math.min(.82,xg*2.2)});
    if(team==='home'&&player){
      const st=m.playerStats[player.id]||(m.playerStats[player.id]={minutes:0,shots:0,keyPasses:0,tackles:0,passes:0,duels:0,goals:0,assists:0,rating:6.5});
      st.shots++;
    }
    return xg;
  }

  function maybeGoal(team, xg, player){
    const m=ensureMatchEngine();
    const keeperPenalty=team==='home'?0:0;
    const chance=Math.min(.34,xg*(team==='home'?1.05:1));
    if(Math.random()<chance){
      if(team==='home'){
        S.homeScore++;
        if(player){
          player.goals=(player.goals||0)+1;
          const st=m.playerStats[player.id]||{};
          st.goals=(st.goals||0)+1;
          st.rating=(st.rating||6.5)+.55;
        }
        addMatchLog(`GOOOOL! ${player?.name||'RB Academia'} finalizou após uma sequência de ${m.zones.home.toLowerCase()}.`,'🟢');
      }else{
        S.awayScore++;
        addMatchLog(`GOOOOL do ${S.nextOpponent}! O adversário encontrou espaço em ${m.zones.away.toLowerCase()}.`,'🔴');
      }
      return true;
    }
    return false;
  }

  function chooseHomeZone(){
    const m=ensureMatchEngine(), p=teamPower();
    const candidates=[
      ['Corredor esquerdo',p.atk*.95],
      ['Meio',p.build+p.atk],
      ['Corredor direito',p.atk*.95],
      ['Área',p.atk*1.1]
    ];
    if(S.mental==='Ofensiva')candidates[3][1]*=1.2;
    if(S.press==='Alta')candidates[1][1]*=1.08;
    return candidates.sort((a,b)=>b[1]-a[1])[Math.floor(Math.random()*Math.min(2,candidates.length))][0];
  }

  function foulAndDiscipline(team, player){
    const m=ensureMatchEngine();
    m.fouls[team]++;
    if(team==='home'&&player){
      if(Math.random()<.085){
        const old=m.cards[player.id]||0;
        m.cards[player.id]=old+1;
        if(old>=1){
          m.red.home++;
          addMatchLog(`${player.name} recebe o segundo amarelo e é expulso.`,'🟥');
          m.homeXI=m.homeXI.filter(id=>id!==player.id);
          return 'red';
        }else{
          m.yellow.home++;
          addMatchLog(`${player.name} recebe cartão amarelo.`,'🟨');
        }
      }
    }
    return 'foul';
  }

  function maybeSetPiece(team){
    const m=ensureMatchEngine();
    if(Math.random()>.07)return false;
    const kind=pick(['escanteio','falta lateral','falta direta']);
    m.setPieces[team]++;
    if(team==='home'){
      const taker=activePlayers().find(p=>['MEI','MD','AE','ATA'].includes(p.pos))||activePlayers()[0];
      const xg=kind==='falta direta'?.045:.065;
      m.xg.home+=xg;
      addMatchLog(`${kind[0].toUpperCase()+kind.slice(1)} para o RB Academia. ${taker?.name||'Batedor'} assume a cobrança.`,'🎯');
      if(Math.random()<xg*2.8){
        if(kind==='falta direta'){
          S.homeScore++;
          if(taker)taker.goals=(taker.goals||0)+1;
          addMatchLog(`GOOOOL de bola parada! ${taker?.name||'O cobrador'} acerta o alvo.`,'🟢');
        }else{
          const fin=pick(activePlayers().filter(p=>['ZAG','ATA','VOL'].includes(p.pos))||activePlayers());
          if(fin){S.homeScore++;fin.goals=(fin.goals||0)+1;addMatchLog(`GOOOOL de cabeça após ${kind}! ${fin.name} apareceu na área.`,'🟢');}
        }
        return true;
      }
    }else{
      m.xg.away+=kind==='falta direta'?.05:.055;
      addMatchLog(`${kind[0].toUpperCase()+kind.slice(1)} para ${S.nextOpponent}.`,'🎯');
      if(Math.random()<.07){S.awayScore++;addMatchLog(`Gol de bola parada do ${S.nextOpponent}.`,'🔴');return true;}
    }
    return false;
  }

  function maybePenalty(){
    const m=ensureMatchEngine();
    if(Math.random()>.018)return false;
    const team=weighted(55,45)?'home':'away';
    m.penalties[team]++;
    const xg=.76;
    m.xg[team]+=xg;
    addMatchLog(`PÊNALTI para ${team==='home'?S.club:S.nextOpponent}!`,'⚠️');
    if(Math.random()<.77){
      if(team==='home'){
        S.homeScore++;
        const taker=activePlayers().find(p=>p.pos==='ATA')||activePlayers()[0];
        if(taker)taker.goals=(taker.goals||0)+1;
        addMatchLog(`Pênalti convertido por ${taker?.name||'o cobrador'}.`,'🟢');
      }else{
        S.awayScore++;
        addMatchLog(`Pênalti convertido pelo ${S.nextOpponent}.`,'🔴');
      }
    }else addMatchLog('Pênalti desperdiçado! O goleiro defendeu ou a cobrança saiu.','🧤');
    return true;
  }

  function maybeOffside(team, zone){
    const chance=team==='home'
      ? .025 + (S.press==='Alta'?.008:0) + (zone==='Área'?.008:0)
      : .028;
    if(Math.random()<chance){
      const m=ensureMatchEngine();
      m.offsides[team]++;
      addMatchLog(`Impedimento marcado para ${team==='home'?S.club:S.nextOpponent}.`,'🚩');
      return true;
    }
    return false;
  }

  function maybeInjury(){
    const m=ensureMatchEngine(), ps=activePlayers().filter(p=>p.cond<78||p.fatigue>14);
    if(!ps.length||Math.random()>.006)return;
    const p=pick(ps);
    p.injury={days:randInt(4,30)};
    addMatchLog(`${p.name} sente uma lesão e precisa de atendimento.`, '🩺');
    if(!m.substitutions.some(x=>x.out===p.id))m.pauseReason=`${p.name} precisa ser substituído.`;
  }

  function autoSubSuggestion(){
    const m=ensureMatchEngine();
    if(m.subsUsed>=m.maxSubs)return null;
    const tired=activePlayers().filter(p=>p.cond<60||p.fatigue>22);
    if(!tired.length)return null;
    const out=pick(tired);
    const candidates=benchPlayers().filter(p=>p.pos===out.pos);
    const inn=(candidates.length?pick(candidates):benchPlayers()[0]);
    if(!inn)return null;
    return {out,inn,reason:out.cond<50?'condição física':out.fatigue>22?'fadiga':'gestão de minutos'};
  }

  function makeSub(outId,inId,reason='decisão do treinador'){
    const m=ensureMatchEngine();
    if(m.subsUsed>=m.maxSubs)return false;
    const out=m.homeXI.find(id=>id===outId);
    const inn=m.bench.find(id=>id===inId);
    if(!out||!inn)return false;
    m.homeXI[m.homeXI.indexOf(out)]=inn;
    m.bench=m.bench.filter(id=>id!==inn);m.bench.push(out);
    m.subsUsed++;
    const pOut=S.players.find(p=>p.id===outId),pIn=S.players.find(p=>p.id===inId);
    if(pIn){
      m.playerStats[pIn.id]=m.playerStats[pIn.id]||{minutes:0,shots:0,keyPasses:0,tackles:0,passes:0,duels:0,goals:0,assists:0,rating:6.4};
      m.playerStats[pIn.id].minutes=0;
    }
    m.substitutions.push({minute:S.minute,out:outId,inn:inId,reason});
    addMatchLog(`Substituição: ${pOut?.name||'Jogador'} sai, ${pIn?.name||'jogador'} entra (${reason}).`,'🔄');
    m.pauseReason='';
    return true;
  }

  window.subPlayer=function(outId,inId){ if(makeSub(outId,inId,'decisão manual')){toast('Substituição realizada.');render();} };

  window.setPlayerInstruction=function(id){
    const p=S.players.find(x=>x.id===id); if(!p)return;
    const opts=INSTRUCTIONS[p.pos]||['Equilibrado'];
    const m=ensureMatchEngine(), idx=Math.max(0,opts.indexOf(m.instructions[id]));
    m.instructions[id]=opts[(idx+1)%opts.length];
    toast(`${p.name}: ${m.instructions[id]}`);
    render();
  };

  window.changeFormation=function(){
    const forms=['4-2-3-1','4-3-3','4-4-2','3-4-3','5-3-2'];
    const idx=forms.indexOf(S.formation);
    S.formation=forms[(idx+1)%forms.length];
    addMatchLog(`Formação alterada para ${S.formation}.`,'📐');
    render();
  };

  function enhancedMatchRender(){
    const m=ensureMatchEngine();
    const lineup=$('#lineup'), bench=$('#bench'), decision=$('#decision'), tactical=$('#tacticalRead'), stats=$('#matchstats'), opp=$('#oppAI');
    if(lineup){
      lineup.innerHTML=`<div class="match-mini"><b>${S.formation}</b><span>${m.homeXI.length}/11 titulares</span></div>`+
      m.homeXI.map((id,i)=>{
        const p=S.players.find(x=>x.id===id);if(!p)return '';
        const card=m.cards[id]===1?'🟨':m.cards[id]>=2?'🟥':'';
        return `<div class="line player-line"><b>${i+1}</b><span><b>${p.name}</b><small>${p.pos} • ${ROLE_BY_POS[p.pos]||p.pos} ${card}</small></span><span>${p.cond}%</span><button class="tiny" onclick="setPlayerInstruction('${p.id}')">${m.instructions[p.id]||'Equilibrado'}</button></div>`;
      }).join('');
    }
    if(bench){
      bench.innerHTML=`<div class="match-mini"><b>Substituições ${m.subsUsed}/${m.maxSubs}</b><span>Banco</span></div>`+
      benchPlayers().map(p=>`<div class="metric"><span><b>${p.name}</b><small>${p.pos} • ${p.cond}%</small></span><button class="tiny" onclick="window._subPick('${p.id}')">Entrar</button></div>`).join('');
    }
    if(decision){
      const sug=autoSubSuggestion();
      decision.innerHTML=
        `<div class="decision-grid"><button class="choice" onclick="changeFormation()">📐 Formação: ${S.formation}</button>`+
        `<button class="choice" onclick="S.mental=S.mental==='Ofensiva'?'Defensiva':'Ofensiva';addMatchLog('Mentalidade: '+S.mental+'.','🧠');render()">🧠 ${S.mental}</button>`+
        `<button class="choice" onclick="S.press=S.press==='Alta'?'Baixa':'Alta';addMatchLog('Pressão: '+S.press+'.','🔥');render()">🔥 ${S.press}</button>`+
        `</div><div class="metric"><span>Último evento</span><b>${m.lastEvent}</b></div>`+
        (sug?`<div class="suggestion">💡 ${sug.out.name} está em ${sug.cond}% — considerar ${sug.inn.name} (${sug.reason}).</div>`:'');
    }
    if(tactical){
      const p=teamPower();
      tactical.innerHTML=[
        ['Formação',S.formation],['Mentalidade',S.mental],['Pressão',S.press],['Linha',S.line],
        ['Zona dominante',m.zones.home],['Plano adversário',m.tactical.away],
        ['Posse',`${m.possession.home}% / ${m.possession.away}%`],
        ['xG',`${m.xg.home.toFixed(2)} / ${m.xg.away.toFixed(2)}`],
        ['Último ajuste',m.lastEvent]
      ].map(x=>`<div class="metric"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('');
      tactical.innerHTML+=`<div class="zonebar">${ZONES.map(z=>`<span class="${m.zones.home===z?'active':''}">${z}</span>`).join('')}</div>`;
    }
    if(stats){
      const shots=m.shots.filter(x=>x.team==='home').length, osh=m.shots.filter(x=>x.team==='away').length;
      stats.innerHTML=[
        ['Posse',`${m.possession.home}% / ${m.possession.away}%`],
        ['Finalizações',`${shots} / ${osh}`],
        ['No alvo',`${m.shots.filter(x=>x.team==='home'&&x.onTarget).length} / ${m.shots.filter(x=>x.team==='away'&&x.onTarget).length}`],
        ['xG',`${m.xg.home.toFixed(2)} / ${m.xg.away.toFixed(2)}`],
        ['Escanteios',`${m.corners.home} / ${m.corners.away}`],
        ['Faltas',`${m.fouls.home} / ${m.fouls.away}`],
        ['Impedimentos',`${m.offsides.home} / ${m.offsides.away}`],
        ['Amarelos',`${m.yellow.home} / ${m.yellow.away}`],
        ['Vermelhos',`${m.red.home} / ${m.red.away}`],
        ['Pênaltis',`${m.penalties.home} / ${m.penalties.away}`]
      ].map(x=>`<div class="metric"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('');
    }
    if(opp){
      opp.innerHTML=`<div class="metric"><span>Formação observada</span><b>${m.tactical.away==='Bloco baixo'?'5-4-1':m.tactical.away==='Pressão alta'?'4-3-3':'4-2-3-1'}</b></div>`+
      `<div class="metric"><span>Plano</span><b>${m.tactical.away}</b></div>`+
      `<div class="metric"><span>Zona</span><b>${m.zones.away}</b></div>`+
      `<div class="metric"><span>Leitura</span><b>${m.possession.away>55?'domínio territorial':'buscando transição'}</b></div>`;
    }
    const ev=$('#events');
    if(ev)ev.innerHTML=m.minuteLog.slice(0,18).map(e=>`<div class="event"><b>${e.minute}'</b> ${e.icon} ${e.text}</div>`).join('')||'<div class="event">Partida ainda não iniciada.</div>';
  }

  window._subPick=function(inId){
    const m=ensureMatchEngine();
    const out=activePlayers().find(p=>p.cond<64||p.fatigue>20)||activePlayers()[0];
    if(out)makeSub(out.id,inId,'substituição manual');
    render();
  };

  // Replaces the old probabilistic minute engine with event-driven match simulation.
  const oldTick=window.tick;
  tick=function(){
    if(!S.running)return;
    ensureMatchEngine();
    S.sec+=S.speed;
    if(S.sec>=60){
      S.minute++;S.sec=0;deepMatchMinute();
    }
    // Ball animation remains visual; match state is now event-driven.
    ball.x+=ball.vx*S.speed;ball.y+=ball.vy*S.speed;
    if(ball.x<45||ball.x>1055)ball.vx*=-1;
    if(ball.y<40||ball.y>560)ball.vy*=-1;
    if(S.minute>=90){S.running=false;finishMatch();}
    render();draw();
  };

  function deepMatchMinute(){
    const m=ensureMatchEngine();
    if(S.minute===1){m.phase='1º tempo';m.tactical.away=m.tactical.away||'Contra-ataque';}
    if(S.minute===46){m.phase='2º tempo';addMatchLog('Intervalo encerrado. As equipes retornam com novos ajustes.','⏱️');}
    if(S.minute===61){updateOpponentAI();}
    if(S.minute===76){updateOpponentAI();}
    const p=teamPower(), o=oppPower();
    const tempo=(S.mental==='Ofensiva'?1.18:S.mental==='Defensiva'?.82:1);
    const chanceAttack=.16*tempo*(.78+p.atk/2.8)*(S.press==='Alta'?1.08:1);
    const chanceOpp=.14*(.82+o.atk/1.9)*(m.tactical.away==='Pressão alta'?1.08:1);
    const eventRoll=Math.random();

    // Fitness and minutes.
    activePlayers().forEach(pl=>{
      pl.cond=clamp(pl.cond-(S.press==='Alta'?0.55:.32));
      pl.fatigue=(pl.fatigue||0)+(S.press==='Alta'?.45:.25);
      const st=m.playerStats[pl.id]||(m.playerStats[pl.id]={minutes:0,shots:0,keyPasses:0,tackles:0,passes:0,duels:0,goals:0,assists:0,rating:6.5});
      st.minutes++;
      st.passes+=randInt(0,3);
      st.duels+=randInt(0,1);
      if(Math.random()<.08)st.tackles++;
    });

    if(m.pauseReason && m.subsUsed<m.maxSubs){
      const injured=activePlayers().find(p=>p.injury);
      if(injured){
        const b=benchPlayers().find(x=>x.pos===injured.pos)||benchPlayers()[0];
        if(b)makeSub(injured.id,b.id,'lesão');
      }
    }

    if(eventRoll<chanceAttack/3){
      const zone=chooseHomeZone();m.zones.home=zone;
      const shooter=pick(activePlayers().filter(x=>x.pos==='ATA'||x.pos==='MEI'||x.pos==='MD'||x.pos==='AE')||activePlayers());
      if(!maybeOffside('home',zone)){
        const q=Math.max(.55,(p.atk/1.35)*(shooter?.ovr||65)/80);
        const xg=createShot('home',zone,q,shooter);
        addMatchLog(`${shooter?.name||'A equipe'} finaliza de ${zone.toLowerCase()} (${xg.toFixed(2)} xG).`,xg>.18?'🎯':'⚽');
        maybeGoal('home',xg,shooter);
      }
    }else if(eventRoll<chanceAttack/3+chanceOpp/3){
      m.zones.away=m.tactical.away==='Atacar corredor'?(Math.random()<.5?'Corredor esquerdo':'Corredor direito'):'Meio';
      if(!maybeOffside('away',m.zones.away)){
        const xg=createShot('away',m.zones.away,Math.max(.5,o.atk/1.15),null);
        addMatchLog(`${S.nextOpponent} encontra espaço e finaliza (${xg.toFixed(2)} xG).`,'🔴');
        maybeGoal('away',xg,null);
      }
    }else if(eventRoll<chanceAttack+chanceOpp){
      const homeFoul=weighted(p.def*(S.press==='Alta'?1.12:1),o.def);
      foulAndDiscipline(homeFoul?'home':'away',homeFoul?pick(activePlayers()):null);
      maybeSetPiece(homeFoul?'away':'home');
    }else if(eventRoll<chanceAttack+chanceOpp+.035){
      maybePenalty();
    }else{
      const zone=pick(ZONES);m.zones.home=zone;
      addMatchLog(`Posse disputada no ${zone.toLowerCase()}; o adversário ajusta a marcação.`,'◉');
    }

    maybeInjury();

    // Passive possession based on tactics and current score.
    let home=50+(p.build-o.build)*5+(S.press==='Alta'?4:0)+(S.mental==='Ofensiva'?3:S.mental==='Defensiva'?-3:0);
    home=clamp(Math.round(home+randInt(-3,3)),28,72);
    m.possession={home,away:100-home};

    if([15,30,45,60,75,90].includes(S.minute))updateOpponentAI();

    // Cards from aggressive pressure.
    if(S.press==='Alta'&&Math.random()<.025){
      const pl=pick(activePlayers());
      if(pl)foulAndDiscipline('home',pl);
    }
  }

  const baseStart=startMatch;
  startMatch=function(){
    const f=currentFixture();
    if(!f){toast('Não há partida disponível.');return;}
    if(S.matchStarted&&S.minute<90)return;
    ensureMatchEngine();setupLineup();
    const m=S.match;
    Object.assign(m,{
      started:true,minuteLog:[],shots:[],substitutions:[],subsUsed:0,
      cards:{},yellow:{home:0,away:0},red:{home:0,away:0},
      xg:{home:0,away:0},penalties:{home:0,away:0},
      offsides:{home:0,away:0},fouls:{home:0,away:0},
      corners:{home:0,away:0},setPieces:{home:0,away:0},
      possession:{home:50,away:50},zones:{home:'Meio',away:'Meio'},
      tactical:{home:'Plano inicial',away:pick(['Contra-ataque','Posse/pressão','Bloco baixo'])},
      phase:'1º tempo',lastEvent:'Apito inicial.'
    });
    S.running=true;S.matchStarted=true;S.minute=0;S.sec=0;S.homeScore=0;S.awayScore=0;S.events=[];
    S.nextOpponent=f.opponent;S.nextDate=f.date;S.nextTime=f.time;
    ball={x:700,y:300,vx:-1.1,vy:.4};
    $('#status').textContent=`Partida iniciada: ${f.competition} — ${f.stage||('Rodada '+f.round)}.`;
    addMatchLog('Apito inicial.','⚽');render();draw();
  };

  const baseRender=render;
  render=function(){
    baseRender();
    try{enhancedMatchRender();}catch(e){console.error('Deep match render',e);}
  };

  // Keep match state compatible with old saves.
  ensureMatchEngine();
  render();
})();

