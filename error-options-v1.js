/* Error categories transcribed from the user's three reference images. */
const ERROR_OPTIONS={
 '阅读':[
 ['定位与理解',['定位困难（找不到答案出处）','同义替换反应慢','长难句理解障碍']],
 ['答题与策略',['段落匹配 / Heading题耗时久','过度依赖常识或主观臆断','填空题词性 / 形式错误','多选题漏选或错选']]
 ],
 '听力':[
 ['听力理解（输入障碍）',['生词 / 不认识的词','发音认知错误','连读 / 弱读干扰','英音 / 澳音听不习惯']],
 ['审题预测（准备不足）',['题目读不懂','关键词没预测到','看题时间管理差']],
 ['信息定位与判断',['同义替换反应慢','干扰信息太多（转折 / 否定）','多任务处理崩溃','跟不上语速']],
 ['答案书写（输出失误）',['拼写错误','格式错误（字数 / 数字）','大小写 / 单复数错误','听写时跳格 / 跳题']]
 ]
};
let errorFormSkill='阅读',errorFormDrafts={};
function readErrorOptionRows(){
 return Array.from(document.querySelectorAll('#errorOptions .error-option')).filter(row=>row.querySelector('.error-check').checked).map(row=>{
  const type=row.dataset.type;
  return {type,count:Number(row.querySelector('.error-count').value),note:row.querySelector('.error-note').value.trim(),...(type==='其他'?{customReason:row.querySelector('.error-other').value.trim()}:{})};
 });
}
function collectErrorOptions(){
 const rows=readErrorOptionRows();
 if(rows.some(r=>!Number.isInteger(r.count)||r.count<1||r.count>100))throw Error('已勾选错因的题数须为1–100');
 if(rows.some(r=>r.type==='其他'&&!r.customReason))throw Error('请填写“其他”的具体原因，或取消勾选该项');
 return rows;
}
function renderErrorOptions(){
 const draft=errorFormDrafts[errorFormSkill]||[],known=new Set(ERROR_OPTIONS[errorFormSkill].flatMap(g=>g[1]));
 function row(type){
  const old=draft.find(e=>e.type===type),selected=!!old;
  return '<div class="error-option" data-type="'+esc(type)+'" style="padding:12px 0;border-bottom:1px solid #e8ebe3"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><label style="display:flex;align-items:center;gap:8px;flex:1;min-width:180px"><input class="error-check" type="checkbox" '+(selected?'checked':'')+' onchange="this.closest(\'.error-option\').querySelector(\'.error-count\').disabled=!this.checked"> '+esc(type)+'</label><label style="display:flex;align-items:center;gap:6px">题数 <select class="error-count" aria-label="'+esc(type)+'题数" '+(selected?'':'disabled')+'>'+Array.from({length:100},(_,i)=>'<option value="'+(i+1)+'" '+(i+1===(old?.count||1)?'selected':'')+'>'+(i+1)+'</option>').join('')+'</select></label></div>'+(type==='其他'?'<input class="error-other" aria-label="其他原因" placeholder="输入其他原因" value="'+esc(old?.customReason||'')+'" style="width:100%;margin-top:8px">':'')+'<input class="error-note" aria-label="'+esc(type)+'备注" placeholder="备注：具体题号、表现或需要注意的情况（选填）" value="'+esc(old?.note||'')+'" style="width:100%;margin-top:8px"></div>';
 }
 const extra=draft.filter(e=>e.type!=='其他'&&!known.has(e.type));
 $('#errorOptions').innerHTML='<h3>错误类型与题数</h3><p class="fine">勾选每题的主要错因，并选择题数；合计不能超过整场错题数。备注可填写题号或具体情况。</p>'+ERROR_OPTIONS[errorFormSkill].map(([group,options])=>'<details open><summary style="cursor:pointer;font-weight:600;padding:10px 0">'+esc(group)+'</summary>'+options.map(row).join('')+'</details>').join('')+(extra.length?'<details open><summary>已有自定义错因</summary>'+extra.map(e=>row(e.type)).join('')+'</details>':'')+row('其他');
}
const errorOptionsPreviousForm=recordForm;
recordForm=function(id){
 errorOptionsPreviousForm(id);
 const r=state.records.find(r=>r.id===id);errorFormSkill=$('#rs').value;errorFormDrafts={};
 errorFormDrafts[errorFormSkill]=(r?.errors||[]).map(e=>({...e}));
 const field=$('#re').closest('.field');field.hidden=true;field.style.display='none';
 field.insertAdjacentHTML('beforebegin','<section id="errorOptions"></section>');
 $('#modalTitle').textContent='记录真实练习表现 · 错因选项版';
 $('#rs').addEventListener('change',()=>{
  errorFormDrafts[errorFormSkill]=readErrorOptionRows();
  errorFormSkill=$('#rs').value;renderErrorOptions();
 });
 renderErrorOptions();
};
render();
