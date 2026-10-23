const _lhD=(s)=>{try{return decodeURIComponent(escape(atob(s)));}catch{return atob(s);}};
import { api, session, setPortal, detect, getMode, live, showError } from './core/api.js?v=mvkrdvxo';
import { icon, drumArt, moodFace } from './core/icons.js?v=mvkrdvxo';
import { openCamera } from './core/camera.js?v=mvkrdvxo';
import { $, $$, esc, toast, modal, confirmDialog, drawer, formData, withBusy, compressImage, editAvatarModal, copyText, empty, skeleton, badge, barChart, gauge, cover, md, store,
fmtDate, fmtTime, fmtDateTime, ago, vnd, num, greeting, firstName, avatar, idCard, initTheme, initDevToolsGuard, toggleTheme, DAY, DAY_SHORT, sleep, attachmentsHtml, attachComposer, canInstall, installApp, isStandalone, isNativeApp, fileUrl, renderAppGuide, renderAboutPage } from './core/ui.js?v=mvkrdvxo';
setPortal(_lhD("c3R1ZGVudA=="));
initTheme(); initDevToolsGuard();
const S = { user: null, settings: null, unread: 0, badges: null, cleanups: [] };
const root = $(_lhD("I3Jvb3Q="));
const NAV = [
{ group: _lhD("VOG7lW5nIHF1YW4="), items: [
{ id: _lhD("aG9tZQ=="), label: _lhD("VHJhbmcgY2jhu6c="), icon: _lhD("aG9tZQ==") },
] },
{ group: _lhD("S+G6v3QgbuG7kWk="), items: [
{ id: _lhD("Y291bnNlbGluZw=="), label: _lhD("Q2hhdCB0xrAgduG6pW4gdMOibSBsw70="), icon: _lhD("aGVhcnRIYW5k"), module: _lhD("Y291bnNlbGluZw==") },
{ id: _lhD("c2Nob29sLWNoYXQ="), label: _lhD("Q2hhdCB0b8OgbiB0csaw4budbmc="), icon: _lhD("Y2hhdHM="), module: _lhD("c2Nob29sQ2hhdA==") },
{ id: _lhD("dGVhY2hlci1jaGF0"), label: _lhD("Q2hhdCB24bubaSBnacOhbyB2acOqbg=="), icon: _lhD("bWVzc2FnZQ=="), module: _lhD("dGVhY2hlckNoYXQ=") },
{ id: _lhD("dGVhY2hlci1saXN0"), label: _lhD("RGFuaCBzw6FjaCBnacOhbyB2acOqbg=="), icon: _lhD("c2Nob29s"), module: _lhD("dGVhY2hlckNoYXQ=") },
{ id: _lhD("cXVpeg=="), label: _lhD("xJDhuqV1IHRyxrDhu51uZyB0cuG6r2MgbmdoaeG7h20="), icon: _lhD("dHJvcGh5"), module: _lhD("cXVpeg==") },
{ id: _lhD("c3VydmV5"), label: _lhD("S2jhuqNvIHPDoXQ="), icon: _lhD("Y2xpcGJvYXJkQ2hlY2s="), module: _lhD("c3VydmV5") },
] },
{ group: _lhD("QW4gdG/DoG4gJiB0w6JtIGzDvQ=="), items: [
{ id: _lhD("cmVwb3J0"), label: _lhD("VOG7kSBnacOhYyB2aSBwaOG6oW0="), icon: _lhD("c2hpZWxkQWxlcnQ="), module: _lhD("cmVwb3J0") },
{ id: _lhD("Y291bnNlbC10ZWFt"), label: _lhD("VOG7lSB0w6JtIGzDvQ=="), icon: _lhD("dXNlcnM="), module: _lhD("Y291bnNlbGluZw==") },
{ id: _lhD("bW9vZA=="), label: _lhD("Q+G6o20geMO6YyAmIHRoxrAgZ2nDo24="), icon: _lhD("c21pbGU=") },
{ id: _lhD("aGFuZGJvb2s="), label: _lhD("Q+G6qW0gbmFuZyAmIMSRxrDhu51uZyBkw6J5IG7Ds25n"), icon: _lhD("Ym9va09wZW4=") },
{ id: _lhD("bmV3cw=="), label: _lhD("QuG6o24gdGluIHR1ecOqbiB0cnV54buBbg=="), icon: _lhD("bmV3cw==") },
] },
{ group: _lhD("VHLDrSB0deG7hyBuaMOibiB04bqhbw=="), items: [
{ id: _lhD("c2NhbQ=="), label: _lhD("VHJhIGPhu6l1IGzhu6thIMSR4bqjbyBBSQ=="), icon: _lhD("c2hpZWxkQ2hlY2s="), module: _lhD("c2NhbQ==") },
{ id: _lhD("YWk="), label: _lhD("VHLhu6MgbMO9IGjhu41jIMSRxrDhu51uZyBBSQ=="), icon: _lhD("Ym90"), module: _lhD("YWlDaGF0") },
{ id: _lhD("YXBwLWd1aWRl"), label: _lhD("SMaw4bubbmcgZOG6q24gdOG6o2kgQXBw"), icon: _lhD("c21hcnRwaG9uZQ==") },
{ id: _lhD("YWJvdXQ="), label: _lhD("R2nhu5tpIHRoaeG7h3UgdHJhbmcgd2Vi"), icon: _lhD("aW5mbw==") },
] },
];
const ALL = NAV.flatMap(g => g.items).concat([{ id: _lhD("cHJvZmlsZQ=="), label: _lhD("SOG7kyBzxqEgY8OhIG5ow6Ju"), icon: _lhD("dXNlcg==") }, { id: _lhD("aW5ib3g="), label: _lhD("VGluIG5o4bqvbg=="), icon: _lhD("Y2hhdHM=") }]);
const compact = () => matchMedia(_lhD("KG1heC13aWR0aDogNzYwcHgp")).matches;
const ROOT_TABS = [_lhD("aG9tZQ=="), _lhD("aW5ib3g="), _lhD("cmVwb3J0"), _lhD("YWk="), _lhD("cHJvZmlsZQ==")];
const CHAT_PAGES = [_lhD("aW5ib3g="), _lhD("c2Nob29sLWNoYXQ="), _lhD("dGVhY2hlci1jaGF0"), _lhD("Y291bnNlbGluZw==")];
const enabled = (it) => !it.module || S.settings?.modules?.[it.module] !== false;
const go = (page) => { if (location.hash !== _lhD("Iw==") + page) location.hash = page; else render(); };
const studentLoginUrl = () => (window.self !== window.top || /[?&]mobile/.test(location.search) ? _lhD("aW5kZXguaHRtbD9tb2JpbGU9MQ==") : (isNativeApp() || getMode() !== _lhD("c2VydmVy") ? _lhD("Li8=") : _lhD("L2xvZ2luaG9jaW5o")));
async function boot() {
root.innerHTML = _lhD("PGRpdiBzdHlsZT0ibWluLWhlaWdodDoxMDB2aDtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2dhcDoxNnB4O3BhZGRpbmc6MjRweDt0ZXh0LWFsaWduOmNlbnRlciI+PGltZyBzcmM9ImFzc2V0cy9zY2hvb2xfbG9nby5wbmciIGFsdD0iVHLGsOG7nW5nIFRIUFQgTMOqIEhvw6BuIiBzdHlsZT0id2lkdGg6OTZweDtoZWlnaHQ6OTZweDtvYmplY3QtZml0OmNvbnRhaW47Ym9yZGVyLXJhZGl1czo1MCU7YmFja2dyb3VuZDojZmZmO3BhZGRpbmc6NnB4O2JveC1zaGFkb3c6MCAxMnB4IDMycHggcmdiYSgyMyw3MSwyMDEsLjI4KSI+PGRpdiBzdHlsZT0iZm9udC13ZWlnaHQ6NzAwO2ZvbnQtc2l6ZToxNnB4Ij5Ucsaw4budbmcgVEhQVCBMw6ogSG/DoG48L2Rpdj48ZGl2IGNsYXNzPSJza2VsIiBzdHlsZT0id2lkdGg6MTgwcHg7aGVpZ2h0OjhweDtib3JkZXItcmFkaXVzOjk5cHgiPjwvZGl2PjwvZGl2Pg==");
await detect();
if (!session.token) return (location.href = studentLoginUrl());
try {
const [{ user }, settings] = await Promise.all([api.get(_lhD("YXBpL2F1dGgvbWU=")), api.get(_lhD("YXBpL3NldHRpbmdzL3B1YmxpYw=="))]);
if (user.role !== _lhD("c3R1ZGVudA==")) return (location.href = _lhD("YWRtaW4uaHRtbA=="));
S.user = user; S.settings = settings;
} catch { return (location.href = studentLoginUrl()); }
enterApp();
}
function enterApp() {
if (S.user.mustChangePassword) return gateChangePassword();
if (S.user.profileComplete === false) return gateCompleteProfile();
shell();
live.connect();
bindLive();
refreshBadges(0);
addEventListener(_lhD("aGFzaGNoYW5nZQ=="), render);
render();
}
function gateChangePassword() {
document.body.classList.remove(_lhD("aGFzLXRhYmJhcg=="));
root.innerHTML = `${_lhD("CiAgPGRpdiBzdHlsZT0ibWluLWhlaWdodDoxMDB2aDtkaXNwbGF5OmdyaWQ7cGxhY2UtaXRlbXM6Y2VudGVyO3BhZGRpbmc6MjRweCI+CiAgICA8Zm9ybSBpZD0iZ3B3IiBjbGFzcz0iY2FyZCIgc3R5bGU9Im1heC13aWR0aDo0MjBweDt3aWR0aDoxMDAlIj4KICAgICAgPGRpdiBjbGFzcz0iY2FyZC1oZWFkIj48aDI+")}${icon(_lhD("a2V5"))}${_lhD("IMSQ4buVaSBt4bqtdCBraOG6qXUgbOG6p24gxJHhuqd1PC9oMj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iY2FyZC1ib2R5IHN0YWNrIj4KICAgICAgICA8cCBjbGFzcz0ic21hbGwgbXV0ZWQiPlTDoGkga2hv4bqjbiBj4bunYSBi4bqhbiDEkWFuZyBkw7luZyBt4bqtdCBraOG6qXUgbeG6t2MgxJHhu4tuaC4gVnVpIGzDsm5nIMSR4bq3dCBt4bqtdCBraOG6qXUgbeG7m2kgdHLGsOG7m2Mga2hpIHRp4bq/cCB04bulYyBz4butIGThu6VuZy48L3A+CiAgICAgICAgPGRpdiBjbGFzcz0iZmllbGQiPjxsYWJlbCBmb3I9ImdjcCI+TeG6rXQga2jhuql1IGhp4buHbiB04bqhaTwvbGFiZWw+PGlucHV0IGlkPSJnY3AiIG5hbWU9ImN1cnJlbnRQYXNzd29yZCIgdHlwZT0icGFzc3dvcmQiIGF1dG9jb21wbGV0ZT0iY3VycmVudC1wYXNzd29yZCIgcmVxdWlyZWQ+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0iZmllbGQiPjxsYWJlbCBmb3I9ImducCI+TeG6rXQga2jhuql1IG3hu5tpPC9sYWJlbD48aW5wdXQgaWQ9ImducCIgbmFtZT0ibmV3UGFzc3dvcmQiIHR5cGU9InBhc3N3b3JkIiBhdXRvY29tcGxldGU9Im5ldy1wYXNzd29yZCIgbWlubGVuZ3RoPSI2IiByZXF1aXJlZD48c3BhbiBjbGFzcz0iaGludCI+w410IG5o4bqldCA2IGvDvSB04buxLCBuw6puIGvhur90IGjhu6NwIGNo4buvLCBz4buRIHbDoCBrw70gdOG7sSDEkeG6t2MgYmnhu4d0Ljwvc3Bhbj48L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJmaWVsZCI+PGxhYmVsIGZvcj0iZ25wMiI+Tmjhuq1wIGzhuqFpIG3huq10IGto4bqpdSBt4bubaTwvbGFiZWw+PGlucHV0IGlkPSJnbnAyIiB0eXBlPSJwYXNzd29yZCIgYXV0b2NvbXBsZXRlPSJuZXctcGFzc3dvcmQiIHJlcXVpcmVkPjwvZGl2PgogICAgICA8L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iY2FyZC1mb290Ij48YnV0dG9uIGNsYXNzPSJidG4gYmxvY2siIGlkPSJncHdiIj4=")}${icon(_lhD("Y2hlY2s="))}${_lhD("IMSQ4buVaSBt4bqtdCBraOG6qXUgJiB0aeG6v3AgdOG7pWM8L2J1dHRvbj48L2Rpdj4KICAgIDwvZm9ybT4KICA8L2Rpdj4=")}`;
$(_lhD("I2dwdw==")).onsubmit = (e) => {
e.preventDefault();
const f = formData(e.target);
if (f.newPassword !== $(_lhD("I2ducDI=")).value) return toast(_lhD("TeG6rXQga2jhuql1IG5o4bqtcCBs4bqhaSBraMO0bmcga2jhu5twLg=="), _lhD("d2Fybg=="));
withBusy($(_lhD("I2dwd2I=")), async () => {
try {
const r = await api.post(_lhD("YXBpL2F1dGgvY2hhbmdlLXBhc3N3b3Jk"), f);
session.set(r.token, true);
S.user.mustChangePassword = false;
toast(_lhD("xJDDoyDEkeG7lWkgbeG6rXQga2jhuql1Lg=="), _lhD("b2s="));
enterApp();
} catch (er) { showError(er); }
});
};
}
function gateCompleteProfile() {
document.body.classList.remove(_lhD("aGFzLXRhYmJhcg=="));
root.innerHTML = _lhD("PGRpdiBzdHlsZT0ibWluLWhlaWdodDoxMDB2aDtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2dhcDoxNnB4O3BhZGRpbmc6MjRweDt0ZXh0LWFsaWduOmNlbnRlciI+PGltZyBzcmM9ImFzc2V0cy9zY2hvb2xfbG9nby5wbmciIGFsdD0iVHLGsOG7nW5nIFRIUFQgTMOqIEhvw6BuIiBzdHlsZT0id2lkdGg6OTZweDtoZWlnaHQ6OTZweDtvYmplY3QtZml0OmNvbnRhaW47Ym9yZGVyLXJhZGl1czo1MCU7YmFja2dyb3VuZDojZmZmO3BhZGRpbmc6NnB4O2JveC1zaGFkb3c6MCAxMnB4IDMycHggcmdiYSgyMyw3MSwyMDEsLjI4KSI+PGRpdiBzdHlsZT0iZm9udC13ZWlnaHQ6NzAwO2ZvbnQtc2l6ZToxNnB4Ij5Ucsaw4budbmcgVEhQVCBMw6ogSG/DoG48L2Rpdj48ZGl2IGNsYXNzPSJza2VsIiBzdHlsZT0id2lkdGg6MTgwcHg7aGVpZ2h0OjhweDtib3JkZXItcmFkaXVzOjk5cHgiPjwvZGl2PjwvZGl2Pg==");
api.get(_lhD("YXBpL2NsYXNzZXM=")).then(({ items }) => {
root.innerHTML = `${_lhD("CiAgICA8ZGl2IHN0eWxlPSJtaW4taGVpZ2h0OjEwMHZoO2Rpc3BsYXk6Z3JpZDtwbGFjZS1pdGVtczpjZW50ZXI7cGFkZGluZzoyNHB4Ij4KICAgICAgPGZvcm0gaWQ9ImdwZiIgY2xhc3M9ImNhcmQiIHN0eWxlPSJtYXgtd2lkdGg6NDYwcHg7d2lkdGg6MTAwJSI+CiAgICAgICAgPGRpdiBjbGFzcz0iY2FyZC1oZWFkIj48aDI+")}${icon(_lhD("dXNlcg=="))}${_lhD("IEhvw6BuIHThuqV0IGjhu5Mgc8ahPC9oMj48L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJjYXJkLWJvZHkgc3RhY2siPgogICAgICAgICAgPHAgY2xhc3M9InNtYWxsIG11dGVkIj5Uw6BpIGtob+G6o24gY+G7p2EgYuG6oW4gY2jGsGEgY8OzIMSR4bqneSDEkeG7pyB0aMO0bmcgdGluLiBWdWkgbMOybmcgxJFp4buBbiB0csaw4bubYyBraGkgc+G7rSBk4bulbmcg4bupbmcgZOG7pW5nLjwvcD4KICAgICAgICAgIDxkaXYgY2xhc3M9ImZpZWxkIj48bGFiZWwgZm9yPSJnZm5hbWUiPkjhu40gdsOgIHTDqm48L2xhYmVsPjxpbnB1dCBpZD0iZ2ZuYW1lIiBuYW1lPSJuYW1lIiByZXF1aXJlZCBtYXhsZW5ndGg9IjgwIiBwbGFjZWhvbGRlcj0iTmd1eeG7hW4gVsSDbiBBIj48L2Rpdj4KICAgICAgICAgIDxkaXYgY2xhc3M9ImZpZWxkIj48bGFiZWwgZm9yPSJnZmNsYXNzIj5M4bubcDwvbGFiZWw+PHNlbGVjdCBpZD0iZ2ZjbGFzcyIgbmFtZT0iY2xhc3NJZCIgcmVxdWlyZWQ+PG9wdGlvbiB2YWx1ZT0iIj7igJQgQ2jhu41uIGzhu5twIOKAlDwvb3B0aW9uPg==")}${items.map(c => `${_lhD("PG9wdGlvbiB2YWx1ZT0i")}${esc(c.id)}${_lhD("Ij4=")}${esc(c.name)}${_lhD("PC9vcHRpb24+")}`).join('')}${_lhD("PC9zZWxlY3Q+PC9kaXY+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJmaWVsZCI+PGxhYmVsIGZvcj0iZ2ZnZW5kZXIiPkdp4bubaSB0w61uaDwvbGFiZWw+PHNlbGVjdCBpZD0iZ2ZnZW5kZXIiIG5hbWU9ImdlbmRlciI+PG9wdGlvbiB2YWx1ZT0iIj7igJQ8L29wdGlvbj48b3B0aW9uPk5hbTwvb3B0aW9uPjxvcHRpb24+TuG7rzwvb3B0aW9uPjwvc2VsZWN0PjwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzcz0iZmllbGQiPjxsYWJlbCBmb3I9ImdmZG9iIj5OZ8OgeSBzaW5oPC9sYWJlbD48aW5wdXQgaWQ9ImdmZG9iIiBuYW1lPSJkb2IiIHR5cGU9ImRhdGUiPjwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzcz0iZmllbGQiPjxsYWJlbCBmb3I9ImdmZW1haWwiPkVtYWlsIChraMO0bmcgYuG6r3QgYnXhu5ljKTwvbGFiZWw+PGlucHV0IGlkPSJnZmVtYWlsIiBuYW1lPSJlbWFpbCIgdHlwZT0iZW1haWwiIHBsYWNlaG9sZGVyPSJ0ZW5iYW5AZ21haWwuY29tIj48L2Rpdj4KICAgICAgICAgIDxkaXYgY2xhc3M9ImZpZWxkIj48bGFiZWwgZm9yPSJnZnBob25lIj5T4buRIMSRaeG7h24gdGhv4bqhaSAoa2jDtG5nIGLhuq90IGJ14buZYyk8L2xhYmVsPjxpbnB1dCBpZD0iZ2ZwaG9uZSIgbmFtZT0icGhvbmUiIGlucHV0bW9kZT0idGVsIiBwbGFjZWhvbGRlcj0iMDl4eCB4eHggeHh4Ij48L2Rpdj4KICAgICAgICA8L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJjYXJkLWZvb3QiPjxidXR0b24gY2xhc3M9ImJ0biBibG9jayIgaWQ9ImdwZmIiPg==")}${icon(_lhD("Y2hlY2s="))}${_lhD("IEzGsHUgJiB2w6BvIOG7qW5nIGThu6VuZzwvYnV0dG9uPjwvZGl2PgogICAgICA8L2Zvcm0+CiAgICA8L2Rpdj4=")}`;
$(_lhD("I2dwZg==")).onsubmit = (e) => {
e.preventDefault();
withBusy($(_lhD("I2dwZmI=")), async () => {
try {
const r = await api.put(_lhD("YXBpL2F1dGgvY29tcGxldGUtcHJvZmlsZQ=="), formData(e.target));
S.user = r.user;
toast(_lhD("xJDDoyBsxrB1IHRow7RuZyB0aW4uIENow6BvIG3hu6tuZyBi4bqhbiE="), _lhD("b2s="));
enterApp();
} catch (er) { showError(er); }
});
};
}).catch(showError);
}
function openMyAvatarEditor(after) {
editAvatarModal(S.user, async (data) => {
const r = await api.put(_lhD("YXBpL3Byb2ZpbGU="), { avatar: data });
S.user = r.user;
toast(data ? _lhD("xJDDoyBj4bqtcCBuaOG6rXQg4bqjbmggxJHhuqFpIGRp4buHbi4=") : _lhD("xJDDoyB4w7NhIOG6o25oIMSR4bqhaSBkaeG7h24u"), _lhD("b2s="));
shell();
if (after) after(r.user); else render();
});
}
function bindAvatarCam(btn, onOpen = () => openMyAvatarEditor()) {
if (!btn) return;
btn.onclick = (e) => {
e.stopPropagation();
const camHit = e.target.closest(_lhD("Lm0tdXNlci1jYW0sIC50b3AtYXYtY2Ft"));
if (btn.classList.contains(_lhD("c2hvdy1jYW0=")) || camHit) {
btn.classList.remove(_lhD("c2hvdy1jYW0="));
onOpen();
} else {
$$(_lhD("LnNob3ctY2Ft")).forEach(el => el.classList.remove(_lhD("c2hvdy1jYW0=")));
btn.classList.add(_lhD("c2hvdy1jYW0="));
}
};
}
document.addEventListener(_lhD("Y2xpY2s="), (e) => {
if (!e.target.closest(_lhD("Lm0tdXNlci1hdiwgLnRvcC1hdi1idG4="))) $$(_lhD("LnNob3ctY2Ft")).forEach(el => el.classList.remove(_lhD("c2hvdy1jYW0=")));
});
function shell() {
const u = S.user, s = S.settings;
document.body.classList.add(_lhD("aGFzLXRhYmJhcg=="));
root.innerHTML = `${_lhD("CiAgPGRpdiBjbGFzcz0ic2hlbGwiPgogICAgPGFzaWRlIGNsYXNzPSJzaWRlYmFyIj4KICAgICAgPGEgY2xhc3M9ImJyYW5kIiBocmVmPSIjaG9tZSI+PGltZyBzcmM9Ig==")}${esc(s.logo)}${_lhD("IiBhbHQ9IiI+PGRpdj48Yj4=")}${esc(s.schoolName || s.shortName)}${_lhD("PC9iPjxzcGFuPkPhu5VuZyBI4buNYyBTaW5oPC9zcGFuPjwvZGl2PjwvYT4KICAgICAgPGRpdiBjbGFzcz0iY2FyZCBzaWRlLXVzZXIiPgogICAgICAgIDxidXR0b24gdHlwZT0iYnV0dG9uIiBpZD0ic2lkZUF2IiBjbGFzcz0ibS11c2VyLWF2IiB0aXRsZT0iQuG6pW0gxJHhu4MgY2jhu4luaCBz4butYSDhuqNuaCDEkeG6oWkgZGnhu4duIj4=")}${avatar(u)}${_lhD("PHNwYW4gY2xhc3M9Im0tdXNlci1jYW0iPg==")}${icon(_lhD("Y2FtZXJh"))}${_lhD("PC9zcGFuPjwvYnV0dG9uPgogICAgICAgIDxhIGhyZWY9IiNwcm9maWxlIiBjbGFzcz0ibS11c2VyLWluZm8iPgogICAgICAgICAgPGIgY2xhc3M9InRydW5jYXRlIj4=")}${esc(u.name)}${_lhD("PC9iPgogICAgICAgICAgPGRpdiBjbGFzcz0ibS11c2VyLXBpbGxzIj4KICAgICAgICAgICAg")}${u.className || u.classId ? `${_lhD("PHNwYW4gY2xhc3M9Im0tdXNlci1waWxsIGJyYW5kIj4=")}${esc(u.className || u.classId)}${_lhD("PC9zcGFuPg==")}` : ''}${_lhD("CiAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJtLXVzZXItcGlsbCBtb25vIj4=")}${esc(u.id)}${_lhD("PC9zcGFuPgogICAgICAgICAgPC9kaXY+CiAgICAgICAgPC9hPgogICAgICAgIDxhIGhyZWY9IiNwcm9maWxlIiBjbGFzcz0ibS11c2VyLWdvIiBhcmlhLWxhYmVsPSJI4buTIHPGoSI+")}${icon(_lhD("Y2hldnJvblJpZ2h0"))}${_lhD("PC9hPgogICAgICA8L2Rpdj4KICAgICAg")}${NAV.map(g => { const items = g.items.filter(enabled); return items.length ? `${_lhD("PGRpdiBjbGFzcz0ibmF2LWxhYmVsIGV5ZWJyb3ciPg==")}${g.group}${_lhD("PC9kaXY+PG5hdiBjbGFzcz0ibmF2Ij4=")}${items.map(it => `${_lhD("PGEgaHJlZj0iIw==")}${it.id}${_lhD("IiBkYXRhLW5hdj0i")}${it.id}${_lhD("Ij4=")}${icon(it.icon)}${_lhD("PHNwYW4+")}${it.label}${_lhD("PC9zcGFuPjxzcGFuIGNsYXNzPSJjb3VudCIgZGF0YS1jb3VudD0i")}${it.id}${_lhD("IiBoaWRkZW4+PC9zcGFuPjwvYT4=")}`).join('')}${_lhD("PC9uYXY+")}` : ''; }).join('')}${_lhD("CiAgICAgIDxkaXYgY2xhc3M9InNpZGViYXItZm9vdCI+CiAgICAgICAgPGEgY2xhc3M9InNpZGUtc29zIiBocmVmPSJ0ZWw6MTExIj4KICAgICAgICAgIDxzcGFuIGNsYXNzPSJzaWRlLXNvcy1pY28iPg==")}${icon(_lhD("cGhvbmU="))}${_lhD("PC9zcGFuPgogICAgICAgICAgPGRpdiBjbGFzcz0iZ3JvdyI+PGIgY2xhc3M9InNtYWxsIj5D4bqnbiBnacO6cCDEkeG7oSBraOG6qW4gY+G6pXA/PC9iPjxkaXYgY2xhc3M9InhzIG11dGVkIj5U4buVbmcgxJHDoGkgYuG6o28gduG7hyB0cuG6uyBlbSAyNC83PC9kaXY+PC9kaXY+CiAgICAgICAgICA8c3BhbiBjbGFzcz0ic2lkZS1zb3MtbnVtIj4xMTE8L3NwYW4+CiAgICAgICAgPC9hPgogICAgICAgIDxkaXYgY2xhc3M9InJvdyBub3dyYXAiPjxidXR0b24gY2xhc3M9ImJ0biBnaG9zdCBzbSBncm93IiBpZD0idGhlbWVCdG4iPg==")}${icon(_lhD("bW9vbg=="))}${_lhD("IEdpYW8gZGnhu4duPC9idXR0b24+PGJ1dHRvbiBjbGFzcz0iYnRuIGdob3N0IHNtIGdyb3ciIGlkPSJsb2dvdXRCdG4iPg==")}${icon(_lhD("bG9nb3V0"))}${_lhD("IMSQxINuZyB4deG6pXQ8L2J1dHRvbj48L2Rpdj4KICAgICAgPC9kaXY+CiAgICA8L2FzaWRlPgogICAgPGRpdiBjbGFzcz0ibWFpbiI+CiAgICAgIDxoZWFkZXIgY2xhc3M9Im1vYmlsZWJhciIgaWQ9Im1iYXIiPgogICAgICAgIDxidXR0b24gY2xhc3M9Imljb24tYnRuIG1iLWJhY2siIGlkPSJtYkJhY2siIGFyaWEtbGFiZWw9IlF1YXkgbOG6oWkiPg==")}${icon(_lhD("YXJyb3dMZWZ0"))}${_lhD("PC9idXR0b24+CiAgICAgICAgPGltZyBjbGFzcz0ibWItbG9nbyIgc3JjPSI=")}${esc(s.logo)}${_lhD("IiBhbHQ9IiI+PGRpdiBjbGFzcz0iZ3JvdyBtYi10aXRsZSI+PGIgaWQ9Im1iVGl0bGUiPg==")}${esc(s.schoolName || s.shortName)}${_lhD("PC9iPjxzcGFuIGlkPSJtYlN1YiI+Q+G7lW5nIEjhu41jIFNpbmg8L3NwYW4+PC9kaXY+CiAgICAgICAgPGJ1dHRvbiBjbGFzcz0iaWNvbi1idG4iIGRhdGEtYmVsbCBhcmlhLWxhYmVsPSJUaMO0bmcgYsOhbyI+")}${icon(_lhD("YmVsbA=="))}${_lhD("PHNwYW4gY2xhc3M9ImRvdCIgZGF0YS1kb3QgaGlkZGVuPjwvc3Bhbj48L2J1dHRvbj4KICAgICAgPC9oZWFkZXI+CiAgICAgIDxoZWFkZXIgY2xhc3M9InRvcGJhciBkZXNrdG9wLW9ubHkiPgogICAgICAgIDxkaXYgY2xhc3M9InNlYXJjaCIgaWQ9ImZpbmRlciI+PHNwYW4+")}${icon(_lhD("c2VhcmNo"))}${_lhD("PC9zcGFuPjxpbnB1dCBwbGFjZWhvbGRlcj0iVMOsbSBuaGFuaCBjaOG7qWMgbsSDbmc6IHThu5EgZ2nDoWMsIGto4bqjbyBzw6F0LCB0cuG7oyBsw70gQUnigKYiIGFyaWEtbGFiZWw9IlTDrG0gY2jhu6ljIG7Eg25nIiBpZD0iZmluZGVySW5wdXQiIGF1dG9jb21wbGV0ZT0ib2ZmIj48a2JkIGNsYXNzPSJzZWFyY2gta2JkIj4vPC9rYmQ+PGRpdiBjbGFzcz0iY2FyZCIgaWQ9ImZpbmRlckxpc3QiIGhpZGRlbiBzdHlsZT0icG9zaXRpb246YWJzb2x1dGU7dG9wOjQ4cHg7bGVmdDowO3JpZ2h0OjA7cGFkZGluZzo2cHg7ei1pbmRleDo1O2JveC1zaGFkb3c6dmFyKC0tc2hhZG93LTIpIj48L2Rpdj48L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJzcGFjZXIiPjwvZGl2PgogICAgICAgIDxzcGFuIGNsYXNzPSJ0b3AtbWV0YS1waWxsIj4=")}${icon(_lhD("Y2FsZW5kYXI="))} ${esc(s.semester || _lhD("SOG7jWMga+G7syBJ"))}${_lhD("IMK3IA==")}${esc(s.schoolYear || '')}${_lhD("PC9zcGFuPgogICAgICAgIDxidXR0b24gY2xhc3M9Imljb24tYnRuIiBkYXRhLWJlbGwgYXJpYS1sYWJlbD0iVGjDtG5nIGLDoW8iPg==")}${icon(_lhD("YmVsbA=="))}${_lhD("PHNwYW4gY2xhc3M9ImRvdCIgZGF0YS1kb3QgaGlkZGVuPjwvc3Bhbj48L2J1dHRvbj4KICAgICAgICA8ZGl2IGNsYXNzPSJ0b3AtdXNlci1jaGlwIj4KICAgICAgICAgIDxidXR0b24gdHlwZT0iYnV0dG9uIiBpZD0idG9wQXYiIGNsYXNzPSJ0b3AtYXYtYnRuIiB0aXRsZT0iQuG6pW0gxJHhu4MgY2jhu4luaCBz4butYSDhuqNuaCDEkeG6oWkgZGnhu4duIj4=")}${avatar(u, _lhD("c20="))}${_lhD("PHNwYW4gY2xhc3M9InRvcC1hdi1jYW0iPg==")}${icon(_lhD("Y2FtZXJh"))}${_lhD("PC9zcGFuPjwvYnV0dG9uPgogICAgICAgICAgPGEgaHJlZj0iI3Byb2ZpbGUiIGNsYXNzPSJ0b3AtdXNlci1tZXRhIj48YiBjbGFzcz0idHJ1bmNhdGUiPg==")}${esc(u.name)}${_lhD("PC9iPjxzcGFuPkzhu5twIA==")}${esc(u.className || u.classId || '')}${_lhD("PC9zcGFuPjwvYT4KICAgICAgICA8L2Rpdj4KICAgICAgPC9oZWFkZXI+CiAgICAgIDxtYWluIGlkPSJ2aWV3IiBjbGFzcz0icGFnZSIgdGFiaW5kZXg9Ii0xIj48L21haW4+CiAgICA8L2Rpdj4KICA8L2Rpdj4KICA8bmF2IGNsYXNzPSJ0YWJiYXIiIGFyaWEtbGFiZWw9IsSQaeG7gXUgaMaw4bubbmcgbmhhbmgiPgogICAgPGEgaHJlZj0iI2hvbWUiIGRhdGEtdGFiPSJob21lIj4=")}${icon(_lhD("aG9tZQ=="))}${_lhD("PHNwYW4+VHJhbmcgY2jhu6c8L3NwYW4+PC9hPgogICAgPGEgaHJlZj0iI2luYm94IiBkYXRhLXRhYj0iaW5ib3giPjxzcGFuIGNsYXNzPSJ0aWNvIj4=")}${icon(_lhD("Y2hhdHM="))}${_lhD("PHNwYW4gY2xhc3M9ImNvdW50IHRjb3VudCIgZGF0YS1jb3VudD0iaW5ib3giIGhpZGRlbj48L3NwYW4+PC9zcGFuPjxzcGFuPlRpbiBuaOG6r248L3NwYW4+PC9hPgogICAgPGEgaHJlZj0iI3JlcG9ydCIgZGF0YS10YWI9InJlcG9ydCIgY2xhc3M9ImZhYiI+PHNwYW4gY2xhc3M9ImZhYi1pY28iPg==")}${icon(_lhD("Y2FtZXJh"))}${_lhD("PC9zcGFuPjxzcGFuPlThu5EgZ2nDoWM8L3NwYW4+PC9hPgogICAgPGEgaHJlZj0iI2FpIiBkYXRhLXRhYj0iYWkiPg==")}${icon(_lhD("Ym90"))}${_lhD("PHNwYW4+VHLhu6MgbMO9IEFJPC9zcGFuPjwvYT4KICAgIDxhIGhyZWY9IiNwcm9maWxlIiBkYXRhLXRhYj0icHJvZmlsZSI+")}${icon(_lhD("dXNlcg=="))}${_lhD("PHNwYW4+Q8OhIG5ow6JuPC9zcGFuPjwvYT4KICA8L25hdj4KICA=")}${getMode() === _lhD("ZGVtbw==") ? _lhD("PGRpdiBjbGFzcz0iZGVtby1yaWJib24iPjxpPjwvaT5C4bqjbiB4ZW0gdHLGsOG7m2M8L2Rpdj4=") : ''}`;
$(_lhD("I3RoZW1lQnRu")).onclick = toggleTheme;
$(_lhD("I2xvZ291dEJ0bg==")).onclick = logout;
bindAvatarCam($(_lhD("I3NpZGVBdg==")));
bindAvatarCam($(_lhD("I3RvcEF2")));
$(_lhD("W2RhdGEtdGFiPSJyZXBvcnQiXQ==")).onclick = (e) => { e.preventDefault(); reportCamera(); };
$(_lhD("I21iQmFjaw==")).onclick = () => { if (history.length > 1) history.back(); else go(CHAT_PAGES.includes(curPage()) ? _lhD("aW5ib3g=") : _lhD("aG9tZQ==")); };
if (!S.shellBound) {
S.shellBound = true;
let wasCompact = compact();
addEventListener(_lhD("cmVzaXpl"), () => { const c = compact(); if (c !== wasCompact) { wasCompact = c; if (curPage() === _lhD("aG9tZQ==")) render(); } }, { passive: true });
addEventListener(_lhD("c2Nyb2xs"), () => $(_lhD("LnRvcGJhcg=="))?.classList.toggle(_lhD("c2Nyb2xsZWQ="), scrollY > 4), { passive: true });
}
$$(_lhD("W2RhdGEtYmVsbF0=")).forEach(b => b.onclick = openNotifications);
const fi = $(_lhD("I2ZpbmRlcklucHV0")), fl = $(_lhD("I2ZpbmRlckxpc3Q="));
const showFinder = () => {
const q = fi.value.trim().toLowerCase();
const m = ALL.filter(enabled).filter(it => !q || it.label.toLowerCase().includes(q)).slice(0, 7);
fl.innerHTML = m.map((it, i) => `${_lhD("PGEgY2xhc3M9Iml0ZW0gY2xpY2sg")}${i === 0 ? _lhD("YWN0aXZl") : ''}${_lhD("IiBocmVmPSIj")}${it.id}${_lhD("IiBzdHlsZT0icGFkZGluZzo4cHggMTBweDttYXJnaW46MDtib3JkZXI6MDtjb2xvcjppbmhlcml0O3RleHQtZGVjb3JhdGlvbjpub25lIj4=")}${icon(it.icon)}${_lhD("PHNwYW4+")}${it.label}${_lhD("PC9zcGFuPjwvYT4=")}`).join('') || _lhD("PGRpdiBjbGFzcz0ic21hbGwgbXV0ZWQiIHN0eWxlPSJwYWRkaW5nOjhweCI+S2jDtG5nIGPDsyBjaOG7qWMgbsSDbmcgcGjDuSBo4bujcDwvZGl2Pg==");
fl.hidden = false;
};
fi.onfocus = showFinder; fi.oninput = showFinder;
fi.onkeydown = (e) => { if (e.key === _lhD("RW50ZXI=")) { const a = fl.querySelector(_lhD("YQ==")); if (a) { go(a.getAttribute(_lhD("aHJlZg==")).slice(1)); fi.value = ''; fi.blur(); } } if (e.key === _lhD("RXNjYXBl")) fi.blur(); };
fi.onblur = () => setTimeout(() => (fl.hidden = true), 150);
}
async function reportCamera() {
const shots = await openCamera({ max: 4, title: _lhD("Q2jhu6VwIOG6o25oIHThu5EgZ2nDoWM="), hint: _lhD("4bqibmggY2jhu4kgZ+G7rWkgdOG7m2kgQmFuIEdpw6FtIHRo4buLLCBkYW5oIHTDrW5oIGPhu6dhIGLhuqFuIMSRxrDhu6NjIGLhuqNvIG3huq10LiBDaOG7pXAgdOG7kWkgxJFhIDQg4bqjbmgu") });
if (!shots) return;
if (S.addReportPhotos && document.getElementById(_lhD("dGh1bWJz"))) return S.addReportPhotos(shots);
S.pendingPhotos = shots;
if (location.hash === _lhD("I3JlcG9ydA==")) render(); else location.hash = _lhD("cmVwb3J0");
}
async function logout() {
if (!await confirmDialog({ title: _lhD("xJDEg25nIHh14bqldA=="), message: _lhD("QuG6oW4gbXXhu5FuIMSRxINuZyB4deG6pXQga2jhu49pIEPhu5VuZyBI4buNYyBTaW5oIHRyw6puIHRoaeG6v3QgYuG7iyBuw6B5Pw=="), ok: _lhD("xJDEg25nIHh14bqldA=="), tone: _lhD("ZGFuZ2Vy") })) return;
try { await api.post(_lhD("YXBpL2F1dGgvbG9nb3V0")); } catch {  }
session.clear(); location.href = studentLoginUrl();
}
function bindLive() {
live.on(_lhD("bm90aWZpY2F0aW9u"), (n) => { toast(n.title, n.type === _lhD("d2FybmluZw==") ? _lhD("d2Fybg==") : _lhD("aW5mbw=="), 4200); refreshBadges(); });
live.on(_lhD("c3luYw=="), () => { toast(_lhD("TmjDoCB0csaw4budbmcgduG7q2EgxJHhu5NuZyBi4buZIGThu68gbGnhu4d1IG3hu5tpLg=="), _lhD("aW5mbw==")); render(); });
live.on(_lhD("c2V0dGluZ3M="), async () => { S.settings = await api.get(_lhD("YXBpL3NldHRpbmdzL3B1YmxpYw==")); if (safeToRefresh()) { shell(); render(); refreshBadges(0); } });
live.on(_lhD("ZGF0YTpjaGFuZ2Vk"), ({ scope }) => { const pages = { news: [_lhD("aG9tZQ=="), _lhD("bmV3cw==")], handbook: [_lhD("aGFuZGJvb2s=")], surveys: [_lhD("aG9tZQ=="), _lhD("c3VydmV5")], quiz: [_lhD("cXVpeg==")], appGuide: [_lhD("YXBwLWd1aWRl")] }[scope] || []; if (pages.includes(curPage()) && safeToRefresh()) render(); });
live.on(_lhD("cHJvZmlsZTp1cGRhdGU="), ({ user }) => {
if (!user) return;
if (user.id === S.user.id) { S.user = { ...S.user, ...user }; if (safeToRefresh()) { shell(); render(); refreshBadges(0); } }
else if ([_lhD("cXVpeg=="), _lhD("c2Nob29sLWNoYXQ="), _lhD("dGVhY2hlci1jaGF0"), _lhD("Y291bnNlbGluZw=="), _lhD("dGVhbQ=="), _lhD("dGVhY2hlcnM=")].includes(curPage()) && safeToRefresh()) render();
});
live.on(_lhD("YWk6Y29uZmln"), (st) => {
toast(st.enabled ? `${_lhD("TmjDoCB0csaw4budbmcgduG7q2EgYuG6rXQgQUk6IA==")}${st.label}` : _lhD("TmjDoCB0csaw4budbmcgxJHDoyB04bqvdCBBSSBuw6JuZyBjYW8sIMSRYW5nIGTDuW5nIGNo4bq/IMSR4buZIGPGoSBi4bqjbi4="), _lhD("aW5mbw=="), 4000);
if ([_lhD("YWk="), _lhD("c2NhbQ==")].includes(curPage())) render();
});
live.on(_lhD("dGVhY2hlci1jaGF0Om1lc3NhZ2U="), () => refreshBadges(600));
live.on(_lhD("Y291bnNlbGluZzpyZXBseQ=="), () => refreshBadges(600));
live.on(_lhD("c2Nob29sLWNoYXQ6bWVzc2FnZQ=="), (m) => { if (m.userId !== S.user.id) refreshBadges(); });
live.on(_lhD("c2Nob29sLWNoYXQ6ZGVsZXRl"), () => refreshBadges());
live.on(_lhD("Y29ubmVjdGlvbg=="), ({ online }) => { if (online && S.wasOffline) resync(); S.wasOffline = !online; });
live.on(_lhD("Y29ubmVjdGlvbg=="), ({ online }) => { const b = $(_lhD("I2xpdmVCYWRnZQ==")); if (b) { b.className = `${_lhD("YmFkZ2Ug")}${online ? _lhD("b2s=") : _lhD("d2Fybg==")}`; b.innerHTML = `${_lhD("PHNwYW4gY2xhc3M9InB1bHNlIj48L3NwYW4+")}${online ? _lhD("xJDhu5NuZyBi4buZIHJlYWx0aW1l") : _lhD("xJBhbmcga+G6v3QgbuG7kWkgbOG6oWnigKY=")}`; } });
addEventListener(_lhD("YXV0aDpleHBpcmVk"), (e) => {
toast(e?.detail?.idle ? _lhD("xJDDoyB04buxIMSR4buZbmcgxJHEg25nIHh14bqldCBzYXUgNSBwaMO6dCBraMO0bmcgaG/huqF0IMSR4buZbmcu") : _lhD("UGhpw6puIMSRxINuZyBuaOG6rXAgxJHDoyBo4bq/dCBo4bqhbi4="), _lhD("d2Fybg=="));
setTimeout(() => (location.href = studentLoginUrl()), 900);
});
}
function safeToRefresh() {
const a = document.activeElement;
if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && a.value) return false;
return !document.querySelector(_lhD("LmJhY2tkcm9wLCAuY2FtLCAubGlnaHRib3gsIC5hdHRhY2gtc3RyaXA6bm90KFtoaWRkZW5dKQ=="));
}
function resync() { refreshBadges(0); if (safeToRefresh()) render(); }
let hiddenAt = 0;
document.addEventListener(_lhD("dmlzaWJpbGl0eWNoYW5nZQ=="), () => {
if (document.hidden) { hiddenAt = Date.now(); return; }
if (hiddenAt && Date.now() - hiddenAt > 15000) resync();
});
function setCount(id, v) { $$(`${_lhD("W2RhdGEtY291bnQ9Ig==")}${id}${_lhD("Il0=")}`).forEach(el => { el.hidden = !v; el.textContent = v; }); }
const curPage = () => (location.hash || _lhD("I2hvbWU=")).slice(1).split(_lhD("Lw=="))[0];
const fmtCount = (n) => (n > 99 ? _lhD("OTkr") : n ? String(n) : '');
let badgeTimer = 0;
function refreshBadges(delay = 200) { clearTimeout(badgeTimer); badgeTimer = setTimeout(loadBadges, delay); }
const refreshUnread = () => refreshBadges(0);
async function loadBadges() {
try {
if (curPage() === _lhD("c2Nob29sLWNoYXQ=")) await api.post(_lhD("YXBpL21lL3NlZW4="), { key: _lhD("c2Nob29sQ2hhdA==") });
const prev = S.badges;
S.badges = await api.get(_lhD("YXBpL21lL2JhZGdlcw=="));
applyBadges(prev);
} catch {  }
}
function applyBadges(prev) {
const b = S.badges; if (!b) return;
[[_lhD("c2Nob29sLWNoYXQ="), b.schoolChat], [_lhD("dGVhY2hlci1jaGF0"), b.teacherChat], [_lhD("Y291bnNlbGluZw=="), b.counseling]].forEach(([id, n]) => {
setCount(id, fmtCount(n));
if (prev && n > (prev[{ 'school-chat': _lhD("c2Nob29sQ2hhdA=="), 'teacher-chat': _lhD("dGVhY2hlckNoYXQ="), counseling: _lhD("Y291bnNlbGluZw==") }[id]] || 0)) $$(`${_lhD("W2RhdGEtY291bnQ9Ig==")}${id}${_lhD("Il0=")}`).forEach(el => { el.classList.remove(_lhD("cG9w")); void el.offsetWidth; el.classList.add(_lhD("cG9w")); });
});
S.unread = b.notifications;
$$(_lhD("W2RhdGEtZG90XQ==")).forEach(d => { d.hidden = !b.notifications; d.textContent = b.notifications > 9 ? _lhD("OSs=") : String(b.notifications || ''); });
setCount(_lhD("aW5ib3g="), fmtCount(b.messages));
const base = document.title.replace(/^\(\d+\+?\)\s/, '');
document.title = b.total ? `${_lhD("KA==")}${b.total > 99 ? _lhD("OTkr") : b.total}${_lhD("KSA=")}${base}` : base;
}
function openNotifications() {
drawer({ title: _lhD("VGjDtG5nIGLDoW8="), body: skeleton(3), onMount: async (d, close) => {
const body = $(_lhD("LmRyYXdlci1ib2R5"), d);
const load = async () => {
const r = await api.get(_lhD("YXBpL25vdGlmaWNhdGlvbnM="));
body.innerHTML = `${_lhD("PGRpdiBjbGFzcz0ibm90aWYtYmFyIj48c3BhbiBjbGFzcz0iYmFkZ2Ug")}${r.unread ? _lhD("aW5mbw==") : ''}${_lhD("Ij4=")}${r.unread ? `${r.unread}${_lhD("IGNoxrBhIMSR4buNYw==")}` : _lhD("xJDDoyDEkeG7jWMgdOG6pXQgY+G6ow==")}${_lhD("PC9zcGFuPg==")}${r.unread ? `${_lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIGdob3N0IHNtIiBpZD0icmVhZEFsbCI+")}${icon(_lhD("Y2hlY2s="))}${_lhD("IMSQ4buNYyB04bqldCBj4bqjPC9idXR0b24+")}` : ''}${_lhD("PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibm90aWYtbGlzdCI+")}${r.items.map(n => `${_lhD("PGRpdiBjbGFzcz0ibm90aWYtaXRlbSA=")}${n.unread ? _lhD("dW5yZWFk") : ''}${_lhD("IiBkYXRhLWlkPSI=")}${n.id}${_lhD("IiBkYXRhLWxpbms9Ig==")}${esc(n.link || '')}${_lhD("Ij4KICAgICAgICAgIDxzcGFuIGNsYXNzPSJhdmF0YXIgc20gc3EiIHN0eWxlPSJiYWNrZ3JvdW5kOg==")}${n.type === _lhD("d2FybmluZw==") ? _lhD("dmFyKC0td2Fybik=") : n.type === _lhD("cmVwb3J0") ? _lhD("dmFyKC0tYWNjZW50KQ==") : n.type === _lhD("Y2hhdA==") ? _lhD("dmFyKC0tdmlvbGV0KQ==") : _lhD("dmFyKC0tYnJhbmQp")}${_lhD("Ij4=")}${icon(n.type === _lhD("d2FybmluZw==") ? _lhD("YWxlcnQ=") : n.type === _lhD("cmVwb3J0") ? _lhD("c2hpZWxk") : n.type === _lhD("Y2hhdA==") ? _lhD("Y2hhdA==") : n.type === _lhD("YWNhZGVtaWM=") ? _lhD("Y2FsZW5kYXI=") : _lhD("YmVsbA=="))}${_lhD("PC9zcGFuPgogICAgICAgICAgPGRpdiBjbGFzcz0iZ3JvdyIgc3R5bGU9Im1pbi13aWR0aDowIj48ZGl2IGNsYXNzPSJyb3cgYmV0d2VlbiBub3dyYXAiIHN0eWxlPSJnYXA6OHB4Ij48YiBjbGFzcz0ic21hbGwgdHJ1bmNhdGUiPg==")}${esc(n.title)}${_lhD("PC9iPjxzcGFuIGNsYXNzPSJ4cyBtdXRlZCBub3dyYXAiPg==")}${ago(n.createdAt)}${_lhD("PC9zcGFuPjwvZGl2PjxwIGNsYXNzPSJ4cyBpbmsyIj4=")}${esc(n.content)}${_lhD("PC9wPjwvZGl2Pg==")}${n.unread ? _lhD("PHNwYW4gY2xhc3M9Im5vdGlmLWRvdCI+PC9zcGFuPg==") : ''}${_lhD("PC9kaXY+")}`).join('') || empty(_lhD("Q2jGsGEgY8OzIHRow7RuZyBiw6Fv"), '', _lhD("YmVsbA=="))}${_lhD("PC9kaXY+")}`;
if ($(_lhD("I3JlYWRBbGw="), body)) $(_lhD("I3JlYWRBbGw="), body).onclick = async () => { await api.post(_lhD("YXBpL25vdGlmaWNhdGlvbnMvcmVhZC1hbGw=")); refreshUnread(); load(); };
$$(_lhD("Lm5vdGlmLWl0ZW1bZGF0YS1pZF0="), body).forEach(it => it.onclick = async () => { await api.post(`${_lhD("YXBpL25vdGlmaWNhdGlvbnMv")}${it.dataset.id}${_lhD("L3JlYWQ=")}`); refreshUnread(); const link = it.dataset.link; if (link && ALL.some(a => a.id === link)) { close(); go(link); } else load(); });
};
load().catch(showError);
} });
}
async function render() {
S.cleanups.forEach(f => { try { f(); } catch {  } }); S.cleanups = [];
S.addReportPhotos = null;
let page = (location.hash || _lhD("I2hvbWU=")).slice(1).split(_lhD("Lw=="))[0];
const item = ALL.find(i => i.id === page);
if (!item || !enabled(item)) page = _lhD("aG9tZQ==");
$$(_lhD("W2RhdGEtbmF2XQ==")).forEach(a => a.classList.toggle(_lhD("YWN0aXZl"), a.dataset.nav === page));
$$(_lhD("W2RhdGEtdGFiXQ==")).forEach(a => a.classList.toggle(_lhD("YWN0aXZl"), a.dataset.tab === page || (a.dataset.tab === _lhD("aW5ib3g=") && CHAT_PAGES.includes(page))));
const mbar = $(_lhD("I21iYXI="));
if (mbar) {
mbar.classList.toggle(_lhD("c3Vi"), !ROOT_TABS.includes(page));
mbar.classList.toggle(_lhD("aG9tZQ=="), page === _lhD("aG9tZQ=="));
$(_lhD("I21iVGl0bGU=")).textContent = page === _lhD("aG9tZQ==") ? (S.settings.schoolName || S.settings.shortName) : (item?.label || '');
$(_lhD("I21iU3Vi")).textContent = page === _lhD("aG9tZQ==") ? _lhD("Q+G7lW5nIEjhu41jIFNpbmg=") : (S.settings.schoolName || S.settings.shortName || '');
}
const view = $(_lhD("I3ZpZXc="));
view.innerHTML = skeleton(3);
view.style.animation = _lhD("bm9uZQ=="); void view.offsetWidth; view.style.animation = '';
document.title = `${(ALL.find(i => i.id === page) || {}).label || _lhD("VHJhbmcgY2jhu6c=")}${_lhD("IMK3IEPhu5VuZyBI4buNYyBTaW5o")}`;
scrollTo({ top: 0 });
try { await PAGES[page](view); } catch (e) { view.innerHTML = empty(_lhD("S2jDtG5nIHThuqNpIMSRxrDhu6NjIHRyYW5n"), esc(e.message), _lhD("YWxlcnRDaXJjbGU="), _lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIiBvbmNsaWNrPSJsb2NhdGlvbi5yZWxvYWQoKSI+VOG6o2kgbOG6oWk8L2J1dHRvbj4=")); }
applyBadges();
if ([_lhD("c2Nob29sLWNoYXQ="), _lhD("dGVhY2hlci1jaGF0"), _lhD("Y291bnNlbGluZw==")].includes(page)) refreshBadges(300);
}
const aiOfflineNote = (ai) => getMode() === _lhD("ZGVtbw==") && !ai?.enabled && isNativeApp() ? `${_lhD("PGRpdiBjbGFzcz0iY2FyZCBzb2Z0IHNtYWxsIHJvdyBub3dyYXAiIHN0eWxlPSJwYWRkaW5nOjEwcHggMTRweDtnYXA6OHB4Ij4=")}${icon(_lhD("aW5mbw=="))}${_lhD("PHNwYW4+QXBwIMSRYW5nIOG7nyA8Yj5i4bqjbiB0cuG6o2kgbmdoaeG7h208L2I+IG7Dqm4gZMO5bmcgY2jhur8gxJHhu5kgY8ahIGLhuqNuLiDEkMSDbmcgeHXhuqV0IOKGkiA8Yj5Nw6F5IGNo4bunIHRyxrDhu51uZzwvYj4g4oaSIG5o4bqtcCDEkeG7i2EgY2jhu4kgbcOheSBjaOG7pyDEkeG7gyBkw7luZyBBSSBj4bunYSBuaMOgIHRyxrDhu51uZy48L3NwYW4+PC9kaXY+")}` : '';
const aiPill = (ai) => ai?.enabled ? `${_lhD("PHNwYW4gY2xhc3M9ImJhZGdlIHZpb2xldCIgdGl0bGU9Ig==")}${esc(ai.label || '')}${_lhD("Ij4=")}${icon(_lhD("c3BhcmtsZXM="))}${_lhD("IEFJIHRo4bqtdCDEkWFuZyBi4bqtdDwvc3Bhbj4=")}` : _lhD("PHNwYW4gY2xhc3M9ImJhZGdlIiB0aXRsZT0iVGjDqm0ga2jDs2EgQVBJIHRyb25nIC5lbnYgxJHhu4MgYuG6rXQgQUkiPkLhu5kgbHXhuq10IMK3IGNoxrBhIGLhuq10IEFJPC9zcGFuPg==");
const bubbleBody = (m) => `${m.text ? esc(m.text) : ''}${attachmentsHtml(m.attachments)}`;
const bubbleCls = (m) => (!m.text && m.attachments?.length ? _lhD("YXR0LW9ubHk=") : '');
const recalledText = (mine) => (mine ? _lhD("QuG6oW4gxJHDoyB0aHUgaOG7k2kgbeG7mXQgdGluIG5o4bqvbg==") : _lhD("VGluIG5o4bqvbiDEkcOjIMSRxrDhu6NjIHRodSBo4buTaQ=="));
const bubble = (m, mine, extraCls = '') => m.recalled ? `${_lhD("PGRpdiBjbGFzcz0iYnViYmxlIGRlbGV0ZWQiPg==")}${icon(_lhD("dW5kbw=="))} ${recalledText(mine)}${_lhD("PC9kaXY+")}` : `${_lhD("PGRpdiBjbGFzcz0iYnViYmxlIA==")}${extraCls || bubbleCls(m)}${_lhD("Ij4=")}${bubbleBody(m)}${_lhD("PC9kaXY+")}`;
const recallBtn = (m, mine) => (mine && !m.recalled && !m.deleted && m.kind !== _lhD("bGVhdmU=") ? `${_lhD("IMK3IDxidXR0b24gdHlwZT0iYnV0dG9uIiBjbGFzcz0icmVjYWxsLWJ0biIgZGF0YS1yZWNhbGw9Ig==")}${m.id}${_lhD("Ij5UaHUgaOG7k2k8L2J1dHRvbj4=")}` : '');
async function askRecall(url) {
const ok = await confirmDialog({ title: _lhD("VGh1IGjhu5NpIHRpbiBuaOG6r24/"), message: _lhD("VGluIG5o4bqvbiBz4bq9IMSRxrDhu6NjIGfhu6Ega2jhu49pIGN14buZYyB0csOyIGNodXnhu4duLCBuZ8aw4budaSBuaOG6rW4gY2jhu4kgdGjhuqV5IOKAnFRpbiBuaOG6r24gxJHDoyDEkcaw4bujYyB0aHUgaOG7k2nigJ0uIEJhbiBxdeG6o24gdHLhu4sgbmjDoCB0csaw4budbmcgduG6q24geGVtIMSRxrDhu6NjIG7hu5lpIGR1bmcgxJHhu4MgYuG6o28gxJHhuqNtIGFuIHRvw6BuLg=="), ok: _lhD("VGh1IGjhu5Np"), tone: _lhD("ZGFuZ2Vy") });
if (!ok) return null;
try { const r = await api.post(url, {}); toast(_lhD("xJDDoyB0aHUgaOG7k2kgdGluIG5o4bqvbi4="), _lhD("b2s="), 1800); return r; } catch (e) { showError(e); return null; }
}
async function sendWithFiles(comp, text, post, btn) {
if (!text && !comp.has()) return false;
btn && (btn.disabled = true);
try {
const attachments = comp.has() ? await comp.upload(api.upload) : [];
await post({ text, attachments });
comp.clear();
return true;
} catch (e) { showError(e); return false; } finally { btn && (btn.disabled = false); }
}
const onView = (view, type, fn) => { view.addEventListener(type, fn); S.cleanups.push(() => view.removeEventListener(type, fn)); };
const head = (title, sub = '', actions = '') => `${_lhD("PGRpdiBjbGFzcz0icGFnZS1oZWFkIj48ZGl2PjxoMT4=")}${title}${_lhD("PC9oMT4=")}${sub ? `${_lhD("PHA+")}${sub}${_lhD("PC9wPg==")}` : ''}${_lhD("PC9kaXY+")}${actions ? `${_lhD("PGRpdiBjbGFzcz0iYWN0aW9ucyI+")}${actions}${_lhD("PC9kaXY+")}` : ''}${_lhD("PC9kaXY+")}`;
function bindPager(pager, dots, { step } = {}) {
if (!pager) return;
const gap = () => parseFloat(getComputedStyle(pager).columnGap || getComputedStyle(pager).gap) || 0;
const stepPx = () => (step ? step() : 0) || (pager.firstElementChild ? pager.firstElementChild.getBoundingClientRect().width + gap() : pager.clientWidth) || 1;
const max = () => Math.max(0, dots.length - 1);
const at = () => { const end = pager.scrollWidth - pager.clientWidth; if (end > 0 && pager.scrollLeft >= end - 2) return max(); return Math.min(max(), Math.round(pager.scrollLeft / stepPx())); };
const show = () => { const k = at(); dots.forEach((d, i) => d.classList.toggle(_lhD("b24="), i === k)); };
const goTo = (i) => pager.scrollTo({ left: Math.max(0, i) * stepPx(), behavior: _lhD("c21vb3Ro") });
pager.addEventListener(_lhD("c2Nyb2xs"), () => requestAnimationFrame(show), { passive: true });
dots.forEach((d, i) => d.onclick = () => goTo(i));
let down = null, moved = false;
pager.addEventListener(_lhD("cG9pbnRlcmRvd24="), (e) => { if (e.pointerType !== _lhD("bW91c2U=") || e.button !== 0) return; down = { x: e.clientX, left: pager.scrollLeft, idx: at() }; moved = false; });
const onMove = (e) => { if (!down) return; const dx = e.clientX - down.x; if (!moved && Math.abs(dx) > 6) { moved = true; pager.classList.add(_lhD("ZHJhZ2dpbmc=")); } if (moved) pager.scrollLeft = down.left - dx; };
const onUp = (e) => {
if (!down) return;
const dx = e.clientX - down.x, from = down.idx; down = null;
if (!moved) return;
pager.classList.remove(_lhD("ZHJhZ2dpbmc="));
const jump = Math.max(1, Math.round(Math.abs(dx) / stepPx()));
goTo(Math.max(0, Math.min(max(), Math.abs(dx) > 40 ? from + (dx < 0 ? jump : -jump) : from)));
};
addEventListener(_lhD("cG9pbnRlcm1vdmU="), onMove); addEventListener(_lhD("cG9pbnRlcnVw"), onUp);
S.cleanups.push(() => { removeEventListener(_lhD("cG9pbnRlcm1vdmU="), onMove); removeEventListener(_lhD("cG9pbnRlcnVw"), onUp); });
pager.addEventListener(_lhD("Y2xpY2s="), (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
pager.addEventListener(_lhD("ZHJhZ3N0YXJ0"), (e) => e.preventDefault());
show();
}
function homeCompact(view, d, meta) {
const u = d.user, s = S.settings, moods = meta.moods;
const items = [
[_lhD("Y291bnNlbGluZw=="), _lhD("VMawIHbhuqVu"), _lhD("aGVhcnRIYW5k")], [_lhD("cmVwb3J0"), _lhD("VOG7kSBnacOhYw=="), _lhD("c2hpZWxkQWxlcnQ=")], [_lhD("c2NhbQ=="), _lhD("TOG7q2EgxJHhuqNvIEFJ"), _lhD("c2hpZWxkQ2hlY2s=")], [_lhD("YWk="), _lhD("VHLhu6MgbMO9IEFJ"), _lhD("Ym90")],
[_lhD("c2Nob29sLWNoYXQ="), _lhD("Q2hhdCBjaHVuZw=="), _lhD("Y2hhdHM=")], [_lhD("dGVhY2hlci1jaGF0"), _lhD("R2nDoW8gdmnDqm4="), _lhD("bWVzc2FnZQ==")], [_lhD("bW9vZA=="), _lhD("Q+G6o20geMO6Yw=="), _lhD("c21pbGU=")], [_lhD("cXVpeg=="), _lhD("VHLhuq9jIG5naGnhu4dt"), _lhD("dHJvcGh5")],
[_lhD("dGVhY2hlci1saXN0"), _lhD("RFMgR2nDoW8gdmnDqm4="), _lhD("c2Nob29s")], [_lhD("Y291bnNlbC10ZWFt"), _lhD("VOG7lSB0w6JtIGzDvQ=="), _lhD("dXNlcnM=")], [_lhD("c3VydmV5"), _lhD("S2jhuqNvIHPDoXQ="), _lhD("Y2xpcGJvYXJkQ2hlY2s=")], [_lhD("aGFuZGJvb2s="), _lhD("Q+G6qW0gbmFuZw=="), _lhD("Ym9va09wZW4=")], [_lhD("YXBwLWd1aWRl"), _lhD("VOG6o2kgQXBw"), _lhD("c21hcnRwaG9uZQ==")], [_lhD("cHJvZmlsZQ=="), _lhD("Q8OhIG5ow6Ju"), _lhD("dXNlcg==")], [_lhD("bmV3cw=="), _lhD("QuG6o24gdGlu"), _lhD("bmV3cw==")],
].filter(([id]) => enabled(ALL.find(a => a.id === id) || {}));
const pages = []; for (let i = 0; i < items.length; i += 8) pages.push(items.slice(i, i + 8));
const now = new Date();
view.innerHTML = `${_lhD("CiAgICA8ZGl2IGNsYXNzPSJjYXJkIG0tdXNlciI+CiAgICAgIDxidXR0b24gdHlwZT0iYnV0dG9uIiBpZD0ibUhvbWVBdiIgY2xhc3M9Im0tdXNlci1hdiIgdGl0bGU9IkLhuqVtIMSR4buDIGNo4buJbmggc+G7rWEg4bqjbmggxJHhuqFpIGRp4buHbiI+")}${avatar(u)}${_lhD("PHNwYW4gY2xhc3M9Im0tdXNlci1jYW0iPg==")}${icon(_lhD("Y2FtZXJh"))}${_lhD("PC9zcGFuPjwvYnV0dG9uPgogICAgICA8YSBocmVmPSIjcHJvZmlsZSIgY2xhc3M9Im0tdXNlci1pbmZvIj4KICAgICAgICA8c3BhbiBjbGFzcz0ibS11c2VyLWdyZWV0Ij4=")}${greeting()}${_lhD("IPCfkYs8L3NwYW4+CiAgICAgICAgPGIgY2xhc3M9InRydW5jYXRlIj4=")}${esc(u.name)}${_lhD("PC9iPgogICAgICAgIDxkaXYgY2xhc3M9Im0tdXNlci1waWxscyI+CiAgICAgICAgICA=")}${u.className || u.classId ? `${_lhD("PHNwYW4gY2xhc3M9Im0tdXNlci1waWxsIGJyYW5kIj4=")}${icon(_lhD("Z3JhZA=="))}${_lhD("IEzhu5twIA==")}${esc(u.className || u.classId)}${_lhD("PC9zcGFuPg==")}` : ''}${_lhD("CiAgICAgICAgICA8c3BhbiBjbGFzcz0ibS11c2VyLXBpbGwgbW9ubyI+TVNIUzog")}${esc(u.id)}${_lhD("PC9zcGFuPgogICAgICAgIDwvZGl2PgogICAgICA8L2E+CiAgICAgIDxhIGhyZWY9IiNwcm9maWxlIiBjbGFzcz0ibS11c2VyLWdvIiBhcmlhLWxhYmVsPSJI4buTIHPGoSI+")}${icon(_lhD("Y2hldnJvblJpZ2h0"))}${_lhD("PC9hPgogICAgPC9kaXY+CiAgICA=")}${canInstall() && !store.get(_lhD("bGhfaW5zdGFsbF9kaXNtaXNz")) ? `${_lhD("PGRpdiBjbGFzcz0ibS1pbnN0YWxsIGNhcmQiPg==")}${icon(_lhD("c21hcnRwaG9uZQ=="))}${_lhD("PGRpdiBjbGFzcz0iZ3JvdyI+PGIgY2xhc3M9InNtYWxsIj5Dw6BpIGFwcCBMw6ogSG/DoG48L2I+PGRpdiBjbGFzcz0ieHMgbXV0ZWQiPk3hu58gbmhhbmggdOG7qyBtw6BuIGjDrG5oIGNow61uaCwgbmjhuq1uIHRpbiBt4bubaTwvZGl2PjwvZGl2PjxidXR0b24gY2xhc3M9ImJ0biBzbSIgaWQ9Imluc3RHbyI+Q8OgaSDEkeG6t3Q8L2J1dHRvbj48YnV0dG9uIGNsYXNzPSJpY29uLWJ0biIgaWQ9Imluc3RYIiBhcmlhLWxhYmVsPSLhuqhuIj4=")}${icon(_lhD("eA=="))}${_lhD("PC9idXR0b24+PC9kaXY+")}` : ''}${_lhD("CiAgICA8c2VjdGlvbiBjbGFzcz0ibS1wYWdlci13cmFwIiBhcmlhLWxhYmVsPSJDaOG7qWMgbsSDbmciPgogICAgICA8ZGl2IGNsYXNzPSJtLXBhZ2VyIiBpZD0ibVBhZ2VyIj4=")}${pages.map((pg, i) => `${_lhD("PGRpdiBjbGFzcz0ibS1wYWdlIiBhcmlhLWxhYmVsPSJUcmFuZyA=")}${i + 1}${_lhD("Lw==")}${pages.length}${_lhD("Ij4=")}${pg.map(([id, label, ic]) => `${_lhD("PGEgaHJlZj0iIw==")}${id}${_lhD("IiBjbGFzcz0ibS10aWxlIiBkcmFnZ2FibGU9ImZhbHNlIj48c3BhbiBjbGFzcz0ibS1pY28iPg==")}${icon(ic)}${_lhD("PHNwYW4gY2xhc3M9ImNvdW50IGZjb3VudCIgZGF0YS1jb3VudD0i")}${id}${_lhD("IiBoaWRkZW4+PC9zcGFuPjwvc3Bhbj48c3Bhbj4=")}${label}${_lhD("PC9zcGFuPjwvYT4=")}`).join('')}${_lhD("PC9kaXY+")}`).join('')}${_lhD("PC9kaXY+CiAgICAgIA==")}${pages.length > 1 ? `${_lhD("PGRpdiBjbGFzcz0ibS1kb3RzIj4=")}${pages.map((_, i) => `${_lhD("PGJ1dHRvbiBkYXRhLXBnPSI=")}${i}${_lhD("IiBjbGFzcz0i")}${i === 0 ? _lhD("b24=") : ''}${_lhD("IiBhcmlhLWxhYmVsPSJUcmFuZyBjaOG7qWMgbsSDbmcg")}${i + 1}${_lhD("Ij48L2J1dHRvbj4=")}`).join('')}${_lhD("PC9kaXY+")}` : ''}${_lhD("CiAgICA8L3NlY3Rpb24+CiAgICA=")}${d.news.length ? `${_lhD("PHNlY3Rpb24gY2xhc3M9InN0YWNrIG0tbmV3cy1zZWMiIHN0eWxlPSJnYXA6MTBweCI+PGRpdiBjbGFzcz0ic2VjdGlvbi10aXRsZSI+PGgyPkLhuqNuIHRpbjwvaDI+PGEgY2xhc3M9ImJ0biBwbGFpbiBzbSIgaHJlZj0iI25ld3MiPlThuqV0IGPhuqM8L2E+PC9kaXY+PGRpdiBjbGFzcz0ibS1uZXdzLXJvdyIgaWQ9Im1OZXdzIj4=")}${d.news.map(n => `${_lhD("PGJ1dHRvbiBjbGFzcz0ibS1uZXdzLWNhcmQiIGRhdGEtbmV3cz0i")}${n.id}${_lhD("Ij4=")}${cover(n, false)}${_lhD("PGRpdiBjbGFzcz0ibS1uZXdzLWJvZHkiPjxiIGNsYXNzPSJjbGFtcC0yIj4=")}${esc(n.title)}${_lhD("PC9iPjxzcGFuIGNsYXNzPSJ4cyBtdXRlZCI+")}${ago(n.publishedAt)}${_lhD("PC9zcGFuPjwvZGl2PjwvYnV0dG9uPg==")}`).join('')}${_lhD("PC9kaXY+")}${d.news.length > 1 ? `${_lhD("PGRpdiBjbGFzcz0ibS1kb3RzIj4=")}${d.news.map((_, i) => `${_lhD("PGJ1dHRvbiBjbGFzcz0i")}${i === 0 ? _lhD("b24=") : ''}${_lhD("IiBhcmlhLWxhYmVsPSJC4bqjbiB0aW4g")}${i + 1}${_lhD("Ij48L2J1dHRvbj4=")}`).join('')}${_lhD("PC9kaXY+")}` : ''}${_lhD("PC9zZWN0aW9uPg==")}` : ''}`;
bindPager($(_lhD("I21QYWdlcg==")), $$(_lhD("Lm0tcGFnZXItd3JhcCAubS1kb3RzIGJ1dHRvbg=="), view), { step: () => $(_lhD("I21QYWdlcg==")).clientWidth });
bindPager($(_lhD("I21OZXdz")), $$(_lhD("I21OZXdzICsgLm0tZG90cyBidXR0b24="), view));
bindAvatarCam($(_lhD("I21Ib21lQXY="), view));
$$(_lhD("W2RhdGEtbmV3c10="), view).forEach(c => c.onclick = () => openNews(c.dataset.news));
$$(_lhD("W2RhdGEtbW9vZF0="), view).forEach(b => b.onclick = async () => { try { const r = await api.post(_lhD("YXBpL21vb2Q="), { mood: b.dataset.mood }); toast(r.advice, _lhD("b2s="), 5000); render(); } catch (e) { showError(e); } });
if ($(_lhD("I2luc3RHbw=="))) { $(_lhD("I2luc3RHbw==")).onclick = async () => { await installApp(); render(); }; $(_lhD("I2luc3RY")).onclick = () => { store.set(_lhD("bGhfaW5zdGFsbF9kaXNtaXNz"), 1); $(_lhD("Lm0taW5zdGFsbA=="))?.remove(); }; }
}
const PAGES = {
async home(view) {
const [d, meta] = await Promise.all([api.get(_lhD("YXBpL21lL2Rhc2hib2FyZA==")), api.get(_lhD("YXBpL21ldGE="))]);
if (compact()) return homeCompact(view, d, meta);
const u = d.user, s = S.settings, now = new Date(), moods = meta.moods;
const ST = { pending: [_lhD("Q2jhu50gdGnhur9wIG5o4bqtbg=="), ''], verifying: [_lhD("xJBhbmcgeMOhYyBtaW5o"), _lhD("d2Fybg==")], reminded: [_lhD("xJDDoyBuaOG6r2Mgbmjhu58="), _lhD("aW5mbw==")], disciplined: [_lhD("xJDDoyBr4bu3IGx14bqtdA=="), _lhD("YmFk")], recorded: [_lhD("xJDDoyBs4bqtcCBiacOqbiBi4bqjbg=="), _lhD("YmFk")], resolved: [_lhD("xJDDoyB44butIGzDvQ=="), _lhD("b2s=")], archived: [_lhD("TMawdSBo4buTIHPGoQ=="), ''] };
const features = [
[_lhD("Y291bnNlbGluZw=="), _lhD("Q2hhdCB0xrAgduG6pW4gdMOibSBsw70="), _lhD("aGVhcnRIYW5k"), _lhD("I2Q2NDU3YQ=="), _lhD("SE9U"), _lhD("VMOibSBz4buxIDEtMSBi4bqjbyBt4bqtdA==")],
[_lhD("bW9vZA=="), _lhD("Q+G6o20geMO6YyAmIHRoxrAgZ2nDo24="), _lhD("c21pbGU="), _lhD("IzdhNWFmNQ=="), '', _lhD("Tmjhuq10IGvDvSAmIGLDoGkgdOG6rXAgdGjhu58=")],
[_lhD("c2Nob29sLWNoYXQ="), _lhD("Q2hhdCB0b8OgbiB0csaw4budbmc="), _lhD("Y2hhdHM="), _lhD("IzBhODRiOA=="), '', _lhD("R2lhbyBsxrB1IHbEg24gbWluaA==")],
[_lhD("cmVwb3J0"), _lhD("VOG7kSBnacOhYyB2aSBwaOG6oW0="), _lhD("c2hpZWxkQWxlcnQ="), _lhD("I2U4NTEzYQ=="), '', _lhD("R+G7rWkga8OtbiBkYW5oIHTDrW5o")],
[_lhD("c2NhbQ=="), _lhD("VHJhIGPhu6l1IGzhu6thIMSR4bqjbw=="), _lhD("c2hpZWxkQ2hlY2s="), _lhD("I2MyN2MwZQ=="), _lhD("QUk="), _lhD("UXXDqXQgdGluIG5o4bqvbiAmIGxpbms=")],
[_lhD("c3VydmV5"), _lhD("S2jhuqNvIHPDoXQ="), _lhD("Y2xpcGJvYXJkQ2hlY2s="), _lhD("IzBmOGY2Nw=="), '', _lhD("R8OzcCDDvSB4w6J5IGThu7FuZyB0csaw4budbmc=")],
[_lhD("cXVpeg=="), _lhD("xJDhuqV1IHRyxrDhu51uZyB0cuG6r2MgbmdoaeG7h20="), _lhD("dHJvcGh5"), _lhD("I2Q2OGEwMA=="), '', _lhD("xJB1YSBUb3AgYuG6o25nIHbDoG5n")],
[_lhD("dGVhY2hlci1jaGF0"), _lhD("Q2hhdCB24bubaSBnacOhbyB2acOqbg=="), _lhD("bWVzc2FnZQ=="), _lhD("IzE3NDdjOQ=="), '', _lhD("VHJhbyDEkeG7lWkgJiB4aW4gcGjDqXA=")],
[_lhD("YWk="), _lhD("VHLhu6MgbMO9IEFJIDI0Lzc="), _lhD("Ym90"), _lhD("IzZhNGZlMA=="), _lhD("QUk="), _lhD("R2nhuqNpIMSRw6FwIGvhu7kgbsSDbmcgJiBsdeG6rXQ=")],
[_lhD("aGFuZGJvb2s="), _lhD("Q+G6qW0gbmFuZyAmIGhvdGxpbmU="), _lhD("Ym9va09wZW4="), _lhD("IzBhODRiOA=="), '', _lhD("S+G7uSBuxINuZyDhu6luZyBwaMOzIG5oYW5o")],
[_lhD("bmV3cw=="), _lhD("QuG6o24gdGlu"), _lhD("bmV3cw=="), _lhD("IzJmNmI0Zg=="), '', _lhD("VGluIHThu6ljICYgdHV5w6puIHRydXnhu4Fu")],
[_lhD("YXBwLWd1aWRl"), _lhD("SMaw4bubbmcgZOG6q24gdOG6o2kgQXBw"), _lhD("c21hcnRwaG9uZQ=="), _lhD("IzBmOGY2Nw=="), _lhD("QVBQ"), _lhD("Q8OgaSB0csOqbiDEkWnhu4duIHRob+G6oWk=")],
].filter(f => enabled(ALL.find(a => a.id === f[0]) || {}));
const actions = [
[_lhD("cmVwb3J0"), _lhD("Y2FtZXJh"), _lhD("VOG7kSBnacOhYyDhuqluIGRhbmg="), _lhD("R+G7rWkga8OtbiBkYW5oIHTDrW5oIMK3IGLhuqNvIG3huq10IHR1eeG7h3QgxJHhu5Fp"), _lhD("bGluZWFyLWdyYWRpZW50KDEzNWRlZywgI2ZmNmI1MiwgI2Y5NzMxNik="), _lhD("cmdiYSgyNTUsIDEwNywgODIsIC40NSk=")],
[_lhD("Y291bnNlbGluZw=="), _lhD("aGVhcnRIYW5k"), _lhD("VMOibSBz4buxIHbhu5tpIGNodXnDqm4gdmnDqm4="), d.counseling.unread ? `${d.counseling.unread}${_lhD("IHBo4bqjbiBo4buTaSBt4bubaQ==")}` : _lhD("QuG6o28gbeG6rXQgdHV54buHdCDEkeG7kWkgwrcgbOG6r25nIG5naGUgMS0x"), _lhD("bGluZWFyLWdyYWRpZW50KDEzNWRlZywgI2VjNDg5OSwgIzhiNWNmNik="), _lhD("cmdiYSgyMzYsIDcyLCAxNTMsIC40Mik=")],
[_lhD("c2NhbQ=="), _lhD("c2hpZWxkQ2hlY2s="), _lhD("S2nhu4NtIHRyYSBs4burYSDEkeG6o28="), _lhD("VGluIG5o4bqvbiwgbGluaywgc+G7kSBtw6F5IMSRw6FuZyBuZ+G7nQ=="), _lhD("bGluZWFyLWdyYWRpZW50KDEzNWRlZywgIzEwYjk4MSwgIzA2YjZkNCk="), _lhD("cmdiYSgxNiwgMTg1LCAxMjksIC40Mik=")],
].filter(a => enabled(ALL.find(x => x.id === a[0]) || {}));
const kpis = [
[_lhD("VOG7kSBnacOhYyBj4bunYSBi4bqhbg=="), d.reports.total, d.reports.open ? `${d.reports.open}${_lhD("IGjhu5Mgc8ahIMSRYW5nIHjhu60gbMO9")}` : _lhD("S2jDtG5nIGPDsyBo4buTIHPGoSBjaOG7nQ=="), _lhD("cmVwb3J0"), _lhD("c2hpZWxkQWxlcnQ="), _lhD("bGluZWFyLWdyYWRpZW50KDEzNWRlZywgI2ZmNzg1YSwgI2Y1OWUwYik=")],
[_lhD("S2jhuqNvIHPDoXQgY2jhu50gYuG6oW4="), d.surveys.open, d.surveys.open ? _lhD("TeG6pXQga2hv4bqjbmcgM+KAkzQgcGjDunQ=") : _lhD("xJDDoyBob8OgbiB0aMOgbmggaOG6v3Q="), _lhD("c3VydmV5"), _lhD("Y2xpcGJvYXJkQ2hlY2s="), _lhD("bGluZWFyLWdyYWRpZW50KDEzNWRlZywgIzEwYjk4MSwgIzE0YjhhNik=")],
[_lhD("xJBp4buDbSB0cuG6r2MgbmdoaeG7h20="), d.quiz.best || _lhD("4oCU"), `${d.quiz.attempts}${_lhD("IGzGsOG7o3QgdGhp")}`, _lhD("cXVpeg=="), _lhD("dHJvcGh5"), _lhD("bGluZWFyLWdyYWRpZW50KDEzNWRlZywgI2Y1OWUwYiwgI2VhYjMwOCk=")],
];
view.innerHTML = `${_lhD("CiAgICA8ZGl2IGNsYXNzPSJzdGFjayBsZyI+CiAgICAgIDxzZWN0aW9uIGNsYXNzPSJoZXJvIGhlcm8taG9tZSI+CiAgICAgICAg")}${drumArt(440, _lhD("ZHJ1bQ==")).replace(_lhD("Y2xhc3M9ImRydW0i"), _lhD("Y2xhc3M9ImRydW0iIHN0eWxlPSJyaWdodDotMTAwcHg7dG9wOi0xMTBweCI="))}${_lhD("CiAgICAgICAgPGRpdiBjbGFzcz0iaGVyby13ZWxjb21lIj4KICAgICAgICAgIDxzcGFuIGNsYXNzPSJoZXJvLWRhdGUtcGlsbCI+")}${icon(_lhD("Y2FsZW5kYXI="))} ${DAY[now.getDay()]}${_lhD("LCA=")}${fmtDate(now)}${_lhD("IMK3IA==")}${esc(s.semester)}${_lhD("IMK3IE7Eg20gaOG7jWMg")}${esc(s.schoolYear)}${_lhD("PC9zcGFuPgogICAgICAgICAgPGgxPg==")}${greeting()}${_lhD("LCA=")}${esc(firstName(u.name))}${_lhD("ISDwn5GLPC9oMT4KICAgICAgICAgIDxwIGNsYXNzPSJoZXJvLWxlYWQiPkLhuqFuIGtow7RuZyDEkcahbiDEkeG7mWMuIE5ow6AgdHLGsOG7nW5nIGx1w7RuIGzhuq9uZyBuZ2hlIHbDoCBi4bqjbyB24buHIGLhuqFuLjwvcD4KICAgICAgICA8L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJxdWljay1hY3Rpb25zIj4=")}${actions.map(([id, ic, t, sub, grad, glow]) => `${_lhD("PGEgaHJlZj0iIw==")}${id}${_lhD("IiBjbGFzcz0icWEiIHN0eWxlPSItLXFncmFkOg==")}${grad}${_lhD("Oy0tcWdsb3c6")}${glow}${_lhD("Ij48c3BhbiBjbGFzcz0icWEtaWNvIj4=")}${icon(ic)}${_lhD("PC9zcGFuPjxzcGFuIGNsYXNzPSJncm93Ij48Yj4=")}${t}${_lhD("PC9iPjxzcGFuPg==")}${esc(sub)}${_lhD("PC9zcGFuPjwvc3Bhbj48c3BhbiBjbGFzcz0icWEtZ28iPg==")}${icon(_lhD("YXJyb3dSaWdodA=="))}${_lhD("PC9zcGFuPjwvYT4=")}`).join('')}${_lhD("PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0iaGVyby1rcGlzIj4KICAgICAgICAgIA==")}${kpis.map(([k, v, sub, link, ic, grad]) => `${_lhD("PGEgaHJlZj0iIw==")}${link}${_lhD("IiBjbGFzcz0iaGVyby1rcGkiPjxkaXYgY2xhc3M9Imhlcm8ta3BpLXRvcCI+PHNwYW4gY2xhc3M9Imhlcm8ta3BpLWljbyIgc3R5bGU9Ii0ta2dyYWQ6")}${grad}${_lhD("Ij4=")}${icon(ic)}${_lhD("PC9zcGFuPjxzcGFuIGNsYXNzPSJoZXJvLWtwaS1sYmwiPg==")}${k}${_lhD("PC9zcGFuPjwvZGl2PjxkaXYgY2xhc3M9Imhlcm8ta3BpLXZhbCBudW0iPg==")}${v}${_lhD("PC9kaXY+PGRpdiBjbGFzcz0iaGVyby1rcGktc3ViIHRydW5jYXRlIj4=")}${esc(sub)}${_lhD("PC9kaXY+PC9hPg==")}`).join('')}${_lhD("CiAgICAgICAgPC9kaXY+CiAgICAgIDwvc2VjdGlvbj4KICAgICAg")}${s.marquee?.length ? `${_lhD("PGRpdiBjbGFzcz0ibWFycXVlZSIgcm9sZT0ibWFycXVlZSI+PHNwYW4gY2xhc3M9InRhZyI+")}${icon(_lhD("bWVnYXBob25l"))}${_lhD("IFRow7RuZyBiw6FvPC9zcGFuPjxkaXYgY2xhc3M9InRyYWNrIj48ZGl2IGNsYXNzPSJydW4iPg==")}${s.marquee.map(m => `${_lhD("PHNwYW4+")}${esc(m)}${_lhD("PC9zcGFuPg==")}`).join('')}${_lhD("PC9kaXY+PC9kaXY+PC9kaXY+")}` : ''}${_lhD("CiAgICAgIDxzZWN0aW9uIGNsYXNzPSJzdGFjayBmZWF0dXJlcy13cmFwIj4KICAgICAgICA8ZGl2IGNsYXNzPSJzZWN0aW9uLXRpdGxlIj48ZGl2PjxoMj5UaeG7h24gw61jaCBo4buNYyDEkcaw4budbmc8L2gyPjxzcGFuIGNsYXNzPSJ4cyBtdXRlZCI+VHJ1eSBj4bqtcCBuaGFuaCA=")}${features.length}${_lhD("IGNo4bupYyBuxINuZyBkw6BuaCBjaG8gaOG7jWMgc2luaDwvc3Bhbj48L2Rpdj48c3BhbiBjbGFzcz0iYmFkZ2UgaW5mbyI+")}${features.length}${_lhD("IHRp4buHbiDDrWNoPC9zcGFuPjwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9ImZlYXR1cmVzIj4=")}${features.map(([id, label, ic, c, tag, desc]) => `${_lhD("PGEgY2xhc3M9ImZlYXR1cmUiIGhyZWY9IiM=")}${id}${_lhD("IiBzdHlsZT0iLS1jOg==")}${c}${_lhD("Ij4=")}${tag ? `${_lhD("PHNwYW4gY2xhc3M9InRhZ3giPg==")}${tag}${_lhD("PC9zcGFuPg==")}` : ''}${_lhD("PHNwYW4gY2xhc3M9ImZpIj4=")}${icon(ic)}${_lhD("PHNwYW4gY2xhc3M9ImNvdW50IGZjb3VudCIgZGF0YS1jb3VudD0i")}${id}${_lhD("IiBoaWRkZW4+PC9zcGFuPjwvc3Bhbj48ZGl2IGNsYXNzPSJmZWF0dXJlLXR4dCI+PGI+")}${label}${_lhD("PC9iPjxzcGFuPg==")}${desc}${_lhD("PC9zcGFuPjwvZGl2PjwvYT4=")}`).join('')}${_lhD("PC9kaXY+CiAgICAgIDwvc2VjdGlvbj4KICAgICAg")}${d.reports.latest ? `${_lhD("PGEgY2xhc3M9ImNhcmQgaG92ZXIgcm93IG5vd3JhcCIgaHJlZj0iI3JlcG9ydCIgc3R5bGU9InBhZGRpbmc6MTZweCAxOHB4O2dhcDoxNHB4O2NvbG9yOmluaGVyaXQ7dGV4dC1kZWNvcmF0aW9uOm5vbmUiPjxzcGFuIGNsYXNzPSJhdmF0YXIgc3EiIHN0eWxlPSJiYWNrZ3JvdW5kOnZhcigtLWFjY2VudC1zb2Z0KTtjb2xvcjp2YXIoLS1hY2NlbnQpIj4=")}${icon(_lhD("c2hpZWxk"))}${_lhD("PC9zcGFuPjxkaXYgY2xhc3M9Imdyb3ciPjxkaXYgY2xhc3M9InhzIG11dGVkIj5I4buTIHPGoSB04buRIGdpw6FjIGfhuqduIG5o4bqldCDCtyBj4bqtcCBuaOG6rXQg")}${ago(d.reports.latest.updatedAt)}${_lhD("PC9kaXY+PGIgY2xhc3M9Im1vbm8gc21hbGwiPg==")}${esc(d.reports.latest.id)}${_lhD("PC9iPjwvZGl2Pg==")}${badge(...ST[d.reports.latest.status])}${icon(_lhD("Y2hldnJvblJpZ2h0"))}${_lhD("PC9hPg==")}` : ''}${_lhD("CiAgICAgIDxzZWN0aW9uIGNsYXNzPSJzdGFjayI+CiAgICAgICAgPGRpdiBjbGFzcz0ic2VjdGlvbi10aXRsZSI+CiAgICAgICAgICA8ZGl2PjxoMj5C4bqjbiB0aW4gdHV5w6puIHRydXnhu4FuPC9oMj48c3BhbiBjbGFzcz0ieHMgbXV0ZWQiPktp4bq/biB0aOG7qWMgcGjDoXAgbHXhuq10LCBr4bu5IG7Eg25nIGFuIHRvw6BuICYgdGluIHThu6ljIG5ow6AgdHLGsOG7nW5nPC9zcGFuPjwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzcz0icm93IG5vd3JhcCIgc3R5bGU9ImdhcDo2cHgiPgogICAgICAgICAgICA8YnV0dG9uIHR5cGU9ImJ1dHRvbiIgY2xhc3M9Imljb24tYnRuIHNtIG5ld3MtbmF2LWJ0biIgaWQ9Im5ld3NQcmV2IiBhcmlhLWxhYmVsPSJUcsaw4bubYyI+")}${icon(_lhD("YXJyb3dMZWZ0"))}${_lhD("PC9idXR0b24+CiAgICAgICAgICAgIDxidXR0b24gdHlwZT0iYnV0dG9uIiBjbGFzcz0iaWNvbi1idG4gc20gbmV3cy1uYXYtYnRuIiBpZD0ibmV3c05leHQiIGFyaWEtbGFiZWw9IlRp4bq/cCI+")}${icon(_lhD("YXJyb3dSaWdodA=="))}${_lhD("PC9idXR0b24+CiAgICAgICAgICAgIDxhIGNsYXNzPSJidG4gc29mdCBzbSIgaHJlZj0iI25ld3MiPlhlbSB04bqldCBj4bqjIA==")}${icon(_lhD("YXJyb3dSaWdodA=="))}${_lhD("PC9hPgogICAgICAgICAgPC9kaXY+CiAgICAgICAgPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0iaHNjcm9sbCIgaWQ9ImhvbWVOZXdzUm93Ij4=")}${d.news.map(n => `${_lhD("PGFydGljbGUgY2xhc3M9ImNhcmQgaG92ZXIgbmV3cy1jYXJkIiBkYXRhLW5ld3M9Ig==")}${n.id}${_lhD("Ij4=")}${cover(n)}${_lhD("PGRpdiBjbGFzcz0ibmV3cy1jYXJkLWJvZHkiPjxoMyBjbGFzcz0iY2xhbXAtMiI+")}${esc(n.title)}${_lhD("PC9oMz48cCBjbGFzcz0ic21hbGwgbXV0ZWQgY2xhbXAtMiI+")}${esc(n.summary)}${_lhD("PC9wPjxkaXYgY2xhc3M9Im1ldGEiPjxzcGFuPg==")}${icon(_lhD("Y2xvY2s="))} ${ago(n.publishedAt)}${_lhD("PC9zcGFuPjxzcGFuPg==")}${icon(_lhD("ZXll"))} ${num(n.views)}${_lhD("PC9zcGFuPjxzcGFuIGNsYXNzPSJuZXdzLXJlYWQtbW9yZSI+xJDhu41jIHRpbiDihpI8L3NwYW4+PC9kaXY+PC9kaXY+PC9hcnRpY2xlPg==")}`).join('')}${_lhD("PC9kaXY+CiAgICAgIDwvc2VjdGlvbj4KICAgIDwvZGl2Pg==")}`;
const nr = $(_lhD("I2hvbWVOZXdzUm93"), view);
if (nr) {
$(_lhD("I25ld3NQcmV2"), view).onclick = () => nr.scrollBy({ left: -320, behavior: _lhD("c21vb3Ro") });
$(_lhD("I25ld3NOZXh0"), view).onclick = () => nr.scrollBy({ left: 320, behavior: _lhD("c21vb3Ro") });
}
$$(_lhD("W2RhdGEtbmV3c10="), view).forEach(c => c.onclick = () => openNews(c.dataset.news));
$$(_lhD("W2RhdGEtbW9vZF0="), view).forEach(b => b.onclick = async () => { try { const r = await api.post(_lhD("YXBpL21vb2Q="), { mood: b.dataset.mood }); toast(r.advice, _lhD("b2s="), 5000); render(); } catch (e) { showError(e); } });
},
async inbox(view) {
const b = S.badges || await api.get(_lhD("YXBpL21lL2JhZGdlcw==")).catch(() => ({}));
const rows = [
[_lhD("Y291bnNlbGluZw=="), _lhD("aGVhcnRIYW5k"), _lhD("Q2hhdCB0xrAgduG6pW4gdMOibSBsw70="), _lhD("Tmjhuq9uIHJpw6puZyBjaHV5w6puIHZpw6puLCBjw7MgdGjhu4Mg4bqpbiBkYW5o"), b.counseling],
[_lhD("c2Nob29sLWNoYXQ="), _lhD("Y2hhdHM="), _lhD("Q2hhdCB0b8OgbiB0csaw4budbmc="), _lhD("S8OqbmggY2h1bmcgY+G7p2EgaOG7jWMgc2luaCB0b8OgbiB0csaw4budbmc="), b.schoolChat],
[_lhD("dGVhY2hlci1jaGF0"), _lhD("bWVzc2FnZQ=="), _lhD("Q2hhdCB24bubaSBnacOhbyB2acOqbg=="), _lhD("VHJhbyDEkeG7lWkgduG7m2kgdGjhuqd5IGPDtCDCtyB4aW4gbmdo4buJIHBow6lw"), b.teacherChat],
[_lhD("YWk="), _lhD("Ym90"), _lhD("VHLhu6MgbMO9IGjhu41jIMSRxrDhu51uZyBBSQ=="), _lhD("SOG7j2kgYsOgaSwgcGjDom4gdMOtY2ggdGluIG5o4bqvbiBs4burYSDEkeG6o28="), 0],
].filter(([id]) => enabled(ALL.find(a => a.id === id) || {}));
view.innerHTML = head(_lhD("VGluIG5o4bqvbg=="), _lhD("VOG6pXQgY+G6oyBjdeG7mWMgdHLDsiBjaHV54buHbiBj4bunYSBi4bqhbiDhu58gbeG7mXQgbsahaS4=")) + `${_lhD("CiAgICAgIDxzZWN0aW9uIGNsYXNzPSJjYXJkIj48ZGl2IGNsYXNzPSJsaXN0IGluYm94LWxpc3QiPg==")}${rows.map(([id, ic, t, sub, n]) => `${_lhD("PGEgY2xhc3M9Iml0ZW0gY2xpY2siIGhyZWY9IiM=")}${id}${_lhD("Ij48c3BhbiBjbGFzcz0iaW5ib3gtaWNvIj4=")}${icon(ic)}${_lhD("PC9zcGFuPjxkaXYgY2xhc3M9Imdyb3ciIHN0eWxlPSJtaW4td2lkdGg6MCI+PGIgY2xhc3M9InNtYWxsIj4=")}${t}${_lhD("PC9iPjxkaXYgY2xhc3M9InhzIG11dGVkIHRydW5jYXRlIj4=")}${sub}${_lhD("PC9kaXY+PC9kaXY+PHNwYW4gY2xhc3M9ImNvdW50LXBpbGwiIGRhdGEtY291bnQ9Ig==")}${id}${_lhD("IiA=")}${n ? '' : _lhD("aGlkZGVu")}${_lhD("Pg==")}${fmtCount(n)}${_lhD("PC9zcGFuPg==")}${icon(_lhD("Y2hldnJvblJpZ2h0"))}${_lhD("PC9hPg==")}`).join('')}${_lhD("CiAgICAgICAgPGJ1dHRvbiBjbGFzcz0iaXRlbSBjbGljayIgZGF0YS1iZWxsPjxzcGFuIGNsYXNzPSJpbmJveC1pY28iPg==")}${icon(_lhD("YmVsbA=="))}${_lhD("PC9zcGFuPjxkaXYgY2xhc3M9Imdyb3ciPjxiIGNsYXNzPSJzbWFsbCI+VGjDtG5nIGLDoW88L2I+PGRpdiBjbGFzcz0ieHMgbXV0ZWQiPlRpbiB04burIG5ow6AgdHLGsOG7nW5nLCBwaOG6o24gaOG7k2kgdOG7kSBnacOhYzwvZGl2PjwvZGl2PjxzcGFuIGNsYXNzPSJjb3VudC1waWxsIiA=")}${b.notifications ? '' : _lhD("aGlkZGVu")}${_lhD("Pg==")}${fmtCount(b.notifications)}${_lhD("PC9zcGFuPg==")}${icon(_lhD("Y2hldnJvblJpZ2h0"))}${_lhD("PC9idXR0b24+CiAgICAgIDwvZGl2Pjwvc2VjdGlvbj4=")}`;
$$(_lhD("W2RhdGEtYmVsbF0="), view).forEach(x => x.onclick = openNotifications);
},
async report(view) {
const [{ types }, mine] = await Promise.all([api.get(_lhD("YXBpL3JlcG9ydC10eXBlcw==")), api.get(_lhD("YXBpL3JlcG9ydHM="))]);
let tab = location.hash.includes(_lhD("aGlzdG9yeQ==")) ? _lhD("aGlzdG9yeQ==") : _lhD("bmV3");
const TYPE_ICON = { violence: _lhD("dXNlcnM="), bullying: _lhD("c2hpZWxkQWxlcnQ="), cyber: _lhD("c21hcnRwaG9uZQ=="), smoking: _lhD("dmFwZQ=="), drugs: _lhD("cGlsbA=="), weapon: _lhD("a25pZmU="), traffic: _lhD("Y2Fy"), other: _lhD("ZmxhZw==") };
const TYPE_SHORT = {
violence: _lhD("QuG6oW8gbOG7sWMsIMSRw6FuaCBuaGF1"),
bullying: _lhD("QuG6r3QgbuG6oXQsIGPDtCBs4bqtcA=="),
cyber: _lhD("QuG6r3QgbuG6oXQgdHLDqm4gbeG6oW5n"),
smoking: _lhD("VGh14buRYyBsw6EsIHZhcGU="),
drugs: _lhD("Q2jhuqV0IGPhuqVtLCDEkeG7kyBs4bqh"),
weapon: _lhD("SHVuZyBraMOtLCBuZ3V5IGhp4buDbQ=="),
traffic: _lhD("QW4gdG/DoG4gZ2lhbyB0aMO0bmc="),
other: _lhD("VmkgcGjhuqFtIGtow6Fj"),
};
const STATUS_TONE = { pending: '', verifying: _lhD("d2Fybg=="), reminded: _lhD("aW5mbw=="), disciplined: _lhD("YmFk"), recorded: _lhD("YmFk"), resolved: _lhD("b2s="), archived: '' };
const photos = [];
const draw = () => {
view.innerHTML = head(_lhD("VOG7kSBnacOhYyB2aSBwaOG6oW0="), _lhD("QsOhbyBjw6FvIG5oYW5oIGjDoG5oIHZpIGLhuqFvIGzhu7FjLCBi4bqvdCBu4bqhdCwgdOG7hyBu4bqhbiBo4buNYyDEkcaw4budbmcuIELhuqNvIG3huq10IGRhbmggdMOtbmggdHV54buHdCDEkeG7kWku")) + `${_lhD("CiAgICAgIDxkaXYgY2xhc3M9InNlZyByZXAtdGFicyI+PGJ1dHRvbiBkYXRhLXQ9Im5ldyIgY2xhc3M9Ig==")}${tab === _lhD("bmV3") ? _lhD("YWN0aXZl") : ''}${_lhD("Ij4=")}${icon(_lhD("Y2FtZXJh"))}${_lhD("IEfhu61pIHThu5EgZ2nDoWM8L2J1dHRvbj48YnV0dG9uIGRhdGEtdD0iaGlzdG9yeSIgY2xhc3M9Ig==")}${tab === _lhD("aGlzdG9yeQ==") ? _lhD("YWN0aXZl") : ''}${_lhD("Ij4=")}${icon(_lhD("aGlzdG9yeQ=="))}${_lhD("IEzhu4tjaCBz4butICg=")}${mine.items.length}${_lhD("KTwvYnV0dG9uPjwvZGl2PgogICAgICA=")}${tab === _lhD("bmV3") ? `${_lhD("CiAgICAgIDxkaXYgY2xhc3M9ImdyaWQgZy1tYWluIHJlcC1sYXlvdXQiPgogICAgICAgIDxmb3JtIGNsYXNzPSJjYXJkIHJlcC1jYXJkIiBpZD0icmYiIG5vdmFsaWRhdGU+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJjYXJkLWJvZHkgc3RhY2sgcmVwLXN0YWNrIj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0iZmllbGQiPgogICAgICAgICAgICAgIDxkaXYgY2xhc3M9InJvdyBiZXR3ZWVuIj48c3BhbiBjbGFzcz0ibGFiZWwiPkxv4bqhaSB2aSBwaOG6oW08L3NwYW4+PHNwYW4gY2xhc3M9InhzIG11dGVkIj5DaOG7jW4gMSBuaMOzbTwvc3Bhbj48L2Rpdj4KICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJyZXAtdHlwZS1ncmlkIj4=")}${Object.entries(types).map(([k, t], i) => `${_lhD("PGxhYmVsIGNsYXNzPSJyZXAtdHlwZSIgdGl0bGU9Ig==")}${esc(t.label)}${_lhD("Ij48aW5wdXQgdHlwZT0icmFkaW8iIG5hbWU9InR5cGUiIHZhbHVlPSI=")}${k}${_lhD("IiA=")}${i === 0 ? _lhD("Y2hlY2tlZA==") : ''}${_lhD("PjxzcGFuIGNsYXNzPSJydC1pY28iPg==")}${icon(TYPE_ICON[k])}${_lhD("PC9zcGFuPjxzcGFuIGNsYXNzPSJydC10eHQiPg==")}${esc(TYPE_SHORT[k] || t.label)}${_lhD("PC9zcGFuPjwvbGFiZWw+")}`).join('')}${_lhD("PC9kaXY+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJyZXAtcm93MiI+CiAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iZmllbGQiPgogICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0icm93IGJldHdlZW4iPjxsYWJlbCBmb3I9ImxvYyI+xJDhu4thIMSRaeG7g208L2xhYmVsPjxidXR0b24gdHlwZT0iYnV0dG9uIiBjbGFzcz0icmVwLWdwcy1idG4iIGlkPSJ1c2VMb2MiPg==")}${icon(_lhD("dGFyZ2V0"))}${_lhD("IFbhu4sgdHLDrSBoaeG7h24gdOG6oWk8L2J1dHRvbj48L2Rpdj4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9ImlucHV0LWljb24iPg==")}${icon(_lhD("cGlu"))}${_lhD("PGlucHV0IGlkPSJsb2MiIG5hbWU9ImxvY2F0aW9uIiBwbGFjZWhvbGRlcj0iVkQ6IEPhu5VuZyBwaOG7pSwgaMOgbmggbGFuZyBkw6N5IELigKYiIG1heGxlbmd0aD0iMjAwIiByZXF1aXJlZD48L2Rpdj4KICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJmaWVsZCI+CiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPSJhdCI+VGjhu51pIGdpYW4geOG6o3kgcmE8L2xhYmVsPgogICAgICAgICAgICAgICAgPGlucHV0IGlkPSJhdCIgbmFtZT0ib2NjdXJyZWRBdCIgdHlwZT0iZGF0ZXRpbWUtbG9jYWwiIHZhbHVlPSI=")}${new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}${_lhD("Ij4KICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9ImZpZWxkIj4KICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJyb3cgYmV0d2VlbiI+PGxhYmVsIGZvcj0iZGVzYyI+TcO0IHThuqMgc+G7sSB2aeG7h2M8L2xhYmVsPjxzcGFuIGNsYXNzPSJ4cyBtdXRlZCIgaWQ9ImNudCI+MC8zMDAwIMK3IHThu5FpIHRoaeG7g3UgMTAga8O9IHThu7E8L3NwYW4+PC9kaXY+CiAgICAgICAgICAgICAgPHRleHRhcmVhIGlkPSJkZXNjIiBuYW1lPSJkZXNjcmlwdGlvbiIgcm93cz0iMyIgbWF4bGVuZ3RoPSIzMDAwIiBwbGFjZWhvbGRlcj0iTcO0IHThuqMgbmfhuq9uIGfhu41uOiBjaHV54buHbiBnw6wgeOG6o3kgcmEsIHPhu5EgbmfGsOG7nWksIMSR4bq3YyDEkWnhu4NtIG5o4bqtbiBk4bqhbmfigKYiIHJlcXVpcmVkPjwvdGV4dGFyZWE+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJmaWVsZCI+CiAgICAgICAgICAgICAgPGRpdiBjbGFzcz0icm93IGJldHdlZW4iPjxzcGFuIGNsYXNzPSJsYWJlbCI+4bqibmggbWluaCBjaOG7qW5nIDxzcGFuIGNsYXNzPSJtdXRlZCIgc3R5bGU9ImZvbnQtd2VpZ2h0OjQwMCI+KHThu5FpIMSRYSA0IOG6o25oKTwvc3Bhbj48L3NwYW4+PHNwYW4gY2xhc3M9InhzIG11dGVkIiBpZD0icGhDb3VudCI+")}${photos.length}${_lhD("LzQg4bqjbmg8L3NwYW4+PC9kaXY+CiAgICAgICAgICAgICAgPGRpdiBjbGFzcz0icmVwLWR6IiBpZD0iZHoiPgogICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPSJidXR0b24iIGNsYXNzPSJidG4gcmVwLWR6LWJ0biIgaWQ9ImNhbUdvIj4=")}${icon(_lhD("Y2FtZXJh"))}${_lhD("IENo4bulcCDhuqNuaDwvYnV0dG9uPgogICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPSJidG4gc29mdCByZXAtZHotYnRuIj4=")}${icon(_lhD("aW1hZ2U="))}${_lhD("IENo4buNbiB0aMawIHZp4buHbjxpbnB1dCB0eXBlPSJmaWxlIiBpZD0icGgiIGFjY2VwdD0iaW1hZ2UvKiIgbXVsdGlwbGUgaGlkZGVuPjwvbGFiZWw+CiAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgPGRpdiBjbGFzcz0idGh1bWJzIiBpZD0idGh1bWJzIj48L2Rpdj4KICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0icmVwLWFub24tYmFyIiBmb3I9ImFub24iPgogICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJyZXAtYW5vbi1pY28iPg==")}${icon(_lhD("ZXllT2Zm"))}${_lhD("PC9zcGFuPgogICAgICAgICAgICAgIDxkaXYgY2xhc3M9Imdyb3ciIHN0eWxlPSJtaW4td2lkdGg6MCI+CiAgICAgICAgICAgICAgICA8Yj5H4butaSDhuqluIGRhbmg8L2I+CiAgICAgICAgICAgICAgICA8c3Bhbj5HaeG6pXUgaG/DoG4gdG/DoG4gaOG7jSB0w6puICYgTVNIUyDCtyB24bqrbiB0aGVvIGTDtWkgxJHGsOG7o2MgdGnhur9uIMSR4buZPC9zcGFuPgogICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJzd2l0Y2giPjxpbnB1dCB0eXBlPSJjaGVja2JveCIgbmFtZT0iYW5vbnltb3VzIiBpZD0iYW5vbiIgY2hlY2tlZD48c3BhbiBjbGFzcz0idHJhY2siPjwvc3Bhbj48L3NwYW4+CiAgICAgICAgICAgIDwvbGFiZWw+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICAgIDxkaXYgY2xhc3M9ImNhcmQtZm9vdCByZXAtZm9vdCI+CiAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJ4cyBtdXRlZCI+")}${icon(_lhD("bG9jaw=="))}${_lhD("IE3DoyBow7NhIGLhuqNvIG3huq10IMK3IGNo4buJIEJhbiBHacOhbSB0aOG7iyB4ZW0gxJHGsOG7o2M8L3NwYW4+CiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBhY2NlbnQgcmVwLXN1Ym1pdCIgaWQ9InNlbmQiPg==")}${icon(_lhD("c2VuZA=="))}${_lhD("IEfhu61pIHThu5EgZ2nDoWM8L2J1dHRvbj4KICAgICAgICAgIDwvZGl2PgogICAgICAgIDwvZm9ybT4KICAgICAgICA8YXNpZGUgY2xhc3M9InN0YWNrIHJlcC1hc2lkZSI+CiAgICAgICAgICA8c2VjdGlvbiBjbGFzcz0iY2FyZCBwYWQgc3RhY2siIHN0eWxlPSJnYXA6OHB4O3BhZGRpbmc6MTRweCAxNnB4O2JhY2tncm91bmQ6dmFyKC0td2Fybi1zb2Z0KTtib3JkZXItY29sb3I6dHJhbnNwYXJlbnQiPjxiIGNsYXNzPSJzbWFsbCIgc3R5bGU9ImNvbG9yOnZhcigtLXdhcm4pIj4=")}${icon(_lhD("YWxlcnQ="))}${_lhD("IE5ndXnDqm4gdOG6r2MgYW4gdG/DoG48L2I+PHVsIGNsYXNzPSJ4cyBpbmsyIiBzdHlsZT0ibWFyZ2luOjA7cGFkZGluZy1sZWZ0OjE2cHg7ZGlzcGxheTpncmlkO2dhcDo0cHgiPjxsaT5DaOG7iSBjaOG7pXAg4bqjbmgg4bufIHbhu4sgdHLDrSBhbiB0b8Ogbiwga8OtbiDEkcOhbywgZ2nhu68ga2hv4bqjbmcgY8OhY2guPC9saT48bGk+S2jDtG5nIMSRxINuZyBsw6puIG3huqFuZyB4w6MgaOG7mWkgdHLGsOG7m2Mga2hpIG5ow6AgdHLGsOG7nW5nIHjDoWMgbWluaC48L2xpPjxsaT5LaOG6qW4gY+G6pXAgZ+G7jWkgbmdheSA8Yj4xMTM8L2I+IChDw7RuZyBhbikgaG/hurdjIDxiPjExMTwvYj4gKELhuqNvIHbhu4cgdHLhursgZW0pLjwvbGk+PC91bD48L3NlY3Rpb24+CiAgICAgICAgICA8c2VjdGlvbiBjbGFzcz0iY2FyZCBwYWQgc3RhY2sgaGlkZS1zbSIgc3R5bGU9ImdhcDo4cHg7cGFkZGluZzoxNHB4IDE2cHgiPjxiIGNsYXNzPSJzbWFsbCI+")}${icon(_lhD("cm91dGU="))}${_lhD("IFF1eSB0csOsbmggMyBixrDhu5tjPC9iPjxkaXYgY2xhc3M9InRpbWVsaW5lIj4=")}${[[_lhD("MS4gVGnhur9wIG5o4bqtbiBtw6MgaMOzYQ=="), _lhD("Q2h1eeG7g24gdGjhurNuZyB04bubaSBCYW4gR2nDoW0gdGjhu4su")], [_lhD("Mi4gWMOhYyBtaW5oIG5oYW5o"), _lhD("S2nhu4NtIHRyYSBoaeG7h24gdHLGsOG7nW5nICYgY2FtZXJhLg==")], [_lhD("My4gWOG7rSBsw70gJiBwaOG6o24gaOG7k2k="), _lhD("VGjDtG5nIGLDoW8ga+G6v3QgcXXhuqMgdHLhu7FjIHRp4bq/cCB0csOqbiDhu6luZyBk4bulbmcu")]].map(([t, d], i) => `${_lhD("PGRpdiBjbGFzcz0idGwg")}${i === 0 ? _lhD("ZG9uZQ==") : ''}${_lhD("Ij48Yj4=")}${t}${_lhD("PC9iPjxwPg==")}${d}${_lhD("PC9wPjwvZGl2Pg==")}`).join('')}${_lhD("PC9kaXY+PC9zZWN0aW9uPgogICAgICAgIDwvYXNpZGU+CiAgICAgIDwvZGl2Pg==")}` : `${_lhD("CiAgICAgIDxkaXYgY2xhc3M9InN0YWNrIj4=")}${mine.items.length ? mine.items.map(r => `${_lhD("PGRpdiBjbGFzcz0iY2FyZCBob3ZlciByb3cgbm93cmFwIiBkYXRhLXJlcD0i")}${r.id}${_lhD("IiBzdHlsZT0icGFkZGluZzoxMnB4IDE1cHg7Z2FwOjEycHg7YWxpZ24taXRlbXM6c3RyZXRjaCI+PHNwYW4gY2xhc3M9InNldiA=")}${r.severity}${_lhD("Ij48L3NwYW4+CiAgICAgICAgPGRpdiBjbGFzcz0iZ3JvdyBzdGFjayIgc3R5bGU9ImdhcDozcHgiPjxkaXYgY2xhc3M9InJvdyIgc3R5bGU9ImdhcDo2cHgiPjxiIGNsYXNzPSJtb25vIHNtYWxsIj4=")}${r.id}${_lhD("PC9iPg==")}${badge(r.statusName, STATUS_TONE[r.status])}${r.anonymous ? badge(_lhD("4bqobiBkYW5o"), _lhD("dmlvbGV0")) : ''}${_lhD("PC9kaXY+PGIgY2xhc3M9InNtYWxsIj4=")}${esc(r.typeName)}${_lhD("PC9iPjxzcGFuIGNsYXNzPSJ4cyBtdXRlZCB0cnVuY2F0ZSI+")}${icon(_lhD("cGlu"))} ${esc(r.location)}${_lhD("PC9zcGFuPjwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9InN0YWNrIiBzdHlsZT0iYWxpZ24taXRlbXM6ZmxleC1lbmQ7Z2FwOjRweDtmbGV4Om5vbmUiPjxzcGFuIGNsYXNzPSJ4cyBtdXRlZCI+")}${ago(r.createdAt)}${_lhD("PC9zcGFuPg==")}${r.photos?.length ? `${_lhD("PHNwYW4gY2xhc3M9InhzIG11dGVkIj4=")}${icon(_lhD("aW1hZ2U="))} ${r.photos.length}${_lhD("PC9zcGFuPg==")}` : ''}${icon(_lhD("Y2hldnJvblJpZ2h0"))}${_lhD("PC9kaXY+PC9kaXY+")}`).join('') : empty(_lhD("QuG6oW4gY2jGsGEgZ+G7rWkgdOG7kSBnacOhYyBuw6Bv"), _lhD("TeG7l2kgdOG7kSBnacOhYyBnacO6cCB0csaw4budbmcgaOG7jWMgYW4gdG/DoG4gaMahbi4="), _lhD("c2hpZWxk"))}${_lhD("PC9kaXY+")}`}`;
$$(_lhD("W2RhdGEtdF0="), view).forEach(b => b.onclick = () => { tab = b.dataset.t; draw(); });
$$(_lhD("W2RhdGEtcmVwXQ=="), view).forEach(c => c.onclick = () => openReport(mine.items.find(x => x.id === c.dataset.rep), STATUS_TONE));
if (tab !== _lhD("bmV3")) return;
const desc = $(_lhD("I2Rlc2M=")); desc.oninput = () => ($(_lhD("I2NudA==")).textContent = `${desc.value.length}${_lhD("LzMwMDAgwrcgdOG7kWkgdGhp4buDdSAxMCBrw70gdOG7sQ==")}`);
const drawThumbs = () => {
if ($(_lhD("I3BoQ291bnQ="))) $(_lhD("I3BoQ291bnQ=")).textContent = `${photos.length}${_lhD("LzQg4bqjbmg=")}`;
$(_lhD("I3RodW1icw==")).innerHTML = photos.map((p, i) => `${_lhD("PGRpdiBjbGFzcz0idGh1bWIiPjxpbWcgc3JjPSI=")}${p}${_lhD("IiBhbHQ9IuG6om5oIA==")}${i + 1}${_lhD("Ij48YnV0dG9uIHR5cGU9ImJ1dHRvbiIgZGF0YS1ybT0i")}${i}${_lhD("IiBhcmlhLWxhYmVsPSJYw7NhIOG6o25oIj4=")}${icon(_lhD("eA=="))}${_lhD("PC9idXR0b24+PC9kaXY+")}`).join('');
$$(_lhD("W2RhdGEtcm1d")).forEach(b => b.onclick = () => { photos.splice(+b.dataset.rm, 1); drawThumbs(); });
};
drawThumbs();
const addFiles = async (files) => { for (const f of [...files].slice(0, 4 - photos.length)) { try { photos.push(await compressImage(f)); } catch (e) { showError(e); } } drawThumbs(); };
$(_lhD("I3Bo")).onchange = (e) => addFiles(e.target.files);
const addShots = (arr) => { const room = 4 - photos.length; photos.push(...arr.slice(0, room)); drawThumbs(); if (arr.length > room) toast(_lhD("TeG7l2kgdOG7kSBnacOhYyDEkcOtbmgga8OobSB04buRaSDEkWEgNCDhuqNuaC4="), _lhD("d2Fybg==")); else toast(`${_lhD("xJDDoyDEkcOtbmgga8OobSA=")}${arr.length}${_lhD("IOG6o25oLiBIw6N5IGNo4buNbiBsb+G6oWkgdmkgcGjhuqFtLCDEkeG7i2EgxJFp4buDbSB2w6AgbcO0IHThuqMgcuG7k2kgZ+G7rWku")}`, _lhD("b2s="), 3500); };
S.addReportPhotos = addShots;
if (S.pendingPhotos) { addShots(S.pendingPhotos); S.pendingPhotos = null; }
$(_lhD("I2NhbUdv")).onclick = async () => { if (photos.length >= 4) return toast(_lhD("xJDDoyDEkeG7pyA0IOG6o25oLg=="), _lhD("d2Fybg==")); const r = await openCamera({ max: 4 - photos.length, title: _lhD("Q2jhu6VwIOG6o25oIHThu5EgZ2nDoWM="), hint: _lhD("Q2jhu6VwIHLDtSBoaeG7h24gdHLGsOG7nW5nLCB0csOhbmggbOG7mSBraHXDtG4gbeG6t3QgY+G7p2EgYuG6oW4u") }); if (r) addShots(r); };
const dz = $(_lhD("I2R6")); dz.ondragover = (e) => { e.preventDefault(); dz.classList.add(_lhD("ZHJhZw==")); }; dz.ondragleave = () => dz.classList.remove(_lhD("ZHJhZw==")); dz.ondrop = (e) => { e.preventDefault(); dz.classList.remove(_lhD("ZHJhZw==")); addFiles(e.dataTransfer.files); };
$(_lhD("I3VzZUxvYw==")).onclick = async () => { const p = await getPosition(); if (p) { $(_lhD("I2xvYw==")).value = ($(_lhD("I2xvYw==")).value ? $(_lhD("I2xvYw==")).value + _lhD("IMK3IA==") : '') + `${_lhD("VOG7jWEgxJHhu5kg")}${p.lat.toFixed(5)}${_lhD("LCA=")}${p.lng.toFixed(5)}`; toast(_lhD("xJDDoyB0aMOqbSB04buNYSDEkeG7mSB24buLIHRyw60gaGnhu4duIHThuqFpLg=="), _lhD("b2s=")); } else toast(_lhD("S2jDtG5nIGzhuqV5IMSRxrDhu6NjIHbhu4sgdHLDrS4gSMOjeSBuaOG6rXAgxJHhu4thIMSRaeG7g20gdGjhu6cgY8O0bmcu"), _lhD("d2Fybg==")); };
$(_lhD("I3Jm")).onsubmit = async (e) => {
e.preventDefault();
const f = formData(e.target);
if (!f.location.trim()) return toast(_lhD("VnVpIGzDsm5nIG5o4bqtcCDEkeG7i2EgxJFp4buDbSB44bqjeSByYSBz4buxIHZp4buHYy4="), _lhD("d2Fybg=="));
if (f.description.trim().length < 10) return toast(_lhD("TcO0IHThuqMgY+G6p24gw610IG5o4bqldCAxMCBrw70gdOG7sSDEkeG7gyBuaMOgIHRyxrDhu51uZyB4w6FjIG1pbmgu"), _lhD("d2Fybg=="));
await withBusy($(_lhD("I3NlbmQ=")), async () => {
try {
const r = await api.post(_lhD("YXBpL3JlcG9ydHM="), { ...f, photos });
mine.items.unshift(r.item); photos.length = 0;
modal({ title: _lhD("xJDDoyBn4butaSB04buRIGdpw6Fj"), body: `${_lhD("PGRpdiBjbGFzcz0iZW1wdHkiIHN0eWxlPSJwYWRkaW5nOjZweCI+PGRpdiBjbGFzcz0iYXJ0IiBzdHlsZT0iYmFja2dyb3VuZDp2YXIoLS1vay1zb2Z0KTtjb2xvcjp2YXIoLS1vaykiPg==")}${icon(_lhD("c2hpZWxkQ2hlY2s="))}${_lhD("PC9kaXY+PGg0PkPhuqNtIMahbiBi4bqhbiDEkcOjIGzDqm4gdGnhur9uZyE8L2g0PjxwIGNsYXNzPSJzbWFsbCI+TcOjIGjhu5Mgc8ahIGPhu6dhIGLhuqFuPC9wPjxiIGNsYXNzPSJtb25vIiBzdHlsZT0iZm9udC1zaXplOjEuM3JlbTtjb2xvcjp2YXIoLS1pbmspIj4=")}${r.item.id}${_lhD("PC9iPjxwIGNsYXNzPSJzbWFsbCI+")}${r.item.anonymous ? _lhD("SOG7kyBzxqEg4bqpbiBkYW5oOiBkYW5oIHTDrW5oIGPhu6dhIGLhuqFuIGtow7RuZyDEkcaw4bujYyBsxrB1Lg==") : _lhD("TmjDoCB0csaw4budbmcgc+G6vSBwaOG6o24gaOG7k2kga+G6v3QgcXXhuqMgcXVhIHRow7RuZyBiw6FvLg==")}${_lhD("PC9wPjwvZGl2Pg==")}`, foot: _lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIiBkYXRhLWNsb3NlPlhlbSB0aeG6v24gxJHhu5k8L2J1dHRvbj4="), onClose: () => { tab = _lhD("aGlzdG9yeQ=="); draw(); } });
} catch (er) { showError(er); }
});
};
};
draw();
},
async mood(view) {
const m = await api.get(_lhD("YXBpL21vb2Q="));
let pick = m.today?.mood || null;
const days = [...Array(14)].map((_, i) => { const d = new Date(Date.now() - (13 - i) * 86400000); const key = d.toDateString(); const e = m.history.find(h => new Date(h.at).toDateString() === key); return { d, e }; });
const total = Object.values(m.counts).reduce((a, b) => a + b, 0) || 1;
view.innerHTML = head(_lhD("Q+G6o20geMO6YyAmIHRoxrAgZ2nDo24="), _lhD("R2hpIGzhuqFpIGPhuqNtIHjDumMgbeG7l2kgbmfDoHkgZ2nDunAgYuG6oW4gaGnhu4N1IGLhuqNuIHRow6JuIGjGoW4uIENo4buJIGLhuqFuIHhlbSDEkcaw4bujYyBuaOG6rXQga8O9IG7DoHku")) + `${_lhD("CiAgICA8ZGl2IGNsYXNzPSJncmlkIGctbWFpbiI+CiAgICAgIDxkaXYgY2xhc3M9InN0YWNrIGxnIj4KICAgICAgICA8c2VjdGlvbiBjbGFzcz0iY2FyZCI+PGRpdiBjbGFzcz0iY2FyZC1oZWFkIj48ZGl2PjxoMj5Iw7RtIG5heSBi4bqhbiBj4bqjbSB0aOG6pXkgdGjhur8gbsOgbz88L2gyPjxkaXYgY2xhc3M9InN1YiI+")}${m.today ? `${_lhD("TOG6p24gZ2hpIGfhuqduIG5o4bqldDog")}${m.moods[m.today.mood].label}${_lhD("IGzDumMg")}${fmtTime(m.today.at)}` : _lhD("Q2jhu41uIG3hu5l0IGJp4buDdSBj4bqjbSBn4bqnbiBuaOG6pXQgduG7m2kgYuG6oW4=")}${_lhD("PC9kaXY+PC9kaXY+PC9kaXY+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJjYXJkLWJvZHkgc3RhY2siPgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJtb29kcyI+")}${Object.entries(m.moods).map(([k, x]) => `${_lhD("PGJ1dHRvbiBjbGFzcz0ibW9vZCA=")}${pick === k ? _lhD("YWN0aXZl") : ''}${_lhD("IiBkYXRhLW09Ig==")}${k}${_lhD("IiBzdHlsZT0iLS1tYzo=")}${x.tone}${_lhD("Ij4=")}${moodFace(k, x.tone)}${_lhD("PHNwYW4+")}${x.label}${_lhD("PC9zcGFuPjwvYnV0dG9uPg==")}`).join('')}${_lhD("PC9kaXY+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9ImZpZWxkIj48bGFiZWwgZm9yPSJub3RlIj5HaGkgY2jDuiAoa2jDtG5nIGLhuq90IGJ14buZYyk8L2xhYmVsPjx0ZXh0YXJlYSBpZD0ibm90ZSIgbWF4bGVuZ3RoPSI1MDAiIHBsYWNlaG9sZGVyPSLEkGnhu4F1IGfDrCBraGnhur9uIGLhuqFuIGPhuqNtIHRo4bqleSBuaMawIHbhuq15PyIgc3R5bGU9Im1pbi1oZWlnaHQ6NzJweCI+PC90ZXh0YXJlYT48L2Rpdj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0icm93IGJldHdlZW4iPjxzcGFuIGNsYXNzPSJzbWFsbCBtdXRlZCI+")}${icon(_lhD("bG9jaw=="))}${_lhD("IFJpw6puZyB0xrAsIGtow7RuZyBjaGlhIHPhursgduG7m2kgYuG6oW4gYsOoPC9zcGFuPjxidXR0b24gY2xhc3M9ImJ0biIgaWQ9InNhdmVNb29kIj4=")}${icon(_lhD("Y2hlY2s="))}${_lhD("IEzGsHUgY+G6o20geMO6YzwvYnV0dG9uPjwvZGl2PgogICAgICAgICAgICA8ZGl2IGlkPSJhZHZpY2UiPjwvZGl2PgogICAgICAgICAgPC9kaXY+PC9zZWN0aW9uPgogICAgICAgIDxzZWN0aW9uIGNsYXNzPSJjYXJkIj48ZGl2IGNsYXNzPSJjYXJkLWhlYWQiPjxkaXY+PGgyPg==")}${icon(_lhD("d2luZA=="))}${_lhD("IELDoGkgdOG6rXAgdGjhu58gNC03LTg8L2gyPjxkaXYgY2xhc3M9InN1YiI+R2nDunAgaOG6oSBuaOG7i3AgdGltLCBnaeG6o20gbG8gw6J1IHRyxrDhu5tjIGdp4budIGtp4buDbSB0cmE8L2Rpdj48L2Rpdj48c3BhbiBjbGFzcz0iYmFkZ2UiIGlkPSJjeWNsZXMiPjAvNCBsxrDhu6N0PC9zcGFuPjwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzcz0iY2FyZC1ib2R5Ij48ZGl2IGNsYXNzPSJicmVhdGgiPjxkaXYgY2xhc3M9Im9yYiIgaWQ9Im9yYiI+U+G6tW4gc8Ogbmc8L2Rpdj48cCBjbGFzcz0ic21hbGwgbXV0ZWQiIGlkPSJiaGludCIgc3R5bGU9InRleHQtYWxpZ246Y2VudGVyIj5Iw610IHbDoG8gNCBnacOieSDCtyBnaeG7ryA3IGdpw6J5IMK3IHRo4bufIHJhIDggZ2nDonk8L3A+PGJ1dHRvbiBjbGFzcz0iYnRuIiBpZD0iYnN0YXJ0Ij4=")}${icon(_lhD("cGxheQ=="))}${_lhD("IELhuq90IMSR4bqndTwvYnV0dG9uPjwvZGl2PjwvZGl2Pjwvc2VjdGlvbj4KICAgICAgPC9kaXY+CiAgICAgIDxhc2lkZSBjbGFzcz0ic3RhY2sgbGciPgogICAgICAgIDxzZWN0aW9uIGNsYXNzPSJjYXJkIj48ZGl2IGNsYXNzPSJjYXJkLWhlYWQiPjxoMj4xNCBuZ8OgeSBxdWE8L2gyPjwvZGl2PjxkaXYgY2xhc3M9ImNhcmQtYm9keSI+CiAgICAgICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OmdyaWQ7Z3JpZC10ZW1wbGF0ZS1jb2x1bW5zOnJlcGVhdCg3LDFmcik7Z2FwOjZweCI+")}${days.map(({ d, e }) => `${_lhD("PGRpdiB0aXRsZT0i")}${fmtDate(d)}${e ? _lhD("OiA=") + m.moods[e.mood].label : ''}${_lhD("IiBzdHlsZT0iYXNwZWN0LXJhdGlvOjE7Ym9yZGVyLXJhZGl1czoxMHB4O2Rpc3BsYXk6Z3JpZDtwbGFjZS1pdGVtczpjZW50ZXI7YmFja2dyb3VuZDo=")}${e ? m.moods[e.mood].tone : _lhD("dmFyKC0tc3VyZmFjZS0zKQ==")}${_lhD("O2NvbG9yOg==")}${e ? _lhD("IzNhMmExMA==") : _lhD("dmFyKC0tbXV0ZWQp")}${_lhD("O2ZvbnQtc2l6ZToxMXB4O2ZvbnQtd2VpZ2h0OjYwMCI+")}${d.getDate()}${_lhD("PC9kaXY+")}`).join('')}${_lhD("PC9kaXY+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJzdGFjayIgc3R5bGU9ImdhcDo4cHg7bWFyZ2luLXRvcDoxNnB4Ij4=")}${Object.entries(m.moods).map(([k, x]) => `${_lhD("PGRpdiBjbGFzcz0iaGJhciI+PHNwYW4gY2xhc3M9InNtYWxsIj4=")}${x.label}${_lhD("PC9zcGFuPjxkaXYgY2xhc3M9Im1ldGVyIiBzdHlsZT0iLS1jOg==")}${x.tone}${_lhD("Ij48aSBzdHlsZT0id2lkdGg6")}${m.counts[k] / total * 100}${_lhD("JSI+PC9pPjwvZGl2PjxiIGNsYXNzPSJzbWFsbCBudW0iPg==")}${m.counts[k]}${_lhD("PC9iPjwvZGl2Pg==")}`).join('')}${_lhD("PC9kaXY+CiAgICAgICAgPC9kaXY+PC9zZWN0aW9uPgogICAgICAgIDxzZWN0aW9uIGNsYXNzPSJjYXJkIHBhZCBzdGFjayI+PGI+")}${icon(_lhD("YnVsYg=="))}${_lhD("IEvhu7kgdGh14bqtdCA1LTQtMy0yLTE8L2I+PHAgY2xhc3M9InNtYWxsIGluazIiPktoaSBsbyBs4bqvbmcsIGjDo3kgZ+G7jWkgdMOqbiA8Yj41PC9iPiB0aOG7qSBi4bqhbiBuaMOsbiB0aOG6pXksIDxiPjQ8L2I+IHRo4bupIGNo4bqhbSDEkcaw4bujYywgPGI+MzwvYj4gw6JtIHRoYW5oIG5naGUgxJHGsOG7o2MsIDxiPjI8L2I+IG3DuWkgaMawxqFuZyB2w6AgPGI+MTwvYj4gduG7iyBi4bqhbiBj4bqjbSBuaOG6rW4uIEPDoWNoIG7DoHkgZ2nDunAgdMOibSB0csOtIHF1YXkgduG7gSBoaeG7h24gdOG6oWkuPC9wPjwvc2VjdGlvbj4KICAgICAgICA8c2VjdGlvbiBjbGFzcz0iY2FyZCBwYWQgc3RhY2siIHN0eWxlPSJiYWNrZ3JvdW5kOnZhcigtLXZpb2xldC1zb2Z0KTtib3JkZXItY29sb3I6dHJhbnNwYXJlbnQiPjxiPg==")}${icon(_lhD("aGVhcnRIYW5k"))}${_lhD("IEPhuqduIGFpIMSRw7MgbOG6r25nIG5naGU/PC9iPjxwIGNsYXNzPSJzbWFsbCBpbmsyIj5DaHV5w6puIHZpw6puIHTDom0gbMO9IGPhu6dhIHRyxrDhu51uZyBsdcO0biBz4bq1biBzw6BuZy4gQuG6oW4gY8OzIHRo4buDIG5o4bqvbiDhuqluIGRhbmguPC9wPjxhIGNsYXNzPSJidG4iIGhyZWY9IiNjb3Vuc2VsaW5nIiBzdHlsZT0iYmFja2dyb3VuZDp2YXIoLS12aW9sZXQpO2NvbG9yOiNmZmY7YWxpZ24tc2VsZjpmbGV4LXN0YXJ0Ij5OaOG6r24gY2h1ecOqbiB2acOqbiA=")}${icon(_lhD("YXJyb3dSaWdodA=="))}${_lhD("PC9hPjwvc2VjdGlvbj4KICAgICAgPC9hc2lkZT4KICAgIDwvZGl2Pg==")}`;
$$(_lhD("W2RhdGEtbV0="), view).forEach(b => b.onclick = () => { pick = b.dataset.m; $$(_lhD("W2RhdGEtbV0="), view).forEach(x => x.classList.toggle(_lhD("YWN0aXZl"), x === b)); });
$(_lhD("I3NhdmVNb29k")).onclick = (e) => withBusy(e.currentTarget, async () => {
if (!pick) return toast(_lhD("SMOjeSBjaOG7jW4gbeG7mXQgY+G6o20geMO6YyB0csaw4bubYyBuaMOpLg=="), _lhD("d2Fybg=="));
try {
const r = await api.post(_lhD("YXBpL21vb2Q="), { mood: pick, note: $(_lhD("I25vdGU=")).value });
$(_lhD("I2FkdmljZQ==")).innerHTML = `${_lhD("PGRpdiBjbGFzcz0iY2FyZCBzb2Z0IiBzdHlsZT0icGFkZGluZzoxNHB4IDE2cHg7Ym9yZGVyLWNvbG9yOg==")}${m.moods[pick].tone}${_lhD("Ij48Yj4=")}${icon(_lhD("c3BhcmtsZXM="))}${_lhD("IEfhu6NpIMO9IGNobyBi4bqhbjwvYj48cCBjbGFzcz0ic21hbGwgaW5rMiIgc3R5bGU9Im1hcmdpbi10b3A6NHB4Ij4=")}${esc(r.advice)}${_lhD("PC9wPg==")}${r.showHotline ? `${_lhD("PHAgY2xhc3M9InNtYWxsIiBzdHlsZT0ibWFyZ2luLXRvcDo4cHg7Y29sb3I6dmFyKC0tYmFkKSI+PGI+QuG6oW4ga2jDtG5nIMSRxqFuIMSR4buZYy48L2I+IEjDo3kgZ+G7jWkgMTExIGhv4bq3YyBuaOG6r24gY2h1ecOqbiB2acOqbiB0w6JtIGzDvSBuZ2F5IG5ow6kuPC9wPg==")}` : ''}${_lhD("PC9kaXY+")}`;
toast(_lhD("xJDDoyBsxrB1IGPhuqNtIHjDumMgaMO0bSBuYXku"), _lhD("b2s="));
} catch (er) { showError(er); }
});
let running = false, timer = null;
const orb = $(_lhD("I29yYg==")), hint = $(_lhD("I2JoaW50"));
const stop = () => { running = false; clearTimeout(timer); orb.className = _lhD("b3Ji"); orb.textContent = _lhD("U+G6tW4gc8Ogbmc="); $(_lhD("I2JzdGFydA==")).innerHTML = `${icon(_lhD("cGxheQ=="))}${_lhD("IELhuq90IMSR4bqndQ==")}`; };
const cycle = (n) => {
if (!running) return;
if (n >= 4) { stop(); hint.textContent = _lhD("VHV54buHdCB24budaSEgQuG6oW4gxJHDoyBob8OgbiB0aMOgbmggNCBsxrDhu6N0IHRo4bufLg=="); return; }
$(_lhD("I2N5Y2xlcw==")).textContent = `${n + 1}${_lhD("LzQgbMaw4bujdA==")}`;
orb.className = _lhD("b3JiIGlu"); orb.textContent = _lhD("SMOtdCB2w6Bv"); hint.textContent = _lhD("SMOtdCB2w6BvIHRo4bqtdCBzw6J1IGLhurFuZyBtxalp4oCmIDQgZ2nDonk=");
timer = setTimeout(() => { orb.className = _lhD("b3JiIGhvbGQ="); orb.textContent = _lhD("R2nhu68gaMahaQ=="); hint.textContent = _lhD("R2nhu68gaMahaeKApiA3IGdpw6J5");
timer = setTimeout(() => { orb.className = _lhD("b3JiIG91dA=="); orb.textContent = _lhD("VGjhu58gcmE="); hint.textContent = _lhD("VGjhu58gcmEgY2jhuq1tIGLhurFuZyBtaeG7h25n4oCmIDggZ2nDonk=");
timer = setTimeout(() => cycle(n + 1), 8000); }, 7000); }, 4000);
};
$(_lhD("I2JzdGFydA==")).onclick = () => { if (running) return stop(); running = true; $(_lhD("I2JzdGFydA==")).innerHTML = `${icon(_lhD("cGF1c2U="))}${_lhD("IEThu6tuZyBs4bqhaQ==")}`; cycle(0); };
S.cleanups.push(stop);
},
async counseling(view) {
const initData = await api.get(_lhD("YXBpL2NvdW5zZWxpbmcvdGhyZWFkcw=="));
let threads = initData.items, allThreads = initData.allItems || initData.items, current = null;
view.innerHTML = head(_lhD("VMawIHbhuqVuIHTDom0gbMO9"), _lhD("VMOibSBz4buxIHbhu5tpIGNodXnDqm4gdmnDqm4gdMOibSBsw70gaOG7jWMgxJHGsOG7nW5nIOKAlCBt4buXaSBjaHV5w6puIHZpw6puIG3hu5l0IGN14buZYyB0csOyIGNodXnhu4duIHJpw6puZywgYuG6o28gbeG6rXQgdHV54buHdCDEkeG7kWksIGPDsyB0aOG7gyBjaOG7jW4g4bqpbiBkYW5oIGhv4bq3YyBoaeG7h24gdMOqbiBi4bqldCBj4bupIGzDumMgbsOgby4="), `${_lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIGhpZGUtc20iIGlkPSJuZXdDIj4=")}${icon(_lhD("cGx1cw=="))}${_lhD("IE5o4bqvbiBjaHV5w6puIHZpw6puPC9idXR0b24+")}`) + `${_lhD("CiAgICA8c2VjdGlvbiBjbGFzcz0iY2FyZCBjaGF0LWxheW91dCIgaWQ9ImNsIj48ZGl2IGNsYXNzPSJ0aHJlYWRzIiBpZD0idGgiPjwvZGl2PjxkaXYgY2xhc3M9ImNoYXQiIGlkPSJjcCI+PC9kaXY+PC9zZWN0aW9uPg==")}`;
const pickCounselor = () => {
modal({
title: _lhD("Q2jhu41uIGNodXnDqm4gdmnDqm4gdMawIHbhuqVuIHTDom0gbMO9"),
sub: `${allThreads.length}${_lhD("IGNodXnDqm4gdmnDqm4gwrcgY2jhu41uIHRo4bqneSBjw7QgxJHhu4MgYuG6r3QgxJHhuqd1IHRyw7IgY2h1eeG7h24=")}`,
body: `${_lhD("PGRpdiBjbGFzcz0ibGlzdCIgaWQ9InBpY2tDTGlzdCIgc3R5bGU9Im1heC1oZWlnaHQ6NTh2aDtvdmVyZmxvdzphdXRvIj4=")}${allThreads.map(t => `${_lhD("PGRpdiBjbGFzcz0iaXRlbSBjbGljayIgZGF0YS1waWNrLWM9Ig==")}${t.id}${_lhD("Ij4=")}${avatar(t.counselor || { id: _lhD("Y291bnNlbG9y"), name: _lhD("Q2h1ecOqbiB2acOqbg==") })}${_lhD("PGRpdiBjbGFzcz0iZ3JvdyIgc3R5bGU9Im1pbi13aWR0aDowIj48YiBjbGFzcz0ic21hbGwgdHJ1bmNhdGUiIHN0eWxlPSJkaXNwbGF5OmJsb2NrIj4=")}${esc(t.counselor?.name || _lhD("Q2h1ecOqbiB2acOqbiB0w6JtIGzDvQ=="))}${_lhD("PC9iPjxkaXYgY2xhc3M9InhzIG11dGVkIHRydW5jYXRlIj4=")}${esc(t.counselor?.title || _lhD("VOG7lSB0w6JtIGzDvSBo4buNYyDEkcaw4budbmc="))}${_lhD("PC9kaXY+PC9kaXY+")}${icon(_lhD("Y2hldnJvblJpZ2h0"))}${_lhD("PC9kaXY+")}`).join('')}${_lhD("PC9kaXY+")}`,
onMount: (m, close) => {
$$(_lhD("W2RhdGEtcGljay1jXQ=="), m).forEach(el => el.onclick = async () => {
close();
await open(el.dataset.pickC);
});
},
});
};
if ($(_lhD("I25ld0M="), view)) $(_lhD("I25ld0M="), view).onclick = pickCounselor;
const drawThreads = () => {
$(_lhD("I2Ns"))?.classList.toggle(_lhD("aXMtZW1wdHk="), !threads.length && !current);
$(_lhD("I3Ro")).innerHTML = `${_lhD("PGRpdiBjbGFzcz0idGhyZWFkcy1oZWFkIj48c3BhbiBjbGFzcz0ieHMgbXV0ZWQgc3Ryb25nIj4=")}${icon(_lhD("c2hpZWxkQ2hlY2s="))}${_lhD("IELhuqNvIG3huq10IMK3IEjhu5cgdHLhu6MgMS0xPC9zcGFuPjxidXR0b24gY2xhc3M9ImJ0biBzbSIgaWQ9InRoTmV3QyI+")}${icon(_lhD("cGx1cw=="))}${_lhD("IE5o4bqvbiBjaHV5w6puIHZpw6puPC9idXR0b24+PC9kaXY+")}` + (threads.length ? `${_lhD("PGRpdiBjbGFzcz0ibGlzdCI+")}${threads.map(t => `${_lhD("PGRpdiBjbGFzcz0iaXRlbSBjbGljayA=")}${current?.id === t.id ? _lhD("YWN0aXZl") : ''}${_lhD("IiBkYXRhLXQ9Ig==")}${t.id}${_lhD("Ij4=")}${avatar(t.counselor || { id: _lhD("Y291bnNlbG9y"), name: _lhD("Q2h1ecOqbiB2acOqbg==") })}${_lhD("PGRpdiBjbGFzcz0iZ3JvdyIgc3R5bGU9Im1pbi13aWR0aDowIj48ZGl2IGNsYXNzPSJyb3cgYmV0d2VlbiBub3dyYXAiIHN0eWxlPSJnYXA6NnB4Ij48YiBjbGFzcz0ic21hbGwgdHJ1bmNhdGUiPg==")}${esc(t.counselor?.name || _lhD("Q2h1ecOqbiB2acOqbiB0w6JtIGzDvQ=="))}${_lhD("PC9iPjxzcGFuIGNsYXNzPSJ4cyBtdXRlZCBub3dyYXAiPg==")}${t.last ? ago(t.last.at) : ''}${_lhD("PC9zcGFuPjwvZGl2PjxkaXYgY2xhc3M9InhzIG11dGVkIHRydW5jYXRlIj4=")}${esc(t.counselor?.title || '')}${_lhD("IMK3IDxzcGFuIHN0eWxlPSJjb2xvcjo=")}${t.anonymous !== false ? _lhD("dmFyKC0tdmlvbGV0KQ==") : _lhD("dmFyKC0tYnJhbmQp")}${_lhD("O2ZvbnQtd2VpZ2h0OjYwMCI+")}${t.anonymous !== false ? _lhD("4bqobiBkYW5o") : _lhD("SGnhu4duIHTDqm4=")}${_lhD("PC9zcGFuPjwvZGl2PjxkaXYgY2xhc3M9InhzIHRydW5jYXRlIGluazIiIHN0eWxlPSJtYXJnaW4tdG9wOjJweCI+")}${t.last ? esc((t.last.from === _lhD("c3R1ZGVudA==") ? _lhD("QuG6oW46IA==") : '') + (t.last.recalled ? _lhD("VGluIG5o4bqvbiDEkcOjIHRodSBo4buTaQ==") : t.last.text || (t.last.attachments?.length ? _lhD("8J+TjiBU4buHcCDEkcOtbmgga8OobQ==") : ''))) : _lhD("Q2jGsGEgY8OzIHRpbiBuaOG6r24g4oCUIGLhuqVtIMSR4buDIGLhuq90IMSR4bqndQ==")}${_lhD("PC9kaXY+PC9kaXY+")}${t.unreadStudent ? `${_lhD("PHNwYW4gY2xhc3M9ImNvdW50LXBpbGwiPg==")}${t.unreadStudent}${_lhD("PC9zcGFuPg==")}` : ''}${_lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIGljb24gZ2hvc3Qgc20iIGRhdGEtZGVsLWM9Ig==")}${t.id}${_lhD("IiBzdHlsZT0iY29sb3I6dmFyKC0tYmFkKSIgYXJpYS1sYWJlbD0iWMOzYSBjdeG7mWMgdHLDsiBjaHV54buHbiIgdGl0bGU9IljDs2EgY3Xhu5ljIHRyw7IgY2h1eeG7h24iPg==")}${icon(_lhD("dHJhc2g="))}${_lhD("PC9idXR0b24+PC9kaXY+")}`).join('')}${_lhD("PC9kaXY+")}` : empty(_lhD("Q2jGsGEgY8OzIGN14buZYyB0csOyIGNodXnhu4du"), _lhD("Q2jhu41uIGNodXnDqm4gdmnDqm4gdMOibSBsw70gxJHhu4MgY2hpYSBz4bq7IOG6qW4gZGFuaCBob+G6t2MgaGnhu4duIHTDqm4u"), _lhD("aGVhcnRIYW5k"), `${_lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIHNtIiBpZD0iZW1wdHlOZXdDIiBzdHlsZT0ibWFyZ2luLXRvcDo0cHgiPg==")}${icon(_lhD("cGx1cw=="))}${_lhD("IENo4buNbiBjaHV5w6puIHZpw6puIMSR4buDIG5o4bqvbjwvYnV0dG9uPg==")}`));
if ($(_lhD("I3RoTmV3Qw=="), view)) $(_lhD("I3RoTmV3Qw=="), view).onclick = pickCounselor;
if ($(_lhD("I2VtcHR5TmV3Qw=="), view)) $(_lhD("I2VtcHR5TmV3Qw=="), view).onclick = pickCounselor;
$$(_lhD("W2RhdGEtdF0="), view).forEach(el => el.onclick = () => open(el.dataset.t));
$$(_lhD("W2RhdGEtZGVsLWNd"), view).forEach(el => el.onclick = async (e) => {
e.stopPropagation();
const t = threads.find(x => x.id === el.dataset.delC);
if (!await confirmDialog({ title: _lhD("WMOzYSBjdeG7mWMgdHLDsiBjaHV54buHbg=="), message: `${_lhD("WMOzYSBjdeG7mWMgdHLDsiBjaHV54buHbiB24bubaSA8Yj4=")}${esc(t?.counselor?.name || _lhD("Q2h1ecOqbiB2acOqbiB0w6JtIGzDvQ=="))}${_lhD("PC9iPiBraOG7j2kgZGFuaCBzw6FjaCBj4bunYSBi4bqhbj8=")}`, ok: _lhD("WMOzYQ=="), tone: _lhD("ZGFuZ2Vy") })) return;
await api.del(`${_lhD("YXBpL2NvdW5zZWxpbmcvdGhyZWFkcy8=")}${el.dataset.delC}`);
if (current?.id === el.dataset.delC) { current = null; $(_lhD("I2Ns")).classList.remove(_lhD("c2hvdy1jaGF0")); drawChat(); }
toast(_lhD("xJDDoyB4w7NhIGN14buZYyB0csOyIGNodXnhu4duLg=="), _lhD("b2s="));
refreshThreads();
});
};
const msgHtml = (m) => { const mine = m.from === _lhD("c3R1ZGVudA=="); return `${_lhD("PGRpdiBjbGFzcz0ibXNnIA==")}${mine ? _lhD("bWU=") : ''}${_lhD("Ij4=")}${!mine ? avatar({ id: current.counselor?.id || _lhD("Y291bnNlbG9y"), name: m.name || current.counselor?.name || _lhD("Q2h1ecOqbiB2acOqbg=="), avatar: current.counselor?.avatar }, _lhD("c20=")) : ''}${_lhD("PGRpdj4=")}${bubble(m, mine)}${_lhD("PGRpdiBjbGFzcz0idGltZSI+")}${fmtTime(m.at)}${_lhD("IMK3IA==")}${fmtDate(m.at)}${recallBtn(m, mine)}${_lhD("PC9kaXY+PC9kaXY+PC9kaXY+")}`; };
const setAnon = async (val) => {
if (!current) return;
try {
const r = await api.put(`${_lhD("YXBpL2NvdW5zZWxpbmcvdGhyZWFkcy8=")}${current.id}${_lhD("L2Fub255bW91cw==")}`, { anonymous: !!val });
current = r.item;
drawChat();
refreshThreads();
toast(current.anonymous ? _lhD("xJDDoyBi4bqtdCBjaOG6vyDEkeG7mSBuaOG6r24gdGluIOG6qW4gZGFuaC4=") : _lhD("xJDDoyBjaHV54buDbiBzYW5nIGNo4bq/IMSR4buZIGhp4buHbiB0w6puIHRo4bqtdC4="), _lhD("b2s="), 2200);
} catch (er) { showError(er); }
};
const drawChat = () => {
const cp = $(_lhD("I2Nw"));
if (!current) { cp.innerHTML = empty(_lhD("Q2jhu41uIG3hu5l0IGNodXnDqm4gdmnDqm4="), _lhD("Q3Xhu5ljIHRyw7IgY2h1eeG7h24gc+G6vSBoaeG7g24gdGjhu4sgdOG6oWkgxJHDonku"), _lhD("aGVhcnRIYW5k")); return; }
const c = current.counselor, started = current.messages.length > 0, hot = current.messages.some(x => x.guard?.level === _lhD("cmVk"));
const isAnon = current.anonymous !== false;
cp.innerHTML = `${_lhD("PGRpdiBjbGFzcz0iY2hhdC1oZWFkIj48YnV0dG9uIGNsYXNzPSJidG4gaWNvbiBnaG9zdCBzbSBiYWNrLWJ0biIgaWQ9ImJhY2siIGFyaWEtbGFiZWw9IlF1YXkgbOG6oWkiPg==")}${icon(_lhD("YXJyb3dMZWZ0"))}${_lhD("PC9idXR0b24+")}${avatar(c || { id: _lhD("Y291bnNlbG9y"), name: _lhD("Q2h1ecOqbiB2acOqbg==") }, _lhD("c20="))}${_lhD("PGRpdiBjbGFzcz0iZ3JvdyIgc3R5bGU9Im1pbi13aWR0aDowIj48YiBjbGFzcz0idHJ1bmNhdGUiPg==")}${esc(c?.name || _lhD("Q2h1ecOqbiB2acOqbiB0w6JtIGzDvQ=="))}${_lhD("PC9iPjxkaXYgY2xhc3M9InhzIG11dGVkIHRydW5jYXRlIj48c3BhbiBzdHlsZT0iY29sb3I6dmFyKC0tb2spIj7il488L3NwYW4+IA==")}${esc(c?.title || _lhD("U+G6tW4gc8OgbmcgbOG6r25nIG5naGU="))}${_lhD("PC9kaXY+PC9kaXY+PGJ1dHRvbiB0eXBlPSJidXR0b24iIGNsYXNzPSJidG4gc29mdCBzbSIgaWQ9ImFub25Ub2dnbGUiIHN0eWxlPSI=")}${isAnon ? _lhD("YmFja2dyb3VuZDp2YXIoLS12aW9sZXQtc29mdCk7Y29sb3I6dmFyKC0tdmlvbGV0KTtib3JkZXItY29sb3I6dHJhbnNwYXJlbnQ=") : ''}${_lhD("IiB0aXRsZT0iQuG6pW0gxJHhu4MgxJHhu5VpIGNo4bq/IMSR4buZIOG6qW4gZGFuaCAvIGhp4buHbiB0w6puIj4=")}${icon(isAnon ? _lhD("ZXllT2Zm") : _lhD("dXNlcg=="))} ${isAnon ? _lhD("4bqobiBkYW5o") : _lhD("SGnhu4duIHTDqm4=")}${_lhD("PC9idXR0b24+PGJ1dHRvbiB0eXBlPSJidXR0b24iIGNsYXNzPSJidG4gaWNvbiBnaG9zdCBzbSIgaWQ9ImRlbENvdW5zZWxDaGF0IiBzdHlsZT0iY29sb3I6dmFyKC0tYmFkKSIgdGl0bGU9IljDs2EgY3Xhu5ljIHRyw7IgY2h1eeG7h24iPg==")}${icon(_lhD("dHJhc2g="))}${_lhD("PC9idXR0b24+PC9kaXY+CiAgICAgICAg")}${hot ? `${_lhD("PHNlY3Rpb24gY2xhc3M9ImNhcmQgcGFkIHN0YWNrIiBpZD0iaG90IiBzdHlsZT0ibWFyZ2luOjhweCAxMHB4IDA7cGFkZGluZzoxMHB4IDEycHg7YmFja2dyb3VuZDp2YXIoLS1iYWQtc29mdCk7Ym9yZGVyLWNvbG9yOnRyYW5zcGFyZW50Ij48YiBjbGFzcz0ic21hbGwiIHN0eWxlPSJjb2xvcjp2YXIoLS1iYWQpIj4=")}${icon(_lhD("c2lyZW4="))}${_lhD("IELhuqFuIGtow7RuZyDEkcahbiDEkeG7mWM8L2I+PHAgY2xhc3M9InhzIGluazIiIHN0eWxlPSJtYXJnaW46MCI+TuG6v3UgxJFhbmcgZ+G6t3Agbmd1eSBoaeG7g20sIGjDo3kgZ+G7jWkgbmdheSA8Yj4xMTE8L2I+IGhv4bq3YyA8Yj4xMTU8L2I+LjwvcD48L3NlY3Rpb24+")}` : ''}${_lhD("CiAgICAgICAgPGRpdiBjbGFzcz0iY2hhdC1ib2R5IiBpZD0iY2IiPg==")}${started ? current.messages.map(msgHtml).join('') : `${_lhD("PGRpdiBjbGFzcz0iZW1wdHkiPjxkaXYgY2xhc3M9ImFydCIgc3R5bGU9ImJhY2tncm91bmQ6dmFyKC0tdmlvbGV0LXNvZnQpO2NvbG9yOnZhcigtLXZpb2xldCkiPg==")}${icon(_lhD("aGVhcnRIYW5k"))}${_lhD("PC9kaXY+PGg0PkLhuq90IMSR4bqndSBjdeG7mWMgdHLDsiBjaHV54buHbjwvaDQ+PHAgY2xhc3M9InNtYWxsIj5DaGlhIHPhursgY8O5bmcg")}${esc(c?.name || _lhD("Y2h1ecOqbiB2acOqbg=="))}${_lhD("LiBC4bqjbyBt4bqtdCB0dXnhu4d0IMSR4buRaTsgY2jhur8gxJHhu5kg4bqpbiBkYW5oIGtow7RuZyBn4butaSBo4buNIHTDqm4sIG3DoyBIUy4=")}${c?.phone ? `${_lhD("IEjhu5cgdHLhu6MgdHLhu7FjIHRp4bq/cDog")}${esc(c.phone)}${_lhD("Lg==")}` : ''}${_lhD("PC9wPjwvZGl2Pg==")}`}${_lhD("PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0iY2hhdC1hbm9uLWJhciI+CiAgICAgICAgICA8bGFiZWwgY2xhc3M9ImNoZWNrIj48aW5wdXQgdHlwZT0iY2hlY2tib3giIGlkPSJhbm9uIiA=")}${isAnon ? _lhD("Y2hlY2tlZA==") : ''}${_lhD("PjxzcGFuIGNsYXNzPSJ0cnVuY2F0ZSI+PGI+Tmjhuq9uIOG6qW4gZGFuaDwvYj4gwrcg")}${isAnon ? _lhD("R2nhuqV1IHTDqm4gJiBs4bubcA==") : `${_lhD("SGnhu4duIHTDqm4gKA==")}${esc(firstName(S.user?.name || ''))}${_lhD("KQ==")}`}${_lhD("PC9zcGFuPjwvbGFiZWw+CiAgICAgICAgICA8YnV0dG9uIHR5cGU9ImJ1dHRvbiIgY2xhc3M9ImJhZGdlIA==")}${isAnon ? _lhD("dmlvbGV0") : _lhD("aW5mbw==")}${_lhD("IiBpZD0iYW5vbkJhZGdlIiBzdHlsZT0iYm9yZGVyOjA7Y3Vyc29yOnBvaW50ZXIiPg==")}${icon(isAnon ? _lhD("bG9jaw==") : _lhD("dXNlcg=="))} ${isAnon ? _lhD("xJDDoyDhuqlu") : _lhD("SGnhu4duIHTDqm4=")}${_lhD("PC9idXR0b24+CiAgICAgICAgPC9kaXY+CiAgICAgICAgPGZvcm0gY2xhc3M9ImNoYXQtaW5wdXQiIGlkPSJjZiI+PHRleHRhcmVhIGlkPSJjdCIgcm93cz0iMSIgcGxhY2Vob2xkZXI9Ig==")}${isAnon ? _lhD("Tmjhuq9uIOG6qW4gZGFuaOKApg==") : _lhD("Tmjhuq1wIMSRaeG7gXUgbXXhu5FuIGNoaWEgc+G6u+KApg==")}${_lhD("IiBhcmlhLWxhYmVsPSJO4buZaSBkdW5nIHTDom0gc+G7sSI+PC90ZXh0YXJlYT48YnV0dG9uIGNsYXNzPSJidG4gaWNvbiIgYXJpYS1sYWJlbD0iR+G7rWkiPg==")}${icon(_lhD("c2VuZA=="))}${_lhD("PC9idXR0b24+PC9mb3JtPg==")}`;
const cb = $(_lhD("I2Ni")); cb.scrollTop = cb.scrollHeight;
cb.onclick = async (e) => { const b = e.target.closest(_lhD("W2RhdGEtcmVjYWxsXQ==")); if (!b) return; const r = await askRecall(`${_lhD("YXBpL2NvdW5zZWxpbmcvdGhyZWFkcy8=")}${current.id}${_lhD("L21lc3NhZ2VzLw==")}${b.dataset.recall}${_lhD("L3JlY2FsbA==")}`); if (r) { current = r.item; drawChat(); refreshThreads(); } };
$(_lhD("I2JhY2s=")).onclick = () => { $(_lhD("I2Ns")).classList.remove(_lhD("c2hvdy1jaGF0")); };
$(_lhD("I2Fub24=")).onchange = (e) => setAnon(e.target.checked);
$(_lhD("I2Fub25Ub2dnbGU=")).onclick = () => setAnon(!isAnon);
$(_lhD("I2Fub25CYWRnZQ==")).onclick = () => setAnon(!isAnon);
if ($(_lhD("I2RlbENvdW5zZWxDaGF0"))) $(_lhD("I2RlbENvdW5zZWxDaGF0")).onclick = async () => {
if (!await confirmDialog({ title: _lhD("WMOzYSBjdeG7mWMgdHLDsiBjaHV54buHbg=="), message: `${_lhD("WMOzYSBjdeG7mWMgdHLDsiBjaHV54buHbiB24bubaSA8Yj4=")}${esc(c?.name || _lhD("Q2h1ecOqbiB2acOqbiB0w6JtIGzDvQ=="))}${_lhD("PC9iPiBraOG7j2kgZGFuaCBzw6FjaCBj4bunYSBi4bqhbj8=")}`, ok: _lhD("WMOzYQ=="), tone: _lhD("ZGFuZ2Vy") })) return;
await api.del(`${_lhD("YXBpL2NvdW5zZWxpbmcvdGhyZWFkcy8=")}${current.id}`);
current = null; $(_lhD("I2Ns")).classList.remove(_lhD("c2hvdy1jaGF0")); drawChat(); refreshThreads(); toast(_lhD("xJDDoyB4w7NhIGN14buZYyB0csOyIGNodXnhu4duLg=="), _lhD("b2s="));
};
autoGrow($(_lhD("I2N0")), () => $(_lhD("I2Nm")).requestSubmit());
const comp = attachComposer($(_lhD("I2Nm")));
$(_lhD("I2Nm")).onsubmit = async (e) => { e.preventDefault(); const text = $(_lhD("I2N0")).value.trim(); $(_lhD("I2N0")).value = ''; const ok = await sendWithFiles(comp, text, async (b) => { const r = await api.post(`${_lhD("YXBpL2NvdW5zZWxpbmcvdGhyZWFkcy8=")}${current.id}${_lhD("L21lc3NhZ2Vz")}`, { ...b, anonymous: $(_lhD("I2Fub24="))?.checked ?? true }); current = r.item; }, $(_lhD("I2NmIGJ1dHRvblthcmlhLWxhYmVsPSJH4butaSJd"))); if (ok) { refreshThreads(); drawChat(); } else if (text) $(_lhD("I2N0")).value = text; };
};
const refreshThreads = async () => { const d = await api.get(_lhD("YXBpL2NvdW5zZWxpbmcvdGhyZWFkcw==")); threads = d.items; allThreads = d.allItems || d.items; drawThreads(); };
const open = async (id, forceAnon = null) => {
if (forceAnon !== null) current = (await api.put(`${_lhD("YXBpL2NvdW5zZWxpbmcvdGhyZWFkcy8=")}${id}${_lhD("L2Fub255bW91cw==")}`, { anonymous: !!forceAnon })).item;
else current = (await api.get(`${_lhD("YXBpL2NvdW5zZWxpbmcvdGhyZWFkcy8=")}${id}`)).item;
$(_lhD("I2Ns")).classList.add(_lhD("c2hvdy1jaGF0")); await refreshThreads(); drawChat(); refreshBadges();
};
drawThreads(); drawChat();
const wantCounselor = sessionStorage.getItem(_lhD("bGhfb3Blbl9jb3Vuc2Vsb3I="));
const wantAnon = sessionStorage.getItem(_lhD("bGhfb3Blbl9jb3Vuc2Vsb3JfYW5vbg=="));
sessionStorage.removeItem(_lhD("bGhfb3Blbl9jb3Vuc2Vsb3I="));
sessionStorage.removeItem(_lhD("bGhfb3Blbl9jb3Vuc2Vsb3JfYW5vbg=="));
const targetThread = wantCounselor && allThreads.find(t => t.counselor?.id === wantCounselor || t.counselorId === wantCounselor);
if (targetThread) open(targetThread.id, wantAnon !== null ? wantAnon === _lhD("MQ==") : null);
else if (threads[0] && innerWidth >= 1024) open(threads[0].id);
S.cleanups.push(live.on(_lhD("Y291bnNlbGluZzpyZXBseQ=="), async ({ threadId }) => { if (current?.id === threadId) { current = (await api.get(`${_lhD("YXBpL2NvdW5zZWxpbmcvdGhyZWFkcy8=")}${threadId}`)).item; drawChat(); } refreshThreads(); }));
},
async 'counsel-team'(view) {
let curYear = '', items = [], years = [];
const load = async (yr = curYear) => {
const r = await api.get(yr ? `${_lhD("YXBpL2NvdW5zZWwtdGVhbT95ZWFyPQ==")}${encodeURIComponent(yr)}` : _lhD("YXBpL2NvdW5zZWwtdGVhbQ=="));
items = r.items; curYear = r.year || yr; years = r.years || [];
};
await load();
const DN = [_lhD("Q04="), _lhD("VDI="), _lhD("VDM="), _lhD("VDQ="), _lhD("VDU="), _lhD("VDY="), _lhD("VDc=")];
const order = (d) => (d === 0 ? 7 : d);
const dayText = (days = []) => {
const ds = [...days].sort((a, b) => order(a) - order(b));
if (!ds.length) return '';
if (ds.length === 7) return _lhD("SOG6sW5nIG5nw6B5");
const runs = []; for (const d of ds) { const r = runs.at(-1); if (r && order(d) === order(r.at(-1)) + 1) r.push(d); else runs.push([d]); }
return runs.map(r => (r.length >= 3 ? `${DN[r[0]]}${_lhD("IOKAkyA=")}${DN[r.at(-1)]}` : r.map(d => DN[d]).join(_lhD("LCA=")))).join(_lhD("LCA="));
};
const mins = (t) => { const [h, m] = t.split(_lhD("Og==")).map(Number); return h * 60 + m; };
const onDuty = (m) => { if (!m.hours || !m.days.includes(new Date().getDay())) return false; const [a, b] = m.hours.split(_lhD("LQ==")).map(mins), n = new Date(), c = n.getHours() * 60 + n.getMinutes(); return c >= a && c < b; };
const sched = (m) => [dayText(m.days), m.hours.replace(_lhD("LQ=="), _lhD("IOKAkyA="))].filter(Boolean).join(_lhD("IMK3IA=="));
const canChat = (m) => m.userId && enabled(ALL.find(a => a.id === _lhD("Y291bnNlbGluZw==")));
const actions = (m, big) => `${canChat(m) ? `${_lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIA==")}${big ? '' : _lhD("c20=")}${_lhD("IiBkYXRhLWNoYXQ9Ig==")}${m.id}${_lhD("Ij4=")}${icon(_lhD("aGVhcnRIYW5k"))}${_lhD("IE5o4bqvbiB0aW48L2J1dHRvbj4=")}` : ''}${m.certificate ? `${_lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIHNvZnQg")}${big ? '' : _lhD("c20=")}${_lhD("IiBkYXRhLWNlcnQ9Ig==")}${m.id}${_lhD("Ij4=")}${icon(_lhD("YXdhcmQ="))}${_lhD("IENo4bupbmcgY2jhu4k8L2J1dHRvbj4=")}` : ''}${m.phone ? `${_lhD("PGEgY2xhc3M9ImJ0biBzb2Z0IA==")}${big ? '' : _lhD("c20=")}${_lhD("IiBocmVmPSJ0ZWw6")}${esc(m.phone.replace(/\s/g, ''))}${_lhD("Ij4=")}${icon(_lhD("cGhvbmU="))}${_lhD("IEfhu41pPC9hPg==")}` : ''}${m.email ? `${_lhD("PGEgY2xhc3M9ImJ0biBnaG9zdCA=")}${big ? '' : _lhD("c20=")}${_lhD("IiBocmVmPSJtYWlsdG86")}${esc(m.email)}${_lhD("Ij4=")}${icon(_lhD("bWFpbA=="))}${_lhD("IEVtYWlsPC9hPg==")}` : ''}`;
const card = (m) => { const on = onDuty(m); return `${_lhD("PGFydGljbGUgY2xhc3M9ImNhcmQgdGVhbS1jYXJkIiBkYXRhLW09Ig==")}${m.id}${_lhD("IiB0YWJpbmRleD0iMCIgcm9sZT0iYnV0dG9uIiBhcmlhLWxhYmVsPSJYZW0gdGjDtG5nIHRpbiA=")}${esc(m.name)}${_lhD("Ij4KICAgICAgPGRpdiBjbGFzcz0idGVhbS10b3AiPjxzcGFuIGNsYXNzPSJ0ZWFtLWF2Ij4=")}${avatar(m, _lhD("bGc="))}${on ? _lhD("PGkgY2xhc3M9ImRvdC1vbiIgdGl0bGU9IsSQYW5nIHRy4buxYyI+PC9pPg==") : ''}${_lhD("PC9zcGFuPgogICAgICAgIDxkaXYgY2xhc3M9Imdyb3ciIHN0eWxlPSJtaW4td2lkdGg6MCI+PGIgY2xhc3M9InRydW5jYXRlIj4=")}${esc(m.name)}${_lhD("PC9iPjxkaXYgY2xhc3M9InhzIG11dGVkIHRlYW0tdGl0bGUiPg==")}${esc(m.title || '')}${_lhD("PC9kaXY+PGRpdiBjbGFzcz0idGVhbS10YWdzIj4=")}${m.role ? `${_lhD("PHNwYW4gY2xhc3M9ImJhZGdlIA==")}${m.role === _lhD("VOG7lSB0csaw4bufbmc=") ? _lhD("dmlvbGV0") : ''}${_lhD("Ij4=")}${esc(m.role)}${_lhD("PC9zcGFuPg==")}` : ''}${m.certificate ? `${_lhD("PHNwYW4gY2xhc3M9ImJhZGdlIGluZm8iPg==")}${icon(_lhD("YXdhcmQ="))}${_lhD("IEPDsyBjaOG7qW5nIGNo4buJPC9zcGFuPg==")}` : ''}${on ? _lhD("PHNwYW4gY2xhc3M9ImJhZGdlIG9rIj7il48gxJBhbmcgdHLhu7FjPC9zcGFuPg==") : ''}${_lhD("PC9kaXY+PC9kaXY+PC9kaXY+CiAgICAgIA==")}${sched(m) ? `${_lhD("PGRpdiBjbGFzcz0idGVhbS1saW5lIj4=")}${icon(_lhD("Y2xvY2s="))}${_lhD("PHNwYW4+")}${esc(sched(m))}${_lhD("PC9zcGFuPjwvZGl2Pg==")}` : ''}
${m.room ? `${_lhD("PGRpdiBjbGFzcz0idGVhbS1saW5lIj4=")}${icon(_lhD("cGlu"))}${_lhD("PHNwYW4+")}${esc(m.room)}${_lhD("PC9zcGFuPjwvZGl2Pg==")}` : ''}
${m.topics.length ? `${_lhD("PGRpdiBjbGFzcz0idGVhbS10b3BpY3MiPg==")}${m.topics.map(t => `${_lhD("PHNwYW4+")}${esc(t)}${_lhD("PC9zcGFuPg==")}`).join('')}${_lhD("PC9kaXY+")}` : ''}${_lhD("CiAgICAgIDxkaXYgY2xhc3M9InRlYW0tYWN0Ij4=")}${actions(m)}${_lhD("PC9kaXY+PC9hcnRpY2xlPg==")}`; };
const showCert = (m) => {
if (!m?.certificate) return;
const url = fileUrl(m.certificate);
modal({
title: `${_lhD("Q2jhu6luZyBjaOG7iSDCtyA=")}${m.name}`,
sub: esc(m.title || m.role || _lhD("VOG7lSB0w6JtIGzDvSBo4buNYyDEkcaw4budbmc=")),
size: _lhD("d2lkZQ=="),
body: `${_lhD("PGRpdiBjbGFzcz0ic3RhY2siIHN0eWxlPSJhbGlnbi1pdGVtczpjZW50ZXIiPgogICAgICAgICAgPGJ1dHRvbiB0eXBlPSJidXR0b24iIGRhdGEtbGlnaHRib3g9Ig==")}${esc(url)}${_lhD("IiBzdHlsZT0iZGlzcGxheTpibG9jazt3aWR0aDoxMDAlO3BhZGRpbmc6MDtib3JkZXI6MDtiYWNrZ3JvdW5kOm5vbmU7Y3Vyc29yOnpvb20taW4iIHRpdGxlPSJC4bqlbSDEkeG7gyBwaMOzbmcgdG8gdG/DoG4gbcOgbiBow6xuaCI+CiAgICAgICAgICAgIDxpbWcgc3JjPSI=")}${esc(url)}${_lhD("IiBhbHQ9IkNo4bupbmcgY2jhu4kg")}${esc(m.name)}${_lhD("IiBzdHlsZT0id2lkdGg6MTAwJTttYXgtaGVpZ2h0Ojcwdmg7b2JqZWN0LWZpdDpjb250YWluO2JvcmRlci1yYWRpdXM6MTRweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpO2JhY2tncm91bmQ6dmFyKC0tc3VyZmFjZS0yKSI+CiAgICAgICAgICA8L2J1dHRvbj4KICAgICAgICAgIDxzcGFuIGNsYXNzPSJ4cyBtdXRlZCI+")}${icon(_lhD("ZXll"))}${_lhD("IELhuqVtIHbDoG8g4bqjbmggY2jhu6luZyBjaOG7iSDEkeG7gyBwaMOzbmcgdG8gdG/DoG4gbcOgbiBow6xuaDwvc3Bhbj4KICAgICAgICA8L2Rpdj4=")}`,
foot: `${_lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIHNvZnQiIGRhdGEtbGlnaHRib3g9Ig==")}${esc(url)}${_lhD("Ij4=")}${icon(_lhD("ZXll"))}${_lhD("IFBow7NuZyB0bzwvYnV0dG9uPjxhIGNsYXNzPSJidG4gZ2hvc3QiIGhyZWY9Ig==")}${esc(url)}${_lhD("IiB0YXJnZXQ9Il9ibGFuayIgcmVsPSJub29wZW5lciI+")}${icon(_lhD("ZXh0ZXJuYWw="))}${_lhD("IE3hu58g4bqjbmggZ+G7kWM8L2E+PGJ1dHRvbiBjbGFzcz0iYnRuIiBkYXRhLWNsb3NlPsSQw7NuZzwvYnV0dG9uPg==")}`,
});
};
const draw = () => {
const duty = items.filter(onDuty).length;
view.innerHTML = head(_lhD("VOG7lSB0w6JtIGzDvSBo4buNYyDEkcaw4budbmc="), _lhD("VGjhuqd5IGPDtCB2w6AgY8OhYyB0aMOgbmggdmnDqm4gdHJvbmcgdOG7lSBsdcO0biBz4bq1biBzw6BuZyBs4bqvbmcgbmdoZSB2w6AgxJHhu5NuZyBow6BuaCBjw7luZyBlbS4gTeG7jWkgdHJhbyDEkeG7lWkgxJHhu4F1IMSRxrDhu6NjIGdp4buvIGLDrSBt4bqtdC4=")) + `
${years.length > 1 ? `${_lhD("PGRpdiBjbGFzcz0iY2hpcHMiIHN0eWxlPSJtYXJnaW4tYm90dG9tOjEycHgiPg==")}${years.map(y => `${_lhD("PGJ1dHRvbiBjbGFzcz0iY2hpcCA=")}${curYear === y ? _lhD("YWN0aXZl") : ''}${_lhD("IiBkYXRhLXlyPSI=")}${esc(y)}${_lhD("Ij4=")}${icon(_lhD("Y2FsZW5kYXI="))}${_lhD("IE7Eg20gaOG7jWMg")}${esc(y)}${_lhD("PC9idXR0b24+")}`).join('')}${_lhD("PC9kaXY+")}` : ''}${_lhD("CiAgICAgIDxzZWN0aW9uIGNsYXNzPSJjYXJkIHRlYW0tc3VtIj4KICAgICAgICA8c3BhbiBjbGFzcz0ibS1pY28iIHN0eWxlPSJmbGV4Om5vbmUiPg==")}${icon(_lhD("aGVhcnRIYW5k"))}${_lhD("PC9zcGFuPgogICAgICAgIDxkaXYgY2xhc3M9Imdyb3ciIHN0eWxlPSJtaW4td2lkdGg6MCI+PGIgY2xhc3M9InNtYWxsIj5OxINtIGjhu41jIA==")}${esc(curYear)}${_lhD("IMK3IA==")}${items.length}${_lhD("IHRow6BuaCB2acOqbiDCtyA=")}${duty ? `${_lhD("PHNwYW4gc3R5bGU9ImNvbG9yOnZhcigtLW9rKSI+")}${duty}${_lhD("IMSRYW5nIHRy4buxYzwvc3Bhbj4=")}` : _lhD("bmdvw6BpIGdp4budIHRy4buxYw==")}${_lhD("PC9iPjxkaXYgY2xhc3M9InhzIG11dGVkIj5OZ2/DoGkgZ2nhu50gdHLhu7FjIHbhuqtuIGfhu61pIHTDom0gc+G7sSDEkcaw4bujYywgdGjhuqd5IGPDtCBz4bq9IHBo4bqjbiBo4buTaSBz4bubbS48L2Rpdj48L2Rpdj4KICAgICAgICA=")}${enabled(ALL.find(a => a.id === _lhD("Y291bnNlbGluZw=="))) ? `${_lhD("PGEgY2xhc3M9ImJ0biBzbSIgaHJlZj0iI2NvdW5zZWxpbmciPg==")}${icon(_lhD("ZXllT2Zm"))}${_lhD("IEfhu61pIOG6qW4gZGFuaDwvYT4=")}` : ''}${_lhD("CiAgICAgIDwvc2VjdGlvbj4KICAgICAg")}${items.length ? `${_lhD("PGRpdiBjbGFzcz0idGVhbS1ncmlkIj4=")}${items.map(card).join('')}${_lhD("PC9kaXY+")}` : empty(_lhD("Q2jGsGEgY8OzIGRhbmggc8OhY2g="), _lhD("TmjDoCB0csaw4budbmcgxJFhbmcgY+G6rXAgbmjhuq10IHRow6BuaCB2acOqbiBU4buVIHTDom0gbMO9Lg=="), _lhD("dXNlcnM="))}${_lhD("CiAgICAgIDxwIGNsYXNzPSJ4cyBtdXRlZCB0ZWFtLWZvb3QiPg==")}${icon(_lhD("c2lyZW4="))}${_lhD("IEtoaSBn4bq3cCBuZ3V5IGhp4buDbSwgZ+G7jWkgbmdheSA8Yj4xMTE8L2I+IChi4bqjbyB24buHIHRy4bq7IGVtKSBob+G6t2MgPGI+MTE1PC9iPiAoY+G6pXAgY+G7qXUpLjwvcD4=")}`;
};
const startChat = (m) => {
if (!m?.userId) return;
sessionStorage.setItem(_lhD("bGhfb3Blbl9jb3Vuc2Vsb3I="), m.userId);
go(_lhD("Y291bnNlbGluZw=="));
};
const detail = (m) => modal({ title: m.name, sub: esc(m.title || m.role || ''), body: `${_lhD("PGRpdiBjbGFzcz0ic3RhY2siPgogICAgICA8ZGl2IGNsYXNzPSJyb3cgbm93cmFwIiBzdHlsZT0iZ2FwOjE0cHgiPg==")}${avatar(m, _lhD("eGw="))}${_lhD("PGRpdiBjbGFzcz0ic3RhY2siIHN0eWxlPSJnYXA6NnB4O21pbi13aWR0aDowIj4=")}${m.role ? `${_lhD("PHNwYW4gY2xhc3M9ImJhZGdlIA==")}${m.role === _lhD("VOG7lSB0csaw4bufbmc=") ? _lhD("dmlvbGV0") : ''}${_lhD("IiBzdHlsZT0iYWxpZ24tc2VsZjpmbGV4LXN0YXJ0Ij4=")}${esc(m.role)}${_lhD("PC9zcGFuPg==")}` : ''}${onDuty(m) ? _lhD("PHNwYW4gY2xhc3M9ImJhZGdlIG9rIiBzdHlsZT0iYWxpZ24tc2VsZjpmbGV4LXN0YXJ0Ij7il48gxJBhbmcgdHLhu7FjPC9zcGFuPg==") : ''}${_lhD("PC9kaXY+PC9kaXY+CiAgICAgIA==")}${m.bio ? `${_lhD("PHAgY2xhc3M9ImluazIiPg==")}${esc(m.bio)}${_lhD("PC9wPg==")}` : ''}${_lhD("CiAgICAgIDxkaXYgY2xhc3M9InN0YWNrIiBzdHlsZT0iZ2FwOjhweCI+")}${sched(m) ? `${_lhD("PGRpdiBjbGFzcz0idGVhbS1saW5lIj4=")}${icon(_lhD("Y2xvY2s="))}${_lhD("PHNwYW4+PGI+TOG7i2NoIHRy4buxYzo8L2I+IA==")}${esc(sched(m))}${_lhD("PC9zcGFuPjwvZGl2Pg==")}` : ''}${m.room ? `${_lhD("PGRpdiBjbGFzcz0idGVhbS1saW5lIj4=")}${icon(_lhD("cGlu"))}${_lhD("PHNwYW4+PGI+TsahaSBn4bq3cDo8L2I+IA==")}${esc(m.room)}${_lhD("PC9zcGFuPjwvZGl2Pg==")}` : ''}${m.phone ? `${_lhD("PGRpdiBjbGFzcz0idGVhbS1saW5lIj4=")}${icon(_lhD("cGhvbmU="))}${_lhD("PHNwYW4gY2xhc3M9Im1vbm8iPg==")}${esc(m.phone)}${_lhD("PC9zcGFuPjwvZGl2Pg==")}` : ''}${m.email ? `${_lhD("PGRpdiBjbGFzcz0idGVhbS1saW5lIj4=")}${icon(_lhD("bWFpbA=="))}${_lhD("PHNwYW4gY2xhc3M9InRydW5jYXRlIj4=")}${esc(m.email)}${_lhD("PC9zcGFuPjwvZGl2Pg==")}` : ''}${_lhD("PC9kaXY+CiAgICAgIA==")}${m.topics.length ? `${_lhD("PGRpdj48ZGl2IGNsYXNzPSJ4cyBtdXRlZCIgc3R5bGU9Im1hcmdpbi1ib3R0b206NnB4Ij5MxKluaCB24buxYyBo4buXIHRy4bujPC9kaXY+PGRpdiBjbGFzcz0idGVhbS10b3BpY3MiPg==")}${m.topics.map(t => `${_lhD("PHNwYW4+")}${esc(t)}${_lhD("PC9zcGFuPg==")}`).join('')}${_lhD("PC9kaXY+PC9kaXY+")}` : ''}
${m.certificate ? `${_lhD("PGRpdj48ZGl2IGNsYXNzPSJ4cyBtdXRlZCIgc3R5bGU9Im1hcmdpbi1ib3R0b206NnB4Ij5DaOG7qW5nIGNo4buJIC8gUXV54bq/dCDEkeG7i25oIChi4bqlbSB2w6BvIOG6o25oIMSR4buDIHBow7NuZyB0byk8L2Rpdj48YnV0dG9uIHR5cGU9ImJ1dHRvbiIgZGF0YS1saWdodGJveD0i")}${esc(fileUrl(m.certificate))}${_lhD("IiBzdHlsZT0iZGlzcGxheTpibG9jazt3aWR0aDoxMDAlO3BhZGRpbmc6MDtib3JkZXI6MDtiYWNrZ3JvdW5kOm5vbmU7Y3Vyc29yOnpvb20taW4iPjxpbWcgc3JjPSI=")}${esc(fileUrl(m.certificate))}${_lhD("IiBhbHQ9IkNo4bupbmcgY2jhu4kg")}${esc(m.name)}${_lhD("IiBzdHlsZT0id2lkdGg6MTAwJTtib3JkZXItcmFkaXVzOjEycHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1saW5lKTttYXgtaGVpZ2h0OjM0MHB4O29iamVjdC1maXQ6Y29udGFpbjtiYWNrZ3JvdW5kOnZhcigtLXN1cmZhY2UtMikiPjwvYnV0dG9uPjwvZGl2Pg==")}` : ''}
${!canChat(m) ? `${_lhD("PHAgY2xhc3M9InhzIG11dGVkIj4=")}${icon(_lhD("aW5mbw=="))}${_lhD("IE114buRbiB0cmFvIMSR4buVaSBrw61uIHbhu5tpIA==")}${esc(m.name)}${_lhD("LCBlbSBjw7MgdGjhu4MgZ+G7rWkgdMOibSBz4buxIOG6qW4gZGFuaCBob+G6t2Mgbmjhu50gY2h1ecOqbiB2acOqbiB0w6JtIGzDvSDEkeG6t3QgbOG7i2NoIGjhurluLjwvcD4=")}` : ''}${_lhD("CiAgICA8L2Rpdj4=")}`, foot: `${_lhD("PGRpdiBjbGFzcz0icm93IiBzdHlsZT0iZ2FwOjhweDtqdXN0aWZ5LWNvbnRlbnQ6ZmxleC1lbmQ7ZmxleC13cmFwOndyYXAiPg==")}${actions(m, true)}${!canChat(m) && enabled(ALL.find(a => a.id === _lhD("Y291bnNlbGluZw=="))) ? `${_lhD("PGEgY2xhc3M9ImJ0biIgaHJlZj0iI2NvdW5zZWxpbmciIGRhdGEtY2xvc2U+")}${icon(_lhD("aGVhcnRIYW5k"))}${_lhD("IEfhu61pIHTDom0gc+G7sTwvYT4=")}` : ''}${_lhD("PC9kaXY+")}`,
onMount: (el, close) => {
el.querySelector(_lhD("W2RhdGEtY2hhdF0="))?.addEventListener(_lhD("Y2xpY2s="), (e) => { close(); startChat(m, e.currentTarget); });
el.querySelector(_lhD("W2RhdGEtY2VydF0="))?.addEventListener(_lhD("Y2xpY2s="), () => { close(); showCert(m); });
} });
draw();
onView(view, _lhD("Y2xpY2s="), async (e) => {
const yr = e.target.closest(_lhD("W2RhdGEteXJd")); if (yr) { await load(yr.dataset.yr); draw(); return; }
const cert = e.target.closest(_lhD("W2RhdGEtY2VydF0=")); if (cert) { e.stopPropagation(); return showCert(items.find(x => x.id === cert.dataset.cert)); }
const c = e.target.closest(_lhD("W2RhdGEtY2hhdF0=")); if (c) { e.stopPropagation(); return startChat(items.find(x => x.id === c.dataset.chat), c); }
if (e.target.closest(_lhD("YSxidXR0b24="))) return;
const el = e.target.closest(_lhD("W2RhdGEtbV0=")); if (el) detail(items.find(x => x.id === el.dataset.m));
});
onView(view, _lhD("a2V5ZG93bg=="), (e) => { if (e.key === _lhD("RW50ZXI=") && e.target.matches(_lhD("W2RhdGEtbV0="))) detail(items.find(x => x.id === e.target.dataset.m)); });
const tick = setInterval(draw, 60000); S.cleanups.push(() => clearInterval(tick));
S.cleanups.push(live.on(_lhD("ZGF0YTpjaGFuZ2Vk"), async ({ scope }) => { if (scope === _lhD("Y291bnNlbFRlYW0=")) { await load(curYear); draw(); } }));
},
async handbook(view) {
const r = await api.get(_lhD("YXBpL2hhbmRib29r"));
let cat = '';
const cats = [...new Set(r.items.map(i => i.category))];
const draw = () => {
const items = r.items.filter(i => !cat || i.category === cat);
view.innerHTML = head(_lhD("Q+G6qW0gbmFuZyBo4buNYyDEkcaw4budbmcgJiBr4bu5IG7Eg25nIOG7qW5nIHBow7M="), _lhD("U+G7lSB0YXkgc+G7kSB24buBIG7hu5lpIHF1eSwga+G7uSBuxINuZyB04buxIGLhuqNvIHbhu4cgdsOgIGRhbmggYuG6oSDEkcaw4budbmcgZMOieSBuw7NuZyBo4buXIHRy4bujIGto4bqpbiBj4bqlcC4=")) + `${_lhD("CiAgICAgIDxzZWN0aW9uIGNsYXNzPSJob3RsaW5lLWdyaWQiPg==")}${r.hotlines.map((h, i) => `${_lhD("PGRpdiBjbGFzcz0iY2FyZCBob3RsaW5lLWNhcmQg")}${i === 0 ? _lhD("aG90bGluZS11cmdlbnQ=") : ''}${_lhD("Ij48ZGl2IGNsYXNzPSJob3RsaW5lLWljbyI+")}${icon(i === 0 ? _lhD("aGVhcnRIYW5k") : i === 1 ? _lhD("c2hpZWxk") : i === 2 ? _lhD("c2lyZW4=") : _lhD("cGhvbmU="))}${_lhD("PC9kaXY+PGRpdiBjbGFzcz0iaG90bGluZS1pbmZvIj48ZGl2IGNsYXNzPSJ4cyBtdXRlZCB0cnVuY2F0ZSIgdGl0bGU9Ig==")}${esc(h.name)}${_lhD("Ij4=")}${esc(h.name)}${_lhD("PC9kaXY+PGEgaHJlZj0idGVsOg==")}${esc(h.number.replace(/\s/g, ''))}${_lhD("IiBjbGFzcz0iaG90bGluZS1udW0iPg==")}${esc(h.number)}${_lhD("PC9hPjxkaXYgY2xhc3M9InhzIG11dGVkIHRydW5jYXRlIj4=")}${esc(h.note)}${_lhD("PC9kaXY+PC9kaXY+PGJ1dHRvbiB0eXBlPSJidXR0b24iIGNsYXNzPSJidG4gaWNvbiBnaG9zdCBzbSBob3RsaW5lLWNvcHkiIGRhdGEtY29weT0i")}${esc(h.number)}${_lhD("IiB0aXRsZT0iU2FvIGNow6lwIHPhu5Eg")}${esc(h.number)}${_lhD("IiBhcmlhLWxhYmVsPSJTYW8gY2jDqXAgc+G7kSI+")}${icon(_lhD("Y29weQ=="))}${_lhD("PC9idXR0b24+PC9kaXY+")}`).join('')}${_lhD("PC9zZWN0aW9uPgogICAgICA8c2VjdGlvbiBjbGFzcz0iY2FyZCI+PGRpdiBjbGFzcz0iY2FyZC1oZWFkIj48ZGl2PjxoMj4=")}${icon(_lhD("c2lyZW4="))}${_lhD("IEtoaSBi4buLIGLhuq90IG7huqF0IGhv4bq3YyDEkWUgZOG7jWE6IGzDoG0gdGhlbyB0aOG7qSB04buxPC9oMj48ZGl2IGNsYXNzPSJzdWIiPkdoaSBuaOG7myDEkeG7gyBiw6xuaCB0xKluaCB44butIGzDvTwvZGl2PjwvZGl2PjwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9ImNhcmQtYm9keSBncmlkIGctYXV0byIgc3R5bGU9ImdyaWQtdGVtcGxhdGUtY29sdW1uczpyZXBlYXQoYXV0by1maWxsLG1pbm1heCgyMDBweCwxZnIpKSI+")}${[[_lhD("R2nhu68gYsOsbmggdMSpbmgsIGtow7RuZyDEkeG7kWkgxJHhuqd1"), _lhD("TsOzaSBjaOG6rW0sIHLDtSByw6BuZywga2jDtG5nIGtoacOqdSBraMOtY2gu")], [_lhD("UuG7nWkgxJFpIHThu5tpIG7GoWkgxJHDtG5nIG5nxrDhu51p"), _lhD("Q+G7lW5nIHRyxrDhu51uZywgcGjDsm5nIGLhuqNvIHbhu4csIGPhu61hIGjDoG5nIGfhuqduIG5o4bqldC4=")], [_lhD("SMO0IHRvIMSR4buDIGfDonkgY2jDuiDDvQ=="), _lhD("4oCcQ+G7qFUgVuG7mknigJ0gaG/hurdjIOKAnENIw4FZ4oCdIGtoaSBi4buLIGdp4buvIGzhuqFpLg==")], [_lhD("R2hpIG5o4bubIMSR4bq3YyDEkWnhu4Nt"), _lhD("U+G7kSBuZ8aw4budaSwgdHJhbmcgcGjhu6VjLCBiaeG7g24gc+G7kSB4ZSwgdGjhu51pIGdpYW4u")], [_lhD("QsOhbyBuZ2F5IGNobyBuZ8aw4budaSBs4bubbg=="), _lhD("R1ZDTiwgZ2nDoW0gdGjhu4ssIGNoYSBt4bq5IGhv4bq3YyBn4buNaSAxMTMsIDExMS4=")]].map(([t, d], i) => `${_lhD("PGRpdiBjbGFzcz0icm93IG5vd3JhcCIgc3R5bGU9ImFsaWduLWl0ZW1zOmZsZXgtc3RhcnQ7Z2FwOjEycHgiPjxzcGFuIGNsYXNzPSJtZWRhbCBteCIgc3R5bGU9ImJhY2tncm91bmQ6dmFyKC0tYnJhbmQpO2NvbG9yOiNmZmYiPg==")}${i + 1}${_lhD("PC9zcGFuPjxkaXY+PGIgY2xhc3M9InNtYWxsIj4=")}${t}${_lhD("PC9iPjxwIGNsYXNzPSJ4cyBtdXRlZCI+")}${d}${_lhD("PC9wPjwvZGl2PjwvZGl2Pg==")}`).join('')}${_lhD("PC9kaXY+PC9zZWN0aW9uPgogICAgICA8ZGl2IGNsYXNzPSJjaGlwcyI+PGJ1dHRvbiBjbGFzcz0iY2hpcCA=")}${!cat ? _lhD("YWN0aXZl") : ''}${_lhD("IiBkYXRhLWM9IiI+VOG6pXQgY+G6oyAo")}${r.items.length}${_lhD("KTwvYnV0dG9uPg==")}${cats.map(c => `${_lhD("PGJ1dHRvbiBjbGFzcz0iY2hpcCA=")}${cat === c ? _lhD("YWN0aXZl") : ''}${_lhD("IiBkYXRhLWM9Ig==")}${esc(c)}${_lhD("Ij4=")}${esc(c)}${_lhD("PC9idXR0b24+")}`).join('')}${_lhD("PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImdyaWQgZy1hdXRvIj4=")}${items.map(h => `${_lhD("PGFydGljbGUgY2xhc3M9ImNhcmQgaG92ZXIgcGFkIHN0YWNrIiBkYXRhLWg9Ig==")}${h.id}${_lhD("IiBzdHlsZT0iZ2FwOjhweCI+PGRpdiBjbGFzcz0icm93IGJldHdlZW4iPg==")}${badge(h.category, _lhD("aW5mbw=="))}${h.pinned ? `${_lhD("PHNwYW4gY2xhc3M9ImJhZGdlIHdhcm4iPg==")}${icon(_lhD("cGlu"))}${_lhD("IEdoaW08L3NwYW4+")}` : ''}${_lhD("PC9kaXY+PGgzIHN0eWxlPSJmb250LXNpemU6dmFyKC0tZnMtbWQpIj4=")}${esc(h.title)}${_lhD("PC9oMz48cCBjbGFzcz0ic21hbGwgbXV0ZWQgY2xhbXAtMyI+")}${esc(h.summary)}${_lhD("PC9wPjxkaXYgY2xhc3M9InJvdyBiZXR3ZWVuIHhzIG11dGVkIiBzdHlsZT0ibWFyZ2luLXRvcDphdXRvIj48c3Bhbj4=")}${esc(h.author)}${_lhD("PC9zcGFuPjxzcGFuPg==")}${icon(_lhD("ZXll"))} ${num(h.views)}${_lhD("PC9zcGFuPjwvZGl2PjwvYXJ0aWNsZT4=")}`).join('')}${_lhD("PC9kaXY+")}`;
$$(_lhD("W2RhdGEtY10="), view).forEach(b => b.onclick = () => { cat = b.dataset.c; draw(); });
$$(_lhD("W2RhdGEtY29weV0="), view).forEach(b => b.onclick = () => copyText(b.dataset.copy));
$$(_lhD("W2RhdGEtaF0="), view).forEach(c => c.onclick = async () => { const { item } = await api.get(`${_lhD("YXBpL2hhbmRib29rLw==")}${c.dataset.h}`); modal({ title: item.title, sub: `${esc(item.category)}${_lhD("IMK3IA==")}${esc(item.author)}`, size: _lhD("d2lkZQ=="), body: `${_lhD("PGRpdiBjbGFzcz0iYXJ0aWNsZSI+")}${esc(item.content)}${_lhD("PC9kaXY+")}`, foot: _lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIiBkYXRhLWNsb3NlPsSQw6MgxJHhu41jPC9idXR0b24+") }); });
};
draw();
},
async news(view) {
const r = await api.get(_lhD("YXBpL25ld3M="));
let cat = '';
const CATS = { '': _lhD("VOG6pXQgY+G6ow=="), violence: _lhD("QuG6oW8gbOG7sWMgaOG7jWMgxJHGsOG7nW5n"), scam: _lhD("TOG7q2EgxJHhuqNv"), drugs: _lhD("TWEgdMO6eQ=="), explosive: _lhD("VuG6rXQgbGnhu4d1IG7hu5U="), law: _lhD("UGjDoXAgbHXhuq10"), traffic: _lhD("R2lhbyB0aMO0bmc="), wellbeing: _lhD("U+G7qWMga2jhu49lIHRpbmggdGjhuqdu"), school: _lhD("VGluIG5ow6AgdHLGsOG7nW5n") };
const draw = () => {
const items = r.items.filter(n => !cat || n.category === cat);
view.innerHTML = head(_lhD("QuG6o24gdGluIHR1ecOqbiB0cnV54buBbg=="), _lhD("UGjhu5UgYmnhur9uIGdpw6FvIGThu6VjIHBow6FwIGx14bqtdCwgcGjDsm5nIGNo4buRbmcgYuG6oW8gbOG7sWMgaOG7jWMgxJHGsOG7nW5nLCBs4burYSDEkeG6o28gY8O0bmcgbmdo4buHIGNhbyB2w6AgdOG7hyBu4bqhbiB4w6MgaOG7mWku")) + `${_lhD("CiAgICAgIDxkaXYgY2xhc3M9ImNoaXBzIj4=")}${Object.entries(CATS).filter(([k]) => !k || r.items.some(n => n.category === k)).map(([k, l]) => `${_lhD("PGJ1dHRvbiBjbGFzcz0iY2hpcCA=")}${cat === k ? _lhD("YWN0aXZl") : ''}${_lhD("IiBkYXRhLWM9Ig==")}${k}${_lhD("Ij4=")}${l}${_lhD("PC9idXR0b24+")}`).join('')}${_lhD("PC9kaXY+CiAgICAgIA==")}${items.length ? `${_lhD("PGRpdiBjbGFzcz0iZ3JpZCBnLWF1dG8iPg==")}${items.map(n => `${_lhD("PGFydGljbGUgY2xhc3M9ImNhcmQgaG92ZXIgbmV3cy1jYXJkIiBkYXRhLW49Ig==")}${n.id}${_lhD("Ij4=")}${cover(n)}${_lhD("PGgzIGNsYXNzPSJjbGFtcC0yIj4=")}${esc(n.title)}${_lhD("PC9oMz48cCBjbGFzcz0ic21hbGwgbXV0ZWQgY2xhbXAtMiI+")}${esc(n.summary)}${_lhD("PC9wPjxkaXYgY2xhc3M9Im1ldGEiPjxzcGFuPg==")}${ago(n.publishedAt)}${_lhD("PC9zcGFuPjxzcGFuPg==")}${icon(_lhD("ZXll"))} ${num(n.views)}${_lhD("PC9zcGFuPjwvZGl2PjwvYXJ0aWNsZT4=")}`).join('')}${_lhD("PC9kaXY+")}` : empty(_lhD("Q2jGsGEgY8OzIGLhuqNuIHRpbg=="), '', _lhD("bmV3cw=="))}`;
$$(_lhD("W2RhdGEtY10="), view).forEach(b => b.onclick = () => { cat = b.dataset.c; draw(); });
$$(_lhD("W2RhdGEtbl0="), view).forEach(c => c.onclick = () => openNews(c.dataset.n));
};
draw();
},
async 'school-chat'(view) {
let data = await api.get(_lhD("YXBpL3NjaG9vbC1jaGF0"));
let isAnon = !!store.get(_lhD("bGhfc2NfYW5vbg=="), false);
view.innerHTML = head(_lhD("Q2hhdCBjaHVuZyB0b8OgbiB0csaw4budbmc="), _lhD("S8OqbmggZ2lhbyBsxrB1IGTDoG5oIHJpw6puZyBjaG8gaOG7jWMgc2luaC4gQ8OzIHRo4buDIGNo4buNbiBuaOG6r24gdGluIOG6qW4gZGFuaCBob+G6t2MgaGnhu4duIHTDqm47IG5nw7RuIHThu6sgcGjhuqNuIGPhuqNtIHPhur0gYuG7iyBs4buNYyB04buxIMSR4buZbmcu")) + `${_lhD("CiAgICA8c2VjdGlvbiBjbGFzcz0iY2FyZCBjaGF0IHNjaG9vbC1jaGF0LWNhcmQiPgogICAgICA8ZGl2IGNsYXNzPSJjaGF0LWhlYWQiPjxzcGFuIGNsYXNzPSJhdmF0YXIgc20gc3EiIHN0eWxlPSJiYWNrZ3JvdW5kOmxpbmVhci1ncmFkaWVudCgxMzVkZWcsIzE3NDdjOSwjMGE4NGI4KSI+")}${icon(_lhD("Y2hhdHM="))}${_lhD("PC9zcGFuPjxkaXYgY2xhc3M9Imdyb3ciIHN0eWxlPSJtaW4td2lkdGg6MCI+PGIgY2xhc3M9InRydW5jYXRlIj5I4buNYyBzaW5oIA==")}${esc(S.settings.shortName)}${_lhD("PC9iPjxkaXYgY2xhc3M9InhzIG11dGVkIHRydW5jYXRlIj48c3BhbiBzdHlsZT0iY29sb3I6dmFyKC0tb2spIj7il488L3NwYW4+IDxzcGFuIGlkPSJvbmxpbmUiPg==")}${data.online}${_lhD("PC9zcGFuPiB0cuG7sWMgdHV54bq/biDCtyBWxINuIG1pbmg8L2Rpdj48L2Rpdj48YnV0dG9uIHR5cGU9ImJ1dHRvbiIgY2xhc3M9ImJ0biBzb2Z0IHNtIiBpZD0ic2NBbm9uQnRuIiB0aXRsZT0iQuG6pW0gxJHhu4MgxJHhu5VpIGNo4bq/IMSR4buZIOG6qW4gZGFuaCAvIGhp4buHbiB0w6puIj48L2J1dHRvbj48c3BhbiBjbGFzcz0iYmFkZ2Ugb2sgaGlkZS1zbSI+")}${icon(_lhD("c2hpZWxkQ2hlY2s="))}${_lhD("IFbEg24gbWluaCAxMDAlPC9zcGFuPjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJjaGF0LWJvZHkiIGlkPSJjYiI+PC9kaXY+CiAgICAgIDxkaXYgaWQ9ImxvY2tOb3RlIj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iY2hhdC1hbm9uLWJhciI+CiAgICAgICAgPGxhYmVsIGNsYXNzPSJjaGVjayI+PGlucHV0IHR5cGU9ImNoZWNrYm94IiBpZD0ic2NBbm9uIiA=")}${isAnon ? _lhD("Y2hlY2tlZA==") : ''}${_lhD("PjxzcGFuIGNsYXNzPSJ0cnVuY2F0ZSI+PGI+Tmjhuq9uIOG6qW4gZGFuaDwvYj4gwrcgPHNwYW4gaWQ9InNjQW5vbkhpbnQiPjwvc3Bhbj48L3NwYW4+PC9sYWJlbD4KICAgICAgICA8YnV0dG9uIHR5cGU9ImJ1dHRvbiIgaWQ9InNjQW5vblRhZyIgc3R5bGU9ImJvcmRlcjowO2N1cnNvcjpwb2ludGVyIj48L2J1dHRvbj4KICAgICAgPC9kaXY+CiAgICAgIDxmb3JtIGNsYXNzPSJjaGF0LWlucHV0IiBpZD0iY2YiPjx0ZXh0YXJlYSBpZD0iY3QiIHJvd3M9IjEiIG1heGxlbmd0aD0iNjAwIiBwbGFjZWhvbGRlcj0iTmjhuq9uIHThu5tpIHRvw6BuIHRyxrDhu51uZ+KApiIgYXJpYS1sYWJlbD0iVGluIG5o4bqvbiI+PC90ZXh0YXJlYT48YnV0dG9uIGNsYXNzPSJidG4gaWNvbiIgYXJpYS1sYWJlbD0iR+G7rWkiPg==")}${icon(_lhD("c2VuZA=="))}${_lhD("PC9idXR0b24+PC9mb3JtPgogICAgPC9zZWN0aW9uPg==")}`;
const cb = $(_lhD("I2Ni"));
const syncAnonUi = () => {
$(_lhD("I3NjQW5vbg==")).checked = isAnon;
const btn = $(_lhD("I3NjQW5vbkJ0bg=="));
btn.style.cssText = isAnon ? _lhD("YmFja2dyb3VuZDp2YXIoLS12aW9sZXQtc29mdCk7Y29sb3I6dmFyKC0tdmlvbGV0KTtib3JkZXItY29sb3I6dHJhbnNwYXJlbnQ=") : '';
btn.innerHTML = `${icon(isAnon ? _lhD("ZXllT2Zm") : _lhD("dXNlcg=="))} ${isAnon ? _lhD("4bqobiBkYW5o") : _lhD("SGnhu4duIHTDqm4=")}`;
$(_lhD("I3NjQW5vbkhpbnQ=")).textContent = isAnon ? _lhD("R2nhuqV1IHTDqm4gJiBs4bubcA==") : `${_lhD("SGnhu4duIHTDqm4gKA==")}${firstName(S.user?.name || '')}${_lhD("KQ==")}`;
$(_lhD("I3NjQW5vblRhZw==")).className = `${_lhD("YmFkZ2Ug")}${isAnon ? _lhD("dmlvbGV0") : _lhD("aW5mbw==")}`;
$(_lhD("I3NjQW5vblRhZw==")).innerHTML = `${icon(isAnon ? _lhD("bG9jaw==") : _lhD("dXNlcg=="))} ${isAnon ? _lhD("xJDDoyDhuqlu") : _lhD("SGnhu4duIHTDqm4=")}`;
$(_lhD("I2N0")).placeholder = isAnon ? _lhD("Tmjhuq9uIOG6qW4gZGFuaOKApg==") : _lhD("Tmjhuq9uIHThu5tpIHRvw6BuIHRyxrDhu51uZ+KApg==");
};
const setAnon = (val) => {
isAnon = !!val;
store.set(_lhD("bGhfc2NfYW5vbg=="), isAnon);
syncAnonUi();
toast(isAnon ? _lhD("xJDDoyBi4bqtdCBjaOG6vyDEkeG7mSBuaOG6r24gdGluIOG6qW4gZGFuaCB0csOqbiBrw6puaCB0b8OgbiB0csaw4budbmcu") : _lhD("xJDDoyBjaHV54buDbiBzYW5nIG5o4bqvbiB0aW4gaGnhu4duIHTDqm4gdGjhuq10Lg=="), _lhD("b2s="), 2000);
};
syncAnonUi();
$(_lhD("I3NjQW5vbg==")).onchange = (e) => setAnon(e.target.checked);
$(_lhD("I3NjQW5vbkJ0bg==")).onclick = () => setAnon(!isAnon);
$(_lhD("I3NjQW5vblRhZw==")).onclick = () => setAnon(!isAnon);
const msgHtml = (m) => `${_lhD("PGRpdiBjbGFzcz0ibXNnIA==")}${m.mine ? _lhD("bWU=") : ''}${_lhD("IiBkYXRhLWlkPSI=")}${m.id}${_lhD("Ij4=")}${!m.mine ? (m.anonymous ? `${_lhD("PHNwYW4gY2xhc3M9ImF2YXRhciBzbSIgc3R5bGU9ImJhY2tncm91bmQ6dmFyKC0tdmlvbGV0KTtjb2xvcjojZmZmIj4=")}${icon(_lhD("ZXllT2Zm"))}${_lhD("PC9zcGFuPg==")}` : avatar({ id: m.userId, name: m.name, avatar: m.avatar }, _lhD("c20="))) : ''}${_lhD("PGRpdiBzdHlsZT0ibWluLXdpZHRoOjAiPgogICAgICA8ZGl2IGNsYXNzPSJ3aG8iPg==")}${m.mine ? '' : `${_lhD("PGIgc3R5bGU9ImNvbG9yOg==")}${m.anonymous ? _lhD("dmFyKC0tdmlvbGV0KQ==") : _lhD("dmFyKC0taW5rKQ==")}${_lhD("Ij4=")}${esc(m.name)}${_lhD("PC9iPg==")}`}${_lhD("PHNwYW4+")}${esc(m.className)}${_lhD("PC9zcGFuPg==")}${m.anonymous ? badge(_lhD("4bqobiBkYW5o"), _lhD("dmlvbGV0")) : ''}${m.role === _lhD("c3RhZmY=") ? badge(_lhD("TmjDoCB0csaw4budbmc="), _lhD("aW5mbw==")) : ''}${_lhD("PC9kaXY+CiAgICAgIA==")}${m.deleted ? _lhD("PGRpdiBjbGFzcz0iYnViYmxlIGRlbGV0ZWQiPlRpbiBuaOG6r24gxJHDoyBi4buLIHF14bqjbiB0cuG7iyB2acOqbiBn4buhPC9kaXY+") : bubble(m, m.mine)}${_lhD("CiAgICAgIDxkaXYgY2xhc3M9InJvdyBub3dyYXAiIHN0eWxlPSJnYXA6NnB4Ow==")}${m.mine ? _lhD("anVzdGlmeS1jb250ZW50OmZsZXgtZW5k") : ''}${_lhD("Ij48ZGl2IGNsYXNzPSJyZWFjdHMiPg==")}${Object.entries(m.reactions).map(([e, r]) => `${_lhD("PGJ1dHRvbiBjbGFzcz0icmVhY3Qg")}${r.mine ? _lhD("bWluZQ==") : ''}${_lhD("IiBkYXRhLXJlYWN0PSI=")}${e}${_lhD("Ij4=")}${e} ${r.count}${_lhD("PC9idXR0b24+")}`).join('')}${_lhD("PC9kaXY+")}${!m.deleted && !m.recalled ? `${_lhD("PHNwYW4gY2xhc3M9InJlYWN0LWJhciI+")}${data.emojis.slice(0, 6).map(e => `${_lhD("PGJ1dHRvbiBkYXRhLXJlYWN0PSI=")}${e}${_lhD("IiBhcmlhLWxhYmVsPSJUaOG6oyA=")}${e}${_lhD("Ij4=")}${e}${_lhD("PC9idXR0b24+")}`).join('')}${_lhD("PC9zcGFuPg==")}` : ''}${_lhD("PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9InRpbWUiPg==")}${fmtTime(m.at)}${recallBtn(m, m.mine)}${_lhD("PC9kaXY+PC9kaXY+PC9kaXY+")}`;
const draw = () => {
cb.innerHTML = data.items.map(msgHtml).join('');
cb.scrollTop = cb.scrollHeight;
$(_lhD("I2xvY2tOb3Rl")).innerHTML = data.locked ? `${_lhD("PGRpdiBjbGFzcz0iYmFkZ2Ugd2FybiIgc3R5bGU9Im1hcmdpbjo4cHggMTJweCAwO2hlaWdodDphdXRvO3BhZGRpbmc6OHB4IDEycHg7d2hpdGUtc3BhY2U6bm9ybWFsO2JvcmRlci1yYWRpdXM6MTJweCI+")}${icon(_lhD("bG9jaw=="))} ${esc(data.lockReason || _lhD("S8OqbmggY2hhdCDEkWFuZyB04bqhbSBraMOzYS4="))}${_lhD("PC9kaXY+")}` : data.muted ? `${_lhD("PGRpdiBjbGFzcz0iYmFkZ2UgYmFkIiBzdHlsZT0ibWFyZ2luOjhweCAxMnB4IDA7aGVpZ2h0OmF1dG87cGFkZGluZzo4cHggMTJweDt3aGl0ZS1zcGFjZTpub3JtYWw7Ym9yZGVyLXJhZGl1czoxMnB4Ij4=")}${icon(_lhD("dm9sdW1lWA=="))}${_lhD("IELhuqFuIMSRYW5nIGLhu4sgdOG6oW0gY+G6pW0gY2hhdCBkbyB2aSBwaOG6oW0gcXV5IHThuq9jIOG7qW5nIHjhu60uPC9kaXY+")}` : '';
};
draw();
cb.onclick = async (e) => {
const rc = e.target.closest(_lhD("W2RhdGEtcmVjYWxsXQ=="));
if (rc) { const r = await askRecall(`${_lhD("YXBpL3NjaG9vbC1jaGF0Lw==")}${rc.dataset.recall}${_lhD("L3JlY2FsbA==")}`); if (r) { const i = data.items.findIndex(x => x.id === r.item.id); if (i >= 0) data.items[i] = r.item; draw(); } return; }
const b = e.target.closest(_lhD("W2RhdGEtcmVhY3Rd")); if (!b) return;
const id = b.closest(_lhD("W2RhdGEtaWRd")).dataset.id;
try { const r = await api.post(`${_lhD("YXBpL3NjaG9vbC1jaGF0Lw==")}${id}${_lhD("L3JlYWN0")}`, { emoji: b.dataset.react }); const i = data.items.findIndex(x => x.id === id); data.items[i] = r.item; draw(); } catch (er) { showError(er); }
};
autoGrow($(_lhD("I2N0")), () => $(_lhD("I2Nm")).requestSubmit());
const comp = attachComposer($(_lhD("I2Nm")));
$(_lhD("I2Nm")).onsubmit = async (e) => {
e.preventDefault(); const text = $(_lhD("I2N0")).value.trim();
$(_lhD("I2N0")).value = '';
const ok = await sendWithFiles(comp, text, async (b) => { const r = await api.post(_lhD("YXBpL3NjaG9vbC1jaGF0"), { ...b, anonymous: isAnon }); if (!data.items.some(x => x.id === r.item.id)) data.items.push(r.item); draw(); if (r.warning) toast(r.warning, _lhD("d2Fybg=="), 5000); }, $(_lhD("I2NmIGJ1dHRvblthcmlhLWxhYmVsPSJH4butaSJd")));
if (!ok && text) $(_lhD("I2N0")).value = text;
};
S.cleanups.push(live.on(_lhD("c2Nob29sLWNoYXQ6bWVzc2FnZQ=="), (m) => { if (data.items.some(x => x.id === m.id)) return; data.items.push({ ...m, attachments: m.attachments || [], mine: m.userId === S.user.id, reactions: {} }); draw(); }));
S.cleanups.push(live.on(_lhD("c2Nob29sLWNoYXQ6ZGVsZXRl"), ({ id }) => { const m = data.items.find(x => x.id === id); if (m) { m.deleted = true; draw(); } }));
S.cleanups.push(live.on(_lhD("c2Nob29sLWNoYXQ6aGFyZC1kZWxldGU="), ({ id }) => { data.items = data.items.filter(x => x.id !== id); draw(); }));
S.cleanups.push(live.on(_lhD("c2Nob29sLWNoYXQ6Y2xlYXI="), () => { data.items = []; draw(); }));
S.cleanups.push(live.on(_lhD("c2Nob29sLWNoYXQ6cmVjYWxs"), ({ id }) => { const m = data.items.find(x => x.id === id); if (m && !m.recalled) { m.recalled = true; m.text = ''; m.attachments = []; m.reactions = {}; draw(); } }));
S.cleanups.push(live.on(_lhD("c2Nob29sLWNoYXQ6bG9jaw=="), (x) => { data.locked = x.locked; data.lockReason = x.reason; draw(); }));
S.cleanups.push(live.on(_lhD("c2Nob29sLWNoYXQ6cmVhY3Q="), async () => { data = await api.get(_lhD("YXBpL3NjaG9vbC1jaGF0")); draw(); }));
},
async 'teacher-chat'(view) {
let threads = (await api.get(_lhD("YXBpL3RlYWNoZXItY2hhdC90aHJlYWRz"))).items, current = null;
view.innerHTML = head(_lhD("Q2hhdCB24bubaSBnacOhbyB2acOqbg=="), _lhD("VHJhbyDEkeG7lWkgcmnDqm5nIHbhu5tpIHRo4bqneSBjw7Q6IEdWQ04sIGdpw6FvIHZpw6puIGLhu5kgbcO0biB2w6AgdOG7lSB0xrAgduG6pW4g4oCUIGjhu49pIGLDoGksIHhpbiBuZ2jhu4kgcGjDqXAsIG5o4budIGjhu5cgdHLhu6Mu"), `${_lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIGhpZGUtc20iIGlkPSJuZXdUIj4=")}${icon(_lhD("cGx1cw=="))}${_lhD("IE5o4bqvbiBnacOhbyB2acOqbjwvYnV0dG9uPg==")}`) + `${_lhD("CiAgICA8c2VjdGlvbiBjbGFzcz0iY2FyZCBjaGF0LWxheW91dCIgaWQ9ImNsIj48ZGl2IGNsYXNzPSJ0aHJlYWRzIiBpZD0idGgiPjwvZGl2PjxkaXYgY2xhc3M9ImNoYXQiIGlkPSJjcCI+PC9kaXY+PC9zZWN0aW9uPg==")}`;
const drawThreads = () => {
$(_lhD("I2Ns"))?.classList.toggle(_lhD("aXMtZW1wdHk="), !threads.length && !current);
$(_lhD("I3Ro")).innerHTML = `${_lhD("PGRpdiBjbGFzcz0idGhyZWFkcy1oZWFkIj48c3BhbiBjbGFzcz0ieHMgbXV0ZWQgc3Ryb25nIj4=")}${threads.length ? `${threads.length}${_lhD("IGN14buZYyB0csOyIGNodXnhu4du")}` : _lhD("RGFuaCBzw6FjaCB0csOyIGNodXnhu4du")}${_lhD("PC9zcGFuPjxidXR0b24gY2xhc3M9ImJ0biBzbSIgaWQ9InRoTmV3VCI+")}${icon(_lhD("cGx1cw=="))}${_lhD("IE5o4bqvbiBnacOhbyB2acOqbjwvYnV0dG9uPjwvZGl2Pg==")}` + (threads.length ? `${_lhD("PGRpdiBjbGFzcz0ibGlzdCI+")}${threads.map(t => `${_lhD("PGRpdiBjbGFzcz0iaXRlbSBjbGljayA=")}${current?.id === t.id ? _lhD("YWN0aXZl") : ''}${_lhD("IiBkYXRhLXQ9Ig==")}${t.id}${_lhD("Ij4=")}${avatar(t.teacher)}${_lhD("PGRpdiBjbGFzcz0iZ3JvdyIgc3R5bGU9Im1pbi13aWR0aDowIj48ZGl2IGNsYXNzPSJyb3cgYmV0d2VlbiBub3dyYXAiIHN0eWxlPSJnYXA6NnB4Ij48YiBjbGFzcz0ic21hbGwgdHJ1bmNhdGUiPg==")}${esc(t.teacher.name)}${_lhD("PC9iPjxzcGFuIGNsYXNzPSJ4cyBtdXRlZCBub3dyYXAiPg==")}${t.last ? ago(t.last.at) : ''}${_lhD("PC9zcGFuPjwvZGl2PjxkaXYgY2xhc3M9InhzIG11dGVkIHRydW5jYXRlIj4=")}${esc(t.teacher.subject || '')}${_lhD("PC9kaXY+PGRpdiBjbGFzcz0ieHMgdHJ1bmNhdGUgaW5rMiIgc3R5bGU9Im1hcmdpbi10b3A6MnB4Ij4=")}${t.last ? esc((t.last.from === _lhD("c3R1ZGVudA==") ? _lhD("QuG6oW46IA==") : '') + (t.last.recalled ? _lhD("VGluIG5o4bqvbiDEkcOjIHRodSBo4buTaQ==") : t.last.text || (t.last.attachments?.length ? _lhD("8J+TjiBU4buHcCDEkcOtbmgga8OobQ==") : ''))) : _lhD("Q2jGsGEgY8OzIHRpbiBuaOG6r24=")}${_lhD("PC9kaXY+PC9kaXY+")}${t.unread ? `${_lhD("PHNwYW4gY2xhc3M9ImNvdW50LXBpbGwiPg==")}${t.unread}${_lhD("PC9zcGFuPg==")}` : ''}${_lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIGljb24gZ2hvc3Qgc20iIGRhdGEtZGVsPSI=")}${t.id}${_lhD("IiBzdHlsZT0iY29sb3I6dmFyKC0tYmFkKSIgYXJpYS1sYWJlbD0iWMOzYSBjdeG7mWMgdHLDsiBjaHV54buHbiIgdGl0bGU9IljDs2EgY3Xhu5ljIHRyw7IgY2h1eeG7h24iPg==")}${icon(_lhD("dHJhc2g="))}${_lhD("PC9idXR0b24+PC9kaXY+")}`).join('')}${_lhD("PC9kaXY+")}` : empty(_lhD("Q2jGsGEgY8OzIGN14buZYyB0csOyIGNodXnhu4du"), _lhD("Q2jhu41uIHRo4bqneSBjw7QgY2jhu6cgbmhp4buHbSBob+G6t2MgZ2nDoW8gdmnDqm4gYuG7mSBtw7RuIMSR4buDIGjhu49pIGLDoGksIHhpbiBuZ2jhu4kgcGjDqXAu"), _lhD("bWVzc2FnZQ=="), `${_lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIHNtIiBpZD0iZW1wdHlOZXdUIiBzdHlsZT0ibWFyZ2luLXRvcDo0cHgiPg==")}${icon(_lhD("cGx1cw=="))}${_lhD("IENo4buNbiBnacOhbyB2acOqbiDEkeG7gyBuaOG6r248L2J1dHRvbj4=")}`));
if ($(_lhD("I3RoTmV3VA=="), view)) $(_lhD("I3RoTmV3VA=="), view).onclick = () => $(_lhD("I25ld1Q=")).click();
if ($(_lhD("I2VtcHR5TmV3VA=="), view)) $(_lhD("I2VtcHR5TmV3VA=="), view).onclick = () => $(_lhD("I25ld1Q=")).click();
$$(_lhD("W2RhdGEtdF0="), view).forEach(el => el.onclick = () => open(el.dataset.t));
$$(_lhD("W2RhdGEtZGVsXQ=="), view).forEach(el => el.onclick = async (e) => {
e.stopPropagation();
const t = threads.find(x => x.id === el.dataset.del);
if (!await confirmDialog({ title: _lhD("WMOzYSBjdeG7mWMgdHLDsiBjaHV54buHbg=="), message: `${_lhD("WMOzYSBjdeG7mWMgdHLDsiBjaHV54buHbiB24bubaSA8Yj4=")}${esc(t?.teacher?.name || '')}${_lhD("PC9iPiBraOG7j2kgZGFuaCBzw6FjaCBj4bunYSBi4bqhbj88YnI+R2nDoW8gdmnDqm4ga2jDtG5nIGLhu4sg4bqjbmggaMaw4bufbmcgdsOgIHbhuqtuIHhlbSDEkcaw4bujYyBjdeG7mWMgdHLDsiBjaHV54buHbiBuw6B5LiBO4bq/dSBi4bqhbiBuaOG6r24gbOG6oWksIGN14buZYyB0csOyIGNodXnhu4duIHPhur0gdOG7sSBoaeG7h24gbOG6oWku")}`, ok: _lhD("WMOzYQ=="), tone: _lhD("ZGFuZ2Vy") })) return;
await api.del(`${_lhD("YXBpL3RlYWNoZXItY2hhdC90aHJlYWRzLw==")}${el.dataset.del}`);
if (current?.id === el.dataset.del) { current = null; $(_lhD("I2Ns")).classList.remove(_lhD("c2hvdy1jaGF0")); drawChat(); }
toast(_lhD("xJDDoyB4w7NhIGN14buZYyB0csOyIGNodXnhu4duLg=="), _lhD("b2s="));
refreshThreads();
});
};
const leaveCard = (m) => `${_lhD("PGRpdiBjbGFzcz0iYnViYmxlIj48ZGl2IGNsYXNzPSJsZWF2ZS1jYXJkIj48Yj4=")}${icon(_lhD("ZmlsZQ=="))}${_lhD("IMSQxqFuIHhpbiBuZ2jhu4kgaOG7jWM8L2I+PGRpdiBjbGFzcz0ic21hbGwiIHN0eWxlPSJtYXJnaW4tdG9wOjRweCI+TmfDoHkg")}${esc(m.leave.date.split(_lhD("LQ==")).reverse().join(_lhD("Lw==")))}${_lhD("IMK3IA==")}${esc(m.leave.session)}${_lhD("PC9kaXY+PGRpdiBjbGFzcz0ic21hbGwiPkzDvSBkbzog")}${esc(m.text)}${_lhD("PC9kaXY+PGRpdiBzdHlsZT0ibWFyZ2luLXRvcDo2cHgiPg==")}${badge({ pending: _lhD("Q2jhu50gZHV54buHdA=="), approved: _lhD("xJDDoyBkdXnhu4d0"), rejected: _lhD("S2jDtG5nIGR1eeG7h3Q=") }[m.leave.status], { pending: _lhD("d2Fybg=="), approved: _lhD("b2s="), rejected: _lhD("YmFk") }[m.leave.status])}${_lhD("PC9kaXY+PC9kaXY+PC9kaXY+")}`;
const msgHtml = (m) => { const mine = m.from === _lhD("c3R1ZGVudA=="); return `${_lhD("PGRpdiBjbGFzcz0ibXNnIA==")}${mine ? _lhD("bWU=") : ''}${_lhD("Ij4=")}${!mine ? avatar(current.teacher, _lhD("c20=")) : ''}${_lhD("PGRpdj4=")}${m.kind === _lhD("bGVhdmU=") && !m.recalled ? leaveCard(m) : bubble(m, mine)}${_lhD("PGRpdiBjbGFzcz0idGltZSI+")}${fmtTime(m.at)}${_lhD("IMK3IA==")}${fmtDate(m.at)}${recallBtn(m, mine)}${_lhD("PC9kaXY+PC9kaXY+PC9kaXY+")}`; };
const setAnon = async (val) => {
if (!current) return;
try {
const r = await api.put(`${_lhD("YXBpL3RlYWNoZXItY2hhdC90aHJlYWRzLw==")}${current.id}${_lhD("L2Fub255bW91cw==")}`, { anonymous: !!val });
current = r.item;
drawChat();
refreshThreads();
toast(current.anonymous ? _lhD("xJDDoyBi4bqtdCBjaOG6vyDEkeG7mSBuaOG6r24gdGluIOG6qW4gZGFuaC4=") : _lhD("xJDDoyBjaHV54buDbiBzYW5nIGNo4bq/IMSR4buZIGhp4buHbiB0w6puIHRo4bqtdC4="), _lhD("b2s="), 2200);
} catch (er) { showError(er); }
};
const drawChat = () => {
const cp = $(_lhD("I2Nw"));
if (!current) { cp.innerHTML = empty(_lhD("Q2jhu41uIG3hu5l0IGN14buZYyB0csOyIGNodXnhu4du"), _lhD("VGluIG5o4bqvbiB24bubaSB0aOG6p3kgY8O0IHPhur0gaGnhu4NuIHRo4buLIHThuqFpIMSRw6J5Lg=="), _lhD("Y2hhdA==")); return; }
const isAnon = !!current.anonymous;
cp.innerHTML = `${_lhD("PGRpdiBjbGFzcz0iY2hhdC1oZWFkIj48YnV0dG9uIGNsYXNzPSJidG4gaWNvbiBnaG9zdCBzbSBiYWNrLWJ0biIgaWQ9ImJhY2siIGFyaWEtbGFiZWw9IlF1YXkgbOG6oWkiPg==")}${icon(_lhD("YXJyb3dMZWZ0"))}${_lhD("PC9idXR0b24+")}${avatar(current.teacher, _lhD("c20="))}${_lhD("PGRpdiBjbGFzcz0iZ3JvdyIgc3R5bGU9Im1pbi13aWR0aDowIj48YiBjbGFzcz0idHJ1bmNhdGUiPg==")}${esc(current.teacher.name)}${_lhD("PC9iPjxkaXYgY2xhc3M9InhzIG11dGVkIHRydW5jYXRlIj4=")}${esc(current.teacher.title || current.teacher.subject || '')}${_lhD("PC9kaXY+PC9kaXY+PGJ1dHRvbiBjbGFzcz0iYnRuIHNvZnQgc20iIGlkPSJsZWF2ZSIgdGl0bGU9Ikfhu61pIMSRxqFuIHhpbiBuZ2jhu4kgcGjDqXAiPg==")}${icon(_lhD("ZmlsZQ=="))}${_lhD("IE5naOG7iSBwaMOpcDwvYnV0dG9uPjxidXR0b24gdHlwZT0iYnV0dG9uIiBjbGFzcz0iYnRuIGljb24gZ2hvc3Qgc20iIGlkPSJkZWxUZWFjaGVyQ2hhdCIgc3R5bGU9ImNvbG9yOnZhcigtLWJhZCkiIHRpdGxlPSJYw7NhIGN14buZYyB0csOyIGNodXnhu4duIj4=")}${icon(_lhD("dHJhc2g="))}${_lhD("PC9idXR0b24+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0iY2hhdC1ib2R5IiBpZD0iY2IiPg==")}${current.messages.length ? current.messages.map(msgHtml).join('') : empty(_lhD("R+G7rWkgbOG7nWkgY2jDoG8gdOG7m2kgdGjhuqd5IGPDtA=="), _lhD("VHJhbyDEkeG7lWkgYsOgaSBo4buNYyBob+G6t2MgZ+G7rWkgxJHGoW4geGluIG5naOG7iSBwaMOpcC4="), _lhD("bWVzc2FnZQ=="))}${_lhD("PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0iY2hhdC1hbm9uLWJhciI+CiAgICAgICAgICA8bGFiZWwgY2xhc3M9ImNoZWNrIj48aW5wdXQgdHlwZT0iY2hlY2tib3giIGlkPSJhbm9uIiA=")}${isAnon ? _lhD("Y2hlY2tlZA==") : ''}${_lhD("PjxzcGFuIGNsYXNzPSJ0cnVuY2F0ZSI+PGI+Tmjhuq9uIOG6qW4gZGFuaDwvYj4gwrcg")}${isAnon ? _lhD("R2nhuqV1IHTDqm4gJiBs4bubcA==") : `${_lhD("SGnhu4duIHTDqm4gKA==")}${esc(firstName(S.user?.name || ''))}${_lhD("KQ==")}`}${_lhD("PC9zcGFuPjwvbGFiZWw+CiAgICAgICAgICA8YnV0dG9uIHR5cGU9ImJ1dHRvbiIgY2xhc3M9ImJhZGdlIA==")}${isAnon ? _lhD("dmlvbGV0") : _lhD("aW5mbw==")}${_lhD("IiBpZD0iYW5vblRvZ2dsZSIgc3R5bGU9ImJvcmRlcjowO2N1cnNvcjpwb2ludGVyIiB0aXRsZT0iQuG6pW0gxJHhu4MgxJHhu5VpIGNo4bq/IMSR4buZIOG6qW4gZGFuaCAvIGhp4buHbiB0w6puIj4=")}${icon(isAnon ? _lhD("bG9jaw==") : _lhD("dXNlcg=="))} ${isAnon ? _lhD("xJDDoyDhuqlu") : _lhD("SGnhu4duIHTDqm4=")}${_lhD("PC9idXR0b24+CiAgICAgICAgPC9kaXY+CiAgICAgICAgPGZvcm0gY2xhc3M9ImNoYXQtaW5wdXQiIGlkPSJjZiI+PHRleHRhcmVhIGlkPSJjdCIgcm93cz0iMSIgcGxhY2Vob2xkZXI9Ig==")}${isAnon ? _lhD("Tmjhuq9uIOG6qW4gZGFuaOKApg==") : _lhD("Tmjhuq9uIGNobyB0aOG6p3kgY8O04oCm")}${_lhD("IiBhcmlhLWxhYmVsPSJUaW4gbmjhuq9uIj48L3RleHRhcmVhPjxidXR0b24gY2xhc3M9ImJ0biBpY29uIiBhcmlhLWxhYmVsPSJH4butaSI+")}${icon(_lhD("c2VuZA=="))}${_lhD("PC9idXR0b24+PC9mb3JtPg==")}`;
const cb = $(_lhD("I2Ni")); cb.scrollTop = cb.scrollHeight;
cb.onclick = async (e) => { const b = e.target.closest(_lhD("W2RhdGEtcmVjYWxsXQ==")); if (!b) return; const r = await askRecall(`${_lhD("YXBpL3RlYWNoZXItY2hhdC90aHJlYWRzLw==")}${current.id}${_lhD("L21lc3NhZ2VzLw==")}${b.dataset.recall}${_lhD("L3JlY2FsbA==")}`); if (r) { current = r.item; drawChat(); refreshThreads(); } };
$(_lhD("I2JhY2s=")).onclick = () => { $(_lhD("I2Ns")).classList.remove(_lhD("c2hvdy1jaGF0")); };
$(_lhD("I2Fub24=")).onchange = (e) => setAnon(e.target.checked);
$(_lhD("I2Fub25Ub2dnbGU=")).onclick = () => setAnon(!isAnon);
$(_lhD("I2RlbFRlYWNoZXJDaGF0")).onclick = async () => {
if (!await confirmDialog({ title: _lhD("WMOzYSBjdeG7mWMgdHLDsiBjaHV54buHbg=="), message: `${_lhD("WMOzYSBjdeG7mWMgdHLDsiBjaHV54buHbiB24bubaSA8Yj4=")}${esc(current.teacher?.name || '')}${_lhD("PC9iPiBraOG7j2kgZGFuaCBzw6FjaCBj4bunYSBi4bqhbj8=")}`, ok: _lhD("WMOzYQ=="), tone: _lhD("ZGFuZ2Vy") })) return;
await api.del(`${_lhD("YXBpL3RlYWNoZXItY2hhdC90aHJlYWRzLw==")}${current.id}`);
current = null; $(_lhD("I2Ns")).classList.remove(_lhD("c2hvdy1jaGF0")); drawChat(); refreshThreads(); toast(_lhD("xJDDoyB4w7NhIGN14buZYyB0csOyIGNodXnhu4duLg=="), _lhD("b2s="));
};
$$(_lhD("W2RhdGEtcV0="), cp).forEach(b => b.onclick = () => { $(_lhD("I2N0")).value = b.dataset.q; $(_lhD("I2N0")).focus(); });
autoGrow($(_lhD("I2N0")), () => $(_lhD("I2Nm")).requestSubmit());
const comp = attachComposer($(_lhD("I2Nm")));
$(_lhD("I2Nm")).onsubmit = async (e) => { e.preventDefault(); const text = $(_lhD("I2N0")).value.trim(); $(_lhD("I2N0")).value = ''; const ok = await sendWithFiles(comp, text, async (b) => { const r = await api.post(`${_lhD("YXBpL3RlYWNoZXItY2hhdC90aHJlYWRzLw==")}${current.id}${_lhD("L21lc3NhZ2Vz")}`, { ...b, anonymous: $(_lhD("I2Fub24="))?.checked ?? false }); current = r.item; }, $(_lhD("I2NmIGJ1dHRvblthcmlhLWxhYmVsPSJH4butaSJd"))); if (ok) { refreshThreads(); drawChat(); } else if (text) $(_lhD("I2N0")).value = text; };
$(_lhD("I2xlYXZl")).onclick = () => modal({ title: _lhD("xJDGoW4geGluIG5naOG7iSBo4buNYw=="), sub: `${_lhD("R+G7rWkgdOG7m2kg")}${esc(current.teacher.name)}`, body: `${_lhD("PGZvcm0gaWQ9ImxmIiBjbGFzcz0ic3RhY2siPjxkaXYgY2xhc3M9ImZpZWxkLXJvdyI+PGRpdiBjbGFzcz0iZmllbGQiPjxsYWJlbCBmb3I9ImxkIj5OZ8OgeSBuZ2jhu4k8L2xhYmVsPjxpbnB1dCBpZD0ibGQiIG5hbWU9ImRhdGUiIHR5cGU9ImRhdGUiIHJlcXVpcmVkIHZhbHVlPSI=")}${new Date(Date.now() + 86400000).toISOString().slice(0, 10)}${_lhD("Ij48L2Rpdj48ZGl2IGNsYXNzPSJmaWVsZCI+PGxhYmVsIGZvcj0ibHMiPkJ14buVaTwvbGFiZWw+PHNlbGVjdCBpZD0ibHMiIG5hbWU9InNlc3Npb24iPjxvcHRpb24+Q+G6oyBuZ8OgeTwvb3B0aW9uPjxvcHRpb24+U8Ohbmc8L29wdGlvbj48b3B0aW9uPkNoaeG7gXU8L29wdGlvbj48L3NlbGVjdD48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPSJmaWVsZCI+PGxhYmVsIGZvcj0ibHIiPkzDvSBkbzwvbGFiZWw+PHRleHRhcmVhIGlkPSJsciIgbmFtZT0icmVhc29uIiByZXF1aXJlZCBwbGFjZWhvbGRlcj0iVsOtIGThu6U6IEVtIGLhu4sgc+G7kXQsIGdpYSDEkcOsbmggeGluIHBow6lwIGNobyBlbSBuZ2jhu4kgxJHhu4MgxJFpIGtow6FtLiI+PC90ZXh0YXJlYT48c3BhbiBjbGFzcz0iaGludCI+UGjhu6UgaHV5bmggdnVpIGzDsm5nIHjDoWMgbmjhuq1uIHbhu5tpIEdWQ04gcXVhIMSRaeG7h24gdGhv4bqhaSBu4bq/dSBuZ2jhu4kgZMOgaSBuZ8OgeS48L3NwYW4+PC9kaXY+PC9mb3JtPg==")}`,
foot: _lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIGdob3N0IiBkYXRhLWNsb3NlPkjhu6d5PC9idXR0b24+PGJ1dHRvbiBjbGFzcz0iYnRuIiBpZD0ibHNlbmQiPkfhu61pIMSRxqFuPC9idXR0b24+"), onMount: (m, close) => $(_lhD("I2xzZW5k"), m).onclick = async () => { const f = formData($(_lhD("I2xm"), m)); if (!f.reason.trim()) return toast(_lhD("VnVpIGzDsm5nIG5o4bqtcCBsw70gZG8gbmdo4buJLg=="), _lhD("d2Fybg==")); try { const r = await api.post(`${_lhD("YXBpL3RlYWNoZXItY2hhdC90aHJlYWRzLw==")}${current.id}${_lhD("L21lc3NhZ2Vz")}`, { kind: _lhD("bGVhdmU="), leave: f }); current = r.item; close(); drawChat(); toast(_lhD("xJDDoyBn4butaSDEkcahbiB4aW4gbmdo4buJLg=="), _lhD("b2s=")); } catch (e) { showError(e); } } });
};
const refreshThreads = async () => { threads = (await api.get(_lhD("YXBpL3RlYWNoZXItY2hhdC90aHJlYWRz"))).items; drawThreads(); };
const open = async (id) => { current = (await api.get(`${_lhD("YXBpL3RlYWNoZXItY2hhdC90aHJlYWRzLw==")}${id}`)).item; $(_lhD("I2Ns")).classList.add(_lhD("c2hvdy1jaGF0")); drawChat(); refreshThreads(); refreshBadges(); };
drawThreads(); drawChat();
const want = sessionStorage.getItem(_lhD("bGhfb3Blbl90aHJlYWQ=")); sessionStorage.removeItem(_lhD("bGhfb3Blbl90aHJlYWQ="));
if (want && threads.some(t => t.id === want)) open(want);
else if (threads[0] && innerWidth >= 1024) open(threads[0].id);
$(_lhD("I25ld1Q=")).onclick = async () => {
const items = (await api.get(_lhD("YXBpL3RlYWNoZXJz"))).items.filter(t => !t.counselor);
const fold = (s) => String(s || '').normalize(_lhD("TkZE")).replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, _lhD("ZA==")).toLowerCase();
modal({
title: _lhD("Tmjhuq9uIHRpbiBjaG8gZ2nDoW8gdmnDqm4="),
sub: `${items.length}${_lhD("IGdpw6FvIHZpw6puIMK3IGNo4buNbiB0aOG6p3kgY8O0IMSR4buDIGLhuq90IMSR4bqndSB0csOyIGNodXnhu4du")}`,
body: `${_lhD("PGRpdiBjbGFzcz0ic3RhY2siIHN0eWxlPSJnYXA6MTBweCI+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJzZWFyY2giPg==")}${icon(_lhD("c2VhcmNo"))}${_lhD("PGlucHV0IGlkPSJwaWNrUSIgcGxhY2Vob2xkZXI9IlTDrG0gdMOqbiBnacOhbyB2acOqbiwgY2jhu6ljIGRhbmgsIGLhu5kgbcO0buKApiIgYXJpYS1sYWJlbD0iVMOsbSBnacOhbyB2acOqbiI+PC9kaXY+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJsaXN0IiBpZD0icGlja0xpc3QiIHN0eWxlPSJtYXgtaGVpZ2h0OjU4dmg7b3ZlcmZsb3c6YXV0byI+PC9kaXY+CiAgICAgICAgPC9kaXY+")}`,
onMount: (m, close) => {
const listEl = $(_lhD("I3BpY2tMaXN0"), m), qEl = $(_lhD("I3BpY2tR"), m);
const renderList = (q = '') => {
const kw = q.trim().toLowerCase(), kwFold = fold(kw);
const filtered = !kw ? items : items.filter(t => {
const hay = [t.name, t.className, t.subject, t.department].filter(Boolean).join(_lhD("IA=="));
return hay.toLowerCase().includes(kw) || fold(hay).includes(kwFold);
});
listEl.innerHTML = filtered.length
? filtered.map(t => `${_lhD("PGRpdiBjbGFzcz0iaXRlbSBjbGljayIgZGF0YS1waWNrPSI=")}${t.id}${_lhD("Ij4=")}${avatar(t)}${_lhD("PGRpdiBjbGFzcz0iZ3JvdyI+PGIgY2xhc3M9InNtYWxsIj4=")}${esc(t.name)}${_lhD("PC9iPjxkaXYgY2xhc3M9InhzIG11dGVkIj4=")}${esc([t.className, t.subject, t.department].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(_lhD("IMK3IA==")))}${_lhD("PC9kaXY+PC9kaXY+")}${icon(_lhD("Y2hldnJvblJpZ2h0"))}${_lhD("PC9kaXY+")}`).join('')
: empty(_lhD("S2jDtG5nIHTDrG0gdGjhuqV5IGdpw6FvIHZpw6pu"), _lhD("VGjhu60gbmjhuq1wIHThu6sga2jDs2Ega2jDoWMu"), _lhD("c2VhcmNo"));
$$(_lhD("W2RhdGEtcGlja10="), listEl).forEach(el => el.onclick = async () => {
const r = await api.post(_lhD("YXBpL3RlYWNoZXItY2hhdC90aHJlYWRz"), { teacherId: el.dataset.pick });
close(); await refreshThreads(); open(r.item.id);
});
};
renderList();
qEl.oninput = (e) => renderList(e.target.value);
setTimeout(() => qEl.focus(), 50);
},
});
};
S.cleanups.push(live.on(_lhD("dGVhY2hlci1jaGF0Om1lc3NhZ2U="), async ({ threadId }) => { if (current?.id === threadId) { current = (await api.get(`${_lhD("YXBpL3RlYWNoZXItY2hhdC90aHJlYWRzLw==")}${threadId}`)).item; drawChat(); } refreshThreads(); }));
},
async 'teacher-list'(view) {
const items = (await api.get(_lhD("YXBpL3RlYWNoZXJz"))).items;
const canChat = enabled(ALL.find(a => a.id === _lhD("dGVhY2hlci1jaGF0")));
const startChat = async (id, btn) => {
try {
btn && (btn.disabled = true);
const r = await api.post(_lhD("YXBpL3RlYWNoZXItY2hhdC90aHJlYWRz"), { teacherId: id });
sessionStorage.setItem(_lhD("bGhfb3Blbl90aHJlYWQ="), r.item.id);
go(_lhD("dGVhY2hlci1jaGF0"));
} catch (e) { showError(e); } finally { btn && (btn.disabled = false); }
};
const actions = (t) => `${canChat ? `${_lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIHNtIiBkYXRhLWNoYXQ9Ig==")}${t.id}${_lhD("Ij4=")}${icon(_lhD("bWVzc2FnZQ=="))}${_lhD("IE5o4bqvbiB0aW48L2J1dHRvbj4=")}` : ''}${t.phone ? `${_lhD("PGEgY2xhc3M9ImJ0biBzb2Z0IHNtIiBocmVmPSJ0ZWw6")}${esc(t.phone.replace(/\s/g, ''))}${_lhD("Ij4=")}${icon(_lhD("cGhvbmU="))}${_lhD("IEfhu41pPC9hPg==")}` : ''}${t.email ? `${_lhD("PGEgY2xhc3M9ImJ0biBnaG9zdCBzbSIgaHJlZj0ibWFpbHRvOg==")}${esc(t.email)}${_lhD("Ij4=")}${icon(_lhD("bWFpbA=="))}${_lhD("IEVtYWlsPC9hPg==")}` : ''}`;
const card = (t) => `${_lhD("PGFydGljbGUgY2xhc3M9ImNhcmQgdGVhbS1jYXJkIj4KICAgICAgPGRpdiBjbGFzcz0idGVhbS10b3AiPjxzcGFuIGNsYXNzPSJ0ZWFtLWF2Ij4=")}${avatar(t, _lhD("bGc="))}${_lhD("PC9zcGFuPgogICAgICAgIDxkaXYgY2xhc3M9Imdyb3ciIHN0eWxlPSJtaW4td2lkdGg6MCI+PGIgY2xhc3M9InRydW5jYXRlIj4=")}${esc(t.name)}${_lhD("PC9iPjxkaXYgY2xhc3M9InhzIG11dGVkIHRlYW0tdGl0bGUiPg==")}${esc(t.className || '')}${_lhD("PC9kaXY+")}${t.department ? `${_lhD("PGRpdiBjbGFzcz0idGVhbS10YWdzIj48c3BhbiBjbGFzcz0iYmFkZ2UiPg==")}${esc(t.department)}${_lhD("PC9zcGFuPjwvZGl2Pg==")}` : ''}${_lhD("PC9kaXY+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9InRlYW0tYWN0Ij4=")}${actions(t)}${_lhD("PC9kaXY+PC9hcnRpY2xlPg==")}`;
const draw = (list) => { $(_lhD("I3RsR3JpZA==")).innerHTML = list.length ? `${_lhD("PGRpdiBjbGFzcz0idGVhbS1ncmlkIj4=")}${list.map(card).join('')}${_lhD("PC9kaXY+")}` : empty(_lhD("S2jDtG5nIHTDrG0gdGjhuqV5"), _lhD("VGjhu60gdOG7qyBraMOzYSBraMOhYy4="), _lhD("c2VhcmNo")); };
view.innerHTML = head(_lhD("RGFuaCBzw6FjaCBnacOhbyB2acOqbg=="), `${items.length}${_lhD("IHRo4bqneSBjw7QgxJFhbmcgY8O0bmcgdMOhYyB04bqhaSB0csaw4budbmcgwrcgYuG6pW0g4oCcTmjhuq9uIHRpbuKAnSDEkeG7gyB0cmFvIMSR4buVaSByacOqbmcu")}`) + `${_lhD("CiAgICA8ZGl2IGNsYXNzPSJzZWFyY2giIHN0eWxlPSJtYXgtd2lkdGg6MTAwJTttYXJnaW4tYm90dG9tOjE0cHgiPg==")}${icon(_lhD("c2VhcmNo"))}${_lhD("PGlucHV0IGlkPSJ0bFEiIHBsYWNlaG9sZGVyPSJUw6xtIHRoZW8gdMOqbiwgY2jhu6ljIGRhbmgsIG3DtG4gZOG6oXnigKYiIGFyaWEtbGFiZWw9IlTDrG0gZ2nDoW8gdmnDqm4iPjwvZGl2PgogICAgPGRpdiBpZD0idGxHcmlkIj48L2Rpdj4=")}`;
draw(items);
$(_lhD("I3RsUQ==")).oninput = (e) => { const q = e.target.value.trim().toLowerCase(); draw(!q ? items : items.filter(t => [t.name, t.className, t.subject, t.department].some(f => (f || '').toLowerCase().includes(q)))); };
onView(view, _lhD("Y2xpY2s="), (e) => { const c = e.target.closest(_lhD("W2RhdGEtY2hhdF0=")); if (c) startChat(c.dataset.chat, c); });
},
async quiz(view) {
let [topics, lb] = await Promise.all([api.get(_lhD("YXBpL3F1aXovdG9waWNz")), api.get(_lhD("YXBpL3F1aXovbGVhZGVyYm9hcmQ/cGVyaW9kPXdlZWs="))]);
let topic = _lhD("YWxs"), count = 10, period = _lhD("d2Vlaw=="), board = lb, gateTimer = 0;
S.cleanups.push(() => clearInterval(gateTimer));
const evalGate = () => {
const g = topics.gate || { locked: false, state: _lhD("b3Blbg==") };
const now = Date.now();
const openMs = g.openAt ? new Date(g.openAt).getTime() : 0;
const closeMs = g.closeAt ? new Date(g.closeAt).getTime() : 0;
let state = _lhD("b3Blbg==");
if (g.manualLock) {
if (openMs && now >= openMs && (!closeMs || now <= closeMs)) state = _lhD("b3Blbg==");
else if (openMs && now < openMs) state = _lhD("c2NoZWR1bGVk");
else state = _lhD("bG9ja2Vk");
} else if (openMs && now < openMs) state = _lhD("c2NoZWR1bGVk");
else if (closeMs && now > closeMs) state = _lhD("Y2xvc2Vk");
return { ...g, state, locked: state !== _lhD("b3Blbg=="), openMs, closeMs };
};
const fmtRemain = (ms) => {
const sec = Math.max(0, Math.ceil(ms / 1000));
const d = Math.floor(sec / 86400);
const h = Math.floor((sec % 86400) / 3600);
const m = Math.floor((sec % 3600) / 60);
const s = sec % 60;
return { d, h: String(h).padStart(2, _lhD("MA==")), m: String(m).padStart(2, _lhD("MA==")), s: String(s).padStart(2, _lhD("MA==")) };
};
const lobby = () => {
clearInterval(gateTimer);
const top = board.items;
const g = evalGate();
const rem = g.state === _lhD("c2NoZWR1bGVk") ? fmtRemain(g.openMs - Date.now()) : null;
view.innerHTML = head(_lhD("xJDhuqV1IHRyxrDhu51uZyB0cuG6r2MgbmdoaeG7h20gdHJpIHRo4bupYw=="), _lhD("VGjhu60gdGjDoWNoIGhp4buDdSBiaeG6v3QgduG7gSBr4bu5IG7Eg25nIHBow7JuZyBjaOG7kW5nIGLhuqFvIGzhu7FjLCBhbiBuaW5oIG3huqFuZywgcGjDoXAgbHXhuq10IHbDoCBhbiB0b8OgbiBnaWFvIHRow7RuZy4=")) + `${_lhD("CiAgICAgIDxkaXYgY2xhc3M9ImdyaWQgZy1tYWluIHF1aXotbG9iYnkiPgogICAgICAgIDxkaXYgY2xhc3M9InN0YWNrIiBzdHlsZT0iZ2FwOjEycHgiPgogICAgICAgICAgPHNlY3Rpb24gY2xhc3M9ImNhcmQgcXVpei1zZXR1cCA=")}${g.locked ? _lhD("aXMtbG9ja2Vk") : ''}${_lhD("Ij4KICAgICAgICAgICAgPGRpdiBjbGFzcz0icXVpei1zZXR1cC1oZWFkIj4KICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJyb3cgYmV0d2VlbiBub3dyYXAiIHN0eWxlPSJnYXA6OHB4Ij4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9InJvdyBub3dyYXAiIHN0eWxlPSJnYXA6NnB4Ij4KICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9ImJhZGdlIHdhcm4iPg==")}${icon(_lhD("dHJvcGh5"))}${_lhD("IE3DuWEgdGhpIMSRdWEgdGjDoW5nIA==")}${new Date().getMonth() + 1}${_lhD("PC9zcGFuPgogICAgICAgICAgICAgICAgICA=")}${g.locked ? `${_lhD("PHNwYW4gY2xhc3M9ImJhZGdlIA==")}${g.state === _lhD("c2NoZWR1bGVk") ? _lhD("aW5mbw==") : _lhD("YmFk")}${_lhD("Ij4=")}${icon(_lhD("bG9jaw=="))} ${g.state === _lhD("c2NoZWR1bGVk") ? _lhD("SOG6uW4gZ2nhu50gbeG7nyDEkeG7gQ==") : g.state === _lhD("Y2xvc2Vk") ? _lhD("xJDDoyDEkcOzbmcgxJHhu4E=") : _lhD("xJBhbmcga2jDs2E=")}${_lhD("PC9zcGFuPg==")}` : `${_lhD("PHNwYW4gY2xhc3M9ImJhZGdlIG9rIj4=")}${icon(_lhD("dW5sb2Nr"))}${_lhD("IMSQYW5nIG3hu58gdGhpPC9zcGFuPg==")}`}${_lhD("CiAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJ4cyBtdXRlZCI+")}${icon(_lhD("dGltZXI="))}${_lhD("IDMwcyAvIGPDonU8L3NwYW4+CiAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgPGgyPlRy4bqjIGzhu51pIG5oYW5oLCBjaMOtbmggeMOhYyDEkeG7gyBs4buNdCBUb3AgMyBi4bqjbmcgdsOgbmcgdHXhuqduITwvaDI+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICA=")}${g.locked ? `${_lhD("CiAgICAgICAgICAgICAgPGRpdiBjbGFzcz0icXVpei1sb2NrLWJveCA=")}${g.state}${_lhD("Ij4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9InF1aXotbG9jay1pY28iPg==")}${icon(g.state === _lhD("c2NoZWR1bGVk") ? _lhD("Y2xvY2s=") : _lhD("bG9jaw=="))}${_lhD("PC9kaXY+CiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJxdWl6LWxvY2staW5mbyI+CiAgICAgICAgICAgICAgICAgIDxiPg==")}${g.state === _lhD("c2NoZWR1bGVk") ? _lhD("xJDhuqV1IHRyxrDhu51uZyDEkWFuZyBraMOzYSDCtyBDaOG7nSDEkeG6v24gZ2nhu50gbeG7nyB0aGk=") : g.state === _lhD("Y2xvc2Vk") ? _lhD("xJDDoyBr4bq/dCB0aMO6YyB0aOG7nWkgZ2lhbiBt4bufIMSR4buBIHRoaQ==") : _lhD("xJDhuqV1IHRyxrDhu51uZyDEkWFuZyB04bqhbSBraMOzYQ==")}${_lhD("PC9iPgogICAgICAgICAgICAgICAgICA8cD4=")}${g.state === _lhD("c2NoZWR1bGVk") ? `${_lhD("xJDhu4EgdGhpIHPhur0gdOG7sSDEkeG7mW5nIG3hu58gbMO6YyA8Yj4=")}${fmtDateTime(g.openAt)}${_lhD("PC9iPi4=")}${g.closeAt ? `${_lhD("IEjhuqFuIMSRw7NuZyDEkeG7gTogPGI+")}${fmtDateTime(g.closeAt)}${_lhD("PC9iPi4=")}` : ''}` : g.state === _lhD("Y2xvc2Vk") ? `${_lhD("VGjhu51pIGdpYW4gbMOgbSBiw6BpIMSRw6MgxJHDs25nIGzDumMgPGI+")}${fmtDateTime(g.closeAt)}${_lhD("PC9iPi4=")}` : esc(g.note || _lhD("TmjDoCB0csaw4budbmcgxJFhbmcgdOG6oW0ga2jDs2EgxJHhuqV1IHRyxrDhu51uZy4gxJDhu4EgdGhpIHPhur0gxJHGsOG7o2MgbeG7nyBraGkgxJHhur9uIGdp4budIHRoaS4="))}${_lhD("PC9wPgogICAgICAgICAgICAgICAgICA=")}${g.state === _lhD("c2NoZWR1bGVk") && g.note ? `${_lhD("PHAgY2xhc3M9InhzIiBzdHlsZT0ibWFyZ2luLXRvcDoycHg7Y29sb3I6dmFyKC0tYnJhbmQpIj4=")}${icon(_lhD("aW5mbw=="))} ${esc(g.note)}${_lhD("PC9wPg==")}` : ''}${_lhD("CiAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgIA==")}${g.state === _lhD("c2NoZWR1bGVk") && rem ? `${_lhD("CiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9InF1aXotY291bnRkb3duIiBpZD0icXpDZCIgYXJpYS1sYWJlbD0ixJDhur9tIG5nxrDhu6NjIMSR4bq/biBnaeG7nSBt4bufIHRoaSI+CiAgICAgICAgICAgICAgICAgICAg")}${rem.d > 0 ? `${_lhD("PGRpdiBjbGFzcz0icWNkLWJveCI+PGIgaWQ9InFjZEQiPg==")}${rem.d}${_lhD("PC9iPjxzcGFuPk5nw6B5PC9zcGFuPjwvZGl2PjxzcGFuIGNsYXNzPSJxY2QtY29sb24iPjo8L3NwYW4+")}` : ''}${_lhD("CiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0icWNkLWJveCI+PGIgaWQ9InFjZEgiPg==")}${rem.h}${_lhD("PC9iPjxzcGFuPkdp4budPC9zcGFuPjwvZGl2PjxzcGFuIGNsYXNzPSJxY2QtY29sb24iPjo8L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0icWNkLWJveCI+PGIgaWQ9InFjZE0iPg==")}${rem.m}${_lhD("PC9iPjxzcGFuPlBow7p0PC9zcGFuPjwvZGl2PjxzcGFuIGNsYXNzPSJxY2QtY29sb24iPjo8L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0icWNkLWJveCI+PGIgaWQ9InFjZFMiPg==")}${rem.s}${_lhD("PC9iPjxzcGFuPkdpw6J5PC9zcGFuPjwvZGl2PgogICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgIA==")}` : ''}${_lhD("CiAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgIA==")}` : (g.closeAt && g.closeMs > Date.now() ? `${_lhD("PGRpdiBjbGFzcz0icXVpei1vcGVuLW5vdGUiPg==")}${icon(_lhD("Y2xvY2s="))}${_lhD("IMSQYW5nIHRyb25nIGtodW5nIGdp4budIG3hu58gxJHhu4EgwrcgxJHDs25nIGzDumMgPGI+")}${fmtDateTime(g.closeAt)}${_lhD("PC9iPg==")}${g.note ? `${_lhD("IMK3IA==")}${esc(g.note)}` : ''}${_lhD("PC9kaXY+")}` : '')}${_lhD("CiAgICAgICAgICAgIDxkaXYgY2xhc3M9InF1aXotZmllbGQiPgogICAgICAgICAgICAgIDxkaXYgY2xhc3M9InF1aXotbGFiZWwiPkNo4bunIMSR4buBIGPDonUgaOG7j2k8L2Rpdj4KICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJjaGlwcyI+CiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9ImJ1dHRvbiIgY2xhc3M9ImNoaXAg")}${topic === _lhD("YWxs") ? _lhD("YWN0aXZl") : ''}${_lhD("IiBkYXRhLXRvcGljPSJhbGwiPlThu5VuZyBo4bujcCAo")}${topics.total}${_lhD("KTwvYnV0dG9uPgogICAgICAgICAgICAgICAg")}${topics.topics.filter(t => t.count).map(t => `${_lhD("PGJ1dHRvbiB0eXBlPSJidXR0b24iIGNsYXNzPSJjaGlwIA==")}${topic === t.id ? _lhD("YWN0aXZl") : ''}${_lhD("IiBkYXRhLXRvcGljPSI=")}${t.id}${_lhD("Ij4=")}${esc(t.short)}${_lhD("ICg=")}${t.count}${_lhD("KTwvYnV0dG9uPg==")}`).join('')}${_lhD("CiAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJxdWl6LXN0YXJ0LXJvdyI+CiAgICAgICAgICAgICAgPGRpdiBjbGFzcz0icXVpei1maWVsZCIgc3R5bGU9ImZsZXg6MTttaW4td2lkdGg6MCI+CiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJxdWl6LWxhYmVsIj5T4buRIGzGsOG7o25nIGPDonU8L2Rpdj4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9ImNoaXBzIj4=")}${[5, 10, 15].map(n => `${_lhD("PGJ1dHRvbiB0eXBlPSJidXR0b24iIGNsYXNzPSJjaGlwIA==")}${count === n ? _lhD("YWN0aXZl") : ''}${_lhD("IiBkYXRhLWNvdW50PSI=")}${n}${_lhD("Ij4=")}${n}${_lhD("IGPDonU8L2J1dHRvbj4=")}`).join('')}${_lhD("PC9kaXY+CiAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPSJidXR0b24iIGNsYXNzPSJidG4gcXVpei1nby1idG4iIGlkPSJzdGFydCIg")}${g.locked ? _lhD("ZGlzYWJsZWQ=") : ''}${_lhD("Pg==")}${icon(g.locked ? _lhD("bG9jaw==") : _lhD("cGxheQ=="))} ${g.locked ? (g.state === _lhD("c2NoZWR1bGVk") ? _lhD("Q2jGsGEgxJHhur9uIGdp4budIHRoaQ==") : g.state === _lhD("Y2xvc2Vk") ? _lhD("xJDDoyBo4bq/dCBnaeG7nSB0aGk=") : _lhD("xJBhbmcga2jDs2E=")) : _lhD("QuG6r3QgxJHhuqd1IHRoaQ==")}${_lhD("PC9idXR0b24+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPC9zZWN0aW9uPgogICAgICAgICAgPHNlY3Rpb24gY2xhc3M9InF1aXotc3RhdHMiPgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJjYXJkIHF1aXotc3RhdCI+CiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InFzLWljbyI+")}${icon(_lhD("Z2FtZXBhZA=="))}${_lhD("PC9zcGFuPgogICAgICAgICAgICAgIDxkaXY+PGI+")}${board.mine.attempts}${_lhD("PC9iPjxzcGFuPkzGsOG7o3QgdGhpPC9zcGFuPjwvZGl2PgogICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0iY2FyZCBxdWl6LXN0YXQiPgogICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJxcy1pY28iIHN0eWxlPSItLWM6dmFyKC0tb2spIj4=")}${icon(_lhD("dGFyZ2V0"))}${_lhD("PC9zcGFuPgogICAgICAgICAgICAgIDxkaXY+PGI+")}${board.mine.best}${_lhD("PHNtYWxsPi8xMDA8L3NtYWxsPjwvYj48c3Bhbj7EkGnhu4NtIGNhbyBuaOG6pXQ8L3NwYW4+PC9kaXY+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJjYXJkIHF1aXotc3RhdCI+CiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InFzLWljbyIgc3R5bGU9Ii0tYzp2YXIoLS13YXJuKSI+")}${icon(_lhD("YXdhcmQ="))}${_lhD("PC9zcGFuPgogICAgICAgICAgICAgIDxkaXYgc3R5bGU9Im1pbi13aWR0aDowIj48Yj4=")}${board.mine.badges.length}${_lhD("PC9iPjxzcGFuIGNsYXNzPSJ0cnVuY2F0ZSIgdGl0bGU9Ig==")}${esc(board.mine.badges.map(b => b.label).join(_lhD("LCA=")) || _lhD("Q2jGsGEgY8OzIGh1eSBoaeG7h3U="))}${_lhD("Ij4=")}${board.mine.badges.length ? esc(board.mine.badges[0].label) : _lhD("SHV5IGhp4buHdQ==")}${_lhD("PC9zcGFuPjwvZGl2PgogICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgIDwvc2VjdGlvbj4KICAgICAgICA8L2Rpdj4KICAgICAgICA8c2VjdGlvbiBjbGFzcz0iY2FyZCBxdWl6LWJvYXJkIj48ZGl2IGNsYXNzPSJjYXJkLWhlYWQiPjxoMj4=")}${icon(_lhD("Y3Jvd24="))}${_lhD("IELhuqNuZyB2w6BuZzwvaDI+PGRpdiBjbGFzcz0ic2VnIj48YnV0dG9uIGRhdGEtcD0id2VlayIgY2xhc3M9Ig==")}${period === _lhD("d2Vlaw==") ? _lhD("YWN0aXZl") : ''}${_lhD("Ij5UdeG6p24gbsOgeTwvYnV0dG9uPjxidXR0b24gZGF0YS1wPSJhbGwiIGNsYXNzPSI=")}${period === _lhD("YWxs") ? _lhD("YWN0aXZl") : ''}${_lhD("Ij5N4buNaSBsw7pjPC9idXR0b24+PC9kaXY+PC9kaXY+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJjYXJkLWJvZHkgc3RhY2siIHN0eWxlPSJnYXA6MTBweCI+CiAgICAgICAgICAgIA==")}${top.length >= 3 ? `${_lhD("PGRpdiBjbGFzcz0icG9kaXVtIj4=")}${[1, 0, 2].map(i => `${_lhD("PGRpdiBjbGFzcz0icCBw")}${i + 1}${_lhD("Ij4=")}${avatar({ id: top[i].userId, name: top[i].name, avatar: top[i].avatar }, _lhD("c20="))}${_lhD("PGIgY2xhc3M9InhzIHRydW5jYXRlIiBzdHlsZT0ibWF4LXdpZHRoOjEwMCUiPg==")}${esc(firstName(top[i].name))}${_lhD("PC9iPjxzcGFuIGNsYXNzPSJ4cyBtdXRlZCIgc3R5bGU9ImZvbnQtc2l6ZToxMC41cHgiPg==")}${top[i].score}${_lhD("xJEgwrcg")}${top[i].duration}${_lhD("czwvc3Bhbj48ZGl2IGNsYXNzPSJzdGFuZCI+")}${i + 1}${_lhD("PC9kaXY+PC9kaXY+")}`).join('')}${_lhD("PC9kaXY+")}` : ''}${_lhD("CiAgICAgICAgICAgIDxkaXYgY2xhc3M9Imxpc3QiPg==")}${(top.length >= 3 ? top.slice(3) : top).map(t => `${_lhD("PGRpdiBjbGFzcz0iaXRlbSI+PHNwYW4gY2xhc3M9Im1lZGFsIA==")}${t.rank <= 3 ? _lhD("bQ==") + t.rank : _lhD("bXg=")}${_lhD("Ij4=")}${t.rank}${_lhD("PC9zcGFuPg==")}${avatar({ id: t.userId, name: t.name, avatar: t.avatar }, _lhD("c20="))}${_lhD("PGRpdiBjbGFzcz0iZ3JvdyIgc3R5bGU9Im1pbi13aWR0aDowIj48YiBjbGFzcz0ic21hbGwgdHJ1bmNhdGUiIHN0eWxlPSJkaXNwbGF5OmJsb2NrIj4=")}${esc(t.name)}${_lhD("PC9iPjxkaXYgY2xhc3M9InhzIG11dGVkIj4=")}${esc(t.className)}${_lhD("IMK3IA==")}${t.attempts}${_lhD("IGzGsOG7o3Q8L2Rpdj48L2Rpdj48YiBjbGFzcz0ibnVtIHNtYWxsIj4=")}${t.score}${_lhD("xJE8L2I+PC9kaXY+")}`).join('') || empty(_lhD("Q2jGsGEgY8OzIGzGsOG7o3QgdGhp"))}${_lhD("PC9kaXY+CiAgICAgICAgICA8L2Rpdj48L3NlY3Rpb24+CiAgICAgIDwvZGl2Pgo=")}`;
$$(_lhD("W2RhdGEtdG9waWNd"), view).forEach(b => b.onclick = () => { topic = b.dataset.topic; lobby(); });
$$(_lhD("W2RhdGEtY291bnRd"), view).forEach(b => b.onclick = () => { count = +b.dataset.count; lobby(); });
$$(_lhD("W2RhdGEtcF0="), view).forEach(b => b.onclick = async () => { period = b.dataset.p; board = await api.get(`${_lhD("YXBpL3F1aXovbGVhZGVyYm9hcmQ/cGVyaW9kPQ==")}${period}`); lobby(); });
if ($(_lhD("I3N0YXJ0")) && !g.locked) $(_lhD("I3N0YXJ0")).onclick = play;
if (g.state === _lhD("c2NoZWR1bGVk") && g.openMs) {
gateTimer = setInterval(async () => {
const leftMs = g.openMs - Date.now();
if (leftMs <= 0) {
clearInterval(gateTimer);
topics = await api.get(_lhD("YXBpL3F1aXovdG9waWNz")).catch(() => topics);
toast(_lhD("xJDDoyDEkeG6v24gZ2nhu50gbeG7nyB0aGkhIELhuqFuIGPDsyB0aOG7gyBi4bqvdCDEkeG6p3UgbMOgbSBiw6BpLg=="), _lhD("b2s="), 4000);
lobby();
return;
}
const r = fmtRemain(leftMs);
if ($(_lhD("I3FjZEQ="), view)) $(_lhD("I3FjZEQ="), view).textContent = r.d;
if ($(_lhD("I3FjZEg="), view)) $(_lhD("I3FjZEg="), view).textContent = r.h;
if ($(_lhD("I3FjZE0="), view)) $(_lhD("I3FjZE0="), view).textContent = r.m;
if ($(_lhD("I3FjZFM="), view)) $(_lhD("I3FjZFM="), view).textContent = r.s;
}, 1000);
} else if (!g.locked && g.closeMs && g.closeMs > Date.now()) {
gateTimer = setInterval(() => {
if (Date.now() >= g.closeMs) {
clearInterval(gateTimer);
toast(_lhD("xJDDoyBo4bq/dCB0aOG7nWkgZ2lhbiBt4bufIMSR4buBIHRoaS4="), _lhD("d2Fybg=="));
lobby();
}
}, 1000);
}
};
const play = async () => {
clearInterval(gateTimer);
const { items, timeLimit } = await api.get(`${_lhD("YXBpL3F1aXovcXVlc3Rpb25zP3RvcGljPQ==")}${topic}${_lhD("JmNvdW50PQ==")}${count}`);
const answers = {}; let i = 0, left = timeLimit; const t0 = Date.now();
const tick = setInterval(() => { left--; const bar = $(_lhD("I3RiIGk=")); if (bar) bar.style.width = `${left / timeLimit * 100}${_lhD("JQ==")}`; const tl = $(_lhD("I3Rs")); if (tl) tl.textContent = `${Math.floor(left / 60)}${_lhD("Og==")}${String(left % 60).padStart(2, _lhD("MA=="))}`; if (left <= 0) finish(); }, 1000);
S.cleanups.push(() => clearInterval(tick));
const drawQ = () => {
const q = items[i];
view.innerHTML = `${_lhD("PGRpdiBjbGFzcz0iY2FyZCBxdWl6LXBsYXktY2FyZCIgc3R5bGU9Im1heC13aWR0aDo3NjBweDttYXJnaW46MCBhdXRvO3dpZHRoOjEwMCUiPjxkaXYgY2xhc3M9ImNhcmQtYm9keSBzdGFjayIgc3R5bGU9ImdhcDoxMnB4Ij4KICAgICAgICAgIDxkaXYgY2xhc3M9InJvdyBiZXR3ZWVuIG5vd3JhcCI+PHNwYW4gY2xhc3M9ImJhZGdlIGluZm8iPg==")}${esc(q.topicName || '')}${_lhD("IMK3IA==")}${esc(q.difficulty)}${_lhD("PC9zcGFuPjxzcGFuIGNsYXNzPSJyb3cgc21hbGwgbXV0ZWQiIHN0eWxlPSJnYXA6NXB4Ij4=")}${icon(_lhD("dGltZXI="))}${_lhD("IDxiIGlkPSJ0bCIgY2xhc3M9Im1vbm8iPg==")}${Math.floor(left / 60)}${_lhD("Og==")}${String(left % 60).padStart(2, _lhD("MA=="))}${_lhD("PC9iPjwvc3Bhbj48L2Rpdj4KICAgICAgICAgIDxkaXYgY2xhc3M9InRpbWVyLWJhciIgaWQ9InRiIj48aSBzdHlsZT0id2lkdGg6")}${left / timeLimit * 100}${_lhD("JSI+PC9pPjwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzcz0icm93IGJldHdlZW4gbm93cmFwIj48c3BhbiBjbGFzcz0iZXllYnJvdyI+Q8OidSA=")}${i + 1}${_lhD("IC8g")}${items.length}${_lhD("PC9zcGFuPjxkaXYgY2xhc3M9InJvdyIgc3R5bGU9ImdhcDo0cHgiPg==")}${items.map((_, k) => `${_lhD("PHNwYW4gc3R5bGU9IndpZHRoOg==")}${Math.max(6, 160 / items.length)}${_lhD("cHg7aGVpZ2h0OjVweDtib3JkZXItcmFkaXVzOjRweDtiYWNrZ3JvdW5kOg==")}${k < i || answers[items[k].id] !== undefined ? _lhD("dmFyKC0tYnJhbmQp") : k === i ? _lhD("dmFyKC0tYnJhbmQtbGluZSk=") : _lhD("dmFyKC0tc3VyZmFjZS0zKQ==")}${_lhD("Ij48L3NwYW4+")}`).join('')}${_lhD("PC9kaXY+PC9kaXY+CiAgICAgICAgICA8aDIgY2xhc3M9InF1aXotcSI+")}${esc(q.question)}${_lhD("PC9oMj4KICAgICAgICAgIDxkaXYgY2xhc3M9Im9wdHMiPg==")}${q.options.map((o, k) => `${_lhD("PGJ1dHRvbiBjbGFzcz0ib3B0IA==")}${answers[q.id] === k ? _lhD("cGlja2Vk") : ''}${_lhD("IiBkYXRhLWs9Ig==")}${k}${_lhD("Ij48c3BhbiBjbGFzcz0ibCI+")}${_lhD("QUJDRA==")[k]}${_lhD("PC9zcGFuPjxzcGFuPg==")}${esc(o)}${_lhD("PC9zcGFuPjwvYnV0dG9uPg==")}`).join('')}${_lhD("PC9kaXY+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJyb3cgYmV0d2VlbiIgc3R5bGU9InBhZGRpbmctdG9wOjRweCI+PGJ1dHRvbiBjbGFzcz0iYnRuIGdob3N0IHNtIiBpZD0icHJldiIg")}${i === 0 ? _lhD("ZGlzYWJsZWQ=") : ''}${_lhD("Pg==")}${icon(_lhD("YXJyb3dMZWZ0"))}${_lhD("IEPDonUgdHLGsOG7m2M8L2J1dHRvbj48YnV0dG9uIGNsYXNzPSJidG4gc20iIGlkPSJuZXh0Ij4=")}${i === items.length - 1 ? `${icon(_lhD("Y2hlY2s="))}${_lhD("IE7hu5lwIGLDoGk=")}` : `${_lhD("Q8OidSB0aeG6v3Ag")}${icon(_lhD("YXJyb3dSaWdodA=="))}`}${_lhD("PC9idXR0b24+PC9kaXY+CiAgICAgICAgPC9kaXY+PC9kaXY+")}`;
$$(_lhD("Lm9wdA=="), view).forEach(b => b.onclick = () => { answers[q.id] = +b.dataset.k; $$(_lhD("Lm9wdA=="), view).forEach(x => x.classList.toggle(_lhD("cGlja2Vk"), x === b)); setTimeout(() => { if (i < items.length - 1) { i++; drawQ(); } }, 260); });
$(_lhD("I3ByZXY=")).onclick = () => { i--; drawQ(); };
$(_lhD("I25leHQ=")).onclick = () => { if (i < items.length - 1) { i++; drawQ(); } else finish(); };
};
let done = false;
const finish = async () => {
if (done) return; done = true; clearInterval(tick);
const unanswered = items.filter(q => answers[q.id] === undefined).length;
view.innerHTML = skeleton(2);
try {
const r = await api.post(_lhD("YXBpL3F1aXovc3VibWl0"), { topic, duration: Math.max(1, Math.round((Date.now() - t0) / 1000)), answers: items.map(q => ({ id: q.id, choice: answers[q.id] ?? null })) });
const a = r.attempt;
view.innerHTML = `${_lhD("PGRpdiBjbGFzcz0iZ3JpZCBnLW1haW4iPjxzZWN0aW9uIGNsYXNzPSJjYXJkIHBhZCBzdGFjayIgc3R5bGU9ImFsaWduLWl0ZW1zOmNlbnRlcjt0ZXh0LWFsaWduOmNlbnRlcjtnYXA6MTBweCI+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9InJpbmciIHN0eWxlPSItLXA6")}${a.score}${_lhD("Oy0tYzo=")}${a.score >= 80 ? _lhD("dmFyKC0tb2sp") : a.score >= 50 ? _lhD("dmFyKC0tYnJhbmQp") : _lhD("dmFyKC0td2Fybik=")}${_lhD("O3dpZHRoOjEyOHB4Oy0tdDoxMnB4Ij48ZGl2PjxiIHN0eWxlPSJmb250LXNpemU6MS44NXJlbSI+")}${a.score}${_lhD("PC9iPjxzcGFuPsSRaeG7g208L3NwYW4+PC9kaXY+PC9kaXY+CiAgICAgICAgICAgIDxoMyBzdHlsZT0iZm9udC1zaXplOjEuMXJlbSI+")}${a.score === 100 ? _lhD("WHXhuqV0IHPhuq9jISDEkGnhu4NtIHR1eeG7h3QgxJHhu5FpIQ==") : a.score >= 80 ? _lhD("UuG6pXQgdOG7kXQh") : a.score >= 50 ? _lhD("S2jDoSBs4bqvbSwgY+G7kSBn4bqvbmcgdGjDqm0gbmjDqSE=") : _lhD("SMOjeSDDtG4gbOG6oWkgdsOgIHRo4butIGzhuqduIG7hu69hIQ==")}${_lhD("PC9oMz4KICAgICAgICAgICAgPGRpdiBjbGFzcz0icm93IiBzdHlsZT0ianVzdGlmeS1jb250ZW50OmNlbnRlcjtnYXA6NnB4Ij4=")}${badge(`${a.correct}${_lhD("Lw==")}${a.total}${_lhD("IGPDonUgxJHDum5n")}`, _lhD("b2s="))}${badge(`${a.duration}${_lhD("IGdpw6J5")}`, _lhD("aW5mbw=="))}${r.rank ? badge(`${_lhD("SOG6oW5nIA==")}${r.rank}${_lhD("IHR14bqnbiBuw6B5")}`, _lhD("d2Fybg==")) : ''}${unanswered ? badge(`${unanswered}${_lhD("IGLhu48gdHLhu5FuZw==")}`, _lhD("YmFk")) : ''}${_lhD("PC9kaXY+CiAgICAgICAgICAgIA==")}${r.badges.length ? `${_lhD("PGRpdiBjbGFzcz0icm93IiBzdHlsZT0ianVzdGlmeS1jb250ZW50OmNlbnRlcjtnYXA6NnB4Ij4=")}${r.badges.map(b => `${_lhD("PHNwYW4gY2xhc3M9ImJhZGdlIHdhcm4iPg==")}${icon(_lhD("c3Rhcg=="))} ${esc(b.label)}${_lhD("PC9zcGFuPg==")}`).join('')}${_lhD("PC9kaXY+")}` : ''}${_lhD("CiAgICAgICAgICAgIDxkaXYgY2xhc3M9InJvdyIgc3R5bGU9Imp1c3RpZnktY29udGVudDpjZW50ZXI7Z2FwOjhweDtwYWRkaW5nLXRvcDoycHgiPjxidXR0b24gY2xhc3M9ImJ0biBzbSIgaWQ9ImFnYWluIj4=")}${icon(_lhD("cmVmcmVzaA=="))}${_lhD("IFRoaSBs4bqhaTwvYnV0dG9uPjxidXR0b24gY2xhc3M9ImJ0biBnaG9zdCBzbSIgaWQ9ImxvYmJ5Ij5C4bqjbmcgdsOgbmc8L2J1dHRvbj48L2Rpdj48L3NlY3Rpb24+CiAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzPSJjYXJkIj48ZGl2IGNsYXNzPSJjYXJkLWhlYWQiPjxoMj7EkMOhcCDDoW4gJiBnaeG6o2kgdGjDrWNoPC9oMj48L2Rpdj48ZGl2IGNsYXNzPSJjYXJkLWJvZHkgc3RhY2siIHN0eWxlPSJnYXA6MTBweCI+")}${r.results.map((x, k) => `${_lhD("PGRpdiBjbGFzcz0ic3RhY2siIHN0eWxlPSJnYXA6NHB4O3BhZGRpbmctYm90dG9tOjEwcHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tbGluZSkiPjxkaXYgY2xhc3M9InJvdyBub3dyYXAiIHN0eWxlPSJhbGlnbi1pdGVtczpmbGV4LXN0YXJ0O2dhcDo4cHgiPjxzcGFuIGNsYXNzPSJtZWRhbCIgc3R5bGU9IndpZHRoOjI0cHg7aGVpZ2h0OjI0cHg7Zm9udC1zaXplOjExcHg7YmFja2dyb3VuZDo=")}${x.correct ? _lhD("dmFyKC0tb2sp") : _lhD("dmFyKC0tYmFkKQ==")}${_lhD("Ij4=")}${icon(x.correct ? _lhD("Y2hlY2s=") : _lhD("eA=="))}${_lhD("PC9zcGFuPjxiIGNsYXNzPSJzbWFsbCI+")}${k + 1}${_lhD("LiA=")}${esc(x.question)}${_lhD("PC9iPjwvZGl2PjxwIGNsYXNzPSJ4cyIgc3R5bGU9InBhZGRpbmctbGVmdDozMnB4Ij4=")}${x.choice !== null ? `${_lhD("QuG6oW4gY2jhu41uOiA8YiBzdHlsZT0iY29sb3I6")}${x.correct ? _lhD("dmFyKC0tb2sp") : _lhD("dmFyKC0tYmFkKQ==")}${_lhD("Ij4=")}${_lhD("QUJDRA==")[x.choice]}${_lhD("LiA=")}${esc(x.options[x.choice])}${_lhD("PC9iPjxicj4=")}` : _lhD("PHNwYW4gY2xhc3M9Im11dGVkIj5C4bqhbiBjaMawYSB0cuG6oyBs4budaS4gPC9zcGFuPg==")}${!x.correct ? `${_lhD("xJDDoXAgw6FuIMSRw7puZzogPGIgc3R5bGU9ImNvbG9yOnZhcigtLW9rKSI+")}${_lhD("QUJDRA==")[x.answer]}${_lhD("LiA=")}${esc(x.options[x.answer])}${_lhD("PC9iPg==")}` : ''}${_lhD("PC9wPjxwIGNsYXNzPSJ4cyBtdXRlZCIgc3R5bGU9InBhZGRpbmctbGVmdDozMnB4Ij4=")}${esc(x.explanation)}${_lhD("PC9wPjwvZGl2Pg==")}`).join('')}${_lhD("PC9kaXY+PC9zZWN0aW9uPjwvZGl2Pg==")}`;
$(_lhD("I2FnYWlu")).onclick = play; $(_lhD("I2xvYmJ5")).onclick = async () => { board = await api.get(`${_lhD("YXBpL3F1aXovbGVhZGVyYm9hcmQ/cGVyaW9kPQ==")}${period}`); lobby(); };
} catch (e) { showError(e); lobby(); }
};
drawQ();
};
lobby();
},
async survey(view) {
const r = await api.get(_lhD("YXBpL3N1cnZleXM="));
const P = { khkt: [_lhD("TmdoacOqbiBj4bupdSBraG9hIGjhu41j"), _lhD("dmlvbGV0")], discipline: [_lhD("TuG7gSBu4bq/cCBr4bu3IGx14bqtdA=="), _lhD("d2Fybg==")], mental: [_lhD("U+G7qWMga2jhu49lIHRpbmggdGjhuqdu"), _lhD("c2t5")], other: [_lhD("S2jDoWM="), ''] };
view.innerHTML = head(_lhD("S2jhuqNvIHPDoXQgaOG7jWMgxJHGsOG7nW5n"), _lhD("w50ga2nhur9uIGPhu6dhIGLhuqFuIGzDoCBk4buvIGxp4buHdSBxdcO9IGNobyDEkeG7gSB0w6BpIG5naGnDqm4gY+G7qXUgdsOgIGPDoWMgZ2nhuqNpIHBow6FwIGFuIHRvw6BuIGjhu41jIMSRxrDhu51uZyBj4bunYSBuaMOgIHRyxrDhu51uZy4=")) + `${_lhD("CiAgICA8ZGl2IGNsYXNzPSJncmlkIGctYXV0byIgc3R5bGU9ImdyaWQtdGVtcGxhdGUtY29sdW1uczpyZXBlYXQoYXV0by1maWxsLG1pbm1heCgzMjBweCwxZnIpKSI+")}${r.items.map(s => `${_lhD("PGFydGljbGUgY2xhc3M9ImNhcmQgcGFkIHN0YWNrIiBzdHlsZT0iZ2FwOjEycHgiPgogICAgICA8ZGl2IGNsYXNzPSJyb3cgYmV0d2VlbiI+")}${badge(P[s.purpose]?.[0] || _lhD("S2jhuqNvIHPDoXQ="), P[s.purpose]?.[1] || '')}${s.done ? badge(_lhD("xJDDoyB0aGFtIGdpYQ=="), _lhD("b2s=")) : s.expired ? badge(_lhD("SOG6v3QgaOG6oW4="), _lhD("YmFk")) : badge(`${_lhD("SOG6oW4g")}${fmtDate(s.deadline)}`)}${_lhD("PC9kaXY+CiAgICAgIDxoMyBzdHlsZT0iZm9udC1zaXplOnZhcigtLWZzLW1kKSI+")}${esc(s.title)}${_lhD("PC9oMz48cCBjbGFzcz0ic21hbGwgbXV0ZWQgY2xhbXAtMyI+")}${esc(s.description)}${_lhD("PC9wPgogICAgICA8ZGl2IGNsYXNzPSJyb3cgc21hbGwgbXV0ZWQiIHN0eWxlPSJnYXA6MTRweCI+PHNwYW4+")}${icon(_lhD("Y2xpcGJvYXJk"))} ${s.questionCount}${_lhD("IGPDonU8L3NwYW4+PHNwYW4+")}${icon(_lhD("Y2xvY2s="))}${_lhD("IH4=")}${Math.max(2, Math.round(s.questionCount * .45))}${_lhD("IHBow7p0PC9zcGFuPg==")}${s.anonymous ? `${_lhD("PHNwYW4+")}${icon(_lhD("bG9jaw=="))}${_lhD("IOG6qG4gZGFuaDwvc3Bhbj4=")}` : ''}${_lhD("PC9kaXY+CiAgICAgIDxkaXY+PGRpdiBjbGFzcz0icm93IGJldHdlZW4geHMgbXV0ZWQiIHN0eWxlPSJtYXJnaW4tYm90dG9tOjZweCI+PHNwYW4+")}${s.responses}${_lhD("IHBoaeG6v3U8L3NwYW4+PHNwYW4+TeG7pWMgdGnDqnUg")}${s.targetCount}${_lhD("PC9zcGFuPjwvZGl2PjxkaXYgY2xhc3M9Im1ldGVyIj48aSBzdHlsZT0id2lkdGg6")}${Math.min(100, s.responses / s.targetCount * 100)}${_lhD("JSI+PC9pPjwvZGl2PjwvZGl2PgogICAgICA8YnV0dG9uIGNsYXNzPSJidG4g")}${s.done ? _lhD("Z2hvc3Q=") : ''}${_lhD("IiBkYXRhLXM9Ig==")}${s.id}${_lhD("IiA=")}${s.done || s.expired ? _lhD("ZGlzYWJsZWQ=") : ''}${_lhD("Pg==")}${s.done ? `${icon(_lhD("Y2hlY2tDaXJjbGU="))}${_lhD("IEPhuqNtIMahbiBi4bqhbiDEkcOjIHRoYW0gZ2lh")}` : `${icon(_lhD("ZWRpdA=="))}${_lhD("IFRoYW0gZ2lhIGto4bqjbyBzw6F0")}`}${_lhD("PC9idXR0b24+PC9hcnRpY2xlPg==")}`).join('') || empty(_lhD("Q2jGsGEgY8OzIMSR4bujdCBraOG6o28gc8OhdCBuw6Bv"), '', _lhD("Y2xpcGJvYXJk"))}${_lhD("PC9kaXY+")}`;
$$(_lhD("W2RhdGEtc10="), view).forEach(b => b.onclick = () => fillSurvey(b.dataset.s));
},
async scam(view) {
let kind = _lhD("bWVzc2FnZQ==");
const ai = await api.get(_lhD("YXBpL2FpL3N0YXR1cw==")).catch(() => ({ enabled: false }));
let prefill = null;
try { prefill = JSON.parse(sessionStorage.getItem(_lhD("bGhfc2NhbV9wcmVmaWxs")) || _lhD("bnVsbA==")); sessionStorage.removeItem(_lhD("bGhfc2NhbV9wcmVmaWxs")); } catch {  }
if (prefill?.kind) kind = prefill.kind;
const K = {
message: { label: _lhD("VGluIG5o4bqvbg=="), icon: _lhD("bWVzc2FnZQ=="), ph: _lhD("RMOhbiBu4buZaSBkdW5nIHRpbiBuaOG6r24gU01TLCBaYWxvLCBNZXNzZW5nZXIgxJHDoW5nIG5n4budIHbDoG8gxJHDonnigKY="), ex: [_lhD("Q2jDumMgbeG7q25nIGLhuqFuIMSRw6MgdHLDum5nIHRoxrDhu59uZyB4ZSBTSCBNb2RlIHRyb25nIGNoxrDGoW5nIHRyw6xuaCB0cmkgw6JuIGtow6FjaCBow6BuZyEgVnVpIGzDsm5nIGNodXnhu4NuIGtob+G6o24gMi4wMDAuMDAwxJEgcGjDrSBuaOG6rW4gcXXDoCB2w6AgY3VuZyBj4bqlcCBtw6MgT1RQIHRyb25nIHbDsm5nIDI0aC4="), _lhD("Q8ahIHF1YW4gY8O0bmcgYW4gdGjDtG5nIGLDoW86IGLhuqFuIGxpw6puIHF1YW4gxJHhur9uIGjhu5Mgc8ahIHbhu6Ugw6FuIHLhu61hIHRp4buBbiwgecOqdSBj4bqndSBjaHV54buDbiB0b8OgbiBi4buZIHPhu5EgZMawIHbDoG8gdMOgaSBraG/huqNuIHThuqFtIGdp4buvIMSR4buDIHjDoWMgbWluaCBn4bqlcC4="), _lhD("VHV54buDbiBDVFYgbMOgbSB2aeG7h2MgbmjhurkgbMawxqFuZyBjYW8sIGNo4buJIGPhuqduIGxpa2UgdmlkZW8gVGlrVG9rLCB0aHUgbmjhuq1wIDUwMGsvbmfDoHkuIE7huqFwIDIwMGsgbMOgbSBuaGnhu4dtIHbhu6Ugbmjhuq1uIGhvYSBo4buTbmcgMzAlLg==")] },
url: { label: _lhD("xJDGsOG7nW5nIGxpbms="), icon: _lhD("bGluaw=="), ph: _lhD("VsOtIGThu6U6IGh0dHA6Ly92aWV0Y29tYmFuay14YWN0aHVjLnRvcC9sb2dpbg=="), ex: [_lhD("aHR0cDovL3ZpZXRjb21iYW5rLXhhY3RodWMudG9wL2RhbmctbmhhcA=="), _lhD("aHR0cHM6Ly9uaGFucXVhLXNob3BlZS52aXAvdHJpLWFu"), _lhD("aHR0cHM6Ly93d3cudmlldGNvbWJhbmsuY29tLnZu")] },
phone: { label: _lhD("U+G7kSDEkWnhu4duIHRob+G6oWk="), icon: _lhD("cGhvbmU="), ph: _lhD("VsOtIGThu6U6IDA5ODcgNjU0IDMyMSBob+G6t2MgKzEgMjAyIDU1NSAwMTQ3"), ex: [_lhD("KzEgMjAyIDU1NSAwMTQ3"), _lhD("MDEyMCA1NTUgMDE0"), _lhD("MDkxMiAzNDUgNjc4")] },
account: { label: _lhD("U+G7kSB0w6BpIGtob+G6o24="), icon: _lhD("YmFuaw=="), ph: _lhD("Tmjhuq1wIHPhu5EgdMOgaSBraG/huqNuIG5nw6JuIGjDoG5nIC8gdsOtIMSRaeG7h24gdOG7rQ=="), ex: [_lhD("MDAwMTIzNDU2Nzg5"), _lhD("OTk5OTg4ODg3Nzc3"), _lhD("MTkwMyA1NTU1IDY2NjY=")] },
};
const draw = (result) => {
const k = K[kind];
view.innerHTML = head(_lhD("VHJhIGPhu6l1ICYgcXXDqXQgZOG6pXUgaGnhu4d1IGzhu6thIMSR4bqjbyBBSQ=="), _lhD("Q8O0bmcgY+G7pSA0LXRyb25nLTE6IGtp4buDbSB0cmEgdGluIG5o4bqvbiwgxJHGsOG7nW5nIGxpbmssIHPhu5EgxJFp4buHbiB0aG/huqFpIHbDoCBz4buRIHTDoGkga2hv4bqjbiB0csaw4bubYyBraGkgYuG6oW4gbMOgbSB0aGVvLg=="), aiPill(ai)) + `
${aiOfflineNote(ai)}${_lhD("CiAgICAgIDxkaXYgY2xhc3M9ImdyaWQgZy1tYWluIj4KICAgICAgICA8ZGl2IGNsYXNzPSJzdGFjayBsZyI+CiAgICAgICAgICA8c2VjdGlvbiBjbGFzcz0iY2FyZCI+PGRpdiBjbGFzcz0iY2FyZC1ib2R5IHN0YWNrIj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0ic2VnIHNlZy1ncmlkIj4=")}${Object.entries(K).map(([key, v]) => `${_lhD("PGJ1dHRvbiBkYXRhLWs9Ig==")}${key}${_lhD("IiBjbGFzcz0i")}${kind === key ? _lhD("YWN0aXZl") : ''}${_lhD("Ij4=")}${icon(v.icon)} ${v.label}${_lhD("PC9idXR0b24+")}`).join('')}${_lhD("PC9kaXY+CiAgICAgICAgICAgIDxmb3JtIGlkPSJzZiIgY2xhc3M9InN0YWNrIj4KICAgICAgICAgICAgICA=")}${kind === _lhD("bWVzc2FnZQ==") ? `${_lhD("PHRleHRhcmVhIGNsYXNzPSJ0ZXh0YXJlYSIgaWQ9InNpIiBwbGFjZWhvbGRlcj0i")}${k.ph}${_lhD("IiBzdHlsZT0ibWluLWhlaWdodDoxMzBweCIgYXJpYS1sYWJlbD0iTuG7mWkgZHVuZyBj4bqnbiBraeG7g20gdHJhIj48L3RleHRhcmVhPg==")}` : `${_lhD("PGRpdiBjbGFzcz0iaW5wdXQtaWNvbiI+")}${icon(k.icon)}${_lhD("PGlucHV0IGNsYXNzPSJpbnB1dCIgaWQ9InNpIiBwbGFjZWhvbGRlcj0i")}${k.ph}${_lhD("IiBhcmlhLWxhYmVsPSJO4buZaSBkdW5nIGPhuqduIGtp4buDbSB0cmEiIA==")}${kind === _lhD("cGhvbmU=") || kind === _lhD("YWNjb3VudA==") ? _lhD("aW5wdXRtb2RlPSJ0ZWwi") : ''}${_lhD("PjwvZGl2Pg==")}`}
${kind === _lhD("YWNjb3VudA==") ? _lhD("PGlucHV0IGNsYXNzPSJpbnB1dCIgaWQ9ImJhbmsiIHBsYWNlaG9sZGVyPSJUw6puIG5nw6JuIGjDoG5nIChraMO0bmcgYuG6r3QgYnXhu5ljKSIgYXJpYS1sYWJlbD0iVMOqbiBuZ8OibiBow6BuZyI+") : ''}${_lhD("CiAgICAgICAgICAgICAgPGRpdiBjbGFzcz0icm93IiBzdHlsZT0ianVzdGlmeS1jb250ZW50OmZsZXgtZW5kIj48YnV0dG9uIGNsYXNzPSJidG4gbGciIGlkPSJzY2FuR28iPg==")}${icon(_lhD("c3BhcmtsZXM="))}${_lhD("IFF1w6l0IGLhurFuZyBBSTwvYnV0dG9uPjwvZGl2PgogICAgICAgICAgICA8L2Zvcm0+CiAgICAgICAgICA8L2Rpdj48L3NlY3Rpb24+CiAgICAgICAgICA8ZGl2IGlkPSJyZXMiPg==")}${result ? resultHtml(result) : `${_lhD("PGRpdiBjbGFzcz0iY2FyZCBwYWQiPg==")}${empty(_lhD("S+G6v3QgcXXhuqMgcGjDom4gdMOtY2ggc+G6vSBoaeG7g24gdGjhu4sgdOG6oWkgxJHDonk="), _lhD("QUkgY2jhuqVtIMSRaeG7g20gcuG7p2kgcm8gMOKAkzEwMCB2w6AgZ2nhuqNpIHRow61jaCB04burbmcgZOG6pXUgaGnhu4d1IMSRw6FuZyBuZ+G7nS4="), _lhD("c2hpZWxkQ2hlY2s="))}${_lhD("PC9kaXY+")}`}${_lhD("PC9kaXY+CiAgICAgICAgPC9kaXY+CiAgICAgICAgPGFzaWRlIGNsYXNzPSJzdGFjayBsZyI+CiAgICAgICAgICA8c2VjdGlvbiBjbGFzcz0iY2FyZCBwYWQgc3RhY2siPjxiPg==")}${icon(_lhD("YWxlcnQ="))}${_lhD("IDUgZOG6pXUgaGnhu4d1IGzhu6thIMSR4bqjbyBraW5oIMSRaeG7g248L2I+PGRpdiBjbGFzcz0ic3RhY2siIHN0eWxlPSJnYXA6MTBweCI+")}${[[_lhD("SOG7kWkgdGjDumMga2jhuqluIGPhuqVw"), _lhD("4oCcVHJvbmcgMjRo4oCdLCDigJxu4bq/dSBraMO0bmcgc+G6vSBi4buLIGtow7Nh4oCd")], [_lhD("xJDDsmkgY2h1eeG7g24gdGnhu4FuIHRyxrDhu5tj"), _lhD("UGjDrSBuaOG6rW4gcXXDoCwgdGnhu4FuIGPhu41jLCBwaMOtIHjhu60gbMO9IGjhu5Mgc8ah")], [_lhD("WGluIG3DoyBPVFAsIG3huq10IGto4bqpdQ=="), _lhD("S2jDtG5nIGFpIGPDsyBxdXnhu4FuIHnDqnUgY+G6p3UgbcOjIGPhu6dhIGLhuqFu")], [_lhD("TeG6oW8gZGFuaCBjxqEgcXVhbg=="), _lhD("Q8O0bmcgYW4sIHTDsmEgw6FuLCBuaMOgIHRyxrDhu51uZywgbmfDom4gaMOgbmc=")], [_lhD("TOG7o2kgw61jaCBxdcOhIGjhuqVwIGThuqtu"), _lhD("VHLDum5nIHRoxrDhu59uZywgdmnhu4djIG5o4bq5IGzGsMahbmcgY2Fv")]].map(([t, d], i) => `${_lhD("PGRpdiBjbGFzcz0icm93IG5vd3JhcCIgc3R5bGU9ImFsaWduLWl0ZW1zOmZsZXgtc3RhcnQ7Z2FwOjEwcHgiPjxzcGFuIGNsYXNzPSJtZWRhbCBteCI+")}${i + 1}${_lhD("PC9zcGFuPjxkaXY+PGIgY2xhc3M9InNtYWxsIj4=")}${t}${_lhD("PC9iPjxkaXYgY2xhc3M9InhzIG11dGVkIj4=")}${d}${_lhD("PC9kaXY+PC9kaXY+PC9kaXY+")}`).join('')}${_lhD("PC9kaXY+PC9zZWN0aW9uPgogICAgICAgICAgPHNlY3Rpb24gY2xhc3M9ImNhcmQgcGFkIHN0YWNrIiBzdHlsZT0iYmFja2dyb3VuZDp2YXIoLS1icmFuZC1zb2Z0KTtib3JkZXItY29sb3I6dHJhbnNwYXJlbnQiPjxiPg==")}${icon(_lhD("c2hpZWxkQ2hlY2s="))}${_lhD("IMSQw6MgbOG7oSBjaHV54buDbiB0aeG7gW4/PC9iPjxwIGNsYXNzPSJzbWFsbCBpbmsyIj5H4buNaSBuZ2F5IHThu5VuZyDEkcOgaSBuZ8OibiBow6BuZyDEkeG7gyB5w6p1IGPhuqd1IHBob25nIHThu49hIGdpYW8gZOG7i2NoLCBiw6FvIEPDtG5nIGFuIG7GoWkgZ+G6p24gbmjhuqV0ICgxMTMpIHbDoCB0aMO0bmcgYsOhbyBjaG8gR1ZDTiwgY2hhIG3hurkuPC9wPjwvc2VjdGlvbj4KICAgICAgICA8L2FzaWRlPgogICAgICA8L2Rpdj4=")}`;
$$(_lhD("W2RhdGEta10="), view).forEach(b => b.onclick = () => { kind = b.dataset.k; draw(); });
$(_lhD("I3Nm")).onsubmit = async (e) => {
e.preventDefault(); const input = $(_lhD("I3Np")).value.trim();
if (!input) return toast(_lhD("SMOjeSBuaOG6rXAgbuG7mWkgZHVuZyBj4bqnbiBraeG7g20gdHJhLg=="), _lhD("d2Fybg=="));
await withBusy($(_lhD("I3NjYW5Hbw==")), async () => {
$(_lhD("I3Jlcw==")).innerHTML = `${_lhD("PGRpdiBjbGFzcz0iY2FyZCBwYWQgc3RhY2siIHN0eWxlPSJhbGlnbi1pdGVtczpjZW50ZXIiPjxkaXYgY2xhc3M9InR5cGluZyI+PGk+PC9pPjxpPjwvaT48aT48L2k+PC9kaXY+PHNwYW4gY2xhc3M9InNtYWxsIG11dGVkIj4=")}${ai.enabled && [_lhD("bWVzc2FnZQ=="), _lhD("dXJs")].includes(kind) ? `${_lhD("QUkgxJFhbmcgxJHhu41jIHbDoCBwaMOibiB0w61jaCA=")}${k.label.toLowerCase()}${_lhD("4oCmICh2w6BpIGdpw6J5KQ==")}` : `${_lhD("xJBhbmcgcGjDom4gdMOtY2gg")}${k.label.toLowerCase()}${_lhD("4oCm")}`}${_lhD("PC9zcGFuPjwvZGl2Pg==")}`;
await sleep(500);
try { const r = await api.post(_lhD("YXBpL2FpL3NjYW0tY2hlY2s="), { kind, input, bank: $(_lhD("I2Jhbms="))?.value || '' }); r.input = input; $(_lhD("I3Jlcw==")).innerHTML = resultHtml(r); bindResult(r); } catch (er) { showError(er); $(_lhD("I3Jlcw==")).innerHTML = ''; }
});
};
if (result) bindResult(result);
else if (prefill?.input && !draw.prefilled) {
draw.prefilled = true; $(_lhD("I3Np")).value = prefill.input; $(_lhD("I3Nm")).requestSubmit();
}
};
const COLORS = { safe: _lhD("dmFyKC0tb2sp"), warning: _lhD("dmFyKC0td2Fybik="), danger: _lhD("dmFyKC0tYmFkKQ==") };
const resultHtml = (r) => `${_lhD("PHNlY3Rpb24gY2xhc3M9InN0YWNrIj4KICAgICAgPGRpdiBjbGFzcz0idmVyZGljdCA=")}${r.level}${_lhD("Ij4=")}${gauge(r.score, COLORS[r.level])}${_lhD("PGRpdiBjbGFzcz0ic3RhY2siIHN0eWxlPSJnYXA6NnB4Ij48ZGl2IGNsYXNzPSJyb3ciIHN0eWxlPSJnYXA6OHB4Ij48c3BhbiBjbGFzcz0iZXllYnJvdyIgc3R5bGU9ImNvbG9yOnZhcigtLWMpIj5N4bupYyDEkeG7mSBy4bunaSBybzwvc3Bhbj4=")}${r.engine === _lhD("YWkrcnVsZXM=") ? `${_lhD("PHNwYW4gY2xhc3M9ImJhZGdlIHZpb2xldCI+")}${icon(_lhD("c3BhcmtsZXM="))}${_lhD("IEFJICsgYuG7mSBsdeG6rXQ8L3NwYW4+")}` : _lhD("PHNwYW4gY2xhc3M9ImJhZGdlIj5C4buZIGx14bqtdDwvc3Bhbj4=")}${_lhD("PC9kaXY+PGgzPg==")}${esc(r.label)}${r.ai?.scamType && r.ai.scamType !== _lhD("S2jDtG5nIHBow6F0IGhp4buHbg==") && r.level !== _lhD("c2FmZQ==") ? `${_lhD("IMK3IDxzcGFuIHN0eWxlPSJmb250LXdlaWdodDo2MDAiPg==")}${esc(r.ai.scamType)}${_lhD("PC9zcGFuPg==")}` : ''}${_lhD("PC9oMz4=")}${r.ai?.summary ? `${_lhD("PHAgY2xhc3M9InNtYWxsIiBzdHlsZT0iZm9udC13ZWlnaHQ6NjAwIj4=")}${esc(r.ai.summary)}${_lhD("PC9wPg==")}` : ''}${_lhD("PHAgY2xhc3M9InNtYWxsIGluazIiPg==")}${esc(r.advice)}${_lhD("PC9wPgogICAgICAgIA==")}${r.kind === _lhD("cGhvbmU=") ? `${_lhD("PGRpdiBjbGFzcz0icm93IHNtYWxsIiBzdHlsZT0iZ2FwOjEycHgiPg==")}${r.carrier ? `${_lhD("PHNwYW4+")}${icon(_lhD("c21hcnRwaG9uZQ=="))} ${esc(r.carrier)}${_lhD("PC9zcGFuPg==")}` : ''}${_lhD("PHNwYW4gY2xhc3M9Im1vbm8iPg==")}${esc(r.normalized)}${_lhD("PC9zcGFuPg==")}${r.reports ? `${_lhD("PHNwYW4+")}${icon(_lhD("ZmxhZw=="))} ${r.reports}${_lhD("IGLDoW8gY8Ohbzwvc3Bhbj4=")}` : ''}${_lhD("PC9kaXY+")}` : ''}${r.kind === _lhD("dXJs") && r.host ? `${_lhD("PHNwYW4gY2xhc3M9InNtYWxsIG1vbm8iPg==")}${icon(_lhD("Z2xvYmU="))} ${esc(r.host)}${_lhD("PC9zcGFuPg==")}` : ''}${r.kind === _lhD("YWNjb3VudA==") ? `${_lhD("PHNwYW4gY2xhc3M9InNtYWxsIG1vbm8iPg==")}${icon(_lhD("YmFuaw=="))} ${esc(r.normalized)}${r.bank ? _lhD("IMK3IA==") + esc(r.bank) : ''}${_lhD("PC9zcGFuPg==")}` : ''}${_lhD("PC9kaXY+PC9kaXY+CiAgICAgIA==")}${aiCard(r)}${_lhD("CiAgICAgIDxkaXYgY2xhc3M9ImNhcmQiPjxkaXYgY2xhc3M9ImNhcmQtaGVhZCI+PGgyPg==")}${icon(_lhD("bGlzdA=="))} ${r.ai ? _lhD("ROG6pXUgaGnhu4d1IHRoZW8gYuG7mSBsdeG6rXQ=") : _lhD("UGjDom4gdMOtY2ggY2hpIHRp4bq/dA==")}${_lhD("ICg=")}${r.findings.length}${_lhD("KTwvaDI+PHNwYW4gY2xhc3M9InhzIG11dGVkIj4=")}${fmtTime(r.checkedAt)}${_lhD("PC9zcGFuPjwvZGl2PjxkaXYgY2xhc3M9ImNhcmQtYm9keSI+")}${r.findings.map(f => `${_lhD("PGRpdiBjbGFzcz0iZmluZGluZyI+PHNwYW4gY2xhc3M9Im1lZGFsIiBzdHlsZT0iYmFja2dyb3VuZDo=")}${f.weight >= 30 ? _lhD("dmFyKC0tYmFkKQ==") : f.weight >= 12 ? _lhD("dmFyKC0td2Fybik=") : f.weight > 0 ? _lhD("dmFyKC0tYnJhbmQp") : _lhD("dmFyKC0tb2sp")}${_lhD("Ij4=")}${icon(f.weight > 0 ? _lhD("YWxlcnQ=") : _lhD("Y2hlY2s="))}${_lhD("PC9zcGFuPjxkaXY+PGIgY2xhc3M9InNtYWxsIj4=")}${esc(f.label)}${_lhD("PC9iPjxwIGNsYXNzPSJzbWFsbCBpbmsyIj4=")}${esc(f.detail)}${_lhD("PC9wPjwvZGl2PjxzcGFuIGNsYXNzPSJ3Ij4=")}${f.weight ? _lhD("Kw==") + f.weight : ''}${_lhD("PC9zcGFuPjwvZGl2Pg==")}`).join('')}${_lhD("PC9kaXY+CiAgICAgIA==")}${r.kind !== _lhD("bWVzc2FnZQ==") ? `${_lhD("PGRpdiBjbGFzcz0iY2FyZC1mb290Ij48c3BhbiBjbGFzcz0ic21hbGwgbXV0ZWQgZ3JvdyI+QuG6oW4gdOG7q25nIGLhu4sgxJHhu5FpIHTGsOG7o25nIG7DoHkgbOG7q2EgaG/hurdjIGzDoG0gcGhp4buBbj88L3NwYW4+PGJ1dHRvbiBjbGFzcz0iYnRuIGRhbmdlciBzb2Z0IHNtIiBpZD0icmVwIj4=")}${icon(_lhD("ZmxhZw=="))}${_lhD("IELDoW8gY8OhbyBs4burYSDEkeG6o288L2J1dHRvbj48L2Rpdj4=")}` : ''}${_lhD("PC9kaXY+PC9zZWN0aW9uPg==")}`;
const aiCard = (r) => r.ai ? `${_lhD("PGRpdiBjbGFzcz0iY2FyZCBhaS1jYXJkIj48ZGl2IGNsYXNzPSJjYXJkLWhlYWQiPjxoMj4=")}${icon(_lhD("c3BhcmtsZXM="))}${_lhD("IFBow6JuIHTDrWNoIGPhu6dhIEFJPC9oMj48c3BhbiBjbGFzcz0ieHMgbXV0ZWQiPg==")}${esc(r.ai.model || _lhD("QUk="))}${_lhD("PC9zcGFuPjwvZGl2PjxkaXYgY2xhc3M9ImNhcmQtYm9keSBzdGFjayI+CiAgICAgICAg")}${r.ai.redFlags.length ? `${_lhD("PGRpdj4=")}${r.ai.redFlags.map(f => `${_lhD("PGRpdiBjbGFzcz0iZmluZGluZyI+PHNwYW4gY2xhc3M9Im1lZGFsIiBzdHlsZT0iYmFja2dyb3VuZDp2YXIoLS12aW9sZXQpIj4=")}${icon(_lhD("YWxlcnQ="))}${_lhD("PC9zcGFuPjxkaXY+PGIgY2xhc3M9InNtYWxsIj4=")}${esc(f.label)}${_lhD("PC9iPg==")}${f.detail ? `${_lhD("PHAgY2xhc3M9InNtYWxsIGluazIiPg==")}${esc(f.detail)}${_lhD("PC9wPg==")}` : ''}${_lhD("PC9kaXY+PC9kaXY+")}`).join('')}${_lhD("PC9kaXY+")}` : ''}
${r.ai.advice.length ? `${_lhD("PGRpdiBjbGFzcz0ic3RhY2siIHN0eWxlPSJnYXA6NnB4Ij48YiBjbGFzcz0ic21hbGwiPg==")}${icon(_lhD("Y2hlY2tDaXJjbGU="))}${_lhD("IFZp4buHYyBuw6puIGzDoG0gbmdheTwvYj48b2wgY2xhc3M9ImFpLXN0ZXBzIj4=")}${r.ai.advice.map(a => `${_lhD("PGxpPg==")}${esc(a)}${_lhD("PC9saT4=")}`).join('')}${_lhD("PC9vbD48L2Rpdj4=")}` : ''}
${r.ai.reply ? `${_lhD("PGRpdiBjbGFzcz0ibGVhdmUtY2FyZCI+PGIgY2xhc3M9InNtYWxsIj4=")}${icon(_lhD("bWVzc2FnZQ=="))}${_lhD("IEfhu6NpIMO9IHBo4bqjbiBo4buTaSBhbiB0b8OgbjwvYj48ZGl2IGNsYXNzPSJzbWFsbCI+")}${esc(r.ai.reply)}${_lhD("PC9kaXY+PC9kaXY+")}` : ''}${_lhD("CiAgICAgICAgPGRpdiBjbGFzcz0ieHMgbXV0ZWQiPkFJIGPDsyB0aOG7gyBuaOG6p20gbOG6q24uIEx1w7RuIHjDoWMgbWluaCBxdWEga8OqbmggY2jDrW5oIHRo4bupYyB2w6AgaOG7j2kgw70ga2nhur9uIHRo4bqneSBjw7QsIGNoYSBt4bq5LjwvZGl2PgogICAgICA8L2Rpdj48L2Rpdj4=")}` : r.aiError ? `${_lhD("PGRpdiBjbGFzcz0iY2FyZCBwYWQgc21hbGwgbXV0ZWQgcm93IG5vd3JhcCIgc3R5bGU9ImdhcDo4cHgiPg==")}${icon(_lhD("aW5mbw=="))} ${esc(r.aiError)}${_lhD("PC9kaXY+")}` : '';
const bindResult = (r) => { const b = $(_lhD("I3JlcA==")); if (b) b.onclick = () => modal({ title: _lhD("QsOhbyBjw6FvIGzhu6thIMSR4bqjbw=="), sub: _lhD("R2nDunAgY+G7mW5nIMSR4buTbmcgaOG7jWMgc2luaCBj4bqjbmggZ2nDoWMgaMahbg=="), body: `${_lhD("PGRpdiBjbGFzcz0iZmllbGQiPjxsYWJlbD7EkOG7kWkgdMaw4bujbmc8L2xhYmVsPjxpbnB1dCBjbGFzcz0iaW5wdXQgbW9ubyIgdmFsdWU9Ig==")}${esc(r.normalized || r.host || r.input)}${_lhD("IiBkaXNhYmxlZD48L2Rpdj48ZGl2IGNsYXNzPSJmaWVsZCI+PGxhYmVsIGZvcj0icm4iPk3DtCB04bqjIHRo4bunIMSRb+G6oW48L2xhYmVsPjx0ZXh0YXJlYSBpZD0icm4iIHBsYWNlaG9sZGVyPSJWw60gZOG7pTogR+G7jWkgxJFp4buHbiBt4bqhbyBkYW5oIGdpw6FvIHZpw6puLCBiw6FvIGNvbiBi4buLIHRhaSBu4bqhbuKApiI+PC90ZXh0YXJlYT48L2Rpdj4=")}`, foot: _lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIGdob3N0IiBkYXRhLWNsb3NlPkjhu6d5PC9idXR0b24+PGJ1dHRvbiBjbGFzcz0iYnRuIGRhbmdlciIgaWQ9InJzZW5kIj5H4butaSBiw6FvIGPDoW88L2J1dHRvbj4="), onMount: (m, close) => $(_lhD("I3JzZW5k"), m).onclick = async () => { try { const x = await api.post(_lhD("YXBpL2FpL3NjYW0tcmVwb3J0"), { kind: r.kind, value: r.input, note: $(_lhD("I3Ju"), m).value }); toast(x.message, _lhD("b2s=")); close(); } catch (e) { showError(e); } } }); };
draw();
},
async ai(view) {
const [hist, ai] = await Promise.all([api.get(_lhD("YXBpL2FpL2NvbnZlcnNhdGlvbnMvbWluZQ==")), api.get(_lhD("YXBpL2FpL3N0YXR1cw==")).catch(() => ({ enabled: false }))]);
let convId = hist.conversation?.id || null;
const msgs = hist.conversation?.messages || [];
const defaultChips = [_lhD("Q8O0bmcgdGjhu6ljIMSR4bqhbyBow6Bt"), _lhD("Q8O0bmcgdGjhu6ljIGzGsOG7o25nIGdpw6Fj"), _lhD("S+G6vyBob+G6oWNoIMO0biB0aGk="), _lhD("ROG6pXUgaGnhu4d1IGzhu6thIMSR4bqjbw=="), _lhD("R2nhuqNtIGPEg25nIHRo4bqzbmc=")];
let chips = [...defaultChips];
view.innerHTML = head(_lhD("VHLhu6MgbMO9IGjhu41jIMSRxrDhu51uZyBBSSAyNC83"), _lhD("SOG7j2kgYsOgaSwgeGluIG3hurlvIMO0biB0aGksIGjhu49pIGPDoWNoIG5o4bqtbiBkaeG7h24gbOG7q2EgxJHhuqNvIGhv4bq3YyB0w6JtIHPhu7Ega2hpIGPEg25nIHRo4bqzbmcuIEFJIEd1YXJkIGdpw6FtIHPDoXQgxJHhu4MgZ2nhu68gYW4gdG/DoG4gY2hvIGLhuqFuLg==")) + `
${aiOfflineNote(ai)}${_lhD("CiAgICA8c2VjdGlvbiBjbGFzcz0iY2FyZCBjaGF0IGFpLWNoYXQtY2FyZCI+CiAgICAgIDxkaXYgY2xhc3M9ImNoYXQtaGVhZCI+CiAgICAgICAgPHNwYW4gY2xhc3M9ImF2YXRhciBzcSBhaS1ib3QtYXYiPg==")}${icon(_lhD("Ym90"))}${_lhD("PC9zcGFuPgogICAgICAgIDxkaXYgY2xhc3M9Imdyb3ciIHN0eWxlPSJtaW4td2lkdGg6MCI+CiAgICAgICAgICA8Yj5UcuG7oyBsw70gSOG7jWMgxJHGsOG7nW5nIEFJPC9iPgogICAgICAgICAgPGRpdiBjbGFzcz0ieHMgbXV0ZWQgdHJ1bmNhdGUiPjxzcGFuIHN0eWxlPSJjb2xvcjp2YXIoLS1vaykiPuKXjzwvc3Bhbj4g")}${ai.enabled ? `${_lhD("QUkgdGjhuq10IMK3IA==")}${esc(ai.label || ai.model || '')}` : _lhD("Q2jhur8gxJHhu5kgY8ahIGLhuqNu")}${_lhD("IMK3IEFJIEd1YXJkIGLhuqNvIHbhu4c8L2Rpdj4KICAgICAgICA8L2Rpdj4KICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gZ2hvc3Qgc20iIGlkPSJuZXdDb252IiB0aXRsZT0iTMOgbSBt4bubaSBjdeG7mWMgdHLDsiBjaHV54buHbiI+")}${icon(_lhD("cmVmcmVzaA=="))}${_lhD("IDxzcGFuPkzDoG0gbeG7m2k8L3NwYW4+PC9idXR0b24+CiAgICAgIDwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJjaGF0LWJvZHkiIGlkPSJjYiI+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImFpLWNoaXBzIiBpZD0iYWlDaGlwcyI+PC9kaXY+CiAgICAgIDxmb3JtIGNsYXNzPSJjaGF0LWlucHV0IiBpZD0iY2YiPjx0ZXh0YXJlYSBpZD0iY3QiIHJvd3M9IjEiIG1heGxlbmd0aD0iMTUwMCIgcGxhY2Vob2xkZXI9Ik5o4bqtcCBjw6J1IGjhu49pIGhv4bq3YyBkw6FuIHRpbiBuaOG6r27igKYiIGFyaWEtbGFiZWw9IkPDonUgaOG7j2kgY2hvIHRy4bujIGzDvSBBSSI+PC90ZXh0YXJlYT48YnV0dG9uIGNsYXNzPSJidG4gaWNvbiIgYXJpYS1sYWJlbD0iR+G7rWkiPg==")}${icon(_lhD("c2VuZA=="))}${_lhD("PC9idXR0b24+PC9mb3JtPgogICAgPC9zZWN0aW9uPg==")}`;
const cb = $(_lhD("I2Ni")), chipBox = $(_lhD("I2FpQ2hpcHM="));
const bubble = (m) => m.role === _lhD("dXNlcg==") ? `${_lhD("PGRpdiBjbGFzcz0ibXNnIG1lIj48ZGl2PjxkaXYgY2xhc3M9ImJ1YmJsZSI+")}${esc(m.text)}${_lhD("PC9kaXY+")}${m.at ? `${_lhD("PGRpdiBjbGFzcz0idGltZSI+")}${fmtTime(m.at)}${_lhD("PC9kaXY+")}` : ''}${_lhD("PC9kaXY+PC9kaXY+")}`
: `${_lhD("PGRpdiBjbGFzcz0ibXNnIj48c3BhbiBjbGFzcz0iYXZhdGFyIHNtIHNxIGFpLW1zZy1hdiI+")}${icon(_lhD("Ym90"))}${_lhD("PC9zcGFuPjxkaXYgc3R5bGU9Im1pbi13aWR0aDowIj48ZGl2IGNsYXNzPSJidWJibGUgbWQiIHN0eWxlPSJ3aGl0ZS1zcGFjZTpub3JtYWwiPg==")}${md(m.text)}${m.guard?.showHotline ? `${_lhD("PGRpdiBjbGFzcz0ibGVhdmUtY2FyZCIgc3R5bGU9Im1hcmdpbi10b3A6OHB4O2JhY2tncm91bmQ6dmFyKC0tYmFkLXNvZnQpO2JvcmRlci1jb2xvcjpjb2xvci1taXgoaW4gc3JnYix2YXIoLS1iYWQpIDMwJSx0cmFuc3BhcmVudCkiPjxiIHN0eWxlPSJjb2xvcjp2YXIoLS1iYWQpIj4=")}${icon(_lhD("c2lyZW4="))}${_lhD("IMSQxrDhu51uZyBkw6J5IGjhu5cgdHLhu6M8L2I+PGRpdiBjbGFzcz0ic21hbGwiPjExMSDCtyBC4bqjbyB24buHIHRy4bq7IGVtICgyNC83KSAmbmJzcDvCtyZuYnNwOyAxMTUgwrcgQ+G6pXAgY+G7qXUgJm5ic3A7wrcmbmJzcDsgMTEzIMK3IEPDtG5nIGFuPC9kaXY+PC9kaXY+")}` : ''}${_lhD("PC9kaXY+")}${m.scan ? scanCard(m.scan) : ''}${m.actions?.length ? `${_lhD("PGRpdiBjbGFzcz0icm93IiBzdHlsZT0iZ2FwOjZweDttYXJnaW4tdG9wOjVweCI+")}${m.actions.map((a) => `${_lhD("PGEgY2xhc3M9ImJ0biBzb2Z0IHNtIiBocmVmPSIj")}${a.page}${_lhD("IiA=")}${a.page === _lhD("c2NhbQ==") && m.scan ? `${_lhD("ZGF0YS1zY2FuPSI=")}${esc(JSON.stringify({ kind: m.scan.kind, input: m.scan.input }))}${_lhD("Ig==")}` : ''}${_lhD("Pg==")}${esc(a.label)} ${icon(_lhD("YXJyb3dSaWdodA=="))}${_lhD("PC9hPg==")}`).join('')}${_lhD("PC9kaXY+")}` : ''}${m.at || m.engine === _lhD("bGxt") ? `${_lhD("PGRpdiBjbGFzcz0idGltZSI+")}${m.engine === _lhD("bGxt") ? `${_lhD("PHNwYW4gY2xhc3M9ImFpLXNyYyI+")}${icon(_lhD("c3BhcmtsZXM="))}${_lhD("IEFJPC9zcGFuPiA=")}` : ''}${m.at ? fmtTime(m.at) : ''}${_lhD("PC9kaXY+")}` : ''}${_lhD("PC9kaXY+PC9kaXY+")}`;
const SC = { safe: [_lhD("b2s="), _lhD("QW4gdG/DoG4=")], warning: [_lhD("d2Fybg=="), _lhD("Q+G6o25oIGLDoW8=")], danger: [_lhD("YmFk"), _lhD("Tmd1eSBoaeG7g20=")] };
const scanCard = (sc) => `${_lhD("PGRpdiBjbGFzcz0ic2Nhbi1taW5pIA==")}${sc.level}${_lhD("Ij4=")}${icon(_lhD("c2hpZWxkQWxlcnQ="))}${_lhD("PGRpdiBjbGFzcz0iZ3JvdyI+PGIgY2xhc3M9InNtYWxsIj5RdcOpdCBs4burYSDEkeG6o286IA==")}${esc(sc.label || SC[sc.level]?.[1] || '')}${_lhD("PC9iPjxkaXYgY2xhc3M9InhzIG11dGVkIj7EkGnhu4NtIHLhu6dpIHJvIHRoZW8gYuG7mSBsdeG6rXQg")}${sc.score}${_lhD("LzEwMDwvZGl2PjwvZGl2Pg==")}${badge(SC[sc.level]?.[1] || '', SC[sc.level]?.[0] || '')}${_lhD("PC9kaXY+")}`;
const intro = { role: _lhD("YXNzaXN0YW50"), text: `${_lhD("Q2jDoG8gKio=")}${esc(firstName(S.user.name))}${_lhD("KiohIPCfkYsgTcOsbmggbMOgICoqVHLhu6MgbMO9IEjhu41jIMSRxrDhu51uZyBBSSoqLgotICoqSOG7jWMgdOG6rXAqKjogxJHhuqFvIGjDoG0sIG5ndXnDqm4gaMOgbSwgbMaw4bujbmcgZ2nDoWMsIG5naOG7iyBsdeG6rW4geMOjIGjhu5lpLCB0aeG6v25nIEFuaCwgUHl0aG9u4oCmCi0gKipBbiB0b8OgbiAmIHTDom0gbMO9Kio6IHF1w6l0IHRpbiBuaOG6r24gbOG7q2EgxJHhuqNvLCDhu6luZyBwaMOzIGLhuq90IG7huqF0LCBnaeG6o20gw6FwIGzhu7FjIHRoaSBj4but")}` };
const draw = () => {
cb.innerHTML = [intro, ...msgs].map(bubble).join(''); cb.scrollTop = cb.scrollHeight;
$$(_lhD("W2RhdGEtc2Nhbl0="), cb).forEach(a => a.onclick = () => { try { sessionStorage.setItem(_lhD("bGhfc2NhbV9wcmVmaWxs"), a.dataset.scan); } catch {  } });
chipBox.innerHTML = chips.map(c => `${_lhD("PGJ1dHRvbiB0eXBlPSJidXR0b24iIGRhdGEtY2hpcD0i")}${esc(c)}${_lhD("Ij4=")}${esc(c)}${_lhD("PC9idXR0b24+")}`).join('');
$$(_lhD("W2RhdGEtY2hpcF0="), chipBox).forEach(b => b.onclick = () => ask(b.dataset.chip));
};
const ask = async (text) => {
msgs.push({ role: _lhD("dXNlcg=="), text, at: new Date().toISOString() }); draw();
cb.insertAdjacentHTML(_lhD("YmVmb3JlZW5k"), `${_lhD("PGRpdiBjbGFzcz0ibXNnIiBpZD0idHlwaW5nIj48c3BhbiBjbGFzcz0iYXZhdGFyIHNtIHNxIGFpLW1zZy1hdiI+")}${icon(_lhD("Ym90"))}${_lhD("PC9zcGFuPjxkaXYgY2xhc3M9ImJ1YmJsZSB0eXBpbmciPjxpPjwvaT48aT48L2k+PGk+PC9pPjwvZGl2PjwvZGl2Pg==")}`); cb.scrollTop = cb.scrollHeight;
try {
const r = await api.post(_lhD("YXBpL2FpL2NoYXQ="), { message: text, conversationId: convId });
await sleep(300);
convId = r.conversationId;
if (r.suggestions?.length) chips = r.suggestions;
msgs.push({ role: _lhD("YXNzaXN0YW50"), text: r.reply, actions: r.actions, guard: r.guard, engine: r.engine, scan: r.scan, at: new Date().toISOString() });
if (r.aiError) toast(r.aiError, _lhD("d2Fybg=="));
draw();
} catch (e) { $(_lhD("I3R5cGluZw=="))?.remove(); showError(e); }
};
draw();
autoGrow($(_lhD("I2N0")), () => $(_lhD("I2Nm")).requestSubmit());
$(_lhD("I2Nm")).onsubmit = (e) => { e.preventDefault(); const t = $(_lhD("I2N0")).value.trim(); if (!t) return; $(_lhD("I2N0")).value = ''; $(_lhD("I2N0")).style.height = _lhD("YXV0bw=="); ask(t); };
$(_lhD("I25ld0NvbnY=")).onclick = () => { convId = null; msgs.length = 0; chips = [...defaultChips]; draw(); };
},
async profile(view) {
const [p, rec] = await Promise.all([api.get(_lhD("YXBpL3Byb2ZpbGU=")), api.get(_lhD("YXBpL215LXJlY29yZHM="))]);
const u = p.user;
let tab = _lhD("aW5mbw==");
const draw = () => {
const face = store.get(_lhD("bGhfZmFjZQ=="));
let body = '';
if (tab === _lhD("aW5mbw==")) body = `${_lhD("PGRpdiBjbGFzcz0iY2FyZCI+PGRpdiBjbGFzcz0iY2FyZC1ib2R5IHN0YWNrIiBzdHlsZT0iZ2FwOjE0cHgiPjxkaXYgY2xhc3M9InJvdyBub3dyYXAiIHN0eWxlPSJnYXA6MTRweDtwYWRkaW5nLWJvdHRvbToxNHB4O2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWxpbmUpIj48YnV0dG9uIHR5cGU9ImJ1dHRvbiIgaWQ9InByb2ZBdkJ0biIgY2xhc3M9Im0tdXNlci1hdiBsZyIgdGl0bGU9Ik5o4bqlcCDEkeG7gyBoaeG7h24gbcOheSDhuqNuaCDEkeG7lWkg4bqjbmggxJHhuqFpIGRp4buHbiI+")}${avatar(u, _lhD("bGc="))}${_lhD("PHNwYW4gY2xhc3M9Im0tdXNlci1jYW0iPg==")}${icon(_lhD("Y2FtZXJh"))}${_lhD("PC9zcGFuPjwvYnV0dG9uPjxkaXYgY2xhc3M9Imdyb3ciIHN0eWxlPSJtaW4td2lkdGg6MCI+PGIgc3R5bGU9ImZvbnQtc2l6ZToxLjFyZW07ZGlzcGxheTpibG9jayIgY2xhc3M9InRydW5jYXRlIj4=")}${esc(u.name)}${_lhD("PC9iPjxzcGFuIGNsYXNzPSJzbWFsbCBtdXRlZCI+TOG7m3Ag")}${esc(u.className || u.classId || '')}${_lhD("IMK3IE1TSFM6IDxzcGFuIGNsYXNzPSJtb25vIj4=")}${esc(u.id)}${_lhD("PC9zcGFuPjwvc3Bhbj48ZGl2IGNsYXNzPSJ4cyBtdXRlZCIgc3R5bGU9Im1hcmdpbi10b3A6NHB4Ij5OaOG6pXAgdsOgbyDhuqNuaCDEkeG6oWkgZGnhu4duIMSR4buDIMSR4buVaSDhuqNuaDwvZGl2PjwvZGl2PjwvZGl2PjxkbCBzdHlsZT0iZGlzcGxheTpncmlkO2dyaWQtdGVtcGxhdGUtY29sdW1uczoxMzJweCBtaW5tYXgoMCwxZnIpO2dhcDoxMHB4IDEycHg7bWFyZ2luOjA7YWxpZ24taXRlbXM6YmFzZWxpbmUiPg==")}${[[_lhD("SOG7jSB2w6AgdMOqbg=="), u.name], [_lhD("TcOjIGjhu41jIHNpbmg="), `${_lhD("PHNwYW4gY2xhc3M9Im1vbm8iPg==")}${esc(u.id)}${_lhD("PC9zcGFuPg==")}`], [_lhD("TOG7m3A="), esc(u.className || u.classId || '')], [_lhD("TmnDqm4ga2jDs2E="), u.courseYear || _lhD("MjAyNCDigJMgMjAyNw==")], [_lhD("TmfDoHkgc2luaA=="), u.dob ? fmtDate(u.dob) : _lhD("4oCU")], [_lhD("R2nhu5tpIHTDrW5o"), u.gender || _lhD("4oCU")], [_lhD("UXXDqiBxdcOhbg=="), u.hometown || _lhD("4oCU")], [_lhD("R1YgY2jhu6cgbmhp4buHbQ=="), u.homeroomName || p.homeroom?.name || _lhD("4oCU")], [_lhD("RW1haWw="), u.email || _lhD("4oCU")], [_lhD("xJBp4buHbiB0aG/huqFp"), u.phone || _lhD("PHNwYW4gY2xhc3M9Im11dGVkIj5DaMawYSBj4bqtcCBuaOG6rXQ8L3NwYW4+")], [_lhD("xJBp4buDbSByw6huIGx1eeG7h24="), `${_lhD("PGI+")}${u.conduct ?? _lhD("4oCU")}${_lhD("PC9iPi8xMDA=")}`]].map(([k, v]) => `${_lhD("PGR0IGNsYXNzPSJzbWFsbCBtdXRlZCIgc3R5bGU9InBhZGRpbmc6M3B4IDAiPg==")}${k}${_lhD("PC9kdD48ZGQgc3R5bGU9Im1hcmdpbjowO3BhZGRpbmc6M3B4IDA7Zm9udC13ZWlnaHQ6NTAwIiBjbGFzcz0ic21hbGwiPg==")}${typeof v === _lhD("c3RyaW5n") && !v.startsWith(_lhD("PA==")) ? esc(v) : v ?? _lhD("4oCU")}${_lhD("PC9kZD4=")}`).join('')}${_lhD("PC9kbD48L2Rpdj48ZGl2IGNsYXNzPSJjYXJkLWZvb3QiPjxidXR0b24gY2xhc3M9ImJ0biIgaWQ9ImVkaXRJbmZvIj4=")}${icon(_lhD("ZWRpdA=="))}${_lhD("IENo4buJbmggc+G7rWEgdGjDtG5nIHRpbjwvYnV0dG9uPjwvZGl2PjwvZGl2Pg==")}`;
if (tab === _lhD("c2VjdXJpdHk=")) body = `${_lhD("PGRpdiBjbGFzcz0iZ3JpZCBnMiI+PGZvcm0gY2xhc3M9ImNhcmQiIGlkPSJwdyI+PGRpdiBjbGFzcz0iY2FyZC1oZWFkIj48aDI+")}${icon(_lhD("a2V5"))}${_lhD("IMSQ4buVaSBt4bqtdCBraOG6qXU8L2gyPjwvZGl2PjxkaXYgY2xhc3M9ImNhcmQtYm9keSBzdGFjayI+PGRpdiBjbGFzcz0iZmllbGQiPjxsYWJlbCBmb3I9ImNwIj5N4bqtdCBraOG6qXUgaGnhu4duIHThuqFpPC9sYWJlbD48aW5wdXQgaWQ9ImNwIiBuYW1lPSJjdXJyZW50UGFzc3dvcmQiIHR5cGU9InBhc3N3b3JkIiBhdXRvY29tcGxldGU9ImN1cnJlbnQtcGFzc3dvcmQiIHJlcXVpcmVkPjwvZGl2PjxkaXYgY2xhc3M9ImZpZWxkIj48bGFiZWwgZm9yPSJucCI+TeG6rXQga2jhuql1IG3hu5tpPC9sYWJlbD48aW5wdXQgaWQ9Im5wIiBuYW1lPSJuZXdQYXNzd29yZCIgdHlwZT0icGFzc3dvcmQiIGF1dG9jb21wbGV0ZT0ibmV3LXBhc3N3b3JkIiBtaW5sZW5ndGg9IjYiIHJlcXVpcmVkPjxzcGFuIGNsYXNzPSJoaW50Ij7DjXQgbmjhuqV0IDYga8O9IHThu7EsIG7Dqm4ga+G6v3QgaOG7o3AgY2jhu68sIHPhu5EgdsOgIGvDvSB04buxIMSR4bq3YyBiaeG7h3QuPC9zcGFuPjwvZGl2PjxkaXYgY2xhc3M9ImZpZWxkIj48bGFiZWwgZm9yPSJucDIiPk5o4bqtcCBs4bqhaSBt4bqtdCBraOG6qXUgbeG7m2k8L2xhYmVsPjxpbnB1dCBpZD0ibnAyIiB0eXBlPSJwYXNzd29yZCIgYXV0b2NvbXBsZXRlPSJuZXctcGFzc3dvcmQiIHJlcXVpcmVkPjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9ImNhcmQtZm9vdCI+PGJ1dHRvbiBjbGFzcz0iYnRuIiBpZD0icHdiIj4=")}${icon(_lhD("Y2hlY2s="))}${_lhD("IEzGsHUgbeG6rXQga2jhuql1PC9idXR0b24+PC9kaXY+PC9mb3JtPgogICAgICAgIDxkaXYgY2xhc3M9InN0YWNrIGxnIj48ZGl2IGNsYXNzPSJjYXJkIHBhZCBzdGFjayI+PGI+")}${icon(_lhD("bG9nb3V0"))}${_lhD("IFBoacOqbiDEkcSDbmcgbmjhuq1wPC9iPjxwIGNsYXNzPSJzbWFsbCBpbmsyIj7EkMSDbmcgeHXhuqV0IGto4buPaSB04bqldCBj4bqjIMSRaeG7h24gdGhv4bqhaSwgbcOheSB0w61uaCDEkWFuZyDEkcSDbmcgbmjhuq1wIHTDoGkga2hv4bqjbiBj4bunYSBi4bqhbi48L3A+PGJ1dHRvbiBjbGFzcz0iYnRuIGdob3N0IiBpZD0ibG9nb3V0QWxsIiBzdHlsZT0iYWxpZ24tc2VsZjpmbGV4LXN0YXJ0Ij7EkMSDbmcgeHXhuqV0IG3hu41pIHRoaeG6v3QgYuG7izwvYnV0dG9uPjwvZGl2PjwvZGl2PjwvZGl2Pg==")}`;
if (tab === _lhD("cmVjb3Jkcw==")) body = `${_lhD("PGRpdiBjbGFzcz0iY2FyZCI+PGRpdiBjbGFzcz0iY2FyZC1oZWFkIj48aDI+")}${icon(_lhD("Z2F2ZWw="))}${_lhD("IFPhu5UgdGhlbyBkw7VpIG7hu4EgbuG6v3A8L2gyPjxzcGFuIGNsYXNzPSJzbWFsbCBtdXRlZCI+")}${rec.items.length}${_lhD("IGJpw6puIGLhuqNuPC9zcGFuPjwvZGl2PjxkaXYgY2xhc3M9ImNhcmQtYm9keSBzdGFjayI+")}${rec.items.map(x => `${_lhD("PGRpdiBjbGFzcz0iY2FyZCBzb2Z0IHJvdyBub3dyYXAiIHN0eWxlPSJwYWRkaW5nOjEycHggMTRweDtnYXA6MTJweDthbGlnbi1pdGVtczpmbGV4LXN0YXJ0Ij4=")}${x.photo ? `${_lhD("PGltZyBzcmM9Ig==")}${esc(x.photo)}${_lhD("IiBhbHQ9IiIgc3R5bGU9IndpZHRoOjY0cHg7aGVpZ2h0OjY0cHg7Ym9yZGVyLXJhZGl1czoxMHB4O29iamVjdC1maXQ6Y292ZXI7ZmxleDpub25lO2JhY2tncm91bmQ6I2ZmZiI+")}` : ''}${_lhD("PGRpdiBjbGFzcz0iZ3JvdyI+PGRpdiBjbGFzcz0icm93IiBzdHlsZT0iZ2FwOjhweCI+PGIgY2xhc3M9Im1vbm8gc21hbGwiPg==")}${x.id}${_lhD("PC9iPg==")}${badge(x.penalty, _lhD("d2Fybg=="))}${x.points ? badge(`${_lhD("4oiS")}${x.points}${_lhD("IMSRaeG7g20=")}`, _lhD("YmFk")) : ''}${_lhD("PC9kaXY+PHAgY2xhc3M9InNtYWxsIiBzdHlsZT0ibWFyZ2luLXRvcDo0cHgiPg==")}${esc(x.description)}${_lhD("PC9wPjxkaXYgY2xhc3M9InhzIG11dGVkIj4=")}${fmtDateTime(x.at)}${_lhD("IMK3IA==")}${esc(x.location)}${_lhD("IMK3IEzhuq1wIGLhu59pIA==")}${esc(x.createdByName)}${_lhD("PC9kaXY+PC9kaXY+PC9kaXY+")}`).join('') || empty(_lhD("S2jDtG5nIGPDsyB2aSBwaOG6oW0gbsOgbw=="), _lhD("VHV54buHdCB24budaSEgSMOjeSB0aeG6v3AgdOG7pWMgZ2nhu68gduG7r25nIG7hu4EgbuG6v3AgbmjDqS4="), _lhD("Y2hlY2tDaXJjbGU="))}${_lhD("PC9kaXY+PC9kaXY+")}`;
if (tab === _lhD("ZmVlZGJhY2s=")) body = `${_lhD("PGZvcm0gY2xhc3M9ImNhcmQiIGlkPSJmYmYiPjxkaXYgY2xhc3M9ImNhcmQtaGVhZCI+PGRpdj48aDI+")}${icon(_lhD("c3Rhcg=="))}${_lhD("IMSQw6FuaCBnacOhIOG7qW5nIGThu6VuZzwvaDI+PGRpdiBjbGFzcz0ic3ViIj5Hw7NwIMO9IGPhu6dhIGLhuqFuIGdpw7pwIG5ow6AgdHLGsOG7nW5nIGhvw6BuIHRoaeG7h24gQ+G7lW5nIEjhu41jIMSQxrDhu51uZyBT4buRPC9kaXY+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz0iY2FyZC1ib2R5IHN0YWNrIj48ZGl2IGNsYXNzPSJyb3ciIGlkPSJzdGFycyIgcm9sZT0icmFkaW9ncm91cCIgYXJpYS1sYWJlbD0iU+G7kSBzYW8iPg==")}${[1, 2, 3, 4, 5].map(n => `${_lhD("PGJ1dHRvbiB0eXBlPSJidXR0b24iIGNsYXNzPSJidG4gaWNvbiBnaG9zdCIgZGF0YS1zdGFyPSI=")}${n}${_lhD("IiBhcmlhLWxhYmVsPSI=")}${n}${_lhD("IHNhbyIgc3R5bGU9ImZvbnQtc2l6ZToxLjRyZW07d2lkdGg6NDhweDtoZWlnaHQ6NDhweDtjb2xvcjp2YXIoLS13YXJuKSI+")}${icon(_lhD("c3Rhcg=="))}${_lhD("PC9idXR0b24+")}`).join('')}${_lhD("PC9kaXY+PGRpdiBjbGFzcz0iZmllbGQiPjxsYWJlbCBmb3I9ImZiYyI+R8OzcCDDvTwvbGFiZWw+PHRleHRhcmVhIGlkPSJmYmMiIG1heGxlbmd0aD0iMTAwMCIgcGxhY2Vob2xkZXI9IkLhuqFuIHRow61jaCDEkWnhu4F1IGfDrD8gQ+G6p24gY+G6o2kgdGhp4buHbiDEkWnhu4F1IGfDrD8iPjwvdGV4dGFyZWE+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz0iY2FyZC1mb290Ij48YnV0dG9uIGNsYXNzPSJidG4iIGlkPSJmYmIiPg==")}${icon(_lhD("c2VuZA=="))}${_lhD("IEfhu61pIGfDs3Agw708L2J1dHRvbj48L2Rpdj48L2Zvcm0+")}`;
view.innerHTML = head(_lhD("SOG7kyBzxqEgY8OhIG5ow6Ju"), _lhD("VGjDtG5nIHRpbiBo4buNYyBzaW5oLCBi4bqjbyBt4bqtdCB0w6BpIGtob+G6o24gdsOgIG7hu4EgbuG6v3Au"), `${_lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIGdob3N0IiBpZD0idGgyIj4=")}${icon(_lhD("bW9vbg=="))}${_lhD("IFPDoW5nIC8gdOG7kWk8L2J1dHRvbj48YnV0dG9uIGNsYXNzPSJidG4gZGFuZ2VyIHNvZnQiIGlkPSJsbzIiPg==")}${icon(_lhD("bG9nb3V0"))}${_lhD("IMSQxINuZyB4deG6pXQ8L2J1dHRvbj4=")}`) + `${_lhD("CiAgICAgIDxkaXYgY2xhc3M9InN0YWNrIiBpZD0icGciPgogICAgICAgIDxkaXYgY2xhc3M9InRhYnMiPg==")}${[[_lhD("aW5mbw=="), _lhD("dXNlcg=="), _lhD("VGjDtG5nIHRpbg==")], [_lhD("c2VjdXJpdHk="), _lhD("bG9jaw=="), _lhD("QuG6o28gbeG6rXQ=")], [_lhD("cmVjb3Jkcw=="), _lhD("Z2F2ZWw="), _lhD("TuG7gSBu4bq/cA==")], [_lhD("ZmVlZGJhY2s="), _lhD("c3Rhcg=="), _lhD("R8OzcCDDvQ==")]].map(([k, i, l]) => `${_lhD("PGJ1dHRvbiBjbGFzcz0idGFiIA==")}${tab === k ? _lhD("YWN0aXZl") : ''}${_lhD("IiBkYXRhLXRhYjI9Ig==")}${k}${_lhD("Ij4=")}${icon(i)} ${l}${_lhD("PC9idXR0b24+")}`).join('')}${_lhD("PC9kaXY+CiAgICAgICAg")}${body}${_lhD("CiAgICAgIDwvZGl2Pg==")}`;
$$(_lhD("W2RhdGEtdGFiMl0="), view).forEach(b => b.onclick = () => { tab = b.dataset.tab2; draw(); });
$(_lhD("I3RoMg==")).onclick = toggleTheme; $(_lhD("I2xvMg==")).onclick = logout;
$$(_lhD("W2RhdGEtY29weV0="), view).forEach(b => b.onclick = () => copyText(b.dataset.copy));
if (tab === _lhD("aW5mbw==")) {
const launchAv = () => openMyAvatarEditor((nu) => { Object.assign(u, nu); draw(); });
bindAvatarCam($(_lhD("I3Byb2ZBdkJ0bg==")), launchAv);
$(_lhD("I2VkaXRJbmZv")).onclick = () => modal({
title: _lhD("Q2jhu4luaCBz4butYSB0aMO0bmcgdGluIGPDoSBuaMOibg=="),
sub: `${_lhD("TcOjIGjhu41jIHNpbmg6IA==")}${esc(u.id)}`,
size: _lhD("d2lkZQ=="),
body: `${_lhD("PGZvcm0gaWQ9ImVmIiBjbGFzcz0iZmllbGQtcm93IiBzdHlsZT0iZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOnJlcGVhdChhdXRvLWZpdCxtaW5tYXgoMjIwcHgsMWZyKSkiPgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJyb3cgbm93cmFwIiBzdHlsZT0iZ3JpZC1jb2x1bW46MS8tMTtnYXA6MTRweDtwYWRkaW5nOjEwcHggMTJweDtib3JkZXItcmFkaXVzOjE0cHg7YmFja2dyb3VuZDp2YXIoLS1zdXJmYWNlLTIpIj48c3BhbiBpZD0iZWZBdlB2Ij4=")}${avatar(u, _lhD("bGc="))}${_lhD("PC9zcGFuPjxkaXYgY2xhc3M9Imdyb3ciPjxiIGNsYXNzPSJzbWFsbCIgc3R5bGU9ImRpc3BsYXk6YmxvY2siPuG6om5oIMSR4bqhaSBkaeG7h248L2I+PHNwYW4gY2xhc3M9InhzIG11dGVkIj5IaeG7g24gdGjhu4sgdHLDqm4gYuG6o25nIHbDoG5nLCBrw6puaCBjaGF0IHbDoCBo4buTIHPGoSBo4buNYyBzaW5oPC9zcGFuPjwvZGl2PjxidXR0b24gdHlwZT0iYnV0dG9uIiBjbGFzcz0iYnRuIHNvZnQgc20iIGlkPSJlZkF2QnRuIj4=")}${icon(_lhD("Y2FtZXJh"))}${_lhD("IMSQ4buVaSAvIGPEg24gY2jhu4luaCDhuqNuaDwvYnV0dG9uPjwvZGl2PgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJmaWVsZCIgc3R5bGU9ImdyaWQtY29sdW1uOjEvLTEiPjxsYWJlbCBmb3I9ImVuYW1lIj5I4buNIHbDoCB0w6puPC9sYWJlbD48aW5wdXQgaWQ9ImVuYW1lIiBuYW1lPSJuYW1lIiB2YWx1ZT0i")}${esc(u.name || '')}${_lhD("IiByZXF1aXJlZD48L2Rpdj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0iZmllbGQiPjxsYWJlbCBmb3I9ImVjbGFzcyI+TOG7m3A8L2xhYmVsPjxpbnB1dCBpZD0iZWNsYXNzIiBuYW1lPSJjbGFzc0lkIiB2YWx1ZT0i")}${esc(u.className || u.classId || '')}${_lhD("IiBsaXN0PSJjbHNMaXN0IiByZXF1aXJlZD48ZGF0YWxpc3QgaWQ9ImNsc0xpc3QiPg==")}${(p.classes || []).map(c => `${_lhD("PG9wdGlvbiB2YWx1ZT0i")}${esc(c)}${_lhD("Ij48L29wdGlvbj4=")}`).join('')}${_lhD("PC9kYXRhbGlzdD48L2Rpdj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0iZmllbGQiPjxsYWJlbCBmb3I9ImVjb3Vyc2UiPk5pw6puIGtow7NhPC9sYWJlbD48aW5wdXQgaWQ9ImVjb3Vyc2UiIG5hbWU9ImNvdXJzZVllYXIiIHZhbHVlPSI=")}${esc(u.courseYear || _lhD("MjAyNCDigJMgMjAyNw=="))}${_lhD("IiBwbGFjZWhvbGRlcj0iMjAyNCDigJMgMjAyNyI+PC9kaXY+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9ImZpZWxkIj48bGFiZWwgZm9yPSJlZG9iIj5OZ8OgeSBzaW5oPC9sYWJlbD48aW5wdXQgaWQ9ImVkb2IiIG5hbWU9ImRvYiIgdHlwZT0iZGF0ZSIgdmFsdWU9Ig==")}${esc((u.dob || '').slice(0, 10))}${_lhD("Ij48L2Rpdj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0iZmllbGQiPjxsYWJlbCBmb3I9ImVnZW5kZXIiPkdp4bubaSB0w61uaDwvbGFiZWw+PHNlbGVjdCBpZD0iZWdlbmRlciIgbmFtZT0iZ2VuZGVyIj4=")}${[_lhD("TmFt"), _lhD("TuG7rw=="), _lhD("S2jDoWM=")].map(g => `${_lhD("PG9wdGlvbiB2YWx1ZT0i")}${g}${_lhD("IiA=")}${u.gender === g ? _lhD("c2VsZWN0ZWQ=") : ''}${_lhD("Pg==")}${g}${_lhD("PC9vcHRpb24+")}`).join('')}${_lhD("PC9zZWxlY3Q+PC9kaXY+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9ImZpZWxkIj48bGFiZWwgZm9yPSJlaG9tZSI+UXXDqiBxdcOhbjwvbGFiZWw+PGlucHV0IGlkPSJlaG9tZSIgbmFtZT0iaG9tZXRvd24iIHZhbHVlPSI=")}${esc(u.hometown || '')}${_lhD("IiBwbGFjZWhvbGRlcj0ixJDhu6ljIEPGoSwgR2lhIExhaSI+PC9kaXY+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9ImZpZWxkIj48bGFiZWwgZm9yPSJlZ3ZjbiI+R2nDoW8gdmnDqm4gY2jhu6cgbmhp4buHbTwvbGFiZWw+PGlucHV0IGlkPSJlZ3ZjbiIgbmFtZT0iaG9tZXJvb21OYW1lIiB2YWx1ZT0i")}${esc(u.homeroomName || p.homeroom?.name || '')}${_lhD("IiBsaXN0PSJndkxpc3QiIHBsYWNlaG9sZGVyPSJDaOG7jW4gaG/hurdjIG5o4bqtcCB0w6puIEdWQ04iPjxkYXRhbGlzdCBpZD0iZ3ZMaXN0Ij4=")}${(p.teachers || []).map(t => `${_lhD("PG9wdGlvbiB2YWx1ZT0i")}${esc(t)}${_lhD("Ij48L29wdGlvbj4=")}`).join('')}${_lhD("PC9kYXRhbGlzdD48L2Rpdj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0iZmllbGQiPjxsYWJlbCBmb3I9ImVwaG9uZSI+U+G7kSDEkWnhu4duIHRob+G6oWk8L2xhYmVsPjxpbnB1dCBpZD0iZXBob25lIiBuYW1lPSJwaG9uZSIgdmFsdWU9Ig==")}${esc(u.phone || '')}${_lhD("IiBpbnB1dG1vZGU9InRlbCIgcGxhY2Vob2xkZXI9IjA5ODcgNjU0IDMyMSI+PC9kaXY+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9ImZpZWxkIj48bGFiZWwgZm9yPSJlZW1haWwiPkVtYWlsPC9sYWJlbD48aW5wdXQgaWQ9ImVlbWFpbCIgbmFtZT0iZW1haWwiIHR5cGU9ImVtYWlsIiB2YWx1ZT0i")}${esc(u.email || '')}${_lhD("Ij48L2Rpdj4KICAgICAgICAgIDwvZm9ybT4=")}`,
foot: _lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIGdob3N0IiBkYXRhLWNsb3NlPkjhu6d5PC9idXR0b24+PGJ1dHRvbiBjbGFzcz0iYnRuIiBpZD0iZXNhdmUiPkzGsHUgdGhheSDEkeG7lWk8L2J1dHRvbj4="),
onMount: (m, close) => {
if ($(_lhD("I2VmQXZCdG4="), m)) $(_lhD("I2VmQXZCdG4="), m).onclick = () => openMyAvatarEditor((nu) => { Object.assign(u, nu); if ($(_lhD("I2VmQXZQdg=="), m)) $(_lhD("I2VmQXZQdg=="), m).innerHTML = avatar(u, _lhD("bGc=")); draw(); });
const submit = () => withBusy($(_lhD("I2VzYXZl"), m), async () => {
try {
const r = await api.put(_lhD("YXBpL3Byb2ZpbGU="), formData($(_lhD("I2Vm"), m)));
Object.assign(u, r.user);
if (r.homeroom) p.homeroom = r.homeroom;
S.user = r.user;
close();
toast(_lhD("xJDDoyBsxrB1IHRow7RuZyB0aW4gY8OhIG5ow6JuLg=="), _lhD("b2s="));
shell();
draw();
} catch (e) { showError(e); }
});
$(_lhD("I2VzYXZl"), m).onclick = submit;
$(_lhD("I2Vm"), m).onsubmit = (e) => { e.preventDefault(); submit(); };
},
});
}
if (tab === _lhD("c2VjdXJpdHk=")) {
$(_lhD("I3B3")).onsubmit = (e) => { e.preventDefault(); const f = formData(e.target); if (f.newPassword !== $(_lhD("I25wMg==")).value) return toast(_lhD("TeG6rXQga2jhuql1IG5o4bqtcCBs4bqhaSBraMO0bmcga2jhu5twLg=="), _lhD("d2Fybg==")); withBusy($(_lhD("I3B3Yg==")), async () => { try { const r = await api.post(_lhD("YXBpL2F1dGgvY2hhbmdlLXBhc3N3b3Jk"), f); session.set(r.token, true); toast(r.message, _lhD("b2s=")); e.target.reset(); } catch (er) { showError(er); } }); };
$(_lhD("I2xvZ291dEFsbA==")).onclick = async () => { if (!await confirmDialog({ title: _lhD("xJDEg25nIHh14bqldCBt4buNaSB0aGnhur90IGLhu4s="), message: _lhD("VOG6pXQgY+G6oyBwaGnDqm4gxJHEg25nIG5o4bqtcCAoa+G7gyBj4bqjIHRoaeG6v3QgYuG7iyBuw6B5KSBz4bq9IGLhu4sgdsO0IGhp4buHdS4="), ok: _lhD("xJDEg25nIHh14bqldA=="), tone: _lhD("ZGFuZ2Vy") })) return; await api.post(_lhD("YXBpL2F1dGgvbG9nb3V0LWFsbA==")); session.clear(); location.href = _lhD("Li8="); };
}
if (tab === _lhD("ZmVlZGJhY2s=")) {
let rating = 5; const paint = () => $$(_lhD("W2RhdGEtc3Rhcl0="), view).forEach(b => { b.style.opacity = +b.dataset.star <= rating ? 1 : .3; b.querySelector(_lhD("c3Zn")).style.fill = +b.dataset.star <= rating ? _lhD("Y3VycmVudENvbG9y") : _lhD("bm9uZQ=="); });
paint(); $$(_lhD("W2RhdGEtc3Rhcl0="), view).forEach(b => b.onclick = () => { rating = +b.dataset.star; paint(); });
$(_lhD("I2ZiZg==")).onsubmit = (e) => { e.preventDefault(); withBusy($(_lhD("I2ZiYg==")), async () => { try { const r = await api.post(_lhD("YXBpL2ZlZWRiYWNr"), { rating, comment: $(_lhD("I2ZiYw==")).value }); toast(r.message, _lhD("b2s=")); $(_lhD("I2ZiYw==")).value = ''; } catch (er) { showError(er); } }); };
}
};
draw();
},
async 'app-guide'(view) {
return renderAppGuide(view, { api, head });
},
async about(view) {
return renderAboutPage(view, { head, settings: S.settings });
},
};
async function openNews(id) {
const { item, related } = await api.get(`${_lhD("YXBpL25ld3Mv")}${id}`);
modal({ title: item.title, sub: `${esc(item.author)}${_lhD("IMK3IA==")}${fmtDate(item.publishedAt)}${_lhD("IMK3IA==")}${num(item.views)}${_lhD("IGzGsOG7o3QgeGVt")}`, size: _lhD("d2lkZQ=="),
body: `${cover(item)}${_lhD("PGRpdiBjbGFzcz0iYXJ0aWNsZSI+")}${esc(item.content)}${_lhD("PC9kaXY+")}${related.length ? `${_lhD("PGRpdiBjbGFzcz0iaHIiPjwvZGl2PjxiPkLDoGkgbGnDqm4gcXVhbjwvYj48ZGl2IGNsYXNzPSJsaXN0Ij4=")}${related.map(r => `${_lhD("PGRpdiBjbGFzcz0iaXRlbSBjbGljayIgZGF0YS1yZWw9Ig==")}${r.id}${_lhD("Ij48c3BhbiBjbGFzcz0iYmFkZ2UgaW5mbyI+")}${esc(r.badge)}${_lhD("PC9zcGFuPjxzcGFuIGNsYXNzPSJncm93IHNtYWxsIHN0cm9uZyB0cnVuY2F0ZSI+")}${esc(r.title)}${_lhD("PC9zcGFuPg==")}${icon(_lhD("Y2hldnJvblJpZ2h0"))}${_lhD("PC9kaXY+")}`).join('')}${_lhD("PC9kaXY+")}` : ''}`,
foot: `${_lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIGdob3N0IiBpZD0ic2hhcmUiPg==")}${icon(_lhD("ZXh0ZXJuYWw="))}${_lhD("IENoaWEgc+G6uzwvYnV0dG9uPjxidXR0b24gY2xhc3M9ImJ0biIgZGF0YS1jbG9zZT7EkMOzbmc8L2J1dHRvbj4=")}`,
onMount: (m, close) => {
$(_lhD("I3NoYXJl"), m).onclick = async () => { const text = `${item.title}\n\n${item.summary}${_lhD("CuKAlCA=")}${S.settings.schoolName}`; try { if (navigator.share) await navigator.share({ title: item.title, text }); else copyText(text); } catch { copyText(text); } };
$$(_lhD("W2RhdGEtcmVsXQ=="), m).forEach(r => r.onclick = () => { close(); openNews(r.dataset.rel); });
} });
}
function openReport(r, TONE) {
modal({ title: `${_lhD("SOG7kyBzxqEg")}${r.id}`, sub: `${esc(r.typeName)}${_lhD("IMK3IGfhu61pIA==")}${fmtDateTime(r.createdAt)}`, size: _lhD("d2lkZQ=="),
body: `${_lhD("PGRpdiBjbGFzcz0icm93IiBzdHlsZT0iZ2FwOjhweCI+")}${badge(r.statusName, TONE[r.status])}${r.anonymous ? badge(_lhD("4bqobiBkYW5o"), _lhD("dmlvbGV0")) : ''}${badge(_lhD("TeG7qWMg") + ({ low: _lhD("dGjhuqVw"), medium: _lhD("dHJ1bmcgYsOsbmg="), high: _lhD("Y2Fv"), critical: _lhD("bmdoacOqbSB0cuG7jW5n") }[r.severity]), r.severity === _lhD("bG93") ? '' : r.severity === _lhD("bWVkaXVt") ? _lhD("d2Fybg==") : _lhD("YmFk"))}${_lhD("PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImdyaWQgZzIiPjxkaXYgY2xhc3M9InN0YWNrIiBzdHlsZT0iZ2FwOjZweCI+PHNwYW4gY2xhc3M9ImV5ZWJyb3ciPsSQ4buLYSDEkWnhu4NtPC9zcGFuPjxzcGFuPg==")}${esc(r.location)}${_lhD("PC9zcGFuPjwvZGl2PjxkaXYgY2xhc3M9InN0YWNrIiBzdHlsZT0iZ2FwOjZweCI+PHNwYW4gY2xhc3M9ImV5ZWJyb3ciPlRo4budaSBnaWFuIHjhuqN5IHJhPC9zcGFuPjxzcGFuPg==")}${fmtDateTime(r.occurredAt)}${_lhD("PC9zcGFuPjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJzdGFjayIgc3R5bGU9ImdhcDo2cHgiPjxzcGFuIGNsYXNzPSJleWVicm93Ij5Nw7QgdOG6ozwvc3Bhbj48cCBjbGFzcz0iaW5rMiI+")}${esc(r.description)}${_lhD("PC9wPjwvZGl2PgogICAgICA=")}${r.photos?.length ? `${_lhD("PGRpdiBjbGFzcz0idGh1bWJzIj4=")}${r.photos.map(p => `${_lhD("PGEgaHJlZj0i")}${esc(p)}${_lhD("IiB0YXJnZXQ9Il9ibGFuayIgcmVsPSJub29wZW5lciIgY2xhc3M9InRodW1iIiBzdHlsZT0id2lkdGg6MTIwcHg7aGVpZ2h0OjkwcHgiPjxpbWcgc3JjPSI=")}${esc(p)}${_lhD("IiBhbHQ9IuG6om5oIG1pbmggY2jhu6luZyI+PC9hPg==")}`).join('')}${_lhD("PC9kaXY+")}` : ''}
${r.feedback ? `${_lhD("PGRpdiBjbGFzcz0iY2FyZCBzb2Z0IiBzdHlsZT0icGFkZGluZzoxNHB4IDE2cHg7Ym9yZGVyLWNvbG9yOnZhcigtLW9rKSI+PGIgc3R5bGU9ImNvbG9yOnZhcigtLW9rKSI+")}${icon(_lhD("Y2hlY2tDaXJjbGU="))}${_lhD("IFBo4bqjbiBo4buTaSBj4bunYSBuaMOgIHRyxrDhu51uZzwvYj48cCBjbGFzcz0ic21hbGwgaW5rMiIgc3R5bGU9Im1hcmdpbi10b3A6NHB4Ij4=")}${esc(r.feedback)}${_lhD("PC9wPjwvZGl2Pg==")}` : ''}${_lhD("CiAgICAgIDxkaXYgY2xhc3M9InN0YWNrIj48c3BhbiBjbGFzcz0iZXllYnJvdyI+VGnhur9uIHRyw6xuaCB44butIGzDvTwvc3Bhbj48ZGl2IGNsYXNzPSJ0aW1lbGluZSI+")}${r.timeline.map(t => `${_lhD("PGRpdiBjbGFzcz0idGwgZG9uZSI+PGI+")}${esc(({ pending: _lhD("Q2jhu50gdGnhur9wIG5o4bqtbg=="), verifying: _lhD("xJBhbmcgeMOhYyBtaW5o"), reminded: _lhD("xJDDoyBuaOG6r2Mgbmjhu58="), disciplined: _lhD("xJDDoyBr4bu3IGx14bqtdA=="), recorded: _lhD("xJDDoyBs4bqtcCBiacOqbiBi4bqjbg=="), resolved: _lhD("xJDDoyB44butIGzDvQ=="), archived: _lhD("TMawdSBo4buTIHPGoQ==") })[t.status] || t.status)}${_lhD("PC9iPjxwPg==")}${esc(t.note)}${_lhD("PC9wPjx0aW1lPg==")}${fmtDateTime(t.at)}${_lhD("IMK3IA==")}${esc(t.by)}${_lhD("PC90aW1lPjwvZGl2Pg==")}`).join('')}${_lhD("PC9kaXY+PC9kaXY+")}`,
foot: _lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIiBkYXRhLWNsb3NlPsSQw7NuZzwvYnV0dG9uPg==") });
}
async function fillSurvey(id) {
const { item: s } = await api.get(`${_lhD("YXBpL3N1cnZleXMv")}${id}`);
const answers = {};
modal({ title: s.title, sub: `${s.questions.length}${_lhD("IGPDonUgaOG7j2k=")}${s.anonymous ? _lhD("IMK3IFBoaeG6v3Ug4bqpbiBkYW5o") : ''}`, size: _lhD("d2lkZQ=="),
body: `${_lhD("PGRpdiBjbGFzcz0ibWV0ZXIiPjxpIGlkPSJzcCIgc3R5bGU9IndpZHRoOjAlIj48L2k+PC9kaXY+PGZvcm0gaWQ9InN2ZiIgY2xhc3M9InN0YWNrIGxnIj4=")}${s.questions.map((q, i) => `${_lhD("PGZpZWxkc2V0IGNsYXNzPSJzdGFjayIgc3R5bGU9ImJvcmRlcjowO3BhZGRpbmc6MDttYXJnaW46MDtnYXA6MTBweCI+PGxlZ2VuZCBjbGFzcz0ic3Ryb25nIiBzdHlsZT0ibWFyZ2luLWJvdHRvbTo4cHgiPg==")}${i + 1}${_lhD("LiA=")}${esc(q.text)} ${q.required ? _lhD("PHNwYW4gc3R5bGU9ImNvbG9yOnZhcigtLWJhZCkiPio8L3NwYW4+") : ''}${_lhD("PC9sZWdlbmQ+CiAgICAgIA==")}${q.type === _lhD("c2luZ2xl") ? `${_lhD("PGRpdiBjbGFzcz0iY2hpcHMiPg==")}${q.options.map(o => `${_lhD("PGxhYmVsIGNsYXNzPSJjaGlwIj48aW5wdXQgdHlwZT0icmFkaW8iIG5hbWU9Ig==")}${q.id}${_lhD("IiB2YWx1ZT0i")}${esc(o)}${_lhD("Ij4=")}${esc(o)}${_lhD("PC9sYWJlbD4=")}`).join('')}${_lhD("PC9kaXY+")}` : ''}
${q.type === _lhD("bXVsdGk=") ? `${_lhD("PGRpdiBjbGFzcz0iY2hpcHMiPg==")}${q.options.map(o => `${_lhD("PGxhYmVsIGNsYXNzPSJjaGlwIj48aW5wdXQgdHlwZT0iY2hlY2tib3giIG5hbWU9Ig==")}${q.id}${_lhD("IiB2YWx1ZT0i")}${esc(o)}${_lhD("Ij4=")}${esc(o)}${_lhD("PC9sYWJlbD4=")}`).join('')}${_lhD("PC9kaXY+PHNwYW4gY2xhc3M9ImhpbnQgeHMgbXV0ZWQiPkPDsyB0aOG7gyBjaOG7jW4gbmhp4buBdSDEkcOhcCDDoW48L3NwYW4+")}` : ''}
${q.type === _lhD("c2NhbGU=") ? `${_lhD("PGRpdiBjbGFzcz0icm93IG5vd3JhcCIgc3R5bGU9ImdhcDo4cHgiPg==")}${q.options.map(o => `${_lhD("PGxhYmVsIGNsYXNzPSJjaGlwIiBzdHlsZT0iZmxleDoxO2p1c3RpZnktY29udGVudDpjZW50ZXI7Zm9udC1zaXplOjFyZW07Zm9udC13ZWlnaHQ6NzAwIj48aW5wdXQgdHlwZT0icmFkaW8iIG5hbWU9Ig==")}${q.id}${_lhD("IiB2YWx1ZT0i")}${o}${_lhD("Ij4=")}${o}${_lhD("PC9sYWJlbD4=")}`).join('')}${_lhD("PC9kaXY+PGRpdiBjbGFzcz0icm93IGJldHdlZW4geHMgbXV0ZWQiPjxzcGFuPlRo4bqlcDwvc3Bhbj48c3Bhbj5DYW88L3NwYW4+PC9kaXY+")}` : ''}
${q.type === _lhD("dGV4dA==") ? `${_lhD("PHRleHRhcmVhIG5hbWU9Ig==")}${q.id}${_lhD("IiBtYXhsZW5ndGg9IjEwMDAiIHBsYWNlaG9sZGVyPSJDw6J1IHRy4bqjIGzhu51pIGPhu6dhIGLhuqFu4oCmIiBjbGFzcz0idGV4dGFyZWEiPjwvdGV4dGFyZWE+")}` : ''}${_lhD("PC9maWVsZHNldD4=")}`).join('')}${_lhD("PC9mb3JtPg==")}`,
foot: `${_lhD("PHNwYW4gY2xhc3M9InNtYWxsIG11dGVkIGdyb3ciPg==")}${icon(_lhD("bG9jaw=="))} ${s.anonymous ? _lhD("S2jDtG5nIGzGsHUgZGFuaCB0w61uaCBuZ8aw4budaSB0cuG6oyBs4budaQ==") : _lhD("UGhp4bq/dSBjw7MgZ2hpIHTDqm4=")}${_lhD("PC9zcGFuPjxidXR0b24gY2xhc3M9ImJ0biBnaG9zdCIgZGF0YS1jbG9zZT7EkOG7gyBzYXU8L2J1dHRvbj48YnV0dG9uIGNsYXNzPSJidG4iIGlkPSJzdnMiPg==")}${icon(_lhD("c2VuZA=="))}${_lhD("IEfhu61pIHBoaeG6v3U8L2J1dHRvbj4=")}`,
onMount: (m, close) => {
const form = $(_lhD("I3N2Zg=="), m);
const update = () => { const f = formData(form); s.questions.forEach(q => { const v = f[q.id]; answers[q.id] = q.type === _lhD("bXVsdGk=") ? (Array.isArray(v) ? v : v ? [v] : []) : v || ''; }); const done = s.questions.filter(q => answers[q.id] && (!Array.isArray(answers[q.id]) || answers[q.id].length)).length; $(_lhD("I3Nw"), m).style.width = `${done / s.questions.length * 100}${_lhD("JQ==")}`; };
form.addEventListener(_lhD("Y2hhbmdl"), update); form.addEventListener(_lhD("aW5wdXQ="), update);
$(_lhD("I3N2cw=="), m).onclick = (e) => withBusy(e.currentTarget, async () => { update(); try { const r = await api.post(`${_lhD("YXBpL3N1cnZleXMv")}${s.id}${_lhD("L3Jlc3BvbnNlcw==")}`, { answers }); close(); modal({ title: _lhD("xJDDoyBn4butaSBwaGnhur91IGto4bqjbyBzw6F0"), body: `${_lhD("PGRpdiBjbGFzcz0iZW1wdHkiPjxkaXYgY2xhc3M9ImFydCIgc3R5bGU9ImJhY2tncm91bmQ6dmFyKC0tb2stc29mdCk7Y29sb3I6dmFyKC0tb2spIj4=")}${icon(_lhD("Y2hlY2tDaXJjbGU="))}${_lhD("PC9kaXY+PGg0Pg==")}${esc(r.message)}${_lhD("PC9oND48L2Rpdj4=")}`, foot: _lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIiBkYXRhLWNsb3NlPkhvw6BuIHThuqV0PC9idXR0b24+"), onClose: render }); } catch (er) { showError(er); } });
} });
}
function getPosition() {
return new Promise((resolve) => {
if (!navigator.geolocation) return resolve(null);
navigator.geolocation.getCurrentPosition((p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }), () => resolve(null), { enableHighAccuracy: true, timeout: 9000, maximumAge: 30000 });
});
}
function autoGrow(ta, onEnter) {
ta.addEventListener(_lhD("aW5wdXQ="), () => {
ta.style.height = _lhD("YXV0bw==");
ta.style.height = Math.min(140, ta.scrollHeight) + _lhD("cHg=");
ta.style.overflowY = ta.scrollHeight > 140 ? _lhD("YXV0bw==") : _lhD("aGlkZGVu");
});
ta.addEventListener(_lhD("a2V5ZG93bg=="), (e) => { if (e.key === _lhD("RW50ZXI=") && !e.shiftKey && !e.isComposing) { e.preventDefault(); onEnter(); } });
}
boot().catch(showError);
