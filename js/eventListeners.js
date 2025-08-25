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
      player.attack()
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

// Reset delta time when window regains focus (e.g., after app switching)
window.addEventListener('focus', () => {
  lastTime = performance.now()
})

// Touch controls
const joystickBase = document.getElementById('joystick-base')
const joystickKnob = document.getElementById('joystick-knob')
const attackButton = document.getElementById('attack-button')
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

if (attackButton) {
  attackButton.addEventListener('pointerdown', () => {
    player.attack()
  })
}

if (jumpButton) {
  jumpButton.addEventListener('pointerdown', () => {
    player.jump()
  })
}

const fullscreenButton = document.getElementById('fullscreen-button')
if (fullscreenButton) {
  const toggleFullscreen = () => {
    const elem = document.documentElement

    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen()
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
      }
    }
  }

  fullscreenButton.addEventListener('click', toggleFullscreen)
  fullscreenButton.addEventListener('touchend', toggleFullscreen)
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

const startScreen = document.getElementById('start-screen')
const startButton = document.getElementById('start-button')
const codeButton = document.getElementById('code-button')
const codeModal = document.getElementById('code-modal')
const closeModalButton = document.getElementById('close-modal')

const addPressListener = (element, handler) => {
  if (!element) return

  const onPress = (e) => {
    e.preventDefault()
    handler(e)
  }

  if (window.PointerEvent) {
    element.addEventListener('pointerdown', onPress)
  } else {
    element.addEventListener('touchstart', onPress)
  }

  element.addEventListener('click', handler)
}

addPressListener(startButton, () => {
  if (startScreen) startScreen.style.display = 'none'
  if (typeof startGame === 'function') startGame()
})

addPressListener(codeButton, () => {
  if (codeModal) codeModal.classList.remove('hidden')
})

addPressListener(closeModalButton, () => {
  if (codeModal) codeModal.classList.add('hidden')
})
