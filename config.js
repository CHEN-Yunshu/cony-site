/* ============================================================
   Cony 个人网站 — 唯一需要你编辑的配置文件
   改完这里，全站链接自动生效。
   把用不到的渠道留空字符串 ''，按钮会自动隐藏。
   ============================================================ */

window.CONY_CONFIG = {

  /* ---- 基本信息（⚠️ 全部需要替换） ---- */
  name:        'Cony',
  nameZh:      'Cony',
  /* 运营主体（显示在页脚，用于核验；品牌名和公司名可以不同） */
  legalEntity: '品高国际商务服务公司 · 핀고여행사',   // ⚠️ 确认最终对外主体名
  license:     'XXX-XX-XXXXX',        // ⚠️ 등록번호（执照上的登记号，填上更可信）
  licenseUrl:  '',                     // 可查询链接（如 Medical Korea 官网），留空则不显示

  /* ---- 数据（已按 Cony 真实经历填写，如有出入请改） ---- */
  stats: {
    sessions: '100+',                  // 陪同翻译场次（2023 年色彩诊断翻译起）
    since:    '2023',                  // 入行年份
    licensed: '2026.02',               // 首尔市外国人患者诱致业者登记
  },

  /* ---- 联系方式（⚠️ 替换，不用的留空） ---- */
  wechatId:    'cony_seoul',           // ⚠️ 微信号
  wechatQR:    'assets/wechat-qr.png', // ⚠️ 放一张微信二维码图进 assets/
  whatsapp:    '821012345678',         // ⚠️ 国际格式，不要 + 和空格
  line:        '',                     // LINE ID，例如 '@cony'
  kakao:       '',                     // 例如 'http://pf.kakao.com/_xxxxx'
  instagram:   'https://instagram.com/',        // ⚠️
  xiaohongshu: '',                     // 小红书主页链接
  tiktok:      '',
  youtube:     '',
  email:       'hello@example.com',    // ⚠️

  /* ---- 「关于我」左栏的照片井（想加就往数组里塞，布局自动排）----
     第 1 张最大，之后每两张一行。建议竖构图，宽 1080px 左右即可。 */
  gallery: [
    'assets/about.jpg',
    'assets/sydney-1.jpg',
    'assets/sydney-2.jpg',
  ],

  /* ---- 视频（留空数组则整块不显示）----
     小红书没有对外嵌入接口，只能做外链卡片（type:'link'）。
     首选 mp4：视频是她自己的，自己托管最快也最稳，海外访客一定打得开。
     竖屏 9:16 最合适，每条压到 5MB 以内。 */
  videos: [
    // { type:'mp4',     src:'assets/vlog-1.mp4', poster:'assets/vlog-1.jpg', title:'江南面诊当天' },
    // { type:'youtube', id:'dQw4w9WgXcQ',        poster:'',                  title:'首尔医美避雷' },
    // { type:'link',    url:'https://www.xiaohongshu.com/user/profile/xxx',
    //   poster:'assets/vlog-3.jpg', title:'更多日常', label:'小红书' },
  ],

  /* ---- 预约与表单 ---- */
  // 翻译陪同按小时预约：填 Cal.com 或 Calendly 链接，留空则整块隐藏
  bookingUrl:  '',                     // 例如 'https://cal.com/cony/interpreting'

  // 表单收件：去 https://formspree.io 免费注册，把 form ID 填进来
  formspreeId: '',                     // 例如 'xyzabcd'；留空时表单会引导用户走微信/WhatsApp

};

/* 文案（含常驻城市、页脚标语等）全部在 i18n.js 里，不在这个文件。 */
