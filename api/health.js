export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET') return res.status(405).json({ok:false,error:'Method not allowed'});
  const envCheck={
    telnyxApiKey:Boolean(process.env.TELNYX_API_KEY),
    telnyxFromNumber:Boolean(process.env.TELNYX_FROM_NUMBER),
    telnyxMessagingProfileId:Boolean(process.env.TELNYX_MESSAGING_PROFILE_ID),
    appOrigin:Boolean(process.env.APP_ORIGIN),
    supabaseUrl:Boolean(process.env.SUPABASE_URL),
    supabasePublishableKey:Boolean(process.env.SUPABASE_PUBLISHABLE_KEY)
  };
  return res.status(200).json({
    ok:true,
    service:'NurseTrack backend',
    version:'stable25',
    paypalConfigured:Boolean(process.env.PAYPAL_CLIENT_ID&&process.env.PAYPAL_CLIENT_SECRET),
    telnyxConfigured:envCheck.telnyxApiKey&&envCheck.telnyxFromNumber,
    envCheck,
    environment:process.env.VERCEL_ENV||'unknown'
  });
}
