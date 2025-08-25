const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d', { alpha: false });
ctx.imageSmoothingEnabled = false;
if (ctx.webkitImageSmoothingEnabled !== undefined) ctx.webkitImageSmoothingEnabled = false;
if (ctx.mozImageSmoothingEnabled !== undefined) ctx.mozImageSmoothingEnabled = false;

function fitCanvasToScreen() {
  const cssW = window.innerWidth;
  const cssH = window.innerHeight;
  const intScale = Math.max(1, Math.floor(Math.min(cssW / WORLD_BASE_W, cssH / WORLD_BASE_H)));
  const viewW = WORLD_BASE_W * intScale;
  const viewH = WORLD_BASE_H * intScale;
  canvas.style.width = viewW + 'px';
  canvas.style.height = viewH + 'px';
  const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  canvas.width = Math.round(viewW * dpr);
  canvas.height = Math.round(viewH * dpr);
  ctx.setTransform(intScale * dpr, 0, 0, intScale * dpr, 0, 0);
}

window.addEventListener('resize', fitCanvasToScreen);
window.addEventListener('orientationchange', () => setTimeout(fitCanvasToScreen, 250));
document.addEventListener('DOMContentLoaded', fitCanvasToScreen);

window.canvas = canvas;
window.ctx = ctx;
window.fitCanvasToScreen = fitCanvasToScreen;
