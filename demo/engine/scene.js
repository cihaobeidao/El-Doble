/* scene.js —— 叙事渲染器。
   消费数据层（content/events/.../*.js 导出的纯对象），输出 DOM 节点。
   不持有状态。runtime.js 负责调用并把节点挂到 stage 上。

   Block 形状：
     { kind: 'narrator',   text: '...' }
     { kind: 'inner',      text: '...' }
     { kind: 'dialogue',   text: '...', speaker?: '可选说话人标签' }
     { kind: 'broadcast',  text: '...', source?: '来源条' }

   Scene 形状：
     { id, heading?, blocks: [Block, ...] }

   行内 markdown-lite：
     **加粗**  → <strong>
     *西语词*  → <em>      （在 inner 块里 em 会反转为正体，以做强调）
   注意：先解析 ** 再解析 *，避免 ** 被 * 切碎。 */

(function (global) {
  'use strict';

  /** HTML escape — 文本内容来自数据层的中文叙事，理论上无注入风险，
      但仍按惯例先逃逸再注入 markdown 标签。 */
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** 行内 markdown-lite 解析。 */
  function inlineMarkdown(text) {
    let out = escapeHtml(text);
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
    return out;
  }

  function el(tag, className, html) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function renderBlock(block) {
    switch (block.kind) {
      case 'narrator':
        return el('p', 'block voice-narrator', inlineMarkdown(block.text));

      case 'inner':
        return el('p', 'block voice-inner', inlineMarkdown(block.text));

      case 'dialogue': {
        const wrapper = el('div', 'block voice-dialogue');
        if (block.speaker) {
          wrapper.appendChild(el('span', 'dialogue-speaker', escapeHtml(block.speaker)));
        }
        wrapper.appendChild(el('span', 'dialogue-line', inlineMarkdown(block.text)));
        return wrapper;
      }

      case 'broadcast': {
        const wrapper = el('div', 'block voice-broadcast');
        if (block.source) {
          wrapper.appendChild(el('span', 'broadcast-source', escapeHtml(block.source)));
        }
        wrapper.appendChild(el('span', 'broadcast-body', inlineMarkdown(block.text)));
        return wrapper;
      }

      default:
        // 未知 kind —— 不渲染，console 警告。
        console.warn('scene.renderBlock: 未知的 block.kind', block);
        return el('p', 'block', '[未知 block]');
    }
  }

  function renderScene(scene) {
    const wrapper = el('section', 'scene');
    wrapper.dataset.sceneId = scene.id || '';
    if (scene.heading) {
      wrapper.appendChild(el('h2', 'scene-heading', escapeHtml(scene.heading)));
    }
    for (const block of (scene.blocks || [])) {
      wrapper.appendChild(renderBlock(block));
    }
    return wrapper;
  }

  /** 选项面板。callback(option) 在玩家点击后被调用。 */
  function renderChoice(choice, onPick) {
    const wrapper = el('div', 'choice');
    wrapper.dataset.role = 'choice';
    if (choice.prompt) {
      wrapper.appendChild(el('div', 'choice-prompt', escapeHtml(choice.prompt)));
    }
    const list = el('div', 'choice-options');
    for (const option of (choice.options || [])) {
      const btn = el('button', 'choice-option');
      btn.type = 'button';
      btn.innerHTML = inlineMarkdown(option.label);
      btn.addEventListener('click', () => onPick(option), { once: true });
      list.appendChild(btn);
    }
    wrapper.appendChild(list);
    return wrapper;
  }

  /** 选完后用一个 dim 的引文替换选项区，提示玩家"你刚说了什么"。 */
  function renderChosenLine(option) {
    const node = el('blockquote', 'chosen-line');
    node.innerHTML = inlineMarkdown(option.label);
    return node;
  }

  global.ElDoble = global.ElDoble || {};
  global.ElDoble.Scene = {
    renderBlock,
    renderScene,
    renderChoice,
    renderChosenLine,
    inlineMarkdown,
  };
})(window);
