// Rewritten level editor implementing block manipulation, object placement
// and saving functionality.

const TILE = TILE_NATIVE;

class LevelEditor {
  constructor() {
    this.canvas = document.getElementById('editor');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.currentTool = 'floor';
    this.currentFloor = 'solid_mass';
    this.drawing = false;

    this.loadState();

    this.assets = { enemy: {}, gem: null };
    this.loadAssets().then(() => {
      this.setupPalette();
      this.draw();
      this.bindEvents();
    });
  }

  loadState() {
    if (typeof collisions !== 'undefined') {
      this.gridHeight = collisions.length;
      this.gridWidth = collisions[0].length;
      this.floors = collisions.map((row, y) =>
        row.map((cell, x) => {
          if (!cell) return 'air';
          const north = collisions[y - 1]?.[x] || 0;
          const south = collisions[y + 1]?.[x] || 0;
          if (!south) return 'overhang';
          if (!north) return 'grass_top';
          return 'solid_mass';
        }),
      );
      this.blockers =
        typeof l_Blockers !== 'undefined' && l_Blockers.length
          ? l_Blockers
          : collisions.map((row) => row.map(() => 0));
      this.deaths =
        typeof l_Deaths !== 'undefined' && l_Deaths.length
          ? l_Deaths
          : collisions.map((row) => row.map(() => 0));
      this.illusions =
        typeof l_Illusions !== 'undefined' && l_Illusions.length
          ? l_Illusions
          : collisions.map((row) => row.map(() => 0));
      this.canvas.width = this.gridWidth * TILE;
      this.canvas.height = this.gridHeight * TILE;
    } else {
      this.gridWidth = this.canvas.width / TILE;
      this.gridHeight = this.canvas.height / TILE;
      this.floors = Array.from({ length: this.gridHeight }, () =>
        Array(this.gridWidth).fill('air'),
      );
      this.blockers = Array.from({ length: this.gridHeight }, () =>
        Array(this.gridWidth).fill(0),
      );
      this.deaths = Array.from({ length: this.gridHeight }, () =>
        Array(this.gridWidth).fill(0),
      );
      this.illusions = Array.from({ length: this.gridHeight }, () =>
        Array(this.gridWidth).fill(0),
      );
    }

    this.gems = [];
    if (typeof l_Gems !== 'undefined') {
      l_Gems.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) this.gems.push({ x, y });
        });
      });
    }

    this.enemies = [];
    if (typeof l_Enemies !== 'undefined') {
      l_Enemies.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell === 1) this.enemies.push({ x, y, type: 'oposum' });
          else if (cell === 2) this.enemies.push({ x, y, type: 'eagle' });
        });
      });
    }

    this.defaultState = JSON.parse(
      JSON.stringify({
        floors: this.floors,
        blockers: this.blockers,
        deaths: this.deaths,
        illusions: this.illusions,
        gems: this.gems,
        enemies: this.enemies,
      }),
    );
  }

  loadAssets() {
    return Promise.all([
      loadImage('./images/floor.png'),
      loadImage('./images/oposum.png'),
      loadImage('./images/eagle.png'),
      loadImage('./images/gem.png'),
    ]).then(([_floor, oposum, eagle, gem]) => {
      this.assets.enemy.oposum = oposum;
      this.assets.enemy.eagle = eagle;
      this.assets.gem = gem;
    });
  }

  setupPalette() {
    const palette = document.getElementById('palette');
    palette.innerHTML = '';
    const mapping = {
      grass_top: 'grass_mid',
      solid_mass: 'mass_plain',
      overhang: 'grass_overhang_mid',
    };
    FloorTiles.LOGICAL_TYPES.forEach((type) => {
      const cvs = document.createElement('canvas');
      cvs.width = 32;
      cvs.height = 32;
      const pctx = cvs.getContext('2d');
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
      cvs.addEventListener('click', () => {
        this.currentTool = 'floor';
        this.currentFloor = type;
      });
      palette.appendChild(cvs);
    });
  }

  bindEvents() {
    const toolbar = document.getElementById('toolbar');
    toolbar.addEventListener('click', (e) => {
      const tool = e.target.dataset.tool;
      if (tool) this.currentTool = tool;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      this.drawing = true;
      this.handlePointer(e);
    });
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.drawing) this.handlePointer(e);
    });
    window.addEventListener('mouseup', () => (this.drawing = false));

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.drawing = true;
      this.handlePointer(e);
    });
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (this.drawing) this.handlePointer(e);
    });
    window.addEventListener('touchend', () => (this.drawing = false));

    document.getElementById('save').addEventListener('click', () => this.save());
    document.getElementById('reset').addEventListener('click', () => this.reset());
    document
      .getElementById('extend')
      .addEventListener('click', () => this.extend());
  }

  getPos(evt) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
    const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
    const x = Math.floor(((clientX - rect.left) * scaleX) / TILE);
    const y = Math.floor(((clientY - rect.top) * scaleY) / TILE);
    return { x, y };
  }

  handlePointer(evt) {
    const { x, y } = this.getPos(evt);
    if (x < 0 || y < 0 || x >= this.gridWidth || y >= this.gridHeight) return;

    switch (this.currentTool) {
      case 'floor':
        this.floors[y][x] = this.currentFloor;
        break;
      case 'blocker':
        this.blockers[y][x] = 1;
        break;
      case 'death':
        this.deaths[y][x] = 1;
        break;
      case 'illusion':
        this.illusions[y][x] = 1;
        break;
      case 'enemy-oposum':
      case 'enemy-eagle':
        const type = this.currentTool.split('-')[1];
        if (!this.enemies.some((e) => e.x === x && e.y === y))
          this.enemies.push({ x, y, type });
        break;
      case 'gem':
        if (!this.gems.some((g) => g.x === x && g.y === y))
          this.gems.push({ x, y });
        break;
      case 'erase':
        this.floors[y][x] = 'air';
        this.blockers[y][x] = 0;
        this.deaths[y][x] = 0;
        this.illusions[y][x] = 0;
        this.enemies = this.enemies.filter((e) => !(e.x === x && e.y === y));
        this.gems = this.gems.filter((g) => !(g.x === x && g.y === y));
        break;
    }

    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const name = FloorTiles.autotile(this.floors, x, y);
        if (name) {
          const pos = FloorTiles.FLOOR_TILES[name];
          const sx = (pos.c - 1) * FloorTiles.SRC_TILE;
          const sy = (pos.r - 1) * FloorTiles.SRC_TILE;
          this.ctx.drawImage(
            FloorTiles.floorAtlas,
            sx,
            sy,
            FloorTiles.SRC_TILE,
            FloorTiles.SRC_TILE,
            x * TILE,
            y * TILE,
            TILE,
            TILE,
          );
        }
        if (this.blockers[y][x]) {
          this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
          this.ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        }
        if (this.deaths[y][x]) {
          this.ctx.fillStyle = 'rgba(255,0,0,0.3)';
          this.ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        }
        if (this.illusions[y][x]) {
          this.ctx.fillStyle = 'rgba(0,0,255,0.3)';
          this.ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        }
        this.ctx.strokeStyle = '#444';
        this.ctx.strokeRect(x * TILE, y * TILE, TILE, TILE);
      }
    }

    this.enemies.forEach((e) => {
      const img = this.assets.enemy[e.type];
      if (img) this.ctx.drawImage(img, e.x * TILE, e.y * TILE, TILE, TILE);
    });

    this.gems.forEach((g) => {
      this.ctx.drawImage(
        this.assets.gem,
        g.x * TILE + TILE / 4,
        g.y * TILE + TILE / 4,
        TILE / 2,
        TILE / 2,
      );
    });
  }

  save() {
    const gemGrid = Array.from({ length: this.gridHeight }, () =>
      Array(this.gridWidth).fill(0),
    );
    this.gems.forEach((g) => (gemGrid[g.y][g.x] = 18));

    const enemyGrid = Array.from({ length: this.gridHeight }, () =>
      Array(this.gridWidth).fill(0),
    );
    this.enemies.forEach((e) => {
      enemyGrid[e.y][e.x] = e.type === 'eagle' ? 2 : 1;
    });

    const statusEl = document.getElementById('save-status');
    fetch('save.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collisions: this.floors.map((row) => row.map((c) => (c === 'air' ? 0 : 1))),
        gems: gemGrid,
        enemies: enemyGrid,
        blockers: this.blockers,
        deaths: this.deaths,
        illusions: this.illusions,
      }),
      cache: 'no-store',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Save failed');
        return res.text();
      })
      .then((text) => {
        document.getElementById('output').value = text;
        statusEl.textContent = 'Level saved';
        statusEl.style.color = 'lightgreen';
      })
      .catch(() => {
        document.getElementById('output').value = 'Save failed';
        statusEl.textContent = 'Save failed';
        statusEl.style.color = 'red';
      });

    localStorage.setItem(
      'editorMap',
      JSON.stringify({
        floors: this.floors,
        blockers: this.blockers,
        deaths: this.deaths,
        illusions: this.illusions,
        gems: this.gems,
        enemies: this.enemies,
      }),
    );
  }

  reset() {
    const state = JSON.parse(JSON.stringify(this.defaultState));
    this.floors = state.floors;
    this.blockers = state.blockers;
    this.deaths = state.deaths;
    this.illusions = state.illusions;
    this.gems = state.gems;
    this.enemies = state.enemies;
    localStorage.removeItem('editorMap');
    this.gridHeight = this.floors.length;
    this.gridWidth = this.floors[0].length;
    this.canvas.width = this.gridWidth * TILE;
    this.canvas.height = this.gridHeight * TILE;
    this.draw();
  }

  extend() {
    const cols = parseInt(prompt('Columns to add?', '10'), 10);
    if (!cols) return;
    this.floors.forEach((row) => row.push(...Array(cols).fill('air')));
    this.blockers.forEach((row) => row.push(...Array(cols).fill(0)));
    this.deaths.forEach((row) => row.push(...Array(cols).fill(0)));
    this.illusions.forEach((row) => row.push(...Array(cols).fill(0)));
    this.gridWidth += cols;
    this.canvas.width = this.gridWidth * TILE;
    this.draw();
  }
}

// Start editor once floor atlas is ready
if (FloorTiles.floorAtlas.complete) new LevelEditor();
else FloorTiles.floorAtlas.onload = () => new LevelEditor();
