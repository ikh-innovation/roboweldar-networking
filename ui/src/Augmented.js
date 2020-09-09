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
      this.controls.update();
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
    const hemiLight = new Three.HemisphereLight( 0xffffbb, 0x080820, 1 );

    this.camera.position.x = 2;
    this.camera.position.y = 2;
    this.camera.position.z = 2;
    this.camera.rotation.set( Math.PI / 2, 0, 0 );
    this.scene.add( ambientLight );
    this.scene.add( hemiLight );


    this.controls =
      new OrbitControls(
        this.camera,
        rendererDOM
      );


    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05 ;

    this.renderer.setSize(
      window.innerWidth / 2,
      window.innerHeight / 2
    );
    rendererDOM.style.visibility = 'hidden';
    rendererDOM.style.borderRadius="10px";
    rendererDOM.style.border="5px solid black";

    this.renderer.setClearColor( 0xFFFAFA, 1 );

    window.addEventListener( 'resize', () => {
      this.camera.aspect =
        window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(
        window.innerWidth / 2,
        window.innerHeight / 2
      );
    }, false );

    this.initGroundPlane();
    animate();
  }

  loadGLTF( properties, xhrCallback, completionCallback ) {
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
        const obj = gltf.scene;
        obj.rotation.set( Math.PI, 0, 0 );
        scene.add( gltf.scene );
        this.renderer.domElement.style.visibility =
                  'visible';
        completionCallback();
      },
      ( xhr ) => {
        xhrCallback( parseInt( (xhr.loaded / xhr.total * 100 ) ) );
//        onLoadProgress( xhr );
      },
      ( error ) => {
        onLoadError( error );
      }
    );
  }

  initGroundPlane() {
    const geometry = new Three.PlaneGeometry( 5, 5, 8, 8 );
    const material =
      new Three.MeshBasicMaterial(
        {
          color: 0x44ABDA,
          side: Three.DoubleSide
        }
      );
    const plane = new Three.Mesh( geometry, material );
    plane.position.y = - 0.5;
    plane.rotation.set( Math.PI / 2, 0, 0 );
    this.scene.add( plane );
  }
}

function onLoadProgress( xhr ) {
  console.log(
    `${(xhr.loaded / xhr.total * 100 )} %`
  );
}

function onLoadError( error ) {
  console.log( `Err: ${ error }` );
}
