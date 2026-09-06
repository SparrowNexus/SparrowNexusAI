import { clearSession } from '../../lib/auth.js';
export default function handler(req,res){
  if(req.method !== 'POST') return res.status(405).end('Method Not Allowed');
  clearSession(res); return res.status(200).json({ok:true});
}
