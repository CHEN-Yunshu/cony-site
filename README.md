# Cony 个人网站

面向澳洲 / 东南亚新市场的获客落地页。唯一 KPI 是**加到私域的人数**——网站不成交，微信/WhatsApp 里才成交。

## 文件说明

| 文件 | 用途 |
|---|---|
| `index.html` | 网站本体（单文件，无需构建） |
| `config.js` | **唯一需要编辑的文件** — 联系方式、执照号、数据 |
| `assets/` | 图片：`portrait.jpg`（首屏）、`about.jpg`（关于我）、`wechat-qr.png` |
| `build-preview.sh` | 生成 `preview.html` 单文件版，用于分享预览 |

本地查看：双击 `index.html`。或跑 `python3 -m http.server 4321 --directory .`

---

## ⚠️ 上线前必须替换的内容

### 1. `config.js`
- **`license`** — 登记证上的 등록번호（目前是 XXX-XX-XXXXX 占位）。填上可信度提升很大。
- 微信号、WhatsApp、Instagram、邮箱
- `formspreeId`（去 formspree.io 免费注册，表单才能收到信）
- `bookingUrl`（Cal.com / Calendly，填了才会显示"预约翻译时段"模块）
- `stats` 已按真实经历填好（100+ 场翻译 / 2023 入行 / 2026.02 登记），如有出入再改

### 2. `index.html` 里唯一还需要替换的文字
- **三条客户评价** — 目前是示例，必须换成真实评价（脱敏后）

关于我那一段已按 Cony 真实经历重写，如有出入直接改。

### 3. 图片 — 放进 `assets/`，文件名必须对得上

| 文件名 | 用哪张 | 理由 |
|---|---|---|
| `portrait.jpg` | **首尔街头拿咖啡那张** | 自然光、有生活感、不像营销照，最适合首屏 |
| `about.jpg` | **悉尼大学毕业典礼那张** | 「我也是从悉尼飞过去的」这条叙事的视觉证据 |
| `licence.jpg` | **외국인환자 유치사업자 등록증 扫描件** | 新人最强的信任凭证；地址等敏感信息可打码，但**登记号建议露出**，否则说服力减半 |

Bondi 海滩那张可以留着发 Instagram，网站上暂时没有它的位置。

后续拍摄要求：自然光、低饱和、**不要**诊所白光、**不要**术前术后对比图（韩国医疗法对此有限制，IG 也压这类内容）。

---

## 上线

推荐 **Cloudflare Pages** 或 **Netlify**：把整个文件夹拖进去就好，免费，自带 HTTPS，全球都快（中国大陆访问也比 Vercel 稳）。

域名建议 `.com`，用 Cony 的英文名或品牌名，短、好拼、好在 Instagram bio 里念出来。

---

## 设计规范（后续新增页面请沿用）

取自 Cony 的名片：哑光豆绿卡纸 + 深墨色 + 极简无衬线。

```
--paper     #EFEBE0   纸面底色
--paper-2   #E6E1D3   次级底色
--sage      #8E9678   主色块
--sage-deep #5E6650
--sage-dark #2E3428   页脚
--ink       #1B1D17   正文
--muted     #6E7063   辅助文字
```

字体 Instrument Sans + Noto Sans SC，标题字距 -0.03em，圆角 2px，不用阴影。
