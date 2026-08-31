export default async function handler(req,res){
  const origin=process.env.APP_ORIGIN||'https://orellanes.github.io';
  res.setHeader('Access-Control-Allow-Origin',origin);
  res.setHeader('Access-Control-Allow-Methods','GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Authorization,Content-Type');
  res.setHeader('Vary','Origin');
  if(req.method==='OPTIONS') return res.status(204).end();
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
  const clientId=process.env.PAYPAL_CLIENT_ID;
  if(!clientId) return res.status(503).json({error:'PayPal is not configured'});
  return res.status(200).json({clientId,environment:(process.env.PAYPAL_ENV||'sandbox').toLowerCase()==='live'?'live':'sandbox',currency:'USD'});
}
