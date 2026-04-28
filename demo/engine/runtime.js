/* runtime.js —— 游戏流程编排。
   M1 范围：序幕 PROL_C_001 单事件。事件流转 / 多事件队列 / 时刻表 留待 M2。

   职责：
   - boot：检测既有存档；若已有序幕选择痕迹则进入"上次已走完序幕"页，
     否则新建 state 并从头渲染 PROL_C_001。
   - 渲染当前事件的 scene 链 → 选项 → effects 应用 → 自动保存 → 尾声 →
     结束卡（清档重玩）。
   - 调试浮层：按 . 键或点右下角胶囊弹出 state JSON 快照。 */

(function (global) {
  'use strict';

  const { GameState, Storage, Scene, Events } = global.ElDoble;

  /** 标志哪些 flag 视作"序幕已选择"。来自 08_剧情/02_序幕.md 三选一。 */
  const PROLOGUE_CHOICE_FLAGS = [
    'WALKED_IN_DIGNIFIED',
    'MENTIONED_LUCIA_TO_VEGA',
    'NEGOTIATED_EXIT_CLAUSE',
  ];

  let currentState = null;

  // —— DOM 工具 ——

  function $(id) { return document.getElementById(id); }
  function getStage() { return $('stage'); }

  function clearStage() {
    const stage = getStage();
    while (stage.firstChild) stage.removeChild(stage.firstChild);
  }

  function appendToStage(node) {
    getStage().appendChild(node);
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  // —— effect 应用 ——

  /** 把数值 / flag 改动施加到 state。后续模块会扩展更多字段。 */
  function applyEffects(state, effects) {
    if (!effects) return;
    if (typeof effects.replicaSanityDelta   === 'number') state.replica.sanity   += effects.replicaSanityDelta;
    if (typeof effects.replicaDisguiseDelta === 'number') state.replica.disguise += effects.replicaDisguiseDelta;
    if (effects.factionAttitudeDelta) {
      for (const [k, v] of Object.entries(effects.factionAttitudeDelta)) {
        state.factionAttitude[k] = (state.factionAttitude[k] ?? 0) + v;
      }
    }
    if (effects.suspicionDelta) {
      for (const [k, v] of Object.entries(effects.suspicionDelta)) {
        state.replica.suspicion[k] = (state.replica.suspicion[k] ?? 0) + v;
      }
    }
    if (Array.isArray(effects.flagsAdd)) {
      for (const f of effects.flagsAdd) state.addFlag(f);
    }
    if (Array.isArray(effects.flagsRemove)) {
      for (const f of effects.flagsRemove) state.removeFlag(f);
    }
  }

  // —— 渲染辅助 ——

  function renderActMarker(text) {
    return el('div', 'act-marker', text);
  }

  function renderEndCard({ heading, body, restartLabel = '清档重玩' }) {
    const card = el('section', 'ending-card');
    card.appendChild(el('h3', null, heading));
    card.appendChild(el('p', null, body));

    const actions = el('div', 'ending-actions');
    const restart = el('button', null, restartLabel);
    restart.type = 'button';
    restart.addEventListener('click', () => {
      Storage.clear();
      location.reload();
    });
    actions.appendChild(restart);
    card.appendChild(actions);

    return card;
  }

  // —— 事件渲染 ——

  function renderEvent(event) {
    clearStage();

    if (event.actMarker) appendToStage(renderActMarker(event.actMarker));

    for (const scene of event.scenes) {
      appendToStage(Scene.renderScene(scene));
    }

    if (event.choice) {
      appendToStage(Scene.renderChoice(event.choice, (option) => onChoice(event, option)));
    }
  }

  function onChoice(event, option) {
    applyEffects(currentState, option.effects);
    Storage.save(currentState); // 序幕末自动保存

    // 把选项面板原地替换为"已说出口"的引文
    const choiceNode = getStage().querySelector('[data-role="choice"]');
    const chosen = Scene.renderChosenLine(option);
    if (choiceNode) {
      choiceNode.replaceWith(chosen);
    } else {
      appendToStage(chosen);
    }

    if (event.epilogue) {
      const epilogueNode = Scene.renderScene(event.epilogue);
      appendToStage(epilogueNode);
      // 让玩家自然往下读，而不是被一次性整段塞满。
      epilogueNode.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    appendToStage(renderEndCard({
      heading: 'M1 demo · 序幕至此',
      body:
        '序幕在此停笔。下一节《El Expediente Báez》（教程档案）与第一次内阁会议' +
        '会在 M2 接入。当前选择已写入 localStorage；按 . 键随时看 state 快照。',
    }));
  }

  // —— resume 检测 ——

  function safeLoad() {
    try {
      return Storage.load();
    } catch (e) {
      console.warn('既有存档加载失败（可能是 M0 旧 schema）：', e.message);
      Storage.clear();
      return null;
    }
  }

  function hasPrologueChoice(state) {
    return PROLOGUE_CHOICE_FLAGS.some((f) => state.hasFlag(f));
  }

  function renderResumeView() {
    clearStage();
    appendToStage(renderEndCard({
      heading: '上次已走完序幕',
      body:
        'localStorage 里已有序幕的选择痕迹（' +
          PROLOGUE_CHOICE_FLAGS.filter((f) => currentState.hasFlag(f)).join(' / ') +
        '）。按 . 键看完整 state；或清档重玩。',
      restartLabel: '清档重玩',
    }));
  }

  // —— 调试浮层 ——

  function bindDevTools() {
    const btn = $('dev-toggle');
    const modal = $('dev-modal');
    const pre = $('dev-state');
    if (!btn || !modal || !pre) return;

    function open() {
      pre.textContent = currentState ? JSON.stringify(currentState.toJSON(), null, 2) : '（无状态）';
      modal.dataset.open = 'true';
    }
    function close() { modal.dataset.open = 'false'; }

    btn.addEventListener('click', open);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    document.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === '.') { e.preventDefault(); modal.dataset.open === 'true' ? close() : open(); }
      if (e.key === 'Escape') close();
    });
  }

  // —— boot ——

  function boot() {
    bindDevTools();

    const event = (Events && Events.PROL_C_001) || null;
    if (!event) {
      clearStage();
      appendToStage(renderEndCard({
        heading: '事件数据缺失',
        body: '未找到 PROL_C_001。检查 demo/content/events/prologue/PROL_C_001.js 是否被加载。',
      }));
      return;
    }

    const existing = Storage.exists() ? safeLoad() : null;
    if (existing && hasPrologueChoice(existing)) {
      currentState = existing;
      renderResumeView();
      return;
    }

    currentState = existing || new GameState();
    renderEvent(event);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  global.ElDoble = global.ElDoble || {};
  global.ElDoble.Runtime = { applyEffects };
})(window);
