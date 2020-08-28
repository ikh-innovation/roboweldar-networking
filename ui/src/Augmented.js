import * as Three from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default class Augmented {
  constructor( properties ) {
    this.initThree();
  }
  
  initThree() {
    const animate = () => {
      requestAnimationFrame( animate );
      this.renderer.render( this.scene, this.camera );
    };

    this.scene = new Three.Scene();
    this.camera = new Three.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    this.renderer = new Three.WebGLRenderer();
    const ambientLight = new Three.AmbientLight( 0xcccccc, 0.4 );
    const pointLight = new Three.PointLight( 0xffffff, 0.8 );
    const controls = new OrbitControls( this.camera, this.renderer.domElement )
    
    this.renderer.setSize( window.innerWidth / 2, window.innerHeight / 2);
    this.renderer.setClearColor(0xAFAFBF, 1);
    document.body.appendChild( this.renderer.domElement );
    
    this.camera.position.z = 10;
    
    ambientLight.position.set( -10, -10, 10);
    this.scene.add( ambientLight );
    this.camera.add( pointLight );
    animate();
  }
    
  loadObj( mtlPath, objPath ) {
    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader();

    mtlLoader.load(
      mtlPath,
      ( materials ) => {
         materials.preload();
         objLoader.load(
           objPath,
           ( object ) => {
             this.scene.add( object );
           },
           ( xhr ) => {
             onLoadProgress( xhr );
           },
           ( error ) => {
             onLoadError( error );
           }
         )
      }
    );
  }
  
}

function onLoadProgress( xhr ) {
  console.log( `${(xhr.loaded / xhr.total * 100 )} %`);
}

function onLoadError( error ) {
  console.log( `Err: ${ error }` );
}
