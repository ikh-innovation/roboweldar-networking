import * as Three from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export default class Augmented {
  constructor( properties ) {
    this.canvas = document.getElementById( 'obj-mesh' );
    this.initThree();
  }
  
  initThree() {
    const aspectRatio=  window.innerWidth / window.innerHeight;
    const light = new Three.PointLight(0xffffff, 1, 0);
    this.scene = new Three.Scene();
    this.camera = 
      new Three.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    this.renderer = new Three.WebGLRenderer( { canvas: this.canvas } );
    
    this.camera.position.set(0, 0, 50);
    
    light.position.set(1, 1, 1);
    
    this.scene.background = new Three.Color(0x111111);
    this.scene.add(light);
    
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
    this.renderer.render( this.scene, this.camera );
  }
  
  showObj( show ) {
    this.canvas.style.visibility = (show)? 'visible': 'hidden';
  }
  
  loadObj( objPath ) {
    console.log(objPath);
    const loader = new OBJLoader();
    loader.load(
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
  
}

function onLoadProgress( xhr ) {
  console.log( `${(xhr.loaded / xhr.total * 100 )} %`);
}

function onLoadError( error ) {
  console.log( `Err: ${ error }` );
}
