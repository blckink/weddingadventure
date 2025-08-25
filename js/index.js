const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
c.imageSmoothingEnabled = false
const dpr = window.devicePixelRatio || 1
const winScreen = document.getElementById('win-screen')

function resizeCanvas() {
  const { innerWidth, innerHeight } = window
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.style.width = `${innerWidth}px`
  canvas.style.height = `${innerHeight}px`
  // Reset any existing transforms; scaling for high-DPI displays is handled
  // within the render loop to avoid applying the device pixel ratio twice.
  c.setTransform(1, 0, 0, 1, 0, 0)
}

resizeCanvas()
window.addEventListener('resize', resizeCanvas)

const oceanLayerData = {
  l_New_Layer_1: l_New_Layer_1,
}

const brambleLayerData = {
  l_New_Layer_2: l_New_Layer_2,
}

const layersData = {
  l_New_Layer_8: l_New_Layer_8,
  l_Back_Tiles: l_Back_Tiles,
  l_Decorations: l_Decorations,
  l_Front_Tiles: l_Front_Tiles,
  l_Shrooms: l_Shrooms,
  l_Collisions: l_Collisions,
  l_Grass: l_Grass,
  l_Trees: l_Trees,
}

const tilesets = {
  l_New_Layer_1: { imageUrl: './images/decorations.png', tileSize: TILE_NATIVE },
  l_New_Layer_2: { imageUrl: './images/decorations.png', tileSize: TILE_NATIVE },
  l_New_Layer_8: { imageUrl: './images/tileset.png', tileSize: TILE_NATIVE },
  l_Back_Tiles: { imageUrl: './images/tileset.png', tileSize: TILE_NATIVE },
  l_Decorations: { imageUrl: './images/decorations.png', tileSize: TILE_NATIVE },
  l_Front_Tiles: { imageUrl: './images/tileset.png', tileSize: TILE_NATIVE },
  l_Shrooms: { imageUrl: './images/decorations.png', tileSize: TILE_NATIVE },
  l_Collisions: { imageUrl: './images/tileset.png', tileSize: TILE_NATIVE },
  l_Grass: { imageUrl: './images/tileset.png', tileSize: TILE_NATIVE },
  l_Trees: { imageUrl: './images/decorations.png', tileSize: TILE_NATIVE },
}

// Determine on-screen tile and figure sizes
let tile_on_screen_px = TILE_NATIVE
const figure_on_screen_px = clamp(
  Math.round((FIGURE_NATIVE / TILE_NATIVE) * tile_on_screen_px),
  Math.round((FIGURE_NATIVE - 1) * tile_on_screen_px / TILE_NATIVE),
  Math.round((FIGURE_NATIVE + 1) * tile_on_screen_px / TILE_NATIVE),
)
const player_scale = figure_on_screen_px / FIGURE_NATIVE
const LEVEL_EXTENSION_COLUMNS = 20

const blockers =
  typeof l_Blockers !== 'undefined' && l_Blockers.length
    ? l_Blockers
    : collisions.map((row) => row.map(() => 0))
const deaths =
  typeof l_Deaths !== 'undefined' && l_Deaths.length
    ? l_Deaths
    : collisions.map((row) => row.map(() => 0))
const illusions =
  typeof l_Illusions !== 'undefined' && l_Illusions.length
    ? l_Illusions
    : collisions.map((row) => row.map(() => 0))


function extendLevelRight(layerArrays, extraColumns = LEVEL_EXTENSION_COLUMNS) {
  layerArrays.forEach((layer) => {
    layer.forEach((row) => {
      // Duplicate the first columns instead of the last ones to
      // avoid repeating the level's boundary and creating an
      // impassable wall when extending the map.
      const extension = row.slice(0, extraColumns)
      row.push(...extension)
    })
  })
}

function createFillerLayer(collisions) {
  const rows = collisions.length
  const cols = collisions[0].length
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false))
  const filler = Array.from({ length: rows }, () => Array(cols).fill(0))

  const queue = []

  for (let x = 0; x < cols; x++) {
    if (collisions[0][x] === 0) {
      queue.push([0, x])
      visited[0][x] = true
    }
    if (collisions[rows - 1][x] === 0) {
      queue.push([rows - 1, x])
      visited[rows - 1][x] = true
    }
  }

  for (let y = 0; y < rows; y++) {
    if (collisions[y][0] === 0) {
      queue.push([y, 0])
      visited[y][0] = true
    }
    if (collisions[y][cols - 1] === 0) {
      queue.push([y, cols - 1])
      visited[y][cols - 1] = true
    }
  }

  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]

  while (queue.length) {
    const [y, x] = queue.shift()
    for (const [dy, dx] of directions) {
      const ny = y + dy
      const nx = x + dx
      if (
        ny >= 0 &&
        ny < rows &&
        nx >= 0 &&
        nx < cols &&
        !visited[ny][nx] &&
        collisions[ny][nx] === 0
      ) {
        visited[ny][nx] = true
        queue.push([ny, nx])
      }
    }
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (collisions[y][x] === 0 && !visited[y][x]) {
        filler[y][x] = 1
      }
    }
  }

  return filler
}

extendLevelRight([
  collisions,
  l_New_Layer_1,
  l_New_Layer_2,
  l_New_Layer_8,
  l_Back_Tiles,
  l_Decorations,
  l_Front_Tiles,
  l_Shrooms,
  l_Collisions,
  l_Grass,
  l_Trees,
  l_Gems,
  l_Enemies,
  blockers,
  deaths,
  illusions,
])

const floorGrid = collisions.map((row, y) =>
  row.map((cell, x) => {
    if (!cell) return 'air'
    const north = y > 0 ? collisions[y - 1][x] : 0
    return north ? 'solid_mass' : 'grass_top'
  }),
)

collisions.forEach((row, y) => {
  row.forEach((symbol, x) => {
    l_Collisions[y][x] = symbol === 1 ? 1 : 0
    if (symbol === 0) {
      if (l_Back_Tiles[y]) l_Back_Tiles[y][x] = 0
      if (l_Front_Tiles[y]) l_Front_Tiles[y][x] = 0
    }
  })
})

const l_Filler = createFillerLayer(collisions)
layersData.l_Filler = l_Filler
tilesets.l_Filler = { imageUrl: './images/filler.png', tileSize: TILE_NATIVE }

const LEVEL_EXTENSION_OFFSET = LEVEL_EXTENSION_COLUMNS * tile_on_screen_px

// Tile setup
const collisionBlocks = []
const platforms = []
const deathBlocks = []
const illusionBlocks = []
const blockSize = tile_on_screen_px // Assuming each tile is 16x16 pixels

const illusionPositions = new Set()
illusions.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 1) {
      illusionBlocks.push(
        new IllusionBlock({
          x: x * blockSize,
          y: y * blockSize,
          size: blockSize,
        }),
      )
      illusionPositions.add(`${x},${y}`)
    }
  })
})

collisions.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 1 && !illusionPositions.has(`${x},${y}`)) {
      collisionBlocks.push(
        new CollisionBlock({
          x: x * blockSize,
          y: y * blockSize,
          size: blockSize,
        }),
      )
    } else if (symbol === 2 && !illusionPositions.has(`${x},${y}`)) {
      platforms.push(
        new Platform({
          x: x * blockSize,
          y: y * blockSize + blockSize,
          width: tile_on_screen_px,
          height: tile_on_screen_px / 4,
        }),
      )
    }
  })
})

blockers.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 1 && !illusionPositions.has(`${x},${y}`)) {
      collisionBlocks.push(
        new Blocker({
          x: x * blockSize,
          y: y * blockSize,
          size: blockSize,
        }),
      )
    }
  })
})

deaths.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 1 && !illusionPositions.has(`${x},${y}`)) {
      deathBlocks.push(
        new DeathBlock({
          x: x * blockSize,
          y: y * blockSize,
          size: blockSize,
        }),
      )
    }
  })
})

const renderLayer = (tilesData, tilesetImage, tileSize, context) => {
  tilesData.forEach((row, y) => {
    row.forEach((symbol, x) => {
      if (symbol !== 0) {
        const srcX = ((symbol - 1) % (tilesetImage.width / tileSize)) * tileSize
        const srcY =
          Math.floor((symbol - 1) / (tilesetImage.width / tileSize)) * tileSize

        context.drawImage(
          tilesetImage, // source image
          srcX,
          srcY, // source x, y
          tileSize,
          tileSize, // source width, height
          x * tile_on_screen_px,
          y * tile_on_screen_px, // destination x, y
          tile_on_screen_px,
          tile_on_screen_px, // destination width, height
        )
      }
    })
  })
}

const renderStaticLayers = async (layersData) => {
  const tileSize = tile_on_screen_px
  const layerArrays = Object.values(layersData)
  const maxWidth = Math.max(...layerArrays.map((layer) => layer[0].length))
  const maxHeight = Math.max(...layerArrays.map((layer) => layer.length))

  const offscreenCanvas = document.createElement('canvas')
  offscreenCanvas.width = maxWidth * tileSize
  offscreenCanvas.height = maxHeight * tileSize
  const offscreenContext = offscreenCanvas.getContext('2d')
  offscreenContext.imageSmoothingEnabled = false

  for (const [layerName, tilesData] of Object.entries(layersData)) {
    const tilesetInfo = tilesets[layerName]
    if (tilesetInfo) {
      try {
        const tilesetImage = await loadImage(tilesetInfo.imageUrl)
        renderLayer(
          tilesData,
          tilesetImage,
          tilesetInfo.tileSize,
          offscreenContext,
        )
      } catch (error) {
        console.error(`Failed to load image for layer ${layerName}:`, error)
      }
    }
  }

  if (!FloorTiles.floorAtlas.complete) {
    await new Promise((res) => (FloorTiles.floorAtlas.onload = res))
  }
  FloorTiles.drawAutoTiledGrid(offscreenContext, floorGrid)

  // Optionally draw collision blocks and platforms for debugging
  // collisionBlocks.forEach(block => block.draw(offscreenContext));
  // platforms.forEach((platform) => platform.draw(offscreenContext))

  return offscreenCanvas
}
// END - Tile setup

// Change xy coordinates to move player's default position
let player = new Player({
  x: 100,
  y: 100,
  scale: player_scale,
  tileSize: tile_on_screen_px,
  velocity: { x: 0, y: 0 },
})
player.snapToGround(collisionBlocks)

let oposums = []
let eagles = []
let sprites = []
let hearts = [
  new Heart({
    x: 10,
    y: 10,
    width: 21,
    height: 18,
    imageSrc: './images/hearts.png',
    spriteCropbox: {
      x: 0,
      y: 0,
      width: 21,
      height: 18,
      frames: 6,
    },
  }),
  new Heart({
    x: 33,
    y: 10,
    width: 21,
    height: 18,
    imageSrc: './images/hearts.png',
    spriteCropbox: {
      x: 0,
      y: 0,
      width: 21,
      height: 18,
      frames: 6,
    },
  }),
  new Heart({
    x: 56,
    y: 10,
    width: 21,
    height: 18,
    imageSrc: './images/hearts.png',
    spriteCropbox: {
      x: 0,
      y: 0,
      width: 21,
      height: 18,
      frames: 6,
    },
  }),
]

const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
}

let lastTime = performance.now()
let camera = {
  x: 0,
  y: 0,
}

let oceanBackgroundCanvas = null
let brambleBackgroundCanvas = null
let gems = []
let gemUI = new Sprite({
  x: 13,
  y: 36,
  width: 15,
  height: 13,
  imageSrc: './images/gem.png',
  spriteCropbox: {
    x: 0,
    y: 0,
    width: 15,
    height: 13,
    frames: 5,
  },
})
let gemCount = 0

function init() {
  gems = []
  gemCount = 0
  gemUI = new Sprite({
    x: 13,
    y: 36,
    width: 15,
    height: 13,
    imageSrc: './images/gem.png',
    spriteCropbox: {
      x: 0,
      y: 0,
      width: 15,
      height: 13,
      frames: 5,
    },
  })

  const gemWidth = tile_on_screen_px
  const gemHeight = tile_on_screen_px * (13 / 15)
  l_Gems.forEach((row, y) => {
    row.forEach((symbol, x) => {
      if (symbol === 18) {
        gems.push(
          new Sprite({
            x: x * tile_on_screen_px,
            y: y * tile_on_screen_px,
            width: gemWidth,
            height: gemHeight,
            imageSrc: './images/gem.png',
            spriteCropbox: {
              x: 0,
              y: 0,
              width: 15,
              height: 13,
              frames: 5,
            },
            hitbox: {
              x: x * tile_on_screen_px,
              y: y * tile_on_screen_px,
              width: gemWidth,
              height: gemHeight,
            },
          }),
        )
      }
    })
  })

  player = new Player({
    x: 100,
    y: 100,
    scale: player_scale,
    tileSize: tile_on_screen_px,
    velocity: { x: 0, y: 0 },
  })
  eagles = []
  oposums = []
  if (typeof l_Enemies !== 'undefined') {
    l_Enemies.forEach((row, y) => {
      row.forEach((symbol, x) => {
        if (symbol === 1) {
          oposums.push(
            new Oposum({
              x: x * tile_on_screen_px,
              y: y * tile_on_screen_px,
              width: tile_on_screen_px,
              height: tile_on_screen_px * (28 / 36),
            }),
          )
        } else if (symbol === 2) {
          eagles.push(
            new Eagle({
              x: x * tile_on_screen_px,
              y: y * tile_on_screen_px,
              width: tile_on_screen_px,
              height: tile_on_screen_px * (41 / 40),
            }),
          )
        }
      })
    })
  }

  gems.push(
    new Sprite({
      x: 1800 + LEVEL_EXTENSION_OFFSET,
      y: 100,
      width: gemWidth,
      height: gemHeight,
      imageSrc: './images/gem.png',
      spriteCropbox: {
        x: 0,
        y: 0,
        width: 15,
        height: 13,
        frames: 5,
      },
      hitbox: {
        x: 1800 + LEVEL_EXTENSION_OFFSET,
        y: 100,
        width: gemWidth,
        height: gemHeight,
      },
    }),
  )

  sprites = []
  hearts = [
    new Heart({
      x: 10,
      y: 10,
      width: 21,
      height: 18,
      imageSrc: './images/hearts.png',
      spriteCropbox: {
        x: 0,
        y: 0,
        width: 21,
        height: 18,
        frames: 6,
      },
    }),
    new Heart({
      x: 33,
      y: 10,
      width: 21,
      height: 18,
      imageSrc: './images/hearts.png',
      spriteCropbox: {
        x: 0,
        y: 0,
        width: 21,
        height: 18,
        frames: 6,
      },
    }),
    new Heart({
      x: 56,
      y: 10,
      width: 21,
      height: 18,
      imageSrc: './images/hearts.png',
      spriteCropbox: {
        x: 0,
        y: 0,
        width: 21,
        height: 18,
        frames: 6,
      },
    }),
  ]

  camera = {
    x: 0,
    y: 0,
  }
}

function animate(backgroundCanvas) {
  // Calculate delta time
  const currentTime = performance.now()
  const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1)
  lastTime = currentTime

  // Update player position
  player.handleInput(keys)
  player.update(deltaTime, collisionBlocks)

  // Update oposum position
  for (let i = oposums.length - 1; i >= 0; i--) {
    const oposum = oposums[i]
    oposum.update(deltaTime, collisionBlocks)

    // Jump on enemy
    const collisionDirection = checkCollisions(player, oposum)
    if (collisionDirection) {
      if (collisionDirection === 'bottom' && !player.isOnGround) {
        player.velocity.y = -200
        sprites.push(
          new Sprite({
            x: oposum.x,
            y: oposum.y,
            width: 80,
            height: 64,
            imageSrc: './images/enemy-death.png',
            spriteCropbox: {
              x: 0,
              y: 0,
              width: 40,
              height: 41,
              frames: 6,
            },
          }),
        )

        oposums.splice(i, 1)
      } else if (
        (collisionDirection === 'left' || collisionDirection === 'right') &&
        player.isOnGround &&
        player.isRolling
      ) {
        sprites.push(
          new Sprite({
            x: oposum.x,
            y: oposum.y,
            width: 80,
            height: 64,
            imageSrc: './images/enemy-death.png',
            spriteCropbox: {
              x: 0,
              y: 0,
              width: 40,
              height: 41,
              frames: 6,
            },
          }),
        )

        oposums.splice(i, 1)
      } else if (
        collisionDirection === 'left' ||
        collisionDirection === 'right'
      ) {
        const fullHearts = hearts.filter((heart) => {
          return !heart.depleted
        })

        if (!player.isInvincible && fullHearts.length > 0) {
          fullHearts[fullHearts.length - 1].depleted = true
        } else if (fullHearts.length === 0) {
          init()
        }

        player.setIsInvincible()
      }
    }
  }

  // Update eagle position
  for (let i = eagles.length - 1; i >= 0; i--) {
    const eagle = eagles[i]
    eagle.update(deltaTime, collisionBlocks)

    // Jump on enemy
    const collisionDirection = checkCollisions(player, eagle)
    if (collisionDirection) {
      if (collisionDirection === 'bottom' && !player.isOnGround) {
        player.velocity.y = -200
        sprites.push(
          new Sprite({
            x: eagle.x,
            y: eagle.y,
            width: 80,
            height: 64,
            imageSrc: './images/enemy-death.png',
            spriteCropbox: {
              x: 0,
              y: 0,
              width: 40,
              height: 41,
              frames: 6,
            },
          }),
        )

        eagles.splice(i, 1)
      } else if (
        collisionDirection === 'left' ||
        collisionDirection === 'right' ||
        collisionDirection === 'top'
      ) {
        const fullHearts = hearts.filter((heart) => {
          return !heart.depleted
        })

        if (!player.isInvincible && fullHearts.length > 0) {
          fullHearts[fullHearts.length - 1].depleted = true
        } else if (fullHearts.length === 0) {
          init()
        }

        player.setIsInvincible()
      }
    }
  }

  for (let i = sprites.length - 1; i >= 0; i--) {
    const sprite = sprites[i]
    sprite.update(deltaTime)

    if (sprite.iteration === 1) {
      sprites.splice(i, 1)
    }
  }

  for (let i = gems.length - 1; i >= 0; i--) {
    const gem = gems[i]
    gem.update(deltaTime)

    // THIS IS WHERE WE ARE COLLECTING GEMS
    const collisionDirection = checkCollisions(player, gem)
    if (collisionDirection) {
      // create an item feedback animation
      sprites.push(
        new Sprite({
          x: gem.x - 20,
          y: gem.y - tile_on_screen_px,
          width: 80,
          height: 64,
          imageSrc: './images/item-feedback.png',
          spriteCropbox: {
            x: 0,
            y: 0,
            width: 32,
            height: 32,
            frames: 5,
          },
        }),
      )

      // remove a gem from the game
      gems.splice(i, 1)
      gemCount++

      if (gems.length === 0) {
        if (winScreen) winScreen.classList.remove('hidden')
      }
    }
  }

  for (let i = 0; i < deathBlocks.length; i++) {
    const block = deathBlocks[i]
    if (
      player.hitbox.x <= block.x + block.width &&
      player.hitbox.x + player.hitbox.width >= block.x &&
      player.hitbox.y <= block.y + block.height &&
      player.hitbox.y + player.hitbox.height >= block.y
    ) {
      hearts.forEach((heart) => (heart.depleted = true))
      init()
      break
    }
  }

  // Center camera on player
  camera.x = Math.max(0, player.x - canvas.width / (2 * dpr))
  camera.y = Math.max(0, player.y - canvas.height / (2 * dpr))

  // Render scene
  c.save()
  c.clearRect(0, 0, canvas.width, canvas.height)
  c.scale(dpr, dpr)
  const camX = Math.round(camera.x)
  const camY = Math.round(camera.y)
  c.translate(-camX, -camY)
  c.drawImage(oceanBackgroundCanvas, Math.round(camX * 0.32), 0)
  c.drawImage(brambleBackgroundCanvas, Math.round(camX * 0.16), 0)
  c.drawImage(backgroundCanvas, 0, 0)
  player.draw(c)

  for (let i = oposums.length - 1; i >= 0; i--) {
    const oposum = oposums[i]
    oposum.draw(c)
  }

  for (let i = eagles.length - 1; i >= 0; i--) {
    const eagle = eagles[i]
    eagle.draw(c)
  }

  for (let i = sprites.length - 1; i >= 0; i--) {
    const sprite = sprites[i]
    sprite.draw(c)
  }

  for (let i = gems.length - 1; i >= 0; i--) {
    const gem = gems[i]
    gem.draw(c)
  }

  c.restore()

  // UI save and restore
  c.save()
  c.scale(dpr, dpr)
  for (let i = hearts.length - 1; i >= 0; i--) {
    const heart = hearts[i]
    heart.draw(c)
  }

  gemUI.draw(c)
  c.fillText(gemCount, 33, 46)
  c.restore()

  requestAnimationFrame(() => animate(backgroundCanvas))
}

const startRendering = async () => {
  try {
    oceanBackgroundCanvas = await renderStaticLayers(oceanLayerData)
    brambleBackgroundCanvas = await renderStaticLayers(brambleLayerData)
    const backgroundCanvas = await renderStaticLayers(layersData)
    if (!backgroundCanvas) {
      console.error('Failed to create the background canvas')
      return
    }

    animate(backgroundCanvas)
  } catch (error) {
    console.error('Error during rendering:', error)
  }
}

window.startGame = () => {
  init()
  startRendering()
}
