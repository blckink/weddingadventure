// Simple camera that centers on the player
// and scales according to device pixel ratio

const cam = { x: 0, y: 0 };
let dpr = window.getDpr ? window.getDpr() : window.devicePixelRatio || 1;

function updateCamera(player) {
  dpr = window.getDpr ? window.getDpr() : window.devicePixelRatio || 1;
  cam.x = Math.max(0, player.x - canvas.width / (2 * (dpr + 1)));
  cam.y = Math.max(0, player.y - canvas.height / (2 * (dpr + 1)));
}

function applyCamera(ctx) {
  ctx.save();
  ctx.scale(dpr + 1, dpr + 1);
  const camX = Math.round(cam.x);
  const camY = Math.round(cam.y);
  ctx.translate(-camX, -camY);
}

function restoreCamera(ctx) {
  ctx.restore();
}

window.cam = cam;
window.updateCamera = updateCamera;
window.applyCamera = applyCamera;
window.restoreCamera = restoreCamera;

