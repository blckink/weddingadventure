class DeathBlock extends CollisionBlock {
  constructor({ x, y, size }) {
    super({ x, y, size })
  }

  draw(c) {
    // Optional debug draw
    // c.fillStyle = 'rgba(255, 0, 0, 0.5)'
    // c.fillRect(this.x, this.y, this.width, this.height)
  }
}
