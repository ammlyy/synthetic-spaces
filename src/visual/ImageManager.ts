import * as THREE from "three";

import img from "../../assets/tokyo.jpg"
import img2 from "../../assets/london.jpg"
import img3 from '../../assets/marrakech.jpg' //marrakech
import img4 from '../../assets/lisboa.jpg'
import img5 from '../../assets/havana.jpg'
import img6 from '../../assets/barca.jpg'
import img7 from '../../assets/venice.jpg'
import img8 from '../../assets/mexico.jpg'

import depth from "../../assets/tokyoDepth.jpg"
import depth2 from "../../assets/londonDepth.jpg"
import depth3 from '../../assets/marrakechDepth.jpg' // marrakech
import depth4 from '../../assets/lisboaDepth.jpg'
import depth5 from '../../assets/havanaDepth.jpg'
import depth6 from '../../assets/barcaDepth.jpg'
import depth7 from '../../assets/veniceDepth.jpg'
import depth8 from '../../assets/mexicoDepth.jpg'

import { ParticleSystem } from "./ParticleSystem";

export class ImageManager {
    private paths: any   // paths for images and depths
    private dpaths: any

    private textures: THREE.Texture[]
    private depths: THREE.Texture[]
    private imgLoader: THREE.TextureLoader;


    constructor() {

        this.paths = [img, img2, img3, img4, img5, img6, img7, img8]
        this.dpaths = [depth, depth2, depth3, depth4, depth5, depth6, depth7, depth8]

        this.textures = []
        this.depths = []

    }

    async loadImages(ps: ParticleSystem) {
        const manager = new THREE.LoadingManager();
        this.imgLoader = new THREE.TextureLoader(manager);
        var img: THREE.Texture;

        for (let i = 0; i < this.paths.length; i++) {
            this.imgLoader.load(this.paths[i], (tex) => {
                img = tex;
                img.transformUv;
                img.minFilter = THREE.LinearFilter;
                img.magFilter = THREE.LinearFilter;
                img.format = THREE.RGBFormat;
                img.type = THREE.FloatType;
                this.textures[i] = img;
            })
        }
        var depth: THREE.Texture;


        for (let j = 0; j < this.paths.length; j++) {
            this.imgLoader.load(this.dpaths[j], (tex) => {
                depth = tex
                depth.transformUv;
                depth.minFilter = THREE.LinearFilter;
                depth.magFilter = THREE.LinearFilter;
                depth.format = THREE.RGBFormat;
                depth.type = THREE.FloatType;

                this.depths[j] = depth
            })

        }

        manager.onLoad = () => {
            ps.createPoints()
        }


    }

    getImage(idx: number) {
        return this.textures[idx]
    }

    getImagePath(idx: number): string {
        return this.paths[idx]
    }

    getDepth(idx: number) {
        return this.depths[idx]
    }

    getDimensions(idx: number) {
        return { x: this.textures[idx].image.width, y: this.textures[idx].image.height }

    }

    getNumberImages(): number {
        return this.textures.length
    }

}