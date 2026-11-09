import * as T from './vendor/three.module.js';
export const names={pear:'Pear',orange:'Orange',cucumber:'Cucumber',watermelon:'Melon',bear:'Gummy bear'};
export const palettes={pear:['#89a736','#edf1b6'],orange:['#e98d28','#ffca68'],cucumber:['#447335','#c9de9b'],watermelon:['#4c843f','#ef807c'],bear:['#b54832','#e5a056']};
export function outline(type){const s=new T.Shape();if(type==='pear'){s.moveTo(0,1.65);s.bezierCurveTo(.65,1.75,.4,.7,.95,.1);s.bezierCurveTo(1.75,-.9,.95,-1.7,0,-1.65);s.bezierCurveTo(-.95,-1.7,-1.75,-.9,-.95,.1);s.bezierCurveTo(-.4,.7,-.65,1.75,0,1.65);}else if(type==='watermelon'){s.moveTo(-1.5,.9);s.lineTo(1.5,.9);s.bezierCurveTo(1.55,-1.9,-1.55,-1.9,-1.5,.9);}else if(type==='bear'){s.moveTo(-.45,1.2);s.bezierCurveTo(-1,1.8,-1.5,.8,-.9,.65);s.bezierCurveTo(-1.2,.3,-1.45,.1,-1.2,-.25);s.lineTo(-.7,-.35);s.bezierCurveTo(-1.1,-1.65,-.2,-1.7,0,-1.15);s.bezierCurveTo(.2,-1.7,1.1,-1.65,.7,-.35);s.lineTo(1.2,-.25);s.bezierCurveTo(1.45,.1,1.2,.3,.9,.65);s.bezierCurveTo(1.5,.8,1,1.8,.45,1.2);s.bezierCurveTo(.2,1.35,-.2,1.35,-.45,1.2);}else{let r=type==='cucumber'?.87:1.28;s.absarc(0,0,r,0,Math.PI*2,false);}return s.getPoints(32).filter((p,i,a)=>i===0||p.distanceTo(a[i-1])>.001);}
export function makeFruit(type,poly=outline(type),tint=null){
 const shape=new T.Shape(poly),depth=type==='bear'?.7:.8;
 const raw=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:.18,bevelSize:.12,bevelSegments:5,steps:2,curveSegments:28});raw.translate(0,0,-depth/2);
 const pos=raw.attributes.position,uv=raw.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(pos.getX(i)+2)/4,(pos.getY(i)+2)/4);
 const color=tint||{pear:'#d5de84',orange:'#f2b35e',cucumber:'#9dbc70',watermelon:'#ed9290',bear:'#e7a061'}[type];
 const jelly={color,roughness:.13,metalness:0,clearcoat:1,clearcoatRoughness:.085,transmission:.88,thickness:1.3,ior:1.34,attenuationColor:new T.Color(color),attenuationDistance:2.4,sheen:.12,sheenColor:new T.Color('#f7eac5'),sheenRoughness:.7,envMapIntensity:1.15};
 const mesh=new T.Mesh(raw,[new T.MeshPhysicalMaterial(jelly),new T.MeshPhysicalMaterial(jelly)]);
 return {mesh,poly,type,tint,depth,fullOutline:outline(type)};
}
export function clipPolygon(poly,a,b,side){const out=[];const dist=p=>side*((b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x));for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],dp=dist(p),dq=dist(q);if(dp>=0)out.push(p.clone());if((dp>=0)!==(dq>=0)){let t=dp/(dp-dq);out.push(p.clone().lerp(q,t));}}return out;}
export function area(poly){let a=0;for(let i=0;i<poly.length;i++){let p=poly[i],q=poly[(i+1)%poly.length];a+=p.x*q.y-q.x*p.y}return Math.abs(a/2)}
export function disposeFruit(f){f.mesh.geometry.dispose();for(const m of f.mesh.material){m.map?.dispose();m.dispose()}}
