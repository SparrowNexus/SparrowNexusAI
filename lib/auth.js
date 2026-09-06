import crypto from 'node:crypto';

const COOKIE = 'sparrow_admin';
const MAX_AGE = 60 * 60 * 24 * 7;

function secret(){
  const value = process.env.ADMIN_PASSWORD;
  if (!value) throw new Error('ADMIN_PASSWORD is not configured on the server.');
  return value;
}
function sign(payload){
  return crypto.createHmac('sha256', secret()).update(payload).digest('hex');
}
export function createSession(){
  const payload = `${Date.now()}.${crypto.randomBytes(18).toString('hex')}`;
  return `${payload}.${sign(payload)}`;
}
export function validSession(token){
  if(!token) return false;
  const parts = token.split('.');
  if(parts.length !== 3) return false;
  const [timestamp,, signature] = parts;
  if(Date.now() - Number(timestamp) > MAX_AGE * 1000) return false;
  const expected = sign(`${timestamp}.${parts[1]}`);
  if(signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
export function setSession(res, token){
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`);
}
export function clearSession(res){
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}
export function getSession(req){
  const raw = req.headers.cookie || '';
  const match = raw.split(';').map(v=>v.trim()).find(v=>v.startsWith(`${COOKIE}=`));
  return match ? decodeURIComponent(match.slice(COOKIE.length + 1)) : '';
}
export function requireAuth(req,res){
  if(!validSession(getSession(req))){ res.status(401).json({error:'Unauthorized'}); return false; }
  return true;
}
