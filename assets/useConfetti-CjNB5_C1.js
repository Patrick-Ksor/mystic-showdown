import{d as u}from"./ElementBadge.vue_vue_type_script_setup_true_lang-BF3uXu1s.js";function x(){function f(h,p=60){const a=["#ff4d00","#00bfff","#ffe44d","#00ff88","#a855f7","#ff2244","#7fdbff","#c48a2a"],r=[],e=h.getBoundingClientRect();for(let t=0;t<p;t++){const o=document.createElement("div"),n=6+Math.random()*8,s=a[Math.floor(Math.random()*a.length)],d=Math.random()>.5;o.style.cssText=`
        position: fixed;
        width: ${n}px;
        height: ${d?n:n*2}px;
        background: ${s};
        border-radius: ${d?"50%":"2px"};
        top: ${e.top+e.height*.3}px;
        left: ${e.left+e.width*.5}px;
        pointer-events: none;
        z-index: 9999;
        box-shadow: 0 0 4px ${s}88;
      `,document.body.appendChild(o),r.push(o);const i=Math.random()*Math.PI*2,c=100+Math.random()*200,l=Math.cos(i)*c,m=Math.sin(i)*c-100;u.to(o,{x:l,y:m+400+Math.random()*200,rotation:Math.random()*720-360,opacity:0,duration:1.5+Math.random()*1,ease:"power1.out",delay:Math.random()*.3,onComplete:()=>o.remove()})}setTimeout(()=>{r.forEach(t=>{t.parentElement&&t.remove()})},4e3)}return{burst:f}}export{x as u};
