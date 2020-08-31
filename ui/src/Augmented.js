import * as Three from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as Config from './Config.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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
      new Three.AmbientLight( 0xcccccc, 1 );

    const dirLight = new Three.DirectionalLight(0xffffff, 5);

    this.scene.add( dirLight );
    this.scene.add( ambientLight );

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

    this.renderer.setClearColor( 0xBFAF1F, 1 );
    this.camera.position.z = 25;

    window.addEventListener( 'resize', () => {
      this.camera.aspect =
        window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(
        window.innerWidth / 2,
        window.innerHeight / 2
      );
    }, false );

    animate();
  }

  loadGLTF( properties ) {
    const {
      gltf: gltfPath,
      hostname,
      port,
      endpoint
    } = properties;

    const filesPath =
      `http://${hostname}:${port}/${endpoint}/${gltfPath}`;

    const gltfLoader = new GLTFLoader();
    const scene = this.scene;
    gltfLoader.load(
      filesPath,
      ( gltf ) => {
        scene.add( gltf.scene );
        this.renderer.domElement.style.visibility =
                  'visible';
      },
      ( xhr ) => {
        onLoadProgress( xhr );
      },
      ( error ) => {
        onLoadError( error );
      }
    );
  }

  loadObj( properties ) {
    const {
      mtl: mtlPath,
      obj: objPath,
      hostname,
      port,
      endpoint
    } = properties;

    const meshFilesPath =
      `http://${hostname}:${port}/${endpoint}/`;

    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader();

    objLoader.setPath( meshFilesPath );
    mtlLoader.setPath( meshFilesPath );
    mtlLoader.setMaterialOptions( { invertTrProperty: true } )
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
      //object.scale.set( 5, 5, 5);
      object.rotation.set( Math.PI / 2, 0, 0 );
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
