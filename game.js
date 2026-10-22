'use strict';
// ===== setup =====
const $=i=>document.getElementById(i),cv=$('c');
let g=cv.getContext('2d'),W,H,HOR,GY,RW,LS,K;
const R=(a,b)=>a+Math.random()*(b-a),P=a=>a[Math.random()*a.length|0],cl=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
function rs(){const d=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*d;cv.height=H*d;g.setTransform(d,0,0,d,0,0);HOR=H*.3;GY=H*.82;RW=Math.min(W*.95,H*.8);LS=RW/3;K=LS/190}
addEventListener('resize',rs);rs();
// perspective: z = distance ahead of player (0 = player)
const sc=z=>1/(1+z*.12),Yz=z=>HOR+(GY-HOR)*sc(z),Xz=(l,z)=>W/2+l*LS*sc(z);
const rr=(x,y,w,h,r)=>{g.beginPath();g.roundRect?g.roundRect(x,y,w,h,r):g.rect(x,y,w,h)};
const fr=(x,y,w,h,r,c)=>{rr(x,y,w,h,r);g.fillStyle=c;g.fill()};
const dot=(x,y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,7);g.fill()};
function T(t,x,y,s,c,al){g.font=`${s}px Impact,"Arial Black",sans-serif`;g.textAlign=al||'center';g.textBaseline='middle';g.lineWidth=Math.max(3,s*.14);g.strokeStyle='#000a';g.lineJoin='round';g.strokeText(t,x,y);g.fillStyle=c||'#fff';g.fillText(t,x,y)}
function beep(f,d,t,v){SND.tone(f,d,t,v)}

// ===== data =====
const SK=['#e0ac82','#c68642','#f1c27d','#8d5524'];
const CH=[
{n:'Chhatra',d:'Tez lane change, unchi chhalang',sk:SK[0],sh:'#e63946',pt:'#2b4c7e',hr:'#222',ty:'bag',gap:2,jump:5.9,lsw:16,sh0:0,mag:0,spd:1},
{n:'Singer',d:'Har 20 coin par gaana: police peeche',sk:SK[2],sh:'#9b5de5',pt:'#222',hr:'#5b2a12',ty:'mic',gap:2,jump:5.3,lsw:12,sh0:0,mag:0,spd:1},
{n:'Dadu',d:'Shield ke saath shuru, par dheere',sk:SK[1],sh:'#f4f1de',pt:'#f4f1de',hr:'#eee',ty:'old',gap:2,jump:5.1,lsw:10,sh0:1,mag:0,spd:.9},
{n:'Influencer',d:'Coin magnet hamesha on',sk:SK[0],sh:'#2ec4b6',pt:'#fff',hr:'#111',ty:'live',gap:2,jump:5.3,lsw:12,sh0:0,mag:1,spd:1},
{n:'Cockroach',d:'Ek extra jaan: 3 chance',sk:'#7a4b1e',sh:'#6b4423',pt:'#4a2f14',hr:'#3a240f',ty:'roach',gap:3,jump:5.3,lsw:14,sh0:0,mag:0,spd:1}];
const ABIL={
Chhatra:{i:'📕',n:'Kitaab Bomb',d:'aage wale police ko kitaab maaro, wo gir jaata hai',cd:12},
Singer:{i:'🎶',n:'Gaana',d:'saare police naachne lagte hain',cd:14},
Dadu:{i:'🛡️',n:'Dadu Time',d:'sab slow-motion + shield',cd:16},
Influencer:{i:'🤳',n:'Go LIVE',d:'police freeze + coins ki barish',cd:15},
Cockroach:{i:'🫥',n:'Chhup Jao',d:'3 sec bhoot ban jao, sab se nikal jao',cd:16}};
const SIGN=['PAPER LEAK BAND KARO','PADHAI > PAKODA','HUM 🪳 HAIN','JAWAB DO','CHAI PE CHARCHA','AWAAZ UTHAO'];
const SLO=['Paper leak band karo! 📣','Chai pila do, naara laga denge','Roll no. nahi, jawab chahiye','Hum 🪳 hain, itni jaldi nahi marenge','Padhai pe pakoda nahi!'];
const HITT=['Barricade se rishta pakka hua!','Aray! Dhyan se bhai! 😵','Police ne dekh liya! 👀','Cop: Ruko ruko ruko! 🚓'];
const CC=['#e63946','#2a9d8f','#3a86ff','#fb8500','#8338ec','#ef476f'];
const BC=['#3d3a5c','#5c3d4f','#2f4858','#4a3f35','#3b4a6b'];

// ===== drawing: characters & vehicles (local units, feet at 0,0, person ~120 high) =====
function person(o){
 const ph=o.ph||0,sw=o.still?0:Math.sin(ph);
 g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(0,0,28,8,0,0,7);g.fill();
 g.save();g.translate(0,-(o.jump||0)*100);
 if(o.slide){g.translate(0,-34);g.rotate(-1.25);g.translate(0,34)}
 const leg=(x,a)=>{g.save();g.translate(x,-42);g.rotate(a);fr(-6,0,12,38,4,o.pt);fr(-8,34,17,9,4,o.cop?'#111':'#fff');g.restore()};
 leg(-9,sw*.8);leg(9,-sw*.8);
 if(o.ty=='bag')fr(-25,-84,17,40,6,'#f4a261');
 if(o.ty=='roach'){g.fillStyle='#5a3a1a';g.beginPath();g.ellipse(0,-62,26,32,0,0,7);g.fill();g.strokeStyle='#2e1c0a';g.lineWidth=3;g.beginPath();g.moveTo(0,-92);g.lineTo(0,-32);g.stroke()}
 if(o.ty=='mic')fr(-20,-104,40,40,12,o.hr);
 fr(-18,-86,36,48,9,o.sh);
 if(o.ty=='old')fr(-19,-86,38,15,7,'#d9d9d9');
 if(o.cop){fr(-18,-62,36,6,2,'#111');dot(0,-74,3,'#ffc300')}
 const arm=(x,a,hold)=>{g.save();g.translate(x,-80);g.rotate(a);fr(-5,0,10,30,5,o.sh);dot(0,34,6,o.sk);if(hold)hold();g.restore()};
 arm(-23,sw*.9,null);
 const hold=o.ty=='mic'?()=>{fr(-3,22,6,16,3,'#555');dot(0,20,7,'#bbb')}:o.ty=='old'?()=>fr(-2,0,5,62,2,'#7b4a1d'):o.ty=='live'?()=>fr(-9,-10,18,30,4,'#111'):o.gun?()=>{fr(-2,26,28,10,2,'#222');fr(-2,30,9,17,2,'#222')}:o.cop?()=>fr(-4,22,8,66,3,'#8b5a2b'):null;
 arm(23,o.swing!=null?-2.5+o.swing*3.3:o.wave?-2.7+Math.sin(ph*2)*.4:-sw*.9,hold);
 dot(0,-100,16,o.sk);
 if(o.cop){fr(-18,-124,36,14,5,'#1d3557');fr(-21,-113,42,5,2,'#111');dot(0,-118,3,'#ffc300')}
 else{g.fillStyle=o.hr;g.beginPath();g.arc(0,-103,17,Math.PI,0);g.fill()}
 if(o.ty=='old'){g.fillStyle='#eee';g.beginPath();g.arc(0,-96,15,0,Math.PI);g.fill();g.strokeStyle='#222';g.lineWidth=2;g.beginPath();g.arc(-6,-101,5,0,7);g.arc(6,-101,5,0,7);g.stroke()}
 else if(o.ty=='live')fr(-13,-106,26,8,3,'#111');
 else if(o.ty=='roach'){dot(-6,-102,6,'#fff');dot(6,-102,6,'#fff');dot(-6,-102,2.5,'#111');dot(6,-102,2.5,'#111');g.strokeStyle='#2e1c0a';g.lineWidth=2.5;g.beginPath();g.moveTo(-6,-115);g.quadraticCurveTo(-14,-134,-24,-130);g.moveTo(6,-115);g.quadraticCurveTo(14,-134,24,-130);g.stroke()}
 else{dot(-6,-101,2.3,'#111');dot(6,-101,2.3,'#111')}
 if(o.ty!='roach'){g.fillStyle='#7a1d1d';g.beginPath();g.ellipse(0,-92,5,o.yell?5:2.5,0,0,7);g.fill()}
 if(o.sign){const w=o.sign.split(' '),h=Math.ceil(w.length/2),L=[w.slice(0,h).join(' '),w.slice(h).join(' ')];fr(28,-160,5,100,2,'#8b5a2b');fr(-40,-205,110,50,6,'#fff');g.fillStyle='#d62828';g.font='bold 15px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(L[0],15,-190);g.fillText(L[1],15,-172)}
 g.restore();
}
function wheel(x,y,r){dot(x,y,r,'#111');dot(x,y,r*.4,'#888')}
function car(c,pol,t){
 g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(0,0,72,10,0,0,7);g.fill();
 wheel(-44,-14,14);wheel(44,-14,14);
 fr(-62,-58,124,46,12,c);fr(-42,-92,84,44,14,pol?'#eef':c);fr(-34,-86,68,30,8,'#9bd1ff');
 fr(-58,-48,20,11,3,'#ff3b3b');fr(38,-48,20,11,3,'#ff3b3b');fr(-16,-34,32,12,3,'#eee');
 if(pol){const f=Math.floor(t*6)%2;fr(-62,-58,124,14,7,'#102a63');fr(-30,-102,28,10,4,f?'#ff2d2d':'#5a1010');fr(2,-102,28,10,4,f?'#1f4fff':'#10215a');g.fillStyle='#fff';g.font='bold 13px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('POLICE',0,-27)}
}
function bus(){
 g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(0,0,82,11,0,0,7);g.fill();
 wheel(-50,-14,15);wheel(50,-14,15);
 fr(-74,-132,148,120,12,'#f4b400');fr(-64,-122,128,40,6,'#9bd1ff');
 for(let i=1;i<4;i++)fr(-64+i*32-2,-122,4,40,0,'#f4b400');
 fr(-74,-80,148,14,0,'#d62828');fr(-66,-50,24,11,3,'#ff3b3b');fr(42,-50,24,11,3,'#ff3b3b');
 g.fillStyle='#222';g.font='bold 20px Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('FREE RIDE',0,-30);
}
function barr(){
 g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(0,0,70,9,0,0,7);g.fill();
 fr(-56,-74,12,74,3,'#444');fr(44,-74,12,74,3,'#444');
 for(const y of[-78,-46]){g.save();rr(-68,y,136,26,5);g.fillStyle='#fff';g.fill();g.clip();g.fillStyle='#e63946';for(let x=-100;x<70;x+=34){g.beginPath();g.moveTo(x,y+26);g.lineTo(x+16,y+26);g.lineTo(x+38,y);g.lineTo(x+22,y);g.fill()}g.restore()}
}
function gantry(txt){
 fr(-312,-196,12,196,3,'#555');fr(300,-196,12,196,3,'#555');fr(-312,-200,624,12,3,'#444');
 g.strokeStyle='#333';g.lineWidth=4;g.beginPath();g.moveTo(-220,-190);g.lineTo(-220,-136);g.moveTo(220,-190);g.lineTo(220,-136);g.stroke();
 fr(-292,-138,584,70,8,'#1d3557');fr(-286,-132,572,58,6,'#ffc300');
 g.fillStyle='#111';g.font='34px Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,0,-102);
}
function coinD(t){const w=Math.abs(Math.cos(t*4))*16+3;g.fillStyle='#ffc300';g.beginPath();g.ellipse(0,-34,w,17,0,0,7);g.fill();g.strokeStyle='#b8860b';g.lineWidth=3;g.stroke();if(w>10){g.fillStyle='#8a5a00';g.font='bold 18px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('₹',0,-33)}}

// ===== scenery =====
const mkB=(s,z)=>({t:'b',s,z,w:R(.9,1.5),h:R(1.8,4.2),c:P(BC),sd:Math.random()*50+3});
const mkP=(s,z)=>({t:'p',s,z,x:s*R(1.95,2.3),sign:Math.random()<.6?P(SIGN):'',c:P(CC),sk:P(SK),ph:R(0,6)});
function mkScene(){const a=[{t:'s',s:1,z:22},{t:'s',s:-1,z:110}];for(const s of[-1,1]){for(let i=0;i<18;i++)a.push(mkB(s,i*3.7-2));for(let i=0;i<8;i++)a.push(mkP(s,i*8+R(0,5)));for(let i=0;i<9;i++)a.push({t:'l',s,z:i*7.4+1})}return a}
function stage(o,t){
 if(o.z>64)return;const s=sc(o.z);g.save();g.translate(Xz(o.s*2.2,o.z),Yz(o.z));g.scale(s*K,s*K);
 fr(-104,-14,208,14,2,'#3a2a1a');fr(-100,-40,200,28,3,'#7b4a1d');fr(-100,-40,200,8,3,'#a5672a');
 fr(-100,-205,200,166,4,'#b3121f');fr(-92,-197,184,150,3,'#e63946');
 g.fillStyle='#fff';g.font='34px Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('ANDOLAN',0,-168);g.fillStyle='#ffc300';g.fillText('MANCH',0,-132);
 g.font='bold 15px sans-serif';g.fillStyle='#fff';g.fillText('JANTA KI AWAAZ',0,-104);
 for(let i=0;i<10;i++)dot(-90+i*20,-206,4,Math.floor(t*3+i)%2?'#ffe066':'#ff9f1c');
 for(const x of[-96,74]){fr(x,-104,22,62,3,'#111');dot(x+11,-86,7,'#444');dot(x+11,-62,9,'#444')}
 fr(-104,-250,5,50,2,'#555');g.fillStyle='#ff9933';g.beginPath();g.moveTo(-99,-250);g.lineTo(-62,-238);g.lineTo(-99,-226);g.fill();
 fr(18,-84,40,44,3,'#ffd23f');fr(36,-104,3,22,1,'#333');dot(37,-106,5,'#222');
 g.save();g.translate(-40,-40);g.scale(.75,.75);person({sk:'#c68642',sh:'#f4a261',pt:'#f4f1de',hr:'#222',ty:'mic',wave:1,yell:1,ph:t*5});g.restore();
 g.restore();
}
function lamp(o){
 if(o.z>64)return;const s=sc(o.z),d=-o.s,hx=d*32;g.save();g.translate(Xz(o.s*1.72,o.z),Yz(o.z));g.scale(s*K,s*K);
 fr(-3,-170,6,170,2,'#333');fr(Math.min(0,hx),-174,Math.abs(hx)+3,7,3,'#333');
 g.fillStyle='rgba(255,230,150,.3)';g.beginPath();g.arc(hx,-166,28,0,7);g.fill();dot(hx,-166,8,'#fff6c8');g.restore();
}
const SKY=Array.from({length:40},()=>({w:R(.02,.06),h:R(.03,.12)}));
function bld(b){
 const s=sc(b.z),y=Yz(b.z),bw=LS*b.w*s,bh=LS*b.h*s,cx=W/2+b.s*2.75*LS*s+b.s*bw/2,x0=cx-bw/2;
 g.fillStyle=b.c;g.fillRect(x0,y-bh,bw,bh);g.fillStyle='rgba(0,0,0,.28)';g.fillRect(x0,y-bh,bw,bh*.05);
 const cols=Math.max(2,b.w*3|0),rows=Math.max(3,b.h*3|0);
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){g.fillStyle=((b.sd*(r+3)*(c+7))%7)>2.2?'#ffd98a':'#262a3b';g.fillRect(x0+bw*(c+.2)/cols,y-bh+bh*(r+.35)/(rows+.6),bw*.55/cols,bh*.45/(rows+.6))}
}
function prot(p,t){const s=sc(p.z);g.save();g.translate(Xz(p.x,p.z),Yz(p.z));g.scale(s*K*.9,s*K*.9);person({sk:p.sk,sh:p.c,pt:'#333',hr:'#222',ph:t*6+p.ph,wave:1,yell:1,sign:p.sign});g.restore()}

// ===== state =====
let S,sel=0,best=+(()=>{try{return localStorage.getItem('ar_best')}catch(e){return 0}})()||0;
function mkS(){const c=CH[sel];return{ch:c,mode:'menu',t:0,dist:0,coins:0,sp:10,lane:0,lx:0,py:0,vy:0,slide:0,ph:0,gap:c.gap,inv:0,sh:c.sh0,mg:0,bo:0,obs:[],cn:[],pw:[],bl:[],pt:[],cd:0,slow:0,ghost:0,flash:0,cs:0,sub:'',st:0,sd:8,sc:mkScene(),msg:'',mt:0,shake:0,ct:0}}
const say=t=>{S.msg=t;S.mt=2.2};
const talk=(k,f)=>{const r=SND.say(k,f);if(r){S.sub=(k[0]=='p'?'🙋 ':k[0]=='c'?'👮 ':'🎤 ')+r;S.st=2.4}};
const burst=(x,y,e,n)=>{for(let i=0;i<n;i++)S.pt.push({x,y,vx:R(-160,160),vy:R(-300,-80),t:R(.5,.9),e,fs:R(16,30)})};
function special(){
 const s=S,k=s.ch.n;if(s.mode!='play'||s.cd>0)return;
 s.cd=ABIL[k].cd;SND.sfx('power');const px=W/2+s.lx*LS,py=GY-80*K;
 const cops=s.obs.filter(o=>(o.t=='cop'||o.t=='gun')&&!o.down&&o.z>0&&o.z<38).sort((a,b)=>a.z-b.z);
 if(k=='Chhatra'){const t=cops.find(o=>Math.abs(o.l-s.lane)<.6)||cops[0];
  if(t){t.down=1;SND.sfx('bonk');talk('c_stun',1);burst(Xz(t.l,t.z),Yz(t.z)-40,'📕',5);burst(Xz(t.l,t.z),Yz(t.z)-60,'⭐',5);say('📕 Kitaab Bomb! Police dher')}else say('Koi police nahi mili, kitaab bachi 📕')}
 if(k=='Singer'){cops.forEach(o=>o.stun=5);s.gap=Math.min(s.ch.gap,s.gap+.5);burst(px,py,'🎶',10);say('🎶 Police naach rahi hai!');SND.sfx('cheer')}
 if(k=='Dadu'){s.slow=5;s.sh=1;say('👴 Dadu Time: sab dheere!')}
 if(k=='Influencer'){cops.forEach(o=>o.stun=5);s.gap=Math.min(s.ch.gap,s.gap+.5);for(let i=0;i<8;i++)s.cn.push({l:[-1,0,1][i%3],z:8+i*1.4,h:0});burst(px,py,'❤️',10);say('🔴 LIVE! 1M log dekh rahe hain');SND.sfx('cheer')}
 if(k=='Cockroach'){s.ghost=3.5;burst(px,py,'💨',6);say('🫥 Chhup gaye!')}
}
function row(){
 const z=50,r=Math.random(),s=S;
 if(r<.17){s.obs.push({t:'sign',l:0,z,txt:P(SIGN)})}
 else{
  const n=r<.7?1:2,ls=[-1,0,1].sort(()=>Math.random()-.5).slice(0,n);
  ls.forEach(l=>s.obs.push({t:P(s.t>10?['bar','bar','car','bus','pcar','cop','cop','gun']:['bar','bar','car','bus','pcar','cop']),l,z,c:P(CC),cd:R(.3,1)}));
  const fr0=[-1,0,1].filter(l=>!ls.includes(l)),cl0=P(fr0);
  if(Math.random()<.85)for(let i=0;i<5;i++)s.cn.push({l:cl0,z:z+i*1.4-2,h:0});
 }
 if(Math.random()<.13)s.pw.push({k:P(['sh','mg','bo']),l:P([-1,0,1]),z:z+6});
}
function hit(o){
 const s=S;o.done=1;if(s.inv>0||s.bo>0||s.ghost>0)return;
 SND.sfx(o.t=='cop'?'thwack':o.t=='bullet'?'ouch':'crash');s.shake=.6;s.flash=.5;burst(W/2+s.lx*LS,GY-80*K,o.t=='cop'?'⭐':'💥',6);
 if(s.sh>0){s.sh=0;say('Shield toot gaya! 🥟')}
 else{s.gap-=1;s.inv=1.8;s.cs=.6;say(s.gap<=0?'BAS! Pakde gaye! 🚔':o.t=='cop'?'Lathi padi! 🏏 Aray!':o.t=='bullet'?'Goli! Bach ke! 💨':P(HITT));
  if(s.gap<=0){s.mode='caught';s.ct=0;SND.siren(false);SND.sfx('caught');talk('c_caught',1);setTimeout(()=>talk('p_caught',1),1900)}else talk('c_ruko',1)}
}
function up(dt){
 const s=S;s.t+=dt;s.shake=Math.max(0,s.shake-dt);s.mt-=dt;
 if(s.mode=='play')s.sp=Math.min(30,14+s.t*.12)*s.ch.spd*(s.bo>0?1.5:1)*(s.slow>0?.55:1);
 else s.sp=s.mode=='caught'?Math.max(0,s.sp-dt*14):s.mode=='over'?5:10;
 s.dist+=s.sp*dt;s.ph+=dt*s.sp*.75;
 s.sc.forEach((o,i)=>{o.z-=s.sp*dt;
  if(o.t=='s'&&!o.v&&o.z<16&&o.z>0&&s.mode=='play'){o.v=1;talk('n_stage')}
  if(o.z<-5)s.sc[i]=o.t=='b'?mkB(o.s,o.z+66):o.t=='s'?{t:'s',s:-o.s,z:o.z+220}:o.t=='l'?{t:'l',s:o.s,z:o.z+66}:mkP(o.s,o.z+66)});
 s.st-=dt;s.flash=Math.max(0,s.flash-dt);s.cs=Math.max(0,s.cs-dt);
 s.pt.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=500*dt;p.t-=dt});s.pt=s.pt.filter(p=>p.t>0);
 if(s.mode=='caught'){s.ct+=dt;if(s.ct>3.6&&!s.done){s.done=1;endGame()}return}
 if(s.mode!='play')return;
 s.lx+=(s.lane-s.lx)*Math.min(1,dt*s.ch.lsw);
 if(s.py>0||s.vy>0){s.py+=s.vy*dt;s.vy-=12*dt;if(s.py<=0){s.py=0;s.vy=0}}
 ['slide','inv','mg','bo','cd','slow','ghost'].forEach(k=>s[k]=Math.max(0,s[k]-dt));
 const g0=s.gap;s.gap=Math.min(s.ch.gap,s.gap+dt*.1);if(g0<s.ch.gap&&s.gap>=s.ch.gap)talk('p_escape');
 SND.siren(s.gap<=1.2);s.vt=(s.vt||8)-dt;if(s.vt<=0){s.vt=R(10,16);talk(P(['p_escape','p_start','p_nahi']))}
 s.sd-=s.sp*dt;if(s.sd<=0){row();s.sd=R(9,13)}
 const mv=a=>a.forEach(o=>o.z-=s.sp*dt);mv(s.obs);mv(s.cn);mv(s.pw);
 s.obs.forEach(o=>{
  if(o.stun>0)o.stun-=dt;
  if(o.t=='gun'&&!o.down&&!(o.stun>0)&&o.z<32&&o.z>3){
   if(o.tel>0){o.tel-=dt;if(o.tel<=0){s.bl.push({l:o.aim,z:o.z-.4});o.fl=.15;SND.sfx('shot')}}
   else{o.cd-=dt;if(o.cd<=0){o.cd=R(1.4,2.2);o.tel=.7;o.aim=s.lane;SND.sfx('warn')}}
  }
  if(o.fl>0)o.fl-=dt;
  if(o.t=='cop'&&!o.down&&!o.wh&&o.z<9){o.wh=1;SND.sfx('whoosh')}
  if(o.done||o.down||o.stun>0||o.z>.7||o.z<-.6)return;
  if(o.t=='sign'){if(s.slide<=0)hit(o)}
  else if(Math.abs(s.lx-o.l)<.55){if(o.t=='bar'?s.py<.5:s.py<2)hit(o)}
 });
 s.bl.forEach(b=>{b.z-=(s.sp+24)*dt;
  if(!b.done&&b.z<.6&&b.z>-.5&&Math.abs(s.lx-b.l)<.5&&s.py<.55){b.done=1;hit({t:'bullet'})}
  if(!b.pass&&!b.done&&b.z<-.5){b.pass=1;talk('p_nahi')}});
 s.bl=s.bl.filter(b=>b.z>-3&&!b.done);
 s.cn=s.cn.filter(c=>{
  if((s.mg>0||s.ch.mag)&&c.z<12&&c.z>0)c.l+=(s.lx-c.l)*Math.min(1,dt*7);
  if(c.z<.7&&c.z>-.6&&Math.abs(s.lx-c.l)<.6){
   s.coins++;SND.sfx('coin');burst(W/2+s.lx*LS,GY-110*K,'✨',2);
   if(s.coins%12==0)say(P(SLO));
   if(s.ch.ty=='mic'&&s.coins%20==0){s.gap=Math.min(s.ch.gap,s.gap+1);say('🎶 Gaana! Police peeche reh gayi')}
   return false}
  return c.z>-4});
 s.pw=s.pw.filter(p=>{
  if(p.z<.7&&p.z>-.6&&Math.abs(s.lx-p.l)<.6){SND.sfx('power');
   if(p.k=='sh'){s.sh=1;say('🥟 Samosa shield!')}if(p.k=='mg'){s.mg=8;say('🧲 Coin magnet!')}if(p.k=='bo'){s.bo=4;s.inv=4;say('☕ Chai power! Koi nahi rok sakta')}return false}
  return p.z>-4});
 s.obs=s.obs.filter(o=>o.z>-5);
}
function endGame(){
 SND.music(false);SND.siren(false);SND.sfx('over');
 const sc0=Math.floor(S.dist/3)+S.coins*5;if(sc0>best){best=sc0;try{localStorage.setItem('ar_best',best)}catch(e){}}
 $('os').innerHTML=`Score: <b>${sc0}</b> • Doori: ${Math.floor(S.dist/3)} m • Coins: ${S.coins}<br>Best: ${best}`;
 S.mode='over';$('over').hidden=false;$('ctl').hidden=true;
}

// ===== render =====
const busX=()=>lerp(W+240,W/2+LS*1.4,cl((S.ct-.3)/1.3,0,1));
function render(){
 const s=S;g.save();
 if(s.shake>0)g.translate(R(-6,6)*s.shake,R(-6,6)*s.shake);
 // sky
 let gr=g.createLinearGradient(0,0,0,HOR);gr.addColorStop(0,'#2a1b5e');gr.addColorStop(.6,'#c2455a');gr.addColorStop(1,'#ffb347');g.fillStyle=gr;g.fillRect(-20,-20,W+40,HOR+22);
 dot(W*.72,HOR-H*.07,H*.06,'#ffe7a3');
 g.fillStyle='#2e1f4f';let x=-W*.02;SKY.forEach(b=>{g.fillRect(x,HOR-b.h*H,b.w*W,b.h*H);x+=b.w*W});
 g.fillStyle='#1c1e2a';g.fillRect(-20,HOR,W+40,H);
 quad(-9,-1.6,70,-6,'#22242f');quad(1.6,9,70,-6,'#22242f');
 quad(-2.7,-1.6,70,-6,'#8c8f9a');quad(1.6,2.7,70,-6,'#8c8f9a');
 quad(-1.66,-1.6,70,-6,'#d9d9d9');quad(1.6,1.66,70,-6,'#d9d9d9');
 quad(-1.6,1.6,70,-6,'#2a2c38');
 quad(-1.6,-1.54,70,-6,'#e8b923');quad(1.54,1.6,70,-6,'#e8b923');
 const off=s.dist%4;
 for(let k=-1;k<16;k++){const z1=k*4-off,z2=z1+1.8;if(z2<-4)continue;quad(-.52,-.48,z2,z1,'#ddd');quad(.48,.52,z2,z1,'#ddd');if(k%2==0)quad(-1.6,1.6,z1,z1+4,'rgba(255,255,255,.025)')}
 gr=g.createLinearGradient(0,HOR,0,HOR+H*.12);gr.addColorStop(0,'#ffb347aa');gr.addColorStop(1,'#ffb34700');g.fillStyle=gr;g.fillRect(0,HOR,W,H*.12);
 s.obs.forEach(o=>{if(o.tel>0)quad(o.aim-.45,o.aim+.45,.5,Math.max(o.z,3),'rgba(255,40,40,'+(.18+.14*Math.sin(s.t*30))+')')});
 // objects far to near
 const it=[];
 s.sc.forEach(o=>it.push([o.z,()=>o.t=='b'?bld(o):o.t=='s'?stage(o,s.t):o.t=='l'?lamp(o):prot(o,s.t)]));
 s.obs.forEach(o=>it.push([o.z,()=>drawObs(o)]));
 s.cn.forEach(c=>it.push([c.z,()=>obj(c.l,c.z,()=>coinD(s.t+c.z))]));
 s.pw.forEach(p=>it.push([p.z,()=>obj(p.l,p.z,()=>{g.font='46px serif';g.textAlign='center';g.textBaseline='middle';g.fillText({sh:'🥟',mg:'🧲',bo:'☕'}[p.k],0,-40+Math.sin(s.t*6)*5)})]));
 s.bl.forEach(b=>it.push([b.z,()=>obj(b.l,b.z,()=>{fr(-4,-96,8,66,4,'rgba(255,190,60,.55)');dot(0,-30,13,'#fff3b0');dot(0,-30,8,'#ff9f1c')})]));
 it.push([0,drawPlayer]);
 if(s.mode=='caught'||(s.mode=='play'&&s.gap<s.ch.gap-.05&&s.gap<2.05)){const cz=s.mode=='caught'?-.7:-(.9+s.gap*.9);it.push([cz,()=>drawCop(cz)])}
 it.sort((a,b)=>b[0]-a[0]);it.forEach(a=>a[1]());
 if(s.mode=='caught'){const bx=busX();g.save();g.translate(bx,GY+30);g.scale(K*1.7,K*1.7);bus();g.restore()}
 g.restore();
 // siren glow when police close
 if(s.mode=='play'&&s.gap<=1.2){const f=Math.floor(s.t*5)%2;gr=g.createLinearGradient(f?0:W,0,f?W*.5:W*.5,0);gr.addColorStop(0,f?'rgba(255,40,40,.4)':'rgba(40,80,255,.4)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,W,H)}
 if(s.bo>0){g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=2;for(let i=0;i<14;i++){const a=R(0,6.28),r=R(.25,.5)*H;g.beginPath();g.moveTo(W/2+Math.cos(a)*r,H*.55+Math.sin(a)*r*.7);g.lineTo(W/2+Math.cos(a)*(r+H*.12),H*.55+Math.sin(a)*(r+H*.12)*.7);g.stroke()}}
 s.pt.forEach(p=>{g.globalAlpha=Math.min(1,p.t*2);g.font=p.fs+'px serif';g.textAlign='center';g.textBaseline='middle';g.fillText(p.e,p.x,p.y)});g.globalAlpha=1;
 if(s.flash>0){g.fillStyle=`rgba(255,40,40,${s.flash*.5})`;g.fillRect(0,0,W,H)}
 if(s.mode!='menu'&&s.mode!='over')hud();
 if(s.mode=='caught'&&s.ct>1.2){const f=Math.min(W,H)*.1;T('BUS MEIN BAITHO! 🚌',W/2,H*.3,f,'#ffc300');if(s.ct>2)T('Free ride, AC nahi hai 😭',W/2,H*.3+f,f*.45,'#fff')}
}
function quad(l1,l2,z1,z2,col){g.fillStyle=col;g.beginPath();g.moveTo(Xz(l1,z1),Yz(z1));g.lineTo(Xz(l2,z1),Yz(z1));g.lineTo(Xz(l2,z2),Yz(z2));g.lineTo(Xz(l1,z2),Yz(z2));g.closePath();g.fill()}
function obj(l,z,fn){const s=sc(z);g.save();g.globalAlpha=cl((52-z)/10,0,1);g.translate(Xz(l,z),Yz(z));g.scale(s*K,s*K);fn();g.restore()}
function copD(o){
 const near=!o.down&&!(o.stun>0)&&o.z<10&&o.z>-1;
 g.save();if(o.down){g.rotate(1.5);g.translate(40,0)}
 person({sk:'#d9a066',sh:'#c8b27a',pt:'#3b4a3a',hr:'#222',cop:1,gun:o.t=='gun',ph:S.t*(o.stun>0?9:0),still:!(o.stun>0),swing:o.t=='cop'&&near?(S.t*2.2)%1:null,yell:1});
 g.restore();g.textAlign='center';g.textBaseline='middle';
 if(o.stun>0){g.font='28px serif';for(let i=0;i<3;i++)g.fillText('⭐',Math.cos(S.t*6+i*2.1)*24,-138+Math.sin(S.t*6+i*2.1)*6)}
 if(o.tel>0){g.font='bold 48px Impact';g.fillStyle='#ff3b3b';g.fillText('!',0,-152)}
 if(o.fl>0){g.font='44px serif';g.fillText('💥',34,-58)}
}
function drawObs(o){obj(o.l,o.z,()=>{if(o.t=='bar')barr();else if(o.t=='car')car(o.c,0);else if(o.t=='pcar')car('#1d3557',1,S.t);else if(o.t=='bus')bus();else if(o.t=='cop'||o.t=='gun')copD(o);else gantry(o.txt)})}
function drawPlayer(){
 const s=S;if(s.inv>0&&s.mode=='play'&&Math.floor(s.t*14)%2)return;
 let x=W/2+s.lx*LS,a=s.ghost>0?.4:1;
 if(s.mode=='caught'){const k=cl((s.ct-1.7)/1,0,1);x+=(busX()-x)*k;a=1-k}
 g.save();g.globalAlpha=a;g.translate(x,GY);g.scale(K*1.05,K*1.05);
 if(s.sh>0){g.fillStyle='rgba(120,220,255,.25)';g.strokeStyle='#7cf';g.lineWidth=3;g.beginPath();g.arc(0,-60,76,0,7);g.fill();g.stroke()}
 person({...s.ch,ph:s.ph,jump:s.py,slide:s.slide>0,yell:s.mode=='play',still:s.mode=='caught'});
 g.restore();
}
function drawCop(cz){
 const s=S,sx=sc(cz);let x=W/2+s.lx*LS*sx;
 g.save();g.translate(x,Yz(cz));g.scale(K*sx*1.05,K*sx*1.05);
 person({sk:'#d9a066',sh:'#c8b27a',pt:'#3b4a3a',hr:'#222',cop:1,ph:s.ph+1,yell:1,still:s.mode=='caught',swing:s.cs>0?1-s.cs/.6:null});
 if(Math.floor(s.t*3)%2&&s.mode=='play'){g.font='bold 34px Impact';g.textAlign='center';g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=5;g.strokeText('RUKO!',0,-150);g.fillText('RUKO!',0,-150)}
 g.restore();
}
function hud(){
 const s=S,f=Math.max(16,Math.min(W,H)*.05);
 T('₹ '+s.coins,14+f*.9,f,f,'#ffc300');T(Math.floor(s.dist/3)+' m',14+f*.9,f*2.1,f*.7,'#fff');
 const bw=Math.min(W*.4,220),bx=W-bw-14,by=14,p=cl(s.gap/s.ch.gap,0,1);
 g.fillStyle='rgba(0,0,0,.5)';rr(bx,by,bw,16,8);g.fill();
 g.fillStyle=p>.5?'#4ade80':p>.25?'#facc15':'#ef4444';rr(bx,by,Math.max(8,bw*p),16,8);g.fill();
 T('👮 POLICE DOORI',bx+bw/2,by+34,f*.55,'#fff');
 let ic='';if(s.sh>0)ic+='🥟 ';if(s.mg>0)ic+='🧲 ';if(s.bo>0)ic+='☕ ';if(ic)T(ic,bx+bw/2,by+60,f*.7,'#fff');
 if(s.mt>0){g.globalAlpha=Math.min(1,s.mt);T(s.msg,W/2,H*.2,Math.min(f*1.1,W/(s.msg.length*.55)),'#fff');g.globalAlpha=1}
 if(s.st>0){g.globalAlpha=Math.min(1,s.st);T(s.sub,W/2,H*.27,Math.min(f*.9,W/(s.sub.length*.5)),'#9ff');g.globalAlpha=1}
 $('bxt').textContent=s.cd>0?Math.ceil(s.cd)+'s':'READY';$('bx').classList.toggle('rdy',s.cd<=0);
}

// ===== input =====
function act(a){
 const s=S;if(s.mode!='play')return;
 if(a=='X')return special();
 if(a=='L')s.lane=Math.max(-1,s.lane-1);
 if(a=='R')s.lane=Math.min(1,s.lane+1);
 if(a=='J'&&s.py<=0){s.vy=s.ch.jump;s.py=.001;s.slide=0;SND.sfx('jump')}
 if(a=='S'){if(s.py>0)s.vy=-10;else s.slide=.7;SND.sfx('slide')}
}
const KM={e:'X',x:'X',shift:'X',arrowleft:'L',a:'L',arrowright:'R',d:'R',arrowup:'J',w:'J',' ':'J',arrowdown:'S',s:'S'};
addEventListener('keydown',e=>{const a=KM[e.key.toLowerCase()];if(a){e.preventDefault();act(a)}});
document.querySelectorAll('#ctl button').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();act(b.dataset.a)}));
let sw=null;
cv.addEventListener('pointerdown',e=>{sw={x:e.clientX,y:e.clientY}});
cv.addEventListener('pointerup',e=>{if(!sw)return;const dx=e.clientX-sw.x,dy=e.clientY-sw.y;sw=null;
 if(Math.max(Math.abs(dx),Math.abs(dy))<28)return;
 if(Math.abs(dx)>Math.abs(dy))act(dx<0?'L':'R');else act(dy<0?'J':'S')});

// ===== menu =====
function mini(c,ch){const o=g;g=c.getContext('2d');g.translate(55,132);person({...ch,ph:0,still:1,yell:1});g=o}
CH.forEach((ch,i)=>{
 const d=document.createElement('div');d.className='card'+(i==sel?' on':'');
 d.innerHTML=`<canvas width="110" height="140"></canvas><b>${ch.n}</b><span>${ch.d}</span><span class="ab">⚡ ${ABIL[ch.n].i} ${ABIL[ch.n].n}: ${ABIL[ch.n].d}</span>`;
 mini(d.firstChild,ch);
 d.onclick=()=>{sel=i;[...$('cards').children].forEach((x,j)=>x.classList.toggle('on',j==i));S=mkS();beep(500,.06)};
 $('cards').appendChild(d);
});
function begin(){SND.init();SND.music(true);beep(600,.1);S=mkS();S.mode='play';$('bxi').textContent=ABIL[S.ch.n].i;talk('p_start');$('menu').hidden=true;$('over').hidden=true;$('ctl').hidden=false;say('Daudo! Police peeche hai 🚓')}
$('go').addEventListener('click',begin);$('again').addEventListener('click',begin);
$('home').addEventListener('click',()=>{S=mkS();$('over').hidden=true;$('menu').hidden=false});

$('mute').addEventListener('click',()=>{SND.init();$('mute').textContent=SND.toggle()?'🔇':'🔊'});
// ===== loop =====
S=mkS();let last=performance.now();
function loop(n){requestAnimationFrame(loop);const dt=Math.min(.05,(n-last)/1000);last=n;up(dt);render()}
requestAnimationFrame(loop);
