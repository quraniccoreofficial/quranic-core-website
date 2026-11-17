// Logic test of the serverless function with a MOCKED email provider (does not send real email).
import {onRequestPost} from '../functions/api/ask.js';
let calls=[],mock=()=>new Response('{}',{status:200});globalThis.fetch=async(u,o)=>{calls.push({u,o});return mock()};
const good={name:'Test Parent',email:'parent@example.com',subject:'Course question',message:'Do you teach Qaida to adults?',website:'',t:5000};
const run=async(body,env={RESEND_API_KEY:'k'},raw)=>{calls=[];const r=await onRequestPost({request:new Request('https://x.test/api/ask',{method:'POST',body:raw??JSON.stringify(body)}),env});return [r.status,await r.json()]};
const t=[];const ck=(n,c)=>{t.push(c);console.log(c?'PASS':'FAIL',n)};
let [s,j]=await run(null,{},'{bad');ck('invalid JSON -> 400',s==400&&!j.ok);
[s,j]=await run({...good,website:'spam'});ck('honeypot -> silently dropped, no email',j.ok&&calls.length==0);
[s,j]=await run({...good,t:500});ck('too-fast submit -> 400',s==400&&calls.length==0);
[s,j]=await run({...good,email:'nope'});ck('bad email -> 400',s==400&&calls.length==0);
[s,j]=await run({...good,message:'short'});ck('short message -> 400',s==400);
[s,j]=await run(good,{});ck('no API key -> 503 (never fake success)',s==503&&!j.ok);
[s,j]=await run(good);const b=JSON.parse(calls[0]?.o.body||'{}');ck('valid + provider OK -> ok:true',s==200&&j.ok===true);
ck('email addressed to quraniccore.official@gmail.com, reply-to visitor',b.to?.[0]=='quraniccore.official@gmail.com'&&b.reply_to=='parent@example.com'&&calls[0].o.headers.authorization=='Bearer k');
mock=()=>new Response('{}',{status:500});[s,j]=await run(good);ck('provider failure -> 502, ok:false',s==502&&j.ok===false);
mock=()=>{throw new Error('net')};[s,j]=await run(good);ck('network error -> 502, ok:false',s==502&&j.ok===false);
console.log(t.every(Boolean)?'ALL PASSED':'FAILURES');process.exit(t.every(Boolean)?0:1);
