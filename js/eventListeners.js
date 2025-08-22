window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'w':
      player.jump()
      break
    case 'a':
      keys.a.pressed = true
      break
    case 'd':
      keys.d.pressed = true
      break
    case ' ':
      player.roll()
      break
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'a':
      keys.a.pressed = false
      break
    case 'd':
      keys.d.pressed = false
      break
  }
})

// On return to game's tab, ensure delta time is reset
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    lastTime = performance.now()
  }
})

// Touch controls
const joystickBase = document.getElementById('joystick-base')
const joystickKnob = document.getElementById('joystick-knob')
const rollButton = document.getElementById('roll-button')
const jumpButton = document.getElementById('jump-button')

let joystickPointerId = null
let startX = 0
let startY = 0
const JOYSTICK_RADIUS = 50

if (joystickBase && joystickKnob) {
  joystickBase.addEventListener('pointerdown', (e) => {
    joystickPointerId = e.pointerId
    startX = e.clientX
    startY = e.clientY
    joystickKnob.style.transition = '0s'
  })

  joystickBase.addEventListener('pointermove', (e) => {
    if (e.pointerId !== joystickPointerId) return

    const dx = e.clientX - startX
    const dy = e.clientY - startY
    const clampedX = Math.max(-JOYSTICK_RADIUS, Math.min(JOYSTICK_RADIUS, dx))
    const clampedY = Math.max(-JOYSTICK_RADIUS, Math.min(JOYSTICK_RADIUS, dy))
    joystickKnob.style.transform = `translate(${clampedX}px, ${clampedY}px)`

    const normalizedX = clampedX / JOYSTICK_RADIUS

    keys.a.pressed = normalizedX < -0.3
    keys.d.pressed = normalizedX > 0.3
  })

  const endJoystick = () => {
    joystickPointerId = null
    joystickKnob.style.transition = '0.2s'
    joystickKnob.style.transform = 'translate(0px, 0px)'
    keys.a.pressed = false
    keys.d.pressed = false
  }

  joystickBase.addEventListener('pointerup', (e) => {
    if (e.pointerId === joystickPointerId) endJoystick()
  })

  joystickBase.addEventListener('pointercancel', (e) => {
    if (e.pointerId === joystickPointerId) endJoystick()
  })
}

if (rollButton) {
  rollButton.addEventListener('pointerdown', () => {
    player.roll()
  })
}

if (jumpButton) {
  jumpButton.addEventListener('pointerdown', () => {
    player.jump()
  })
}

const fullscreenButton = document.getElementById('fullscreen-button')
if (fullscreenButton) {
  fullscreenButton.addEventListener('click', () => {
    const elem = document.documentElement
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen()
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen()
    }
  })
}

document.addEventListener(
  'touchmove',
  (e) => {
    e.preventDefault()
  },
  { passive: false },
)
document.addEventListener('gesturestart', (e) => e.preventDefault())
document.addEventListener('gesturechange', (e) => e.preventDefault())
document.addEventListener('gestureend', (e) => e.preventDefault())

let lastTouchEnd = 0
document.addEventListener(
  'touchend',
  (e) => {
    const now = new Date().getTime()
    if (now - lastTouchEnd <= 300) {
      e.preventDefault()
    }
    lastTouchEnd = now
  },
  { passive: false },
)

document.addEventListener('dblclick', (e) => e.preventDefault())
