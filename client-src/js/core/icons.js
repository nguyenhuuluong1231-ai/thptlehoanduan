// Bộ biểu tượng nét (24×24), vẽ tay theo phong cách tuyến tính, không phụ thuộc thư viện ngoài.
const P = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
  calendar: '<rect x="3" y="4.5" width="18" height="16.5" rx="3"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/><path d="M7.5 13.5h2M11 13.5h2M14.5 13.5h2M7.5 17h2M11 17h2"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  award: '<circle cx="12" cy="8.5" r="5.5"/><path d="m8.6 13 -1.6 8 5-2.6 5 2.6-1.6-8"/>',
  grad: '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/><path d="M22 9v6"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.7 2.7L16.5 9.5"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 14h3v3h-3zM20 14v.01M17 20h4M20 17v3M14 20v1"/>',
  scan: '<path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"/><path d="M7 12h10"/>',
  pin: '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  shield: '<path d="M12 2.5 4 5.5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10v-6z"/>',
  shieldCheck: '<path d="M12 2.5 4 5.5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10v-6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  shieldAlert: '<path d="M12 2.5 4 5.5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10v-6z"/><path d="M12 8v4.5M12 16v.01"/>',
  camera: '<path d="M4 7.5h3l1.7-2.5h6.6L17 7.5h3a1.5 1.5 0 0 1 1.5 1.5v9.5A1.5 1.5 0 0 1 20 20H4a1.5 1.5 0 0 1-1.5-1.5V9A1.5 1.5 0 0 1 4 7.5z"/><circle cx="12" cy="13.5" r="3.6"/>',
  alert: '<path d="M10.3 3.9 2.4 17.6A2 2 0 0 0 4.1 20.6h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4.5M12 17v.01"/>',
  alertCircle: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16.2v.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.8v.01"/>',
  heart: '<path d="M12 20.5s-8-4.6-8-11a4.5 4.5 0 0 1 8-2.8 4.5 4.5 0 0 1 8 2.8c0 6.4-8 11-8 11z"/>',
  heartHand: '<path d="M12 20.5s-8-4.6-8-11a4.5 4.5 0 0 1 8-2.8 4.5 4.5 0 0 1 8 2.8c0 6.4-8 11-8 11z"/><path d="M8.5 11h2l1.2-2 1.6 4 1.2-2h1.5"/>',
  smile: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5s1.3 2 3.5 2 3.5-2 3.5-2M9 9.5v.5M15 9.5v.5"/>',
  brain: '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3V4zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3V4z"/><path d="M9 4h6v16H9"/>',
  wind: '<path d="M3 8h10a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7"/>',
  chat: '<path d="M21 12a8.5 8.5 0 0 1-12.4 7.6L3 21l1.4-5.4A8.5 8.5 0 1 1 21 12z"/>',
  chats: '<path d="M16 10a6 6 0 0 1-8.8 5.3L3 16.5l1.2-3.8A6 6 0 1 1 16 10z"/><path d="M18.3 8.2A6 6 0 0 1 20 16.3l1 3.7-3.9-1.2a6 6 0 0 1-6.6-.9"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M21.5 20a6.5 6.5 0 0 0-4-6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  book: '<path d="M4 19.5V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h13"/><path d="M8 7h7"/>',
  bookOpen: '<path d="M2.5 5.5C5 4.5 8.5 4.5 12 6.5c3.5-2 7-2 9.5-1v13c-2.5-1-6-1-9.5 1-3.5-2-7-2-9.5-1z"/><path d="M12 6.5v13"/>',
  phone: '<path d="M5 3h3.5l1.8 4.5-2.3 1.4a11 11 0 0 0 7.1 7.1l1.4-2.3L21 15.5V19a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.5-4.5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  paperclip: '<path d="m20.5 11.5-8.3 8.3a5 5 0 0 1-7.1-7.1l8.6-8.6a3.4 3.4 0 0 1 4.8 4.8l-8.6 8.6a1.7 1.7 0 0 1-2.4-2.4l7.9-7.9"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="1.8"/><path d="m21 15-4.5-4.5L6 21"/>',
  video: '<rect x="2.5" y="6" width="13" height="12" rx="2.5"/><path d="m15.5 10.5 6-3.5v10l-6-3.5"/>',
  music: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash: '<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  refresh: '<path d="M21 12a9 9 0 0 1-15.5 6.2L3 15.5M3 12A9 9 0 0 1 18.5 5.8L21 8.5"/><path d="M21 3.5v5h-5M3 20.5v-5h5"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  chevronLeft: '<path d="m15 6-6 6 6 6"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowLeft: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
  arrowUpRight: '<path d="M7 17 17 7M8 7h9v9"/>',
  send: '<path d="M21.5 2.5 11 13M21.5 2.5 15 21l-4-8-8-4z"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-4.5-4.5L6 21"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  unlock: '<rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7a4 4 0 0 1 7.8-1.3"/>',
  key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.8-9.8M17 6l3 3M14.5 8.5l2 2"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M9.9 5.2A9.8 9.8 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3 3.8M6.6 6.6A16.6 16.6 0 0 0 2 12s3.6 7 10 7a9.8 9.8 0 0 0 5.4-1.6M3 3l18 18M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  filter: '<path d="M3 4.5h18l-7 8.3V19l-4 2v-8.2z"/>',
  bot: '<rect x="4" y="8" width="16" height="12" rx="3.5"/><path d="M12 8V4.5M9 13.5v1M15 13.5v1M2 13v3M22 13v3"/><circle cx="12" cy="3.5" r="1"/>',
  sparkles: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8zM5 2.5l.6 1.4 1.4.6-1.4.6L5 6.5l-.6-1.4L3 4.5l1.4-.6z"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3a3 3 0 0 1-3 4.8M7 5H4a3 3 0 0 0 3 4.8"/>',
  gamepad: '<rect x="2" y="7" width="20" height="11" rx="5.5"/><path d="M7 10.5v4M5 12.5h4M15.5 11.5v.01M18 13.5v.01"/>',
  clipboard: '<rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/>',
  clipboardCheck: '<rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 4V3h6v1"/><path d="m9 13 2 2 4-4.5"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  receipt: '<path d="M5 3h14v18l-2.3-1.5L14.3 21 12 19.5 9.7 21l-2.4-1.5L5 21z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  star: '<path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  link: '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
  card: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6.5 15h3"/>',
  bank: '<path d="M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20.5h18"/>',
  smartphone: '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  message: '<path d="M4 4h16a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 20 17H8l-4.5 3.5V5.5A1.5 1.5 0 0 1 4 4z"/><path d="M7.5 9h9M7.5 12.5h6"/>',
  more: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
  menu: '<path d="M3 6.5h18M3 12h18M3 17.5h18"/>',
  dashboard: '<rect x="3" y="3" width="7.5" height="9" rx="2"/><rect x="13.5" y="3" width="7.5" height="5" rx="2"/><rect x="13.5" y="11" width="7.5" height="10" rx="2"/><rect x="3" y="15" width="7.5" height="6" rx="2"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7.5 15v2M12 10v7M16.5 6v11"/>',
  megaphone: '<path d="M3 10.5v3a1.5 1.5 0 0 0 1.5 1.5H7l7 4.5V4.5L7 9H4.5A1.5 1.5 0 0 0 3 10.5z"/><path d="M17.5 8.5a5 5 0 0 1 0 7M7 15l1.3 5h3l-1.2-4.5"/>',
  palette: '<path d="M12 21a9 9 0 1 1 9-9c0 2.5-2 3.5-4 3.5h-1.8a1.7 1.7 0 0 0-1.2 2.9c.8.8.3 2.6-2 2.6z"/><circle cx="7.5" cy="11" r="1.1"/><circle cx="10.5" cy="7" r="1.1"/><circle cx="15.5" cy="7.5" r="1.1"/>',
  face: '<path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"/><path d="M9 9.5v1M15 9.5v1M12 9.5V13h-1M9 16s1 1.2 3 1.2 3-1.2 3-1.2"/>',
  siren: '<path d="M7 18v-6a5 5 0 0 1 10 0v6"/><path d="M5 21.5h14V20a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2zM12 3V2M20.5 6.5l1-1M3.5 6.5l-1-1M22 12h-1.5M2 12h1.5"/>',
  gavel: '<path d="m14.5 12.5-8 8a2.1 2.1 0 0 1-3-3l8-8"/><path d="m16 16 6-6M8 8l6-6M9 7l8 8M21 11l-8-8"/>',
  news: '<rect x="3" y="4" width="15" height="16" rx="2"/><path d="M18 8h2a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H5M7 8h7M7 12h7M7 16h4"/>',
  external: '<path d="M14 3h7v7M21 3l-9 9M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2.5"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  play: '<path d="M7 4.5v15l12-7.5z"/>',
  pause: '<rect x="6" y="4.5" width="4" height="15" rx="1"/><rect x="14" y="4.5" width="4" height="15" rx="1"/>',
  timer: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 1.5M10 2.5h4M19 6l1.5-1.5"/>',
  crown: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>',
  school: '<path d="M12 3 2 8l10 5 10-5z"/><path d="M5 10v7l7 4 7-4v-7"/>',
  building: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 21v-4h6v4M8 7h2M14 7h2M8 11h2M14 11h2"/>',
  mail: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="m3 6.5 9 6.5 9-6.5"/>',
  bulb: '<path d="M9 18h6M10 21.5h4M12 2.5a6.5 6.5 0 0 0-4 11.6c.7.6 1 1.4 1 2.4h6c0-1 .3-1.8 1-2.4a6.5 6.5 0 0 0-4-11.6z"/>',
  history: '<path d="M3 12a9 9 0 1 0 2.6-6.4L3 8.2"/><path d="M3 3.5v4.7h4.7M12 7.5V12l3 2"/>',
  list: '<path d="M8.5 6h12.5M8.5 12h12.5M8.5 18h12.5M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1.5 14h5M9.5 8h5M17.5 16h5"/>',
  ban: '<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>',
  volumeX: '<path d="M11 5 6 9H2.5v6H6l5 4zM22 9l-6 6M16 9l6 6"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  zap: '<path d="M13 2.5 4 14h7l-1 7.5L19 10h-7z"/>',
  hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
  code: '<path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16"/>',
  wifi: '<path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M2 9a15 15 0 0 1 20 0M12 19.5v.01"/>',
  fingerprint: '<path d="M12 11v3.5c0 2.5-.8 4.5-2 6.5M8.4 6.6A6 6 0 0 1 18 11v1c0 2.5-.3 4.4-1 6.5M6 9.5A6 6 0 0 0 6 12c0 1.7-.3 3-1 4.5M15 14.5c0 1.8-.3 3.5-1 5"/><path d="M5 5.5A9 9 0 0 1 21 11"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  layers: '<path d="m12 2.5 9.5 5-9.5 5-9.5-5z"/><path d="m2.5 12 9.5 5 9.5-5M2.5 16.5l9.5 5 9.5-5"/>',
  route: '<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H16a3.5 3.5 0 0 0 0-7H8a3.5 3.5 0 0 1 0-7h7.5"/>',
  pill: '<path d="M10.5 20.5 3.5 13.5a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7z"/><path d="m8.5 8.5 7 7"/>',
  bomb: '<circle cx="10" cy="14" r="7"/><path d="m15 9 2.5-2.5M18 3.5l.5 2M21 6.5l-2 .5M17.5 6.5l2 2"/>',
  car: '<path d="M5 17h14v-4.5l-1.8-5A2 2 0 0 0 15.3 6H8.7a2 2 0 0 0-1.9 1.5L5 12.5z"/><path d="M5 17v2.5M19 17v2.5M3 12.5h18"/><circle cx="8" cy="14.5" r=".8"/><circle cx="16" cy="14.5" r=".8"/>',
  vape: '<rect x="3" y="9" width="14" height="6" rx="2"/><path d="M17 11h4v2h-4M8 6c0-1.5 1.5-1.5 1.5-3M12 6c0-1.5 1.5-1.5 1.5-3"/>',
  knife: '<path d="M20 4 7 17l-3 1 1-3L18 2z"/><path d="m14 6 4 4"/>',
  scale: '<path d="M12 3v18M7 21h10M5 7h14M5 7l-3 7a3.5 3.5 0 0 0 6 0zM19 7l-3 7a3.5 3.5 0 0 0 6 0z"/>',
  drum: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><path d="M12 6.5v11M6.5 12h11M8.1 8.1l7.8 7.8M15.9 8.1l-7.8 7.8"/>',
};

export function icon(name, cls = '') {
  return `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || P.info}</svg>`;
}

/** Họa tiết vòng trống đồng Đông Sơn (trang trí) */
export function drumArt(size = 520, cls = 'drum') {
  const rays = 14, cx = 100, rays1 = [];
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2, a2 = a + Math.PI / rays;
    rays1.push(`M${cx} ${cx}L${(cx + Math.cos(a - .09) * 26).toFixed(1)} ${(cx + Math.sin(a - .09) * 26).toFixed(1)}L${(cx + Math.cos(a2) * 8).toFixed(1)} ${(cx + Math.sin(a2) * 8).toFixed(1)}Z`);
  }
  const birds = [];
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; const x = cx + Math.cos(a) * 66, y = cx + Math.sin(a) * 66, deg = (a * 180 / Math.PI) + 90; birds.push(`<path transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${deg.toFixed(0)})" d="M-7 2 Q0 -6 7 2 Q0 -1 -7 2Z"/>`); }
  const ticks = [];
  for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2; ticks.push(`M${(cx + Math.cos(a) * 46).toFixed(1)} ${(cx + Math.sin(a) * 46).toFixed(1)}L${(cx + Math.cos(a) * 52).toFixed(1)} ${(cx + Math.sin(a) * 52).toFixed(1)}`); }
  return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 200 200" fill="none" stroke="currentColor" aria-hidden="true">
    <circle cx="100" cy="100" r="98" stroke-width="1"/><circle cx="100" cy="100" r="90" stroke-width=".6" stroke-dasharray="2 3"/>
    <circle cx="100" cy="100" r="78" stroke-width="1"/><circle cx="100" cy="100" r="54" stroke-width=".8"/>
    <circle cx="100" cy="100" r="44" stroke-width=".8"/><circle cx="100" cy="100" r="30" stroke-width=".8"/>
    <path d="${ticks.join('')}" stroke-width=".8"/><g fill="currentColor" stroke="none">${birds.join('')}<path d="${rays1.join('')}"/></g>
  </svg>`;
}

/** Khuôn mặt cảm xúc vẽ bằng SVG */
export function moodFace(key, color) {
  const mouths = { joyful: 'M15 30 Q24 40 33 30', calm: 'M16 31 Q24 35 32 31', stressed: 'M15 32 Q19 28 24 32 Q29 36 33 32', sad: 'M16 34 Q24 27 32 34', anxious: 'M17 33 Q24 29 31 33', exhausted: 'M17 32 H31' };
  const eyes = { joyful: '<path d="M14 20 Q17 16 20 20M28 20 Q31 16 34 20"/>', calm: '<circle cx="17" cy="20" r="2" fill="currentColor"/><circle cx="31" cy="20" r="2" fill="currentColor"/>', stressed: '<path d="M14 18 L20 21M34 18 L28 21"/>', sad: '<path d="M14 21 Q17 18 20 21M28 21 Q31 18 34 21" transform="rotate(180 24 20)"/>', anxious: '<circle cx="17" cy="20" r="2.4"/><circle cx="31" cy="20" r="2.4"/>', exhausted: '<path d="M14 21 H20M28 21 H34"/>' };
  return `<svg viewBox="0 0 48 48" fill="none" stroke="#3a2a10" stroke-width="2.4" stroke-linecap="round" aria-hidden="true" style="color:#3a2a10"><circle cx="24" cy="24" r="21" fill="${color}" stroke="none"/><circle cx="24" cy="24" r="21" fill="url(#mg)" stroke="none" opacity=".35"/>${eyes[key] || ''}<path d="${mouths[key] || mouths.calm}"/>${key === 'stressed' ? '<path d="M36 10 q2 3 0 5" stroke="#5aa9e6"/>' : ''}${key === 'exhausted' ? '<text x="34" y="12" font-size="8" fill="#3a2a10" stroke="none" font-family="sans-serif">z</text>' : ''}<defs><radialGradient id="mg" cx=".3" cy=".25" r=".8"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs></svg>`;
}
