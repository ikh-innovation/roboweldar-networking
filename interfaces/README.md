# Dependencies

- (websocket_client)[https://pypi.org/project/websocket_client/]
- (requests)[https://requests.readthedocs.io/en/master/]

`cd python interfaces`
`pip install -r requirements.txt`

# Template

- Expects `images` and `meshFiles` folders alongside the script. Those folders contain photo capture's and structure from motion's output.  
- First argument to be passed is coordinator's hostname/IP (eg `localhost`).  
- Second argument is the required functionality of the script (e.g. to act as a WebSocket client or an HTTP client). It can be either `ws` or `http`:  
    - In the first scenario, the last argument is either `photo_capture` (photo capture WebSocket functionality) or `sfm` (SfM WebSocket functionality).  
    - In the second scenario, the last argument is either `cache_images` (ALL images which exist in `images/` folder are uploaded to the coordinator) or `cache_mesh` (ALL files which exist in `meshFiles` folder are uploaded to the coordinator).  
