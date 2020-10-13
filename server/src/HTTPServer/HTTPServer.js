import express from "express";
import multer from "multer";
import fs from "fs";
import obj2gltf from "obj2gltf";
import cors from "cors";

export class HTTPServer {
  constructor(properties) {
    const { port, imagesPath, meshPath, weldingtrajPath } = properties;

    this.server = express();
    this.server.use(cors());
    this.server.listen(port);
    this.initFiles(imagesPath, meshPath, weldingtrajPath);
  }

  initFiles(imagesPath, meshPath, weldingtrajPath) {
    this.imageNamesServingEndpoint();
    this.meshFilesServingEndpoint();

    this.initFileStorage(imagesPath, meshPath, weldingtrajPath);

    this.initFileServing(imagesPath, meshPath, weldingtrajPath);
  }

  initFileServing(imagePath, meshPath, weldingtrajPath) {
    this.server.use("/images", express.static(imagePath)); // e.g. app.use(express.static('public'))  serves files in a directory named public
    this.server.use("/mesh", express.static(meshPath));
    this.server.use("/welding_trajectory", express.static(weldingtrajPath));
    this.imageServingEndpoint(imagePath);
    this.meshServingEndpoint(meshPath);

  }

  // TODO: make this more generic to serve files
  imageServingEndpoint(imagePath) {
    this.server.get("/serve_image", (req, res) => {
      const imageName = req.query.name;
      if (imageName) res.sendFile(`${imagePath}/${imageName}`, { root: "./" });
      else res.json({ message: "image not found" });
    });
  }

  meshServingEndpoint(meshPath) {
    this.server.get("/serve_mesh_files", (req, res) => {
      const fileName = req.query.name;
      if (fileName) res.sendFile(`${meshPath}/${fileName}`, { root: "./" });
      else res.json({ message: "file not found" });
    });
  }

  initFileStorage(imagesPath, meshPath, weldingtrajPath) {
    // returns a StorageEngine instance configured to store files on the local file system.
    const imageStorage = multer.diskStorage({
      destination: imagesPath,
      filename: (req, file, callback) => {
        callback(null, file.originalname);
      },
    });
    const pcStorage = multer.diskStorage({
      destination: meshPath,
      filename: (req, file, callback) => {
        callback(null, file.originalname);
      },
    });

    const trajectoryStorage = multer.diskStorage({
      destination: weldingtrajPath,
      filename: (req, file, callback) => {
        callback(null, file.originalname);
      },
    });

    // Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files.
    this.imageUploader = multer({ storage: imageStorage }); // Multer instances
    this.pcUploader = multer({ storage: pcStorage });
    this.trajectoryUploader = multer({ storage: trajectoryStorage });
  }

  /* add try/catch or validation */

  // POST is the HTTP method that is used to send data to a receiving web application.
  cacheImagesEndpoint(callback) {
    this.server.post(
      "/cache_images",
      this.imageUploader.array("files"),
      (req, res) => {
        callback(req, res);
        res.json({ message: "cache point cloud page hit" });
      }
    );
  }

  /* add try/catch or validation */
  cacheMeshEndpoint(callback) {
    this.server.post(
      "/cache_mesh",
      this.pcUploader.array("files"),
      (req, res) => {
        req.files.forEach((file) => {
          if (file.originalname.match(/.obj/i))
            obj2gltf(`${file.destination}/${file.originalname}`).then(
              async (gltf) => {
                const data = Buffer.from(JSON.stringify(gltf));
                await fs.writeFileSync(`${file.destination}/model.gltf`, data);
                callback(req, res);
              }
            );
        });
        res.json({ message: "cache point cloud page hit" });
      }
    );
  }

  weldSeamDetectionEndpoint(callback) {
    this.server.post(
      "/cache_welding_trajectory",
      this.trajectoryUploader.array("files"),
      (req, res) => {
        callback(req, res);
        res.json({ message: "cache welding trajectory page hit" });
      }
    );
  }

  imageNamesServingEndpoint() {
    this.server.get("/image_names", (req, res) => {
      let fileNames = [];
      fs.readdir("./uploads/images/", (err, files) => {
        if (err) {
          res.json({ message: "error acquiring image names" });
          return;
        }
        res.json(files);
      });
    });
  }

  meshFilesServingEndpoint() {
    this.server.get("/mesh_filenames", (req, res) => {
      let fileNames = [];
      fs.readdir("./uploads/mesh/", (err, files) => {
        if (err) {
          res.json({ message: "error acquiring mesh file names" });
          return;
        }
        res.json(files);
      });
    });
  }

  weldingTrajectoryServingEndpoint() {
    this.server.get("/welding_trajectory", (req, res) => {
      let fileNames = [];
      fs.readdir("./uploads/welding_trajectory/", (err, files) => {
        if (err) {
          res.json({ message: "error acquiring trajectory file names" });
          return;
        }
        res.json(files);
      });
    });
  }

  photoCaptureStartEndpoint(callback) {
    this.server.get("/start_photo_capture", (req, res) => {
      callback(req, res);
      res.json({ message: "start_photo_capture page hit" });
    });
  }

  weldingSeamDetectionStartEndpoint(callback) {
    this.server.get("/start_welding_seam_detection", (req, res) => {
      callback(req, res);
      res.json({ message: "start_welding_seam_detection page hit" });
    });
  }

  sfmStopEndpoint(callback) {
    this.server.get("/stop_sfm", (req, res) => {
      callback(req, res);
      res.json({ message: "stop_photo_capture page hit" });
    });
  }
}

// TODO: create endpoint for welding progress