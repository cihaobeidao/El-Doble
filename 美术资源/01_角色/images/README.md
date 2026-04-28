# 01_角色 / images

AI 生成的角色图存这里。

## 命名规则

```
<角色ID>_<视图>_v<版本号>.png

视图缩写:
  bust    — 半身正脸（默认 / canonical）
  3q      — 3/4 侧身
  full    — 全身
  scene   — 该角色在某场景里的镜头（后跟场景 ID:scene-PROL_C_001）
```

**示例**：
- `Saulito_bust_v01.png` — Saulito 的 canonical 头像第一版
- `Saulito_bust_v02.png` — 调整后的第二版
- `Mariana_3q_v01.png` — Mariana 的 3/4 角度
- `DonaIsabel_scene-PROL_P_001_v01.png` — Doña Isabel 在第一次内阁会议场景

## 一致性工作流（必读）

每个角色**先生成 canonical 头像（bust v01）**，验证调性后**作为 cref / reference image** 喂给后续所有 variant 与场景图。**不要直接生成场景图**——人脸会漂。

参 `../_角色生成清单.md` 与 `../../_风格指南.md`。
