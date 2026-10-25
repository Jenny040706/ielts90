/* Easy words: one delayed check after ten days, then retirement if confirmed. */
wordQueue=function(){
 const list=activeWords().filter(w=>w.easyStatus!=='retired');
 const due=list.filter(w=>w.stage>=0&&w.due&&w.due<=today()&&w.last!==today());
 const learned=state.words.filter(w=>w.learned===today()).length;
 return [...due,...list.filter(w=>w.stage<0).slice(0,Math.max(0,state.quota-learned))];
};
function markEasyWord(id){
 const w=state.words.find(w=>w.id===id);
 if(!w||w.last===today()||w.easyStatus==='retired')return;
 const confirm=w.easyStatus==='pending'&&w.due&&w.due<=today();
 if(w.easyStatus==='pending'&&!confirm)return;
 const first=w.stage<0;
 state.wordStudyDays??={};
 state.wordStudyDays[today()]??=state.words.filter(x=>x.last===today()||x.learned===today()).map(x=>({id:x.id,word:x.word,meaning:x.meaning,type:x.learned===today()?'new':'review',result:'recorded'}));
 const log=state.wordStudyDays[today()];
 if(!log.some(x=>x.id===id))log.push({id,word:w.word,meaning:w.meaning,type:first?'new':'review',result:'remembered',easyDecision:confirm?'retired':'pending'});
 w.learned??=today();w.stage=Math.max(0,w.stage);w.last=today();
 w.easyStatus=confirm?'retired':'pending';w.easyMarkedDate=today();w.due=confirm?null:plus(today(),10);
 reveal=false;cardIndex=0;save();render();
 toast(confirm?'已确认简单：此词不再自动复习':'已标记简单词：10天后再复核');
}
const easyOriginalLearn=learnWord;
learnWord=function(id,ok){
 const w=state.words.find(w=>w.id===id);
 if(!w||w.last===today()||w.easyStatus==='retired')return;
 if(w.easyStatus==='pending'&&(!w.due||w.due>today()))return;
 delete w.easyStatus;delete w.easyMarkedDate;
 return easyOriginalLearn(id,ok);
};
const easyOriginalPage=wordsPage;
wordsPage=function(){
 const holder=document.createElement('div');holder.innerHTML=easyOriginalPage();
 const queue=wordQueue(),w=queue[cardIndex%Math.max(1,queue.length)];
 const card=holder.querySelector('.wordcard');
 if(card&&w){
  const button=document.createElement('button');button.className='soft';button.style.margin='10px 0 0 10px';button.textContent='简单词';button.disabled=!reveal;
  button.setAttribute('onclick','markEasyWord('+JSON.stringify(w.id)+')');
  button.title=w.easyStatus==='pending'?'再次标记简单后不再自动复习':'跳过常规循环，10天后复核';
  card.appendChild(button);
  if(w.easyStatus==='pending')card.insertAdjacentHTML('beforeend','<p class="fine">简单词 · 10天复核：若仍然简单，点击“简单词”后不再复习；否则选择常规自评，恢复间隔复习。</p>');
 }
 holder.querySelectorAll('.vocabrow').forEach(row=>{
  const name=row.querySelector('td strong')?.textContent;
  const item=state.words.find(x=>x.word===name);
  if(item?.easyStatus){const cells=row.querySelectorAll('td');cells[cells.length-1].textContent=item.easyStatus==='retired'?'简单词 · 不再复习':'简单词 · '+item.due+' 复核'}
 });
 holder.insertAdjacentHTML('beforeend','<p class="fine">“简单词”：首次标记后10天再出现；复核时再次标记则不再自动复习。该次学习仍计入每日词汇记录及打卡进度。</p>');
 return holder.innerHTML;
};
render();
