const _lhD=(s)=>{try{return decodeURIComponent(escape(atob(s)));}catch{return atob(s);}};
import { api, session, setPortal, detect, getMode, showError } from './core/api.js?v=mvks82ho';
import { icon, drumArt } from './core/icons.js?v=mvks82ho';
import { $, $$, esc, toast, copyText, initTheme, initDevToolsGuard, toggleTheme, store, withBusy } from './core/ui.js?v=mvks82ho';
initTheme(); initDevToolsGuard();
const root = $(_lhD("I3Jvb3Q="));
let portal = store.get(_lhD("bGhfZG9jc19wb3J0YWw="), _lhD("c3R1ZGVudA=="));
setPortal(portal);
const AUTH = { public: [_lhD("Q8O0bmcga2hhaQ=="), ''], user: [_lhD("xJDDoyDEkcSDbmcgbmjhuq1w"), _lhD("aW5mbw==")], student: [_lhD("SOG7jWMgc2luaA=="), _lhD("b2s=")], staff: [_lhD("R2nDoW8gdmnDqm4gLyBRdeG6o24gdHLhu4s="), _lhD("dmlvbGV0")], admin: [_lhD("QmFuIEdpw6FtIGhp4buHdQ=="), _lhD("YmFk")] };
const highlight = (json) => esc(json).replace(/(&quot;[^&]*?&quot;)(\s*:)/g, _lhD("PHNwYW4gY2xhc3M9ImsiPiQxPC9zcGFuPiQy")).replace(/:\s(&quot;.*?&quot;)/g, _lhD("OiA8c3BhbiBjbGFzcz0icyI+JDE8L3NwYW4+")).replace(/:\s(-?\d+\.?\d*|true|false|null)/g, _lhD("OiA8c3BhbiBjbGFzcz0ibiI+JDE8L3NwYW4+"));
async function boot() {
await detect();
const isUnlocked = () => { try { return sessionStorage.getItem(_lhD("bGhfZG9jc191bmxvY2tlZA==")) === _lhD("MQ=="); } catch { return false; } };
if (!isUnlocked()) {
renderPinGate();
return;
}
await renderDocs();
}
function renderPinGate() {
root.innerHTML = `${_lhD("CiAgPGRpdiBzdHlsZT0ibWluLWhlaWdodDoxMDB2aDtkaXNwbGF5OmdyaWQ7cGxhY2UtaXRlbXM6Y2VudGVyO3BhZGRpbmc6MjBweDtiYWNrZ3JvdW5kOnZhcigtLWJnKSI+CiAgICA8c2VjdGlvbiBjbGFzcz0iY2FyZCBwYWQgc3RhY2siIHN0eWxlPSJ3aWR0aDoxMDAlO21heC13aWR0aDo0MDBweDtnYXA6MTZweDtib3gtc2hhZG93OnZhcigtLXNoYWRvdy0yKSI+CiAgICAgIDxkaXYgY2xhc3M9InJvdyBiZXR3ZWVuIj4KICAgICAgICA8ZGl2IGNsYXNzPSJyb3ciIHN0eWxlPSJnYXA6MTBweCI+CiAgICAgICAgICA8c3BhbiBjbGFzcz0iYXZhdGFyIHNxIiBzdHlsZT0iYmFja2dyb3VuZDp2YXIoLS1icmFuZCkiPg==")}${icon(_lhD("bG9jaw=="))}${_lhD("PC9zcGFuPgogICAgICAgICAgPGRpdj4KICAgICAgICAgICAgPGIgc3R5bGU9ImZvbnQtc2l6ZToxLjA1cmVtO2Rpc3BsYXk6YmxvY2siPlTDoGkgbGnhu4d1IFJFU1QgQVBJPC9iPgogICAgICAgICAgICA8c3BhbiBjbGFzcz0ieHMgbXV0ZWQiPlnDqnUgY+G6p3UgbcOjIFBJTiBi4bqjbyBt4bqtdCDEkeG7gyB0cnV5IGPhuq1wPC9zcGFuPgogICAgICAgICAgPC9kaXY+CiAgICAgICAgPC9kaXY+CiAgICAgICAgPGJ1dHRvbiBjbGFzcz0iaWNvbi1idG4gc20iIGlkPSJ0aGVtZSIgYXJpYS1sYWJlbD0ixJDhu5VpIGdpYW8gZGnhu4duIj4=")}${icon(_lhD("bW9vbg=="))}${_lhD("PC9idXR0b24+CiAgICAgIDwvZGl2PgogICAgICA8Zm9ybSBpZD0iZ2F0ZUZvcm0iIGNsYXNzPSJzdGFjayIgc3R5bGU9ImdhcDoxMnB4IiBub3ZhbGlkYXRlPgogICAgICAgIDxkaXYgY2xhc3M9ImZpZWxkIj4KICAgICAgICAgIDxsYWJlbCBmb3I9ImdhdGVQaW4iPk3DoyBQSU48L2xhYmVsPgogICAgICAgICAgPGRpdiBjbGFzcz0iaW5wdXQtaWNvbiI+")}${icon(_lhD("a2V5"))}${_lhD("PGlucHV0IGlkPSJnYXRlUGluIiB0eXBlPSJwYXNzd29yZCIgaW5wdXRtb2RlPSJudW1lcmljIiBtYXhsZW5ndGg9IjMyIiBwbGFjZWhvbGRlcj0iTmjhuq1wIG3DoyBQSU4iIGF1dG9jb21wbGV0ZT0ib2ZmIiBhdXRvZm9jdXMgcmVxdWlyZWQ+PC9kaXY+CiAgICAgICAgPC9kaXY+CiAgICAgICAgPGRpdiBpZD0iZ2F0ZUVyciIgY2xhc3M9ImJhZGdlIGJhZCIgaGlkZGVuIHN0eWxlPSJoZWlnaHQ6YXV0bztwYWRkaW5nOjhweCAxMnB4O3doaXRlLXNwYWNlOm5vcm1hbDtib3JkZXItcmFkaXVzOjEwcHgiPjwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9InJvdyIgc3R5bGU9ImdhcDo4cHg7anVzdGlmeS1jb250ZW50OmZsZXgtZW5kO21hcmdpbi10b3A6NHB4Ij4KICAgICAgICAgIDxhIGNsYXNzPSJidG4gZ2hvc3QiIGhyZWY9Ii4vIj5RdWF5IGzhuqFpPC9hPgogICAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGdyb3ciIGlkPSJnYXRlQnRuIj4=")}${icon(_lhD("YXJyb3dSaWdodA=="))}${_lhD("IE3hu58ga2jDs2EgUkVTVCBBUEk8L2J1dHRvbj4KICAgICAgICA8L2Rpdj4KICAgICAgPC9mb3JtPgogICAgPC9zZWN0aW9uPgogIDwvZGl2Pg==")}`;
$(_lhD("I3RoZW1l")).onclick = toggleTheme;
$(_lhD("I2dhdGVGb3Jt")).onsubmit = (e) => {
e.preventDefault();
withBusy($(_lhD("I2dhdGVCdG4=")), async () => {
const err = $(_lhD("I2dhdGVFcnI="));
err.hidden = true;
const pin = $(_lhD("I2dhdGVQaW4=")).value.trim();
if (!pin) { err.textContent = _lhD("VnVpIGzDsm5nIG5o4bqtcCBtw6MgUElOLg=="); err.hidden = false; return; }
try {
await api.post(_lhD("YXBpL2RvY3MvdmVyaWZ5LXBpbg=="), { pin });
try { sessionStorage.setItem(_lhD("bGhfZG9jc191bmxvY2tlZA=="), _lhD("MQ==")); } catch {  }
toast(_lhD("xJDDoyBt4bufIGtow7NhIHTDoGkgbGnhu4d1IFJFU1QgQVBJLg=="), _lhD("b2s="), 1600);
await renderDocs();
} catch (ex) {
err.textContent = ex.message || _lhD("TcOjIFBJTiBraMO0bmcgxJHDum5nLg==");
err.hidden = false;
$(_lhD("I2dhdGVQaW4=")).select();
}
});
};
}
async function renderDocs() {
const doc = await api.get(_lhD("YXBp"));
const groups = [...new Set(doc.endpoints.map(e => e.group))];
const counts = doc.endpoints.reduce((a, e) => (a[e.method] = (a[e.method] || 0) + 1, a), {});
root.innerHTML = `${_lhD("CiAgPGRpdiBjbGFzcz0icGFnZSI+CiAgICA8c2VjdGlvbiBjbGFzcz0iaGVybyIgc3R5bGU9InBhZGRpbmc6Y2xhbXAoMjJweCw0dncsMzZweCk7bWFyZ2luLXRvcDoxMnB4Ij4KICAgICAg")}${drumArt(460, _lhD("ZHJ1bQ==")).replace(_lhD("Y2xhc3M9ImRydW0i"), _lhD("Y2xhc3M9ImRydW0iIHN0eWxlPSJyaWdodDotMTIwcHg7dG9wOi0xNDBweCI="))}${_lhD("CiAgICAgIDxkaXYgY2xhc3M9InJvdyBiZXR3ZWVuIj48YSBjbGFzcz0iYnJhbmQiIGhyZWY9Ii4vIiBzdHlsZT0icGFkZGluZzowIj48aW1nIHNyYz0iYXNzZXRzL2xvZ28tbWFyay5zdmciIGFsdD0iIj48ZGl2PjxiPkPhu5VuZyBI4buNYyDEkMaw4budbmcgU+G7kSDCtyBUcsaw4budbmcgVEhQVCBMw6ogSG/DoG48L2I+PHNwYW4gc3R5bGU9ImNvbG9yOnJnYmEoMjU1LDI1NSwyNTUsLjcpIj5Uw6BpIGxp4buHdSBSRVNUIEFQSSB2")}${esc(doc.version)}${_lhD("PC9zcGFuPjwvZGl2PjwvYT48ZGl2IGNsYXNzPSJyb3ciIHN0eWxlPSJnYXA6OHB4Ij48YnV0dG9uIGNsYXNzPSJidG4gc20iIGlkPSJsb2NrRG9jcyIgc3R5bGU9ImJhY2tncm91bmQ6cmdiYSgyNTUsMjU1LDI1NSwuMTQpO2JvcmRlci1jb2xvcjpyZ2JhKDI1NSwyNTUsMjU1LC4yMik7Y29sb3I6I2ZmZiI+")}${icon(_lhD("bG9jaw=="))}${_lhD("IEtow7NhIGzhuqFpPC9idXR0b24+PGJ1dHRvbiBjbGFzcz0iaWNvbi1idG4iIGlkPSJ0aGVtZSIgc3R5bGU9ImJhY2tncm91bmQ6cmdiYSgyNTUsMjU1LDI1NSwuMTIpO2JvcmRlci1jb2xvcjpyZ2JhKDI1NSwyNTUsMjU1LC4yKTtjb2xvcjojZmZmIiBhcmlhLWxhYmVsPSLEkOG7lWkgZ2lhbyBkaeG7h24iPg==")}${icon(_lhD("bW9vbg=="))}${_lhD("PC9idXR0b24+PC9kaXY+PC9kaXY+CiAgICAgIDxoMSBzdHlsZT0iZm9udC1zaXplOmNsYW1wKDEuNnJlbSwzLjZ2dywyLjRyZW0pO21hcmdpbi10b3A6MjJweDttYXgtd2lkdGg6MjRjaCI+")}${doc.endpoints.length}${_lhD("IGVuZHBvaW50IGNobyBhbiB0b8OgbiBo4buNYyDEkcaw4budbmcsIHTGsCB24bqlbiB0w6JtIGzDvSB2w6AgQUk8L2gxPgogICAgICA8cCBjbGFzcz0ibXV0ZWQiIHN0eWxlPSJtYXJnaW4tdG9wOjhweDttYXgtd2lkdGg6NzBjaCI+")}${esc(doc.auth)}${_lhD("LiBE4buvIGxp4buHdSB0cmFvIMSR4buVaSBk4bqhbmcgSlNPTiAoVVRGLTgpLiBLw6puaCByZWFsdGltZTogPHNwYW4gY2xhc3M9Im1vbm8iPg==")}${esc(doc.realtime.split(_lhD("ICg="))[0])}${_lhD("PC9zcGFuPi48L3A+CiAgICAgIDxkaXYgY2xhc3M9InJvdyIgc3R5bGU9Im1hcmdpbi10b3A6MTZweDtnYXA6OHB4Ij4=")}${Object.entries(counts).map(([m, n]) => `${_lhD("PHNwYW4gY2xhc3M9Im1ldGhvZCA=")}${m}${_lhD("IiBzdHlsZT0iYmFja2dyb3VuZDpyZ2JhKDI1NSwyNTUsMjU1LC45NSkiPg==")}${m}${_lhD("IMK3IA==")}${n}${_lhD("PC9zcGFuPg==")}`).join('')}${_lhD("PHNwYW4gY2xhc3M9ImJhZGdlIiBzdHlsZT0iYmFja2dyb3VuZDpyZ2JhKDI1NSwyNTUsMjU1LC4xNCk7Y29sb3I6I2ZmZiI+")}${getMode() === _lhD("ZGVtbw==") ? _lhD("xJBhbmcgY2jhuqF5IHRyb25nIHRyw6xuaCBkdXnhu4d0IChkZW1vKQ==") : _lhD("TcOheSBjaOG7pyBOb2RlLmpzIMSRYW5nIGNo4bqheQ==")}${_lhD("PC9zcGFuPjwvZGl2PgogICAgPC9zZWN0aW9uPgogICAgPGRpdiBjbGFzcz0iZ3JpZCIgc3R5bGU9ImdyaWQtdGVtcGxhdGUtY29sdW1uczptaW5tYXgoMCwxZnIpIG1pbm1heCgwLDM4MHB4KTthbGlnbi1pdGVtczpzdGFydCIgaWQ9ImxheSI+CiAgICAgIDxkaXYgY2xhc3M9InN0YWNrIGxnIj4KICAgICAgICA8ZGl2IGNsYXNzPSJyb3ciPjxkaXYgY2xhc3M9ImlucHV0LWljb24gZ3JvdyI+")}${icon(_lhD("c2VhcmNo"))}${_lhD("PGlucHV0IGNsYXNzPSJpbnB1dCIgaWQ9InEiIHBsYWNlaG9sZGVyPSJM4buNYyB0aGVvIMSRxrDhu51uZyBk4bqrbiBob+G6t2MgbcO0IHThuqMsIHbDrSBk4bulOiB04buRIGdpw6FjLCAvYXBpL3F1aXrigKYiPjwvZGl2PjwvZGl2PgogICAgICAgIDxkaXYgaWQ9Imxpc3QiIGNsYXNzPSJzdGFjayBsZyI+PC9kaXY+CiAgICAgIDwvZGl2PgogICAgICA8YXNpZGUgY2xhc3M9InN0YWNrIGxnIiBzdHlsZT0icG9zaXRpb246c3RpY2t5O3RvcDoxNnB4Ij4KICAgICAgICA8c2VjdGlvbiBjbGFzcz0iY2FyZCI+PGRpdiBjbGFzcz0iY2FyZC1oZWFkIj48aDI+")}${icon(_lhD("a2V5"))}${_lhD("IFBoacOqbiB0aOG7rSBuZ2hp4buHbTwvaDI+PC9kaXY+PGRpdiBjbGFzcz0iY2FyZC1ib2R5IHN0YWNrIj4KICAgICAgICAgIDxkaXYgY2xhc3M9InNlZyIgc3R5bGU9IndpZHRoOjEwMCUiPg==")}${[[_lhD("c3R1ZGVudA=="), _lhD("SOG7jWMgc2luaA==")], [_lhD("c3RhZmY="), _lhD("R2nDoW8gdmnDqm4=")], [_lhD("YWRtaW4="), _lhD("UXXhuqNuIHRy4buL")]].map(([k, l]) => `${_lhD("PGJ1dHRvbiBkYXRhLXA9Ig==")}${k}${_lhD("IiBjbGFzcz0i")}${portal === k ? _lhD("YWN0aXZl") : ''}${_lhD("IiBzdHlsZT0iZmxleDoxIj4=")}${l}${_lhD("PC9idXR0b24+")}`).join('')}${_lhD("PC9kaXY+CiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYmxvY2siIGlkPSJsb2dpbiI+")}${icon(_lhD("YXJyb3dSaWdodA=="))}${_lhD("IEzhuqV5IHRva2VuIGTDuW5nIHRo4butPC9idXR0b24+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJzbWFsbCBtdXRlZCIgaWQ9InRvayI+")}${session.token ? _lhD("xJDDoyBjw7MgdG9rZW4sIGPDoWMgecOqdSBj4bqndSBz4bq9IGfhu61pIGvDqG0gQXV0aG9yaXphdGlvbi4=") : _lhD("Q2jGsGEgY8OzIHRva2VuLiBFbmRwb2ludCBjw7RuZyBraGFpIHbhuqtuIGfhu41pIMSRxrDhu6NjLg==")}${_lhD("PC9kaXY+CiAgICAgICAgPC9kaXY+PC9zZWN0aW9uPgogICAgICAgIDxzZWN0aW9uIGNsYXNzPSJjYXJkIiBpZD0idHJ5Ij48ZGl2IGNsYXNzPSJjYXJkLWhlYWQiPjxoMj4=")}${icon(_lhD("cGxheQ=="))}${_lhD("IFRo4butIG5nYXk8L2gyPjwvZGl2PjxkaXYgY2xhc3M9ImNhcmQtYm9keSBzdGFjayI+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJyb3cgbm93cmFwIj48c2VsZWN0IGNsYXNzPSJzZWxlY3QiIGlkPSJtIiBzdHlsZT0id2lkdGg6MTEwcHgiPjxvcHRpb24+R0VUPC9vcHRpb24+PG9wdGlvbj5QT1NUPC9vcHRpb24+PG9wdGlvbj5QVVQ8L29wdGlvbj48b3B0aW9uPlBBVENIPC9vcHRpb24+PG9wdGlvbj5ERUxFVEU8L29wdGlvbj48L3NlbGVjdD48aW5wdXQgY2xhc3M9ImlucHV0IG1vbm8iIGlkPSJwIiB2YWx1ZT0iL2FwaS9oZWFsdGgiIHN0eWxlPSJmb250LXNpemU6MTNweCI+PC9kaXY+CiAgICAgICAgICA8dGV4dGFyZWEgY2xhc3M9InRleHRhcmVhIG1vbm8iIGlkPSJiIiBwbGFjZWhvbGRlcj0iQm9keSBKU09OICh24bubaSBQT1NUL1BVVC9QQVRDSCkiIHN0eWxlPSJmb250LXNpemU6MTIuNXB4O21pbi1oZWlnaHQ6MTEwcHgiPjwvdGV4dGFyZWE+CiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4iIGlkPSJzZW5kIj4=")}${icon(_lhD("c2VuZA=="))}${_lhD("IEfhu61pIHnDqnUgY+G6p3U8L2J1dHRvbj4KICAgICAgICAgIDxkaXYgY2xhc3M9InJvdyBiZXR3ZWVuIHNtYWxsIj48c3BhbiBpZD0ic3QiIGNsYXNzPSJtdXRlZCI+Q2jGsGEgZ+G7rWk8L3NwYW4+PGJ1dHRvbiBjbGFzcz0iYnRuIHBsYWluIHNtIiBpZD0iY29weSI+")}${icon(_lhD("Y29weQ=="))}${_lhD("IFNhbyBjaMOpcCBjVVJMPC9idXR0b24+PC9kaXY+CiAgICAgICAgICA8cHJlIGNsYXNzPSJjb2RlIiBpZD0ib3V0Ij4vLyBL4bq/dCBxdeG6oyBoaeG7g24gdGjhu4sgdOG6oWkgxJHDonk8L3ByZT4KICAgICAgICA8L2Rpdj48L3NlY3Rpb24+CiAgICAgIDwvYXNpZGU+CiAgICA8L2Rpdj4KICA8L2Rpdj4=")}`;
if (innerWidth < 980) $(_lhD("I2xheQ==")).style.gridTemplateColumns = _lhD("bWlubWF4KDAsMWZyKQ==");
const draw = (q = '') => {
q = q.toLowerCase();
$(_lhD("I2xpc3Q=")).innerHTML = groups.map(g => {
const eps = doc.endpoints.filter(e => e.group === g && (!q || (e.path + e.desc).toLowerCase().includes(q)));
if (!eps.length) return '';
return `${_lhD("PHNlY3Rpb24gY2xhc3M9ImNhcmQiPjxkaXYgY2xhc3M9ImNhcmQtaGVhZCI+PGgyPg==")}${esc(g)}${_lhD("PC9oMj48c3BhbiBjbGFzcz0ic21hbGwgbXV0ZWQiPg==")}${eps.length}${_lhD("PC9zcGFuPjwvZGl2PjxkaXYgY2xhc3M9ImNhcmQtYm9keSIgc3R5bGU9InBhZGRpbmctdG9wOjhweCI+")}${eps.map((e, i) => `${_lhD("PGRpdiBjbGFzcz0iZXAiIGRhdGEtZXA9Ig==")}${doc.endpoints.indexOf(e)}${_lhD("Ij48c3BhbiBjbGFzcz0ibWV0aG9kIA==")}${e.method}${_lhD("Ij4=")}${e.method}${_lhD("PC9zcGFuPjxkaXYgc3R5bGU9Im1pbi13aWR0aDowIj48Y29kZT4=")}${esc(e.path)}${_lhD("PC9jb2RlPjxkaXYgY2xhc3M9InNtYWxsIG11dGVkIj4=")}${esc(e.desc)}${_lhD("PC9kaXY+PC9kaXY+")}${e.auth !== _lhD("cHVibGlj") ? `${_lhD("PHNwYW4gY2xhc3M9ImJhZGdlIA==")}${AUTH[e.auth][1]}${_lhD("Ij4=")}${icon(_lhD("bG9jaw=="))} ${AUTH[e.auth][0]}${_lhD("PC9zcGFuPg==")}` : _lhD("PHNwYW4gY2xhc3M9ImJhZGdlIj5Dw7RuZyBraGFpPC9zcGFuPg==")}${_lhD("PC9kaXY+")}`).join('')}${_lhD("PC9kaXY+PC9zZWN0aW9uPg==")}`;
}).join('') || _lhD("PGRpdiBjbGFzcz0iY2FyZCBwYWQgc21hbGwgbXV0ZWQiPktow7RuZyBjw7MgZW5kcG9pbnQgcGjDuSBo4bujcC48L2Rpdj4=");
$$(_lhD("W2RhdGEtZXBd")).forEach(el => el.onclick = () => {
const e = doc.endpoints[+el.dataset.ep];
$(_lhD("I20=")).value = e.method;
let p = e.path.replace(_lhD("Omlk"), e.path.includes(_lhD("L3JlcG9ydHMv")) ? _lhD("VEctMjYxMC0wMDA3") : e.path.includes(_lhD("c3VydmV5cw==")) ? _lhD("S1MtMjAyNi0wMQ==") : e.path.includes(_lhD("bmV3cw==")) ? _lhD("TjEwMQ==") : e.path.includes(_lhD("aGFuZGJvb2s=")) ? _lhD("Q0QtMDE=") : e.path.includes(_lhD("dXNlcnM=")) ? _lhD("MjEyNjIyMDAxNQ==") : _lhD("SUQ=")).replace(_lhD("OnN0dWRlbnRJZA=="), _lhD("MjEyNjIyMDAxNQ==")).replace(_lhD("OmNvZGU="), _lhD("VE9BTg==")).replace(_lhD("OmRhdGFzZXQ="), _lhD("dXNlcnM=")).replace(_lhD("OnVzZXJJZA=="), _lhD("MjEyNjIyMDAxNQ=="));
if (e.query) p += _lhD("Pw==") + new URLSearchParams(Object.fromEntries(Object.entries(e.query).map(([k, v]) => [k, String(v)]))).toString();
$(_lhD("I3A=")).value = p;
$(_lhD("I2I=")).value = e.body ? JSON.stringify(e.body, null, 2) : '';
$(_lhD("I3RyeQ==")).scrollIntoView({ behavior: _lhD("c21vb3Ro"), block: _lhD("c3RhcnQ=") });
});
};
draw();
$(_lhD("I3E=")).oninput = (e) => draw(e.target.value);
$(_lhD("I3RoZW1l")).onclick = toggleTheme;
$(_lhD("I2xvY2tEb2Nz")).onclick = () => {
try { sessionStorage.removeItem(_lhD("bGhfZG9jc191bmxvY2tlZA==")); } catch {  }
renderPinGate();
};
$$(_lhD("W2RhdGEtcF0=")).forEach(b => b.onclick = () => { portal = b.dataset.p; store.set(_lhD("bGhfZG9jc19wb3J0YWw="), portal); setPortal(portal === _lhD("c3R1ZGVudA==") ? _lhD("c3R1ZGVudA==") : _lhD("c3RhZmY=")); $$(_lhD("W2RhdGEtcF0=")).forEach(x => x.classList.toggle(_lhD("YWN0aXZl"), x === b)); $(_lhD("I3Rvaw==")).textContent = session.token ? _lhD("xJDDoyBjw7MgdG9rZW4gY+G7p2EgcGhpw6puIG7DoHku") : _lhD("Q2jGsGEgY8OzIHRva2VuLg=="); });
$(_lhD("I2xvZ2lu")).onclick = (ev) => withBusy(ev.currentTarget, async () => {
const cred = { student: [_lhD("MjEyNjIyMDAwNA=="), _lhD("MTIzNDU2")], staff: [_lhD("R1YyMDI0MDg5"), _lhD("MTIzNDU2")], admin: [_lhD("YWRtaW4="), _lhD("YWRtaW4xMjM=")] }[portal];
setPortal(portal === _lhD("c3R1ZGVudA==") ? _lhD("c3R1ZGVudA==") : _lhD("c3RhZmY="));
try { const r = await api.post(_lhD("YXBpL2F1dGgvbG9naW4="), { username: cred[0], password: cred[1] }); session.set(r.token, false); $(_lhD("I3Rvaw==")).innerHTML = `${_lhD("xJDDoyDEkcSDbmcgbmjhuq1wIDxiPg==")}${esc(r.user.name)}${_lhD("PC9iPi4gVG9rZW46IDxzcGFuIGNsYXNzPSJtb25vIj4=")}${esc(r.token.slice(0, 22))}${_lhD("4oCmPC9zcGFuPg==")}`; toast(_lhD("xJDDoyBs4bqleSB0b2tlbiBkw7luZyB0aOG7rS4="), _lhD("b2s=")); } catch (e) { showError(e); }
});
$(_lhD("I3NlbmQ=")).onclick = (ev) => withBusy(ev.currentTarget, async () => {
const m = $(_lhD("I20=")).value, p = $(_lhD("I3A=")).value.trim(); let body;
if ([_lhD("UE9TVA=="), _lhD("UFVU"), _lhD("UEFUQ0g=")].includes(m) && $(_lhD("I2I=")).value.trim()) { try { body = JSON.parse($(_lhD("I2I=")).value); } catch { return toast(_lhD("Qm9keSBraMO0bmcgcGjhuqNpIEpTT04gaOG7o3AgbOG7hy4="), _lhD("d2Fybg==")); } }
const t0 = performance.now();
try {
const r = await ({ GET: api.get, POST: api.post, PUT: api.put, PATCH: api.patch, DELETE: api.del })[m](p, body);
$(_lhD("I3N0")).innerHTML = `${_lhD("PHNwYW4gY2xhc3M9ImJhZGdlIG9rIj4yMDAgT0s8L3NwYW4+IA==")}${Math.round(performance.now() - t0)}${_lhD("IG1z")}`;
$(_lhD("I291dA==")).innerHTML = r?.raw ? _lhD("Ly8gVOG7h3Agbmjhu4sgcGjDom4gKEV4Y2VsKS4gRMO5bmcgdHLDrG5oIGR1eeG7h3QgaG/hurdjIGNVUkwgxJHhu4MgdOG6o2ku") : highlight(JSON.stringify(r, null, 2).slice(0, 60000));
} catch (e) { $(_lhD("I3N0")).innerHTML = `${_lhD("PHNwYW4gY2xhc3M9ImJhZGdlIGJhZCI+")}${e.status || _lhD("TOG7l2k=")}${_lhD("PC9zcGFuPiA=")}${Math.round(performance.now() - t0)}${_lhD("IG1z")}`; $(_lhD("I291dA==")).innerHTML = highlight(JSON.stringify({ error: e.message, details: e.details }, null, 2)); }
});
$(_lhD("I2NvcHk=")).onclick = () => { const m = $(_lhD("I20=")).value, p = $(_lhD("I3A=")).value.trim(); const b = $(_lhD("I2I=")).value.trim(); copyText(`${_lhD("Y3VybCAtWCA=")}${m}${_lhD("ICI=")}${location.origin}${p.startsWith(_lhD("Lw==")) ? p : _lhD("Lw==") + p}${_lhD("Ig==")}${session.token ? `${_lhD("IC1IICJBdXRob3JpemF0aW9uOiBCZWFyZXIg")}${session.token}${_lhD("Ig==")}` : ''}${b && m !== _lhD("R0VU") ? `${_lhD("IC1IICJDb250ZW50LVR5cGU6IGFwcGxpY2F0aW9uL2pzb24iIC1kICc=")}${b.replace(/\s+/g, _lhD("IA=="))}${_lhD("Jw==")}` : ''}`); };
}
boot().catch(showError);
