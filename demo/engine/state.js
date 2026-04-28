/* state.js —— GameState 类。
   只定义"全作骨架"所需的状态形状 + 序列化 / 反序列化。
   具体玩法逻辑（时辰消耗、事件解算、派系态度文字标签换算）不在这里，
   后续在 engine/ 下分模块实现。

   形状参考：
     03_核心玩法.md（幕 / 天 / 时辰 / 时刻表）
     04_数值与阵营.md（Tier 1–4：国家指标 / 派系态度 / 个人状态 / 隐性标记）
     05_多周目机制.md（存档约束）

   术语对应（中文术语 → 代码标识）：
     经济        Economía       → economy
     秩序        Orden          → order
     合法性      Legitimidad    → legitimacy
     政治资本    Tesoro         → politicalCapital
     伪装度      Verosimilitud  → replica.disguise
     神智        Cordura        → replica.sanity
     怀疑度      Sospecha       → replica.suspicion[faction]
     隐性标记                   → flags
     机动池                     → mobilePool

   派系标识沿用设定文档别名（La Junta / Los Doce / El Cártel ...），
   按 CLAUDE.md "不翻译派系名" 规则保留。

   注意：
   - flags 用 Set 便于 .has/.add/.delete，序列化时转数组。
   - 起始 伪装度 / 神智 / 政治资本 在 04 文档未明示，先用占位值，
     标 TODO，正式数值系统接入时统一回头修。 */

(function (global) {
  'use strict';

  const SCHEMA_VERSION = 1;

  const ACTO = {
    PROLOGUE: 0,    // 序幕《铜屋之夜》
    I:        1,
    II:       2,
    III:      3,
    IV:       4,
    V:        5,
    VI:       6,
    EPILOGUE: 7,
  };

  const FACTIONS = [
    'junta_old',       // 军方老派
    'junta_young',     // 军方青年派
    'doce',            // 十二姓氏
    'cartel',          // 圣灵集团
    'embajada_norte',  // 北方使馆
    'embajada_sur',    // 南方使馆
    'calle_iglesia',   // 街头与教会
  ];

  /** Tier 1 · 国家指标。04 文档明示初值。 */
  function defaultIndicators() {
    return {
      economy:          -30,  // 经济
      order:            -15,  // 秩序
      legitimacy:         0,  // 合法性
      politicalCapital:   5,  // 政治资本（TODO: 04 文档未明示，先占位）
    };
  }

  /** Tier 2 · 派系态度。数值范围 / 文字标签映射在派系态度模块里实现，
      这里只存裸数。0 = 中立。 */
  function defaultFactionAttitude() {
    return FACTIONS.reduce((acc, key) => { acc[key] = 0; return acc; }, {});
  }

  /** Tier 3 · 派系起始怀疑度。04 文档明示。 */
  function defaultSuspicion() {
    return {
      junta_old:       50,
      junta_young:      0,
      doce:            35,
      cartel:          20,
      embajada_norte:  70,
      embajada_sur:    30,
      calle_iglesia:    5,
    };
  }

  /** Tier 3 · 替身个人状态：伪装度 / 神智 / 怀疑度（按派系）。 */
  function defaultReplica() {
    return {
      disguise:  50,  // 伪装度（TODO: 待 04 文档明确起始）
      sanity:    80,  // 神智（TODO: 待 04 文档明确起始）
      suspicion: defaultSuspicion(),
    };
  }

  class GameState {
    constructor(init = {}) {
      this.schemaVersion = SCHEMA_VERSION;

      // 时空位置
      this.acto    = init.acto    ?? ACTO.PROLOGUE;
      this.day     = init.day     ?? 0;    // 序幕之夜 = day 0；第一幕起从 day 1 开始
      this.hour    = init.hour    ?? 0;    // 当日已消耗的时辰数（0–12）
      this.weekday = init.weekday ?? null; // 由 day 推导，序幕之前为 null

      // Tier 1 · 国家指标
      this.indicators = { ...defaultIndicators(), ...(init.indicators ?? {}) };

      // Tier 2 · 派系态度
      this.factionAttitude = { ...defaultFactionAttitude(), ...(init.factionAttitude ?? {}) };

      // Tier 3 · 替身个人状态
      const replicaInit = init.replica ?? {};
      this.replica = {
        disguise:  replicaInit.disguise  ?? 50,
        sanity:    replicaInit.sanity    ?? 80,
        suspicion: { ...defaultSuspicion(), ...(replicaInit.suspicion ?? {}) },
      };

      // Tier 4 · 隐性标记。Set 便于查询 / 去重，序列化时转数组。
      this.flags = init.flags instanceof Set
        ? new Set(init.flags)
        : new Set(Array.isArray(init.flags) ? init.flags : []);

      // 跨日机动池（03 文档"跨日机动时辰储蓄"小节）
      this.mobilePool = init.mobilePool ?? 0;
    }

    hasFlag(name)    { return this.flags.has(name); }
    addFlag(name)    { this.flags.add(name); }
    removeFlag(name) { this.flags.delete(name); }

    /** 序列化为可 JSON 化的纯对象。Set → Array。 */
    toJSON() {
      return {
        schemaVersion:   this.schemaVersion,
        acto:            this.acto,
        day:             this.day,
        hour:            this.hour,
        weekday:         this.weekday,
        indicators:      { ...this.indicators },
        factionAttitude: { ...this.factionAttitude },
        replica: {
          disguise:  this.replica.disguise,
          sanity:    this.replica.sanity,
          suspicion: { ...this.replica.suspicion },
        },
        flags:           [...this.flags].sort(), // 排序确保等值比较稳定
        mobilePool:      this.mobilePool,
      };
    }

    /** 由纯对象（来自 JSON.parse）重建。 */
    static fromJSON(data) {
      if (!data || typeof data !== 'object') {
        throw new Error('GameState.fromJSON: 输入非对象');
      }
      if (data.schemaVersion !== SCHEMA_VERSION) {
        // 未来需要做迁移；M0 暂时严格拒绝。
        throw new Error(`GameState.fromJSON: schemaVersion 不匹配（期望 ${SCHEMA_VERSION}，得到 ${data.schemaVersion}）`);
      }
      return new GameState(data);
    }
  }

  global.ElDoble = global.ElDoble || {};
  global.ElDoble.GameState      = GameState;
  global.ElDoble.ACTO           = ACTO;
  global.ElDoble.FACTIONS       = FACTIONS;
  global.ElDoble.SCHEMA_VERSION = SCHEMA_VERSION;
})(window);
