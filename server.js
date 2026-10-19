const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const rooms = new Map();
const root = path.join(__dirname, 'public');
const MAX_BODY = 250000;
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
function send(res,code,obj){res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(obj));}
function roomInfo(r){return {code:r.code,state:r.state,controllerCount:r.clients.size};}
function broadcast(r){const line='data: '+JSON.stringify(roomInfo(r))+'\n\n';for(const client of r.clients){try{client.write(line);}catch{r.clients.delete(client);}}}
function parse(req){return new Promise((resolve,reject)=>{let s='';req.on('data',b=>{s+=b;if(s.length>MAX_BODY){reject(new Error('too large'));req.destroy();}});req.on('end',()=>{try{resolve(JSON.parse(s||'{}'));}catch{reject(new Error('invalid json'));}});req.on('error',reject);});}
function createRoom(){let code;do{code=String(crypto.randomInt(100000,1000000));}while(rooms.has(code));const hostToken=crypto.randomBytes(24).toString('hex');const r={code,hostToken,clients:new Set(),updated:Date.now(),state:{text:'Cole seu roteiro aqui e comece a gravar.\n\nUse o celular para controlar a rolagem de qualquer ponto do estúdio.',playing:false,speed:55,font:56,lineHeight:1.42,margin:16,mirror:false,flip:false,theme:'dark',position:0}};rooms.set(code,r);return r;}
const allowed={text:v=>typeof v==='string'&&v.length<=100000,playing:v=>typeof v==='boolean',speed:v=>Number.isFinite(v)&&v>=0&&v<=250,font:v=>Number.isFinite(v)&&v>=20&&v<=140,lineHeight:v=>Number.isFinite(v)&&v>=1&&v<=2.5,margin:v=>Number.isFinite(v)&&v>=0&&v<=35,mirror:v=>typeof v==='boolean',flip:v=>typeof v==='boolean',theme:v=>['dark','light','yellow'].includes(v),position:v=>Number.isFinite(v)&&v>=0&&v<=1};
const server=http.createServer(async(req,res)=>{const url=new URL(req.url,'http://localhost');let match;
 if(req.method==='GET'&&url.pathname==='/api/network'){const ips=Object.values(os.networkInterfaces()).flat().filter(x=>x&&x.family==='IPv4'&&!x.internal).map(x=>x.address);return send(res,200,{ips,port:PORT});}
 if(req.method==='POST'&&url.pathname==='/api/rooms'){const r=createRoom();return send(res,201,{...roomInfo(r),hostToken:r.hostToken});}
 if((match=url.pathname.match(/^\/api\/rooms\/(\d{6})(?:\/(events|state))?$/))){const r=rooms.get(match[1]);if(!r)return send(res,404,{error:'Sala não encontrada ou expirada'});r.updated=Date.now();
  if(req.method==='GET'&&!match[2])return send(res,200,roomInfo(r));
  if(req.method==='GET'&&match[2]==='events'){res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});r.clients.add(res);res.write('data: '+JSON.stringify(roomInfo(r))+'\n\n');const ping=setInterval(()=>{try{res.write(': ping\n\n');}catch{}},15000);req.on('close',()=>{clearInterval(ping);r.clients.delete(res);});return;}
  if(req.method==='PATCH'&&match[2]==='state'){try{const data=await parse(req);const patch=data.patch||{};if(!patch||typeof patch!=='object'||Array.isArray(patch))return send(res,400,{error:'Payload inválido'});if(Object.keys(patch).some(k=>!(k in allowed)||!allowed[k](patch[k])))return send(res,400,{error:'Configuração inválida'});if(('text' in patch||'theme' in patch)&&data.hostToken!==r.hostToken)return send(res,403,{error:'Apenas o apresentador pode editar texto e tema'});Object.assign(r.state,patch);broadcast(r);return send(res,200,{ok:true});}catch{return send(res,400,{error:'JSON inválido'});}}
 }
 if(req.method!=='GET')return send(res,405,{error:'Método não permitido'});
 let f=url.pathname==='/'?'index.html':url.pathname.substring(1);const full=path.resolve(root,f);if(!full.startsWith(root+path.sep)&&full!==path.join(root,'index.html'))return send(res,403,{error:'Proibido'});
 fs.readFile(full,(err,data)=>{if(err){res.writeHead(404);return res.end('Não encontrado');}res.writeHead(200,{'Content-Type':mime[path.extname(full)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);});
});
setInterval(()=>{for(const [key,r] of rooms)if(Date.now()-r.updated>24*60*60*1000){for(const c of r.clients)c.end();rooms.delete(key);}},60000).unref();
server.listen(PORT,HOST,()=>console.log(`Teleprompter Remote: http://localhost:${PORT}`));
