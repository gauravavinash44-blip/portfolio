(()=>{const hover=matchMedia("(hover: hover)").matches;
document.querySelectorAll("[data-stack]").forEach(g=>{const L=[...g.querySelectorAll(".dr-stack-l")],S=[...g.querySelectorAll(".dr-stack-s")];
const set=a=>{L.forEach((l,k)=>{l.classList.toggle("is-on",k==a);l.setAttribute("aria-pressed",k==a)});
const A=S[a],al=A.offsetLeft,ar=al+A.offsetWidth;
S.forEach((s,k)=>{const l=s.offsetLeft,w=s.offsetWidth;let fl=-12,fr=-12;
/* inactive screens fade out toward the active one, the fade ending a little inside its edge */
if(k<a)fr=Math.max(0,(l+w-al)/w*100-4);if(k>a)fl=Math.max(0,(ar-l)/w*100-4);
s.style.setProperty("--fl",fl+"%");s.style.setProperty("--fr",fr+"%");s.style.setProperty("--z",k==a?5:4-Math.abs(k-a));s.classList.toggle("is-on",k==a)});g.dataset.a=a};
[...L,...S].forEach(el=>{const i=+el.dataset.i;el.addEventListener("click",()=>set(i));if(hover)el.addEventListener("mouseenter",()=>set(i))});
set(0);addEventListener("resize",()=>set(+g.dataset.a||0));});})();