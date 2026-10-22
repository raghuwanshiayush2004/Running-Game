'use strict';
// Sab awaaz yahin hain: WebAudio se bane sound effects, dhol music, siren aur speechSynthesis se bolne wali voice lines.
const SND=(()=>{
 let ac,mg,nb,muted=false,mus=0,tm=0,step=0,sir=0,sirT=0,lastSay=0,hv=null;
 const sp='speechSynthesis' in window?speechSynthesis:null;
 const pick=()=>{if(!sp)return;const v=sp.getVoices();hv=v.find(x=>/^hi/i.test(x.lang))||v.find(x=>/^en-IN/i.test(x.lang))||v.find(x=>/^en/i.test(x.lang))||null};
 if(sp){pick();sp.onvoiceschanged=pick}
 function init(){
  if(ac){if(ac.state=='suspended')ac.resume();return}
  try{ac=new(window.AudioContext||window.webkitAudioContext)();mg=ac.createGain();mg.gain.value=muted?0:1;mg.connect(ac.destination);
   nb=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}catch(e){ac=null}
 }
 function osc(f,d,ty,v,t0,f2){
  if(!ac)return;const t=ac.currentTime+(t0||0),o=ac.createOscillator(),a=ac.createGain();
  o.type=ty||'square';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
  a.gain.setValueAtTime(v||.05,t);a.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(a);a.connect(mg);o.start(t);o.stop(t+d+.03)
 }
 function nz(d,v,f,ty,t0,f2){
  if(!ac)return;const t=ac.currentTime+(t0||0),s=ac.createBufferSource(),fl=ac.createBiquadFilter(),a=ac.createGain();
  s.buffer=nb;fl.type=ty||'lowpass';fl.frequency.setValueAtTime(f,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+d);
  a.gain.setValueAtTime(v,t);a.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(fl);fl.connect(a);a.connect(mg);s.start(t);s.stop(t+d+.03)
 }
 const FX={
  coin(){osc(988,.07,'square',.04);osc(1319,.14,'square',.04,.07)},
  jump(){osc(300,.2,'square',.04,0,760)},
  slide(){nz(.25,.25,900,'bandpass',0,300)},
  power(){[523,659,784,1047].forEach((f,i)=>osc(f,.12,'triangle',.07,i*.06))},
  shot(){nz(.3,.7,4000,'lowpass',0,150);osc(140,.25,'sawtooth',.25,0,35)},
  warn(){osc(1400,.07,'square',.04);osc(1400,.07,'square',.04,.12)},
  whoosh(){nz(.4,.35,500,'bandpass',0,3000)},
  thwack(){osc(180,.18,'sine',.6,0,45);nz(.1,.5,3000,'highpass');nz(.3,.25,500,'lowpass',.05)},
  crash(){nz(.45,.7,900,'lowpass',0,120);osc(90,.35,'sawtooth',.3,0,30)},
  ouch(){osc(500,.25,'sawtooth',.1,0,180)},
  bonk(){osc(260,.12,'sine',.5,0,70);osc(700,.2,'triangle',.08,.08,300)},
  cheer(){for(let i=0;i<5;i++)nz(.35,.14,1800,'bandpass',i*.12,900)},
  caught(){osc(2600,.4,'sine',.05,0,2900);[[233,.32],[220,.32],[207,.32],[196,.9]].forEach((n,i)=>osc(n[0],n[1],'sawtooth',.09,.4+i*.34,n[0]*(i==3?.8:1)))},
  over(){nz(.5,.2,600,'lowpass')}
 };
 // dhol jaisi beat
 function tick(){
  if(!ac||!mus)return;const k=step%16;
  if([0,3,6,8,11,14].includes(k))osc(120,.16,'sine',.22,0,45);
  if(k==4||k==12){nz(.1,.12,2500,'highpass');osc(200,.08,'triangle',.06)}
  if(k%2==0)nz(.04,.04,6000,'highpass');
  if(k%4==0)osc([55,65,73,82][(step>>2)%4],.3,'triangle',.07);
 }
 function music(on){mus=on;if(on&&!tm)tm=setInterval(()=>{tick();step++},150);if(!on&&tm){clearInterval(tm);tm=0}}
 function siren(on){
  if(on&&!sir)sir=setInterval(()=>{sirT^=1;osc(sirT?960:720,.34,'square',.022)},350);
  if(!on&&sir){clearInterval(sir);sir=0}
 }
 // [hindi, roman]. p=protester, c=police, n=neta
 const L={
  p_escape:[['नहीं पकड़ पाओगे!','Nahi pakad paoge!'],['भागो भागो!','Bhaago bhaago!'],['हाथ नहीं आएगा ये!','Haath nahi aayega ye!']],
  p_nahi:[['निशाना चूक गया!','Nishana chook gaya!'],['वाह, बच गया!','Waah, bach gaya!']],
  p_start:[['चलो भाई, आवाज़ उठाओ!','Chalo bhai, awaaz uthao!'],['पेपर लीक बंद करो!','Paper leak band karo!']],
  p_caught:[['अरे छोड़ो उसको!','Arre chhodo usko!'],['ये ग़लत है!','Ye galat hai!']],
  c_ruko:[['रुको रुको!','Ruko ruko!'],['पकड़ो उसको!','Pakdo usko!']],
  c_caught:[['पकड़ लिया!','Pakad liya!'],['चलो बस में बैठो!','Chalo bus mein baitho!']],
  c_stun:[['अरे मेरा डंडा!','Arre mera danda!'],['ये क्या हुआ!','Ye kya hua!']],
  n_stage:[['भाइयों और बहनों!','Bhaiyon aur behnon!'],['जनता की आवाज़ दबाई नहीं जा सकती!','Janta ki awaaz dabayi nahi ja sakti!']]
 };
 function say(k,force){
  const n=Date.now();if(!force&&n-lastSay<2400)return '';const a=L[k];if(!a)return '';
  const l=a[Math.random()*a.length|0];lastSay=n;
  if(sp&&!muted){try{
   const hi=hv&&/^hi/i.test(hv.lang),u=new SpeechSynthesisUtterance(hi?l[0]:l[1]);
   if(hv)u.voice=hv;u.lang=hv?hv.lang:'hi-IN';
   u.pitch=k[0]=='p'?1.5:k[0]=='c'?.5:.8;u.rate=k[0]=='c'?.95:1.1;
   if(force)sp.cancel();sp.speak(u)}catch(e){}}
  return l[1];
 }
 return{
  init,music,siren,say,
  tone:(f,d,t,v)=>{init();osc(f,d,t,v||.04)},
  sfx:n=>{init();FX[n]&&FX[n]()},
  toggle:()=>{muted=!muted;if(mg)mg.gain.value=muted?0:1;if(muted&&sp)sp.cancel();return muted}
 };
})();
