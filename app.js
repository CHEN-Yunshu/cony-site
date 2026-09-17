/* Cony — small, dependency-free interactions for the public website. */
(() => {
  'use strict';

  const config = window.CONY_CONFIG || {};
  const dictionary = window.CONY_I18N || { langs: [], strings: {} };
  const supported = ['en', 'zh', 'ko', 'th'];
  const htmlLanguages = { en: 'en', zh: 'zh-Hans', ko: 'ko', th: 'th' };
  const localeNames = { en: 'en-GB', zh: 'zh-CN', ko: 'ko-KR', th: 'th-TH' };
  const $ = id => document.getElementById(id);
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let language = detectLanguage();
  let sending = false;
  let resultKey = '';
  let copyKey = '';
  let wechatCopyKey = '';
  let draftValues = null;
  let revealObserver;

  // Interface states live here; the editorial copy stays in i18n.js.
  const ui = {
    pageTitle: ['Cony — China–Korea interpreting & media coordination', 'Cony — 中韩翻译、传媒合作与预约协调', 'Cony — 한중 통역·미디어 협업·예약 조율', 'Cony — ล่ามจีน–เกาหลี สื่อ และประสานงาน'],
    pageDescription: ['Meet Cony: China–Korea business interpreting, media collaborations, and appointment coordination in Seoul.', '认识 Cony：中韩商务与展会翻译、自媒体合作、首尔医美预约陪同及色彩测试翻译。', '한중 비즈니스·전시 통역, 미디어 협업, 서울 클리닉 예약 동행과 퍼스널 컬러 통역을 하는 Cony를 만나보세요.', 'รู้จัก Cony กับงานล่ามธุรกิจจีน–เกาหลี งานสื่อ การนัดหมายคลินิก และล่ามวิเคราะห์สีในโซล'],
    channelsPending: ['Contact details will be added soon. You can prepare a message below in the meantime.', '联系方式会在确认后放上来。你也可以先在这里整理一段留言。', '연락처는 확인 후 안내할 예정입니다. 아래에서 문의 내용을 먼저 정리하실 수 있어요.', 'จะเพิ่มช่องทางติดต่อเมื่อยืนยันแล้ว ระหว่างนี้คุณสามารถเตรียมข้อความด้านล่างได้'],
    channelsReady: ['Choose the channel you use most.', '选一个你平时常用的方式就好。', '편한 연락 방법을 선택해 주세요.', 'เลือกช่องทางที่คุณสะดวกได้เลย'],
    pending: ['Coming soon', '稍后开放', '준비 중', 'เร็ว ๆ นี้'],
    draftMode: ['Add your dates and what you need, then copy the message to use when you get in touch.', '先写好具体日期和需求，复制下来，联系时直接发就行。', '구체적인 날짜와 필요한 내용을 적고 복사해 두었다가 연락하실 때 보내주세요.', 'ระบุวันที่และสิ่งที่ต้องการ แล้วคัดลอกข้อความไว้ใช้เมื่อติดต่อ'],
    connectedMode: ['Add your dates and what you need so Cony can check the schedule.', '写清具体日期和需求，方便 Cony 确认安排。', '일정을 확인할 수 있도록 구체적인 날짜와 필요한 내용을 적어주세요.', 'ระบุวันที่และสิ่งที่ต้องการให้ชัดเจน เพื่อให้ Cony ตรวจสอบตารางได้'],
    draftSubmit: ['Prepare my message', '生成咨询留言', '문의 내용 정리하기', 'เตรียมข้อความสอบถาม'],
    sendSubmit: ['Send my enquiry', '发送咨询', '문의 보내기', 'ส่งคำถาม'],
    sending: ['Sending…', '发送中…', '보내는 중…', 'กำลังส่ง…'],
    draftNote: ['This makes a message on your device. Nothing is sent.', '这里会帮你整理留言，内容保留在当前页面，不会自动发送。', '현재 페이지에서 메시지만 정리합니다. 내용이 전송되지는 않습니다.', 'ระบบจะจัดข้อความไว้ในหน้านี้เท่านั้น ยังไม่มีการส่งข้อความ'],
    connectedNote: ['Your details are used to respond to this enquiry. Please leave out medical records and other sensitive documents.', '这些信息用于回复你的咨询。病历等私密资料，等需要时再单独沟通。', '입력하신 정보는 문의 답변에 사용됩니다. 진료 기록 등 민감한 자료는 이 양식에 넣지 말아 주세요.', 'ข้อมูลนี้ใช้เพื่อตอบคำถามของคุณ กรุณาอย่าใส่เวชระเบียนหรือเอกสารส่วนตัวในแบบฟอร์มนี้'],
    draftReady: ['Your message is ready to copy. It has not been sent.', '留言整理好了，可以复制。还没有发送。', '복사할 메시지를 정리했습니다. 아직 전송되지 않았습니다.', 'ข้อความพร้อมให้คัดลอกแล้ว ยังไม่ได้ส่ง'],
    sent: ['Your enquiry was sent. Thank you for leaving your details.', '咨询已发送，谢谢你留下这些信息。', '문의가 전송되었습니다. 내용을 남겨주셔서 감사합니다.', 'ส่งคำถามแล้ว ขอบคุณที่ฝากรายละเอียดไว้'],
    error: ['The message did not go through. Your text is still here; please try again or use a contact channel.', '这次没能发送成功，填写的内容还在。可以重试，或通过联系方式直接发送。', '전송되지 않았습니다. 입력 내용은 그대로 남아 있으니 다시 시도하거나 다른 연락 방법을 이용해 주세요.', 'ส่งไม่สำเร็จ ข้อความของคุณยังอยู่ ลองอีกครั้งหรือใช้ช่องทางติดต่ออื่น'],
    copied: ['Copied', '已复制', '복사했습니다', 'คัดลอกแล้ว'],
    copyFailed: ['Please select and copy the text below.', '请选中下面的文字，手动复制。', '아래 내용을 선택해 직접 복사해 주세요.', 'กรุณาเลือกและคัดลอกข้อความด้านล่าง'],
    draftName: ['Name', '称呼', '이름', 'ชื่อ'],
    draftContact: ['Contact', '联系方式', '연락처', 'ช่องทางติดต่อ'],
    draftFrom: ['Travelling from', '出发城市', '출발 도시', 'เดินทางจาก'],
    draftService: ['Enquiry', '咨询内容', '문의 분야', 'เรื่องที่สอบถาม'],
    draftDate: ['Date', '日期', '날짜', 'วันที่'],
    draftMessage: ['Plans and questions', '安排和问题', '일정과 질문', 'แผนและคำถาม'],
    draftIntro: ['Hi Cony, here are the details of my enquiry.', '你好 Cony，这是我想咨询的事情和具体安排。', '안녕하세요 Cony, 문의 내용과 일정을 보내드립니다.', 'สวัสดี Cony นี่คือรายละเอียดและแผนที่อยากสอบถาม'],
    servicePlaceholder: ['Choose a service', '请选择咨询内容', '문의 분야를 선택해 주세요', 'เลือกเรื่องที่ต้องการสอบถาม'],
    serviceBusiness: ['Business & exhibition interpreting', '商务 / 展会翻译', '비즈니스·전시 통역', 'ล่ามธุรกิจและงานแสดงสินค้า'],
    serviceMedia: ['China–Korea media collaboration', '中韩自媒体合作', '한중 미디어 협업', 'ความร่วมมือด้านสื่อจีน–เกาหลี'],
    serviceClinic: ['Clinic appointments & interpreting', '医美预约 / 陪同翻译', '클리닉 예약·동행 통역', 'นัดหมายคลินิกและล่ามติดตาม'],
    serviceColour: ['Personal colour & makeup styling', '色彩测试 / 妆造', '퍼스널 컬러·메이크업 스타일링', 'วิเคราะห์สีส่วนบุคคลและแต่งหน้า'],
    serviceOther: ['Another enquiry', '其他咨询', '기타 문의', 'คำถามอื่น ๆ'],
    arrivalDate: ['Preferred appointment or service date', '希望预约 / 安排日期', '희망 예약·진행 날짜', 'วันที่ต้องการนัดหมายหรือใช้บริการ'],
    mediaDate: ['Preferred collaboration date (optional)', '期望合作时间（选填）', '희망 협업 날짜 (선택)', 'วันที่อยากร่วมงาน (ไม่บังคับ)'],
    dateHint: ['Please choose a confirmed or planned date. It helps me check availability.', '请填写已经确定或计划中的具体日期，方便确认档期。', '가능한 일정을 확인할 수 있도록 확정 또는 예정 날짜를 선택해 주세요.', 'เลือกวันที่ยืนยันแล้วหรือวางแผนไว้ เพื่อช่วยตรวจสอบคิว'],
    mediaDateHint: ['Remote collaborations are welcome. Add a date if you have one in mind.', '线上合作也可以。有预计时间的话，可以先写下来。', '온라인 협업도 가능합니다. 예정된 날짜가 있다면 적어주세요.', 'สามารถร่วมงานทางไกลได้ หากมีวันที่ในใจสามารถระบุไว้ได้'],
    pastDate: ['Please choose today or a future date.', '请选择今天或之后的日期。', '오늘 또는 이후 날짜를 선택해 주세요.', 'กรุณาเลือกวันนี้หรือวันที่หลังจากนี้'],
    requiredField: ['Please fill in this field.', '这里还需要填写一下。', '이 항목을 입력해 주세요.', 'กรุณากรอกช่องนี้'],
    requiredService: ['Please choose what you need help with.', '请先选择咨询内容。', '문의 분야를 선택해 주세요.', 'กรุณาเลือกเรื่องที่ต้องการสอบถาม'],
    requiredDate: ['Please add your preferred appointment or service date.', '请填写希望预约或安排的具体日期。', '예약 또는 진행을 희망하는 날짜를 입력해 주세요.', 'กรุณาระบุวันที่ต้องการนัดหมายหรือใช้บริการ'],
    requiredMessage: ['Please add a few details about what you need.', '请写一下具体需求。', '필요한 내용을 구체적으로 적어주세요.', 'กรุณาเขียนรายละเอียดสิ่งที่ต้องการ'],
    email: ['Email', '邮件', '이메일', 'อีเมล'],
    openChat: ['Open chat', '打开聊天', '대화하기', 'เปิดแชท'],
    watch: ['Watch video', '观看视频', '영상 보기', 'ดูวิดีโอ'],
    registration: ['Registration', '登记号', '등록번호', 'เลขทะเบียน'],
    photo: ['Photo of Cony', 'Cony 的照片', 'Cony의 사진', 'รูปของ Cony'],
    qr: ['WeChat QR code', '微信二维码', '위챗 QR 코드', 'คิวอาร์โค้ด WeChat'],
  };

  function message(key) {
    const values = ui[key];
    return values ? values[supported.indexOf(language)] || values[0] : '';
  }

  function translated(key) {
    const row = dictionary.strings && dictionary.strings[key];
    return row ? row[language] || row.en || '' : '';
  }

  function plain(value) {
    const holder = document.createElement('div');
    holder.innerHTML = String(value || '');
    return holder.textContent || '';
  }

  function text(id, value) {
    const node = $(id);
    if (node) node.textContent = value || '';
  }

  function detectLanguage() {
    try {
      const query = new URL(window.location.href).searchParams.get('lang');
      if (supported.includes(query)) return query;
    } catch (_) { /* A normal document URL is not guaranteed in embedded previews. */ }
    try {
      const saved = localStorage.getItem('cony-lang');
      if (supported.includes(saved)) return saved;
    } catch (_) { /* Private browsing may block storage. */ }
    for (const candidate of navigator.languages || [navigator.language || 'en']) {
      const code = candidate.toLowerCase().split('-')[0];
      if (supported.includes(code)) return code;
    }
    return 'en';
  }

  function safeURL(value, allowMail = false) {
    if (typeof value !== 'string' || !value.trim()) return '';
    try {
      const url = new URL(value.trim(), document.baseURI);
      if (url.protocol === 'https:' || url.protocol === 'http:' || (allowMail && url.protocol === 'mailto:')) return url.href;
    } catch (_) { /* Ignore unusable configuration values. */ }
    return '';
  }

  // Assets may live beside a file:// preview or be embedded in a standalone HTML.
  // This exception is deliberately separate from navigation and contact URLs.
  function safeAssetURL(value, allowDataImage = true) {
    if (typeof value !== 'string' || !value.trim()) return '';
    const source = value.trim();
    if (allowDataImage && /^data:image\/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/\r\n]+={0,2}$/i.test(source)) return source;
    const remote = safeURL(source);
    if (remote) return remote;
    try {
      const directory = new URL('.', document.baseURI);
      const asset = new URL(source, document.baseURI);
      if (directory.protocol === 'file:' && asset.protocol === 'file:'
        && asset.hostname === directory.hostname
        && !/%(?:2f|5c|00)/i.test(asset.pathname)
        && asset.pathname.startsWith(directory.pathname)) return asset.href;
    } catch (_) { /* An invalid or out-of-directory file is not a usable asset. */ }
    return '';
  }

  function emailURL(value) {
    return typeof value === 'string' && /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(value)
      ? `mailto:${encodeURIComponent(value).replace(/%40/g, '@')}` : '';
  }

  function externalLink(url, label, className = '') {
    const link = document.createElement('a');
    link.href = url;
    link.textContent = label;
    link.className = className;
    if (!url.startsWith('mailto:')) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    return link;
  }

  function hasFormEndpoint() {
    return typeof config.formspreeId === 'string' && /^[a-zA-Z0-9]{5,40}$/.test(config.formspreeId)
      && !/^(?:your|example|replace|xxxxx)/i.test(config.formspreeId);
  }

  function verifiedContacts() {
    return config.contactsVerified === true;
  }

  function setLanguage(nextLanguage, persist = true) {
    language = supported.includes(nextLanguage) ? nextLanguage : 'en';
    document.documentElement.lang = htmlLanguages[language];
    if (persist) {
      try { localStorage.setItem('cony-lang', language); } catch (_) { /* Optional preference. */ }
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.has('lang')) {
          url.searchParams.set('lang', language);
          history.replaceState(history.state, '', url);
        }
      } catch (_) { /* File previews may not allow history updates. */ }
    }
    document.querySelectorAll('[data-i18n]').forEach(node => {
      const value = translated(node.dataset.i18n);
      if (value) node.innerHTML = value;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(node => {
      const value = translated(node.dataset.i18nPh);
      if (value) node.placeholder = plain(value);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(node => {
      const value = translated(node.dataset.i18nAria);
      if (value) node.setAttribute('aria-label', plain(value));
    });
    if ($('langsel')) $('langsel').value = language;
    document.title = plain(translated('page_title')) || message('pageTitle');
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = plain(translated('page_description')) || message('pageDescription');
    renderConfiguration();
    renderFormState();
    document.querySelectorAll('#cform [aria-invalid="true"]').forEach(renderFieldError);
    text('wx-copy-status', message(wechatCopyKey));
    updateTime();
    if (draftValues) buildDraft(draftValues);
    observeReveals();
    document.dispatchEvent(new CustomEvent('cony:languagechange', { detail: { language } }));
  }
  window.setLang = setLanguage;

  function buildLanguageSelect() {
    const select = $('langsel');
    if (!select) return;
    select.replaceChildren();
    const options = dictionary.langs && dictionary.langs.length ? dictionary.langs : [
      { code: 'en', label: 'English' }, { code: 'zh', label: '中文' },
      { code: 'ko', label: '한국어' }, { code: 'th', label: 'ไทย' },
    ];
    options.filter(option => supported.includes(option.code)).forEach(option => {
      const node = document.createElement('option');
      node.value = option.code;
      node.textContent = option.label;
      select.append(node);
    });
    select.removeAttribute('onchange');
    select.addEventListener('change', () => setLanguage(select.value));
  }

  function renderConfiguration() {
    const stats = config.stats || {};
    ['sessions', 'since', 'licensed'].forEach(key => text(`st-${key}`, stats[key]));
    const license = String(config.license || '').trim();
    const validLicense = license.length > 3 && !/(?:xxx|example|待|确认|pending|replace|placeholder)/i.test(license);
    const registration = $('registration');
    if (registration) registration.hidden = !validLicense;
    const confirmedEntity = config.legalEntityVerified === true ? config.legalEntity : '';
    text('foot-entity', confirmedEntity);
    if ($('foot-entity')) $('foot-entity').hidden = !confirmedEntity;
    text('foot-license', validLicense ? `${message('registration')} ${license}` : '');
    if ($('foot-license')) $('foot-license').hidden = !validLicense;
    text('copyright-year', String(new Date().getFullYear()));
    text('foot-tagline', plain(translated('js_tagline')));
    text('cred-city', plain(translated('js_city')));
    text('cred-body', plain(translated('js_licbody')));
    const credential = $('cred-license');
    if (credential) {
      credential.replaceChildren();
      if (validLicense) {
        const label = `${message('registration')} ${license}`;
        const url = safeURL(config.licenseUrl);
        if (url) credential.append(externalLink(url, label));
        else credential.textContent = label;
      }
    }
    const bookingURL = safeURL(config.bookingUrl);
    if ($('booking-block')) $('booking-block').hidden = !bookingURL;
    const booking = $('booking-link');
    if (booking && bookingURL) {
      booking.href = bookingURL;
      booking.target = '_blank';
      booking.rel = 'noopener noreferrer';
    }
    const partner = $('partner-mail');
    if (partner) {
      const url = verifiedContacts() && emailURL(config.email);
      partner.href = url || '#contact';
    }
    renderChannels();
    renderSocials();
    renderVideos();
  }

  function renderChannels() {
    const container = $('channels');
    if (!container) return;
    container.replaceChildren();
    const channels = [];
    if (verifiedContacts()) {
      if (typeof config.wechatId === 'string' && config.wechatId.trim()) channels.push({ label: 'WeChat', detail: config.wechatId, wechat: true });
      const whatsapp = String(config.whatsapp || '').replace(/[+\s()-]/g, '');
      if (/^\d{7,15}$/.test(whatsapp)) channels.push({ label: 'WhatsApp', detail: `+${whatsapp}`, url: `https://wa.me/${whatsapp}` });
      if (config.line) channels.push({ label: 'LINE', detail: config.line, url: `https://line.me/R/ti/p/${encodeURIComponent(config.line)}` });
      if (safeURL(config.kakao)) channels.push({ label: 'KakaoTalk', detail: message('openChat'), url: safeURL(config.kakao) });
      if (safeURL(config.instagram)) channels.push({ label: 'Instagram', detail: '↗', url: safeURL(config.instagram) });
      if (safeURL(config.xiaohongshu)) channels.push({ label: plain(translated('js_xhs')) || 'RED', detail: '↗', url: safeURL(config.xiaohongshu) });
      if (emailURL(config.email)) channels.push({ label: message('email'), detail: config.email, url: emailURL(config.email) });
    }
    channels.forEach(channel => {
      const node = channel.wechat ? document.createElement('button') : externalLink(channel.url, '');
      node.className = 'channel';
      if (channel.wechat) {
        node.type = 'button';
        node.addEventListener('click', openWeChat);
        node.setAttribute('aria-haspopup', 'dialog');
      }
      const name = document.createElement('span');
      name.className = 'channel-name';
      name.textContent = channel.label;
      const meta = document.createElement('span');
      meta.className = 'channel-meta';
      meta.textContent = channel.detail;
      node.append(name, meta);
      container.append(node);
    });
    if (!channels.length) {
      ['WeChat', 'WhatsApp', message('email')].forEach(label => {
        const node = document.createElement('span');
        node.className = 'channel is-unavailable';
        node.setAttribute('aria-disabled', 'true');
        const name = document.createElement('span');
        name.className = 'channel-name';
        name.textContent = label;
        const note = document.createElement('span');
        note.className = 'channel-meta';
        note.textContent = message('pending');
        node.append(name, note);
        container.append(node);
      });
    }
    text('contact-methods-note', message(channels.length ? 'channelsReady' : 'channelsPending'));
  }

  function renderSocials() {
    const container = $('socials');
    if (!container) return;
    container.replaceChildren();
    if (!verifiedContacts()) return;
    const links = [
      ['Instagram', safeURL(config.instagram)],
      [plain(translated('js_xhs')) || 'RED', safeURL(config.xiaohongshu)],
      ['TikTok', safeURL(config.tiktok)], ['YouTube', safeURL(config.youtube)],
      [message('email'), emailURL(config.email)],
    ];
    links.forEach(([label, url]) => { if (url) container.append(externalLink(url, label)); });
  }

  function renderVideos() {
    const section = $('video');
    const container = $('vids');
    if (!section || !container) return;
    container.replaceChildren();
    const videos = Array.isArray(config.videos) ? config.videos : [];
    videos.forEach(video => {
      if (!video || typeof video !== 'object') return;
      const url = video.type === 'link' ? safeURL(video.url) : safeAssetURL(video.src, false);
      const youtube = video.type === 'youtube' && /^[\w-]{11}$/.test(String(video.id || ''));
      if (!youtube && (!(video.type === 'mp4' || video.type === 'link') || !url)) return;
      const card = document.createElement('article');
      card.className = 'video-card reveal';
      const title = video.title || message('watch');
      let media;
      if (video.type === 'mp4') {
        media = document.createElement('video');
        media.src = url;
        media.controls = true;
        media.playsInline = true;
        media.preload = 'none';
        const poster = safeAssetURL(video.poster);
        if (poster) media.poster = poster;
        media.setAttribute('aria-label', title);
      } else {
        media = video.type === 'link' ? externalLink(url, '') : document.createElement('button');
        if (youtube) {
          media.type = 'button';
          media.addEventListener('click', () => {
            const frame = document.createElement('iframe');
            frame.src = `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`;
            frame.title = title;
            frame.allow = 'autoplay; encrypted-media; picture-in-picture';
            frame.allowFullscreen = true;
            frame.className = 'video-media';
            media.replaceWith(frame);
            frame.focus();
          }, { once: true });
        }
        const poster = safeAssetURL(video.poster);
        if (poster) {
          const img = document.createElement('img');
          img.src = poster;
          img.alt = '';
          img.loading = 'lazy';
          media.append(img);
        }
        const play = document.createElement('span');
        play.className = 'video-play';
        play.textContent = '↗';
        play.setAttribute('aria-hidden', 'true');
        media.append(play);
        media.setAttribute('aria-label', `${message('watch')}: ${title}`);
      }
      media.className = 'video-media';
      const caption = document.createElement('p');
      caption.className = 'video-caption';
      caption.textContent = title;
      card.append(media, caption);
      container.append(card);
    });
    section.hidden = !container.children.length;
  }

  function renderFormState() {
    const connected = hasFormEndpoint();
    text('form-mode', message(connected ? 'connectedMode' : 'draftMode'));
    text('contact-note', message(connected ? 'connectedNote' : 'draftNote'));
    const submit = $('form-submit');
    if (submit) {
      const label = submit.querySelector('[data-i18n]') || submit;
      label.textContent = message(sending ? 'sending' : connected ? 'sendSubmit' : 'draftSubmit');
      submit.disabled = sending;
    }
    if ($('cform')) $('cform').setAttribute('aria-busy', String(sending));
    text('formresult', message(copyKey || resultKey));
    renderServiceOptions();
    updateDateField();
  }

  const serviceKeys = { business: 'serviceBusiness', media: 'serviceMedia', clinic: 'serviceClinic', colour: 'serviceColour', other: 'serviceOther' };

  function renderServiceOptions() {
    const select = $('contact-service');
    if (!select) return;
    const selected = select.value;
    select.replaceChildren();
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = message('servicePlaceholder');
    placeholder.disabled = true;
    select.append(placeholder);
    Object.entries(serviceKeys).forEach(([value, key]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = message(key);
      select.append(option);
    });
    select.value = selected in serviceKeys ? selected : '';
  }

  function todayDate() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  function updateDateField() {
    const field = $('contact-date');
    if (!field) return;
    const media = $('contact-service')?.value === 'media';
    field.required = !media;
    field.min = todayDate();
    const label = $('contact-date-label') || document.querySelector('label[for="contact-date"]');
    if (label) label.textContent = message(media ? 'mediaDate' : 'arrivalDate');
    text('contact-date-hint', message(media ? 'mediaDateHint' : 'dateHint'));
    field.setCustomValidity(field.value && field.value < field.min ? message('pastDate') : '');
  }

  function renderFieldError(field) {
    if (!field || !field.validity) return;
    const error = $(`error-${field.name}`);
    if (field.validity.valid) {
      field.removeAttribute('aria-invalid');
      if (error) error.textContent = '';
      return;
    }
    let key = 'requiredField';
    if (field.name === 'service') key = 'requiredService';
    if (field.name === 'date') key = field.value ? 'pastDate' : 'requiredDate';
    if (field.name === 'message') key = 'requiredMessage';
    field.setAttribute('aria-invalid', 'true');
    if (error) {
      error.textContent = message(key);
      const references = new Set((field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
      references.add(error.id);
      field.setAttribute('aria-describedby', [...references].join(' '));
    }
  }

  function updateRequiredValidity(field) {
    if (!field || !field.willValidate || field.type === 'date') return;
    const blank = field.required && typeof field.value === 'string' && !field.value.trim();
    field.setCustomValidity(blank ? message('requiredField') : '');
  }

  function getFormValues(form) {
    const values = new FormData(form);
    return Object.fromEntries(['name', 'contact', 'from', 'service', 'date', 'message'].map(key => [key, String(values.get(key) || '').trim()]));
  }

  function buildDraft(values) {
    const lines = [message('draftIntro'), ''];
    [['name', 'draftName'], ['contact', 'draftContact'], ['from', 'draftFrom'], ['service', 'draftService'], ['date', 'draftDate'], ['message', 'draftMessage']].forEach(([field, key]) => {
      const value = field === 'service' ? message(serviceKeys[values[field]]) : values[field];
      if (value) lines.push(`${message(key)}: ${value}`);
    });
    if ($('message-draft')) $('message-draft').value = lines.join('\n');
  }

  function initForm() {
    const form = $('cform');
    if (!form) return;
    form.noValidate = true;
    form.addEventListener('invalid', event => {
      event.preventDefault();
      renderFieldError(event.target);
    }, true);
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (sending) return;
      updateDateField();
      const fields = Array.from(form.elements).filter(field => field.willValidate);
      fields.forEach(field => {
        updateRequiredValidity(field);
        renderFieldError(field);
      });
      const firstInvalid = fields.find(field => !field.validity.valid);
      if (firstInvalid) {
        firstInvalid.focus({ preventScroll: true });
        firstInvalid.scrollIntoView({ behavior: motionPreference.matches ? 'auto' : 'smooth', block: 'center' });
        return;
      }
      copyKey = '';
      const values = getFormValues(form);
      if (!hasFormEndpoint()) {
        draftValues = values;
        buildDraft(values);
        if ($('draft-panel')) $('draft-panel').hidden = false;
        resultKey = 'draftReady';
        renderFormState();
        if ($('message-draft')) $('message-draft').focus({ preventScroll: true });
        if ($('draft-panel')) $('draft-panel').scrollIntoView({ behavior: motionPreference.matches ? 'auto' : 'smooth', block: 'nearest' });
        return;
      }
      sending = true;
      resultKey = '';
      renderFormState();
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 20000);
      try {
        const response = await fetch(`https://formspree.io/f/${config.formspreeId}`, {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...values, language, _subject: 'Cony website enquiry' }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Enquiry was not accepted');
        resultKey = 'sent';
      } catch (_) {
        resultKey = 'error';
      } finally {
        window.clearTimeout(timeout);
        sending = false;
        renderFormState();
      }
    });
    if ($('copy-message')) $('copy-message').addEventListener('click', async () => {
      const draft = $('message-draft');
      if (!draft) return;
      const copied = await copyText(draft.value, draft);
      copyKey = copied ? 'copied' : 'copyFailed';
      renderFormState();
    });
    form.addEventListener('input', event => {
      updateDateField();
      updateRequiredValidity(event.target);
      if (event.target.hasAttribute('aria-invalid')) renderFieldError(event.target);
      if ($('contact-date')?.hasAttribute('aria-invalid')) renderFieldError($('contact-date'));
      // A generated draft follows edits without changing or storing the original inputs.
      if (draftValues) {
        draftValues = getFormValues(form);
        buildDraft(draftValues);
      }
      if (copyKey || resultKey === 'sent' || resultKey === 'error') {
        copyKey = '';
        resultKey = draftValues ? 'draftReady' : '';
        renderFormState();
      }
    });
  }

  async function copyText(value, existingField) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch (_) { /* A local preview may deny clipboard access. */ }
    const field = existingField || document.createElement('textarea');
    const previousFocus = document.activeElement;
    if (!existingField) {
      field.value = value;
      field.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.append(field);
    }
    field.focus({ preventScroll: true });
    field.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch (_) { /* Manual selection remains available. */ }
    if (!existingField) {
      field.remove();
      if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus({ preventScroll: true });
    }
    return copied;
  }

  let overflowBeforeDialog = '';
  function showDialog(dialog) {
    if (!dialog || dialog.open) return;
    closeMenu();
    overflowBeforeDialog = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('dialog-open');
  }

  function openWeChat() {
    if (!verifiedContacts() || !config.wechatId) return;
    text('wxid', config.wechatId);
    wechatCopyKey = '';
    text('wx-copy-status', '');
    const qr = $('wxqr');
    if (qr) {
      const src = safeAssetURL(config.wechatQR);
      qr.alt = message('qr');
      qr.hidden = !src;
      if (src) {
        qr.onerror = () => { qr.hidden = true; };
        qr.src = src;
      } else qr.removeAttribute('src');
    }
    showDialog($('wx-dialog'));
  }

  function initDialogs() {
    document.querySelectorAll('dialog').forEach(dialog => {
      dialog.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => dialog.close()));
      let backdropPress = false;
      dialog.addEventListener('pointerdown', event => {
        const rect = dialog.getBoundingClientRect();
        backdropPress = event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom);
      });
      dialog.addEventListener('click', event => {
        if (backdropPress && event.target === dialog) dialog.close();
        backdropPress = false;
      });
      dialog.addEventListener('close', () => {
        document.body.style.overflow = overflowBeforeDialog;
        document.documentElement.classList.remove('dialog-open');
      });
    });
    document.querySelectorAll('.photo-button[data-photo]').forEach(button => {
      button.addEventListener('click', () => {
        const src = safeAssetURL(button.dataset.photo);
        const image = $('lightbox-img');
        if (!src || !image) return;
        image.src = src;
        image.alt = button.dataset.photoAlt || button.querySelector('img')?.alt || message('photo');
        showDialog($('photo-dialog'));
      });
    });
    if ($('wxcopy')) $('wxcopy').addEventListener('click', async () => {
      if (!verifiedContacts() || !config.wechatId) return;
      const copied = await copyText(config.wechatId);
      wechatCopyKey = copied ? 'copied' : 'copyFailed';
      text('wx-copy-status', message(wechatCopyKey));
    });
  }

  function closeMenu(returnFocus = false) {
    const toggle = $('menu-toggle');
    const navigation = $('mobile-nav');
    if (!toggle || !navigation) return;
    navigation.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) toggle.focus();
  }

  function initNavigation() {
    const toggle = $('menu-toggle');
    const navigation = $('mobile-nav');
    if (toggle && navigation) {
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') !== 'true';
        toggle.setAttribute('aria-expanded', String(open));
        navigation.hidden = !open;
      });
      navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !navigation.hidden) closeMenu(true);
      });
      document.addEventListener('click', event => {
        if (!navigation.hidden && !navigation.contains(event.target) && !toggle.contains(event.target)) closeMenu();
      });
      window.matchMedia('(min-width: 851px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
    }
    document.querySelectorAll('.chat-trigger').forEach(link => {
      link.setAttribute('href', '#contact');
      link.addEventListener('click', event => {
        const contact = $('contact');
        if (!contact) return;
        event.preventDefault();
        closeMenu();
        contact.scrollIntoView({ behavior: motionPreference.matches ? 'auto' : 'smooth', block: 'start' });
        try { history.replaceState(history.state, '', '#contact'); } catch (_) { /* Local preview. */ }
      });
    });
    if (!('IntersectionObserver' in window)) return;
    const links = Array.from(document.querySelectorAll('#section-links a[href^="#"]'));
    const sections = links.map(link => $(link.getAttribute('href').slice(1))).filter(Boolean);
    const visible = new Set();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      const current = sections.filter(section => visible.has(section)).sort((a, b) => Math.abs(a.getBoundingClientRect().top - 120) - Math.abs(b.getBoundingClientRect().top - 120))[0];
      if (!current) return;
      links.forEach(link => {
        const active = link.getAttribute('href') === `#${current.id}`;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-10% 0px -45% 0px', threshold: 0 });
    sections.forEach(section => observer.observe(section));
  }

  function updateTime() {
    const node = $('seoul-time');
    if (!node) return;
    try {
      node.textContent = new Intl.DateTimeFormat(localeNames[language], {
        timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hour12: false,
      }).format(new Date());
    } catch (_) { node.textContent = 'Seoul'; }
  }

  function observeReveals() {
    if (revealObserver) revealObserver.disconnect();
    const nodes = document.querySelectorAll('.reveal');
    if (motionPreference.matches || !('IntersectionObserver' in window)) {
      document.documentElement.classList.remove('motion-ready');
      nodes.forEach(node => node.classList.add('is-visible'));
      return;
    }
    document.documentElement.classList.add('motion-ready');
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
    nodes.forEach(node => {
      if (node.getBoundingClientRect().top < window.innerHeight && node.getBoundingClientRect().bottom > 0) node.classList.add('is-visible');
      else if (!node.classList.contains('is-visible')) revealObserver.observe(node);
    });
  }

  function initScrollEffects() {
    const photo = document.querySelector('#hero-photo img');
    const header = $('header');
    let queued = false;
    function draw() {
      queued = false;
      if (header) header.classList.toggle('is-scrolled', window.scrollY > 16);
      if (photo) {
        const offset = motionPreference.matches ? 0 : Math.min(8, Math.max(0, window.scrollY * 0.018));
        photo.style.translate = `0 ${offset.toFixed(2)}px`;
      }
    }
    window.addEventListener('scroll', () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(draw);
      }
    }, { passive: true });
    motionPreference.addEventListener('change', () => { observeReveals(); draw(); });
    draw();
  }

  buildLanguageSelect();
  initNavigation();
  initDialogs();
  initForm();
  setLanguage(language, false);
  initScrollEffects();
  window.setInterval(updateTime, 60000);
})();
