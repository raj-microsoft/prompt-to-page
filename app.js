import * as T from './vendor/three.module.js';
import {makeFruit,disposeFruit,names,clipPolygon,area} from './geometry.js';
import {prepare,step,impulse} from './physics.js';
import {studioLighting} from './photoreal.js';
const $=s=>document.querySelector(s),stage=$('#stage');
$('#about-open').onclick=()=>$('#about').showModal();$('#about-close').onclick=()=>$('#about').close();$('#about').addEventListener('click',e=>{if(e.target===$('#about')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()}});
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
function showStill(reason){
 document.body.classList.add('still-mode');$('#fallback').hidden=false;
 $('#fallback-description').textContent=reason;
 document.querySelectorAll('.toolbar button,.fruit-buttons button').forEach(b=>b.disabled=true);
 window.orchard={paused:true,still:true};
}
function startOrchard(){
 const mobile=matchMedia('(max-width: 700px)').matches;
 let renderer;try{renderer=new T.WebGLRenderer({antialias:!mobile,alpha:true,powerPreference:'low-power'});}catch{
 showStill('WebGL is unavailable. Enjoy this AI-generated jelly photograph; interactive tools need WebGL.');return;
 }
 document.body.classList.remove('still-mode');$('#fallback').hidden=true;
 renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1:1.5));
 renderer.setClearColor('#f4f3ed',0);renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 renderer.transmissionResolutionScale=mobile?.5:.8;stage.append(renderer.domElement);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(36,1,.1,100);
 const updateShadows=studioLighting(scene,renderer,mobile);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();showStill('The 3D context was interrupted. The AI-generated still keeps the orchard visible. Reload to try again.');});
 let fruits=[],yaw=.25,pitch=.12,distance=11,drag=null,selected=null,mode='hand',stacked=false,skewer=null,paused=false;
const touches=new Map();let pinchDistance=0;
function notice(text){$('#hint').textContent=text}
function count(){ $('#count').textContent=fruits.length+' / 6';document.querySelectorAll('[data-add]').forEach(b=>b.disabled=fruits.length>=6);$('#duplicate').disabled=fruits.length>=6;$('#stack').disabled=!fruits.length;$('#shake').disabled=paused||!fruits.length;}
function hideMenu(){$('#object-menu').hidden=true;selected=null}
function openMenu(f,x,y){selected=f;const r=stage.getBoundingClientRect();const menu=$('#object-menu');$('#object-title').textContent=names[f.type];menu.hidden=false;menu.style.left=Math.max(10,Math.min(x-r.left+12,r.width-234))+'px';menu.style.top=Math.max(125,Math.min(y-r.top-30,r.height-310))+'px';count()}
const ray=new T.Raycaster(),pointer=new T.Vector2(),plane=new T.Plane(),hitPoint=new T.Vector3();
function rayAt(e){const r=stage.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera)}
function add(type='pear',poly=null,tint=null){if(fruits.length>=6){notice('Six pieces is the limit. Remove one to make room.');return null}const f=prepare(poly?makeFruit(type,poly,tint):makeFruit(type));f.mesh.rotation.z=fruits.length?0:-.16;const slots=[[.9,0,0],[-2.2,-.25,0],[2.65,.45,-.5],[-.7,1.9,-1],[.3,-1.2,1],[-2.7,1.7,-1.4]];f.mesh.position.set(...slots[fruits.length]);scene.add(f.mesh);fruits.push(f);if(stacked)arrangeStack();count();return f}add();
function remove(f){scene.remove(f.mesh);disposeFruit(f);fruits=fruits.filter(x=>x!==f);hideMenu();if(stacked)arrangeStack();count()}
for(const b of document.querySelectorAll('[data-add]'))b.onclick=()=>{hideMenu();add(b.dataset.add);notice('Tap a fruit for colors. Drag it to stretch.')};
$('#duplicate').onclick=()=>{if(!selected)return;const f=add(selected.type,selected.poly.map(p=>p.clone()),selected.tint);if(f&&!stacked){f.mesh.position.copy(selected.mesh.position).add(new T.Vector3(1.7,.65,-.3));f.mesh.rotation.copy(selected.mesh.rotation)}hideMenu()};
$('#remove').onclick=()=>selected&&remove(selected);
for(const b of document.querySelectorAll('[data-color]'))b.onclick=()=>{if(!selected)return;selected.tint=b.dataset.color;selected.mesh.material[1].color.set(b.dataset.color);selected.mesh.material[0].color.set(b.dataset.color);notice('A new shade, same little spring.')};
function resize(){const r=stage.getBoundingClientRect();renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();distance=r.width<700?17:11}addEventListener('resize',resize);resize();
function cameraUpdate(){camera.position.set(Math.sin(yaw)*Math.cos(pitch)*distance,Math.sin(pitch)*distance,Math.cos(yaw)*Math.cos(pitch)*distance);camera.lookAt(0,0,0)}
renderer.domElement.onpointerdown=e=>{touches.set(e.pointerId,{x:e.clientX,y:e.clientY});renderer.domElement.setPointerCapture(e.pointerId);if(touches.size===2){if(drag?.f)drag.f.anchor=null;drag=null;const a=[...touches.values()];pinchDistance=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);return}hideMenu();if(mode==='split'){drag={cut:true,x:e.clientX,y:e.clientY,start:{clientX:e.clientX,clientY:e.clientY}};return}rayAt(e);const hit=ray.intersectObjects(fruits.map(f=>f.mesh))[0];if(hit){const f=fruits.find(f=>f.mesh===hit.object);plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(new T.Vector3()),hit.point);if(!paused)f.anchor={point:f.mesh.worldToLocal(hit.point.clone()),offset:new T.Vector3()};drag={f,x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,moved:false}}else drag={x:e.clientX,y:e.clientY};};
renderer.domElement.onpointermove=e=>{if(touches.has(e.pointerId))touches.set(e.pointerId,{x:e.clientX,y:e.clientY});if(touches.size===2){const a=[...touches.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);distance=Math.max(6,Math.min(25,distance*pinchDistance/Math.max(1,d)));pinchDistance=d;return}if(!drag)return;if(drag.cut){const r=stage.getBoundingClientRect(),l=$('#cut-guide line');l.setAttribute('x1',drag.x-r.left);l.setAttribute('y1',drag.y-r.top);l.setAttribute('x2',e.clientX-r.left);l.setAttribute('y2',e.clientY-r.top)}else if(drag.f){drag.moved ||= Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)>6;if(drag.f.anchor){rayAt(e);ray.ray.intersectPlane(plane,hitPoint);drag.f.anchor.offset.copy(drag.f.mesh.worldToLocal(hitPoint.clone())).sub(drag.f.anchor.point).clampLength(0,1.3)}}else{yaw-=(e.clientX-drag.x)*.006;pitch=Math.max(-.8,Math.min(.8,pitch+(e.clientY-drag.y)*.006));drag.x=e.clientX;drag.y=e.clientY}};
renderer.domElement.onpointerup=e=>{touches.delete(e.pointerId);if(drag?.cut){performCut(drag.start,e);$('#cut-guide line').setAttribute('x2',0);$('#cut-guide line').setAttribute('x1',0);$('#cut-guide line').setAttribute('y1',0);$('#cut-guide line').setAttribute('y2',0)}else if(drag?.f){drag.f.anchor=null;if(!drag.moved)openMenu(drag.f,e.clientX,e.clientY)}drag=null};renderer.domElement.onpointercancel=()=>{if(drag?.f)drag.f.anchor=null;drag=null;touches.clear()};renderer.domElement.onwheel=e=>{e.preventDefault();distance=Math.max(6,Math.min(22,distance+e.deltaY*.008))};
$('#view').onclick=()=>$('#view-panel').hidden=!$('#view-panel').hidden;document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{yaw={front:0,quarter:.65,side:1.45}[b.dataset.view];pitch=0;$('#view-panel').hidden=true});$('#reset').onclick=()=>{stacked=false;if(skewer){scene.remove(skewer);skewer.geometry.dispose();skewer.material.dispose();skewer=null}for(const f of [...fruits])remove(f);add();yaw=.25;pitch=.12;resize();setMode('hand');$('#stack').textContent='Stack';$('#split').disabled=false;notice('Back to one pear. A fresh start.')};
for(const id of ['hand','shake','tune','pause','split','stack','view','reset'])$('#'+id).disabled=false;
$('#hint').textContent='Pull the pear. Let it spring back.';
$('#shake').onclick=()=>{if(!paused)fruits.forEach(impulse)};
$('#tune').onclick=()=>$('#tune-panel').hidden=!$('#tune-panel').hidden;
$('#pause').textContent=paused?'Resume':'Pause';$('#pause').onclick=()=>{paused=!paused;$('#pause').textContent=paused?'Resume':'Pause';notice(paused?'Motion paused. Resume to stretch the fruit.':'Pull a fruit. Let it spring back.');count()};
for(const [id,out] of [['firmness','firm-value'],['damping','damp-value']])$('#'+id).oninput=e=>$('#'+out).value=e.target.value;
let last=performance.now(),lastDraw=0;
function loop(now=performance.now()){
 requestAnimationFrame(loop);
 if(document.hidden||document.body.classList.contains('still-mode')){last=now;return;}
 // Small screens render at 30 Hz; desktop at up to 60. Hidden tabs do no simulation work.
 if(now-lastDraw<1000/(mobile?30:60)-1)return;
 let dt=Math.min((now-last)/1000,.04);last=now;lastDraw=now;
 if(!paused){dt*=$('#slow').checked?.25:1;for(const f of fruits){if(!f.anchor&&!f.active)continue;for(let i=0;i<2;i++)step(f,dt/2,+$('#firmness').value,+$('#damping').value);}}
 cameraUpdate();updateShadows(fruits);renderer.render(scene,camera);
}loop();
function setMode(m){mode=m;$('#hand').setAttribute('aria-pressed',m==='hand');$('#split').setAttribute('aria-pressed',m==='split');hideMenu();if(m==='split'){yaw=0;pitch=0;for(const f of fruits){f.mesh.rotation.x=0;f.mesh.rotation.y=0;}notice('Front view: draw a full stroke across one fruit.')}else notice('Pull a fruit. Tap for colors and editing.');}
$('#hand').onclick=()=>setMode('hand');$('#split').onclick=()=>setMode('split');
function performCut(start,end){if(stacked){notice('Unstack before splitting.');return}if(fruits.length>=6){notice('Six pieces is the limit. Remove one before splitting.');return}if(Math.hypot(end.clientX-start.clientX,end.clientY-start.clientY)<25){notice('Draw a longer line across the fruit.');return}for(const f of [...fruits].reverse()){const planeZ=new T.Plane(new T.Vector3(0,0,1),-f.mesh.position.z);rayAt(start);const aw=ray.ray.intersectPlane(planeZ,new T.Vector3());rayAt(end);const bw=ray.ray.intersectPlane(planeZ,new T.Vector3());if(!aw||!bw)continue;const a=f.mesh.worldToLocal(aw.clone()),b=f.mesh.worldToLocal(bw.clone());const left=clipPolygon(f.poly,a,b,1),right=clipPolygon(f.poly,a,b,-1);if(left.length<3||right.length<3)continue;let crossings=[];const vx=b.x-a.x,vy=b.y-a.y,len2=vx*vx+vy*vy;for(let i=0;i<f.poly.length;i++){const p=f.poly[i],q=f.poly[(i+1)%f.poly.length];const d1=vx*(p.y-a.y)-vy*(p.x-a.x),d2=vx*(q.y-a.y)-vy*(q.x-a.x);if(d1*d2<0){const t=d1/(d1-d2),x=p.x+(q.x-p.x)*t,y=p.y+(q.y-p.y)*t;crossings.push(((x-a.x)*vx+(y-a.y)*vy)/len2)}}if(crossings.length<2||Math.min(...crossings)<0||Math.max(...crossings)>1)continue;if(Math.min(area(left),area(right))<.16){notice('That slice is too small. Try nearer the center.');return}const origin=f.mesh.position.clone(),rotation=f.mesh.rotation.clone(),type=f.type,tint=f.tint;remove(f);for(const [poly,sign]of [[left,1],[right,-1]]){const raw=makeFruit(type,poly,tint);const g=raw.mesh.geometry,old=[...g.groups];g.clearGroups();const pa=g.attributes.position;for(const group of old){for(let i=group.start;i<group.start+group.count;i+=3){let x=0,y=0;for(let k=0;k<3;k++){x+=pa.getX(i+k)/3;y+=pa.getY(i+k)/3}const dist=Math.abs(vx*(y-a.y)-vy*(x-a.x))/Math.sqrt(len2);const mat=group.materialIndex===1&&dist<.11?0:group.materialIndex;const last=g.groups.at(-1);if(last&&last.materialIndex===mat&&last.start+last.count===i)last.count+=3;else g.addGroup(i,3,mat)}}const piece=prepare(raw);piece.mesh.position.copy(origin);const normal=new T.Vector3(-vy,vx,0).normalize().applyEuler(rotation);piece.mesh.position.addScaledVector(normal,sign*.15);piece.mesh.rotation.copy(rotation);scene.add(piece.mesh);fruits.push(piece)}count();setMode('hand');notice('Two closed pieces. Grab either half independently.');return}notice('No cut: draw completely across a fruit, edge to edge.');}
function arrangeStack(){if(skewer){scene.remove(skewer);skewer.geometry.dispose();skewer.material.dispose();skewer=null}if(!fruits.length){stacked=false;$('#stack').textContent='Stack';$('#split').disabled=false;return}const gap=.25,total=fruits.reduce((s,f)=>s+f.depth+.17+gap,0);let y=-total/2;for(const f of fruits){f.mesh.geometry.computeBoundingBox();const c=f.mesh.geometry.boundingBox.getCenter(new T.Vector3());f.mesh.rotation.set(-Math.PI/2,0,0);f.mesh.position.set(-c.x,y+f.depth/2,c.y);f.attached=true;f.attachCenter=c;f.anchor=null;for(const n of f.nodes){n.d.set(0,0,0);n.v.set(0,0,0)}y+=f.depth+.17+gap}skewer=new T.Mesh(new T.CylinderGeometry(.035,.045,total+1.4,12),new T.MeshStandardMaterial({color:'#a88756',roughness:.7}));scene.add(skewer);yaw=.4;pitch=.5;distance=Math.max(stage.clientWidth<700?19:12,total*1.8);}
$('#stack').onclick=()=>{hideMenu();stacked=!stacked;if(stacked){setMode('hand');arrangeStack();notice('Threaded together. Pull the edges; the centers stay put.')}else{if(skewer){scene.remove(skewer);skewer.geometry.dispose();skewer.material.dispose();skewer=null}for(const f of fruits){f.attached=false;for(const n of f.nodes)n.v.multiplyScalar(.2)}notice('Unstacked. Each piece moves independently.')}$('#stack').textContent=stacked?'Unstack':'Stack';$('#split').disabled=stacked;$('#split').title=stacked?'Unstack before splitting':'';};
addEventListener('keydown',e=>{if(e.key==='Escape'){hideMenu();$('#view-panel').hidden=true;$('#tune-panel').hidden=true}if(e.target===document.body&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();yaw+=e.key==='ArrowLeft'?-.1:e.key==='ArrowRight'?.1:0;pitch+=e.key==='ArrowUp'?.1:e.key==='ArrowDown'?-.1:0;pitch=Math.max(-.8,Math.min(.8,pitch))}});
if(paused)notice('Reduced motion: paused. Resume to opt into simulation.');count();
window.orchard={get fruits(){return fruits},get stacked(){return stacked},get paused(){return paused},renderer,scene,camera};

}
if(reducedMotion.matches){
 showStill('Reduced motion: AI-generated studio still. Resume explicitly opts into the interactive simulation.');
 $('#pause').disabled=false;$('#pause').textContent='Resume';$('#pause').onclick=startOrchard;
 $('#hint').textContent='A quieter orchard. Resume to explore in 3D.';
}else startOrchard();
reducedMotion.addEventListener('change',e=>{if(e.matches&&!window.orchard.still){$('#pause').click();showStill('Reduced motion enabled. Reload to choose the interactive simulation.');}});
