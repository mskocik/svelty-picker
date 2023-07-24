(function(){"use strict";self.window=self;let n;const r=new Promise(e=>{n=e});self.addEventListener("message",async e=>{switch(e.data.type){case"init":const{svelte_url:t}=e.data,{version:o}=await fetch(`${t}/package.json`).then(a=>a.json());if(o.startsWith("4")){const a=await fetch(`${t}/compiler.cjs`).then(s=>s.text());(0,eval)(a+`
//# sourceURL=compiler.cjs@`+o)}else try{importScripts(`${t}/compiler.js`)}catch{self.svelte=await import(`${t}/compiler.mjs`)}n();break;case"compile":await r,postMessage(l(e.data));break}});const i={dev:!1,css:!1};function l({id:e,source:t,options:o,return_ast:a}){try{const{js:s,css:c,ast:m}=self.svelte.compile(t,Object.assign({},i,o));return{id:e,result:{js:s.code,css:c.code||"/* Add a <style> tag to see compiled CSS */",ast:a?m:null}}}catch(s){let c=`/* Error compiling component

${s.message}`;return s.frame&&(c+=`
${s.frame}`),c+=`

*/`,{id:e,result:{js:c,css:c}}}}})();
