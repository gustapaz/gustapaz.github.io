// Original optical field: continuous light and pigment, not a polygonal mesh.
const canvas=document.querySelector<HTMLCanvasElement>('.light-field');
if(canvas){
 const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,powerPreference:'low-power'});
 if(gl){
  const vertex=`attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}`;
  const fragment=`precision mediump float;
uniform vec2 resolution;uniform vec2 pointer;uniform float time;uniform float progress;uniform float light;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=mat2(.8,.6,-.6,.8)*p*2.03+11.4;a*=.5;}return v;}
void main(){
 vec2 uv=gl_FragCoord.xy/resolution.xy;
 vec2 p=(gl_FragCoord.xy-.5*resolution.xy)/resolution.y;
 float t=time*.045;
 p*=1.-progress*.28;p.x+=sin(progress*5.)*.3;p+=pointer*.055;
 p=mat2(.91,-.414,.414,.91)*p;
 vec2 q=vec2(fbm(p*2.1+vec2(t,-t)),fbm(p*2.1+vec2(4.3,t*.6)));
 float cloud=fbm(p*3.+q*2.6+vec2(t*.3,0.));
 float bend=sin(p.y*2.+t)*.16+sin(p.y*5.-t*.6)*.055;
 float slit=p.x-bend+.05;
 float contour=abs(slit)+(.5-cloud)*.065;
 float core=exp(-abs(contour)*95.);
 float glow=exp(-abs(contour)*7.5);
 float folds=pow(.5+.5*sin(cloud*18.+p.y*4.+t),7.);
 float sweep=pow(max(0.,1.-abs(slit+.22+cloud*.12)),8.);
 float atmosphere=fbm(p*1.4+q+vec2(-t*.4,t*.3));
 vec3 dark=vec3(.029,.021,.052);
 vec3 pigment=vec3(.28,.085,.62)*glow*(.24+cloud*.75);
 pigment+=vec3(.31,.16,.65)*folds*sweep*.36;
 pigment+=vec3(.72,.57,1.)*core*(.3+cloud*.5);
 pigment+=vec3(.09,.09,.22)*atmosphere*.5;
 vec3 color=dark+pigment;
 vec3 paper=mix(vec3(.965,.955,.98),vec3(.59,.43,.79),glow*.75);
 paper-=vec3(.20,.27,.12)*folds*sweep*.7;
 paper+=vec3(.18,.20,.18)*core;
 color=mix(color,paper,light);
 float vignette=1.-smoothstep(.15,1.2,length((uv-.5)*vec2(1.1,.85)));
 color*=mix(mix(.57,.86,light),1.,vignette);
 color+=(hash(gl_FragCoord.xy+mod(time,7.))-.5)*.012;
 gl_FragColor=vec4(color,1.);
}`;
  const compile=(type:number,source:string)=>{const shader=gl.createShader(type)!;gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);return null;}return shader;};
  const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);
  if(vs&&fs){
   const program=gl.createProgram()!;gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
   if(gl.getProgramParameter(program,gl.LINK_STATUS)){
    gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const attr=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
    const res=gl.getUniformLocation(program,'resolution'),clock=gl.getUniformLocation(program,'time'),journey=gl.getUniformLocation(program,'progress'),theme=gl.getUniformLocation(program,'light');
    const cursor=gl.getUniformLocation(program,'pointer');
    let raf=0,last=0,active=true,lost=false,targetX=0,targetY=0,cursorX=0,cursorY=0;const stage=canvas.closest<HTMLElement>('.stage')!;
    const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
    stage.addEventListener('pointermove',e=>{if(!finePointer.matches||reduced())return;targetX=(e.clientX/innerWidth-.5)*2;targetY=(.5-e.clientY/innerHeight)*2;},{passive:true});
    stage.addEventListener('pointerleave',()=>{targetX=targetY=0;},{passive:true});
    const reduced=()=>document.documentElement.dataset.motion==='reduced';
    function size(){const rect=stage.getBoundingClientRect(),ratio=Math.min(devicePixelRatio,innerWidth<760?.85:1.1),limit=Math.min(1,Math.sqrt(1400000/(rect.width*rect.height*ratio*ratio)));canvas!.width=Math.round(rect.width*ratio*limit);canvas!.height=Math.round(rect.height*ratio*limit);gl!.viewport(0,0,canvas!.width,canvas!.height);}
    function draw(now:number){if(lost)return;cursorX=reduced()?0:cursorX+(targetX-cursorX)*.065;cursorY=reduced()?0:cursorY+(targetY-cursorY)*.065;gl!.uniform2f(cursor,cursorX,cursorY);gl!.uniform2f(res,canvas!.width,canvas!.height);gl!.uniform1f(clock,reduced()?12:now*.001);gl!.uniform1f(journey,Number(stage.parentElement!.style.getPropertyValue('--journey'))||0);gl!.uniform1f(theme,document.documentElement.dataset.theme==='light'?1:0);gl!.drawArrays(gl!.TRIANGLES,0,6);canvas!.dataset.ready='true';}
    function tick(now:number){raf=0;if(!active||document.hidden||reduced()||lost)return;if(now-last>=40){draw(now);last=now;}raf=requestAnimationFrame(tick);}
    function resume(){cancelAnimationFrame(raf);raf=0;if(lost)return;draw(performance.now());if(active&&!document.hidden&&!reduced())raf=requestAnimationFrame(tick);}
    new IntersectionObserver(entries=>{active=entries[0].isIntersecting;resume();},{threshold:0}).observe(stage);
    new ResizeObserver(()=>{size();resume();}).observe(stage);
    document.addEventListener('visibilitychange',resume);document.addEventListener('gp:appearance',resume);
    canvas.addEventListener('webglcontextlost',()=>{lost=true;cancelAnimationFrame(raf);canvas!.dataset.ready='false';});
    size();resume();
   }
  }
 }
}
