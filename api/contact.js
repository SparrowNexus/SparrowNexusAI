import nodemailer from 'nodemailer';
export default async function handler(req,res){
  if(req.method !== 'POST') return res.status(405).end('Method Not Allowed');
  const {name,email,type,message}=req.body||{};
  if(!name||!email||!message) return res.status(400).json({error:'Name, email and message are required.'});
  if(!process.env.SMTP_USER||!process.env.SMTP_APP_PASSWORD) return res.status(503).json({error:'Email server is not configured yet.'});
  try{
    const transporter=nodemailer.createTransport({service:'gmail',auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_APP_PASSWORD}});
    await transporter.sendMail({from:process.env.SMTP_USER,to:process.env.SMTP_USER,replyTo:email,subject:`Sparrow Nexus AI enquiry — ${type||'Project'}`,text:`Name: ${name}\nEmail: ${email}\nProject: ${type||'Not specified'}\n\n${message}`});
    return res.status(200).json({ok:true});
  }catch(error){ console.error(error); return res.status(500).json({error:'Unable to send the enquiry right now.'}); }
}
