/* main.js —— M0 调试面板的 wiring。
   仅服务于 round-trip 验证，正式 UI 上线后整体替换。 */

(function (global) {
  'use strict';

  const { GameState, Storage } = global.ElDoble;

  /** 全局内存中的当前状态。M0 阶段简单一级变量即可。 */
  let current = null;

  function $(id) { return document.getElementById(id); }

  function setStatus(msg, tone /* 'ok' | 'warn' | 'error' | undefined */) {
    const el = $('debug-status');
    el.textContent = msg;
    if (tone) el.dataset.tone = tone;
    else delete el.dataset.tone;
  }

  function renderState() {
    const el = $('debug-state');
    if (!current) {
      el.textContent = '（无状态）';
      return;
    }
    el.textContent = JSON.stringify(current.toJSON(), null, 2);
  }

  /** 把每一层都改一下，确保 round-trip 自检覆盖到所有字段。 */
  function mutateForTest(state) {
    state.day += 1;
    state.hour += 2;
    state.weekday = '星期三';
    state.indicators.economy += 5;
    state.indicators.politicalCapital -= 1;
    state.factionAttitude.doce += 3;
    state.factionAttitude.calle_iglesia -= 2;
    state.replica.disguise -= 4;
    state.replica.sanity -= 7;
    state.replica.suspicion.embajada_norte += 1;
    state.addFlag('TEST_FLAG_ALPHA');
    state.addFlag('TEST_FLAG_BETA');
    state.mobilePool += 1;
  }

  const handlers = {
    new() {
      current = new GameState();
      setStatus('已新建初始状态。', 'ok');
      renderState();
    },

    mutate() {
      if (!current) {
        setStatus('请先"新建初始状态"。', 'warn');
        return;
      }
      mutateForTest(current);
      setStatus('已对每一层施加测试改动（天 / 国家指标 / 派系态度 / 替身 · 伪装度神智 / 怀疑度 / 隐性标记 / 机动池）。', 'ok');
      renderState();
    },

    save() {
      if (!current) {
        setStatus('内存中无状态可保存。', 'warn');
        return;
      }
      const env = Storage.save(current);
      setStatus(`已写入 localStorage["${Storage.SAVE_KEY}"]，savedAt=${env.savedAt}`, 'ok');
    },

    load() {
      try {
        const loaded = Storage.load();
        if (!loaded) {
          setStatus('localStorage 中无存档。', 'warn');
          return;
        }
        current = loaded;
        setStatus('已从 localStorage 加载并替换内存状态。', 'ok');
        renderState();
      } catch (e) {
        setStatus('加载失败：' + e.message, 'error');
      }
    },

    clear() {
      Storage.clear();
      setStatus(`已清除 localStorage["${Storage.SAVE_KEY}"]。内存状态保留。`, 'ok');
    },

    roundtrip() {
      if (!current) {
        setStatus('请先"新建初始状态"（建议再"修改测试值"覆盖所有层）。', 'warn');
        return;
      }
      try {
        const { ok, before, after } = Storage.roundTripCheck(current);
        if (ok) {
          setStatus('round-trip 通过：序列化 → localStorage → 反序列化后的状态与原状态字节相等。', 'ok');
        } else {
          setStatus('round-trip 失败：前后不一致，详情看 console。', 'error');
          console.group('round-trip diff');
          console.log('before:', before);
          console.log('after :', after);
          console.groupEnd();
        }
      } catch (e) {
        setStatus('round-trip 异常：' + e.message, 'error');
      }
    },
  };

  function bind() {
    document.querySelectorAll('[data-action]').forEach((btn) => {
      const action = btn.getAttribute('data-action');
      const fn = handlers[action];
      if (!fn) return;
      btn.addEventListener('click', fn);
    });

    if (Storage.exists()) {
      setStatus('引擎已加载。检测到既有存档，可点"加载"恢复，或"新建初始状态"覆盖。', 'ok');
    } else {
      setStatus('引擎已加载。点击"新建初始状态"开始。', 'ok');
    }
    renderState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})(window);
