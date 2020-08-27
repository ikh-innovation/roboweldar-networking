import * as Three from 'three';

export default class Augmented {
  constructor( properties ) {
    this.canvas = document.createElement( 'canvas' );
    document.body.append(this.canvas);
    this.initThree();
  }
  
  initThree() {
    this.scene = new Three.Scene();
    this.camera = 
      new Three.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        2000
      );
    this.renderer = new Three.WebGLRenderer( { canvas: this.canvas } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.camera.position.z = 250;
    this.scene.add( this.camera );
  }
  
  showObj( show ) {
    this.canvas.style.visibility = (show)? 'visible': 'hidden';
  }
  
  loadObj( objPath ) {
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
