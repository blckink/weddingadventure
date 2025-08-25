const canvas = document.getElementById('editor');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const tileSize = 64;
let gridWidth;
let gridHeight;
let floors;
let enemies = [];
let gems = [];
let blockers;
let deaths;
let illusions;

if (typeof collisions !== 'undefined') {
  gridHeight = collisions.length;
  gridWidth = collisions[0].length;
  floors = collisions.map((row) =>
    row.map((cell) => (cell ? 'solid_mass' : 'air')),
  );
  blockers =
    typeof l_Blockers !== 'undefined' && l_Blockers.length
      ? l_Blockers
      : collisions.map((row) => row.map(() => 0));
  deaths =
    typeof l_Deaths !== 'undefined' && l_Deaths.length
      ? l_Deaths
      : collisions.map((row) => row.map(() => 0));
  illusions =
    typeof l_Illusions !== 'undefined' && l_Illusions.length
      ? l_Illusions
      : collisions.map((row) => row.map(() => 0));
  canvas.width = gridWidth * tileSize;
  canvas.height = gridHeight * tileSize;
} else {
  gridWidth = canvas.width / tileSize;
  gridHeight = canvas.height / tileSize;
  floors = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill('air'),
  );
  blockers = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(0),
  );
  deaths = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(0),
  );
  illusions = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(0),
  );
}

if (typeof l_Gems !== 'undefined') {
  l_Gems.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) gems.push({ x, y });
    });
  });
}

if (typeof l_Enemies !== 'undefined') {
  l_Enemies.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === 1) enemies.push({ x, y, type: 'oposum' });
      else if (cell === 2) enemies.push({ x, y, type: 'eagle' });
    });
  });
}

const defaultState = JSON.parse(
  JSON.stringify({ floors, enemies, gems, blockers, deaths, illusions }),
);
const enemyImgs = {};
let gemImg;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

Promise.all([
  loadImage('./images/floor.png'),
  loadImage('./images/oposum.png'),
  loadImage('./images/eagle.png'),
  loadImage('./images/gem.png'),
]).then(([_, oposum, eagle, gem]) => {
  enemyImgs.oposum = oposum;
  enemyImgs.eagle = eagle;
  gemImg = gem;
  const saved = localStorage.getItem('editorMap');
  if (saved) {
    const parsed = JSON.parse(saved);
    floors = parsed.floors;
    enemies = parsed.enemies || [];
    gems = parsed.gems || [];
    blockers = parsed.blockers || blockers;
    deaths = parsed.deaths || deaths;
    illusions = parsed.illusions || illusions;
    gridHeight = floors.length;
    gridWidth = floors[0].length;
    canvas.width = gridWidth * tileSize;
    canvas.height = gridHeight * tileSize;
  }
  setupPalette();
  drawGrid();
});
let currentTool = 'floor';
let currentFloorType = 'solid_mass';

function setupPalette() {
  const palette = document.getElementById('palette');
  palette.innerHTML = '';
  const mapping = {
    grass_top: 'grass_mid',
    solid_mass: 'mass_plain',
    overhang: 'grass_overhang_mid',
  };
  FloorTiles.LOGICAL_TYPES.forEach((type) => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const pctx = canvas.getContext('2d');
    const tileName = mapping[type] || 'mass_plain';
    const pos = FloorTiles.FLOOR_TILES[tileName];
    pctx.imageSmoothingEnabled = false;
    pctx.drawImage(
      FloorTiles.floorAtlas,
      (pos.c - 1) * FloorTiles.SRC_TILE,
      (pos.r - 1) * FloorTiles.SRC_TILE,
      FloorTiles.SRC_TILE,
      FloorTiles.SRC_TILE,
      0,
      0,
      32,
      32,
    );
    canvas.addEventListener('click', () => {
      currentTool = 'floor';
      currentFloorType = type;
    });
    palette.appendChild(canvas);
  });
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const name = FloorTiles.autotile(floors, x, y);
      if (name) {
        const pos = FloorTiles.FLOOR_TILES[name];
        const sx = (pos.c - 1) * FloorTiles.SRC_TILE;
        const sy = (pos.r - 1) * FloorTiles.SRC_TILE;
        ctx.drawImage(
          FloorTiles.floorAtlas,
          sx,
          sy,
          FloorTiles.SRC_TILE,
          FloorTiles.SRC_TILE,
          x * tileSize,
          y * tileSize,
          tileSize,
          tileSize,
        );
      }
      if (blockers[y][x]) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
      if (deaths[y][x]) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
      if (illusions[y][x]) {
        ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
      ctx.strokeStyle = '#444';
      ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }

  enemies.forEach((e) => {
    const img = enemyImgs[e.type] || enemyImgs.oposum;
    if (img) ctx.drawImage(img, e.x * tileSize, e.y * tileSize, tileSize, tileSize);
  });

  gems.forEach((g) => {
    ctx.drawImage(
      gemImg,
      g.x * tileSize + tileSize / 4,
      g.y * tileSize + tileSize / 4,
      tileSize / 2,
      tileSize / 2,
    );
  });
}

function getPos(evt) {
  const rect = canvas.getBoundingClientRect();
  const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
  const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
  const x = Math.floor((clientX - rect.left) / tileSize);
  const y = Math.floor((clientY - rect.top) / tileSize);
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

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  drawing = true;
  handle(e);
});
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (drawing) handle(e);
});
window.addEventListener('touchend', () => {
  drawing = false;
});

function handle(evt) {
  const { x, y } = getPos(evt);
  if (x < 0 || y < 0 || x >= gridWidth || y >= gridHeight) return;

  if (currentTool === 'floor') {
    floors[y][x] = currentFloorType;
  } else if (currentTool === 'blocker') {
    blockers[y][x] = 1;
  } else if (currentTool === 'death') {
    deaths[y][x] = 1;
  } else if (currentTool === 'illusion') {
    illusions[y][x] = 1;
  } else if (currentTool.startsWith('enemy-')) {
    const type = currentTool.split('-')[1];
    if (!enemies.some((e) => e.x === x && e.y === y)) enemies.push({ x, y, type });
  } else if (currentTool === 'gem') {
    if (!gems.some((g) => g.x === x && g.y === y)) gems.push({ x, y });
  } else if (currentTool === 'erase') {
    floors[y][x] = 'air';
    blockers[y][x] = 0;
    deaths[y][x] = 0;
    illusions[y][x] = 0;
    enemies = enemies.filter((e) => !(e.x === x && e.y === y));
    gems = gems.filter((g) => !(g.x === x && g.y === y));
  }

  drawGrid();
}

document.getElementById('toolbar').addEventListener('click', (e) => {
  const tool = e.target.dataset.tool;
  if (tool) currentTool = tool;
});

document.getElementById('save').addEventListener('click', async () => {
  const gemGrid = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(0),
  );
  gems.forEach((g) => {
    gemGrid[g.y][g.x] = 18;
  });
  const enemyGrid = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(0),
  );
  enemies.forEach((e) => {
    enemyGrid[e.y][e.x] = e.type === 'eagle' ? 2 : 1;
  });
  const statusEl = document.getElementById('save-status');
  try {
    const res = await fetch('save.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collisions: floors.map((row) =>
          row.map((cell) => (cell === 'air' ? 0 : 1)),
        ),
        gems: gemGrid,
        enemies: enemyGrid,
        blockers,
        deaths,
        illusions,
      }),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Save failed');
    const text = await res.text();
    document.getElementById('output').value = text;
    statusEl.textContent = 'Level saved';
    statusEl.style.color = 'lightgreen';
  } catch (err) {
    console.error(err);
    document.getElementById('output').value = 'Save failed';
    statusEl.textContent = 'Save failed';
    statusEl.style.color = 'red';
  }
  localStorage.setItem(
    'editorMap',
    JSON.stringify({ floors, enemies, gems, blockers, deaths, illusions }),
  );
});

document.getElementById('reset').addEventListener('click', () => {
  const state = JSON.parse(JSON.stringify(defaultState));
  floors = state.floors;
  enemies = state.enemies;
  gems = state.gems;
  blockers = state.blockers;
  deaths = state.deaths;
  illusions = state.illusions;
  localStorage.removeItem('editorMap');
  gridHeight = floors.length;
  gridWidth = floors[0].length;
  canvas.width = gridWidth * tileSize;
  canvas.height = gridHeight * tileSize;
  drawGrid();
});

document.getElementById('extend').addEventListener('click', () => {
  const cols = parseInt(prompt('Columns to add?', '10'), 10);
  if (!cols) return;
  floors.forEach((row) => row.push(...Array(cols).fill('air')));
  blockers.forEach((row) => row.push(...Array(cols).fill(0)));
  deaths.forEach((row) => row.push(...Array(cols).fill(0)));
  illusions.forEach((row) => row.push(...Array(cols).fill(0)));
  gridWidth += cols;
  canvas.width = gridWidth * tileSize;
  drawGrid();
});
