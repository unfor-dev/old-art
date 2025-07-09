// IMPORTS
import './main.css'
import { Clock, Scene, LoadingManager, WebGLRenderer, sRGBEncoding, Group, PerspectiveCamera, DirectionalLight, PointLight, MeshPhongMaterial } from 'three'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// GLOBAL VARIABLES
let oldMaterial
let secondContainer = false
let width, height
const cursor = { x: 0, y: 0 }
const clock = new Clock()
let previousTime = 0

// DOM ELEMENTS
const ftsLoader = document.querySelector(".lds-roller")
const looadingCover = document.getElementById("loading-text-intro")
const container = document.getElementById('canvas-container')
const containerDetails = document.getElementById('canvas-container-details')
const watchedSection = document.querySelector('.second')
const btn = document.querySelectorAll('nav > .a')
const customCursor = document.querySelector('.cursor')

// LOADING MANAGER SETUP
const loadingManager = new LoadingManager()

loadingManager.onLoad = function() {
    document.querySelector(".main-container").style.visibility = 'visible'
    document.querySelector("body").style.overflow = 'auto'

    const yPosition = { y: 0 }
    
    new TWEEN.Tween(yPosition)
        .to({ y: 100 }, 900)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start()
        .onUpdate(function() { 
            looadingCover.style.setProperty('transform', `translate(0, ${yPosition.y}%)`)
        })
        .onComplete(function() {
            looadingCover.parentNode.removeChild(document.getElementById("loading-text-intro"))
            TWEEN.remove(this)
        })

    introAnimation()
    ftsLoader.parentNode.removeChild(ftsLoader)
    window.scroll(0, 0)
}

// LOADERS SETUP
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
dracoLoader.setDecoderConfig({ type: 'js' })

const loader = new GLTFLoader(loadingManager)
loader.setDRACOLoader(dracoLoader)

// SCENE SETUP
const scene = new Scene()

// Container dimensions
width = container.clientWidth
height = container.clientHeight

// RENDERERS SETUP
const renderer = new WebGLRenderer({ 
    antialias: true, 
    alpha: true, 
    powerPreference: "high-performance" 
})
renderer.autoClear = true
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1))
renderer.setSize(width, height)
renderer.outputEncoding = sRGBEncoding
container.appendChild(renderer.domElement)

const renderer2 = new WebGLRenderer({ antialias: false })
renderer2.setPixelRatio(Math.min(window.devicePixelRatio, 1))
renderer2.setSize(width, height)
renderer2.outputEncoding = sRGBEncoding
containerDetails.appendChild(renderer2.domElement)

// CAMERAS SETUP
const cameraGroup = new Group()
scene.add(cameraGroup)

const camera = new PerspectiveCamera(35, width / height, 1, 100)
camera.position.set(19, 1.54, -0.1)
cameraGroup.add(camera)

const camera2 = new PerspectiveCamera(35, containerDetails.clientWidth / containerDetails.clientHeight, 1, 100)
camera2.position.set(1.9, 2.7, 2.7)
camera2.rotation.set(0, 1.1, 0)
scene.add(camera2)

// LIGHTS SETUP
const sunLight = new DirectionalLight(0x435c72, 0.04)
sunLight.position.set(-100, 0, -10)
scene.add(sunLight)

const fillLight = new PointLight(0xffffff, 3.7, 4, 1)
fillLight.position.set(30, 3, 2)
scene.add(fillLight)

// MODEL LOADING
loader.load('models/gltf/xeno_raven.glb', function(gltf) {
    gltf.scene.traverse((obj) => {
        if (obj.isMesh) {
            oldMaterial = obj.material
        }
    })
    
    gltf.scene.scale.set(0.02, 0.02, 0.02)
    gltf.scene.position.set(0, -1, 0)
    scene.add(gltf.scene)
    clearScene()
})

// UTILITY FUNCTIONS
function clearScene() {
    oldMaterial.dispose()
    renderer.renderLists.dispose()
}

function introAnimation() {
    new TWEEN.Tween(camera.position.set(0, 4, 2.7))
        .to({ x: 0, y: 2.4, z: 8.8 }, 3500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start()
        .onComplete(function() {
            TWEEN.remove(this)
            document.querySelector('.header').classList.add('ended')
            document.querySelector('.first>p').classList.add('ended')
        })
}

function animateCamera(position, rotation) {
    new TWEEN.Tween(camera2.position)
        .to(position, 1800)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start()
        .onComplete(function() {
            TWEEN.remove(this)
        })
    
    new TWEEN.Tween(camera2.rotation)
        .to(rotation, 1800)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start()
        .onComplete(function() {
            TWEEN.remove(this)
        })
}

function handleCursor(e) {
    const x = e.clientX
    const y = e.clientY
    customCursor.style.cssText = `left: ${x}px; top: ${y}px;`
}

function update(e) {
    const span = this.querySelector('span')
    
    if (e.type === 'mouseleave') {
        span.style.cssText = ''
    } else {
        const { offsetX: x, offsetY: y } = e
        const { offsetWidth: width, offsetHeight: height } = this
        const walk = 20
        const xWalk = (x / width) * (walk * 2) - walk
        const yWalk = (y / height) * (walk * 2) - walk
        span.style.cssText = `transform: translate(${xWalk}px, ${yWalk}px);`
    }
}

function obCallback(payload) {
    if (payload[0].intersectionRatio > 0.05) {
        secondContainer = true
    } else {
        secondContainer = false
    }
}

// RENDER LOOP
function rendeLoop() {
    TWEEN.update()

    if (secondContainer) {
        renderer2.render(scene, camera2)
    } else {
        renderer.render(scene, camera)
    }

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    const parallaxY = cursor.y
    fillLight.position.y -= (parallaxY * 9 + fillLight.position.y - 2) * deltaTime

    const parallaxX = cursor.x
    fillLight.position.x += (parallaxX * 8 - fillLight.position.x) * 2 * deltaTime

    cameraGroup.position.z -= (parallaxY / 3 + cameraGroup.position.z) * 2 * deltaTime
    cameraGroup.position.x += (parallaxX / 3 - cameraGroup.position.x) * 2 * deltaTime

    requestAnimationFrame(rendeLoop)
}

// EVENT LISTENERS

// Window resize
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    
    camera2.aspect = containerDetails.clientWidth / containerDetails.clientHeight
    camera2.updateProjectionMatrix()

    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer2.setSize(containerDetails.clientWidth, containerDetails.clientHeight)

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1))
    renderer2.setPixelRatio(Math.min(window.devicePixelRatio, 1))
})

// Mouse move
document.addEventListener('mousemove', (event) => {
    event.preventDefault()

    cursor.x = event.clientX / window.innerWidth - 0.5
    cursor.y = event.clientY / window.innerHeight - 0.5

    handleCursor(event)
}, false)

// Navigation clicks
document.getElementById('aglaea').addEventListener('click', () => {
    document.getElementById('aglaea').classList.add('active')
    document.getElementById('euphre').classList.remove('active')
    document.getElementById('thalia').classList.remove('active')
    document.getElementById('content').innerHTML = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
    animateCamera({ x: 3, y: 2.7, z: 2.7 }, { y: 1.1 })
})

document.getElementById('thalia').addEventListener('click', () => {
    document.getElementById('thalia').classList.add('active')
    document.getElementById('aglaea').classList.remove('active')
    document.getElementById('euphre').classList.remove('active')
    document.getElementById('content').innerHTML = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    animateCamera({ x: -0.5, y: 2.5, z: 2.6 }, { y: -0.1 })
})

document.getElementById('euphre').addEventListener('click', () => {
    document.getElementById('euphre').classList.add('active')
    document.getElementById('aglaea').classList.remove('active')
    document.getElementById('thalia').classList.remove('active')
    document.getElementById('content').innerHTML = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
    animateCamera({ x: -1.4, y: 2.7, z: 2.9 }, { y: -0.6 })
})

// Magnetic menu
btn.forEach(b => b.addEventListener('mousemove', update))
btn.forEach(b => b.addEventListener('mouseleave', update))

// INTERSECTION OBSERVER
const ob = new IntersectionObserver(obCallback, {
    threshold: 0.05
})
ob.observe(watchedSection)

// START RENDER LOOP
rendeLoop()