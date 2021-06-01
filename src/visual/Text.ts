import * as THREE from "three";
import { Box3 } from "three";

const titleFont = require("../../assets/fonts/Poppins-Light.json")
const glslify = require("glslify")

const TITLE_Y = 0
const SUBTITLE_Y = -150
const TITLE_SIZE = 115
const SUBTITLE_SIZE = 40

export class Text {

  private titleGeometry: THREE.TextBufferGeometry;
  private titleMesh: THREE.Mesh;
  private pointsPositions: THREE.Vector3[];
  private titlePoints: THREE.Points;
  private pointsMaterial: THREE.RawShaderMaterial;
  //private subtitleGeometry: THREE.TextBufferGeometry;
  //private subtitleMesh: THREE.Mesh;
  private font: THREE.Font;
  private textUniforms: any;
  private titleBox: Box3
  private titleBoxMesh: THREE.Mesh

  constructor() {
    //text
    this.font = new THREE.Font(titleFont);
    this.pointsPositions = [];
    this.titleBox = new THREE.Box3()
  }

  createText() {
    this.titleGeometry = new THREE.TextBufferGeometry("SYNTHETIC SPACES", {
      font: this.font,
      size: TITLE_SIZE,
      height: 8,
      curveSegments: 10,
      bevelEnabled: true,
      bevelThickness: 3,
      bevelSize: 2,
      bevelOffset: 0,
      bevelSegments: 5,
    });
    this.titleGeometry.center();
    this.titleGeometry.translate(0, TITLE_Y, 0)
    this.titleGeometry.computeBoundingBox();
    this.titleMesh = new THREE.Mesh(this.titleGeometry, new THREE.MeshBasicMaterial());

    let shape = this.font.generateShapes("SYNTHETIC SPACES", 115);

    let g = new THREE.ShapeBufferGeometry(shape);
    g.computeBoundingSphere();

    g.center();
    let holeShapes = [];

    for (let q = 0; q < shape.length; q++) {
      // thanks to to mr. RICARDO SANPRIETO for the tip on how to do this
      let s = shape[q];
      if (s.holes && s.holes.length > 0) {
        for (let j = 0; j < s.holes.length; j++) {
          let hole = s.holes[j];
          holeShapes.push(hole);
        }
      }
    }
    shape.push.apply(shape, holeShapes);

    for (let x = 0; x < shape.length; x++) {
      let s = shape[x];
      let segment = s.getSpacedPoints(80);
      segment.forEach((element, z) => {
        const a = new THREE.Vector3(element.x, element.y, Math.random());
        this.pointsPositions.push(a);
      });
    }

    let geom = new THREE.BufferGeometry().setFromPoints(this.pointsPositions);
    geom.center();

    this.textUniforms = {
      uPos: { type: "v3", value: new THREE.Vector3(1000, 100000, 100000) },
      uTimeT: { type: "f", value: 0 },
    };

    this.pointsMaterial = new THREE.ShaderMaterial({
      vertexShader: glslify(require("../../shaders/text.vert")),
      fragmentShader: glslify(require("../../shaders/text.frag")),
      uniforms: this.textUniforms,
    });

    this.titlePoints = new THREE.Points(geom, this.pointsMaterial);
    this.titlePoints.translateY(TITLE_Y)

    // Creating the bounding box for raycasting
    this.titleBox.copy(this.titleGeometry.boundingBox).applyMatrix4(this.titleMesh.matrixWorld)
    let dimensions = new THREE.Vector3().subVectors(this.titleBox.max, this.titleBox.min)
    let boxGeo = new THREE.BoxBufferGeometry(dimensions.x, dimensions.y, dimensions.z)
    this.titleBoxMesh = new THREE.Mesh(boxGeo, new THREE.MeshBasicMaterial( { color: 0xffcc55 } ))
    this.titleBoxMesh.translateY(TITLE_Y)
    this.titleBoxMesh.visible = false
  }

  update(time: number) {
    if (this.textUniforms) {
      this.textUniforms.uTimeT.value = time
    }
  }

  animate(x: number, y: number, z: number, t: number) {
    if (this.textUniforms) {
      this.textUniforms.uPos.value = new THREE.Vector3(x, y, z);
      this.textUniforms.uTimeT.value = t
    }
  }

  getText() {
    return { particleText: this.titlePoints, topText: this.titleMesh}
  }

  getBoundingBoxMesh() {
    return this.titleBoxMesh
  }

}