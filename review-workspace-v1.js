/* Practice workspace: records, reflection and score trends. */
practicePage=function(){
 if(!['stats','writing','speaking'].includes(ptab))ptab='stats';
 return intro('PRACTISE WITH PURPOSE','在这里练习，也在这里复盘。','记录成绩、整理错因，让下一次练习更有方向。')+'<div class="tabs">'+[['stats','训练数据'],['writing','写作模拟'],['speaking','口语模拟']].map(([k,v])=>'<button class="'+(ptab===k?'active':'')+'" onclick="stopTimers();ptab=\''+k+'\';render()">'+v+'</button>').join('')+'</div>'+(ptab==='stats'?statsPage():ptab==='writing'?writingPage():speakingPage());
};
function scoreTrendData(skill){return recordsForSkill(skill).map((r,i)=>({r,i,band:practiceBand(r)})).filter(x=>x.band!==null).sort((a,b)=>a.r.date.localeCompare(b.r.date)||a.i-b.i)}
function scoreTrendPanel(skill){
 const data=scoreTrendData(skill),count=data.length;
 let graphic='<p class="empty">录入一套完整40题成绩后，这里会显示分数趋势。</p>';
 if(count){
  const x=i=>count===1?350:52+i*598/(count-1),y=score=>220-score/9*190;
  let svg='<svg viewBox="0 0 700 280" role="img" aria-label="'+skill+'历次雅思分数折线图" style="width:100%;height:auto;display:block"><title>'+skill+'分数趋势（完整40题试卷，按日期排列）</title>';
  for(const band of [0,3,5,6,7,8,9])svg+='<path d="M52 '+y(band)+'H650" stroke="#e5ebe1"/><text x="36" y="'+(y(band)+4)+'" text-anchor="end" font-size="12" fill="#7c8776">'+band+'</text>';
  if(count>1)svg+='<polyline fill="none" stroke="#4e866d" stroke-width="2.5" points="'+data.map((d,i)=>x(i)+','+y(d.band)).join(' ')+'"/>';
  data.forEach((d,i)=>{svg+='<circle tabindex="0" cx="'+x(i)+'" cy="'+y(d.band)+'" r="5" fill="#4e866d" stroke="white" stroke-width="2" aria-label="'+esc(d.r.date+' '+d.r.book+' '+d.band+'分')+'"><title>'+esc(d.r.date+' · '+d.r.book+' · '+d.band.toFixed(1)+'分 ('+d.r.correct+'/40)')+'</title></circle>';if(i===0||i===count-1||i===Math.floor((count-1)/2))svg+='<text x="'+x(i)+'" y="246" text-anchor="middle" font-size="11" fill="#7c8776">'+d.r.date+'</text>'});
  svg+='</svg>';
  graphic=svg+'<div class="row between fine"><span>最近：'+data.at(-1).band.toFixed(1)+'分</span><span>最高：'+Math.max(...data.map(d=>d.band)).toFixed(1)+'分</span><span>'+count+'套完整试卷</span></div>';
 }
 return '<section class="card" style="margin:20px 0"><h2>'+skill+'分数趋势</h2><p class="fine">按你提供的分数表换算；仅统计完整40题成绩，短练习不推算Band。点或悬停数据点可查看详情。</p>'+graphic+'</section>';
}
function reviewAction(type,reading){
 if(/同义|替换/.test(type))return '摘录题干与原文 / 录音中的对应表达，写出替换关系；隔天遮住答案重新匹配。';
 if(/定位/.test(type))return reading?'先标人名、数字与专有名词，记录实际定位句；复做时检验定位词是否有效。':'回听答案前后句，标出题目顺序、转折与答案落点，再跟随音频定位。';
 if(/长难句|理解|题目读/.test(type))return '拆出主谓宾，圈出从句、否定和限定词；用自己的话复述句意后再核对答案。';
 if(/Heading|段落匹配/.test(type))return '每段写一句主旨摘要，对比标题的范围；记录误选项为何只对应细节而非整段。';
 if(/常识|主观/.test(type))return '每题写出原文证据句；区分“原文支持、原文反驳、未提供信息”，避免凭常识补全。';
 if(/多选|干扰|转折|否定/.test(type))return '给每个选项找支持或排除依据，圈出转折、否定和改口信号，检查需要选择的数量。';
 if(/生词|发音|连读|弱读|英音|澳音|语速/.test(type))return '截取听不出的短句：盲听 → 对照文本查原因 → 跟读 → 脱稿再听，区分不认识与认识但听不出。';
 if(/时间|多任务/.test(type))return reading?'记录每篇的定位、作答和检查用时；给卡题设停止点，完成其余题后再回看。':'提前读题并预测词性和信息类型；漏掉一题时先跟住下一题，避免连续失分。';
 if(/拼写|形式|格式|词性|大小写|单复数|跳格|跳题/.test(type))return '建立答案检查清单：拼写、词性、单复数、字数限制、数字与题号；整理错例后做一次听写或填空回测。';
 return '在备注中补上具体题号、当时判断和正确证据，并给自己安排一次针对性的回测。';
}
function detailedReviewPanel(skill){
 const rows=recordsForSkill(skill),reading=skill==='阅读',totals={};
 rows.forEach(r=>(r.errors||[]).forEach(e=>totals[e.type]=(totals[e.type]||0)+e.count));
 const top=Object.entries(totals).sort((a,b)=>b[1]-a[1]).slice(0,4);
 let tips=top.map(([type,n])=>'<li><b>'+esc(type)+'（累计'+n+'题）</b><p>'+reviewAction(type,reading)+'</p></li>');
 const parts=Array.from({length:reading?3:4},(_,i)=>{const list=rows.flatMap(r=>practiceSections(r).filter(s=>s.section===i+1&&s.total>0)),t=list.reduce((n,s)=>n+s.total,0),c=list.reduce((n,s)=>n+s.correct,0);return{part:i+1,total:t,rate:t?c/t:null}}).filter(p=>p.total>0).sort((a,b)=>a.rate-b.rate);
 if(parts.length)tips.push('<li><b>优先巩固 '+(reading?'Passage':'Part')+' '+parts[0].part+'</b><p>该部分累计正确率为 '+(parts[0].rate*100).toFixed(1)+'%。先复盘这里的错题，区分能力问题与时间分配问题，再选同类练习验证。</p></li>');
 tips.push('<li><b>复做与证据核对</b><p>先不看答案重新作答，再核对原文或录音。分别标记“仍错”和“能解释正确依据”的题，避免只记住答案。</p></li>');
 tips.push('<li><b>下一次只设一个可验证目标</b><p>'+(reading?'例如：三篇阅读分别记录用时，交卷前检查填空词性与字数。':'例如：检查每个填空的单复数，并在漏题后立即跟住下一题。')+' 下次练完核对是否执行。</p></li>');
 tips.push('<li><b>安排隔日回测</b><p>把易错词、替换表达和题号记录下来，1–2天后脱离答案复做；能解释依据后再减少重复练习。</p></li>');
 return '<section class="card" style="margin:20px 0"><h2>'+skill+' · 复盘建议</h2><p class="fine">'+(rows.length?'结合已录入的错因与分部分表现整理；未归类的错题请先补充错因。':'暂无成绩记录，先按以下步骤建立复盘习惯；录入错因后会增加针对性建议。')+'</p><ol style="padding-left:22px;line-height:1.8">'+tips.join('')+'</ol></section>';
}
let reflectionSelection={};
function reflectionKey(skill){const rows=recordsForSkill(skill);const selected=reflectionSelection[skill];return selected==='overall'?'skill:'+skill:rows.some(r=>r.id===selected)?selected:rows.at(-1)?.id||'skill:'+skill}
function reflectionPanel(skill){
 state.practiceReflections??={};const key=reflectionKey(skill),note=state.practiceReflections[key]||{},rows=recordsForSkill(skill);
 const fields=[['evidence','本次错在哪里？','题号、错误判断、正确证据，以及当时的具体情况'],['cause','主要原因与改进方法','区分知识、理解、定位、审题、时间或书写问题'],['next','下一次练习与回测计划','写一个能核验的目标，以及准备何时回测']];
 return '<section class="card" style="margin:20px 0"><div class="cardhead"><h2>'+skill+' · 自主复盘</h2><span id="reflectionSaved" class="fine">本浏览器保存</span></div><label>复盘对象<select style="width:100%;margin:10px 0" onchange="reflectionSelection[statsSkill]=this.value;render()"><option value="overall" '+(key==='skill:'+skill?'selected':'')+'>整体阶段复盘</option>'+rows.slice().reverse().map(r=>'<option value="'+esc(r.id)+'" '+(key===r.id?'selected':'')+'>'+esc(r.date+' · '+r.book)+'</option>').join('')+'</select></label>'+fields.map(([field,label,placeholder])=>'<div class="field"><label>'+label+'</label><textarea data-reflection-key="'+esc(key)+'" data-reflection-field="'+field+'" maxlength="12000" placeholder="'+placeholder+'" oninput="savePracticeReflection(this)">'+esc(note[field]||'')+'</textarea></div>').join('')+'<p class="fine">输入后自动保存，随“备份学习数据”一起导出；本地与网页版仍分别保存。</p></section>';
}
window.savePracticeReflection=function(input){
 state.practiceReflections??={};const key=input.dataset.reflectionKey,field=input.dataset.reflectionField;
 if(!['evidence','cause','next'].includes(field))return;
 state.practiceReflections[key]??={};state.practiceReflections[key][field]=input.value;state.practiceReflections[key].updated=today();save();
 if($('#reflectionSaved'))$('#reflectionSaved').textContent='已自动保存';
};
const reflectionOldStats=statsPage;
statsPage=function(){
 const holder=document.createElement('div');holder.innerHTML=reflectionOldStats();
 holder.querySelectorAll('h3').forEach(h=>{if(h.textContent.includes('复盘建议'))h.closest('.card')?.remove()});
 return scoreTrendPanel(statsSkill)+holder.innerHTML+detailedReviewPanel(statsSkill)+reflectionPanel(statsSkill);
};
if(ptab==='computer')ptab='stats';
if(typeof examTick!=='undefined'&&examTick)pauseExam(false);
render();


const compactReviewStats=statsPage;
statsPage=function(){
 const holder=document.createElement('div');holder.innerHTML=compactReviewStats();
 const findCard=label=>Array.from(holder.querySelectorAll('.card')).find(card=>Array.from(card.querySelectorAll('h2,h3')).some(h=>h.textContent.trim()===label||h.textContent.trim().endsWith(label)));
 const chart=findCard('分数趋势');
 const panels=['错误类型分布','练习记录','分部分统计'].map(findCard).filter(Boolean);
 const metrics=Array.from(holder.querySelectorAll('.stats')).find(grid=>Array.from(grid.children).filter(el=>el.classList.contains('stat')).length===3);
 if(metrics&&chart){
  const grid=document.createElement('div');grid.className='review-equal-panels';
  panels.forEach(card=>{card.style.margin='0';card.classList.add('review-equal-card');grid.appendChild(card)});
  const counts=Array.from(metrics.children).filter(el=>el.classList.contains('stat'));
  metrics.replaceChildren(...counts);metrics.style.gridTemplateColumns='repeat(3,minmax(0,1fr))';
  metrics.after(chart);chart.after(grid);
  chart.classList.add('review-compact-chart');chart.style.margin='0 0 18px';
 }
 const style=document.createElement('style');
 style.textContent='.review-compact-chart{padding:18px 22px}.review-compact-chart h2{font-size:17px;margin:0 0 8px}.review-compact-chart svg{height:180px!important;max-width:740px;margin:0 auto}.review-compact-chart>p{font-size:11px;margin:6px 0}.review-equal-panels{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;align-items:stretch;margin-bottom:20px}.review-equal-panels>.review-equal-card{height:440px;min-width:0;overflow:auto;padding:22px}.review-equal-card h2,.review-equal-card h3{font-size:17px;line-height:1.5;margin:0 0 18px}.review-equal-card .cardhead{min-height:40px;align-items:flex-start}.review-equal-card .notice{font-size:11px;padding:10px;line-height:1.7}@media(max-width:1100px){.review-equal-panels{grid-template-columns:1fr}.review-equal-panels>.review-equal-card{height:400px}.review-compact-chart svg{height:160px!important}}';
 holder.prepend(style);
 return holder.innerHTML;
};
render();

