const SRC_TILE = 32;
const DST_TILE = TILE_NATIVE;
const SCALE = DST_TILE / SRC_TILE;

const floorAtlas = new Image();
floorAtlas.src = './images/floor.png';

// Mapping table: logical tile name -> {col,row}
// 1-based columns/rows
const FLOOR_TILES = {
  grass_left: { c: 1, r: 1 },
  grass_mid: { c: 2, r: 1 },
  grass_right: { c: 3, r: 1 },
  grass_overhang_left: { c: 4, r: 1 },
  grass_overhang_mid: { c: 5, r: 1 },
  grass_overhang_right: { c: 6, r: 1 },
  mass_corner_ur_hollow: { c: 7, r: 1 },
  mass_bottom_hollow: { c: 8, r: 1 },
  mass_corner_ul_hollow: { c: 9, r: 1 },

  chasm_end_left: { c: 1, r: 2 },
  mass_plain: { c: 2, r: 2 },
  chasm_end_right: { c: 3, r: 2 },
  chasm_mid_inset_right: { c: 4, r: 2 },
  hole: { c: 5, r: 2 },
  chasm_mid_inset_left: { c: 6, r: 2 },
  mass_with_air_right: { c: 7, r: 2 },
  air: { c: 8, r: 2 },
  mass_with_air_left: { c: 9, r: 2 },

  bottom_left: { c: 1, r: 3 },
  bottom_mid: { c: 2, r: 3 },
  bottom_right: { c: 3, r: 3 },
  bottom_left_with_diag_up_right_hollow: { c: 4, r: 3 },
  bottom_mid_with_up_hollow: { c: 5, r: 3 },
  bottom_right_with_diag_up_left_hollow: { c: 6, r: 3 },
  bottom_mass_with_air_ur: { c: 7, r: 3 },
  bottom_mass_with_air_u: { c: 8, r: 3 },
  bottom_mass_with_air_ul: { c: 9, r: 3 },

  transparent_a: { c: 1, r: 4 },
  grass_left_dup: { c: 2, r: 4 },
  grass_right_dup: { c: 3, r: 4 },
  transparent_b: { c: 4, r: 4 },
  platform_to_ground_left: { c: 5, r: 4 },
  platform_to_ground_right: { c: 6, r: 4 },
  grass_solo_only_below: { c: 7, r: 4 },
  ceiling_spikes_top_a: { c: 8, r: 4 },
  ceiling_spikes_top_b: { c: 9, r: 4 },

  platform_short_left: { c: 1, r: 5 },
  platform_transition_left_dup: { c: 2, r: 5 },
  platform_transition_right_dup: { c: 3, r: 5 },
  platform_short_right: { c: 4, r: 5 },
  cave_entrance_left: { c: 5, r: 5 },
  cave_entrance_right: { c: 6, r: 5 },
  solo_floor_join_lr_down_air: { c: 7, r: 5 },
  ceiling_spikes_tip_a: { c: 8, r: 5 },
  ceiling_spikes_tip_b: { c: 9, r: 5 },

  empty_a: { c: 1, r: 6 },
  bottom_left_dup: { c: 2, r: 6 },
  bottom_right_dup: { c: 3, r: 6 },
  empty_b: { c: 4, r: 6 },
  cave_to_grass_transition_right: { c: 5, r: 6 },
  cave_to_grass_transition_left: { c: 6, r: 6 },
  floating_left: { c: 7, r: 6 },
  floating_mid: { c: 8, r: 6 },
  floating_right: { c: 9, r: 6 },
};

// draw tile by logical name
function drawFloorTile(ctx, name, dx, dy) {
  const pos = FLOOR_TILES[name];
  if (!pos) return;
  const sx = (pos.c - 1) * SRC_TILE;
  const sy = (pos.r - 1) * SRC_TILE;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    floorAtlas,
    sx,
    sy,
    SRC_TILE,
    SRC_TILE,
    dx,
    dy,
    DST_TILE,
    DST_TILE
  );
}

// Autotile logic for basic grass and solid masses
function autotile(grid, x, y) {
  const type = grid[y]?.[x];
  const north = grid[y - 1]?.[x] || 'air';
  const south = grid[y + 1]?.[x] || 'air';
  const west = grid[y]?.[x - 1] || 'air';
  const east = grid[y]?.[x + 1] || 'air';

  if (type === 'grass_top') {
    if (south === 'solid_mass' || south === 'grass_top') {
      if (west !== 'grass_top') return 'grass_left';
      if (east !== 'grass_top') return 'grass_right';
      return 'grass_mid';
    } else {
      if (west !== 'grass_top') return 'grass_overhang_left';
      if (east !== 'grass_top') return 'grass_overhang_right';
      return 'grass_overhang_mid';
    }
  }

  if (type === 'solid_mass') {
    const eastSolid = east === 'solid_mass';
    const westSolid = west === 'solid_mass';
    const southSolid = south === 'solid_mass';
    const northSolid = north === 'solid_mass' || north === 'grass_top';

    if (northSolid && !southSolid) {
      if (!westSolid) return 'bottom_left';
      if (!eastSolid) return 'bottom_right';
      return 'bottom_mid';
    }

    if (northSolid && southSolid && eastSolid && westSolid) {
      return 'mass_plain';
    }

    if (!westSolid && southSolid && eastSolid) return 'chasm_end_left';
    if (!eastSolid && southSolid && westSolid) return 'chasm_end_right';
  }

  return null;
}

function drawAutoTiledGrid(ctx, grid) {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      const name = autotile(grid, x, y);
      if (name) drawFloorTile(ctx, name, x * DST_TILE, y * DST_TILE);
    }
  }
}

const LOGICAL_TYPES = ['grass_top', 'solid_mass', 'overhang'];

window.FloorTiles = {
  SRC_TILE,
  DST_TILE,
  SCALE,
  floorAtlas,
  FLOOR_TILES,
  drawFloorTile,
  autotile,
  drawAutoTiledGrid,
  LOGICAL_TYPES,
};
