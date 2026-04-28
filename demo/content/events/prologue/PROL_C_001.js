/* PROL_C_001 · La Acera del Cobre（铜街人行道）—— 序幕首事件。

   文本来源：
   - 章节序场（broadcast）—— **AI 草稿，待 Keyan review**。
     仅使用 01_世界观与派系小传.md 与 02_真总统与替身原型.md 已有的公开
     素材（铜元 / 北元黑市汇率、通胀传言、总统健康传言、Las Veladas 抗议、
     04:17 时刻收束至场景首句），无任何 99 文档信息泄漏。
   - 【场景】Avenida del Cobre / 【车内】/ 【尾声】化妆室——基本采用
     07_风格样本.md 样本 1 原文，按 block 边界做切分。叙事文本调性的最终
     依据仍是该样本，本文件应被视为同步而非二次创作。

   选项 effects 校对：08_剧情/02_序幕.md "三个'选项'（实际同一结局）"
   小节 + 08_剧情/01_关键标记索引.md "Saulito 私人记忆 / 私人选择"。
   - A：sanity +5  / 标记 WALKED_IN_DIGNIFIED
   - B：sanity −5  / 标记 MENTIONED_LUCIA_TO_VEGA
   - C：sanity ±0  / 标记 NEGOTIATED_EXIT_CLAUSE / junta_young 派系态度 +5

   M1 对接：runtime.js 启动时直接渲染本事件，不走真正的事件触发系统。 */

(function (global) {
  'use strict';

  const event = {
    id: 'PROL_C_001',
    title: 'La Acera del Cobre',
    titleZh: '铜街人行道',
    type: 'crisis',
    acto: 0,           // 序幕
    hourCost: 0,       // 序幕特例：不消耗时辰
    tesoroCost: 0,

    actMarker: '序幕 · La Noche del Cobre / 铜屋之夜',

    scenes: [
      {
        id: 'overture',
        heading: '序场 · 凌晨四点',
        blocks: [
          {
            kind: 'broadcast',
            source: 'Radio Aurora · 04:00 整点新闻',
            text:
              '铜元兑北元黑市价：连续第七天下行。国家发展银行尚未公布本月通胀；' +
              '*El Diario Cobre* 估算已**突破两位数**——连续第七个月。\n\n' +
              '关于 Báez 总统先生健康的传言：第八天，无新材料。卫生部长拒绝评论。\n\n' +
              'Las Veladas 昨日午后曾有零星抗议，约一小时散去。首都维持三级安全等级。\n\n' +
              '*Ahora son las cuatro y diecisiete.* 凌晨四点十七分。',
          },
        ],
      },

      {
        id: 'street',
        heading: '【场景】Avenida del Cobre',
        blocks: [
          {
            kind: 'narrator',
            text: '凌晨四点十七分。Las Veladas 街区。',
          },
          {
            kind: 'narrator',
            text:
              '雨下了一整天，停了。空气里全是发酵的香蕉皮和某家烧烤炉的余烟。' +
              'Saúl 走在 Avenida del Cobre 上，左手揣在裤袋里，右手拎着一只从 ' +
              '*El Gallo Borracho* 酒吧顺出来的塑料杯——杯里还有半口朗姆酒。' +
              '他不该再喝了。今晚他演了三场——一场婚礼、一场五十岁生日、一场什么都不是的派对——' +
              '观众都让他做"总统讲话"。三场都笑场了。三场都没人多给小费。',
          },
          {
            kind: 'inner',
            text: '你右脚的鞋底松了。你今天就发现的，本来想买一只胶水，忘了。明天买。',
          },
          {
            kind: 'narrator',
            text: '一辆黑色雪佛兰从他左手边滑过来，慢得像鬼。**车牌没了**。',
          },
          {
            kind: 'narrator',
            text: '后窗摇下半截，露出半张脸。三十几岁，军帽压得很低。',
          },
          {
            kind: 'dialogue',
            speaker: '后座的男人',
            text: '"Saúl Tobar？"',
          },
          {
            kind: 'inner',
            text: '你认识这种声音。这种声音不是来抢你钱包的。',
          },
          {
            kind: 'dialogue',
            speaker: 'Saúl',
            text: '"我不在表演时段。"',
          },
          {
            kind: 'dialogue',
            speaker: '后座的男人',
            text: '"我们知道。请上车。"',
          },
          {
            kind: 'narrator',
            text:
              '他看了一眼街角。街角的小卖部还亮着，Doña Pilar 在打盹，电视开着但没声音。' +
              '**没有人会看见这一幕**。即使有人看见，也不会记得。',
          },
          {
            kind: 'narrator',
            text: '他上了车。',
          },
        ],
      },

      {
        id: 'in-car',
        heading: '【车内】',
        blocks: [
          {
            kind: 'narrator',
            text:
              '后座的男人摘下军帽。脸是干净的，但眼神是没睡过的那种干净。' +
              '副驾是个女人，头发盘得很紧，手里拿着一只小箱子——化妆箱——' +
              'Saúl 一眼就认出那是哪种箱子，因为他做这一行做了二十二年。',
          },
          {
            kind: 'dialogue',
            speaker: 'Vega',
            text: '"我叫 Vega。Coronel Mateo Vega。这位是 Susana。我们直接说事情。"',
          },
          {
            kind: 'inner',
            text: '他的声音里没有多余的情绪。这种人最难骗钱。',
          },
          {
            kind: 'narrator',
            text: 'Vega 把一只皮夹放在 Saúl 的膝盖上。Saúl 没动。',
          },
          {
            kind: 'dialogue',
            speaker: 'Vega',
            text: '"里面有四万北元。这是押金。还有一份合同。"',
          },
          {
            kind: 'dialogue',
            speaker: 'Saúl',
            text: '"我不签合同。"',
          },
          {
            kind: 'dialogue',
            speaker: 'Vega',
            text:
              '"您上次为一场葬礼给死者家属签收据用的是 *Saulito Tobar*' +
              '——是的，多了一个 *o*。我们看过。我们不是来抓您的。"',
          },
          {
            kind: 'inner',
            text: '四万北元。你算不出来这是多少米。',
          },
          {
            kind: 'narrator',
            text: 'Vega 看了一眼前面，司机继续开车。Susana 没有动。',
          },
          {
            kind: 'dialogue',
            speaker: 'Vega',
            text: '"Augusto Báez 总统大约十一天前离开了。我们需要您扮演他。从今天早晨开始。"',
          },
          {
            kind: 'narrator',
            text:
              'Saúl 笑了一声。这笑是职业的——他在台上为荒诞场面准备的那种笑——' +
              '但 Vega 没有跟着笑。',
          },
          {
            kind: 'dialogue',
            speaker: 'Vega',
            text:
              '"您来扮演的话——三个月。三个月之后我们会安排您与您母亲、您女儿一起去南方。' +
              '新身份。这笔钱在合同里。"',
          },
          {
            kind: 'dialogue',
            speaker: 'Saúl',
            text: '"如果我说不？"',
          },
          {
            kind: 'inner',
            text: '你已经知道答案了。',
          },
          {
            kind: 'narrator',
            text:
              '车停了一秒——只是路口的红灯——但这一秒里 Vega 没有说话。Susana 也没有。' +
              '**他们在等你听懂**。',
          },
          {
            kind: 'narrator',
            text: '红灯变绿。车继续走。',
          },
          {
            kind: 'dialogue',
            speaker: 'Vega',
            text:
              '"您母亲住在 Veranillo。门牌 47 号。她左腿不好。' +
              '您每月汇款 220 北元，去年八月开始改成 250，因为她膝盖加重了。' +
              '您的女儿 Lucía 下个月有解剖学考试，她每天早上六点去医院实习。"',
          },
          {
            kind: 'inner',
            text: '你的喉咙是干的。你想喝那半口朗姆酒，但杯子留在街上了。',
          },
          {
            kind: 'dialogue',
            speaker: 'Vega',
            text: '"我们不会动她们。永远不会。我们只是希望您理解，**这件事已经在发生了**。"',
          },
        ],
      },
    ],

    choice: {
      prompt: '你为什么答应？',
      options: [
        {
          id: 'A',
          label: '"把钱拿回去。我自己上车的。"',
          // 保留尊严。
          effects: {
            replicaSanityDelta: +5,
            flagsAdd: ['WALKED_IN_DIGNIFIED'],
          },
        },
        {
          id: 'B',
          label: '（沉默几秒）"……我女儿下周末过生日。"',
          // 你在跟他确认"她还活着对吧"。
          effects: {
            replicaSanityDelta: -5,
            flagsAdd: ['MENTIONED_LUCIA_TO_VEGA'],
          },
        },
        {
          id: 'C',
          label: '"好。但合同里加一条——三个月后您派来送我们走的人，**不是您**。"',
          // 谈判式接受。Vega 听懂了你在说什么。
          effects: {
            flagsAdd: ['NEGOTIATED_EXIT_CLAUSE'],
            factionAttitudeDelta: { junta_young: +5 },
          },
        },
      ],
    },

    epilogue: {
      id: 'mirror-room',
      heading: '【尾声】La Casa Cobre 地下化妆室',
      blocks: [
        {
          kind: 'narrator',
          text: '凌晨六点零八分。La Casa Cobre 地下化妆室。',
        },
        {
          kind: 'narrator',
          text: 'Susana 从化妆箱里拿出一只磨损的牛皮文件夹，放在你面前。',
        },
        {
          kind: 'dialogue',
          speaker: 'Susana',
          text: '"Patrón，您先看这个。我去给您熨袍子。"',
        },
        { kind: 'inner', text: 'Patrón。' },
        { kind: 'inner', text: '她叫你 Patrón。' },
        { kind: 'inner', text: '你这辈子从来没被人叫过 Patrón。' },
        { kind: 'inner', text: '你左脚的鞋底还是松的。' },
      ],
    },
  };

  global.ElDoble = global.ElDoble || {};
  global.ElDoble.Events = global.ElDoble.Events || {};
  global.ElDoble.Events.PROL_C_001 = event;
})(window);
