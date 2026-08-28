export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','https://orellanes.github.io');
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS') return res.status(204).end();
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const {channel,to,patient,date,time,type}=req.body||{};
  if(!channel||!to||!date||!time) return res.status(400).json({error:'Missing required fields'});
  const body=`Recordatorio de cita de NurseTrack Clinical: su cita está programada para ${date} a las ${time}${type?`. Tipo de visita: ${type}.`:'.'} Si necesita cambiar su cita, comuníquese con la clínica.`;
  try{
    if(channel==='sms'){
      const sid=process.env.TWILIO_ACCOUNT_SID, token=process.env.TWILIO_AUTH_TOKEN, from=process.env.TWILIO_FROM_NUMBER;
      if(!sid||!token||!from) return res.status(503).json({error:'SMS provider not configured'});
      const form=new URLSearchParams({To:to,From:from,Body:body});
      const auth=Buffer.from(`${sid}:${token}`).toString('base64');
      const r=await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,{method:'POST',headers:{Authorization:`Basic ${auth}`,'Content-Type':'application/x-www-form-urlencoded'},body:form});
      const data=await r.json();
      if(!r.ok) return res.status(r.status).json({error:data.message||'SMS failed'});
      return res.status(200).json({ok:true,channel:'sms',id:data.sid});
    }
    if(channel==='email'){
      const key=process.env.RESEND_API_KEY, from=process.env.REMINDER_FROM_EMAIL;
      if(!key||!from) return res.status(503).json({error:'Email provider not configured'});
      const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],subject:'Recordatorio de cita',text:body})});
      const data=await r.json();
      if(!r.ok) return res.status(r.status).json({error:data.message||'Email failed'});
      return res.status(200).json({ok:true,channel:'email',id:data.id});
    }
    return res.status(400).json({error:'Unsupported channel'});
  }catch(err){return res.status(500).json({error:'Reminder service error'});}
}
