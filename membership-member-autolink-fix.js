(function(){
'use strict';
if(window.__ntMembershipMemberAutoLinkFix)return;window.__ntMembershipMemberAutoLinkFix=true;
const $=(s,r=document)=>r.querySelector(s);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
const cloud=()=>window.NURSETRACK_CLOUD_CLIENT||window.nt28Cloud||null;
let busy=false,rows=[];
async function loadRows(){const sb=cloud();if(!sb)return[];const [m,p,c]=await Promise.all([
 sb.from('nursetrack_company_users').select('company_id,user_id,active').eq('active',true),
 sb.from('nursetrack_profiles').select('user_id,full_name,username,active,deleted_at'),
 sb.from('nursetrack_companies').select('id,display_name,name,status')
]);if(m.error||p.error||c.error)return[];
 const pm=new Map((p.data||[]).filter(x=>x.active!==false&&!x.deleted_at).map(x=>[x.user_id,x]));
 const cm=new Map((c.data||[]).filter(x=>String(x.status||'active').toLowerCase()!=='inactive').map(x=>[x.id,x]));
 return (m.data||[]).map(x=>{const pr=pm.get(x.user_id),co=cm.get(x.company_id);if(!pr||!co)return null;return{user_id:x.user_id,company_id:x.company_id,user_name:pr.full_name||pr.username||x.user_id,company_name:co.display_name||co.name||x.company_id}}).filter(Boolean);
}
function setCompanyOptions(card){const cs=$('#ntBillCompany',card);if(!cs)return;const current=cs.value;const seen=new Set;const opts=[];for(const r of rows){if(seen.has(r.company_id))continue;seen.add(r.company_id);opts.push('<option value="'+r.company_id+'">'+r.company_name+'</option>')}cs.innerHTML='<option value="">Seleccione compañía</option>'+opts.join('');if(current&&seen.has(current))cs.value=current;}
function fillMembers(card,preferUser){const mode=$('#ntBillTargetType',card),cs=$('#ntBillCompany',card),us=$('#ntBillUser',card);if(!mode||!cs||!us||mode.value!=='member')return;let list=rows.slice();if(cs.value)list=list.filter(r=>r.company_id===cs.value);const uniq=[];const seen=new Set;for(const r of list){if(seen.has(r.user_id))continue;seen.add(r.user_id);uniq.push(r)}
 us.innerHTML='<option value="">Seleccione usuario / miembro</option>'+uniq.map(r=>'<option value="'+r.user_id+'">'+r.user_name+' · '+r.company_name+'</option>').join('');
 if(preferUser&&uniq.some(r=>r.user_id===preferUser))us.value=preferUser;
 if(!us.value&&uniq.length===1){us.value=uniq[0].user_id;if(!cs.value){cs.value=uniq[0].company_id}}
 const st=$('#ntBillStatus',card);if(st&&uniq.length===0)st.innerHTML='<b>No hay miembros activos en esta compañía.</b>';
}
async function sync(card){if(busy)return;busy=true;try{rows=await loadRows();setCompanyOptions(card);fillMembers(card,$('#ntBillUser',card)?.value||'');}finally{busy=false}}
function bind(card){if(!card||card.dataset.ntMemberAutoLink==='1')return;card.dataset.ntMemberAutoLink='1';const mode=$('#ntBillTargetType',card),cs=$('#ntBillCompany',card),us=$('#ntBillUser',card);if(!mode||!cs||!us)return;
 mode.addEventListener('change',()=>{if(mode.value==='member')setTimeout(()=>sync(card),20)},true);
 cs.addEventListener('change',()=>{if(mode.value==='member')setTimeout(()=>fillMembers(card,''),20)},true);
 us.addEventListener('change',()=>{if(mode.value!=='member'||!us.value)return;const r=rows.find(x=>x.user_id===us.value);if(r&&cs.value!==r.company_id){cs.value=r.company_id;setTimeout(()=>fillMembers(card,us.value),20)}},true);
 sync(card);
}
function scan(){const card=$('#ntCompanySubscriptionBilling');if(card)bind(card)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{setTimeout(scan,150)},{once:true});else setTimeout(scan,150);
setInterval(scan,700);document.addEventListener('click',()=>setTimeout(scan,100),true);
})();