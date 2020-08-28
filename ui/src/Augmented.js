import * as Three from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader.js';
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
    const ambientLight = new Three.AmbientLight( 0xcccccc, 2 );
    const pointLight = new Three.PointLight( 0xffffff, 1 );
    const controls = new OrbitControls( this.camera, this.renderer.domElement )
    
    this.renderer.setSize( window.innerWidth / 2, window.innerHeight / 2);
    this.renderer.setClearColor(0xAFAFBF, 1);
    document.body.appendChild( this.renderer.domElement );
    
    this.camera.position.z = 250;
    this.camera.position.y = 50;
    
    this.scene.add( ambientLight );
    this.camera.add( pointLight );
    animate();
  }
    
  loadObj( mtlPath, objPath ) {
    const staticPCPath = 'http://localhost:3000/point_cloud/';
    const manager = new Three.LoadingManager();
    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader();
    manager.addHandler( /\.dds$/i, new DDSLoader() );
    objLoader.setPath( staticPCPath );
    mtlLoader.setPath( staticPCPath );

    mtlLoader.load(
      mtlPath,
      ( materials ) => {
         materials.preload();
         objLoader.setMaterials( materials );
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
