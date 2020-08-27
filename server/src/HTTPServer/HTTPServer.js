const express = require( 'express' );
const multer = require( 'multer' );
const fs = require( 'fs' );
const cors = require('cors');

class HTTPServer {
  constructor(properties) {
    this.port = properties.port;
    this.httpApp = express();
    this.httpApp.use(cors());
    this.initializeEndpoints();
  }

  initializeEndpoints() {
    this.getImageNames();
    this.initImageStorage();
    this.cacheImages();
    this.servePointCloud();
    this.serveImage();
    this.httpApp.listen( this.port );
  }

  /* add try/catch or validation */
  cacheImages() {
    this.httpApp.post(
      '/cache_images',
      this.imageUploader.array( 'files' ),
      ( req, res ) => {
        res.json( { 'message': 'cache point cloud page hit' } );
      }
    );
  }


  initImageStorage() {
    const imageStorage = 
      multer.diskStorage( {
        destination: './uploads/images/',
        filename: ( req, file, callback ) => {
          callback( null, file.originalname );
        }
      } );
    const pcStorage = 
      multer.diskStorage( {
        destination: './uploads/point_cloud/',
        filename: ( req, file, callback ) => {
          callback( null, 'mesh.obj' );
        }
      } );
    this.imageUploader = multer( { storage: imageStorage } ); 
    this.pcUploader = multer( { storage: pcStorage } ); 
  }

  servePointCloud() {
    this.httpApp.use( express.static( './uploads' ) );
    this.httpApp.get(
      '/serve_point_cloud',
      ( req, res ) => {
        res.sendFile( './uploads/point_cloud/mesh.obj', { root: './' } );
      }
    );
  }
  
  getImageNames() {
    this.httpApp.get(
      '/image_names',
      ( req, res ) => {
        let fileNames = [];
        fs.readdir( './uploads/images/', ( err, files ) => {
          if ( err ) {
            res.json( { 'message': 'error acquiring names from image files' } );
            return;
          }
          res.json( files );
        })   
      }
    );
  }
  
  serveImage() {
    this.httpApp.use( express.static( './images' ) );
    this.httpApp.get(
      '/serve_image',
      ( req, res ) => {
        const imageName = req.query.imageName
        if (imageName) res.sendFile( `./uploads/images/${imageName}`, { root: './' } );
        else res.json( { 'message': 'image not found' } )
      }
    );
  }
  
  initPhotoCapture( callback ) {
    this.httpApp.get(
      '/initialize_photo_capture',
      ( req, res ) => {
        callback( req, res );
        res.json( { 'message': 'initialize_photo_capture page hit' } );
      }
    );
  }
  
  photoCaptureComplete( callback ) {
    this.httpApp.get(
      '/photo_capture_complete',
      ( req, res ) => {
        callback( req, res );
        res.json( { 'message': 'photo_capture_complete page hit' } );
      }
    );
  }
  
  /* add try/catch or validation */
  cachePointCloud( callback ) {
    this.httpApp.post(
      '/cache_mesh',
      this.pcUploader.array( 'files' ),
      ( req, res ) => {
        callback( req, res );
        res.json( { 'message': 'cache point cloud page hit' } );
      }
    );
  }
}

module.exports.HTTPServer = HTTPServer;
