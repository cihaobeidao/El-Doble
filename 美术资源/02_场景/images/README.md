# 02_场景 / images

AI 生成的场景图存这里。

## 命名规则

```
<场景ID>_<视图>_v<版本号>.png

视图缩写:
  est     — establishing shot（远景，建立空间感，16:9）
  mid     — 中景（角色 + 环境，3:2）
  detail  — 细节镜头（道具 / 关键物件特写）
  empty   — 空场景（无角色，用作对话背景）
```

**示例**：
- `LasVeladas_acera_est_v01.png` — Las Veladas 街景远景
- `CasaCobre_camerinos_empty_v01.png` — La Casa Cobre 地下化妆室空景
- `Catedral_aurora_est_v01.png` — Catedral de la Aurora 建立镜头

## 一致性工作流（必读）

场景图与角色图分两步走：

1. **先生成空场景**（`empty`）—— 验证光线、色调、家具布置。
2. **角色入场**用 `mid` 或 `scene-` 命名——以**角色 canonical 头像 + 空场景**作为 cref / reference 喂入。

参 `../_场景生成清单.md` 与 `../../_风格指南.md`。
