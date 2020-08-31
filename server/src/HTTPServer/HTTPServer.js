import express from 'express';
import multer from 'multer';
import fs from 'fs';
import obj2gltf from 'obj2gltf';
import cors from 'cors';

export class HTTPServer {
  constructor( properties ) {
    const {
      port,
      imagesPath,
      meshPath
    } = properties;

    this.server = express();
    this.server.use( cors() );
    this.server.listen( port );
    this.initFiles( imagesPath, meshPath );
  }

  initFiles( imagesPath, meshPath ) {
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

  initFileServing( imagePath, meshPath ) {
    this.server.use(
      '/images',
      express.static( imagePath )
    );
    this.server.use(
      '/mesh',
      express.static( meshPath )
    );
    this.imageServingEndpoint( imagePath );
  }

  imageServingEndpoint( imagePath ) {
    this.server.get(
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
    this.server.post(
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
    this.server.post(
      '/cache_mesh',
      this.pcUploader.array( 'files' ),
      ( req, res ) => {
        req.files.forEach( ( file ) => {
          if ( file.originalname.match(/.obj/i) )
          obj2gltf(`${file.destination}/${file.originalname}`)
          .then( (gltf) => {
            const data = Buffer.from(JSON.stringify(gltf));
            fs.writeFileSync(`${file.destination}/model.gltf`, data);
          });
        });
        res.json(
          { 'message': 'cache point cloud page hit' }
        );
        callback( req, res );
      }
    );
  }

  imageNamesServingEndpoint() {
    this.server.get(
      '/image_names',
      ( req, res ) => {
        let fileNames = [];
        fs.readdir( './uploads/images/', ( err, files ) => {
          if ( err ) {
            res.json(
              { 'message': 'error acquiring image names' }
            );
            return;
          }
          res.json( files );
        })
      }
    );
  }

  photoCaptureEndpoint( callback ) {
    this.server.get(
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
