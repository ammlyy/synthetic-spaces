import * as THREE from "three";
import {
  BufferGeometry,
  RawShaderMaterial,
  ShaderMaterial,
} from "three";
import { ImageManager } from "./ImageManager";
import { Text } from "./Text";
const glslify = require("glslify");

const TEXT_ANIMATION_TIME = 250
const FIRST_ANIMATION_TIME = 300

export class ParticleSystem {
  private imageManager: ImageManager;
  private currentIndex: number  //current index to keep track of which image to show
  private nImages: number

  private width: number; // image dimensions
  private height: number; //

  public uniforms: any; // object containing info to pass to the shader

  private material: THREE.RawShaderMaterial;
  private geometry: THREE.BufferGeometry;
  private particles: THREE.Points;
  private _container: THREE.Object3D;

  private text: Text
  private timer:any

  //public model controller
  public size: number;
  public noise_amt: number;
  public depth_amt: number;
  public morph: number;
  public time: number;
  public destroy: boolean;

  constructor() {

    this.imageManager = new ImageManager()
    this._container = new THREE.Object3D();


    //params
    this.size = 1.;
    this.noise_amt = 5;
    this.depth_amt = 0.0;
    this.morph = 0;
    this.time = FIRST_ANIMATION_TIME;

    this.currentIndex = 1
    this.particles = new THREE.Points();
    this.material = new RawShaderMaterial();
    this.geometry = new BufferGeometry();


    this.text = new Text()
    this.text.createText()

    this._container.add(this.text.getText().particleText);
    this._container.add(this.text.getText().topText);
    //this._container.add(this.text.getText().subText);
    this._container.add(this.text.getBoundingBoxMesh())

    this.timer = []
  }

  get container(): THREE.Object3D {
    return this._container;
  }

  //initialize the particle system by loading the target image given a path
  init() {
    this.imageManager.loadImages(this)
  }

  // create the geometry
  createPoints(): void {
    this.nImages = this.imageManager.getNumberImages()

    this.width = this.imageManager.getDimensions(0).x
    this.height = this.imageManager.getDimensions(0).y
    const particles: number = this.width * this.height

    this.uniforms = {
      uRandom: { type: "f", value: this.noise_amt },
      uSize: { type: "f", value: this.size },
      uZ: { type: "f", value: this.depth_amt },
      uMorph: { type: "f", value: this.morph },
      uDepth: { type: "t", value: this.imageManager.getDepth(0) },
      uDepth2: { type: "t", value: this.imageManager.getDepth(0) },
      uTextureSize: {
        type: "v2",
        value: new THREE.Vector2(this.width, this.height),
      },
      uTexture: { type: "t", value: this.imageManager.getImage(0) },
      uTexture2: { type: "t", value: this.imageManager.getImage(0) },
      uTime: { type: "f", value: this.time },
      uDestroy: { type: "b", value: false },
      uRain: { type: 'b', value: false },
      uSunny: { type: 'b', value: false },
      uClouds: { type: 'b', value: false },
      uSnow: {type: 'b', value: false},
      uMist: {type: 'b', value: false}


    };

    this.geometry = new THREE.BufferGeometry();
    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: glslify(require("../../shaders/particle.vert")),
      fragmentShader: glslify(require("../../shaders/particle.frag")),
    });

    const positions = new THREE.Float32BufferAttribute(particles * 3, 3);
    const normals = new THREE.Float32BufferAttribute(particles * 3, 3);

    var idx = 0;
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        positions.setXYZ(idx, i, j, 0);
        normals.setXYZ(
          idx,
          2 * Math.random() - 1.0,
          2 * Math.random() - 1.0,
          2 * Math.random() - 1.0
        );
        idx++;
      }
    }
    this.geometry.setAttribute("position", positions);
    this.geometry.setAttribute("normal", normals);

    this.particles = new THREE.Points(this.geometry, this.material);
  }


  refresh() {
    //updated the uniforms that are passed to the GPU
    if (this.uniforms) {
      this.uniforms.uSize.value = this.size;
      this.uniforms.uRandom.value = this.noise_amt;
      this.uniforms.uZ.value = this.depth_amt;
      this.uniforms.uMorph.value = this.morph;
      this.uniforms.uDestroy.value = this.destroy;
      this.uniforms.uTime.value = this.time
      this.material.uniformsNeedUpdate = true;
    }
  }

  addTime(started: boolean, delta: number) {

    if (!started) {
      this.time += delta * 1000;
      this.time = Math.min(this.time, TEXT_ANIMATION_TIME)
      this.text.update(this.time)
    }
    else {

      this.time += 2. * delta;
      this.uniforms.uTime.value = this.time
    }

  }

  resetTime(started: boolean, delta: number | null) {
    if (!started) {
      this.time -= 10
      this.time = Math.max(0, this.time)
      this.text.update(this.time)
    }
    else {
      this.time = 0
      this.uniforms.uTime.value = this.time;
    }
  }

  startAnimation(currentIdx: number, nextIdx: number) {
    this.setTransition(currentIdx, nextIdx)
    this.refresh();
  }

  textToImageAnimation() {
    this.time = FIRST_ANIMATION_TIME
    this.uniforms.uTime.value = this.time
    let t = this.text.getText()
    this._container.remove(t.particleText);
    //this._container.remove(t.subText);
    this._container.remove(t.topText);
    this._container.remove(this.text.getBoundingBoxMesh())

    this._container.add(this.particles);
  }

  animateText(x: number, y: number, z: number) {
    this.text.animate(x, y, z, this.time)
  }

  setTransition(currentIdx: number, nextIdx: number) {
    this.uniforms.uTexture.value = this.imageManager.getImage(currentIdx)
    this.uniforms.uDepth.value = this.imageManager.getDepth(currentIdx)
    this.uniforms.uTexture2.value = this.imageManager.getImage(nextIdx)
    this.uniforms.uDepth2.value = this.imageManager.getDepth(nextIdx)
    this.resetDepth()
  }

  resetDepth(){
    let t = setInterval(() => {
      this.depth_amt -= 0.03
      this.depth_amt = Math.max(0.0, this.depth_amt)
      this.uniforms.uZ.value = this.depth_amt
    }, 50)

    this.timer.push(t)

    this.timer.forEach( (t:any) => setTimeout( () => 
    {
      clearInterval(t)
      let idx = this.timer.indexOf(t)
      this.timer = this.timer.splice(idx, 1)
      this.setHeight(0.0)
      this.refresh()
     }, 2250)
    )
  }

  setWeather(weather: string) {
    setTimeout(() => {
      if(this.uniforms){
        this.uniforms.uRain.value = false
        this.uniforms.uSunny.value = false
        this.uniforms.uClouds.value = false  
        this.uniforms.uSnow.value = false
        this.uniforms.uMist.value = false
      }

      switch (weather) {
        case 'Rain':
          this.uniforms.uRain.value = true
          break;
        case 'Clear':
          this.uniforms.uSunny.value = true
          break
        case 'Clouds':
          this.uniforms.uClouds.value = true
          break
        case 'Snow':
          this.uniforms.uSnow.value = true
          break
        case 'Mist': 
          this.uniforms.uMist.value = true
          break
      }
  
    }, 2250)

  }

  setHeight(h: number) {
    this.particles.position.y = h * 50.0
  }

  getBoundingBoxMesh() {
    return this.text.getBoundingBoxMesh()
  }

  getImagePath(idx: number): string {
    return this.imageManager.getImagePath(idx)
  }

  getImageNumber(): number {
    return this.nImages
  }

  changeSize(idx:number){
    this.particles.geometry.attributes.size.setX(idx, 5)
  }

}
