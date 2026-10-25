/* Check-in is allowed only on the current Shanghai calendar date. */
const dayLockToggle=toggleTask,dayLockEdit=editTask,dayLockSave=saveTask,dayLockDelete=deleteTask;
let taskEditorDate=null;
function taskDayIsLocked(){return activeDate<today()}
toggleTask=function(i,checked){
 if(activeDate!==today()){toast(activeDate<today()?'历史任务已锁定，不支持补打卡或取消打卡':'未来任务到当天再打卡');render();return}
 return dayLockToggle(i,checked);
};
editTask=function(i){
 if(taskDayIsLocked()){toast('历史任务已锁定，仅供查看');return}
 taskEditorDate=activeDate;return dayLockEdit(i);
};
function taskEditCanSave(){
 if(taskDayIsLocked()||taskEditorDate!==null&&taskEditorDate!==activeDate){
  toast('该日期的任务已锁定，请回到当天操作');closeModal();taskEditorDate=null;render();return false;
 }
 return true;
}
saveTask=function(i){if(taskEditCanSave())return dayLockSave(i)};
deleteTask=function(i){if(taskEditCanSave())return dayLockDelete(i)};
const dayLockPage=planPage;
planPage=function(){
 const html=dayLockPage();if(activeDate===today())return html;
 const holder=document.createElement('div');holder.innerHTML=html;
 holder.querySelectorAll('.tasks input[type="checkbox"]').forEach(input=>{input.disabled=true;input.title=activeDate<today()?'历史打卡已锁定':'到当天才可打卡'});
 if(activeDate<today()){
  holder.querySelectorAll('button').forEach(button=>{if(/(?:editTask|saveTask|deleteTask)\(/.test(button.getAttribute('onclick')||'')){button.disabled=true;button.title='历史任务仅供查看'}});
  holder.querySelector('.tasks')?.insertAdjacentHTML('beforebegin','<p class="notice" role="status">历史任务已锁定：不支持补打卡、取消打卡或修改任务。</p>');
 }
 return holder.innerHTML;
};
let dayLockLastDate=today();
function checkDayRollover(){
 const date=today();if(date===dayLockLastDate)return;
 dayLockLastDate=date;
 if(taskEditorDate&&taskEditorDate<date){closeModal();taskEditorDate=null}
 render();
}
window.addEventListener('focus',checkDayRollover);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkDayRollover()});
setInterval(checkDayRollover,30000);
render();
