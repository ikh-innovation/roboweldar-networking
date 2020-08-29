import * as Three from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as Config from './Config.js';

export default class Augmented {
  constructor( properties ) {
    const canvasDOMId = properties.canvasDOMId;
    this.initThree( canvasDOMId );
  }

  initThree( canvasDOMId ) {
    const animate = () => {
      requestAnimationFrame( animate );
      this.renderer.render(
        this.scene,
        this.camera
      );
    };

    this.scene = new Three.Scene();

    this.camera =
      new Three.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

    const rendererDOM =
      document.getElementById( canvasDOMId );
    this.renderer =
      new Three.WebGLRenderer( { canvas: rendererDOM } );

    const ambientLight =
      new Three.AmbientLight( 0xcccccc, 2 );

    const pointLight =
      new Three.PointLight( 0xffffff, 1 );

    const controls =
      new OrbitControls(
        this.camera,
        rendererDOM
      );

    this.renderer.setSize(
      window.innerWidth / 2,
      window.innerHeight / 2
    );
    rendererDOM.style.visibility = 'hidden';

    this.renderer.setClearColor( 0xAFAFBF, 1 );
    this.camera.position.z = 250;
    this.camera.position.y = 50;
    this.scene.add( ambientLight );
    this.camera.add( pointLight );

    window.addEventListener( 'resize', () => {
      this.camera.aspect =
        rendererDOM.clientWidth / rendererDOM.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(
        rendererDOM.clientWidth / 2,
        rendererDOM.clientHeight / 2
      );
    }, false );

    animate();
  }

  loadObj( properties ) {
    const mtlPath = properties.mtl;
    const objPath = properties.obj;
    const hostname = properties.hostname;
    const port = properties.port;
    const endpoint = properties.endpoint;

    const meshFilesPath =
      `http://${hostname}:${port}/${endpoint}/`;

    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader();

    objLoader.setPath( meshFilesPath );
    mtlLoader.setPath( meshFilesPath );

    mtlLoader.load(
      mtlPath,
      ( materials ) => {
        materials.preload();
        objLoader.setMaterials( materials );
        objLoad(
          objLoader,
          objPath,
          this.scene
        );
        this.renderer.domElement.style.visibility =
          'visible';
      }
    );
  }
}

function objLoad( objLoader, objPath, scene ) {
  objLoader.load(
    objPath,
    ( object ) => {
      scene.add( object );
    },
    ( xhr ) => {
      onLoadProgress( xhr );
    },
    ( error ) => {
      onLoadError( error );
    }
  );
}

function onLoadProgress( xhr ) {
  console.log(
    `${(xhr.loaded / xhr.total * 100 )} %`
  );
}

function onLoadError( error ) {
  console.log( `Err: ${ error }` );
}
