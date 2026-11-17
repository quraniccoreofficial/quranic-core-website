// Cloudflare Pages Function — POST /api/ask  (Ask a Question → email to the academy)
// Required secret: RESEND_API_KEY.  Optional: FROM_EMAIL, TO_EMAIL, ALLOWED_ORIGIN (e.g. https://your-domain.com)
const TO='quraniccore.official@gmail.com';
const json=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json','cache-control':'no-store'}});
const clean=s=>String(s??'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').trim();
export async function onRequestPost({request,env}){
  let d;try{d=await request.json()}catch{return json({ok:false,error:'Invalid request.'},400)}
  const origin=request.headers.get('origin');
  if(env.ALLOWED_ORIGIN&&origin&&origin!==env.ALLOWED_ORIGIN)return json({ok:false,error:'Forbidden.'},403);
  if(clean(d.website))return json({ok:true}); // honeypot filled: bot, drop silently
  const name=clean(d.name),email=clean(d.email),subject=clean(d.subject).replace(/\s+/g,' '),message=clean(d.message);
  if(!(Number(d.t)>=3000))return json({ok:false,error:'Please try again.'},400); // submitted faster than a person can type
  if(name.length<2||name.length>80||email.length>120||!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)||subject.length<3||subject.length>120||message.length<10||message.length>2000)return json({ok:false,error:'Please check the form fields.'},400);
  if(!env.RESEND_API_KEY)return json({ok:false,error:'Email service is not configured.'},503);
  const res=await fetch('https://api.resend.com/emails',{method:'POST',headers:{authorization:`Bearer ${env.RESEND_API_KEY}`,'content-type':'application/json'},body:JSON.stringify({from:env.FROM_EMAIL||'Quranic Core Website <onboarding@resend.dev>',to:[env.TO_EMAIL||TO],reply_to:email,subject:`[Website question] ${subject}`,text:`Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}\n`})}).catch(()=>null);
  if(!res||!res.ok)return json({ok:false,error:'Email could not be sent.'},502);
  return json({ok:true});
}
export const onRequest=()=>json({ok:false,error:'Method not allowed.'},405);
