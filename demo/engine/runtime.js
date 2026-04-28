/* runtime.js —— 游戏流程编排。
   M1 范围：序幕 PROL_C_001 单事件。事件流转 / 多事件队列 / 时刻表 留待 M2。

   职责：
   - boot：检测既有存档 → 加载或新建 GameState
   - 渲染当前事件的 scene 链 → 选项 → effects 应用 → 尾声 → 结束卡
   - 调试浮层：随时按 . 键弹出当前 state 的 JSON 快照

   M1 占位：尚未连接真实事件数据，先用一段 dummy 数据预览三种声音 +
   一个测试选项，验证渲染层。下一步（commit 2）替换为 PROL_C_001。 */

(function (global) {
  'use strict';

  const { GameState, Storage, Scene } = global.ElDoble;

  let currentState = null;

  function $(id) { return document.getElementById(id); }

  function getStage() {
    return $('stage');
  }

  function clearStage() {
    const stage = getStage();
    while (stage.firstChild) stage.removeChild(stage.firstChild);
  }

  function appendToStage(node) {
    getStage().appendChild(node);
    node.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

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

  /** 调试浮层 —— 显示当前 state 的 JSON。开发期保留，正式版可移除。 */
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
      if (e.key === '.') { e.preventDefault(); modal.dataset.open === 'true' ? close() : open(); }
      if (e.key === 'Escape') close();
    });
  }

  /** M1 占位预览 —— 把四种 block 都展示一遍，外加一个测试选项。 */
  function bootPreview() {
    clearStage();
    appendToStage(Scene.renderScene({
      id: 'preview-overture',
      heading: '渲染层验收 · 序场（broadcast）',
      blocks: [
        {
          kind: 'broadcast',
          source: 'Radio Aurora · 整点新闻 · 草稿待 review',
          text: '凌晨四点的整点新闻。今晚国家发展银行公布的本月通胀数据为 19.4 个百分点——这是连续第七个月双位数。当局尚未对周二关于总统先生健康的传言发表回应。Las Veladas 区下午曾有零星抗议，已散去。',
        },
      ],
    }));
    appendToStage(Scene.renderScene({
      id: 'preview-street',
      heading: '【场景】narrator + inner + dialogue 验收',
      blocks: [
        { kind: 'narrator', text: '凌晨四点十七分。Las Veladas 街区。**这是一段加粗示例**，里面还有 *西语词* 用于氛围。' },
        { kind: 'inner',    text: '你右脚的鞋底松了。你今天就发现的，本来想买一只 *胶水*，忘了。明天买。' },
        { kind: 'dialogue', speaker: 'Vega', text: '"Saúl Tobar？"' },
        { kind: 'inner',    text: '你认识这种声音。这种声音不是来抢你钱包的。' },
        { kind: 'dialogue', speaker: 'Saúl', text: '"我不在表演时段。"' },
      ],
    }));
    appendToStage(Scene.renderChoice({
      prompt: '验收选项面板',
      options: [
        { id: 'A', label: '"测试选项 A —— 加 *斜体* 与 **加粗**。"', effects: {} },
        { id: 'B', label: '"测试选项 B。"', effects: {} },
      ],
    }, (option) => {
      const stage = getStage();
      const choiceNode = stage.querySelector('[data-role="choice"]');
      if (choiceNode) choiceNode.replaceWith(Scene.renderChosenLine(option));
      appendToStage(Scene.renderScene({
        id: 'preview-end',
        heading: '验收完毕',
        blocks: [
          { kind: 'narrator', text: '渲染层 OK。下一步（commit 2）替换为 PROL_C_001 真实内容。' },
        ],
      }));
    }));
  }

  function boot() {
    bindDevTools();

    // 检测既有存档：M1 占位阶段不强行加载，避免污染预览。
    currentState = new GameState();

    bootPreview();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  global.ElDoble = global.ElDoble || {};
  global.ElDoble.Runtime = { applyEffects };
})(window);
