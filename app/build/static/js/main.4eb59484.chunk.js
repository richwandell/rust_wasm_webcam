(this.webpackJsonpwasm_algorithms=this.webpackJsonpwasm_algorithms||[]).push([[0],[,,function(e,t,n){e.exports={hide:"cam_hide__3ykpy",flex:"cam_flex__2nGjf",sideDiv:"cam_sideDiv__2z-E5",buttonList:"cam_buttonList__28TZE"}},,,,,,,,function(e,t,n){},function(e,t,n){},function(e,t,n){"use strict";n.r(t);var c=n(0),r=n(1),i=n.n(r),a=n(4),s=n.n(a),u=(n(10),n.p+"static/media/WebAssembly_Logo.1381587b.svg"),l=(n(11),n(2)),o=n.n(l);function d(e,t,c,r,i,a,s){if(null!==e.current&&null!==t.current&&null!==c.current&&null!==r.current&&null!==i.current&&null!==a.current&&null!==s.current){var u,l,o=-1,d=1/0,b=0,j=0;c.current.addEventListener("click",(function(){j=1===j?0:1})),r.current.addEventListener("click",(function(){j=2===j?0:2})),i.current.addEventListener("click",(function(){j=3===j?0:3})),a.current.addEventListener("click",(function(){j=4===j?0:4})),s.current.addEventListener("click",(function(){j=5===j?0:5})),n.e(3).then(n.bind(null,15)).then((function(e){l=e,navigator.mediaDevices.getUserMedia&&navigator.mediaDevices.getUserMedia({video:!0}).then(h).catch((function(){console.log("Something went wrong!")}))}))}function f(n){var c;if(t.current&&e.current){!function(e){b%5===0&&(document.querySelector("#fps").innerHTML=(1e3/(e-d)).toFixed(2));(b+=1)>5&&(b=0);d=e}(n);var r=t.current.videoWidth,i=t.current.videoHeight;if(r>0&&e.current&&-1===o)return function(n,c){if(t.current&&e.current){e.current.width=n,e.current.height=c;var r=n*c*4;return o=l.alloc(r),requestAnimationFrame(f)}}(r,i);if(null===(c=u)||void 0===c||c.drawImage(t.current,0,0,r,i),0===j||!(r>0&&e.current&&u))return requestAnimationFrame(f);var a,s,h=u.getImageData(0,0,r,i);switch(a=h.data.buffer,s=l.memory.buffer,new Uint8Array(s,o,a.byteLength).set(new Uint8Array(a)),j){case 1:l.sobel(o,r,i);break;case 2:l.box_blur(o,r,i);break;case 3:l.sharpen(o,r,i);break;case 4:l.emboss(o,r,i);break;case 5:l.laplacian(o,r,i)}var m=new Uint8ClampedArray(l.memory.buffer,o,r*i*4),v=new ImageData(m,r,i);u.putImageData(v,0,0),requestAnimationFrame(f)}}function h(n){null!==e.current&&(u=e.current.getContext("2d")),t.current&&(t.current.srcObject=n),f((new Date).getTime())}}var b=function(){var e=Object(r.useRef)(null),t=Object(r.useRef)(null),n=Object(r.useRef)(null),i=Object(r.useRef)(null),a=Object(r.useRef)(null),s=Object(r.useRef)(null),u=Object(r.useRef)(null);return Object(r.useEffect)((function(){return d(e,t,n,i,a,s,u)}),[n,t,e]),Object(c.jsxs)("div",{className:o.a.flex,children:[Object(c.jsx)("div",{className:o.a.sideDiv,children:Object(c.jsxs)("ul",{className:o.a.buttonList,children:[Object(c.jsx)("li",{children:Object(c.jsx)("button",{ref:n,children:"Sobel Edge Detection"})}),Object(c.jsx)("li",{children:Object(c.jsx)("button",{ref:i,children:"Box Blur"})}),Object(c.jsx)("li",{children:Object(c.jsx)("button",{ref:a,children:"Sharpen"})}),Object(c.jsx)("li",{children:Object(c.jsx)("button",{ref:s,children:"Emboss"})}),Object(c.jsx)("li",{children:Object(c.jsx)("button",{ref:u,children:"Laplacian"})})]})}),Object(c.jsx)("canvas",{ref:e,children:" "}),Object(c.jsx)("video",{className:o.a.hide,autoPlay:!0,ref:t}),Object(c.jsx)("div",{className:o.a.sideDiv})]})};var j=function(){return Object(c.jsx)("div",{className:"App",children:Object(c.jsxs)("header",{className:"App-header",children:[Object(c.jsx)("img",{src:u,className:"App-logo",alt:"logo"}),Object(c.jsxs)("p",{children:["Cam effects with ",Object(c.jsx)("code",{children:"wasm"})," and ",Object(c.jsx)("code",{children:"rust"})," ",Object(c.jsx)("span",{id:"fps"}),"fps"]}),Object(c.jsx)(b,{})]})})},f=function(e){e&&e instanceof Function&&n.e(4).then(n.bind(null,16)).then((function(t){var n=t.getCLS,c=t.getFID,r=t.getFCP,i=t.getLCP,a=t.getTTFB;n(e),c(e),r(e),i(e),a(e)}))};s.a.render(Object(c.jsx)(i.a.StrictMode,{children:Object(c.jsx)(j,{})}),document.getElementById("root")),f()}],[[12,1,2]]]);
//# sourceMappingURL=main.4eb59484.chunk.js.map