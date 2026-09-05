(function(){'use strict';
const sb=window.nt28Cloud||window.NURSETRACK_CLOUD_CLIENT;if(!sb)return;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function invoke(body){const r=await sb.functions.invoke('paypal-company-subscription',{body});if(r.error)throw r.error;if(r.data&&r.data.ok===false)throw new Error(r.data.error||'No se pudo completar la membresía.');return r.data||{}}
async function companies(){try{const r=await sb.from('nursetrack_companies').select('id,name,display_name,status').order('name');return (r.data||[]).filter(x=>String(x.status||'active').toLowerCase()!=='inactive')}catch{return[]}}
async function install(){for(let i=0;i<120;i++){
 const create=document.getElementById('nt37Create'),company=document.getElementById('nt37Company'),email=document.getElementById('nt37Email');
 if(!create||!company||!email){await sleep(250);continue}
 if(create.dataset.ntUnifiedMembership==='1')return;create.dataset.ntUnifiedMembership='1';
 const cs=await companies();
 const row=company.parentElement;
 const billing=document.createElement('select');billing.id='nt37BillingType';billing.innerHTML='<option value="member">Miembro de una compañía</option><option value="independent">Usuario independiente</option>';
 const sel=document.createElement('select');sel.id='nt37CompanyUnified';sel.innerHTML='<option value="">Seleccione compañía</option>'+cs.map(c=>'<option value="'+c.id+'" data-name="'+String(c.display_name||c.name||'').replace(/"/g,'&quot;')+'">'+(c.display_name||c.name||c.id)+'</option>').join('');
 const amount=document.createElement('input');amount.id='nt37MembershipAmount';amount.type='number';amount.min='0';amount.step='0.01';amount.value='5.00';amount.placeholder='Precio mensual';
 const grace=document.createElement('input');grace.id='nt37MembershipGrace';grace.type='number';grace.min='0';grace.max='30';grace.value='5';grace.placeholder='Días de gracia';
 company.style.display='none';row.insertBefore(billing,company);row.insertBefore(sel,company);row.insertBefore(amount,company);row.insertBefore(grace,company);
 const title=create.closest('div')?.querySelector('h3');if(title)title.textContent='Registrar usuario + membresía + suscripción';
 create.textContent='Crear usuario + membresía';
 billing.onchange=()=>{const ind=billing.value==='independent';sel.disabled=ind;if(ind){sel.value='';company.value=''}else{sel.disabled=false}};
 sel.onchange=()=>{const opt=sel.options[sel.selectedIndex];company.value=opt&&opt.dataset.name||''};
 create.addEventListener('click',async function(){
   const chosenEmail=email.value.trim().toLowerCase(),mode=billing.value,cid=sel.value,a=Number(amount.value),g=Number(grace.value);
   if(!chosenEmail)return;if(mode==='member'&&!cid)return;
   setTimeout(async()=>{try{
     let data=null;for(let n=0;n<8;n++){data=await invoke({action:'list_targets'});const u=(data.users||[]).find(x=>String(x.email||'').toLowerCase()===chosenEmail);if(u){await invoke({action:'save_user',user_id:u.id,company_id:mode==='member'?cid:'',amount:Number.isFinite(a)?a:5,grace_period_days:Number.isInteger(g)?g:5});const s=document.getElementById('nt37Status');if(s){s.textContent='✓ Usuario, membresía y suscripción creados y enlazados.';s.style.color='#22643a'}window.dispatchEvent(new CustomEvent('nursetrack:user-membership-updated',{detail:{user_id:u.id,company_id:mode==='member'?cid:null}}));return}await sleep(500)}
   }catch(e){const s=document.getElementById('nt37Status');if(s){s.textContent='⚠ Usuario creado; revise membresía: '+(e.message||e);s.style.color='#8a2d2d'}}},900);
 },true);
 return;
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,300),{once:true});else setTimeout(install,300);
document.addEventListener('click',e=>{if(e.target&&e.target.closest&&e.target.closest('#nt37UserAdminHost,button'))setTimeout(install,180)},true);
})();