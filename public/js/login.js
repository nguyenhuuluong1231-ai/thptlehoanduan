const _lhD=(s)=>{try{return decodeURIComponent(escape(atob(s)));}catch{return atob(s);}};
import { api, session, setPortal, detect, getMode, showError, ApiError } from './core/api.js';
import { icon, drumArt } from './core/icons.js';
import { $, $$, esc, toast, store, modal, withBusy, initTheme, initDevToolsGuard, toggleTheme, sleep, avatar, apiBase, isNativeApp, installApp, aboutPortalHtml } from './core/ui.js';
initTheme(); initDevToolsGuard();
const root = $(_lhD("I3Jvb3Q="));
const urlPortal = new URLSearchParams(location.search).get(_lhD("cG9ydGFs"));
const portal = (document.body.dataset.portal === _lhD("c3RhZmY=") || document.body.dataset.portal === _lhD("YWRtaW4=") || urlPortal === _lhD("c3RhZmY=") || urlPortal === _lhD("YWRtaW4=")) ? _lhD("c3RhZmY=") : _lhD("c3R1ZGVudA==");
const STAFF = portal === _lhD("c3RhZmY=");
const IS_MOBILE = window.self !== window.top || isNativeApp() || /[?&]mobile/.test(location.search) || matchMedia(_lhD("KG1heC13aWR0aDogNzYwcHgp")).matches || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
if (IS_MOBILE && window.self === window.top && !isNativeApp() && !STAFF && !/\/mobile\/?$/i.test(location.pathname)) {
location.replace(_lhD("L21vYmlsZQ=="));
}
setPortal(portal);
document.title = IS_MOBILE
? _lhD("xJDEg25nIG5o4bqtcCDCtyBD4buVbmcgSOG7jWMgxJDGsOG7nW5nIFPhu5EgVHLGsOG7nW5nIFRIUFQgTMOqIEhvw6Bu")
: (STAFF ? _lhD("xJDEg25nIG5o4bqtcCBD4buVbmcgUXXhuqNuIFRy4buLICYgR2nDoW8gVmnDqm4gwrcgVHLGsOG7nW5nIFRIUFQgTMOqIEhvw6Bu") : _lhD("xJDEg25nIG5o4bqtcCBD4buVbmcgSOG7jWMgU2luaCDCtyBUcsaw4budbmcgVEhQVCBMw6ogSG/DoG4="));
let settings = null, captcha = null;
async function boot() {
root.innerHTML = _lhD("PGRpdiBzdHlsZT0ibWluLWhlaWdodDoxMDB2aDtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2dhcDoxNnB4O3BhZGRpbmc6MjRweDt0ZXh0LWFsaWduOmNlbnRlciI+PGltZyBzcmM9ImFzc2V0cy9zY2hvb2xfbG9nby5wbmciIGFsdD0iVHLGsOG7nW5nIFRIUFQgTMOqIEhvw6BuIiBzdHlsZT0id2lkdGg6OTZweDtoZWlnaHQ6OTZweDtvYmplY3QtZml0OmNvbnRhaW47Ym9yZGVyLXJhZGl1czo1MCU7YmFja2dyb3VuZDojZmZmO3BhZGRpbmc6NnB4O2JveC1zaGFkb3c6MCAxMnB4IDMycHggcmdiYSgyMyw3MSwyMDEsLjI4KSI+PGRpdiBzdHlsZT0iZm9udC13ZWlnaHQ6NzAwO2ZvbnQtc2l6ZToxNnB4Ij5Ucsaw4budbmcgVEhQVCBMw6ogSG/DoG48L2Rpdj48ZGl2IGNsYXNzPSJza2VsIiBzdHlsZT0id2lkdGg6MTgwcHg7aGVpZ2h0OjhweDtib3JkZXItcmFkaXVzOjk5cHgiPjwvZGl2PjwvZGl2Pg==");
await detect();
if (/[?&]switch=1/.test(location.search)) session.clear();
if (IS_MOBILE && !/[?&]switch=1/.test(location.search)) {
for (const p of (STAFF ? [_lhD("c3RhZmY="), _lhD("c3R1ZGVudA==")] : [_lhD("c3R1ZGVudA=="), _lhD("c3RhZmY=")])) {
setPortal(p);
if (!session.token) continue;
try {
const { user } = await api.get(_lhD("YXBpL2F1dGgvbWU="));
if (user) { go(user.role === _lhD("c3R1ZGVudA==") ? _lhD("c3R1ZGVudA==") : _lhD("c3RhZmY=")); return; }
} catch {  }
}
setPortal(portal);
}
if (!IS_MOBILE && !STAFF && getMode() === _lhD("c2VydmVy") && (location.pathname === _lhD("Lw==") || location.pathname === _lhD("L2luZGV4Lmh0bWw="))) {
try { history.replaceState(null, '', _lhD("L2xvZ2luaG9jaW5o") + location.search + location.hash); } catch {  }
}
try { settings = await api.get(_lhD("YXBpL3NldHRpbmdzL3B1YmxpYw==")); } catch { settings = { schoolName: _lhD("VHLGsOG7nW5nIFRIUFQgTMOqIEhvw6Bu"), slogan: '', logo: _lhD("YXNzZXRzL2xvZ28tbWFyay5zdmc="), hotlines: [] }; }
if (!IS_MOBILE) await loadCaptcha();
render();
}
async function loadCaptcha() {
if (IS_MOBILE) return;
try { captcha = await api.get(_lhD("YXBpL2F1dGgvY2FwdGNoYQ==")); } catch { captcha = null; }
const box = $(_lhD("I2NhcEltZw=="));
if (box) box.innerHTML = captcha ? captcha.svg : _lhD("PHNwYW4gY2xhc3M9InhzIG11dGVkIj5LaMO0bmcgdOG6o2kgxJHGsOG7o2MgbcOjIHjDoWMgbmjhuq1uPC9zcGFuPg==");
const code = $(_lhD("I2NhcA==")); if (code) code.value = '';
}
function renderStudentFooter(s) {
const creator = s.creatorName || _lhD("VsWpIE5ndXnhu4VuIEFuIEtoYW5n");
const intro = s.siteIntro || _lhD("Q+G7lW5nIEjhu41jIMSQxrDhu51uZyBT4buRIFRyxrDhu51uZyBUSFBUIEzDqiBIb8OgbiBsw6AgbuG7gW4gdOG6o25nIHRy4buxYyB0dXnhur9uIGjhu5cgdHLhu6MgaOG7jWMgc2luaCB04buRIGdpw6FjIHZpIHBo4bqhbSDhuqluIGRhbmgsIHTGsCB24bqlbiB0w6JtIGzDvSBo4buNYyDEkcaw4budbmcgMjQvNywga+G6v3QgbuG7kWkgdGjhuqd5IGPDtCwgdGhpIHRy4bqvYyBuZ2hp4buHbSBwaMOhcCBsdeG6rXQgdsOgIHTDrWNoIGjhu6NwIHRyw60gdHXhu4cgbmjDom4gdOG6oW8gKEFJKSBwaMOybmcgY2jhu5FuZyBs4burYSDEkeG6o28ga2jDtG5nIGdpYW4gbeG6oW5nLg==");
const phone = s.contactPhone || _lhD("MDI2OSAzODQ2IDM1OSDCtyBLaOG6qW4gY+G6pXA6IDExMQ==");
const email = s.contactEmail || _lhD("dGhwdGxlaG9hbkBzZ2RkdC5naWFsYWkuZ292LnZu");
const address = s.contactAddress || _lhD("xJDGsOG7nW5nIFRy4bqnbiBIxrBuZyDEkOG6oW8sIFRo4buLIHRy4bqlbiBDaMawIFR5LCBIdXnhu4duIMSQ4bupYyBDxqEsIFThu4luaCBHaWEgTGFpLCBWaeG7h3QgTmFt");
return `${_lhD("CiAgPGZvb3RlciBjbGFzcz0ibG9naW4tY29ycC1mb290ZXIiPgogICAgPGRpdiBjbGFzcz0ibGNmLWlubmVyIj4KICAgICAgPGRpdiBjbGFzcz0ibGNmLWJhci10b3AiPgogICAgICAgIDxkaXYgY2xhc3M9ImxjZi1vcmctaGVhZCI+CiAgICAgICAgICA8aW1nIHNyYz0i")}${esc(s.logo || _lhD("YXNzZXRzL2xvZ28tbWFyay5zdmc="))}${_lhD("IiBhbHQ9IiIgY2xhc3M9ImxjZi1vcmctbG9nbyI+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJsY2Ytb3JnLXRpdGxlcyI+CiAgICAgICAgICAgIDxoMyBjbGFzcz0ibGNmLW9yZy10aXRsZSI+")}${esc((s.schoolName || _lhD("VFLGr+G7nE5HIFRIUFQgTMOKIEhPw4BO")).toUpperCase())}${_lhD("PC9oMz4KICAgICAgICAgICAgPHNwYW4gY2xhc3M9ImxjZi1vcmctc3ViIj5T4bueIEdJw4FPIEThu6RDIFbDgCDEkMOATyBU4bqgTyBU4buITkggR0lBIExBSTwvc3Bhbj4KICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPHNwYW4gY2xhc3M9ImxjZi1oZWFkLXNlcCI+PC9zcGFuPgogICAgICAgICAgPGJ1dHRvbiB0eXBlPSJidXR0b24iIGNsYXNzPSJsY2YtY3JlYXRvci1waWxsIiBkYXRhLWxjZi1tb2RhbD0iYWJvdXQiIHRpdGxlPSJYZW0gZ2nhu5tpIHRoaeG7h3UgY2hpIHRp4bq/dCB24buBIHRyYW5nIHdlYiAmIHTDoWMgZ2nhuqMiPgogICAgICAgICAgICA=")}${icon(_lhD("c3BhcmtsZXM="))}${_lhD("IDxzcGFuPlRyYW5nIHdlYiBuw6B5IMSRxrDhu6NjIHThuqFvIGLhu59pIDxiPg==")}${esc(creator)}${_lhD("PC9iPjwvc3Bhbj4KICAgICAgICAgIDwvYnV0dG9uPgogICAgICAgIDwvZGl2PgoKICAgICAgICA8ZGl2IGNsYXNzPSJsY2Ytc29jaWFsLWJhciI+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJsY2Ytc29jaWFsLWdyb3VwIj4KICAgICAgICAgICAgPHNwYW4gY2xhc3M9ImxjZi1leWVicm93Ij5L4bq+VCBO4buQSSBOSMOAIFRSxq/hu5xORzwvc3Bhbj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0ibGNmLXNvY2lhbC1pY29ucyI+CiAgICAgICAgICAgICAgPGEgaHJlZj0i")}${esc(s.facebookUrl || _lhD("aHR0cHM6Ly9mYWNlYm9vay5jb20="))}${_lhD("IiB0YXJnZXQ9Il9ibGFuayIgcmVsPSJub29wZW5lciIgY2xhc3M9ImxjZi1zLWJ0biBmYiIgdGl0bGU9IkZhY2Vib29rIFRyxrDhu51uZyBUSFBUIEzDqiBIb8OgbiIgYXJpYS1sYWJlbD0iRmFjZWJvb2siPgogICAgICAgICAgICAgICAgPHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIj48cGF0aCBkPSJNMjIgMTJhMTAgMTAgMCAxIDAtMTEuNTYgOS44OHYtNi45OUg3LjlWMTJoMi41NFY5LjhjMC0yLjUgMS40OS0zLjg5IDMuNzgtMy44OSAxLjA5IDAgMi4yNC4yIDIuMjQuMnYyLjQ2aC0xLjI2Yy0xLjI0IDAtMS42My43Ny0xLjYzIDEuNTZWMTJoMi43N2wtLjQ0IDIuODloLTIuMzN2Ni45OUExMCAxMCAwIDAgMCAyMiAxMnoiLz48L3N2Zz4KICAgICAgICAgICAgICA8L2E+CiAgICAgICAgICAgICAgPGEgaHJlZj0i")}${esc(s.linkedinUrl || _lhD("aHR0cHM6Ly9naWFsYWkuZWR1LnZu"))}${_lhD("IiB0YXJnZXQ9Il9ibGFuayIgcmVsPSJub29wZW5lciIgY2xhc3M9ImxjZi1zLWJ0biBpbiIgdGl0bGU9IkxpbmtlZEluIC8gQ+G7lW5nIHRow7RuZyB0aW4gU+G7nyBHRCbEkFQgR2lhIExhaSIgYXJpYS1sYWJlbD0iTGlua2VkSW4gLyBT4bufIEdEJsSQVCI+CiAgICAgICAgICAgICAgICA8c3ZnIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiBmaWxsPSJjdXJyZW50Q29sb3IiPjxwYXRoIGQ9Ik0xOSAzQTIgMiAwIDAgMSAyMSA1djE0YTIgMiAwIDAgMS0yIDJINWEyIDIgMCAwIDEtMi0yVjVhMiAyIDAgMCAxIDItMmgxNG0tLjUgMTUuNXYtNS4zYTMuMjYgMy4yNiAwIDAgMC0zLjI2LTMuMjZjLS44NSAwLTEuODQuNTItMi4yOCAxLjN2LTEuMTFoLTIuNzl2OC4zN2gyLjc5di00LjkzYzAtLjc3LjYyLTEuNCAxLjM5LTEuNGExLjQgMS40IDAgMCAxIDEuNCAxLjR2NC45M2gyLjc1TTYuODggOC41NmExLjY4IDEuNjggMCAwIDAgMS42OC0xLjY4YzAtLjkzLS43NS0xLjY5LTEuNjgtMS42OWExLjY5IDEuNjkgMCAwIDAtMS42OSAxLjY5YzAgLjkzLjc2IDEuNjggMS42OSAxLjY4bTEuMzkgOS45NHYtOC4zN0g1LjV2OC4zN2gyLjc3eiIvPjwvc3ZnPgogICAgICAgICAgICAgIDwvYT4KICAgICAgICAgICAgICA8YSBocmVmPSI=")}${esc(s.zaloUrl || _lhD("aHR0cHM6Ly96YWxvLm1l"))}${_lhD("IiB0YXJnZXQ9Il9ibGFuayIgcmVsPSJub29wZW5lciIgY2xhc3M9ImxjZi1zLWJ0biB6bCIgdGl0bGU9IlphbG8gSOG7lyB0cuG7oyBI4buNYyDEkcaw4budbmciIGFyaWEtbGFiZWw9IlphbG8iPgogICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9ImZvbnQtd2VpZ2h0OjgwMDtmb250LXNpemU6MTBweDtsZXR0ZXItc3BhY2luZzotLjAyZW0iPlphbG88L3NwYW4+CiAgICAgICAgICAgICAgPC9hPgogICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzcz0ibGNmLWxhbmctYm94IiB0aXRsZT0iTmfDtG4gbmfhu68gaGnhu4NuIHRo4buLOiBUaeG6v25nIFZp4buHdCI+CiAgICAgICAgICAgIDxzdmcgdmlld0JveD0iMCAwIDI4IDIwIiB3aWR0aD0iMTgiIGhlaWdodD0iMTMiIHN0eWxlPSJib3JkZXItcmFkaXVzOjIuNXB4O2ZsZXg6bm9uZSI+PHJlY3Qgd2lkdGg9IjI4IiBoZWlnaHQ9IjIwIiBmaWxsPSIjZGEyNTFkIi8+PHBvbHlnb24gcG9pbnRzPSIxNCw0IDE1LjgsOS41IDIxLjUsOS41IDE2LjksMTIuOCAxOC42LDE4LjMgMTQsMTUgOS40LDE4LjMgMTEuMSwxMi44IDYuNSw5LjUgMTIuMiw5LjUiIGZpbGw9IiNmZmZmMDAiLz48L3N2Zz4KICAgICAgICAgICAgPHNwYW4+Vmnhu4d0IE5hbTwvc3Bhbj4KICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzcz0ibGNmLXZlcmlmaWVkLXBpbGwiIHRpdGxlPSLEkMOjIMSRxINuZyBrw70gJiB4w6FjIHRo4buxYyBo4buHIHRo4buRbmcgQ+G7lW5nIEjhu41jIMSQxrDhu51uZyBT4buRIj4KICAgICAgICAgICAgPHNwYW4gY2xhc3M9ImxjZi12LWljbyI+PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMi42IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSIvPjwvc3ZnPjwvc3Bhbj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0ibGNmLXYtdHh0Ij4KICAgICAgICAgICAgICA8Yj7EkMODIMSQxIJORyBLw508L2I+CiAgICAgICAgICAgICAgPHNwYW4+Q+G7lE5HIEjhu4xDIMSQxq/hu5xORyBT4buQPC9zcGFuPgogICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgIDwvZGl2PgogICAgICAgIDwvZGl2PgogICAgICA8L2Rpdj4KCiAgICAgIDxkaXYgY2xhc3M9ImxjZi1jYXJkcy1ncmlkIj4KICAgICAgICA8ZGl2IGNsYXNzPSJsY2YtaW5mby1jYXJkIGludHJvIj4KICAgICAgICAgIDxzcGFuIGNsYXNzPSJsY2YtaWMtaWNvIj4=")}${icon(_lhD("aW5mbw=="))}${_lhD("PC9zcGFuPgogICAgICAgICAgPGRpdiBjbGFzcz0ibGNmLWljLWJvZHkiPgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJsY2YtaWMtaGVhZCI+CiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9ImxjZi1pYy1sYmwiPkdJ4buaSSBUSEnhu4ZVIFRSQU5HIFdFQjwvc3Bhbj4KICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9ImJ1dHRvbiIgY2xhc3M9ImxjZi1pbnRyby1tb3JlIiBkYXRhLWxjZi1tb2RhbD0iYWJvdXQiPlhlbSBjaGkgdGnhur90IOKGkjwvYnV0dG9uPgogICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgPHAgY2xhc3M9ImxjZi1pYy1kZXNjIj4=")}${esc(intro)}${_lhD("PC9wPgogICAgICAgICAgPC9kaXY+CiAgICAgICAgPC9kaXY+CgogICAgICAgIDxkaXYgY2xhc3M9ImxjZi1pbmZvLWNhcmQiPgogICAgICAgICAgPHNwYW4gY2xhc3M9ImxjZi1pYy1pY28iPjxzdmcgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMTciIGhlaWdodD0iMTciIGZpbGw9ImN1cnJlbnRDb2xvciI+PHBhdGggZD0iTTYuNjIgMTAuNzlhMTUuMDUgMTUuMDUgMCAwIDAgNi41OSA2LjU5bDIuMi0yLjJhMSAxIDAgMCAxIDEuMDEtLjI0YzEuMTIuMzcgMi4zMy41NyAzLjU4LjU3YTEgMSAwIDAgMSAxIDFWMjBhMSAxIDAgMCAxLTEgMUMxMC42MSAyMSAzIDEzLjM5IDMgNGExIDEgMCAwIDEgMS0xaDMuNWExIDEgMCAwIDEgMSAxYzAgMS4yNS4yIDIuNDYuNTcgMy41OGExIDEgMCAwIDEtLjI1IDEuMDFsLTIuMiAyLjJ6Ii8+PC9zdmc+PC9zcGFuPgogICAgICAgICAgPGRpdiBjbGFzcz0ibGNmLWljLWJvZHkiPgogICAgICAgICAgICA8c3BhbiBjbGFzcz0ibGNmLWljLWxibCI+SE9UTElORSAmIEtI4bqoTiBD4bqkUCAyNC83PC9zcGFuPgogICAgICAgICAgICA8YiBjbGFzcz0ibGNmLWljLXZhbCI+")}${esc(phone)}${_lhD("PC9iPgogICAgICAgICAgICA8c3BhbiBjbGFzcz0ibGNmLWljLXN1YiI+VGnhur9wIG5o4bqtbiBo4buXIHRy4bujICYgdMawIHbhuqVuIHRy4buxYyB0dXnhur9uPC9zcGFuPgogICAgICAgICAgPC9kaXY+CiAgICAgICAgPC9kaXY+CgogICAgICAgIDxkaXYgY2xhc3M9ImxjZi1pbmZvLWNhcmQiPgogICAgICAgICAgPHNwYW4gY2xhc3M9ImxjZi1pYy1pY28iPjxzdmcgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMTciIGhlaWdodD0iMTciIGZpbGw9ImN1cnJlbnRDb2xvciI+PHBhdGggZD0iTTIwIDRINGEyIDIgMCAwIDAtMiAydjEyYTIgMiAwIDAgMCAyIDJoMTZhMiAyIDAgMCAwIDItMlY2YTIgMiAwIDAgMC0yLTJ6bTAgNC4yLTggNS04LTVWNmw4IDUgOC01djIuMnoiLz48L3N2Zz48L3NwYW4+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJsY2YtaWMtYm9keSI+CiAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJsY2YtaWMtbGJsIj5I4buYUCBUSMavIMSQSeG7hk4gVOG7rDwvc3Bhbj4KICAgICAgICAgICAgPGEgaHJlZj0ibWFpbHRvOg==")}${esc(email)}${_lhD("IiBjbGFzcz0ibGNmLWljLXZhbCBsaW5rIj4=")}${esc(email)}${_lhD("PC9hPgogICAgICAgICAgICA8c3BhbiBjbGFzcz0ibGNmLWljLXN1YiI+QmFuIEdpw6FtIGhp4buHdSAmIFThu5UgVMawIHbhuqVuIGjhu41jIMSRxrDhu51uZzwvc3Bhbj4KICAgICAgICAgIDwvZGl2PgogICAgICAgIDwvZGl2PgoKICAgICAgICA8ZGl2IGNsYXNzPSJsY2YtaW5mby1jYXJkIj4KICAgICAgICAgIDxzcGFuIGNsYXNzPSJsY2YtaWMtaWNvIj48c3ZnIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjE3IiBoZWlnaHQ9IjE3IiBmaWxsPSJjdXJyZW50Q29sb3IiPjxwYXRoIGQ9Ik0xMiAyQzguMTMgMiA1IDUuMTMgNSA5YzAgNS4yNSA3IDEzIDcgMTNzNy03Ljc1IDctMTNjMC0zLjg3LTMuMTMtNy03LTd6bTAgOS41QTIuNSAyLjUgMCAxIDEgMTIgNi41YTIuNSAyLjUgMCAwIDEgMCA1eiIvPjwvc3ZnPjwvc3Bhbj4KICAgICAgICAgIDxkaXYgY2xhc3M9ImxjZi1pYy1ib2R5Ij4KICAgICAgICAgICAgPHNwYW4gY2xhc3M9ImxjZi1pYy1sYmwiPsSQ4buKQSBDSOG7iCBOSMOAIFRSxq/hu5xORzwvc3Bhbj4KICAgICAgICAgICAgPGIgY2xhc3M9ImxjZi1pYy12YWwiPg==")}${esc(address)}${_lhD("PC9iPgogICAgICAgICAgICA8c3BhbiBjbGFzcz0ibGNmLWljLXN1YiI+U+G7nyBHacOhbyBk4bulYyB2w6AgxJDDoG8gdOG6oW8gdOG7iW5oIEdpYSBMYWk8L3NwYW4+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICA8L2Rpdj4KICAgICAgPC9kaXY+CiAgICA8L2Rpdj4KCiAgICA8ZGl2IGNsYXNzPSJsY2YtYm90Ij4KICAgICAgPGRpdiBjbGFzcz0ibGNmLWJvdC1pbm5lciI+CiAgICAgICAgPGRpdiBjbGFzcz0ibGNmLWNvcHkiPgogICAgICAgICAgPHNwYW4+wqkg")}${new Date().getFullYear()} ${esc(s.schoolName || _lhD("VHLGsOG7nW5nIFRIUFQgTMOqIEhvw6Bu"))}${_lhD("LiBBbGwgcmlnaHRzIHJlc2VydmVkPC9zcGFuPgogICAgICAgICAgPHNwYW4gY2xhc3M9InNlcCI+wrc8L3NwYW4+CiAgICAgICAgICA8YnV0dG9uIHR5cGU9ImJ1dHRvbiIgY2xhc3M9ImxjZi1wbGluayIgZGF0YS1sY2YtbW9kYWw9ImFib3V0Ij5HaeG7m2kgdGhp4buHdSB0cmFuZyB3ZWI8L2J1dHRvbj4KICAgICAgICAgIDxzcGFuIGNsYXNzPSJzZXAiPsK3PC9zcGFuPgogICAgICAgICAgPGJ1dHRvbiB0eXBlPSJidXR0b24iIGNsYXNzPSJsY2YtcGxpbmsiIGRhdGEtbGNmLW1vZGFsPSJ0ZXJtcyI+xJBp4buBdSBraG/huqNuICYgUGjDoXAgbMO9PC9idXR0b24+CiAgICAgICAgICA8c3BhbiBjbGFzcz0ic2VwIj7Ctzwvc3Bhbj4KICAgICAgICAgIDxidXR0b24gdHlwZT0iYnV0dG9uIiBjbGFzcz0ibGNmLXBsaW5rIiBkYXRhLWxjZi1tb2RhbD0icHJpdmFjeSI+Q2jDrW5oIHPDoWNoIGLhuqNvIHbhu4cgZOG7ryBsaeG7h3UgY8OhIG5ow6JuPC9idXR0b24+CiAgICAgICAgICA8c3BhbiBjbGFzcz0ic2VwIj7Ctzwvc3Bhbj4KICAgICAgICAgIDxidXR0b24gdHlwZT0iYnV0dG9uIiBjbGFzcz0ibGNmLXBsaW5rIiBkYXRhLWxjZi1tb2RhbD0iY29va2llcyI+Q8OgaSDEkeG6t3QgY29va2llczwvYnV0dG9uPgogICAgICAgIDwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9ImxjZi1ib3QtcmlnaHQiPgogICAgICAgICAgPHNwYW4+VHJhbmcgd2ViIG7DoHkgxJHGsOG7o2MgdOG6oW8gYuG7n2kgPGI+")}${esc(creator)}${_lhD("PC9iPjwvc3Bhbj4KICAgICAgICA8L2Rpdj4KICAgICAgPC9kaXY+CiAgICA8L2Rpdj4KICA8L2Zvb3Rlcj4=")}`;
}
function render() {
if (IS_MOBILE) return renderMobile();
const s = settings;
const studentHref = getMode() === _lhD("c2VydmVy") ? _lhD("L2xvZ2luaG9jaW5o") : _lhD("Li8=");
const staffHref = getMode() === _lhD("c2VydmVy") ? _lhD("L3F1YW4tdHJp") : _lhD("c3RhZmYuaHRtbA==");
const homeHref = STAFF ? staffHref : studentHref;
const heroPoints = STAFF
? [[_lhD("c2hpZWxkQWxlcnQ="), _lhD("WOG7rSBsw70gdOG7kSBnacOhYw=="), _lhD("VGnhur9wIG5o4bqtbiwgeMOhYyBtaW5oICYgcGjhuqNuIGjhu5Np")], [_lhD("aGVhcnRIYW5k"), _lhD("VMawIHbhuqVuICYgY2hhdA=="), _lhD("SOG7mXAgdGjGsCB0w6JtIGzDvSAmIGNoYXQgcmVhbHRpbWU=")], [_lhD("c2lyZW4="), _lhD("QUkgR3VhcmQgY+G6o25oIGLDoW8="), _lhD("UGjDoXQgaGnhu4duIHPhu5ttIGto4bunbmcgaG/huqNuZywgbOG7q2EgxJHhuqNv")], [_lhD("ZG93bmxvYWQ="), _lhD("QsOhbyBjw6FvICYgRXhjZWw="), _lhD("VGjhu5FuZyBrw6osIGto4bqjbyBzw6F0ICYgeHXhuqV0IGThu68gbGnhu4d1")]]
: [[_lhD("c2hpZWxkQ2hlY2s="), _lhD("VOG7kSBnacOhYyDhuqluIGRhbmg="), _lhD("QuG6o28gbeG6rXQgZGFuaCB0w61uaCwgdGhlbyBkw7VpIHRp4bq/biDEkeG7mQ==")], [_lhD("dHJvcGh5"), _lhD("xJDhuqV1IHRyxrDhu51uZyAmIGto4bqjbyBzw6F0"), _lhD("VGhpIHRy4bqvYyBuZ2hp4buHbSBwaMOhcCBsdeG6rXQsIGfDs3Agw70=")], [_lhD("aGVhcnRIYW5k"), _lhD("VMawIHbhuqVuIHTDom0gbMO9IDI0Lzc="), _lhD("Tmjhuq9uIHJpw6puZyBjaHV5w6puIHZpw6puLCBuaOG6rXQga8O9IGPhuqNtIHjDumM=")], [_lhD("c3BhcmtsZXM="), _lhD("QUkgY2jhu5FuZyBs4burYSDEkeG6o28="), _lhD("UXXDqXQgdGluIG5o4bqvbiwgbGluaywgU8SQVCwgdMOgaSBraG/huqNu")]];
root.innerHTML = `${_lhD("CiAgPGRpdiBjbGFzcz0iYXV0aCA=")}${STAFF ? _lhD("YXV0aC1zdGFmZg==") : _lhD("YXV0aC1zdHVkZW50LXdlYg==")}${_lhD("Ij4KICAgIDxkaXYgY2xhc3M9ImF1dGgtYm94Ij4KICAgICAgPHNlY3Rpb24gY2xhc3M9ImF1dGgtaGVybyI+CiAgICAgICAg")}${drumArt(420, _lhD("ZHJ1bQ=="))}${_lhD("CiAgICAgICAgPGRpdiBjbGFzcz0iYXV0aC1oZXJvLXRvcCI+CiAgICAgICAgICA8YSBjbGFzcz0iYnJhbmQiIGhyZWY9Ig==")}${homeHref}${_lhD("Ij48aW1nIHNyYz0i")}${esc(s.logo)}${_lhD("IiBhbHQ9IiI+PGRpdj48Yj4=")}${esc(s.schoolName)}${_lhD("PC9iPjxzcGFuPg==")}${esc(s.slogan || _lhD("VHLGsOG7nW5nIGjhu41jIGFuIHRvw6BuIMK3IFRow6JuIHRoaeG7h24gwrcgSOG6oW5oIHBow7pj"))}${_lhD("PC9zcGFuPjwvZGl2PjwvYT4KICAgICAgICAgIDxzcGFuIGNsYXNzPSJhdXRoLXNlbS1waWxsIj48c3BhbiBjbGFzcz0icHVsc2UiPjwvc3Bhbj4=")}${esc(s.semester || _lhD("SOG7jWMga+G7syBJ"))}${_lhD("IMK3IA==")}${esc(s.schoolYear || _lhD("MjAyNiDigJMgMjAyNw=="))}${_lhD("PC9zcGFuPgogICAgICAgIDwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9ImF1dGgtaGVyby1taWQiPgogICAgICAgICAg")}${STAFF ? `${_lhD("PGgxPkPhu5VuZyBRdeG6o24gVHLhu4sgJiBHacOhbyBWacOqbi48YnI+PGVtPlF14bqjbiBsw70gaOG7jWMgxJHGsOG7nW5nPC9lbT4gYW4gdG/DoG4sIGvhu4twIHRo4budaS48L2gxPgogICAgICAgICAgPHAgY2xhc3M9ImxlYWQiPkTDoG5oIHJpw6puZyBjaG8gQmFuIEdpw6FtIGhp4buHdSwgcXXhuqNuIHRy4buLIHZpw6puLCBnacOhbyB2acOqbiB2w6AgY2h1ecOqbiB2acOqbiB0w6JtIGzDvTogdGnhur9wIG5o4bqtbiB04buRIGdpw6FjLCB0xrAgduG6pW4gaOG7jWMgc2luaCwgZ2nDoW0gc8OhdCBj4bqjbmggYsOhbyBBSSB2w6AgxJFp4buBdSBow6BuaCBo4buHIHRo4buRbmcuPC9wPg==")}`
: `${_lhD("PGgxPkPhu5VuZyBI4buNYyDEkMaw4budbmcgU+G7kS48YnI+PGVtPkjhu41jIHThuq1wIGFuIHTDom0sPC9lbT4gdHLGsOG7nW5nIGjhu41jIGFuIHRvw6BuLjwvaDE+CiAgICAgICAgICA8cCBjbGFzcz0ibGVhZCI+VOG7kSBnacOhYyDhuqluIGRhbmgsIHTGsCB24bqlbiB0w6JtIGzDvSwgY2hhdCB24bubaSB0aOG6p3kgY8O0LCDEkeG6pXUgdHLGsOG7nW5nIHRy4bqvYyBuZ2hp4buHbSBwaMOhcCBsdeG6rXQsIGto4bqjbyBzw6F0IHbDoCB0cuG7oyBsw70gQUkgY2jhu5FuZyBs4burYSDEkeG6o28uPC9wPg==")}`}${_lhD("CiAgICAgICAgPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0iYXV0aC1wb2ludHMiPgogICAgICAgICAg")}${heroPoints.map(([i, t, d], k) => `${_lhD("PGRpdiBjbGFzcz0iYXV0aC1wb2ludCA=")}${k > 1 ? _lhD("aGlkZS1zbQ==") : ''}${_lhD("Ij48c3BhbiBjbGFzcz0iYXAtaWNvIj4=")}${icon(i)}${_lhD("PC9zcGFuPjxkaXY+PGI+")}${t}${_lhD("PC9iPjxzcGFuPg==")}${d}${_lhD("PC9zcGFuPjwvZGl2PjwvZGl2Pg==")}`).join('')}${_lhD("CiAgICAgICAgPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0iZm9vdCI+CiAgICAgICAgICA8c3Bhbj4=")}${icon(_lhD("cGhvbmU="))}${_lhD("IEto4bqpbiBj4bqlcDogPGIgc3R5bGU9ImNvbG9yOiNmZmYiPjExMTwvYj4gKDI0LzcpPC9zcGFuPgogICAgICAgICAgPHNwYW4+")}${icon(_lhD("aW5mbw=="))}${_lhD("IDxidXR0b24gdHlwZT0iYnV0dG9uIiBjbGFzcz0ibGNmLXBsaW5rIiBkYXRhLWxjZi1tb2RhbD0iYWJvdXQiIHN0eWxlPSJjb2xvcjojZmZmO2ZvbnQtd2VpZ2h0OjYwMCI+R2nhu5tpIHRoaeG7h3UgdHJhbmcgd2ViPC9idXR0b24+PC9zcGFuPgogICAgICAgICAgPHNwYW4+")}${icon(_lhD("c21hcnRwaG9uZQ=="))}${_lhD("IDxhIGhyZWY9InBob25lLmh0bWwiIHN0eWxlPSJjb2xvcjojZmZmIj5BcHAgxJFp4buHbiB0aG/huqFpPC9hPjwvc3Bhbj4KICAgICAgICAgIDxzcGFuPg==")}${icon(_lhD("Y29kZQ=="))}${_lhD("IDxhIGhyZWY9ImRvY3MuaHRtbCIgc3R5bGU9ImNvbG9yOiNmZmYiPlJFU1QgQVBJPC9hPjwvc3Bhbj4KICAgICAgICA8L2Rpdj4KICAgICAgPC9zZWN0aW9uPgogICAgICA8c2VjdGlvbiBjbGFzcz0iYXV0aC1wYW5lbCI+CiAgICAgICAgPGRpdiBjbGFzcz0iYXV0aC1jYXJkIj4KICAgICAgICAgIDxkaXYgY2xhc3M9ImF1dGgtdG9wLWJhciI+CiAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJiYWRnZSBpbmZvIiBzdHlsZT0iaGVpZ2h0OjMwcHg7cGFkZGluZzowIDEycHg7Zm9udC1zaXplOjEycHgiPg==")}${icon(STAFF ? _lhD("c2hpZWxk") : _lhD("Z3JhZA=="))} ${STAFF ? _lhD("RMOgbmggY2hvIFF14bqjbiB0cuG7iyAmIEdpw6FvIHZpw6pu") : _lhD("RMOgbmggY2hvIEjhu41jIHNpbmg=")}${_lhD("PC9zcGFuPgogICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJpY29uLWJ0biBzbSIgaWQ9InRoZW1lIiBhcmlhLWxhYmVsPSLEkOG7lWkgZ2lhbyBkaeG7h24gc8OhbmcvdOG7kWkiIHRpdGxlPSLEkOG7lWkgZ2lhbyBkaeG7h24gc8OhbmcvdOG7kWkiPg==")}${icon(_lhD("bW9vbg=="))}${_lhD("PC9idXR0b24+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICAgIDxkaXYgaWQ9ImNvbnQiPjwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzcz0iYXV0aC1oZWFkIj4KICAgICAgICAgICAgPGgyPg==")}${STAFF ? _lhD("Q+G7lW5nIFF14bqjbiBUcuG7iyAmIEdpw6FvIFZpw6pu") : _lhD("Q+G7lW5nIEjhu41jIFNpbmg=")}${_lhD("PC9oMj4KICAgICAgICAgICAgPHAgY2xhc3M9Im11dGVkIj4=")}${STAFF ? _lhD("xJDEg25nIG5o4bqtcCBi4bqxbmcgdMOgaSBraG/huqNuIHF14bqjbiB0cuG7iyBob+G6t2MgbcOjIGdpw6FvIHZpw6puLg==") : _lhD("xJDEg25nIG5o4bqtcCBi4bqxbmcgbcOjIGjhu41jIHNpbmggKE1TSFMpIGRvIG5ow6AgdHLGsOG7nW5nIGPhuqVwLg==")}${_lhD("PC9wPgogICAgICAgICAgPC9kaXY+CiAgICAgICAgICA8Zm9ybSBpZD0iZiIgY2xhc3M9ImF1dGgtZm9ybSIgbm92YWxpZGF0ZT4KICAgICAgICAgICAgPGRpdiBjbGFzcz0iZmllbGQiPjxsYWJlbCBmb3I9InUiPg==")}${STAFF ? _lhD("VMOgaSBraG/huqNuIHF14bqjbiB0cuG7iyAvIE3DoyBnacOhbyB2acOqbg==") : _lhD("TcOjIGjhu41jIHNpbmggKE1TSFMp")}${_lhD("PC9sYWJlbD4KICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJpbnB1dC1pY29uIj4=")}${icon(STAFF ? _lhD("c2hpZWxk") : _lhD("dXNlcg=="))}${_lhD("PGlucHV0IGlkPSJ1IiBuYW1lPSJ1c2VybmFtZSIgYXV0b2NvbXBsZXRlPSJ1c2VybmFtZSIgaW5wdXRtb2RlPSI=")}${STAFF ? _lhD("dGV4dA==") : _lhD("bnVtZXJpYw==")}${_lhD("IiBwbGFjZWhvbGRlcj0i")}${STAFF ? _lhD("VsOtIGThu6U6IGFkbWluIGhv4bq3YyBHVjIwMjQwODk=") : _lhD("VsOtIGThu6U6IDIxMjYyMjAwMDQ=")}${_lhD("IiB2YWx1ZT0i")}${esc(store.get(_lhD("bGhfcmVtZW1iZXJf") + portal, ''))}${_lhD("IiByZXF1aXJlZD48L2Rpdj48L2Rpdj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0iZmllbGQiPjxsYWJlbCBmb3I9InAiPk3huq10IGto4bqpdTwvbGFiZWw+CiAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iaW5wdXQtaWNvbiI+")}${icon(_lhD("bG9jaw=="))}${_lhD("PGlucHV0IGlkPSJwIiBuYW1lPSJwYXNzd29yZCIgdHlwZT0icGFzc3dvcmQiIGF1dG9jb21wbGV0ZT0iY3VycmVudC1wYXNzd29yZCIgcGxhY2Vob2xkZXI9Ik5o4bqtcCBt4bqtdCBraOG6qXUiIHJlcXVpcmVkPjxidXR0b24gdHlwZT0iYnV0dG9uIiBjbGFzcz0iYnRuIGljb24gZ2hvc3Qgc20gc3VmZml4IiBpZD0iZXllIiBhcmlhLWxhYmVsPSJIaeG7h24gbeG6rXQga2jhuql1IiBzdHlsZT0iYm9yZGVyOjAiPg==")}${icon(_lhD("ZXll"))}${_lhD("PC9idXR0b24+PC9kaXY+PC9kaXY+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9ImZpZWxkIj48bGFiZWwgZm9yPSJjYXAiPk3DoyB4w6FjIG5o4bqtbjwvbGFiZWw+CiAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iY2FwdGNoYS1yb3ciPjxzcGFuIGNsYXNzPSJjYXB0Y2hhLWltZyIgaWQ9ImNhcEltZyIgYXJpYS1saXZlPSJwb2xpdGUiPg==")}${captcha ? captcha.svg : ''}${_lhD("PC9zcGFuPjxidXR0b24gdHlwZT0iYnV0dG9uIiBjbGFzcz0iYnRuIGljb24gZ2hvc3Qgc20iIGlkPSJjYXBSZWZyZXNoIiBhcmlhLWxhYmVsPSJM4bqleSBtw6Mga2jDoWMiIHRpdGxlPSJM4bqleSBtw6Mga2jDoWMiPg==")}${icon(_lhD("cmVmcmVzaA=="))}${_lhD("PC9idXR0b24+PGlucHV0IGlkPSJjYXAiIG5hbWU9ImNhcHRjaGEiIGlucHV0bW9kZT0ibnVtZXJpYyIgYXV0b2NvbXBsZXRlPSJvZmYiIG1heGxlbmd0aD0iNSIgcGxhY2Vob2xkZXI9Ik5o4bqtcCA1IHPhu5EiIHJlcXVpcmVkPjwvZGl2PjwvZGl2PgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJyb3cgYmV0d2VlbiBhdXRoLW1ldGEtcm93Ij48bGFiZWwgY2xhc3M9InN3aXRjaCI+PGlucHV0IHR5cGU9ImNoZWNrYm94IiBpZD0icmVtIiBjaGVja2VkPjxzcGFuIGNsYXNzPSJ0cmFjayI+PC9zcGFuPjxzcGFuIGNsYXNzPSJzbWFsbCI+R2hpIG5o4bubIMSRxINuZyBuaOG6rXA8L3NwYW4+PC9sYWJlbD48YnV0dG9uIHR5cGU9ImJ1dHRvbiIgY2xhc3M9ImJ0biBwbGFpbiBzbSIgaWQ9ImZvcmdvdCI+UXXDqm4gbeG6rXQga2jhuql1PzwvYnV0dG9uPjwvZGl2PgogICAgICAgICAgICA8ZGl2IGlkPSJlcnIiIGNsYXNzPSJiYWRnZSBiYWQiIGhpZGRlbiBzdHlsZT0iaGVpZ2h0OmF1dG87cGFkZGluZzo4cHggMTJweDt3aGl0ZS1zcGFjZTpub3JtYWw7Ym9yZGVyLXJhZGl1czoxMHB4Ij48L2Rpdj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0iYXV0aC1hY3Rpb25zIj4KICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYmxvY2sgYXV0aC1zdWJtaXQiIGlkPSJnbyI+")}${icon(_lhD("YXJyb3dSaWdodA=="))}${_lhD("IMSQxINuZyBuaOG6rXA8L2J1dHRvbj4KICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICA8L2Zvcm0+CiAgICAgICAgPC9kaXY+CiAgICAgIDwvc2VjdGlvbj4KICAgIDwvZGl2PgogICAg")}${!STAFF ? renderStudentFooter(s) : ''}${_lhD("CiAgPC9kaXY+CiAg")}${getMode() === _lhD("ZGVtbw==") ? `${_lhD("PGRpdiBjbGFzcz0iZGVtby1yaWJib24iPjxpPjwvaT5C4bqjbiB4ZW0gdHLGsOG7m2MgwrcgZOG7ryBsaeG7h3UgbMawdSB0csOqbiB0csOsbmggZHV54buHdCBuw6B5PC9kaXY+")}` : ''}`;
bind();
showContinue();
}
function renderMobile() {
const s = settings;
const savedUser = store.get(_lhD("bGhfcmVtZW1iZXJfdXNlcg=="), '') || store.get(_lhD("bGhfcmVtZW1iZXJfc3R1ZGVudA=="), '') || store.get(_lhD("bGhfcmVtZW1iZXJfc3RhZmY="), '');
root.innerHTML = `${_lhD("CiAgPGRpdiBjbGFzcz0iYXV0aCBhdXRoLW1vYmlsZSI+CiAgICA8aGVhZGVyIGNsYXNzPSJtLWxvZ2luLWhlcm8iPgogICAgICA8ZGl2IGNsYXNzPSJtLWxvZ2luLXRvcCI+CiAgICAgICAgPGEgY2xhc3M9Im0tbG9naW4tYnJhbmQiIGhyZWY9Ii4vIj4KICAgICAgICAgIDxpbWcgc3JjPSI=")}${esc(s.logo)}${_lhD("IiBhbHQ9IiI+CiAgICAgICAgICA8ZGl2PgogICAgICAgICAgICA8Yj4=")}${esc(s.schoolName)}${_lhD("PC9iPgogICAgICAgICAgICA8c3Bhbj5D4buVbmcgSOG7jWMgxJDGsOG7nW5nIFPhu5Egwrcg")}${esc(s.schoolYear || _lhD("MjAyNiDigJMgMjAyNw=="))}${_lhD("PC9zcGFuPgogICAgICAgICAgPC9kaXY+CiAgICAgICAgPC9hPgogICAgICAgIDxidXR0b24gY2xhc3M9Imljb24tYnRuIG0tbG9naW4tdGhlbWUiIGlkPSJ0aGVtZSIgYXJpYS1sYWJlbD0ixJDhu5VpIGdpYW8gZGnhu4duIHPDoW5nL3Thu5FpIj4=")}${icon(_lhD("bW9vbg=="))}${_lhD("PC9idXR0b24+CiAgICAgIDwvZGl2PgogICAgPC9oZWFkZXI+CiAgICA8c2VjdGlvbiBjbGFzcz0ibS1sb2dpbi1ib2R5Ij4KICAgICAgPGRpdiBjbGFzcz0ibS1sb2dpbi1jYXJkIj4KICAgICAgICA8ZGl2IGNsYXNzPSJtLWxvZ2luLXBpbGxzIj4KICAgICAgICAgIDxzcGFuIGNsYXNzPSJtLWxvZ2luLXBpbGwiPg==")}${icon(_lhD("Z3JhZA=="))}${_lhD("IEjhu41jIHNpbmg8L3NwYW4+CiAgICAgICAgICA8c3BhbiBjbGFzcz0ibS1sb2dpbi1waWxsIj4=")}${icon(_lhD("c2Nob29s"))}${_lhD("IEdpw6FvIHZpw6puPC9zcGFuPgogICAgICAgICAgPHNwYW4gY2xhc3M9Im0tbG9naW4tcGlsbCI+")}${icon(_lhD("c2hpZWxk"))}${_lhD("IFF14bqjbiB0cuG7izwvc3Bhbj4KICAgICAgICA8L2Rpdj4KICAgICAgICA=")}${isNativeApp() ? `${_lhD("PGJ1dHRvbiB0eXBlPSJidXR0b24iIGNsYXNzPSJzZXJ2ZXItY2FyZCIgaWQ9InNydiI+")}${icon(_lhD("Z2xvYmU="))}${_lhD("PGRpdiBjbGFzcz0iZ3JvdyIgc3R5bGU9Im1pbi13aWR0aDowIj48ZGl2IGNsYXNzPSJ4cyBtdXRlZCI+TcOheSBjaOG7pyB0csaw4budbmc8L2Rpdj48YiBjbGFzcz0ic21hbGwgdHJ1bmNhdGUiPg==")}${getMode() === _lhD("c2VydmVy") ? esc(apiBase()) : _lhD("Q2jGsGEga+G6v3QgbuG7kWkgwrcgxJFhbmcgZMO5bmcgYuG6o24gdHLhuqNpIG5naGnhu4dt")}${_lhD("PC9iPjwvZGl2PjxzcGFuIGNsYXNzPSJidG4gcGxhaW4gc20iPsSQ4buVaTwvc3Bhbj48L2J1dHRvbj4=")}` : ''}${_lhD("CiAgICAgICAgPGRpdiBpZD0iY29udCI+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibS1sb2dpbi1oZWFkIj4KICAgICAgICAgIDxoMj7EkMSDbmcgbmjhuq1wIGjhu4cgdGjhu5FuZzwvaDI+CiAgICAgICAgICA8cD5Ew7luZyBjaHVuZyBjaG8gSOG7jWMgc2luaCwgR2nDoW8gdmnDqm4gJiBRdeG6o24gdHLhu4sgdmnDqm48L3A+CiAgICAgICAgPC9kaXY+CiAgICAgICAgPGZvcm0gaWQ9ImYiIGNsYXNzPSJtLWxvZ2luLWZvcm0iIG5vdmFsaWRhdGU+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJmaWVsZCI+CiAgICAgICAgICAgIDxsYWJlbCBmb3I9InUiPlTDoGkga2hv4bqjbjwvbGFiZWw+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9ImlucHV0LWljb24iPg==")}${icon(_lhD("dXNlcg=="))}${_lhD("PGlucHV0IGlkPSJ1IiBuYW1lPSJ1c2VybmFtZSIgYXV0b2NvbXBsZXRlPSJ1c2VybmFtZSIgcGxhY2Vob2xkZXI9Ik3DoyBIUywgbcOjIEdWIGhv4bq3YyBhZG1pbiIgdmFsdWU9Ig==")}${esc(savedUser)}${_lhD("IiByZXF1aXJlZD48L2Rpdj4KICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzcz0iZmllbGQiPgogICAgICAgICAgICA8bGFiZWwgZm9yPSJwIj5N4bqtdCBraOG6qXU8L2xhYmVsPgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJpbnB1dC1pY29uIj4=")}${icon(_lhD("bG9jaw=="))}${_lhD("PGlucHV0IGlkPSJwIiBuYW1lPSJwYXNzd29yZCIgdHlwZT0icGFzc3dvcmQiIGF1dG9jb21wbGV0ZT0iY3VycmVudC1wYXNzd29yZCIgcGxhY2Vob2xkZXI9Ik5o4bqtcCBt4bqtdCBraOG6qXUiIHJlcXVpcmVkPjxidXR0b24gdHlwZT0iYnV0dG9uIiBjbGFzcz0iYnRuIGljb24gZ2hvc3Qgc20gc3VmZml4IiBpZD0iZXllIiBhcmlhLWxhYmVsPSJIaeG7h24gbeG6rXQga2jhuql1IiBzdHlsZT0iYm9yZGVyOjAiPg==")}${icon(_lhD("ZXll"))}${_lhD("PC9idXR0b24+PC9kaXY+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICAgIDxkaXYgY2xhc3M9InJvdyBiZXR3ZWVuIG0tbG9naW4tbWV0YSI+CiAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0ic3dpdGNoIj48aW5wdXQgdHlwZT0iY2hlY2tib3giIGlkPSJyZW0iIGNoZWNrZWQ+PHNwYW4gY2xhc3M9InRyYWNrIj48L3NwYW4+PHNwYW4gY2xhc3M9InNtYWxsIj5HaGkgbmjhu5s8L3NwYW4+PC9sYWJlbD4KICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPSJidXR0b24iIGNsYXNzPSJidG4gcGxhaW4gc20iIGlkPSJmb3Jnb3QiPlF1w6puIG3huq10IGto4bqpdT88L2J1dHRvbj4KICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPGRpdiBpZD0iZXJyIiBjbGFzcz0iYmFkZ2UgYmFkIiBoaWRkZW4gc3R5bGU9ImhlaWdodDphdXRvO3BhZGRpbmc6N3B4IDEwcHg7d2hpdGUtc3BhY2U6bm9ybWFsO2JvcmRlci1yYWRpdXM6MTBweDtmb250LXNpemU6MTJweCI+PC9kaXY+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJtLWxvZ2luLWFjdGlvbnMiPgogICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYmxvY2sgbS1idG4tc3VibWl0IiBpZD0iZ28iPg==")}${icon(_lhD("YXJyb3dSaWdodA=="))}${_lhD("IMSQxINuZyBuaOG6rXA8L2J1dHRvbj4KICAgICAgICAgIDwvZGl2PgogICAgICAgIDwvZm9ybT4KICAgICAgPC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9Im0tbG9naW4tZm9vdCI+CiAgICAgICAgPHNwYW4+")}${icon(_lhD("cGhvbmU="))}${_lhD("IEto4bqpbiBj4bqlcDogPGI+MTExPC9iPiAoMjQvNyk8L3NwYW4+CiAgICAgICAgPHNwYW4+wrc8L3NwYW4+CiAgICAgICAgPGJ1dHRvbiB0eXBlPSJidXR0b24iIGNsYXNzPSJsY2YtcGxpbmsiIGRhdGEtbGNmLW1vZGFsPSJhYm91dCIgc3R5bGU9ImZvbnQtc2l6ZToxMnB4O2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjp2YXIoLS1icmFuZCkiPkdp4bubaSB0aGnhu4d1IMK3IFThuqFvIGLhu59pIA==")}${esc(s.creatorName || _lhD("VsWpIE5ndXnhu4VuIEFuIEtoYW5n"))}${_lhD("PC9idXR0b24+CiAgICAgIDwvZGl2PgogICAgPC9zZWN0aW9uPgogIDwvZGl2PgogIA==")}${getMode() === _lhD("ZGVtbw==") ? `${_lhD("PGRpdiBjbGFzcz0iZGVtby1yaWJib24iPjxpPjwvaT4=")}${isNativeApp() ? _lhD("QuG6o24gdHLhuqNpIG5naGnhu4dtIMK3IGThu68gbGnhu4d1IGzGsHUgdHLDqm4gbcOheSBuw6B5") : _lhD("QuG6o24geGVtIHRyxrDhu5tjIMK3IGThu68gbGnhu4d1IGzGsHUgdHLDqm4gdHLDrG5oIGR1eeG7h3QgbsOgeQ==")}${_lhD("PC9kaXY+")}` : ''}`;
bind();
showContinue();
}
async function showContinue() {
const list = [portal];
for (const p of list) {
setPortal(p);
if (!session.token) continue;
try {
const { user } = await api.get(_lhD("YXBpL2F1dGgvbWU="));
if (!IS_MOBILE) {
if (!STAFF && user.role !== _lhD("c3R1ZGVudA==")) continue;
if (STAFF && user.role === _lhD("c3R1ZGVudA==")) continue;
}
const el = $(_lhD("I2NvbnQ="));
if (!el) return;
el.innerHTML = `${_lhD("PGJ1dHRvbiBjbGFzcz0iZGVtby1hY2MiIHN0eWxlPSJ3aWR0aDoxMDAlO2JvcmRlci1jb2xvcjp2YXIoLS1icmFuZC1saW5lKTtiYWNrZ3JvdW5kOnZhcigtLWJyYW5kLXNvZnQpO3BhZGRpbmc6OHB4IDEwcHgiIGlkPSJjb250QnRuIj4=")}${avatar(user)}${_lhD("PGRpdiBjbGFzcz0iZ3JvdyIgc3R5bGU9Im1pbi13aWR0aDowIj48ZGl2IGNsYXNzPSJ4cyBtdXRlZCI+xJBhbmcgxJHEg25nIG5o4bqtcDwvZGl2PjxiIGNsYXNzPSJzbWFsbCB0cnVuY2F0ZSIgc3R5bGU9ImRpc3BsYXk6YmxvY2siPg==")}${esc(user.name)}${_lhD("PC9iPjwvZGl2PjxzcGFuIGNsYXNzPSJidG4gc20iPlRp4bq/cCB04bulYyA=")}${icon(_lhD("YXJyb3dSaWdodA=="))}${_lhD("PC9zcGFuPjwvYnV0dG9uPg==")}`;
$(_lhD("I2NvbnRCdG4=")).onclick = () => go(user.role === _lhD("c3R1ZGVudA==") ? _lhD("c3R1ZGVudA==") : _lhD("c3RhZmY="));
break;
} catch {  }
}
setPortal(portal);
}
function serverDialog() {
modal({ title: _lhD("S+G6v3QgbuG7kWkgbcOheSBjaOG7pyB0csaw4budbmc="), sub: _lhD("QXBwIGTDuW5nIGNodW5nIHTDoGkga2hv4bqjbiB2w6AgZOG7ryBsaeG7h3UgduG7m2kgdHJhbmcgd2ViIGPhu6dhIHRyxrDhu51uZw=="),
body: `${_lhD("PGRpdiBjbGFzcz0iZmllbGQiPjxsYWJlbCBmb3I9InNydlVybCI+xJDhu4thIGNo4buJIG3DoXkgY2jhu6c8L2xhYmVsPjxpbnB1dCBpZD0ic3J2VXJsIiBjbGFzcz0iaW5wdXQiIGlucHV0bW9kZT0idXJsIiBhdXRvY29tcGxldGU9InVybCIgcGxhY2Vob2xkZXI9IlbDrSBk4bulOiBodHRwczovL2xlaG9hbi5lZHUudm4gaG/hurdjIGh0dHA6Ly8xOTIuMTY4LjEuMTA6MzAwMCIgdmFsdWU9Ig==")}${esc(apiBase())}${_lhD("Ij48c3BhbiBjbGFzcz0iaGludCI+SOG7j2kgdGjhuqd5IGPDtCBwaOG7pSB0csOhY2ggxJHhu4MgbOG6pXkgxJHhu4thIGNo4buJLiDEkGnhu4duIHRob+G6oWkgY+G6p24gY8O5bmcgbeG6oW5nIFdpLUZpIG7hur91IG3DoXkgY2jhu6cgxJHhurd0IHRyb25nIHRyxrDhu51uZy48L3NwYW4+PC9kaXY+PGRpdiBpZD0ic3J2TXNnIiBjbGFzcz0ic21hbGwiPjwvZGl2Pg==")}`,
foot: _lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIGdob3N0IiBpZD0ic3J2RGVtbyI+RMO5bmcgYuG6o24gdHLhuqNpIG5naGnhu4dtPC9idXR0b24+PGJ1dHRvbiBjbGFzcz0iYnRuIiBpZD0ic3J2U2F2ZSI+S2nhu4NtIHRyYSAmIGzGsHU8L2J1dHRvbj4="),
onMount: (m) => {
$(_lhD("I3NydkRlbW8="), m).onclick = () => { store.set(_lhD("bGhfYXBpX2Jhc2U="), ''); location.reload(); };
$(_lhD("I3NydlNhdmU="), m).onclick = (ev) => withBusy(ev.currentTarget, async () => {
let url = $(_lhD("I3NydlVybA=="), m).value.trim().replace(/\/+$/, '');
if (!url) return;
if (!/^https?:\/\//i.test(url)) url = _lhD("aHR0cDovLw==") + url;
const msg = $(_lhD("I3Nydk1zZw=="), m);
try {
const r = await fetch(url + _lhD("L2FwaS9oZWFsdGg="), { cache: _lhD("bm8tc3RvcmU="), signal: AbortSignal.timeout(8000) });
const j = await r.json();
if (j.app !== _lhD("bGVob2FuLXBvcnRhbA==")) throw new Error();
store.set(_lhD("bGhfYXBpX2Jhc2U="), url); msg.innerHTML = _lhD("PHNwYW4gc3R5bGU9ImNvbG9yOnZhcigtLW9rKSI+4pyTIEvhur90IG7hu5FpIHRow6BuaCBjw7RuZzwvc3Bhbj4=");
await sleep(400); location.reload();
} catch { msg.innerHTML = _lhD("PHNwYW4gc3R5bGU9ImNvbG9yOnZhcigtLWJhZCkiPktow7RuZyBr4bq/dCBu4buRaSDEkcaw4bujYy4gS2nhu4NtIHRyYSDEkeG7i2EgY2jhu4ksIG3huqFuZyBXaS1GaSB2w6AgbcOheSBjaOG7pyDEkcOjIGLhuq10IGNoxrBhLjwvc3Bhbj4="); }
});
} });
}
function go(p) {
if (p === _lhD("c3RhZmY=")) {
location.href = _lhD("YWRtaW4uaHRtbD9zdGFmZj0x") + (IS_MOBILE ? _lhD("Jm1vYmlsZT0x") : '');
return;
}
const q = IS_MOBILE ? _lhD("P21vYmlsZT0x") : '';
location.href = _lhD("YXBwLmh0bWw=") + q;
}
function bind() {
$(_lhD("I3RoZW1l")).onclick = () => toggleTheme();
if ($(_lhD("I3Nydg=="))) $(_lhD("I3Nydg==")).onclick = serverDialog;
$$(_lhD("W2RhdGEtc3RvcmUtaW5zdGFsbF0=")).forEach(b => b.onclick = () => installApp());
$$(_lhD("W2RhdGEtbGNmLW1vZGFsXQ==")).forEach(b => b.onclick = () => {
const k = b.dataset.lcfModal;
if (k === _lhD("YWJvdXQ=")) {
modal({ title: _lhD("R2nhu5tpIHRoaeG7h3UgdHJhbmcgd2ViICYgVMOhYyBnaeG6ow=="), sub: `${_lhD("VHJhbmcgd2ViIG7DoHkgxJHGsOG7o2MgdOG6oW8gYuG7n2kg")}${settings?.creatorName || _lhD("VsWpIE5ndXnhu4VuIEFuIEtoYW5n")}`, size: _lhD("eHdpZGU="), body: aboutPortalHtml(settings), foot: _lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIiBkYXRhLWNsb3NlPsSQw7NuZzwvYnV0dG9uPg==") });
return;
}
const info = {
terms: [_lhD("xJBp4buBdSBraG/huqNuICYgUGjDoXAgbMO9"), `${_lhD("PHAgY2xhc3M9ImluazIiPkPhu5VuZyBI4buNYyDEkMaw4budbmcgU+G7kSDEkcaw4bujYyB4w6J5IGThu7FuZyB2w6AgduG6rW4gaMOgbmggcGjhu6VjIHbhu6UgY8O0bmcgdMOhYyBnacOhbyBk4bulYywgdMawIHbhuqVuIHTDom0gbMO9IHbDoCBi4bqjbyDEkeG6o20gYW4gdG/DoG4gdHLGsOG7nW5nIGjhu41jIHThuqFpIDxiPg==")}${esc(settings?.schoolName || _lhD("VHLGsOG7nW5nIFRIUFQgTMOqIEhvw6Bu"))}${_lhD("PC9iPi48L3A+PHAgY2xhc3M9InNtYWxsIG11dGVkIj5I4buNYyBzaW5oIHPhu60gZOG7pW5nIMSRw7puZyBtw6Mgc+G7kSBjw6EgbmjDom4sIGtow7RuZyBjaGlhIHPhursgbeG6rXQga2jhuql1IHbDoCB0dcOibiB0aOG7pyBxdXkgdOG6r2Mg4bupbmcgeOG7rSB2xINuIG1pbmggdHLDqm4ga2jDtG5nIGdpYW4gbeG6oW5nLjwvcD4=")}`],
privacy: [_lhD("Q2jDrW5oIHPDoWNoIGLhuqNvIHbhu4cgZOG7ryBsaeG7h3UgY8OhIG5ow6Ju"), `${_lhD("PHAgY2xhc3M9ImluazIiPk3hu41pIHRow7RuZyB0aW4gY8OhIG5ow6JuLCBuaOG6rXQga8O9IGPhuqNtIHjDumMsIG7hu5lpIGR1bmcgdMawIHbhuqVuIHTDom0gbMO9IHbDoCBo4buTIHPGoSB04buRIGdpw6FjIOG6qW4gZGFuaCBj4bunYSBo4buNYyBzaW5oIMSR4buBdSDEkcaw4bujYyBtw6MgaMOzYSDhu58gdOG6p25nIOG7qW5nIGThu6VuZyAoRUNESCBQLTI1NiArIEFFUy0yNTYtR0NNKSB2w6AgYuG6o28gbeG6rXQgdHV54buHdCDEkeG7kWkuPC9wPjxwIGNsYXNzPSJzbWFsbCBtdXRlZCI+TmjDoCB0csaw4budbmcgY2jhu4kgc+G7rSBk4bulbmcgZOG7ryBsaeG7h3UgbmjhurFtIG3hu6VjIMSRw61jaCBo4buXIHRy4bujLCBi4bqjbyB24buHIGjhu41jIHNpbmggdsOgIG7Dom5nIGNhbyBjaOG6pXQgbMaw4bujbmcgZ2nDoW8gZOG7pWMgdGhlbyBxdXkgxJHhu4tuaCBoaeG7h24gaMOgbmguPC9wPg==")}`],
cookies: [_lhD("Q8OgaSDEkeG6t3QgQ29va2llcyAmIEzGsHUgdHLhu68gcGhpw6pu"), `${_lhD("PHAgY2xhc3M9ImluazIiPkjhu4cgdGjhu5FuZyBjaOG7iSBz4butIGThu6VuZyBi4buZIG5o4bubIGPhu6VjIGLhu5kgKExvY2FsU3RvcmFnZSAvIFNlc3Npb25TdG9yYWdlKSBj4bqnbiB0aGnhur90IMSR4buDIGR1eSB0csOsIHBoacOqbiDEkcSDbmcgbmjhuq1wIGFuIHRvw6BuLCBjaOG6vyDEkeG7mSBnaWFvIGRp4buHbiBTw6FuZy9U4buRaSB2w6AgYuG6o28gduG7hyB0w6BpIGtob+G6o24ga2hpIGtow7RuZyBob+G6oXQgxJHhu5luZy48L3A+PHAgY2xhc3M9InNtYWxsIG11dGVkIj5LaMO0bmcgc+G7rSBk4bulbmcgYuG6pXQga+G7syBjb29raWUgcXXhuqNuZyBjw6FvIGhheSB0aGVvIGTDtWkgY+G7p2EgYsOqbiB0aOG7qSBiYS48L3A+")}`],
}[k];
if (info) modal({ title: info[0], body: info[1], foot: _lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIiBkYXRhLWNsb3NlPsSQw6MgaGnhu4N1PC9idXR0b24+") });
});
$(_lhD("I2V5ZQ==")).onclick = () => { const p = $(_lhD("I3A=")); p.type = p.type === _lhD("cGFzc3dvcmQ=") ? _lhD("dGV4dA==") : _lhD("cGFzc3dvcmQ="); $(_lhD("I2V5ZQ==")).innerHTML = icon(p.type === _lhD("cGFzc3dvcmQ=") ? _lhD("ZXll") : _lhD("ZXllT2Zm")); };
$(_lhD("I2ZvcmdvdA==")).onclick = () => modal({ title: _lhD("UXXDqm4gbeG6rXQga2jhuql1"), body: `${_lhD("PHAgY2xhc3M9ImluazIiPlbDrCBsw70gZG8gYuG6o28gbeG6rXQsIGjhu41jIHNpbmggdnVpIGzDsm5nIGxpw6puIGjhu4cgPGI+R1ZDTjwvYj4gaG/hurdjIDxiPlbEg24gcGjDsm5nIG5ow6AgdHLGsOG7nW5nPC9iPiDEkeG7gyDEkcaw4bujYyDEkeG6t3QgbOG6oWkgbeG6rXQga2jhuql1IG3hurdjIMSR4buLbmguIFRo4bqneSBjw7QgdGjhu7FjIGhp4buHbiB0cm9uZyBt4bulYyA8aT5RdeG6o24gbMO9IHTDoGkga2hv4bqjbiDihpIgxJDhurd0IGzhuqFpIG3huq10IGto4bqpdTwvaT4uPC9wPjxwIGNsYXNzPSJzbWFsbCBtdXRlZCI+U2F1IGtoaSDEkcSDbmcgbmjhuq1wIGLhurFuZyBt4bqtdCBraOG6qXUgbeG6t2MgxJHhu4tuaCwgaMOjeSDEkeG7lWkgbeG6rXQga2jhuql1IG3hu5tpIG5nYXkgdHJvbmcgbeG7pWMgSOG7kyBzxqEgY8OhIG5ow6JuLjwvcD4=")}`, foot: _lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIiBkYXRhLWNsb3NlPsSQw6MgaGnhu4N1PC9idXR0b24+") });
if ($(_lhD("I2NhcFJlZnJlc2g="))) $(_lhD("I2NhcFJlZnJlc2g=")).onclick = () => loadCaptcha();
$(_lhD("I2Y=")).onsubmit = async (e) => {
e.preventDefault();
const err = $(_lhD("I2Vycg==")); err.hidden = true;
const username = $(_lhD("I3U=")).value.trim(), password = $(_lhD("I3A=")).value;
if (!username || !password) { err.textContent = _lhD("VnVpIGzDsm5nIG5o4bqtcCDEkeG6p3kgxJHhu6cgbcOjIMSRxINuZyBuaOG6rXAgdsOgIG3huq10IGto4bqpdS4="); err.hidden = false; return; }
if (IS_MOBILE) {
await withBusy($(_lhD("I2dv")), async () => {
try {
const res = await api.post(_lhD("YXBpL2F1dGgvbG9naW4="), { username, password, remember: $(_lhD("I3JlbQ==")).checked, portal: _lhD("bW9iaWxl") });
const targetPortal = res.user.role === _lhD("c3R1ZGVudA==") ? _lhD("c3R1ZGVudA==") : _lhD("c3RhZmY=");
setPortal(targetPortal);
session.set(res.token, true, true);
store.set(_lhD("bGhfcmVtZW1iZXJfdXNlcg=="), $(_lhD("I3JlbQ==")).checked ? username : '');
store.set(_lhD("bGhfcmVtZW1iZXJf") + targetPortal, $(_lhD("I3JlbQ==")).checked ? username : '');
toast(`${_lhD("WGluIGNow6BvIA==")}${res.user.name}${_lhD("IQ==")}`, _lhD("b2s="), 1500);
await sleep(300);
go(targetPortal);
} catch (ex) {
if (ex instanceof ApiError && ex.details?.locked) {
err.innerHTML = `${esc(ex.message)}${_lhD("IDxidXR0b24gdHlwZT0iYnV0dG9uIiBjbGFzcz0iYnRuIHBsYWluIHNtIiBpZD0iYXNrVW5sb2NrIiBzdHlsZT0icGFkZGluZzowIj5H4butaSB5w6p1IGPhuqd1IG3hu58ga2jDs2E8L2J1dHRvbj4=")}`;
err.hidden = false;
$(_lhD("I2Fza1VubG9jaw=="), err).onclick = () => unlockRequestDialog(ex.details.userId);
} else { err.textContent = ex.message; err.hidden = false; }
}
});
return;
}
const captchaCode = $(_lhD("I2NhcA==")).value.trim();
if (!captchaCode) { err.textContent = _lhD("VnVpIGzDsm5nIG5o4bqtcCBtw6MgeMOhYyBuaOG6rW4gdHJvbmcg4bqjbmgu"); err.hidden = false; return; }
await withBusy($(_lhD("I2dv")), async () => {
try {
setPortal(portal);
const res = await api.post(_lhD("YXBpL2F1dGgvbG9naW4="), { username, password, captchaId: captcha?.id, captchaCode, remember: $(_lhD("I3JlbQ==")).checked, portal });
if (portal === _lhD("c3R1ZGVudA==") && res.user.role !== _lhD("c3R1ZGVudA==")) {
err.innerHTML = _lhD("VMOgaSBraG/huqNuIG7DoHkgdGh14buZYyA8Yj5D4buVbmcgUXXhuqNuIFRy4buLIC8gR2nDoW8gVmnDqm48L2I+LiBWdWkgbMOybmcgxJHEg25nIG5o4bqtcCB04bqhaSB0cmFuZyBkw6BuaCByacOqbmcgY2hvIFF14bqjbiB0cuG7iyB2w6AgR2nDoW8gdmnDqm4u");
err.hidden = false; await loadCaptcha(); return;
}
if (portal === _lhD("c3RhZmY=") && res.user.role === _lhD("c3R1ZGVudA==")) {
err.innerHTML = _lhD("xJDDonkgbMOgIHRyYW5nIMSRxINuZyBuaOG6rXAgZMOgbmggY2hvIDxiPlF14bqjbiB0cuG7iyAvIEdpw6FvIHZpw6puPC9iPi4gSOG7jWMgc2luaCB2dWkgbMOybmcgxJHEg25nIG5o4bqtcCDhu58gPGI+Q+G7lW5nIEjhu41jIFNpbmg8L2I+Lg==");
err.hidden = false; await loadCaptcha(); return;
}
session.set(res.token, $(_lhD("I3JlbQ==")).checked);
store.set(_lhD("bGhfcmVtZW1iZXJf") + portal, $(_lhD("I3JlbQ==")).checked ? username : '');
toast(`${_lhD("WGluIGNow6BvIA==")}${res.user.name}${_lhD("IQ==")}`, _lhD("b2s="), 1500);
await sleep(350);
go(res.user.role === _lhD("c3R1ZGVudA==") ? _lhD("c3R1ZGVudA==") : _lhD("c3RhZmY="));
} catch (ex) {
if (ex instanceof ApiError && ex.details?.locked) {
err.innerHTML = `${esc(ex.message)}${_lhD("IDxidXR0b24gdHlwZT0iYnV0dG9uIiBjbGFzcz0iYnRuIHBsYWluIHNtIiBpZD0iYXNrVW5sb2NrIiBzdHlsZT0icGFkZGluZzowIj5H4butaSB5w6p1IGPhuqd1IG3hu58ga2jDs2E8L2J1dHRvbj4=")}`;
err.hidden = false;
$(_lhD("I2Fza1VubG9jaw=="), err).onclick = () => unlockRequestDialog(ex.details.userId);
} else { err.textContent = ex.message; err.hidden = false; }
await loadCaptcha();
}
});
};
$(_lhD("I2ZhY2U=")) && ($(_lhD("I2ZhY2U=")).onclick = faceLogin);
}
async function unlockRequestDialog(userId) {
if (IS_MOBILE) {
const m = modal({ title: _lhD("R+G7rWkgecOqdSBj4bqndSBt4bufIGtow7NhIHTDoGkga2hv4bqjbg=="), sub: `${_lhD("TcOjIHTDoGkga2hv4bqjbjog")}${esc(userId)}`,
body: `${_lhD("PHAgY2xhc3M9ImluazIgc21hbGwiPlnDqnUgY+G6p3Ugc+G6vSDEkcaw4bujYyBn4butaSB04bubaSBCYW4gR2nDoW0gaGnhu4d1IC8gZ2nDoW0gdGjhu4sgxJHhu4MgeGVtIHjDqXQgbeG7nyBraMOzYS48L3A+CiAgICAgICAgPGRpdiBpZD0idW1zZyIgY2xhc3M9InNtYWxsIiBzdHlsZT0ibWluLWhlaWdodDoxOHB4Ij48L2Rpdj4=")}`,
foot: _lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIGdob3N0IiBkYXRhLWNsb3NlPsSQw7NuZzwvYnV0dG9uPjxidXR0b24gY2xhc3M9ImJ0biIgaWQ9InVzZW5kIj5H4butaSB5w6p1IGPhuqd1PC9idXR0b24+") });
$(_lhD("I3VzZW5k"), m.el).onclick = (ev) => withBusy(ev.currentTarget, async () => {
const msg = $(_lhD("I3Vtc2c="), m.el);
try {
const r = await api.post(_lhD("YXBpL2F1dGgvdW5sb2NrLXJlcXVlc3Q="), { userId, portal: _lhD("bW9iaWxl") });
msg.innerHTML = `${_lhD("PHNwYW4gc3R5bGU9ImNvbG9yOnZhcigtLW9rKSI+")}${esc(r.message)}${_lhD("PC9zcGFuPg==")}`;
await sleep(1200); m.close();
} catch (ex) { msg.innerHTML = `${_lhD("PHNwYW4gc3R5bGU9ImNvbG9yOnZhcigtLWJhZCkiPg==")}${esc(ex.message)}${_lhD("PC9zcGFuPg==")}`; }
});
return;
}
let ucap = null;
const load = async (m) => { try { ucap = await api.get(_lhD("YXBpL2F1dGgvY2FwdGNoYQ==")); } catch { ucap = null; } $(_lhD("I3VjYXBJbWc="), m).innerHTML = ucap ? ucap.svg : ''; $(_lhD("I3VjYXA="), m).value = ''; };
const m = modal({ title: _lhD("R+G7rWkgecOqdSBj4bqndSBt4bufIGtow7NhIHTDoGkga2hv4bqjbg=="), sub: `${_lhD("TcOjIHTDoGkga2hv4bqjbjog")}${esc(userId)}`,
body: `${_lhD("PHAgY2xhc3M9ImluazIgc21hbGwiPlnDqnUgY+G6p3Ugc+G6vSDEkcaw4bujYyBn4butaSB04bubaSBCYW4gR2nDoW0gaGnhu4d1IC8gZ2nDoW0gdGjhu4sgxJHhu4MgeGVtIHjDqXQgbeG7nyBraMOzYS48L3A+CiAgICAgIDxkaXYgY2xhc3M9ImZpZWxkIj48bGFiZWwgZm9yPSJ1Y2FwIj5Nw6MgeMOhYyBuaOG6rW48L2xhYmVsPjxkaXYgY2xhc3M9ImNhcHRjaGEtcm93Ij48c3BhbiBjbGFzcz0iY2FwdGNoYS1pbWciIGlkPSJ1Y2FwSW1nIj48L3NwYW4+PGJ1dHRvbiB0eXBlPSJidXR0b24iIGNsYXNzPSJidG4gaWNvbiBnaG9zdCBzbSIgaWQ9InVjYXBSZWZyZXNoIiBhcmlhLWxhYmVsPSJM4bqleSBtw6Mga2jDoWMiPg==")}${icon(_lhD("cmVmcmVzaA=="))}${_lhD("PC9idXR0b24+PGlucHV0IGlkPSJ1Y2FwIiBpbnB1dG1vZGU9Im51bWVyaWMiIG1heGxlbmd0aD0iNSIgcGxhY2Vob2xkZXI9Ik5o4bqtcCBjw6FjIHPhu5EiPjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGlkPSJ1bXNnIiBjbGFzcz0ic21hbGwiIHN0eWxlPSJtaW4taGVpZ2h0OjE4cHgiPjwvZGl2Pg==")}`,
foot: _lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIGdob3N0IiBkYXRhLWNsb3NlPsSQw7NuZzwvYnV0dG9uPjxidXR0b24gY2xhc3M9ImJ0biIgaWQ9InVzZW5kIj5H4butaSB5w6p1IGPhuqd1PC9idXR0b24+") });
await load(m.el);
$(_lhD("I3VjYXBSZWZyZXNo"), m.el).onclick = () => load(m.el);
$(_lhD("I3VzZW5k"), m.el).onclick = (ev) => withBusy(ev.currentTarget, async () => {
const msg = $(_lhD("I3Vtc2c="), m.el);
try {
const r = await api.post(_lhD("YXBpL2F1dGgvdW5sb2NrLXJlcXVlc3Q="), { userId, captchaId: ucap?.id, captchaCode: $(_lhD("I3VjYXA="), m.el).value.trim() });
msg.innerHTML = `${_lhD("PHNwYW4gc3R5bGU9ImNvbG9yOnZhcigtLW9rKSI+")}${esc(r.message)}${_lhD("PC9zcGFuPg==")}`;
await sleep(1400); m.close();
} catch (ex) { msg.innerHTML = `${_lhD("PHNwYW4gc3R5bGU9ImNvbG9yOnZhcigtLWJhZCkiPg==")}${esc(ex.message)}${_lhD("PC9zcGFuPg==")}`; await load(m.el); }
});
}
async function faceLogin() {
const saved = store.get(_lhD("bGhfZmFjZQ=="));
let stream = null;
const m = modal({
title: _lhD("xJDEg25nIG5o4bqtcCBi4bqxbmcgRmFjZSBJRA=="), sub: _lhD("R2nhu68ga2h1w7RuIG3hurd0IHRyb25nIGtodW5nLCBuaMOsbiB0aOG6s25nIHbDoG8gY2FtZXJh"),
body: `${_lhD("PGRpdiBjbGFzcz0iZmFjZWlkIj48ZGl2IGNsYXNzPSJzY2FuIiBpZD0ic2NhbiI+PHZpZGVvIGlkPSJ2aWQiIGF1dG9wbGF5IHBsYXlzaW5saW5lIG11dGVkPjwvdmlkZW8+PGRpdiBjbGFzcz0iZnJhbWUiPjwvZGl2PjxkaXYgY2xhc3M9ImxpbmUiPjwvZGl2PjxkaXYgaWQ9InBoIiBzdHlsZT0icG9zaXRpb246YWJzb2x1dGU7Y29sb3I6IzlkYjdmZiI+")}${icon(_lhD("ZmFjZQ=="), '').replace(_lhD("Y2xhc3M9ImljbyA="), _lhD("c3R5bGU9IndpZHRoOjcycHg7aGVpZ2h0OjcycHgiIGNsYXNzPSJpY28g"))}${_lhD("PC9kaXY+PC9kaXY+PHAgY2xhc3M9InNtYWxsIG11dGVkIiBpZD0iZnN0YXQiIHN0eWxlPSJ0ZXh0LWFsaWduOmNlbnRlciI+xJBhbmcga2jhu59pIMSR4buZbmcgY2FtZXJh4oCmPC9wPjwvZGl2Pg==")}`,
foot: _lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIGdob3N0IiBkYXRhLWNsb3NlPkjhu6d5PC9idXR0b24+"),
onClose: () => stream?.getTracks().forEach(t => t.stop()),
});
const stat = $(_lhD("I2ZzdGF0"), m.el);
if (!saved) {
stat.innerHTML = _lhD("VGhp4bq/dCBi4buLIG7DoHkgY2jGsGEgYuG6rXQgRmFjZSBJRC4gSMOjeSDEkcSDbmcgbmjhuq1wIGLhurFuZyBt4bqtdCBraOG6qXUsIHNhdSDEkcOzIHbDoG8gPGI+SOG7kyBzxqEg4oaSIELhuqNvIG3huq10IOKGkiBC4bqtdCBGYWNlIElEPC9iPi4=");
$(_lhD("LmxpbmU="), m.el).style.display = _lhD("bm9uZQ==");
return;
}
try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: _lhD("dXNlcg==") } }); $(_lhD("I3ZpZA=="), m.el).srcObject = stream; $(_lhD("I3Bo"), m.el).remove(); } catch {  }
stat.textContent = _lhD("xJBhbmcgcXXDqXQgdsOgIMSR4buRaSBjaGnhur91IGtodcO0biBt4bq3dOKApg==");
await sleep(2200);
try {
const res = await api.post(_lhD("YXBpL2F1dGgvZmFjZS9sb2dpbg=="), saved);
const targetPortal = res.user.role === _lhD("c3R1ZGVudA==") ? _lhD("c3R1ZGVudA==") : _lhD("c3RhZmY=");
setPortal(targetPortal);
$(_lhD("I3NjYW4="), m.el).classList.add(_lhD("b2s=")); stat.innerHTML = `${_lhD("PGIgc3R5bGU9ImNvbG9yOnZhcigtLW9rKSI+xJDDoyBuaOG6rW4gZGnhu4duOiA=")}${esc(res.user.name)}${_lhD("PC9iPg==")}`;
session.set(res.token, true);
await sleep(700); m.close(); go(targetPortal);
} catch (e) { stat.textContent = e.message; $(_lhD("LmxpbmU="), m.el).style.display = _lhD("bm9uZQ=="); }
}
window.addEventListener(_lhD("YXV0aDpleHBpcmVk"), () => {});
boot().catch(showError);
