/* IELTS score and section statistics */
function practiceBand(r){if(r.total!==40||!Number.isInteger(r.correct)||r.correct<0||r.correct>40)return null;return [[39,9],[37,8.5],[35,8],[33,7.5],[30,7],[27,6.5],[23,6],[20,5.5],[16,5],[13,4.5],[10,4],[6,3.5],[4,3],[3,2.5],[2,2],[1,1],[0,0]].find(([n])=>r.correct>=n)[1]}
function practiceSections(r){const result=(state.examResults||[]).find(x=>x.id===r.id);return Array.from({length:['阅读','reading'].includes(r.skill)?3:4},(_,i)=>{const saved=(r.sections||result?.sections||[]).find(x=>x.section===i+1);if(saved)return saved;const items=(r.items||result?.items||[]).filter(x=>x.section===i+1);return{section:i+1,total:items.length||null,correct:items.length?items.filter(x=>x.correct).length:null,minutes:null}})}
function scoreAverage(rows){const a=rows.map(practiceBand).filter(x=>x!==null);return a.length?(a.reduce((x,y)=>x+y,0)/a.length).toFixed(2):'—'}
function sectionTable(rows,skill,summary){const reading=['阅读','reading'].includes(skill);let out='<div class="tablewrap"><table class="records"><thead><tr><th>部分</th><th>答对 / 题量</th><th>正确率</th>'+(reading?'<th>'+(summary?'平均':'')+'用时（分钟）</th>':'')+'</tr></thead><tbody>';for(let i=1;i<=(reading?3:4);i++){const parts=rows.flatMap(r=>practiceSections(r).filter(s=>s.section===i&&s.total>0)),t=parts.reduce((n,s)=>n+s.total,0),c=parts.reduce((n,s)=>n+s.correct,0),times=parts.filter(s=>Number.isFinite(s.minutes));out+='<tr><td>'+(reading?'Passage':'Part')+' '+i+'</td><td>'+(t?c+' / '+t:'未记录')+'</td><td>'+(t?(c/t*100).toFixed(1)+'%':'—')+'</td>'+(reading?'<td>'+(times.length?(times.reduce((n,s)=>n+s.minutes,0)/times.length).toFixed(1):'未记录')+'</td>':'')+'</tr>'}return out+'</tbody></table></div>'}
const scoreOldStats=statsPage;
statsPage=function(){const rows=recordsForSkill(statsSkill);let html=scoreOldStats();html=html.replace(/<strong>[^<]+<small>%<\/small><\/strong><label>平均正确率（各次等权）<\/label>/,'<strong>'+scoreAverage(rows)+'</strong><label>平均分数（完整40题试卷）</label>');let index=0;html=html.replace(/<strong style="font-size:25px">[^<]+<\/strong><p class="fine">整体正确率（按题数）<\/p>/g,()=>'<strong style="font-size:25px">'+scoreAverage(recordsForSkill(['阅读','听力'][index++]))+'</strong><p class="fine">平均分数</p>');for(const r of rows)html=html.replace('<td>'+r.correct+' / '+r.total+'</td>','<td>'+r.correct+' / '+r.total+'<br>Band '+(practiceBand(r)===null?'—（非40题）':practiceBand(r).toFixed(1))+'</td>');return html+'<div class="card" style="margin-top:20px"><h2>'+statsSkill+' · 分部分统计</h2><p class="notice">按提供的听力 / A类阅读对照表换算整套40题分数。短练习不按比例推算，不计入平均分；0题正确记0分。分部分正确率按题数汇总；历史未记录用时不推测。</p>'+sectionTable(rows,statsSkill,true)+rows.slice().reverse().map(r=>'<details style="margin-top:16px"><summary style="cursor:pointer">'+esc(r.date)+' · '+esc(r.book)+' · Band '+(practiceBand(r)===null?'—':practiceBand(r).toFixed(1))+'</summary>'+sectionTable([r],r.skill,false)+'</details>').join('')+'</div>'};
const scoreOldForm=recordForm;
recordForm=function(id){scoreOldForm(id);const r=state.records.find(r=>r.id===id);window.scoreFormSections=r?practiceSections(r):[];$('#modalBody').insertAdjacentHTML('beforeend','<div id="scoreSectionInputs"></div>');$('#rs').addEventListener('change',()=>{window.scoreFormSections=[];drawScoreInputs()});drawScoreInputs()};
function drawScoreInputs(){const reading=$('#rs').value==='阅读';let html='<h3>'+(reading?'阅读三篇':'听力四部分')+'记录</h3><p class="fine">可全部留空；填写时各部分题量与答对数合计须等于整套数据。阅读用时可留空。</p>';for(let i=0;i<(reading?3:4);i++){const s=(window.scoreFormSections||[]).find(s=>s.section===i+1)||{};html+='<div class="reportgrid"><b>'+(reading?'Passage':'Part')+' '+(i+1)+'</b><label>题量<input id="st-'+i+'" type="number" min="1" max="40" value="'+(s.total??'')+'"></label><label>答对<input id="sc-'+i+'" type="number" min="0" max="40" value="'+(s.correct??'')+'"></label>'+(reading?'<label>用时（分钟）<input id="sm-'+i+'" type="number" min="0" step="0.1" value="'+(s.minutes??'')+'"></label>':'')+'</div>'}$('#scoreSectionInputs').innerHTML=html}
const scoreOldSave=saveRecord;
saveRecord=function(id){const reading=$('#rs').value==='阅读',sections=[];let any=false;for(let i=0;i<(reading?3:4);i++){const t=$('#st-'+i).value,c=$('#sc-'+i).value,m=reading?$('#sm-'+i).value:'';if(t!==''||c!==''||m!=='')any=true;sections.push({section:i+1,total:t===''?null:+t,correct:c===''?null:+c,...(reading?{minutes:m===''?null:+m}:{})})}if(any){if(sections.some(s=>!Number.isInteger(s.total)||s.total<1||s.total>40||!Number.isInteger(s.correct)||s.correct<0||s.correct>s.total||s.minutes!=null&&(!Number.isFinite(s.minutes)||s.minutes<0)))return toast('请完整填写各部分题量、答对数和有效用时');if(sections.reduce((n,s)=>n+s.total,0)!==+$('#rt').value||sections.reduce((n,s)=>n+s.correct,0)!==+$('#rc').value)return toast('各部分题量与答对数须与整套合计一致');if(reading&&sections.reduce((n,s)=>n+(s.minutes||0),0)>+$('#rm').value+.15)return toast('各篇用时合计不能超过整场用时')}const ids=new Set(state.records.map(r=>r.id));scoreOldSave(id);if($('#modal').open)return;const r=id?state.records.find(r=>r.id===id):state.records.find(r=>!ids.has(r.id));if(r){r.sections=any?sections:[];save();render()}};
const scoreOldValid=validRecord;
validRecord=function(r){if(!scoreOldValid(r))return false;if(r.sections===undefined||Array.isArray(r.sections)&&!r.sections.length)return true;return Array.isArray(r.sections)&&r.sections.length===(r.skill==='阅读'?3:4)&&r.sections.every((s,i)=>s.section===i+1&&((s.total==null&&s.correct==null)||(Number.isInteger(s.total)&&s.total>0&&Number.isInteger(s.correct)&&s.correct>=0&&s.correct<=s.total))&&(s.minutes==null||Number.isFinite(s.minutes)&&s.minutes>=0))&&r.sections.reduce((n,s)=>n+(s.total||0),0)===r.total&&r.sections.reduce((n,s)=>n+(s.correct||0),0)===r.correct&&r.sections.reduce((n,s)=>n+(s.minutes||0),0)<=r.minutes+.15};
const scoreOldAccount=accountExamTime;
accountExamTime=function(){const s=state.examSession,before=s?.elapsed||0;scoreOldAccount();if(s&&currentPaper()?.skill==='reading'&&s.sectionTimingVersion===1){s.sectionTimes??={};s.sectionTimes[activeExamSection]=(s.sectionTimes[activeExamSection]||0)+Math.max(0,s.elapsed-before)}};
const scoreOldStart=startExam;
startExam=async function(id){await scoreOldStart(id);if(state.examSession){state.examSession.sectionTimingVersion=1;state.examSession.sectionTimes={};save()}};
const scoreOldGo=goQuestion;
goQuestion=function(n){accountExamTime();return scoreOldGo(n)};
const scoreOldSubmit=submitExam;
submitExam=function(timedOut){pauseExam(false);const s=state.examSession,p=currentPaper();if(!s||!p)return;const sections=Array.from({length:p.skill==='reading'?3:4},(_,i)=>{const qs=p.questions.filter(q=>q.section===i+1);return{section:i+1,total:qs.length||null,correct:qs.length?qs.filter(q=>correctAnswer(q,s.answers[q.number])).length:null,...(p.skill==='reading'?{minutes:s.sectionTimingVersion===1?Math.round((s.sectionTimes?.[i+1]||0)/6)/10:null}:{})}});scoreOldSubmit(timedOut);const r=state.examResults.at(-1),record=state.records.find(x=>x.id===r?.id);if(r){r.sections=sections;if(record)record.sections=sections;save();render();viewExamResult(r.id)}};
const scoreOldView=viewExamResult;
viewExamResult=function(id){scoreOldView(id);const r=state.examResults.find(r=>r.id===id);if(!r)return;const p=$('#modalBody > p.fine');if(p)p.textContent=r.date+' · 实际用时 '+fmt(r.seconds)+' · Band '+(practiceBand(r)===null?'—（非40题）':practiceBand(r).toFixed(1))+'（按提供的听力 / A类阅读表）';$('#modalBody').insertAdjacentHTML('afterbegin',sectionTable([r],r.skill,false))};
resultCSV=function(results){
 const rows=[['日期','试卷','科目','题号','部分','题型','作答','参考答案','正确','焦点时长秒','错因','解析','整场用时秒','笔记','整套Band','部分正确题数','部分题量','部分正确率','阅读部分用时分钟']];
 for(const r of results)for(const i of r.items){const s=practiceSections(r).find(s=>s.section===i.section);rows.push([r.date,r.title,r.skill,i.number,i.section,i.type,Array.isArray(i.actual)?i.actual.join(' + '):i.actual,i.expected.join(i.type==='multiple'?' + ':' / '),i.correct?'1':'0',i.seconds,i.errorType||'',i.explanation,r.seconds,r.notes,practiceBand(r)??'',s?.correct??'',s?.total??'',s?.total?(s.correct/s.total*100).toFixed(1)+'%':'',r.skill==='reading'?s?.minutes??'':''])}
 return '\ufeff'+rows.map(row=>row.map(v=>{let t=String(v??'');if(/^[=+\-@\t\r]/.test(t))t="'"+t;return '"'+t.replaceAll('"','""')+'"'}).join(',')).join('\r\n')
};
render();


/* Keep section inputs before the save button and show validation inside the dialog. */
recordForm=function(id){
 scoreOldForm(id);
 const r=state.records.find(r=>r.id===id);
 window.scoreFormSections=r?practiceSections(r):[];
 $('#modalBody .modalactions').insertAdjacentHTML('beforebegin','<div id="scoreSectionInputs"></div><p id="scoreFormError" role="alert" style="color:#a13d35" hidden></p>');
 $('#rs').addEventListener('change',()=>{window.scoreFormSections=[];drawScoreInputs()});
 drawScoreInputs();
};
function scoreFormError(message){
 const el=$('#scoreFormError');el.hidden=false;el.textContent=message;el.scrollIntoView({block:'nearest'});
}
saveRecord=function(id){
 try{
  const reading=$('#rs').value==='阅读',sections=[];
  let any=false;
  for(let i=0;i<(reading?3:4);i++){
   const t=$('#st-'+i).value.trim(),c=$('#sc-'+i).value.trim(),m=reading?$('#sm-'+i).value.trim():'';
   if(t!==''||c!==''||m!=='')any=true;
   sections.push({section:i+1,total:t===''?null:Number(t),correct:c===''?null:Number(c),...(reading?{minutes:m===''?null:Number(m)}:{})});
  }
  if(any){
   if(sections.some(s=>!Number.isInteger(s.total)||s.total<1||s.total>40||!Number.isInteger(s.correct)||s.correct<0||s.correct>s.total||s.minutes!=null&&(!Number.isFinite(s.minutes)||s.minutes<0)))
    return scoreFormError('请填写每部分的题量和答对数（答对0题请填0）；阅读用时可留空。答对数不能超过题量。');
   $('#rt').value=sections.reduce((n,s)=>n+s.total,0);
   $('#rc').value=sections.reduce((n,s)=>n+s.correct,0);
   if(reading&&sections.every(s=>s.minutes!==null))$('#rm').value=Math.round(sections.reduce((n,s)=>n+s.minutes,0)*100)/100;
   if(reading&&sections.reduce((n,s)=>n+(s.minutes||0),0)>Number($('#rm').value)+.15)
    return scoreFormError('各篇已填写用时之和超过整场用时，请补充整场用时，或填全三篇用时自动合计。');
  }
  const errors=$('#re').value.trim()?$('#re').value.split(/\r?\n/).filter(l=>l.trim()).map(l=>{const[type,count]=l.split('|');return{type:type?.trim(),count:Number(count)}}):[];
  const r={id:id||uid(),date:$('#rd').value,book:$('#rb').value.trim(),skill:$('#rs').value,minutes:Number($('#rm').value),correct:Number($('#rc').value),total:Number($('#rt').value),errors,positions:$('#rp').value,sections:any?sections:[]};
  if(!validRecord(r))return scoreFormError('请检查日期（不能晚于今天）、真题编号、总题数（1–100）及整场用时（大于0）。错因题数合计不能超过错题数。');
  const i=state.records.findIndex(x=>x.id===id);
  if(i<0)state.records.push(r);else state.records[i]=r;
  save();closeModal();render();toast('练习已保存，分部分统计已更新');
 }catch(error){scoreFormError('保存未完成：'+error.message)}
};
const scoreDrawInputs=drawScoreInputs;
drawScoreInputs=function(){
 scoreDrawInputs();
 const area=$('#scoreSectionInputs');
 area.querySelector('p').textContent='填写各部分后，自动合计整套题量和答对数；三篇阅读用时全部填好后，也会自动合计总用时。分部分信息也可全部留空。';
 area.querySelectorAll('label').forEach(label=>{label.style.display='flex';label.style.flexDirection='column';label.style.gap='6px';label.style.minWidth='0'});
 area.querySelectorAll('input').forEach(input=>{input.style.width='100%';input.style.minWidth='0';input.style.pointerEvents='auto'});
};
render();


/* Visible form revision and dialog-local notifications. */
const scoreFormV2=recordForm;
recordForm=function(id){
 scoreFormV2(id);
 $('#modalTitle').textContent='记录真实练习表现 · 表单 v3';
 const actions=$('#modalBody .modalactions');
 $('#modalBody').appendChild(actions);
 const button=actions.querySelector('button.primary');
 button.onclick=()=>saveRecord(id||'');
 const error=$('#scoreFormError');
 error.style.position='sticky';error.style.bottom='0';error.style.background='#fff3ef';error.style.padding='12px';error.style.borderRadius='8px';
};
const scoreToastBefore=toast;
toast=function(message){
 scoreToastBefore(message);
 if(!$('#modal')?.open)return;
 let notice=$('#dialogNotification');
 if(!notice){notice=document.createElement('p');notice.id='dialogNotification';notice.setAttribute('role','alert');notice.style.cssText='position:sticky;bottom:0;background:#fff3ef;color:#9c3b30;padding:12px;border-radius:8px;z-index:2';$('#modalBody').appendChild(notice)}
 notice.textContent=message;notice.scrollIntoView({block:'nearest'});
};


const statsWithoutPositionColumn=statsPage;
statsPage=function(){
 const holder=document.createElement('div');holder.innerHTML=statsWithoutPositionColumn();
 holder.querySelectorAll('table.records').forEach(table=>{
  const headers=Array.from(table.querySelectorAll('thead th'));
  const index=headers.findIndex(th=>/错题位置\s*\/\s*原因/.test(th.textContent));
  if(index<0)return;
  table.querySelectorAll('tr').forEach(row=>{
   const cells=Array.from(row.children);
   if(cells.length===headers.length)cells[index].remove();
   else cells.forEach(cell=>{if(cell.colSpan>1)cell.colSpan=Math.max(1,cell.colSpan-1)});
  });
 });
 holder.querySelectorAll('h2').forEach(h=>{h.textContent=h.textContent.replace('练习记录与错题位置','练习记录')});
 return holder.innerHTML;
};
render();


const statsReadableLayout=statsPage;
statsPage=function(){
 const holder=document.createElement('div');holder.innerHTML=statsReadableLayout();
 holder.querySelectorAll('h2,h3').forEach(h=>{h.textContent=h.textContent.replace(/^(?:阅读|听力)\s*[·•]\s*/,'')});
 holder.querySelectorAll('.twocol').forEach(row=>{
  row.style.gridTemplateColumns='repeat(auto-fit,minmax(min(100%,280px),1fr))';
 });
 holder.querySelectorAll('.card').forEach(card=>{card.style.minWidth='0'});
 holder.querySelectorAll('.card p,.card .fine,.card .caption').forEach(p=>{
  p.style.textAlign='justify';
  p.style.textJustify='inter-ideograph';
  p.style.wordBreak='normal';
  p.style.overflowWrap='break-word';
  p.style.textWrap='pretty';
 });
 return holder.innerHTML;
};
render();


const statsCompactRecords=statsPage;
statsPage=function(){
 const holder=document.createElement('div');holder.innerHTML=statsCompactRecords();
 holder.querySelectorAll('table.records').forEach(table=>{
  const headers=Array.from(table.querySelectorAll('thead th'));
  if(!headers.some(th=>th.textContent.includes('日期')))return;
  table.style.minWidth='560px';table.style.tableLayout='auto';table.style.width='100%';
  if(table.parentElement)table.parentElement.style.overflowX='auto';
  headers.forEach(th=>{th.style.whiteSpace='nowrap'});
  table.querySelectorAll('tbody tr').forEach(row=>{
   Array.from(row.children).forEach(cell=>{cell.style.whiteSpace='nowrap';cell.style.verticalAlign='middle';cell.style.lineHeight='1.8'});
   const buttons=row.querySelectorAll('button');
   if(buttons.length>1){
    const cell=buttons[0].parentElement;
    const wrap=document.createElement('div');wrap.style.cssText='display:flex;flex-direction:column;align-items:flex-start;gap:12px;padding:4px 0';
    buttons.forEach(button=>wrap.appendChild(button));
    cell.replaceChildren(wrap);
   }
  });
 });
 return holder.innerHTML;
};
render();

