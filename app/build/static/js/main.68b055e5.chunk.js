(this.webpackJsonpwasm_algorithms=this.webpackJsonpwasm_algorithms||[]).push([[0],[,,,,function(e,t,n){e.exports={hide:"cam_hide__3ofNy"}},,,,,,function(e,t,n){},function(e,t,n){},function(e,t,n){"use strict";n.r(t);var r=n(0),c=n(1),a=n.n(c),i=n(3),s=n.n(i),o=(n(10),n.p+"static/media/WebAssembly_Logo.1381587b.svg"),u=(n(11),n(4)),l=n.n(u);var d=function(){var e=Object(c.useRef)(null),t=Object(c.useRef)(null);return Object(c.useEffect)((function(){if(null!==e&&null!==t.current){var r,c,a=-1,i=1/0;n.e(3).then(n.bind(null,16)).then((function(n){c=n,n.greet(),navigator.mediaDevices.getUserMedia&&navigator.mediaDevices.getUserMedia({video:!0}).then((function(n){null!==e.current&&(r=e.current.getContext("2d")),t.current&&(t.current.srcObject=n),s((new Date).getTime())})).catch((function(e){console.log("Something went wrong!")}))}))}function s(n){if(t.current&&e.current){var o,u=t.current.videoWidth,l=t.current.videoHeight;if(e.current.width=u,e.current.height=l,null===(o=r)||void 0===o||o.drawImage(t.current,0,0,u,l),e.current.width>0)if(e.current&&-1===a){e.current.width=u,e.current.height=l;var d=u*l*4;a=c.alloc(d)}else if(e.current&&r){var h=r.getImageData(0,0,u,l);b=h.data.buffer,j=c.memory.buffer,new Uint8Array(j,a,b.byteLength).set(new Uint8Array(b)),c.sobel(a,u,l);var f=new Uint8ClampedArray(c.memory.buffer,a,u*l*4),g=new ImageData(f,u,l);r.putImageData(g,0,0);var m=(1e3/(n-i)).toFixed(2);i=n,console.log(m)}requestAnimationFrame(s)}var b,j}}),[t,e]),Object(r.jsxs)("div",{children:[Object(r.jsx)("canvas",{ref:e,children:" "}),Object(r.jsx)("video",{className:l.a.hide,autoPlay:!0,ref:t})]})};var h=function(){return Object(r.jsx)("div",{className:"App",children:Object(r.jsxs)("header",{className:"App-header",children:[Object(r.jsx)("img",{src:o,className:"App-logo",alt:"logo"}),Object(r.jsxs)("p",{children:["Cam effects with ",Object(r.jsx)("code",{children:"wasm"})," and ",Object(r.jsx)("code",{children:"rust"})]}),Object(r.jsx)(d,{})]})})},f=function(e){e&&e instanceof Function&&n.e(4).then(n.bind(null,17)).then((function(t){var n=t.getCLS,r=t.getFID,c=t.getFCP,a=t.getLCP,i=t.getTTFB;n(e),r(e),c(e),a(e),i(e)}))};s.a.render(Object(r.jsx)(a.a.StrictMode,{children:Object(r.jsx)(h,{})}),document.getElementById("root")),f()}],[[12,1,2]]]);
//# sourceMappingURL=main.68b055e5.chunk.js.map