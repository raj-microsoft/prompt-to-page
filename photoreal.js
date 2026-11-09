import * as T from './vendor/three.module.js';
// LDR studio reflection plate derived from the AI-generated empty cyclorama.
// This is an artistic lighting match, not a measured HDR light probe.
export function studioLighting(scene, renderer, mobile) {
  const pmrem = new T.PMREMGenerator(renderer);
  new T.TextureLoader().load('./assets/studio-reflections.webp', texture => {
    texture.mapping = T.EquirectangularReflectionMapping;
    texture.colorSpace = T.SRGBColorSpace;
    const env = pmrem.fromEquirectangular(texture);
    scene.environment = env.texture;
    scene.environmentIntensity = .95;
    texture.dispose(); pmrem.dispose();
  }, undefined, () => pmrem.dispose());
  scene.add(new T.HemisphereLight('#fffaf0', '#b9b19c', 1.15));
  const key = new T.DirectionalLight('#fff8e9', 2.7);
  key.position.set(-4, 7, 6); scene.add(key);
  const rim = new T.DirectionalLight('#fffffa', 1.5);
  rim.position.set(5, 3, -4); scene.add(rim);
  // Analytic soft contact shadows avoid a second shadow-map render per frame.
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const ctx = c.getContext('2d'), g = ctx.createRadialGradient(64,64,3,64,64,62);
  g.addColorStop(0,'rgba(61,48,25,.31)'); g.addColorStop(.35,'rgba(74,58,32,.16)'); g.addColorStop(1,'rgba(74,58,32,0)');
  ctx.fillStyle=g;ctx.fillRect(0,0,128,128);
  const texture=new T.CanvasTexture(c), shadows=[];
  for(let i=0;i<6;i++){
    const shadow=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,opacity:1}));
    shadow.rotation.x=-Math.PI/2; shadow.position.y=-1.98; shadow.renderOrder=-1; shadow.visible=false;scene.add(shadow);shadows.push(shadow);
  }
  return fruits => shadows.forEach((s,i)=>{const f=fruits[i];s.visible=!!f;if(f){const h=Math.max(0,f.mesh.position.y);s.position.set(f.mesh.position.x,-1.98,f.mesh.position.z);s.scale.set(3.9+h*.25,2.4+h*.2,1);s.material.opacity=1/(1+h*.45);}});
}
