const PETS=["Tortuga","Canario","Periquito","Cacatua","Agapornis","Iguana","Geco","Serpiente","Gallina","Pato"];
const KEY="virtgochi_state_v1";
const setup=document.getElementById("setup"),game=document.getElementById("game"),petType=document.getElementById("petType"),petName=document.getElementById("petName"),createBtn=document.getElementById("createBtn"),title=document.getElementById("title"),statusEl=document.getElementById("status"),canvas=document.getElementById("screen"),ctx=canvas.getContext("2d");
PETS.forEach(function(p){var o=document.createElement("option");o.value=p;o.textContent=p;petType.appendChild(o);});
function load(){try{return JSON.parse(localStorage.getItem(KEY)||"null");}catch(e){return null;}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));}
function rnd(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function createPet(){var name=(petName.value||"").trim();if(!name){alert("Debes elegir nombre");return;}if(name.length>6){alert("Maximo 6 caracteres");return;}var now=Date.now();var m=rnd(40,90);save({petType:petType.value,name:name,stage:"egg",createdAt:now,hatchAt:now+m*60000});render();}
function left(ms){var m=Math.max(0,Math.floor(ms/60000));var h=Math.floor(m/60);var mm=m%60;return h>0?(h+"h "+mm+"m"):(mm+"m");}
function drawEgg(t){ctx.clearRect(0,0,240,160);ctx.fillStyle="#1f2a1f";ctx.fillRect(0,150,240,4);var w=Math.sin(t/180)*3;ctx.save();ctx.translate(120+w,92);ctx.scale(1.1,1.2);ctx.fillStyle="#fff";ctx.beginPath();ctx.ellipse(0,0,28,34,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#1f2a1f";ctx.lineWidth=2;ctx.stroke();ctx.restore();}
function drawBaby(t,n){ctx.clearRect(0,0,240,160);ctx.fillStyle="#1f2a1f";ctx.fillRect(0,150,240,4);var b=Math.sin(t/140)*2,x=120,y=95+b;ctx.fillStyle="#000";ctx.fillRect(x-12,y-12,24,24);ctx.fillStyle="#fff";ctx.fillRect(x-7,y-4,3,3);ctx.fillRect(x+4,y-4,3,3);ctx.fillStyle="#1f2a1f";ctx.fillText(n,8,14);}
function render(){var s=load();if(!s){setup.classList.remove("hidden");game.classList.add("hidden");return;}setup.classList.add("hidden");game.classList.remove("hidden");var now=Date.now();if(s.stage==="egg"&&now>=s.hatchAt){s.stage="baby";save(s);}if(s.stage==="egg"){title.textContent="🥚 "+s.name+" ("+s.petType+")";statusEl.textContent="Eclosiona en: "+left(s.hatchAt-now);}else{title.textContent="🐣 "+s.name+" ("+s.petType+")";statusEl.textContent="Ha eclosionado!";}}
createBtn.addEventListener("click",createPet);
var t=0;function loop(){var s=load();if(s){if(s.stage==="egg")drawEgg(t);else drawBaby(t,s.name||"PET");}t+=16;requestAnimationFrame(loop);}
render();setInterval(render,10000);loop();
