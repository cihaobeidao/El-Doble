/* storage.js —— localStorage 单存档读写。
   05 文档约束：单一存档槽，不允许多档槽 / 自由读档。M0 只验证 round-trip，
   "自动保存 / 就寝保存 / 周目分离"等机制留待后续模块。 */

(function (global) {
  'use strict';

  const SAVE_KEY = 'el-doble:save:v1';

  /** 把 GameState 实例存入 localStorage。 */
  function save(state) {
    if (!state || typeof state.toJSON !== 'function') {
      throw new Error('Storage.save: 入参不是 GameState 实例');
    }
    const envelope = {
      envelopeVersion: 1,
      savedAt:         new Date().toISOString(),
      state:           state.toJSON(),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(envelope));
    return envelope;
  }

  /** 从 localStorage 读出 GameState。无存档返回 null；存档损坏抛错。 */
  function load() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw === null) return null;
    let envelope;
    try {
      envelope = JSON.parse(raw);
    } catch (e) {
      throw new Error('Storage.load: 存档 JSON 解析失败 —— ' + e.message);
    }
    if (!envelope || typeof envelope !== 'object' || !envelope.state) {
      throw new Error('Storage.load: 存档结构异常');
    }
    return global.ElDoble.GameState.fromJSON(envelope.state);
  }

  function clear() {
    localStorage.removeItem(SAVE_KEY);
  }

  function exists() {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  /** 把状态序列化两次比较（save → load → 再序列化），M0 自检用。 */
  function roundTripCheck(state) {
    const before = JSON.stringify(state.toJSON());
    save(state);
    const restored = load();
    const after = JSON.stringify(restored.toJSON());
    return {
      ok: before === after,
      before,
      after,
    };
  }

  global.ElDoble = global.ElDoble || {};
  global.ElDoble.Storage = { save, load, clear, exists, roundTripCheck, SAVE_KEY };
})(window);
