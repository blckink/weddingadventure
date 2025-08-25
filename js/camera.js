const cam = { x: 0, y: 0, zoom: 1 };
const deadzoneX = 40;
const deadzoneY = 30;
const lerp = 0.12;
const minZoom = 1.0;
const maxZoom = 1.5;

function updateCamera(player, levelBounds) {
  const desiredWorldHeight = 11 * TILESIZE_LOGIC;
  const targetZoom = Math.max(minZoom, Math.min(maxZoom, WORLD_BASE_H / desiredWorldHeight));
  cam.zoom += (targetZoom - cam.zoom) * 0.08;

  const targetX = player.x + player.width / 2;
  const targetY = player.y + player.height / 2;
  const viewW = WORLD_BASE_W / cam.zoom;
  const viewH = WORLD_BASE_H / cam.zoom;
  const camCenterX = cam.x + viewW / 2;
  const camCenterY = cam.y + viewH / 2;
  const dx = targetX - camCenterX;
  const dy = targetY - camCenterY;
  if (Math.abs(dx) > deadzoneX) cam.x += (dx - Math.sign(dx) * deadzoneX) * lerp;
  if (Math.abs(dy) > deadzoneY) cam.y += (dy - Math.sign(dy) * deadzoneY) * lerp;

  cam.x = Math.max(levelBounds.x, Math.min(cam.x, levelBounds.w - viewW));
  cam.y = Math.max(levelBounds.y, Math.min(cam.y, levelBounds.h - viewH));
}

function applyCamera(ctx) {
  ctx.save();
  ctx.scale(cam.zoom, cam.zoom);
  ctx.translate(-Math.floor(cam.x), -Math.floor(cam.y));
}

function restoreCamera(ctx) {
  ctx.restore();
}

window.cam = cam;
window.updateCamera = updateCamera;
window.applyCamera = applyCamera;
window.restoreCamera = restoreCamera;
