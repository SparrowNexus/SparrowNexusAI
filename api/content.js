import { readContent, writeContent } from '../lib/content.js';
import { requireAuth } from '../lib/auth.js';

export default async function handler(req,res){
  if(req.method === 'GET') return res.status(200).json(await readContent());
  if(req.method === 'PUT'){
    if(!requireAuth(req,res)) return;
    const content = req.body;
    if(!content?.site || !Array.isArray(content.services) || !Array.isArray(content.projects)) return res.status(400).json({error:'Invalid content payload.'});
    try { await writeContent(content); return res.status(200).json({ok:true,content}); }
    catch(error){ console.error(error); return res.status(500).json({error:error.message}); }
  }
  res.setHeader('Allow','GET, PUT'); return res.status(405).end('Method Not Allowed');
}
