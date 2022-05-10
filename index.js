window.onscroll = () => { window.scroll(0, 0); };

let canvas = null; // Waveform canvas
let ctx = null;
let ratio = 1;
let thr = 1;

let sig = null;
let wet = null;
let gainred = null;
let sigsz = 320;

//===================================
function init(){
  canvas = document.getElementById("waveform");
  ctx = canvas.getContext("2d");
  
  makeSig();
  compress();
  resizeWaveform();
}
init();

//===================================
function makeSig() {
  sig = [];
  let env = 0;
  let ecoef = 1 - Math.exp(-1 / (0.004 * sigsz));
  for (let i = 0; i < sigsz; i++) {
    let p = i / sigsz;
    let t =  1;
    t *= Math.sin(Math.pow(1 - p, 2) * 3.1415926);
    
    let tmp = i / sigsz;
    tmp -= 0.06;
    tmp = Math.min(1, tmp);
    tmp = Math.max(0, tmp);
    tmp = Math.pow(tmp, 0.5);
    tmp = -Math.pow(tmp, 0.5);
    t *= -Math.sin(3.1415926 * tmp);
    
    
    tmp = i / sigsz;
    tmp -= 0.47;
    tmp = Math.min(1, tmp);
    tmp = Math.max(0, tmp);
    tmp = Math.pow(tmp, 0.25);
    tmp = Math.sin(3.1415926 * tmp);
    //let TEST = tmp;
    t *= 1 + 0.8*tmp;
    
    tmp = Math.pow(15*p, 4);
    if(tmp > 1) tmp = 0;
    
    env = Math.max(tmp, env * ecoef);
    t += env * 0.8;
    
    
    tmp = Math.sin(2*(Math.pow(i-0.5,2) + 0.3));
    t += tmp * 0.02;
    
    sig.push(Math.abs(t*0.8) + 0.0000001);
    //sig.push(TEST);
  }
  
  
  wet = sig.slice();
}


//===================================
function compress(){
  let atkMS = parseFloat(document.getElementById("atk_text").value);
  let relMS = parseFloat(document.getElementById("rel_text").value);
  let threshVal = parseFloat(document.getElementById("thresh_text").value);
  let ratio = parseFloat(document.getElementById("ratio_text").value);
  let makeup = parseFloat(document.getElementById("gain_text").value);
 
  ratio = 1 - 1 / ratio;
  
  
  thr = Math.pow(10, threshVal / 20);
  wet = sig.slice();
  gainred = wet.slice();
  
  let acoef = 1 - Math.exp(-1 / (atkMS * 0.001 * sigsz));
  let rcoef = 1 - Math.exp(-1 / (relMS * 0.003 * sigsz));
  let outgain = Math.pow(10, makeup/20);
  let env = 1;  
  for(let i = 0; i < wet.length; i++){
    
    let gr = threshVal - 20 * Math.log10(wet[i]);
    gr = Math.pow(10, ratio * gr / 20);
    gr = Math.min(gr, 1);
    env += (gr - env) * (env < gr ? rcoef : acoef);    
    
    wet[i] *= env * outgain;
    gainred[i] = env;
  }
 
  drawWavform();
}


//===================================
function drawWavform(){
  let w = sig.length;
  let h = canvas.clientHeight;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 2;
  
  // Draw normal wavform
  ctx.beginPath();
  ctx.moveTo(0, h/2);
  
  for(let i = 0; i < sig.length; i++)
  {
    let lx = i / wet.length * canvas.clientWidth;
    ctx.lineTo(lx, h / 2 * (1 + sig[i]));
  }
  ctx.lineTo(canvas.clientWidth, h/2);
  for(let i = sig.length - 1; i >=0; i--){
    let lx = i / wet.length * canvas.clientWidth;
    ctx.lineTo(lx, h / 2 *(1 - sig[i]));
  }
  //YELLOW
  ctx.fillStyle = 'rgba(255, 201, 20,0.6)';
  ctx.fill();
  ctx.strokeStyle="rgb(199,153,0)";
  ctx.stroke();
  
  // Draw compressed wavform
  ctx.beginPath();
  ctx.moveTo(0, h/2);
  
  for(let i = 0; i < sig.length; i++)
  {
    let lx = i / wet.length * canvas.clientWidth;
    ctx.lineTo(lx, h / 2 * (1 + wet[i]));
  }
  ctx.lineTo(canvas.clientWidth, h/2);
  for(let i = sig.length - 1; i >=0; i--){
    let lx = i / wet.length * canvas.clientWidth;
    ctx.lineTo(lx, h / 2 *(1 - wet[i]));
  }
  //BLUE
  ctx.fillStyle = 'rgba(41,30,255,0.7)';
  ctx.fill();
  ctx.strokeStyle="rgb(28, 30, 153)";
  ctx.stroke();
  
  
  // Draw gain reduction wavform
  ctx.beginPath();
  ctx.moveTo(0, 0);
  
  for(let i = 0; i < sig.length; i++)
  {
    let lx = i / gainred.length * canvas.clientWidth;
    ctx.lineTo(lx, h / 4 * (1 - gainred[i]));
  }
  ctx.lineTo(canvas.clientWidth, 0);
  ctx.lineTo(0,0);
  
  //RED
  ctx.fillStyle = 'rgba(255, 83, 20,0.7)';
  ctx.fill();
  ctx.strokeStyle='rgba(255,0,0,0.2)';
  ctx.stroke();
  
  // Draw Threshold wavform
  //White
  ctx.strokeStyle="rgba(255,255,255,0.7)";
  ctx.beginPath();
  let ty = h / 2 * (1-thr);
  ctx.moveTo(0, ty);
  ctx.lineTo(canvas.clientWidth, ty);
  ctx.stroke();
  
}

drawWavform();



//===================================
function resizeWaveform()
{
  let w = document.documentElement.clientWidth;
  let h = document.documentElement.clientHeight;
  //alert(w + " x " + h);
  
  canvas.setAttribute("width", w - 300);
  canvas.setAttribute("height", h-20);
  drawWavform();
}

window.addEventListener("resize", resizeWaveform);