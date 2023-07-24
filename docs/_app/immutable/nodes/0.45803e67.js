import{g as we,d as ze}from"../chunks/data.3709b2d1.js";import{s as ee,f as v,g as _,h as y,d,j as u,i as R,r as W,u as Ce,o as ce,l as Ie,a as j,m as Ee,c as O,v as M,w as g,n as xe,e as de,x as q,y as Te,z as Le,A as Me,B as ge,C as Se,D as He,E as Ne,F as Ae,G as De,H as Ve,I as Be}from"../chunks/scheduler.6381a9b9.js";import{S as te,i as se,b as ae,d as ne,m as ie,a as X,t as $,e as re}from"../chunks/index.cf31950d.js";import{e as oe,j as ke,w as Pe}from"../chunks/singletons.378744e0.js";import{p as je}from"../chunks/stores.4ac98070.js";import{e as ve}from"../chunks/each.31dbf577.js";async function Oe({params:a}){return{slug:a.slug,navigation:we(ze)}}const it=Object.freeze(Object.defineProperty({__proto__:null,load:Oe},Symbol.toStringTag,{value:"Module"}));function _e(a,e,t){const s=a.slice();return s[4]=e[t],s}function pe(a){let e,t,s,l,n=a[4].title+"",i,c,E;return{c(){e=v("li"),t=v("div"),s=v("a"),l=v("span"),i=Ie(n),E=j(),this.h()},l(f){e=_(f,"LI",{class:!0});var o=y(e);t=_(o,"DIV",{class:!0});var C=y(t);s=_(C,"A",{href:!0,class:!0});var k=y(s);l=_(k,"SPAN",{});var p=y(l);i=Ee(p,n),p.forEach(d),k.forEach(d),C.forEach(d),E=O(o),o.forEach(d),this.h()},h(){u(s,"href",c=oe+"/"+a[4].slug),u(s,"class","row svelte-1iuyc2v"),M(s,"active",a[4].slug===a[1]),M(s,"loading",a[2]),u(t,"class","row svelte-1iuyc2v"),M(t,"active",a[4].slug===(a[1]||"")),M(t,"loading",a[2]),u(e,"class","svelte-1iuyc2v")},m(f,o){R(f,e,o),g(e,t),g(t,s),g(s,l),g(l,i),g(e,E)},p(f,o){o&1&&n!==(n=f[4].title+"")&&xe(i,n),o&1&&c!==(c=oe+"/"+f[4].slug)&&u(s,"href",c),o&3&&M(s,"active",f[4].slug===f[1]),o&4&&M(s,"loading",f[2]),o&3&&M(t,"active",f[4].slug===(f[1]||"")),o&4&&M(t,"loading",f[2])},d(f){f&&d(e)}}}function Re(a){let e,t=ve(a[0]),s=[];for(let l=0;l<t.length;l+=1)s[l]=pe(_e(a,t,l));return{c(){e=v("ul");for(let l=0;l<s.length;l+=1)s[l].c();this.h()},l(l){e=_(l,"UL",{class:!0});var n=y(e);for(let i=0;i<s.length;i+=1)s[i].l(n);n.forEach(d),this.h()},h(){u(e,"class","toc svelte-1iuyc2v")},m(l,n){R(l,e,n);for(let i=0;i<s.length;i+=1)s[i]&&s[i].m(e,null)},p(l,[n]){if(n&7){t=ve(l[0]);let i;for(i=0;i<t.length;i+=1){const c=_e(l,t,i);s[i]?s[i].p(c,n):(s[i]=pe(c),s[i].c(),s[i].m(e,null))}for(;i<s.length;i+=1)s[i].d(1);s.length=t.length}},i:W,o:W,d(l){l&&d(e),Ce(s,l)}}}function Ue(a,e,t){let{pages:s=[]}=e,{active_section:l=""}=e,{isLoading:n=!1}=e;return ce(()=>{}),a.$$set=i=>{"pages"in i&&t(0,s=i.pages),"active_section"in i&&t(1,l=i.active_section),"isLoading"in i&&t(2,n=i.isLoading)},[s,l,n]}class We extends te{constructor(e){super(),se(this,e,Ue,Re,ee,{pages:0,active_section:1,isLoading:2})}}const Fe=ke("before_navigate"),Ge=ke("after_navigate");function ye(a){let e,t,s=a[3]&&be(a);return{c(){e=v("output"),s&&s.c(),this.h()},l(l){e=_(l,"OUTPUT",{id:!0,role:!0,"aria-valuenow":!0,"aria-valuemin":!0,"aria-valuemax":!0,class:!0,style:!0});var n=y(e);s&&s.l(n),n.forEach(d),this.h()},h(){u(e,"id",a[0]),u(e,"role","progressbar"),u(e,"aria-valuenow",a[2]),u(e,"aria-valuemin",0),u(e,"aria-valuemax",1),u(e,"class",t="svelte-progress-bar "+a[1]+" svelte-1rjlpd"),u(e,"style",a[5]),M(e,"running",a[3]),M(e,"svelte-progress-bar-hiding",a[4])},m(l,n){R(l,e,n),s&&s.m(e,null)},p(l,n){l[3]?s?s.p(l,n):(s=be(l),s.c(),s.m(e,null)):s&&(s.d(1),s=null),n&1&&u(e,"id",l[0]),n&4&&u(e,"aria-valuenow",l[2]),n&2&&t!==(t="svelte-progress-bar "+l[1]+" svelte-1rjlpd")&&u(e,"class",t),n&32&&u(e,"style",l[5]),n&10&&M(e,"running",l[3]),n&18&&M(e,"svelte-progress-bar-hiding",l[4])},d(l){l&&d(e),s&&s.d()}}}function be(a){let e;return{c(){e=v("div"),this.h()},l(t){e=_(t,"DIV",{class:!0,style:!0}),y(e).forEach(d),this.h()},h(){u(e,"class","svelte-progress-bar-leader svelte-1rjlpd"),u(e,"style",a[6])},m(t,s){R(t,e,s)},p(t,s){s&64&&u(e,"style",t[6])},d(t){t&&d(e)}}}function Ye(a){let e,t=(a[3]||a[2]>0)&&ye(a);return{c(){t&&t.c(),e=de()},l(s){t&&t.l(s),e=de()},m(s,l){t&&t.m(s,l),R(s,e,l)},p(s,[l]){s[3]||s[2]>0?t?t.p(s,l):(t=ye(s),t.c(),t.m(e.parentNode,e)):t&&(t.d(1),t=null)},i:W,o:W,d(s){s&&d(e),t&&t.d(s)}}}function qe(a,e,t){const s=r=>r>=0&&r<.2?.1:r>=.2&&r<.5?.04:r>=.5&&r<.8?.02:r>=.8&&r<.99?.005:0;let l=!1,n=null,i=!1,c=0,{id:E=void 0}=e,{busy:f=!1}=e,{color:o="currentColor"}=e,{class:C=""}=e,{zIndex:k=1}=e,{minimum:p=.08}=e,{maximum:h=.994}=e,{settleTime:N=700}=e,{intervalTime:D=700}=e,{stepSizes:w=[0,.005,.01,.02]}=e;const F=(r=p)=>{t(2,c=r),t(3,l=!0)},x=()=>{n&&clearInterval(n),t(3,l=!0),n=setInterval(()=>{const r=w[Math.floor(Math.random()*w.length)]??0,U=s(c)+r;c<h&&t(2,c=c+U),c>h&&(t(2,c=h),L())},D)},I=r=>{F(r),x()},L=()=>{n&&clearInterval(n)},V=(r=N)=>{n&&clearInterval(n),l&&(t(2,c=1),t(3,l=!1),setTimeout(()=>{t(4,i=!0),setTimeout(()=>{t(4,i=!1),t(2,c=0)},r)},r))},H=r=>{L(),t(2,c=r),t(4,i=!1),t(3,l=!0)},G=()=>({width:c,running:l,completed:i,color:o,defaultMinimum:p,maximum:h,defaultSettleTime:N,intervalTime:D,stepSizes:w});let A,Y,{displayThresholdMs:B=150}=e,{noNavigationProgress:S=!1}=e,b=null;return Fe(r=>{var U;b&&(clearTimeout(b),b=null),!S&&(U=r.to)!=null&&U.route.id&&(B>0?b=setTimeout(()=>!S&&I(),B):I())}),Ge(()=>{b&&(clearTimeout(b),b=null),V()}),a.$$set=r=>{"id"in r&&t(0,E=r.id),"busy"in r&&t(7,f=r.busy),"color"in r&&t(8,o=r.color),"class"in r&&t(1,C=r.class),"zIndex"in r&&t(9,k=r.zIndex),"minimum"in r&&t(10,p=r.minimum),"maximum"in r&&t(11,h=r.maximum),"settleTime"in r&&t(12,N=r.settleTime),"intervalTime"in r&&t(13,D=r.intervalTime),"stepSizes"in r&&t(14,w=r.stepSizes),"displayThresholdMs"in r&&t(22,B=r.displayThresholdMs),"noNavigationProgress"in r&&t(23,S=r.noNavigationProgress)},a.$$.update=()=>{a.$$.dirty&128&&t(3,l=f),a.$$.dirty&772&&t(5,A=(o?`background-color: ${o};`:"")+(c&&c*100?`width: ${c*100}%;`:"")+`z-index: ${k};`),a.$$.dirty&768&&t(6,Y=(o?`background-color: ${o}; color: ${o};`:"")+`z-index: ${k+1};`)},[E,C,c,l,i,A,Y,f,o,k,p,h,N,D,w,F,x,I,L,V,H,G,B,S]}class Qe extends te{constructor(e){super(),se(this,e,qe,Ye,ee,{id:0,busy:7,color:8,class:1,zIndex:9,minimum:10,maximum:11,settleTime:12,intervalTime:13,stepSizes:14,reset:15,animate:16,start:17,stop:18,complete:19,setWidthRatio:20,getState:21,displayThresholdMs:22,noNavigationProgress:23})}get reset(){return this.$$.ctx[15]}get animate(){return this.$$.ctx[16]}get start(){return this.$$.ctx[17]}get stop(){return this.$$.ctx[18]}get complete(){return this.$$.ctx[19]}get setWidthRatio(){return this.$$.ctx[20]}get getState(){return this.$$.ctx[21]}}function Ze(a){let e,t='<svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" class="dark-toggle svelte-13r8zzi"><path fill="currentColor" d="M20.742 13.045a8.088 8.088 0 0 1-2.077.271c-2.135 0-4.14-.83-5.646-2.336a8.025 8.025 0 0 1-2.064-7.723A1 1 0 0 0 9.73 2.034a10.014 10.014 0 0 0-4.489 2.582c-3.898 3.898-3.898 10.243 0 14.143a9.937 9.937 0 0 0 7.072 2.93a9.93 9.93 0 0 0 7.07-2.929a10.007 10.007 0 0 0 2.583-4.491a1.001 1.001 0 0 0-1.224-1.224zm-2.772 4.301a7.947 7.947 0 0 1-5.656 2.343a7.953 7.953 0 0 1-5.658-2.344c-3.118-3.119-3.118-8.195 0-11.314a7.923 7.923 0 0 1 2.06-1.483a10.027 10.027 0 0 0 2.89 7.848a9.972 9.972 0 0 0 7.848 2.891a8.036 8.036 0 0 1-1.484 2.059z"></path></svg> <svg width="1.2em" height="1.2em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 512 512" class="light-toggle svelte-13r8zzi"><path d="M256 387c-8.5 0-15.4 6.9-15.4 15.4v46.2c0 8.5 6.9 15.4 15.4 15.4s15.4-6.9 15.4-15.4v-46.2c0-8.5-6.9-15.4-15.4-15.4z" fill="currentColor"></path><path d="M256 48c-8.5 0-15.4 6.9-15.4 15.4v46.2c0 8.5 6.9 15.4 15.4 15.4s15.4-6.9 15.4-15.4V63.4c0-8.5-6.9-15.4-15.4-15.4z" fill="currentColor"></path><path d="M125 256c0-8.5-6.9-15.4-15.4-15.4H63.4c-8.5 0-15.4 6.9-15.4 15.4s6.9 15.4 15.4 15.4h46.2c8.5 0 15.4-6.9 15.4-15.4z" fill="currentColor"></path><path d="M448.6 240.6h-46.2c-8.5 0-15.4 6.9-15.4 15.4s6.9 15.4 15.4 15.4h46.2c8.5 0 15.4-6.9 15.4-15.4s-6.9-15.4-15.4-15.4z" fill="currentColor"></path><path d="M152.5 344.1c-4.1 0-8 1.6-10.9 4.5l-32.7 32.7c-2.9 2.9-4.5 6.8-4.5 10.9s1.6 8 4.5 10.9c2.9 2.9 6.8 4.5 10.9 4.5 4.1 0 8-1.6 10.9-4.5l32.7-32.7c6-6 6-15.8 0-21.8-2.9-2.9-6.8-4.5-10.9-4.5z" fill="currentColor"></path><path d="M359.5 167.9c4.1 0 8-1.6 10.9-4.5l32.7-32.7c2.9-2.9 4.5-6.8 4.5-10.9s-1.6-8-4.5-10.9c-2.9-2.9-6.8-4.5-10.9-4.5-4.1 0-8 1.6-10.9 4.5l-32.7 32.7c-2.9 2.9-4.5 6.8-4.5 10.9s1.6 8 4.5 10.9c2.9 2.9 6.8 4.5 10.9 4.5z" fill="currentColor"></path><path d="M130.7 108.9c-2.9-2.9-6.8-4.5-10.9-4.5-4.1 0-8 1.6-10.9 4.5-2.9 2.9-4.5 6.8-4.5 10.9 0 4.1 1.6 8 4.5 10.9l32.7 32.7c2.9 2.9 6.8 4.5 10.9 4.5 4.1 0 8-1.6 10.9-4.5 2.9-2.9 4.5-6.8 4.5-10.9s-1.6-8-4.5-10.9l-32.7-32.7z" fill="currentColor"></path><path d="M370.4 348.6c-2.9-2.9-6.8-4.5-10.9-4.5-4.1 0-8 1.6-10.9 4.5-6 6-6 15.8 0 21.8l32.7 32.7c2.9 2.9 6.8 4.5 10.9 4.5 4.1 0 8-1.6 10.9-4.5 2.9-2.9 4.5-6.8 4.5-10.9s-1.6-8-4.5-10.9l-32.7-32.7z" fill="currentColor"></path><path d="M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96z" fill="currentColor"></path></svg>',s,l;return{c(){e=v("button"),e.innerHTML=t,this.h()},l(n){e=_(n,"BUTTON",{class:!0,"aria-label":!0,"data-svelte-h":!0}),q(e)!=="svelte-y8yro1"&&(e.innerHTML=t),this.h()},h(){u(e,"class","inline-flex text-xl p-2 theme-toggle svelte-13r8zzi"),u(e,"aria-label","Switch theme")},m(n,i){R(n,e,i),s||(l=Te(e,"click",a[1]),s=!0)},p:W,i:W,o:W,d(n){n&&d(e),s=!1,l()}}}function Je(a,e,t){let s;const l=Le("theme");Me(a,l,i=>t(2,s=i));function n(){s==="dark"?ge(l,s="light",s):ge(l,s="dark",s),localStorage.setItem("theme",s),document.documentElement.classList.remove("dark","light"),document.documentElement.classList.add(s)}return ce(()=>{const i=localStorage.getItem("theme"),c=matchMedia("(prefers-color-scheme: dark)");c.matches&&i===null?n():i?l.set(i):l.set(c.matches?"dark":"light")}),[l,n]}class Ke extends te{constructor(e){super(),se(this,e,Je,Ze,ee,{})}}function Xe(a){let e,t,s,l,n,i,c,E='<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg> <span class="leading-4 hidden sm:block">Menu</span>',f,o,C='<span class="hidden sm:inline">📅</span> Svelty Picker',k,p,h,N='<svg width="36px" height="36px" preserveAspectRatio="xMidYMid meet" viewBox="0 0 32 32" data-v-8ff9b2e6=""><path fill="currentColor" fill-rule="evenodd" d="M16 2a14 14 0 0 0-4.43 27.28c.7.13 1-.3 1-.67v-2.38c-3.89.84-4.71-1.88-4.71-1.88a3.71 3.71 0 0 0-1.62-2.05c-1.27-.86.1-.85.1-.85a2.94 2.94 0 0 1 2.14 1.45a3 3 0 0 0 4.08 1.16a2.93 2.93 0 0 1 .88-1.87c-3.1-.36-6.37-1.56-6.37-6.92a5.4 5.4 0 0 1 1.44-3.76a5 5 0 0 1 .14-3.7s1.17-.38 3.85 1.43a13.3 13.3 0 0 1 7 0c2.67-1.81 3.84-1.43 3.84-1.43a5 5 0 0 1 .14 3.7a5.4 5.4 0 0 1 1.44 3.76c0 5.38-3.27 6.56-6.39 6.91a3.33 3.33 0 0 1 .95 2.59v3.84c0 .46.25.81 1 .67A14 14 0 0 0 16 2Z"></path></svg>',D,w,F,x,I,L,V,H,G,A,Y='<a href="https://github.com/mskocik/svelty-picker"><img alt="GitHub package.json version" src="https://img.shields.io/npm/v/svelty-picker.svg?style=flat"/></a>',B,S,b,r,U;e=new Qe({props:{color:"#7F57F1"}}),w=new Ke({}),H=new We({props:{pages:a[0].navigation,active_section:a[0].slug}});const le=a[6].default,z=Se(le,a,a[5],null);return{c(){ae(e.$$.fragment),t=j(),s=v("div"),l=v("div"),n=v("div"),i=v("div"),c=v("button"),c.innerHTML=E,f=j(),o=v("a"),o.innerHTML=C,k=j(),p=v("div"),h=v("a"),h.innerHTML=N,D=j(),ae(w.$$.fragment),F=j(),x=v("div"),I=v("aside"),L=v("div"),V=v("nav"),ae(H.$$.fragment),G=j(),A=v("div"),A.innerHTML=Y,B=j(),S=v("main"),z&&z.c(),this.h()},l(m){ne(e.$$.fragment,m),t=O(m),s=_(m,"DIV",{class:!0});var T=y(s);l=_(T,"DIV",{class:!0});var P=y(l);n=_(P,"DIV",{class:!0});var Q=y(n);i=_(Q,"DIV",{class:!0});var ue=y(i);c=_(ue,"BUTTON",{class:!0,"data-svelte-h":!0}),q(c)!=="svelte-4h82c7"&&(c.innerHTML=E),ue.forEach(d),f=O(Q),o=_(Q,"A",{href:!0,class:!0,"data-svelte-h":!0}),q(o)!=="svelte-rmzdx2"&&(o.innerHTML=C),Q.forEach(d),k=O(P),p=_(P,"DIV",{class:!0});var Z=y(p);h=_(Z,"A",{class:!0,href:!0,target:!0,rel:!0,title:!0,"data-svelte-h":!0}),q(h)!=="svelte-ec1fh0"&&(h.innerHTML=N),D=O(Z),ne(w.$$.fragment,Z),Z.forEach(d),P.forEach(d),F=O(T),x=_(T,"DIV",{class:!0});var J=y(x);I=_(J,"ASIDE",{class:!0});var fe=y(I);L=_(fe,"DIV",{});var K=y(L);V=_(K,"NAV",{});var he=y(V);ne(H.$$.fragment,he),he.forEach(d),G=O(K),A=_(K,"DIV",{"data-svelte-h":!0}),q(A)!=="svelte-las9tw"&&(A.innerHTML=Y),K.forEach(d),fe.forEach(d),B=O(J),S=_(J,"MAIN",{class:!0});var me=y(S);z&&z.l(me),me.forEach(d),J.forEach(d),T.forEach(d),this.h()},h(){u(c,"class","flex items-center"),u(i,"class","lg:hidden"),u(o,"href",oe+"/"),u(o,"class","home-link flex-1 lg:flex-none text-center lg:text-left svelte-1tdygp0"),u(n,"class","flex items-center flex-1"),u(h,"class","inline-flex"),u(h,"href","https://github.com/mskocik/svelty-picker"),u(h,"target","_blank"),u(h,"rel","noreferrer"),u(h,"title","GitHub repository"),u(p,"class","flex items-center"),u(l,"class","header flex shadow-lg relative z-10 svelte-1tdygp0"),u(I,"class","svelte-1tdygp0"),M(I,"opened",a[2]),u(S,"class","p-4 lg:p-10 svelte-1tdygp0"),u(x,"class","flex flex-auto items-stretch"),u(s,"class","fullbody svelte-1tdygp0")},m(m,T){ie(e,m,T),R(m,t,T),R(m,s,T),g(s,l),g(l,n),g(n,i),g(i,c),g(n,f),g(n,o),g(l,k),g(l,p),g(p,h),g(p,D),ie(w,p,null),g(s,F),g(s,x),g(x,I),g(I,L),g(L,V),ie(H,V,null),g(L,G),g(L,A),g(x,B),g(x,S),z&&z.m(S,null),b=!0,r||(U=Te(c,"click",He(a[7])),r=!0)},p(m,[T]){const P={};T&1&&(P.pages=m[0].navigation),T&1&&(P.active_section=m[0].slug),H.$set(P),(!b||T&4)&&M(I,"opened",m[2]),z&&z.p&&(!b||T&32)&&Ne(z,le,m,m[5],b?De(le,m[5],T,null):Ae(m[5]),null)},i(m){b||(X(e.$$.fragment,m),X(w.$$.fragment,m),X(H.$$.fragment,m),X(z,m),b=!0)},o(m){$(e.$$.fragment,m),$(w.$$.fragment,m),$(H.$$.fragment,m),$(z,m),b=!1},d(m){m&&(d(t),d(s)),re(e,m),re(w),re(H),z&&z.d(m),r=!1,U()}}}function $e(a,e,t){let s,l;Me(a,je,h=>t(4,l=h));let{$$slots:n={},$$scope:i}=e,{data:c=[]}=e;const E=Pe(null);Ve("theme",E);let f=!1,o=!1;ce(()=>{const h=matchMedia("(min-width: 1024px)");t(3,o=h.matches),h.addEventListener("change",N=>{t(1,f=!1),t(3,o=N.matches),document[o?"removeEventListener":"addEventListener"]("click",C)}),!o&&document.addEventListener("click",C)}),Be(()=>{!o&&typeof document<"u"&&document.removeEventListener("click",C)});function C(h){!o&&f&&(h.target.closest("aside")===null||h.target.closest("a.row")!==null)&&k()}function k(){t(1,f=!f)}const p=()=>t(1,f=!f);return a.$$set=h=>{"data"in h&&t(0,c=h.data),"$$scope"in h&&t(5,i=h.$$scope)},a.$$.update=()=>{a.$$.dirty&16&&(l.routeId||l.routeId==="")&&t(1,f=!1),a.$$.dirty&10&&t(2,s=o||f)},[c,f,s,o,l,i,n,p]}class rt extends te{constructor(e){super(),se(this,e,$e,Xe,ee,{data:0})}}export{rt as component,it as universal};