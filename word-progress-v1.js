/* Daily vocabulary history and plan completion. Uses the existing local backup. */
(() => {
  let historyDate = today();
  function entries(date) {
    state.wordStudyDays ??= {};
    if (!state.wordStudyDays[date]) {
      state.wordStudyDays[date] = state.words.filter(w => w.last === date || w.learned === date).map(w => ({
        id: w.id, word: w.word, meaning: w.meaning,
        type: w.learned === date ? 'new' : 'review', result: 'recorded'
      }));
    }
    return state.wordStudyDays[date];
  }
  function progress() {
    const log = entries(today());
    const fresh = log.filter(w => w.type === 'new').length;
    const remainingNew = state.words.filter(w => w.stage < 0).length;
    const goal = Math.min(Number(state.quota) || 30, fresh + remainingNew);
    const due = state.words.filter(w => w.stage >= 0 && w.due && w.due <= today() && w.last !== today()).length;
    return { log, fresh, goal, due, complete: log.length > 0 && fresh >= goal && due === 0 };
  }
  function syncPlan() {
    const p = progress();
    const task = (state.plans[today()] || []).find(t => t.id === 'vocab');
    if (!p.complete || !task || task.wordAutoDate === today()) return;
    task.wordAutoDate = today();
    if (!task.done) { task.done = true; save(); toast('今日单词任务完成，学习计划已自动打卡 · +1 成长积分'); }
    else save();
  }
  const originalLearn = learnWord;
  learnWord = function(id, ok) {
    const w = state.words.find(item => item.id === id);
    if (!w || w.last === today()) return;
    const log = entries(today());
    if (!log.some(item => item.id === id)) log.push({ id, word: w.word, meaning: w.meaning,
      type: w.stage < 0 ? 'new' : 'review', result: ok ? 'remembered' : 'again' });
    originalLearn(id, ok);
  };
  const originalRender = render;
  render = function() { ensurePlans(); syncPlan(); return originalRender(); };
  window.showWordStudyDate = function(value) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) historyDate = value;
    render();
  };
  const originalWordsPage = wordsPage;
  wordsPage = function() {
    const p = progress(), log = entries(historyDate);
    const fresh = log.filter(w => w.type === 'new'), review = log.filter(w => w.type === 'review');
    const task = (state.plans[today()] || []).find(t => t.id === 'vocab');
    const status = task?.done ? '今日计划中的单词项已打卡' : p.complete ? '今日词汇已完成；设置考试日期生成计划后会自动打卡' : '完成每日新词目标及全部到期复习后，自动打卡今日单词任务';
    const section = (title, list) => `<details style="margin-top:16px"><summary style="cursor:pointer;font-weight:600;padding:10px 0">${title} · ${list.length} 词（点击展开 / 收起）</summary>${list.length ? `<div class="tablewrap"><table class="records"><thead><tr><th>词汇</th><th>释义</th><th>自评</th></tr></thead><tbody>${list.map(w => `<tr><td><strong>${esc(w.word)}</strong></td><td>${esc(w.meaning)}</td><td>${w.result === 'remembered' ? '记住了 ✓' : w.result === 'again' ? '待巩固 · 次日复习' : '已学习'}</td></tr>`).join('')}</tbody></table></div>` : '<p class="fine">暂无记录</p>'}</details>`;
    return `<div class="card" style="margin-bottom:20px"><div class="cardhead"><h2>每天都留下词汇足迹</h2><span class="pill">今日新学 ${p.fresh} / ${p.goal} · 待复习 ${p.due}</span></div><p class="notice" role="status">${status}</p><div class="row between"><label>查看学习日期 <input type="date" max="${today()}" value="${historyDate}" onchange="showWordStudyDate(this.value)"></label><span class="fine">${historyDate} 共学习 ${log.length} 个不同词汇</span></div>${section('新学词汇', fresh)}${section('复习词汇', review)}<p class="fine">点击词卡的自评按钮即记录一次学习；“没记住”的词也会列出，并安排次日复习。每个词每天只计一次。历史记录随学习数据一起备份；更新前仅能恢复词库仍保留日期的记录。</p></div>` + originalWordsPage();
  };
  render();
})();
