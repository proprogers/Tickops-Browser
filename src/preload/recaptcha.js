// if (recap) {
//   window.findRecaptchaClients = () => {
//     console.log("FIND RECAPTCHA");
//     if (typeof ___grecaptcha_cfg === 'undefined') return [];

//     return Object.entries(___grecaptcha_cfg.clients).map(([cid, client]) => {
//       const data = { id: cid, version: cid >= 10000 ? 'V3' : 'V2' };
//       const objects = Object.entries(client).filter(([_, value]) => value && typeof value === 'object');

//       objects.forEach(([key, obj]) => {
//         if (obj instanceof HTMLElement && obj.tagName === 'DIV') {
//           data.pageurl = obj.baseURI;
//         }

//         const found = Object.entries(obj).find(([_, value]) =>
//           value && typeof value === 'object' && 'sitekey' in value && 'size' in value
//         );

//         if (found) {
//           const [, sublevel] = found;
//           data.sitekey = sublevel.sitekey;

//           const callbackKey = data.version === 'V2' ? 'callback' : 'promise-callback';
//           const callback = sublevel[callbackKey];

//           data.callback = callback
//             ? `___grecaptcha_cfg.clients['${cid}']['${key}']['${callbackKey}']`
//             : null;
//           data.function = callback || null;
//         }
//       });

//       return data;
//     });
//   };

//   const retrieveCallback = (obj, visited = new Set()) => {
//     if (typeof obj === 'function') return obj;

//     for (const key in obj) {
//       if (!visited.has(obj[key])) {
//         visited.add(obj[key]);

//         const value = retrieveCallback(obj[key], visited);
//         if (value) return value;

//         visited.delete(obj[key]);
//       }
//     }
//   };

//   window.checkCaptcha = (interval, solver) => {
//     if (!window.___grecaptcha_cfg) return;

//     const clients = window.findRecaptchaClients();
//     if (!clients.length) return;

//     const { sitekey, callback, function: func } = clients[0];
//     if (!sitekey) return;

//     solver.recaptcha({ pageurl: window.location.href, googlekey: sitekey })
//       .then((res) => {
//         console.log("Captcha solved:", res.data);
//         window.localStorage.setItem("captcha_res", res.data);

//         document.getElementById("g-recaptcha-response").innerHTML = res.data;
//         document.querySelector('iframe[src*="recaptcha"]').style.display = "none";

//         if (callback) {
//           eval(callback)(res.data);
//         } else if (func) {
//           func(res.data);
//         }

//         clearInterval(interval);
//       })
//       .catch(console.error);
//   };

//   window.addEventListener('load', async () => {
//     if (window.location.host.includes('etix')) return;

//     document.querySelectorAll('a[target="_blank"]').forEach(link => {
//       link.addEventListener('click', async (event) => {
//         event.preventDefault();
//         await ipcRenderer.invoke('create-tab', { src: link.href, partition });
//       });
//     });

//     const data = (await Settings.get(INTEGRATIONS_KEY)) || null;
//     const recap = preferences.includes('recap');
//     const apiKey = Object.values(data).find(item => item.service === "2captcha")?.key;

//     if (recap && apiKey) {
//       const solver = new Solver(apiKey);

//       document.addEventListener("click", (e) => {
//         if (e.target.id === "submitBtn2") {
//           solver.recaptcha({
//             pageurl: window.location.href,
//             googlekey: window.findRecaptchaClients()[0]?.sitekey
//           })
//             .then((res) => {
//               console.log("Captcha solved:", res.data);
//               window.localStorage.setItem("captcha_res", res.data);
//               document.getElementById("g-recaptcha-response").innerHTML = res.data;
//               document.querySelector('iframe[src*="recaptcha"]').style.display = "none";
//             })
//             .catch(console.error);
//         }
//       });

//       const interval = setInterval(() => window.checkCaptcha(interval, solver), 3000);
//     }
//   });
// }
