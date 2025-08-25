const X_VELOCITY = 200
const JUMP_POWER = 288.75
const GRAVITY = 580

class Player {
  constructor({ x, y, scale = 1, tileSize = TILE_NATIVE, velocity = { x: 0, y: 0 } }) {
    this.scale = scale
    this.tileSize = tileSize
    this.x = x
    this.y = y
    this.width = Math.round(FRAME_WIDTH * scale)
    this.height = Math.round(FRAME_HEIGHT * scale)
    this.velocity = velocity
    this.isOnGround = false
    this.isImageLoaded = false
    this.image = new Image()
    this.image.onload = () => {
      this.isImageLoaded = true
    }
    this.image.src = './images/character.png'
    this.elapsedTime = 0
    this.currentFrame = 0
    this.sprites = {
      idle: {
        x: 0,
        y: 0,
        width: FRAME_WIDTH,
        height: FRAME_HEIGHT,
        frames: 5,
      },
      run: {
        x: 0,
        y: FRAME_HEIGHT * 2,
        width: FRAME_WIDTH,
        height: FRAME_HEIGHT,
        frames: 8,
      },
      jump: {
        x: 0,
        y: FRAME_HEIGHT * 3,
        width: FRAME_WIDTH,
        height: FRAME_HEIGHT,
        frames: 4,
      },
      land: {
        x: 0,
        y: FRAME_HEIGHT * 4,
        width: FRAME_WIDTH,
        height: FRAME_HEIGHT,
        frames: 4,
      },
      attack: {
        x: 0,
        y: FRAME_HEIGHT * 5,
        width: FRAME_WIDTH,
        height: FRAME_HEIGHT,
        frames: 6,
      },
    }
    this.currentSprite = this.sprites.idle
    this.facing = 'right'

    const figurePx = FIGURE_NATIVE * scale
    this.hitbox = {
      x: 0,
      y: 0,
      width: Math.round(0.522 * figurePx),
      height: Math.round(0.957 * figurePx),
    }
    this.hitboxOffset = {
      x: Math.round((this.width - this.hitbox.width) / 2),
      y: Math.round(this.height - this.hitbox.height),
    }
    this.hitbox.x = this.x + this.hitboxOffset.x
    this.hitbox.y = this.y + this.hitboxOffset.y

    this.isInvincible = false
    this.isAttacking = false
  }

  setIsInvincible() {
    this.isInvincible = true
    setTimeout(() => {
      this.isInvincible = false
    }, 1500)
  }

  draw(c) {
    // Red square debug code
    // c.fillStyle = 'rgba(255, 0, 0, 0.5)'
    // c.fillRect(this.x, this.y, this.width, this.height)

    // Hitbox
    // c.fillStyle = 'rgba(0, 0, 255, 0.5)'
    // c.fillRect(
    //   this.hitbox.x,
    //   this.hitbox.y,
    //   this.hitbox.width,
    //   this.hitbox.height,
    // )

    if (this.isImageLoaded === true) {
      let xScale = 1
      let drawX = Math.round(this.x)
      if (this.facing === 'right') {
        xScale = -1
        drawX = -Math.round(this.x + this.width)
      }
      const drawY = Math.round(this.y)
      c.save()
      if (this.isInvincible) {
        c.globalAlpha = 0.5
      } else {
        c.globalAlpha = 1
      }
      c.scale(xScale, 1)
      const cropTop = 1
      const scaledCrop = Math.round(cropTop * this.scale)
      c.drawImage(
        this.image,
        this.currentSprite.x + this.currentSprite.width * this.currentFrame,
        this.currentSprite.y + cropTop,
        this.currentSprite.width,
        this.currentSprite.height - cropTop,
        drawX,
        drawY + scaledCrop,
        Math.round(this.width),
        Math.round(this.height - scaledCrop)
      )
      c.restore()
    }
  }

  update(deltaTime, collisionBlocks) {
    if (!deltaTime) return

    // Updating animation frames
    this.elapsedTime += deltaTime
    const secondsInterval = 0.1
    if (this.elapsedTime > secondsInterval) {
      this.currentFrame = (this.currentFrame + 1) % this.currentSprite.frames
      this.elapsedTime -= secondsInterval
      if (
        this.isAttacking &&
        this.currentFrame === this.currentSprite.frames - 1
      ) {
        this.isAttacking = false
      }
    }

    // Update hitbox position
    this.hitbox.x = this.x + this.hitboxOffset.x
    this.hitbox.y = this.y + this.hitboxOffset.y

    this.applyGravity(deltaTime)

    // Update horizontal position and check collisions
    this.updateHorizontalPosition(deltaTime)
    this.checkForHorizontalCollisions(collisionBlocks)

    // Check for any platform collisions
    this.checkPlatformCollisions(platforms, deltaTime)

    // Update vertical position and check collisions
    this.updateVerticalPosition(deltaTime)
    this.checkForVerticalCollisions(collisionBlocks)

    this.determineDirection()
    this.switchSprites()
  }

  attack() {
    if (this.isAttacking) return
    this.currentSprite = this.sprites.attack
    this.currentFrame = 0
    this.isAttacking = true
    this.velocity.x = 0
  }

  determineDirection() {
    if (this.velocity.x > 0) {
      this.facing = 'right'
    } else if (this.velocity.x < 0) {
      this.facing = 'left'
    }
  }

  switchSprites() {
    if (this.isAttacking) return

    if (
      this.isOnGround &&
      this.velocity.x === 0 &&
      this.currentSprite !== this.sprites.idle
    ) {
      // Idle
      this.currentFrame = 0
      this.currentSprite = this.sprites.idle
    } else if (
      this.isOnGround &&
      this.velocity.x !== 0 &&
      this.currentSprite !== this.sprites.run
    ) {
      // Run
      this.currentFrame = 0
      this.currentSprite = this.sprites.run
    } else if (
      !this.isOnGround &&
      this.velocity.y < 0 &&
      this.currentSprite !== this.sprites.jump
    ) {
      // Jump
      this.currentFrame = 0
      this.currentSprite = this.sprites.jump
    } else if (
      !this.isOnGround &&
      this.velocity.y > 0 &&
      this.currentSprite !== this.sprites.land
    ) {
      // Land
      this.currentFrame = 0
      this.currentSprite = this.sprites.land
    }
  }

  jump() {
    if (!this.isOnGround) return
    this.velocity.y = -JUMP_POWER
    this.isOnGround = false
  }

  updateHorizontalPosition(deltaTime) {
    this.x += this.velocity.x * deltaTime
    this.hitbox.x = this.x + this.hitboxOffset.x
  }

  updateVerticalPosition(deltaTime) {
    this.y += this.velocity.y * deltaTime
    this.hitbox.y = this.y + this.hitboxOffset.y
  }

  applyGravity(deltaTime) {
    this.velocity.y += GRAVITY * deltaTime
  }

  handleInput(keys) {
    if (this.isAttacking) return

    this.velocity.x = 0

    if (keys.d.pressed) {
      this.velocity.x = X_VELOCITY
    } else if (keys.a.pressed) {
      this.velocity.x = -X_VELOCITY
    }
  }

  checkForHorizontalCollisions(collisionBlocks) {
    const buffer = 0.0001
    for (let i = 0; i < collisionBlocks.length; i++) {
      const collisionBlock = collisionBlocks[i]

      // Check if a collision exists on all axes
      if (
        this.hitbox.x <= collisionBlock.x + collisionBlock.width &&
        this.hitbox.x + this.hitbox.width >= collisionBlock.x &&
        this.hitbox.y + this.hitbox.height >= collisionBlock.y &&
        this.hitbox.y <= collisionBlock.y + collisionBlock.height
      ) {
        // Check collision while player is going left
        if (this.velocity.x < -0) {
          this.hitbox.x = collisionBlock.x + collisionBlock.width + buffer
          this.x = this.hitbox.x - this.hitboxOffset.x
          break
        }

        // Check collision while player is going right
        if (this.velocity.x > 0) {
          this.hitbox.x = collisionBlock.x - this.hitbox.width - buffer
          this.x = this.hitbox.x - this.hitboxOffset.x
          break
        }
      }
    }
  }

  checkForVerticalCollisions(collisionBlocks) {
    const buffer = 0.0001
    for (let i = 0; i < collisionBlocks.length; i++) {
      const collisionBlock = collisionBlocks[i]

      // If a collision exists
      if (
        this.hitbox.x <= collisionBlock.x + collisionBlock.width &&
        this.hitbox.x + this.hitbox.width >= collisionBlock.x &&
        this.hitbox.y + this.hitbox.height >= collisionBlock.y &&
        this.hitbox.y <= collisionBlock.y + collisionBlock.height
      ) {
        // Check collision while player is going up
        if (this.velocity.y < 0) {
          this.velocity.y = 0
          this.hitbox.y = collisionBlock.y + collisionBlock.height + buffer
          this.y = this.hitbox.y - this.hitboxOffset.y
          break
        }

        // Check collision while player is going down
        if (this.velocity.y > 0) {
          this.velocity.y = 0
          this.hitbox.y = collisionBlock.y - this.hitbox.height - buffer
          this.y = this.hitbox.y - this.hitboxOffset.y
          this.isOnGround = true
          break
        }
      }
    }
  }

  checkPlatformCollisions(platforms, deltaTime) {
    const buffer = 0.0001
    for (let platform of platforms) {
      if (platform.checkCollision(this, deltaTime)) {
        this.velocity.y = 0
        this.y = platform.y - this.height - buffer
        this.isOnGround = true
        return
      }
    }
    this.isOnGround = false
  }

  snapToGround(collisionBlocks) {
    const tileSize = this.tileSize
    const groundTileY = Math.floor((this.y + this.height) / tileSize)
    const groundTileX = Math.floor((this.x + this.width / 2) / tileSize)
    const block = collisionBlocks.find(
      (b) => b.x === groundTileX * tileSize && b.y === groundTileY * tileSize,
    )
    if (block) {
      this.y = block.y - this.height
      this.hitbox.x = this.x + this.hitboxOffset.x
      this.hitbox.y = this.y + this.hitboxOffset.y
      this.velocity.y = 0
      this.isOnGround = true
    }
  }
}
