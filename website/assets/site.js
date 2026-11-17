const W='https://wa.me/923719079975',$=s=>document.querySelector(s),RM=matchMedia('(prefers-reduced-motion:reduce)').matches;let raf,mx=0,cur;
function scene(tries=0){const st=$('.stage');if(!st||RM)return;if(!window.THREE){if(tries<40)setTimeout(()=>scene(tries+1),150);return}
try{const T=THREE,cv=document.createElement('canvas');if(!cv.getContext('webgl'))return;const r=new T.WebGLRenderer({canvas:cv,alpha:true,antialias:true});r.setPixelRatio(Math.min(devicePixelRatio,1.5));
const s=new T.Scene(),c=new T.PerspectiveCamera(35,1,.1,50);c.position.set(0,1.5,10);c.lookAt(0,0,0);s.add(new T.AmbientLight(0xffffff,.9));const l=new T.DirectionalLight(0xffffff,.8);l.position.set(4,6,6);s.add(l);
const g=new T.Group(),bk=new T.Group();s.add(g);g.add(bk);bk.rotation.x=1;bk.position.set(0,-1.8,0);
const M=(k,m=.05)=>new T.MeshStandardMaterial({color:k,roughness:.55,metalness:m}),B=(w,h,d,k,X,Y,Z,rz=0)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),M(k));m.position.set(X,Y,Z);m.rotation.z=rz;bk.add(m)};
B(3.2,.14,2.6,0x9a6a38,0,0,0);B(3.3,.08,2.2,0x0f6fd0,0,.12,0);B(1.5,.06,2,0xffffff,-.76,.2,0,-.07);B(1.5,.06,2,0xffffff,.76,.2,0,.07);
for(let i=0;i<5;i++)[-1,1].forEach(d=>B(1.1,.01,.04,0x4fb3f0,d*.76,.25,-.7+i*.35,d*.07));
const base=new T.Mesh(new T.BoxGeometry(3.2,.14,2.4),M(0x7a5128));base.position.set(0,-2.9,.4);g.add(base);
const stars=[];for(let i=0;i<8;i++){const m=new T.Mesh(new T.OctahedronGeometry(.16),M(i%2?0x4fb3f0:0xffffff,.3));const a=i/8*Math.PI*2;m.position.set(Math.cos(a)*2.6,1+Math.sin(a)*1.6,.5);m.userData.a=i;stars.push(m);g.add(m)}
st.appendChild(cv);st.classList.add('gl');const fit=()=>{const w=st.clientWidth,h=st.clientHeight;r.setSize(w,h,false);c.aspect=w/h;c.updateProjectionMatrix()};fit();addEventListener('resize',fit);
const loop=t=>{if(!document.body.contains(cv)){r.dispose();return}t/=1000;g.rotation.y=Math.sin(t*.4)*.12+mx*.2;stars.forEach(m=>{m.position.y+=Math.sin(t+m.userData.a)*.002;m.rotation.y=t*.5});r.render(s,c);raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop)}catch(e){}}
document.addEventListener('pointermove',e=>{if(RM||e.pointerType=='touch')return;mx=e.clientX/innerWidth-.5;const t=e.target.closest&&e.target.closest('.t');if(cur&&cur!==t){cur.style.removeProperty('--x');cur.style.removeProperty('--y')}cur=t;if(t){const b=t.getBoundingClientRect();t.style.setProperty('--y',((e.clientX-b.left)/b.width-.5)*10+'deg');t.style.setProperty('--x',(.5-(e.clientY-b.top)/b.height)*10+'deg')}const st=$('.stage');if(st){st.style.setProperty('--px',mx*2);st.style.setProperty('--py',(e.clientY/innerHeight-.5)*2)}});
document.addEventListener('submit',e=>{if(e.target.id!='cf')return;e.preventDefault();const f=e.target,n=f.n.value.trim(),m=f.m.value.trim(),er=$('#er');if(n.length<2)return er.textContent='Please enter your name (at least 2 characters).';if(m.length<10)return er.textContent='Please enter a message (at least 10 characters).';er.textContent='';window.open(W+'?text='+encodeURIComponent('Assalamu Alaikum, I am '+n+'. '+m),'_blank','noopener')});
const tbl=()=>{const b=$('#th');if(b)b.setAttribute('aria-label',document.documentElement.dataset.theme=='dark'?'Switch to light mode':'Switch to dark mode')};tbl();
const cd=()=>document.querySelectorAll('.dd.open').forEach(p=>{p.classList.remove('open');p.firstElementChild.setAttribute('aria-expanded',false)});
document.addEventListener('click',e=>{const t=e.target.closest('#th'),d=e.target.closest('.dt');
if(t){const h=document.documentElement,n=h.dataset.theme=='dark'?'light':'dark';h.classList.add('tx');h.dataset.theme=n;try{localStorage.setItem('qc-theme',n)}catch(_){}tbl();setTimeout(()=>h.classList.remove('tx'),450);return}
if(d){const p=d.parentElement,o=!p.classList.contains('open');cd();p.classList.toggle('open',o);d.setAttribute('aria-expanded',o);return}
document.querySelectorAll('.dd.open').forEach(p=>{if(!p.contains(e.target))cd()})});
document.addEventListener('keydown',e=>{if(e.key=='Escape'){const o=document.querySelector('.dd.open');if(o){const b=o.firstElementChild;cd();b.focus()}}});
document.addEventListener('focusin',e=>{const f=e.target.form;if(f&&f.id=='af'&&!f.dataset.t)f.dataset.t=Date.now()});
document.addEventListener('submit',async e=>{const f=e.target;if(f.id!='af')return;e.preventDefault();if(f.dataset.busy)return;
const v=n=>f[n].value.trim(),d={name:v('name'),email:v('email'),subject:v('subject'),message:v('message'),website:f.website.value,t:Date.now()-(+f.dataset.t||Date.now())},er={};
if(d.name.length<2)er.name='Please enter your full name.';if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email))er.email='Please enter a valid email address.';if(d.subject.length<3)er.subject='Please enter a subject (at least 3 characters).';if(d.message.length<10)er.message='Please write your question (at least 10 characters).';
['name','email','subject','message'].forEach(n=>{$('#e-'+n).textContent=er[n]||'';f[n].setAttribute('aria-invalid',!!er[n])});
const s=$('#as'),b=f.querySelector('button'),k=Object.keys(er);s.className='st2';s.textContent='';
if(k.length){s.textContent='Please correct the highlighted fields.';s.classList.add('bad');f[k[0]].focus();return}
f.dataset.busy=1;b.disabled=true;b.classList.add('ld');b.textContent='SENDING…';
const fail=()=>{s.textContent='Sorry, your question could not be sent. Please try again later or message us on WhatsApp.';s.classList.add('bad');b.disabled=false;b.classList.remove('ld');b.textContent='SUBMIT QUESTION';delete f.dataset.busy};
try{const r=await fetch('/api/ask',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(d)});let j={};try{j=await r.json()}catch(_){}
if(r.ok&&j.ok===true){s.textContent='Thank you. Your question has been sent to the Quranic Core team.';s.classList.add('ok');f.reset();delete f.dataset.t;b.classList.remove('ld');b.textContent='QUESTION SENT';setTimeout(()=>{b.disabled=false;b.textContent='SUBMIT QUESTION';delete f.dataset.busy},30000)}else fail()}catch(_){fail()}});

const mb=$('#mb'),mn=$('#mn');mb.onclick=()=>{const o=mn.classList.toggle('open');mb.setAttribute('aria-expanded',o)};const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('v');io.unobserve(e.target)}}),{threshold:.06});document.querySelectorAll('.r').forEach(e=>io.observe(e));scene();
