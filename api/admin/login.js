import { createSession, setSession } from '../../lib/auth.js';
export default function handler(req,res){
  if(req.method !== 'POST') return res.status(405).end('Method Not Allowed');
  const expected = process.env.ADMIN_PASSWORD;
  if(!expected) return res.status(503).json({error:'ADMIN_PASSWORD is not configured on the server.'});
  const {password} = req.body || {};
  if(password !== expected) return res.status(401).json({error:'Incorrect password.'});
  setSession(res, createSession());
  return res.status(200).json({ok:true});
}
