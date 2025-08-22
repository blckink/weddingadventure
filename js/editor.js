const canvas = document.getElementById('editor');
const ctx = canvas.getContext('2d');

const tileSize = 32;
const gridWidth = canvas.width / tileSize;
const gridHeight = canvas.height / tileSize;

const floors = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0));
let enemies = [];
let gems = [];
let currentTool = 'floor';

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      if (floors[y][x]) {
        ctx.fillStyle = '#555';
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
      ctx.strokeStyle = '#444';
      ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }

  ctx.fillStyle = 'red';
  enemies.forEach((e) => {
    ctx.fillRect(e.x * tileSize + 8, e.y * tileSize + 8, tileSize - 16, tileSize - 16);
  });

  ctx.fillStyle = 'cyan';
  gems.forEach((g) => {
    ctx.beginPath();
    ctx.arc(g.x * tileSize + tileSize / 2, g.y * tileSize + tileSize / 2, tileSize / 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

drawGrid();

function getPos(evt) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((evt.clientX - rect.left) / tileSize);
  const y = Math.floor((evt.clientY - rect.top) / tileSize);
  return { x, y };
}

let drawing = false;
canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  handle(e);
});
canvas.addEventListener('mousemove', (e) => {
  if (drawing) handle(e);
});
window.addEventListener('mouseup', () => {
  drawing = false;
});

function handle(evt) {
  const { x, y } = getPos(evt);
  if (x < 0 || y < 0 || x >= gridWidth || y >= gridHeight) return;

  if (currentTool === 'floor') {
    floors[y][x] = 1;
  } else if (currentTool === 'enemy') {
    if (!enemies.some((e) => e.x === x && e.y === y)) enemies.push({ x, y });
  } else if (currentTool === 'gem') {
    if (!gems.some((g) => g.x === x && g.y === y)) gems.push({ x, y });
  } else if (currentTool === 'erase') {
    floors[y][x] = 0;
    enemies = enemies.filter((e) => !(e.x === x && e.y === y));
    gems = gems.filter((g) => !(g.x === x && g.y === y));
  }

  drawGrid();
}

document.getElementById('toolbar').addEventListener('click', (e) => {
  const tool = e.target.dataset.tool;
  if (tool) currentTool = tool;
});

document.getElementById('save').addEventListener('click', () => {
  const data = JSON.stringify({ floors, enemies, gems }, null, 2);
  document.getElementById('output').value = data;

  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'map.json';
  a.click();
  URL.revokeObjectURL(url);
});
