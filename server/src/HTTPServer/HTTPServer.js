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

    this.initFileStorage(imagesPath, meshPath, weldingtrajPath);

    this.initFileServing(imagesPath, meshPath, weldingtrajPath);
  }

  initFileServing(imagePath, meshPath, weldingtrajPath) {
    this.server.use("/images", express.static(imagePath));
    this.server.use("/mesh", express.static(meshPath));
    this.server.use("/annotated_mesh", express.static(weldingtrajPath));
    this.imageServingEndpoint(imagePath);
  }

  imageServingEndpoint(imagePath) {
    this.server.get("/serve_image", (req, res) => {
      const imageName = req.query.name;
      if (imageName) res.sendFile(`${imagePath}/${imageName}`, { root: "./" });
      else res.json({ message: "image not found" });
    });
  }

  initFileStorage(imagesPath, meshPath, weldingtrajPath) {
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

    this.imageUploader = multer({ storage: imageStorage });
    this.pcUploader = multer({ storage: pcStorage });
    this.trajectoryUploader = multer({ storage: trajectoryStorage });
  }

  /* add try/catch or validation */
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
      "/cache_annotated_mesh",
      this.trajectoryUploader.array("files"),
      (req, res) => {
        req.files.forEach((file) => {
          if (file.originalname.match(/.obj/i))
            obj2gltf(`${file.destination}/${file.originalname}`).then(
              async (gltf) => {
                const data = Buffer.from(JSON.stringify(gltf));
                await fs.writeFileSync(`${file.destination}/annotated_model.gltf`, data);
                callback(req, res);
              }
            );
        });
        res.json({ message: "cache annotated point cloud page hit" });
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

  sfmStopEndpoint(callback) {
    this.server.get("/stop_sfm", (req, res) => {
      callback(req, res);
      res.json({ message: "stop_photo_capture page hit" });
    });
  }
}
