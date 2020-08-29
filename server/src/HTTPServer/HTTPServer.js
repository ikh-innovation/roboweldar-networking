const express = require( 'express' );
const multer = require( 'multer' );
const fs = require( 'fs' );
const cors = require('cors');


class HTTPServer {
  constructor(properties) {
    const port = properties.port;
    const imagesPath =
      properties.imagesPath;
    const meshPath =
      properties.meshPath;
    this.httpApp = express();
    this.httpApp.use(cors());
    this.httpApp.listen( port );
    this.imageNamesServingEndpoint();
    this.initFileStorage(
      imagesPath,
      meshPath
    );
    this.initFileServing(
      imagesPath,
      meshPath
    );
  }

  initFileStorage( imagesPath, meshPath ) {
    const imageStorage =
      multer.diskStorage(
        {
          destination:
            imagesPath,
          filename:
            ( req, file, callback ) => {
              callback( null, file.originalname );
            }
        }
     );
    const pcStorage =
      multer.diskStorage(
        {
          destination:
            meshPath,
          filename:
            ( req, file, callback ) => {
              callback( null, file.originalname );
            }
        }
      );
    this.imageUploader =
      multer(
        { storage: imageStorage }
      );
    this.pcUploader =
      multer(
        { storage: pcStorage }
      );
  }

  /* add try/catch or validation */
  cacheImagesEndpoint( callback ) {
    this.httpApp.post(
      '/cache_images',
      this.imageUploader.array( 'files' ),
      ( req, res ) => {
        callback( req, res );
        res.json(
          { 'message': 'cache point cloud page hit' }
        );
      }
    );
  }

  /* add try/catch or validation */
  cacheMeshEndpoint( callback ) {
    this.httpApp.post(
      '/cache_mesh',
      this.pcUploader.array( 'files' ),
      ( req, res ) => {
        callback( req, res );
        res.json(
          { 'message': 'cache point cloud page hit' }
        );
      }
    );
  }

  imageNamesServingEndpoint() {
    this.httpApp.get(
      '/image_names',
      ( req, res ) => {
        let fileNames = [];
        fs.readdir( './uploads/images/', ( err, files ) => {
          if ( err ) {
            res.json(
              { 'message': 'error acquiring names from image files' }
            );
            return;
          }
          res.json( files );
        })
      }
    );
  }

  initFileServing( imagePath, meshPath ) {
    this.httpApp.use(
      '/images',
      express.static( imagePath )
    );
    this.httpApp.use(
      '/mesh',
      express.static( meshPath )
    );
    this.imageServingEndpoint( imagePath );
  }

  imageServingEndpoint( imagePath ) {
    this.httpApp.get(
      '/serve_image',
      ( req, res ) => {
        const imageName =
          req.query.name
        if (imageName)
          res.sendFile(
            `${imagePath}/${imageName}`,
            { root: './' }
          );
        else res.json(
          { 'message': 'image not found' }
        );
      }
    );
  }

  photoCaptureEndpoint( callback ) {
    this.httpApp.get(
      '/initialize_photo_capture',
      ( req, res ) => {
        callback( req, res );
        res.json(
          { 'message': 'initialize_photo_capture page hit' }
        );
      }
    );
  }
}

module.exports.HTTPServer = HTTPServer;
