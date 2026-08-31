export default async function handler(req,res){
  const allowedOrigin=process.env.APP_ORIGIN||'https://orellanes.github.io';
  const origin=req.headers.origin||'';
  if(origin===allowedOrigin) res.setHeader('Access-Control-Allow-Origin',origin);
  res.setHeader('Vary','Origin');
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
  if(req.method==='OPTIONS') return res.status(204).end();
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  if(origin&&origin!==allowedOrigin) return res.status(403).json({error:'Origin not allowed'});

  const authHeader=req.headers.authorization||'';
  const accessToken=authHeader.startsWith('Bearer ')?authHeader.slice(7):'';
  const supabaseUrl=process.env.SUPABASE_URL;
  const supabaseKey=process.env.SUPABASE_PUBLISHABLE_KEY;
  if(!accessToken||!supabaseUrl||!supabaseKey) return res.status(401).json({error:'Authentication required'});
  try{
    const ur=await fetch(`${supabaseUrl}/auth/v1/user`,{headers:{Authorization:`Bearer ${accessToken}`,apikey:supabaseKey}});
    if(!ur.ok) return res.status(401).json({error:'Invalid or expired session'});
  }catch(e){return res.status(503).json({error:'Authentication service unavailable'});}

  const {channel,to,date,time,type,message}=req.body||{};
  if(!channel||!to||!date||!time) return res.status(400).json({error:'Missing required fields'});
  const text=String(message||`Recordatorio de cita de NurseTrack Clinical: su cita está programada para ${date} a las ${time}${type?`. Tipo de visita: ${type}.`:'.'} Si necesita cambiar su cita, comuníquese con la clínica.`).trim();
  if(!text) return res.status(400).json({error:'Message is empty'});

  try{
    if(channel==='sms'){
      const key=process.env.TELNYX_API_KEY,from=process.env.TELNYX_FROM_NUMBER,profile=process.env.TELNYX_MESSAGING_PROFILE_ID;
      if(!key||!from) return res.status(503).json({error:'SMS provider not configured'});
      const phone=String(to).replace(/[\s().-]/g,'');
      if(!/^\+[1-9]\d{7,14}$/.test(phone)) return res.status(400).json({error:'Phone number must use E.164 format'});
      const payload={from,to:phone,text};
      if(profile) payload.messaging_profile_id=profile;
      const r=await fetch('https://api.telnyx.com/v2/messages',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const data=await r.json().catch(()=>({}));
      if(!r.ok) return res.status(r.status).json({error:(data.errors&&data.errors[0]&&data.errors[0].detail)||'SMS failed'});
      return res.status(200).json({ok:true,channel:'sms',id:data.data&&data.data.id,status:data.data&&data.data.to&&data.data.to[0]&&data.data.to[0].status});
    }

    if(channel==='email'){
      const key=process.env.RESEND_API_KEY,from=process.env.REMINDER_FROM_EMAIL;
      if(!key||!from) return res.status(503).json({error:'Email provider not configured'});
      const email=String(to).trim();
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({error:'Invalid email'});
      const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[email],subject:'Recordatorio de cita',text})});
      const data=await r.json().catch(()=>({}));
      if(!r.ok) return res.status(r.status).json({error:data.message||'Email failed'});
      return res.status(200).json({ok:true,channel:'email',id:data.id});
    }

    return res.status(400).json({error:'Unsupported channel'});
  }catch(err){return res.status(500).json({error:'Reminder service error'});}
}
