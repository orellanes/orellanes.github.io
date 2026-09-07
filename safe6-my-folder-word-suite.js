(function(){'use strict';
if(window.__ntMyFolderWordSuite)return;window.__ntMyFolderWordSuite=true;
function q(s,r){return(r||document).querySelector(s)}function qa(s,r){return Array.from((r||document).querySelectorAll(s))}
function role(){return String(document.documentElement.dataset.ntPermissionRole||'').toLowerCase()}
function isSuper(){return role()==='superadmin'}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function download(name,type,data){var b=new Blob([data],{type:type}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},500)}
function syncToEditor(){var t=q('#nt37PDContent'),e=q('#nt37PDRich');if(t&&e)e.innerHTML=t.value||''}
function syncToText(){var t=q('#nt37PDContent'),e=q('#nt37PDRich');if(t&&e)t.value=e.innerHTML}
function cmd(c,v){q('#nt37PDRich')&&q('#nt37PDRich').focus();document.execCommand(c,false,v||null);syncToText()}
function table(){var r=Math.max(1,Math.min(20,Number(prompt('Filas','3'))||3)),c=Math.max(1,Math.min(10,Number(prompt('Columnas','3'))||3)),h='<table border="1" style="border-collapse:collapse;width:100%">';for(var i=0;i<r;i++){h+='<tr>';for(var j=0;j<c;j++)h+='<td style="padding:6px">&nbsp;</td>';h+='</tr>'}h+='</table><p><br></p>';cmd('insertHTML',h)}
function line(){cmd('insertHTML','<hr><p><br></p>')}
function install(){var form=q('.nt37PDForm');if(!form||q('#nt37PDRich'))return;
 var ta=q('#nt37PDContent');if(!ta)return;ta.style.display='none';
 var bar=document.createElement('div');bar.id='nt37PDWordBar';bar.innerHTML='<div style="font-weight:700;margin:2px 0 7px">Editor de documentos</div><div class="nt37PDActions" style="padding:8px;border:1px solid #dbe7e9;border-radius:10px;background:#f7fbfb"><button type="button" class="btn secondary" data-c="bold"><b>B</b></button><button type="button" class="btn secondary" data-c="italic"><i>I</i></button><button type="button" class="btn secondary" data-c="underline"><u>U</u></button><button type="button" class="btn secondary" data-c="insertUnorderedList">• Lista</button><button type="button" class="btn secondary" data-c="justifyLeft">Izq.</button><button type="button" class="btn secondary" data-c="justifyCenter">Centro</button><button type="button" class="btn secondary" id="nt37PDLine">— Línea</button><button type="button" class="btn secondary" id="nt37PDTable">▦ Tabla</button><label class="btn secondary" style="cursor:pointer">Color <input id="nt37PDColor" type="color" style="width:28px;height:20px;padding:0;border:0;margin:0"></label><select id="nt37PDSize" style="width:auto;margin:0;padding:7px"><option value="3">Normal</option><option value="4">Grande</option><option value="5">Título</option></select></div>';
 ta.parentNode.insertBefore(bar,ta);
 var ed=document.createElement('div');ed.id='nt37PDRich';ed.contentEditable='true';ed.setAttribute('role','textbox');ed.setAttribute('aria-label','Contenido del documento');ed.style.cssText='min-height:320px;border:1px solid #dbe7e9;border-radius:10px;padding:14px;background:#fff;line-height:1.5;overflow:auto;margin-bottom:10px';ta.parentNode.insertBefore(ed,ta.nextSibling);
 qa('[data-c]',bar).forEach(function(b){b.onclick=function(){cmd(b.dataset.c)}});q('#nt37PDLine').onclick=line;q('#nt37PDTable').onclick=table;q('#nt37PDColor').oninput=function(){cmd('foreColor',this.value)};q('#nt37PDSize').onchange=function(){cmd('fontSize',this.value)};ed.oninput=syncToText;
 var actions=q('#nt37PDSave').parentNode,dl=document.createElement('button'),tr=document.createElement('button');dl.type='button';dl.className='btn secondary';dl.id='nt37PDDownload';dl.textContent='⬇️ Descargar';tr.type='button';tr.className='btn secondary';tr.id='nt37PDTransfer';tr.textContent='↗ Transferir / Exportar';actions.appendChild(dl);actions.appendChild(tr);
 dl.onclick=function(){syncToText();var title=(q('#nt37PDTitle').value||'documento').replace(/[^a-z0-9_-]+/gi,'_');download(title+'.html','text/html;charset=utf-8','<!doctype html><meta charset="utf-8"><title>'+esc(q('#nt37PDTitle').value)+'</title><body>'+ed.innerHTML+'</body>')};
 tr.onclick=function(){if(!isSuper())return alert('Solo el superadministrador puede transferir/exportar documentos.');syncToText();download('nursetrack-documento-'+Date.now()+'.json','application/json',JSON.stringify({title:q('#nt37PDTitle').value,category:q('#nt37PDCategory').value,content:ta.value,exportedAt:new Date().toISOString()},null,2))};
 document.addEventListener('click',function(ev){if(ev.target&&ev.target.id==='nt37PDSave')syncToText()},true);
 document.addEventListener('click',function(ev){if(ev.target&&ev.target.closest&&ev.target.closest('.nt37PDItem'))setTimeout(syncToEditor,80)},true);
 var del=q('#nt37PDDelete');function perms(){var s=isSuper();if(del){del.disabled=!s;del.title=s?'':'Solo superadministrador'}tr.disabled=!s;qa('#nt37PDWordBar button,#nt37PDWordBar input,#nt37PDWordBar select').forEach(function(x){x.disabled=!s});ed.contentEditable=s?'true':'false';}
 perms();document.addEventListener('nt37:user-permissions-loaded',perms);setTimeout(syncToEditor,50);
}
new MutationObserver(install).observe(document.body,{childList:true,subtree:true});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
