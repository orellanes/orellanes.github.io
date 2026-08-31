export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET') return res.status(405).json({ok:false,error:'Method not allowed'});
  return res.status(200).json({ok:true,service:'NurseTrack backend',version:'stable25',paypalConfigured:Boolean(process.env.PAYPAL_CLIENT_ID&&process.env.PAYPAL_CLIENT_SECRET),telnyxConfigured:Boolean(process.env.TELNYX_API_KEY&&process.env.TELNYX_FROM_NUMBER),environment:process.env.VERCEL_ENV||'unknown'});
}
