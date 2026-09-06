import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import { clearSession, createSession, requireAuth, setSession } from './lib/auth.js';

dotenv.config();
// Local development server only. Vercel production uses the serverless functions in /api.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'content.json');
const distDir = path.join(__dirname, 'dist');
fs.mkdirSync(dataDir,{recursive:true});
const defaults = JSON.parse(fs.readFileSync(dataFile,'utf8'));
function readContent(){try{return JSON.parse(fs.readFileSync(dataFile,'utf8'))}catch{return defaults}}
function writeContent(c){fs.writeFileSync(dataFile,JSON.stringify(c,null,2))}
const app=express(); app.use(express.json({limit:'1mb'}));
app.get('/api/content',(req,res)=>res.json(readContent()));
app.post('/api/admin/login',(req,res)=>{const {password}=req.body||{}; if(!process.env.ADMIN_PASSWORD)return res.status(503).json({error:'ADMIN_PASSWORD is not configured on the server.'}); if(password!==process.env.ADMIN_PASSWORD)return res.status(401).json({error:'Incorrect password.'}); setSession(res,createSession()); res.json({ok:true})});
app.post('/api/admin/logout',(req,res)=>{clearSession(res);res.json({ok:true})});
app.put('/api/content',(req,res)=>{if(!requireAuth(req,res))return;const c=req.body;if(!c?.site||!Array.isArray(c.services)||!Array.isArray(c.projects))return res.status(400).json({error:'Invalid content payload.'});writeContent(c);res.json({ok:true,content:c})});
app.post('/api/contact',async(req,res)=>{const {name,email,type,message}=req.body||{};if(!name||!email||!message)return res.status(400).json({error:'Name, email and message are required.'});if(!process.env.SMTP_USER||!process.env.SMTP_APP_PASSWORD)return res.status(503).json({error:'Email server is not configured yet. Add SMTP_USER and SMTP_APP_PASSWORD to .env.'});try{const transporter=nodemailer.createTransport({service:'gmail',auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_APP_PASSWORD}});await transporter.sendMail({from:process.env.SMTP_USER,to:process.env.SMTP_USER,replyTo:email,subject:`Sparrow Nexus AI enquiry — ${type||'Project'}`,text:`Name: ${name}\nEmail: ${email}\nProject: ${type||'Not specified'}\n\n${message}`});res.json({ok:true})}catch(e){console.error(e);res.status(500).json({error:'Unable to send the enquiry right now.'})}});
app.use(express.static(distDir)); app.get('/{*splat}',(req,res)=>res.sendFile(path.join(distDir,'index.html')));
const port=process.env.PORT||8787;app.listen(port,()=>console.log(`Sparrow Nexus server running on http://localhost:${port}`));
