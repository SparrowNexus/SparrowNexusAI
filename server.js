import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = __dirname;
const dataDir = path.join(root, 'data');
const dataFile = path.join(dataDir, 'content.json');
const distDir = path.join(root, 'dist');
fs.mkdirSync(dataDir, {recursive:true});

const defaults = {
  site:{brand:'SPARROWNEXUS', email:'sparrowsnexus@gmail.com', location:'India · Global'},
  hero:{eyebrow:'A DIGITAL ATELIER FOR MOVING IDEAS', title:'Make|technology|feel alive.', description:'We design and engineer websites, AI applications and digital systems for companies that would rather be remembered than merely understood.'},
  services:[
    {n:'01',t:'Web experiences',d:'Editorial, high-performance websites where interface, motion and brand behave as one system.',meta:'Strategy / Design / Engineering'},
    {n:'02',t:'AI applications',d:'Useful AI products with thoughtful workflows, dependable interfaces and a clear path from prototype to production.',meta:'Product / AI / Engineering'},
    {n:'03',t:'Digital systems',d:'Design systems, platforms and internal tools that make complicated operations feel remarkably simple.',meta:'Systems / UX / Build'}
  ],
  projects:[
    {n:'01',k:'AI / PRODUCT',title:'A quieter way to work with intelligence.',desc:'An AI operating layer designed around human decisions rather than model theatre.',details:'A product concept focused on calm, human-centred AI workflows. The interface turns complex model behaviour into clear decisions, actions and feedback.'},
    {n:'02',k:'WEB / EXPERIENCE',title:'A digital world with a sense of place.',desc:'A spatial brand experience where every scroll changes the relationship between type, image and information.',details:'A scroll-led brand world where typography, movement and spatial composition create a distinct digital identity.'},
    {n:'03',k:'SYSTEM / PLATFORM',title:'Complexity, made legible.',desc:'A modular platform that turns a dense operational ecosystem into one coherent visual language.',details:'A system-first interface designed to reduce cognitive load while preserving the richness of a complex operational product.'}
  ]
};
function readContent(){try{return JSON.parse(fs.readFileSync(dataFile,'utf8'))}catch{return defaults}}
function writeContent(c){fs.writeFileSync(dataFile,JSON.stringify(c,null,2))}
if(!fs.existsSync(dataFile)) writeContent(defaults);

const app=express(); app.use(express.json({limit:'1mb'}));
const sessions=new Set();
function token(){return crypto.randomBytes(32).toString('hex')}
function auth(req,res,next){const t=req.headers.authorization?.replace('Bearer ',''); if(!t||!sessions.has(t)) return res.status(401).json({error:'Unauthorized'}); next()}
app.get('/api/content',(req,res)=>res.json(readContent()));
app.post('/api/admin/login',(req,res)=>{const {password}=req.body||{}; const expected=process.env.ADMIN_PASSWORD; if(!expected) return res.status(503).json({error:'ADMIN_PASSWORD is not configured on the server.'}); if(password!==expected) return res.status(401).json({error:'Incorrect password.'}); const t=token(); sessions.add(t); res.json({token:t})});
app.post('/api/admin/logout',auth,(req,res)=>{sessions.delete(req.headers.authorization.replace('Bearer ',''));res.json({ok:true})});
app.put('/api/content',auth,(req,res)=>{const c=req.body; if(!c?.site||!Array.isArray(c.services)||!Array.isArray(c.projects)) return res.status(400).json({error:'Invalid content payload.'}); writeContent(c); res.json({ok:true,content:c})});
app.post('/api/contact',async(req,res)=>{const {name,email,type,message}=req.body||{}; if(!name||!email||!message) return res.status(400).json({error:'Name, email and message are required.'}); const to=process.env.SMTP_USER||'sparrowsnexus@gmail.com'; if(!process.env.SMTP_USER||!process.env.SMTP_APP_PASSWORD) return res.status(503).json({error:'Email server is not configured yet. Add SMTP_USER and SMTP_APP_PASSWORD to .env.'}); try{const transporter=nodemailer.createTransport({service:'gmail',auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_APP_PASSWORD}}); await transporter.sendMail({from:process.env.SMTP_USER,to,replyTo:email,subject:`Sparrow Nexus AI enquiry — ${type||'Project'}`,text:`Name: ${name}\nEmail: ${email}\nProject: ${type||'Not specified'}\n\n${message}`}); res.json({ok:true})}catch(e){console.error(e);res.status(500).json({error:'Unable to send the enquiry right now.'})}});
app.use(express.static(distDir)); app.get('/{*splat}',(req,res)=>res.sendFile(path.join(distDir,'index.html')));
const port=process.env.PORT||8787; app.listen(port,()=>console.log(`Sparrow Nexus server running on http://localhost:${port}`));
