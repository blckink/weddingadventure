const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d', { alpha: false });
ctx.imageSmoothingEnabled = false;
if (ctx.webkitImageSmoothingEnabled !== undefined) ctx.webkitImageSmoothingEnabled = false;
if (ctx.mozImageSmoothingEnabled !== undefined) ctx.mozImageSmoothingEnabled = false;

let dpr = window.devicePixelRatio || 1;

function resizeCanvas() {
  dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);

window.canvas = canvas;
window.ctx = ctx;
window.getDpr = () => dpr;
