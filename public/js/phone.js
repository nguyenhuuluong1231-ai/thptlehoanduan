const _lhD=(s)=>{try{return decodeURIComponent(escape(atob(s)));}catch{return atob(s);}};
import { api, detect, getMode } from './core/api.js?v=mvks82ho';
import { icon } from './core/icons.js?v=mvks82ho';
import { $, $$, esc, store, initTheme, initDevToolsGuard, toggleTheme } from './core/ui.js?v=mvks82ho';
import { qrSvg } from './core/qr.js?v=mvks82ho';
initTheme(); initDevToolsGuard();
const IS_REAL_PHONE = (matchMedia(_lhD("KG1heC13aWR0aDogNzYwcHgp")).matches || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '')) && !/[?&]frame/.test(location.search);
const DEVICES = {
pixel: { name: _lhD("UGl4ZWwgOA=="), w: 412, h: 915 },
a55: { name: _lhD("R2FsYXh5IEE1NQ=="), w: 384, h: 854 },
s24: { name: _lhD("R2FsYXh5IFMyNA=="), w: 360, h: 780 },
};
const SCREENS = [[_lhD("Li8="), _lhD("xJDEg25nIG5o4bqtcA=="), _lhD("bG9jaw==")], [_lhD("YXBwLmh0bWw="), _lhD("Q+G7lW5nIGjhu41jIHNpbmg="), _lhD("Z3JhZA==")], [_lhD("YWRtaW4uaHRtbA=="), _lhD("Q+G7lW5nIHF14bqjbiB0cuG7iyDCtyBHVg=="), _lhD("YnVpbGRpbmc=")]];
const BEZEL = 12, SBAR = 30;
let dev = DEVICES[store.get(_lhD("bGhfcGhvbmVfZGV2"))] ? store.get(_lhD("bGhfcGhvbmVfZGV2")) : _lhD("cGl4ZWw=");
let nav = store.get(_lhD("bGhfcGhvbmVfbmF2"), _lhD("YnV0dG9ucw=="));
let lan = [];
const svg = {
wifi: _lhD("PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgZmlsbD0iY3VycmVudENvbG9yIj48cGF0aCBkPSJNMTIgMjAuNSAxLjQgOC42YTE1IDE1IDAgMCAxIDIxLjIgMHoiLz48L3N2Zz4="),
signal: _lhD("PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgZmlsbD0iY3VycmVudENvbG9yIj48cGF0aCBkPSJNMiAyMmgyMFYyeiIvPjwvc3ZnPg=="),
battery: _lhD("PHN2ZyB2aWV3Qm94PSIwIDAgMjYgMTQiIHdpZHRoPSIyMiIgaGVpZ2h0PSIxMiI+PHJlY3QgeD0iLjciIHk9Ii43IiB3aWR0aD0iMjEuNiIgaGVpZ2h0PSIxMi42IiByeD0iMyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMS40Ii8+PHJlY3QgeD0iMi42IiB5PSIyLjYiIHdpZHRoPSIxNSIgaGVpZ2h0PSI4LjgiIHJ4PSIxLjUiIGZpbGw9ImN1cnJlbnRDb2xvciIvPjxyZWN0IHg9IjIzLjQiIHk9IjQuNSIgd2lkdGg9IjIiIGhlaWdodD0iNSIgcng9IjEiIGZpbGw9ImN1cnJlbnRDb2xvciIvPjwvc3ZnPg=="),
back: _lhD("PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTE3IDQuNSA2IDEybDExIDcuNXoiLz48L3N2Zz4="),
home: _lhD("PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNy41Ii8+PC9zdmc+"),
recent: _lhD("PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIxNyIgaGVpZ2h0PSIxNyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHJlY3QgeD0iNSIgeT0iNSIgd2lkdGg9IjE0IiBoZWlnaHQ9IjE0IiByeD0iMiIvPjwvc3ZnPg=="),
};
async function boot() {
if (IS_REAL_PHONE) {
render();
return;
}
await detect();
try { lan = (await api.get(_lhD("YXBpL3NlcnZlci1pbmZv"))).lan || []; } catch { lan = []; }
render();
addEventListener(_lhD("cmVzaXpl"), fit, { passive: true });
setInterval(tick, 15000);
}
function hasActiveSession(p) {
const tok = (() => { try { return sessionStorage.getItem(_lhD("bGhfdG9rZW5f") + p) || store.get(_lhD("bGhfdG9rZW5f") + p); } catch { return store.get(_lhD("bGhfdG9rZW5f") + p); } })();
return !!tok;
}
function getInitialSrc() {
const cur = $(_lhD("I2Zy"))?.contentWindow?.location;
if (cur?.pathname) {
const file = cur.pathname.split(_lhD("Lw==")).pop() || _lhD("aW5kZXguaHRtbA==");
return `${file === _lhD("Li8=") ? _lhD("aW5kZXguaHRtbA==") : file}${_lhD("P21vYmlsZT0x")}${cur.hash || ''}`;
}
const saved = (() => { try { return sessionStorage.getItem(_lhD("bGhfcGhvbmVfc3Jj")) || store.get(_lhD("bGhfcGhvbmVfc3Jj")) || ''; } catch { return store.get(_lhD("bGhfcGhvbmVfc3Jj")) || ''; } })();
if (saved.startsWith(_lhD("YXBwLmh0bWw=")) && hasActiveSession(_lhD("c3R1ZGVudA=="))) return _lhD("YXBwLmh0bWw/bW9iaWxlPTE=");
if (saved.startsWith(_lhD("YWRtaW4uaHRtbA==")) && hasActiveSession(_lhD("c3RhZmY="))) return _lhD("YWRtaW4uaHRtbD9tb2JpbGU9MQ==");
if (hasActiveSession(_lhD("c3R1ZGVudA=="))) return _lhD("YXBwLmh0bWw/bW9iaWxlPTE=");
if (hasActiveSession(_lhD("c3RhZmY="))) return _lhD("YWRtaW4uaHRtbD9tb2JpbGU9MQ==");
return _lhD("aW5kZXguaHRtbD9tb2JpbGU9MQ==");
}
function render() {
const startSrc = getInitialSrc();
if (IS_REAL_PHONE) {
$(_lhD("I3Jvb3Q=")).innerHTML = `${_lhD("PGlmcmFtZSBpZD0iZnIiIHRpdGxlPSJBcHAgxJFp4buHbiB0aG/huqFpIFRIUFQgTMOqIEhvw6BuIiBzcmM9Ig==")}${esc(startSrc)}${_lhD("IiBzdHlsZT0icG9zaXRpb246Zml4ZWQ7aW5zZXQ6MDt3aWR0aDoxMDAlO2hlaWdodDoxMDAlO2JvcmRlcjowO2JhY2tncm91bmQ6dmFyKC0tYmcpIiBhbGxvdz0iY2FtZXJhOyBnZW9sb2NhdGlvbjsgY2xpcGJvYXJkLXdyaXRlOyBmdWxsc2NyZWVuIj48L2lmcmFtZT4=")}`;
return;
}
const d = DEVICES[dev];
const navH = nav === _lhD("YnV0dG9ucw==") ? 48 : 22;
$(_lhD("I3Jvb3Q=")).innerHTML = `${_lhD("CiAgPGRpdiBjbGFzcz0icHAiPgogICAgPGhlYWRlciBjbGFzcz0icHAtdG9wIj4KICAgICAgPGEgY2xhc3M9ImJyYW5kIiBocmVmPSIuLyIgc3R5bGU9InBhZGRpbmc6MCI+PGltZyBzcmM9ImFzc2V0cy9sb2dvLW1hcmsuc3ZnIiBhbHQ9IiI+PGRpdj48Yj5BcHAgxJFp4buHbiB0aG/huqFpPC9iPjxzcGFuPkPhu5VuZyBI4buNYyDEkMaw4budbmcgU+G7kSDCtyBUcsaw4budbmcgVEhQVCBMw6ogSG/DoG48L3NwYW4+PC9kaXY+PC9hPgogICAgICA8ZGl2IGNsYXNzPSJyb3ciIHN0eWxlPSJnYXA6OHB4Ij48YSBjbGFzcz0iYnRuIGdob3N0IHNtIiBocmVmPSIuLyI+")}${icon(_lhD("Z2xvYmU="))}${_lhD("IELhuqNuIHdlYjwvYT48YnV0dG9uIGNsYXNzPSJpY29uLWJ0biIgaWQ9InRoZW1lIiBhcmlhLWxhYmVsPSLEkOG7lWkgZ2lhbyBkaeG7h24gc8OhbmcvdOG7kWkiPg==")}${icon(_lhD("bW9vbg=="))}${_lhD("PC9idXR0b24+PC9kaXY+CiAgICA8L2hlYWRlcj4KICAgIDxtYWluIGNsYXNzPSJwcC1tYWluIj4KICAgICAgPGRpdiBjbGFzcz0icHAtc3RhZ2UiIGlkPSJzdGFnZSI+CiAgICAgICAgPGRpdiBjbGFzcz0iZGV2aWNlLXdyYXAiIGlkPSJ3cmFwIj48ZGl2IGNsYXNzPSJkZXZpY2UiIGlkPSJkZXZpY2UiIHN0eWxlPSItLXc6")}${d.w}${_lhD("cHg7LS1oOg==")}${d.h}${_lhD("cHg7LS1iZXplbDo=")}${BEZEL}${_lhD("cHgiPgogICAgICAgICAgPHNwYW4gY2xhc3M9Imh3IGh3LXBvd2VyIj48L3NwYW4+PHNwYW4gY2xhc3M9Imh3IGh3LXZvbCI+PC9zcGFuPgogICAgICAgICAgPGRpdiBjbGFzcz0ic2NyZWVuIj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0ic2JhciIgc3R5bGU9ImhlaWdodDo=")}${SBAR}${_lhD("cHgiPjxzcGFuIGlkPSJjbG9jayI+PC9zcGFuPjxpIGNsYXNzPSJjYW0iPjwvaT48c3BhbiBjbGFzcz0ic2ljb25zIj4=")}${svg.wifi}${svg.signal}${svg.battery}${_lhD("PC9zcGFuPjwvZGl2PgogICAgICAgICAgICA8aWZyYW1lIGlkPSJmciIgdGl0bGU9IkFwcCDEkWnhu4duIHRob+G6oWkgVEhQVCBMw6ogSG/DoG4iIHNyYz0i")}${esc(startSrc)}${_lhD("IiBzdHlsZT0iaGVpZ2h0Og==")}${d.h - SBAR - navH}${_lhD("cHgiIGFsbG93PSJjYW1lcmE7IGdlb2xvY2F0aW9uOyBjbGlwYm9hcmQtd3JpdGU7IGZ1bGxzY3JlZW4iPjwvaWZyYW1lPgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJuYXZiYXIg")}${nav}${_lhD("IiBzdHlsZT0iaGVpZ2h0Og==")}${navH}${_lhD("cHgiPg==")}${nav === _lhD("YnV0dG9ucw==") ? `${_lhD("PGJ1dHRvbiBkYXRhLW5hdj0iYmFjayIgYXJpYS1sYWJlbD0iUXVheSBs4bqhaSI+")}${svg.back}${_lhD("PC9idXR0b24+PGJ1dHRvbiBkYXRhLW5hdj0iaG9tZSIgYXJpYS1sYWJlbD0iTcOgbiBow6xuaCBjaMOtbmgiPg==")}${svg.home}${_lhD("PC9idXR0b24+PGJ1dHRvbiBkYXRhLW5hdj0icmVjZW50IiBhcmlhLWxhYmVsPSJU4bqjaSBs4bqhaSI+")}${svg.recent}${_lhD("PC9idXR0b24+")}` : _lhD("PGkgY2xhc3M9InBpbGwiPjwvaT4=")}${_lhD("PC9kaXY+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICA8L2Rpdj48L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJwcC1jYXB0aW9uIHNtYWxsIG11dGVkIj4=")}${esc(d.name)}${_lhD("IMK3IA==")}${d.w}${_lhD("w5c=")}${d.h}${_lhD("PC9kaXY+CiAgICAgIDwvZGl2PgogICAgICA8YXNpZGUgY2xhc3M9InBwLXNpZGUgc3RhY2sgbGciPgogICAgICAgIDxzZWN0aW9uIGNsYXNzPSJjYXJkIHBhZCBzdGFjayI+CiAgICAgICAgICA8aDEgY2xhc3M9InBwLWgxIj5YZW0gdHLGsOG7m2MgYXBwIEFuZHJvaWQ8L2gxPgogICAgICAgICAgPHAgY2xhc3M9InNtYWxsIGluazIiPkFwcCBkw7luZyBjaHVuZyB0w6BpIGtob+G6o24gdsOgIGThu68gbGnhu4d1IHbhu5tpIHRyYW5nIHdlYjogdGluIG5o4bqvbiwgdGjDtG5nIGLDoW8sIHThu5EgZ2nDoWPigKYgxJHhu5NuZyBi4buZIHThu6ljIHRo4budaS4gVGhhbyB0w6FjIHRyb25nIGtodW5nIMSRaeG7h24gdGhv4bqhaSBuaMawIHRyw6puIG3DoXkgdGjhuq10LjwvcD4KICAgICAgICAgIDxkaXYgY2xhc3M9InN0YWNrIiBzdHlsZT0iZ2FwOjhweCI+CiAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJleWVicm93Ij5Nw6BuIGjDrG5oPC9zcGFuPgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJwcC1zY3JlZW5zIj4=")}${SCREENS.map(([src, label, ic]) => `${_lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIGdob3N0IHNtIiBkYXRhLWdvPSI=")}${src}${_lhD("Ij4=")}${icon(ic)} ${label}${_lhD("PC9idXR0b24+")}`).join('')}${_lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIGdob3N0IHNtIiBkYXRhLW5hdj0icmVjZW50Ij4=")}${icon(_lhD("cmVmcmVzaA=="))}${_lhD("IFThuqNpIGzhuqFpPC9idXR0b24+PC9kaXY+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICAgIDxkaXYgY2xhc3M9InN0YWNrIiBzdHlsZT0iZ2FwOjhweCI+CiAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJleWVicm93Ij5UaGnhur90IGLhu4s8L3NwYW4+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9InNlZyIgc3R5bGU9IndpZHRoOjEwMCUiPg==")}${Object.entries(DEVICES).map(([k, v]) => `${_lhD("PGJ1dHRvbiBkYXRhLWRldj0i")}${k}${_lhD("IiBjbGFzcz0i")}${dev === k ? _lhD("YWN0aXZl") : ''}${_lhD("IiBzdHlsZT0iZmxleDoxIj4=")}${v.name}${_lhD("PC9idXR0b24+")}`).join('')}${_lhD("PC9kaXY+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9InNlZyIgc3R5bGU9IndpZHRoOjEwMCUiPjxidXR0b24gZGF0YS1uYXZtb2RlPSJidXR0b25zIiBjbGFzcz0i")}${nav === _lhD("YnV0dG9ucw==") ? _lhD("YWN0aXZl") : ''}${_lhD("IiBzdHlsZT0iZmxleDoxIj5UaGFuaCAzIG7DunQ8L2J1dHRvbj48YnV0dG9uIGRhdGEtbmF2bW9kZT0iZ2VzdHVyZSIgY2xhc3M9Ig==")}${nav === _lhD("Z2VzdHVyZQ==") ? _lhD("YWN0aXZl") : ''}${_lhD("IiBzdHlsZT0iZmxleDoxIj5WdeG7kXQgY+G7rSBjaOG7iTwvYnV0dG9uPjwvZGl2PgogICAgICAgICAgPC9kaXY+CiAgICAgICAgPC9zZWN0aW9uPgogICAgICAgIDxzZWN0aW9uIGNsYXNzPSJjYXJkIHBhZCBzdGFjayI+CiAgICAgICAgICA8Yj4=")}${icon(_lhD("c21hcnRwaG9uZQ=="))}${_lhD("IE3hu58gdHLDqm4gxJFp4buHbiB0aG/huqFpIHRo4bqtdDwvYj4KICAgICAgICAgIA==")}${getMode() === _lhD("ZGVtbw==") ? _lhD("PHAgY2xhc3M9InNtYWxsIGluazIiPsSQw6J5IGzDoCBi4bqjbiB4ZW0gdHLGsOG7m2MuIENo4bqheSBtw6F5IGNo4bunIGLhurFuZyA8c3BhbiBjbGFzcz0ibW9ubyI+bnBtIHN0YXJ0PC9zcGFuPiBy4buTaSBt4bufIHRyYW5nIG7DoHkgxJHhu4MgY8OzIG3DoyBRUiBxdcOpdCBi4bqxbmcgxJFp4buHbiB0aG/huqFpLjwvcD4=") : lan.length ? `${_lhD("CiAgICAgICAgICA8ZGl2IGNsYXNzPSJyb3cgbm93cmFwIiBzdHlsZT0iZ2FwOjE0cHg7YWxpZ24taXRlbXM6Y2VudGVyIj48ZGl2IGlkPSJxciIgY2xhc3M9InBwLXFyIiBhcmlhLWxhYmVsPSJNw6MgUVIgbeG7nyBhcHAiPjwvZGl2PjxkaXYgY2xhc3M9InN0YWNrIiBzdHlsZT0iZ2FwOjZweDttaW4td2lkdGg6MCI+PHNwYW4gY2xhc3M9InNtYWxsIGluazIiPlF1w6l0IG3DoyBi4bqxbmcgY2FtZXJhIMSRaeG7h24gdGhv4bqhaSAoY8O5bmcgbeG6oW5nIFdpLUZpIHbhu5tpIG3DoXkgdMOtbmgpOjwvc3Bhbj4=")}${lan.map(u => `${_lhD("PGEgY2xhc3M9Im1vbm8gc21hbGwgdHJ1bmNhdGUiIGhyZWY9Ig==")}${esc(u)}${_lhD("IiB0YXJnZXQ9Il9ibGFuayIgcmVsPSJub29wZW5lciI+")}${esc(u)}${_lhD("PC9hPg==")}`).join('')}${_lhD("PC9kaXY+PC9kaXY+CiAgICAgICAgICA8cCBjbGFzcz0ieHMgbXV0ZWQiPktow7RuZyBt4bufIMSRxrDhu6NjPyBLaeG7g20gdHJhIMSRaeG7h24gdGhv4bqhaSB2w6AgbcOheSB0w61uaCBjw7luZyBXaS1GaSwgdsOgIGNobyBwaMOpcCBOb2RlLmpzIHF1YSB0xrDhu51uZyBs4butYSBXaW5kb3dzIChXaW5kb3dzIERlZmVuZGVyIEZpcmV3YWxsIOKGkiBBbGxvdyBhbiBhcHApLjwvcD4=")}` : `${_lhD("PHAgY2xhc3M9InNtYWxsIGluazIiPk3hu58gPHNwYW4gY2xhc3M9Im1vbm8iPg==")}${esc(location.origin)}${_lhD("PC9zcGFuPiB0csOqbiB0csOsbmggZHV54buHdCDEkWnhu4duIHRob+G6oWkuPC9wPjxkaXYgaWQ9InFyIiBjbGFzcz0icHAtcXIiPjwvZGl2Pg==")}`}${_lhD("CiAgICAgICAgPC9zZWN0aW9uPgogICAgICAgIDxzZWN0aW9uIGNsYXNzPSJjYXJkIHBhZCBzdGFjayI+CiAgICAgICAgICA8Yj4=")}${icon(_lhD("ZG93bmxvYWQ="))}${_lhD("IEPDoGkgYXBwIGzDqm4gxJFp4buHbiB0aG/huqFpPC9iPgogICAgICAgICAgPG9sIGNsYXNzPSJzbWFsbCBpbmsyIHBwLXN0ZXBzIj4KICAgICAgICAgICAgPGxpPjxiPkFuZHJvaWQsIGlQaG9uZSAoa2jDtG5nIGPhuqduIEFQSyk6PC9iPiBt4bufIMSR4buLYSBjaOG7iSB0csOqbiBi4bqxbmcgQ2hyb21lIGhv4bq3YyBTYWZhcmkg4oaSIDxpPlRow6ptIHbDoG8gbcOgbiBow6xuaCBjaMOtbmg8L2k+LiBD4bqnbiB0cmFuZyBjaOG6oXkgcXVhIEhUVFBTIGhv4bq3YyBsb2NhbGhvc3QuPC9saT4KICAgICAgICAgICAgPGxpPjxiPlThu4dwIEFQSyBBbmRyb2lkOjwvYj4gxJHGsGEgZOG7sSDDoW4gbMOqbiBHaXRIdWIg4oaSIHRhYiA8aT5BY3Rpb25zPC9pPiDihpIgPGk+QnVpbGQgQVBLIEFuZHJvaWQ8L2k+IOKGkiB04bqjaSB04buHcCBBUEsuIEjGsOG7m25nIGThuqtuIGNoaSB0aeG6v3QgdHJvbmcgPHNwYW4gY2xhc3M9Im1vbm8iPm1vYmlsZS9SRUFETUUubWQ8L3NwYW4+LjwvbGk+CiAgICAgICAgICA8L29sPgogICAgICAgIDwvc2VjdGlvbj4KICAgICAgPC9hc2lkZT4KICAgIDwvbWFpbj4KICA8L2Rpdj4=")}`;
bind();
fit(); tick(); drawQr();
}
function bind() {
const fr = $(_lhD("I2Zy"));
const saveFrameUrl = () => {
try {
const loc = fr.contentWindow.location;
const file = loc.pathname.split(_lhD("Lw==")).pop() || _lhD("Li8=");
const rel = (file === _lhD("aW5kZXguaHRtbA==") || file === _lhD("bG9naW5ob2Npbmg=") ? _lhD("Li8=") : file) + (loc.hash || '');
sessionStorage.setItem(_lhD("bGhfcGhvbmVfc3Jj"), rel);
store.set(_lhD("bGhfcGhvbmVfc3Jj"), rel);
} catch {  }
};
fr.addEventListener(_lhD("bG9hZA=="), () => {
saveFrameUrl();
try { fr.contentWindow.addEventListener(_lhD("aGFzaGNoYW5nZQ=="), saveFrameUrl); } catch {  }
});
$(_lhD("I3RoZW1l")).onclick = () => { const t = toggleTheme(); try { $(_lhD("I2Zy")).contentDocument.documentElement.dataset.theme = t; } catch {  } };
$$(_lhD("W2RhdGEtZGV2XQ==")).forEach(b => b.onclick = () => { dev = b.dataset.dev; store.set(_lhD("bGhfcGhvbmVfZGV2"), dev); render(); });
$$(_lhD("W2RhdGEtbmF2bW9kZV0=")).forEach(b => b.onclick = () => { nav = b.dataset.navmode; store.set(_lhD("bGhfcGhvbmVfbmF2"), nav); render(); });
$$(_lhD("W2RhdGEtZ29d")).forEach(b => b.onclick = () => {
const target = b.dataset.go === _lhD("Li8=") ? _lhD("Li8/c3dpdGNoPTE=") : b.dataset.go;
try { sessionStorage.setItem(_lhD("bGhfcGhvbmVfc3Jj"), b.dataset.go); store.set(_lhD("bGhfcGhvbmVfc3Jj"), b.dataset.go); } catch {  }
$(_lhD("I2Zy")).src = target;
});
$$(_lhD("W2RhdGEtbmF2XQ==")).forEach(b => b.onclick = () => {
const w = $(_lhD("I2Zy")).contentWindow;
try {
if (b.dataset.nav === _lhD("YmFjaw==")) w.history.back();
else if (b.dataset.nav === _lhD("cmVjZW50")) w.location.reload();
else if (/app\.html/.test(w.location.pathname)) w.location.hash = _lhD("aG9tZQ==");
else if (/(admin|teacher)\.html/.test(w.location.pathname)) w.location.hash = '';
else $(_lhD("I2Zy")).src = _lhD("Li8=");
} catch { $(_lhD("I2Zy")).src = _lhD("Li8="); }
});
}
function fit() {
const d = DEVICES[dev], el = $(_lhD("I2RldmljZQ==")), stage = $(_lhD("I3N0YWdl"));
if (!el) return;
const outerW = d.w + BEZEL * 2, outerH = d.h + BEZEL * 2;
const top = stage.getBoundingClientRect().top + scrollY;
const availH = Math.max(420, innerHeight - top - 46);
const availW = Math.max(280, stage.clientWidth || outerW);
const s = Math.min(1, availH / outerH, availW / (outerW + 12));
el.style.transform = `${_lhD("c2NhbGUo")}${s}${_lhD("KQ==")}`;
const wrap = $(_lhD("I3dyYXA=")); wrap.style.width = `${outerW * s}${_lhD("cHg=")}`; wrap.style.height = `${outerH * s}${_lhD("cHg=")}`;
}
function tick() { const c = $(_lhD("I2Nsb2Nr")); if (c) c.textContent = new Date().toLocaleTimeString(_lhD("dmktVk4="), { hour: _lhD("Mi1kaWdpdA=="), minute: _lhD("Mi1kaWdpdA==") }); }
function drawQr() {
const box = $(_lhD("I3Fy")); if (!box) return;
const url = (lan[0] || location.origin) + _lhD("Lw==");
try { box.innerHTML = qrSvg(url, { size: 132 }); box.title = url; } catch { box.innerHTML = _lhD("PHNwYW4gY2xhc3M9InhzIG11dGVkIj5LaMO0bmcgdOG6oW8gxJHGsOG7o2MgbcOjIFFSPC9zcGFuPg=="); }
}
boot();
