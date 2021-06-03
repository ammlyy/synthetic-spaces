import ".././src/templates/style.css"
import "../node_modules/@fortawesome/fontawesome-free/css/all.css"
import * as THREE from "three"
import { ParticleSystem } from "./visual/ParticleSystem"
import { AudioSource } from "./audio/audioSource"
import { SamplePlayer } from "./audio/SamplePlayer"
import { Melody } from './audio/Melody'
import { Pad } from "./audio/Pad"

const TEXT_ANIMATION_TIME = 250;

import * as Tone from "tone"
import { LSystem } from "./grammars/LSystem"
import { Data } from './data'
import { Genetic } from "./grammars/Genetic"

const DEFAULT_Z_DEPTH = 600
export default class App {

  //THREE
  private camera: THREE.PerspectiveCamera
  private scene: THREE.Scene
  private renderer: THREE.WebGLRenderer
  private clock: THREE.Clock          // timer for animation
  private canvas: HTMLCanvasElement   // canvas element to draw render on

  private ps: ParticleSystem          // main class for particles

  private DESTROY = false // destroy trigger

  private STARTED: boolean = false
  private MENUON: boolean = false

  //RAYCAST
  private mouse: THREE.Vector2
  private raycaster: THREE.Raycaster

  //AUDIO
  private audioSources: AudioSource[] = []
  private rhythmicStructure: string
  private toneStarted: boolean = false

  // DATA from API's
  private data: Data
  private currentIndex: number = 0  // number of user interactions
  private weather: string           // keeps the state of the weather information 

  // DESTROY
  private timeFreeze:number

  // INFO TEXTS
  private cityNameText: HTMLHeadingElement
  private weatherText: HTMLHeadingElement
  private modeText: HTMLHeadingElement
  private citySelector: HTMLElement
  private audioIcon: HTMLElement
  private subtitle: HTMLHeadingElement
  private aboutText: HTMLHeadingElement
  private popupInfo: HTMLElement

  constructor() {
    this.scene = new THREE.Scene()

    // Camera initialization
    this.camera = new THREE.PerspectiveCamera(
      80, //fov
      window.innerWidth / window.innerHeight,
      0.01,
      3000
    )
    this.camera.position.z = DEFAULT_Z_DEPTH
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Canvas setup
    this.canvas = document.querySelector("#c")
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(this.renderer.domElement)

    //camera movement controller
    this.mouse = new THREE.Vector2()

    //init particle system
    this.ps = new ParticleSystem()
    this.ps.init()
    this.scene.add(this.ps.container)

    Genetic.init()
    this.rhythmicStructure = Genetic.getSequence()
    this.audioSources.push(new Pad(0, "G3", 2, 0.8, 0.5, 2, this.rhythmicStructure))
    this.audioSources.push(new Melody(0, "G3", 0.05, 0.5, 0.3, 1, "8n", this.rhythmicStructure))
    this.audioSources.push(new SamplePlayer(0, "4n", LSystem.expand(this.rhythmicStructure, 12)))

    //TIMER for temporal modifications
    this.clock = new THREE.Clock(true)

    //RAYCASTER
    this.raycaster = new THREE.Raycaster()
    this.raycaster.params.Points.threshold = 1;

    // DATA 
    this.data = new Data()
    this.data.initWeather().then(() => {
      this.weather = this.data.weatherOf(this.currentIndex)
      this.ps.setWeather(this.weather)
    })


    // TEXT INFOS
    this.cityNameText = document.getElementById("cityName") as HTMLHeadingElement
    this.weatherText = document.getElementById("weatherInfo") as HTMLHeadingElement
    this.modeText = document.getElementById("modeInfo") as HTMLHeadingElement
    this.citySelector = document.getElementById("citySelector")
    this.audioIcon = document.getElementById("audioIcon")
    this.audioIcon.style.visibility = "hidden"
    this.subtitle = document.getElementById("subtitle") as HTMLHeadingElement
    this.subtitle.textContent = "START"
    this.aboutText = document.getElementById("about") as HTMLHeadingElement
    this.aboutText.textContent = "ABOUT"
    this.popupInfo = document.getElementById("about-popup")
    document.getElementById("closeIcon").style.visibility = "hidden"

    this.setListeners()
  }


  //-----------------------------
  //      AUDIO FUNCTIONS
  //-----------------------------

  async startTone() {
    if (!this.toneStarted) {
      this.toneStarted = true
      await Tone.context.resume()
      await Tone.start()
      Tone.Transport.bpm.value = 86
      Tone.Transport.start()
    }
  }

  async play() {
    await this.startTone()
    this.audioSources.forEach((x) => x.play())
  }

  stop() {
    this.audioSources.forEach((x) => x.stop())
  }


  //-----------------------------
  //       EVENT LISTENERS
  //-----------------------------

  setListeners() {
    window.addEventListener("resize", this.onWindowResize.bind(this), false)

    document.addEventListener('keydown', (e) => {
      if (!this.STARTED) {
        if (e.code == "Space") {    // If not started only spacebar triggers the event
          this.beginExperience()
        }
      }
      else {
        let previousIdx = this.currentIndex

        switch (e.code) {
          case "ArrowRight":
            if (!this.DESTROY){
              if (this.MENUON) this.closeMenu()
              this.currentIndex == (this.ps.getImageNumber() - 1) ? this.currentIndex = 0 : this.currentIndex++  
            }
            break

          case "ArrowLeft":
            if(!this.DESTROY){
              if (this.MENUON) this.closeMenu()
              this.currentIndex == 0 ? this.currentIndex = (this.ps.getImageNumber() - 1) : this.currentIndex--  
            }
            break
          case 'KeyD':
            this.destroyAnimation()
            break;

        }

        // Change city only if the index has changed
        if (previousIdx != this.currentIndex) this.changeCity(previousIdx, this.currentIndex)
      }
    })

    document.addEventListener('wheel', (e) => {
      if (this.STARTED) {
        this.ps.depth_amt += e.deltaY * -0.0005;
        this.ps.depth_amt = Math.max(0.0, Math.min(1.0, this.ps.depth_amt))   // normalized between 0 and 1
        this.ps.setHeight(this.ps.depth_amt)
        this.camera.position.z = DEFAULT_Z_DEPTH + this.ps.depth_amt * 200.
        this.ps.refresh()
      }
    })

    document.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX)
      this.mouse.y = (e.clientY)
    })

    this.subtitle.onclick = () => this.beginExperience()
    this.citySelector.addEventListener("mouseenter", (e) => this.openMenu())
    this.citySelector.addEventListener("mouseleave", (e) => this.closeMenu())
    this.audioIcon.onclick = () => this.toggleAudio()
    this.aboutText.onclick = () => this.togglePopup()
    document.getElementById("closeIcon").onclick = () => this.togglePopup()
  }

  beginExperience() {
    this.STARTED = true
    this.ps.textToImageAnimation()
    this.audioSources.forEach((source) => source.changeMode(this.weather))
    this.play()
    this.citySelector.classList.add("panel-closed")
    this.initializeCitySelector()
    this.setTexts()
    this.audioIcon.style.visibility = "visible"

    // Remove the subtitle and "about" 
    this.subtitle.parentNode.removeChild(this.subtitle)
    this.aboutText.parentNode.removeChild(this.aboutText)
    this.popupInfo.parentNode.removeChild(this.popupInfo)
  }

  resetCamera() {
    let timer = setInterval(() => {
      this.camera.position.z -= 0.005
      this.camera.position.z = Math.max(0.0, this.camera.position.z)
    }, 100)

    setTimeout(() => {
      clearInterval(timer)
      this.camera.position.z = DEFAULT_Z_DEPTH
    }, 2250)
  }

  updateWeatherData() {
    this.weather = this.data.weatherOf(this.currentIndex)
    this.ps.setWeather(this.weather)
    this.audioSources.forEach((source) => source.changeMode(this.weather))
  }

  // Load the images and texts for city selection and set the onclick event
  initializeCitySelector() {
    for (let i = 0; i < this.citySelector.children.length; i++) {
      // Loading
      (this.citySelector.children.item(i).children.item(1) as HTMLDivElement).style.backgroundImage = `url(${this.ps.getImagePath(i)})`;
      (this.citySelector.children.item(i).children.item(0) as HTMLHeadingElement).textContent = this.data.getCityName(i);

      // Onclick setup
      (this.citySelector.children.item(i) as HTMLDivElement).onclick = () => {
        this.citySelector.classList.remove("panel-opened")
        for (let i = 0; i < this.citySelector.children.length; i++) {
          this.citySelector.children.item(i).classList.remove("city-opened")
          this.citySelector.children.item(i).children.item(0).classList.remove("city-label-opened")
        }
        let previousIdx = this.currentIndex
        this.currentIndex = i
        if (previousIdx != this.currentIndex) this.changeCity(previousIdx, this.currentIndex)
      }
    }
  }

  setTexts(): void {
    this.cityNameText.textContent = this.data.getCityName(this.currentIndex)
    this.weatherText.innerHTML = 'WEATHER: ' + (' ' + this.weather).slice(1).toUpperCase()
    this.modeText.innerHTML = 'MODE: ' + this.audioSources[0].getMode()
    console.log(this.weather)
  }

  changeCity(currentIdx: number, nextIdx: number) {
    this.changePic(currentIdx, nextIdx)
    this.updateWeatherData()
    this.setTexts()
    this.resetCamera()
  }

  openMenu() {
    this.MENUON = true
    this.citySelector.classList.add("panel-opened")
    for (let i = 0; i < this.citySelector.children.length; i++) {
      this.citySelector.children.item(i).classList.add("city-opened")
      this.citySelector.children.item(i).children.item(0).classList.add("city-label-opened")
    }
  }

  closeMenu() {
    this.MENUON = false
    this.citySelector.classList.remove("panel-opened")
    for (let i = 0; i < this.citySelector.children.length; i++) {
      this.citySelector.children.item(i).classList.remove("city-opened")
      this.citySelector.children.item(i).children.item(0).classList.remove("city-label-opened")
    }
  }

  toggleAudio() {
    if (this.audioIcon.classList.contains("fa-volume-up")) {
      this.audioIcon.classList.remove("fa-volume-up")
      this.audioIcon.classList.add("fa-volume-mute")
      this.audioSources.forEach(source => source.stop())
    }
    else {
      this.audioIcon.classList.remove("fa-volume-mute")
      this.audioIcon.classList.add("fa-volume-up")
      this.audioSources.forEach(source => source.play())
    }
  }

  togglePopup() {
    if (this.popupInfo.classList.contains("popup-opened")) {
      this.popupInfo.classList.remove("popup-opened")
      document.getElementById("closeIcon").style.visibility = "hidden"
    }
    else {
      this.popupInfo.classList.add("popup-opened")
      document.getElementById("closeIcon").style.visibility = "visible"
    }
  }


  //------------------------------------------------
  //      WINDOW RESIZE AND CAMERA MANAGEMENT
  //------------------------------------------------

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.render()
  }

  // The lower the divider the higher is the movement
  setCameraMovement(divider: number): void {
    this.camera.position.x += (- (this.mouse.x / divider - window.innerWidth / (divider * 2)) - this.camera.position.x) * .03;
    this.camera.position.y += (this.mouse.y / divider - window.innerHeight / (divider * 2) - this.camera.position.y) * .03;
    this.camera.lookAt(this.scene.position)

    if (this.STARTED) {
      this.audioSources.forEach(s => {
        s.position = - ((this.mouse.x / window.innerWidth) * 2.0 - 1.0) * this.ps.depth_amt
      })

    }

  }


  //-------------------------------
  //     RENDER AND ANIMATION
  //-------------------------------

  render(): void {
    if (this.STARTED && !this.MENUON) {
      this.setCameraMovement(2.2)

      this.ps.addTime(true, 1)

      if (this.DESTROY) 
      {
        this.audioSources.forEach(a => { a.shift(this.ps.time) })
      }
    }

    this.raycast()

    this.audioSources.forEach((a) => {
      a.openFilter(this.ps.depth_amt)
    });

    this.renderer.render(this.scene, this.camera)
  }

  destroyAnimation(): void {
    if (!this.DESTROY) { // when animation is stopped
      this.timeFreeze = this.ps.time
      this.ps.resetTime(true, 0)
      this.DESTROY =  true
      this.ps.destroy = true
    }
    else if (this.DESTROY) {
      this.DESTROY = false
      this.ps.destroy = false
      this.ps.time = this.timeFreeze
      this.audioSources.forEach(a => a.resetShifter())

    }
    this.ps.refresh()

  }

  changePic(currentIdx: number, nextIdx: number) { // there are always two images pre-loaded onto the shader. So transitions goes on like: 0->1, 1->2 etc..
    this.ps.startAnimation(currentIdx, nextIdx)
    this.ps.resetTime(true, null)
  }


  raycast(): void {
    let x = (this.mouse.x / window.innerWidth) * 2 - 1;
    let y = (this.mouse.y / window.innerHeight) * 2 - 1
    this.raycaster.setFromCamera({ x: x, y: y }, this.camera);

    if (!this.STARTED) {
      const intersects = this.raycaster.intersectObject(this.ps.getBoundingBoxMesh(), true);
      if (intersects.length > 0) {
        intersects.forEach((obj: any) => {
          this.ps.addTime(false, this.clock.getDelta())
          this.ps.animateText(obj.point.x, obj.point.y, obj.point.z)
        })
      }

      else {
        this.ps.resetTime(false, this.clock.getDelta());
      }
    }
  }

  animate(): void {
    requestAnimationFrame(this.animate.bind(this))

    this.render()
  }

}

let a = new App()
a.animate()