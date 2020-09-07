# Installation  

- `yarn install`  

# Running  

- `yarn start`  

# Configuring  

- `src/Config/index.js`  


# Notes

- Developed NodeJS version: **14.4.0**.  
- Default HTTP port is 3000  
- Default WS port is 3001  
- 3D produced models are transformed from `.obj` to `.gltf`. Original files remain though.
- Uploaded files are stored in `uploads` folder, which is created by `multer` (the http file uploading/downloading middleware).  
    - No file type checks are completed yet, will do so when they are decided. []
- HTTP core can be found in `src/HTTPServer`.  
- WebSocket core can be found in `src/WebSocket`.  
    
