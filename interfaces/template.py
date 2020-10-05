# 'images' and 'mesh' folders
#   are needed alongside this script
# args:
#   localhost -> server hostname
#   ws/http -> ws (transmit data) or
#     http (post images)
# examples:
#   python2 template.py localhost ws photo_capture
#   python3 template.py localhost ws sfm
#   python2 template.py localhost http cache_images
#   python2 template.py localhost http cache_mesh
# TODO: Add template for using cache_trajectory

import ws_client, http_client, json, sys, threading, time
from os import listdir

httpPort = "3000"
wsPort = "3001"


def connectWS(endpoint, host):
    wsClient = ws_client.getClient('ws://' + host + ':' + wsPort + '/' + endpoint)
    wst = threading.Thread(target=wsClient.run_forever)
    wst.daemon = True
    wst.start()
    running = True
    time.sleep(2)
    try:
        while (running):
            if (endpoint == 'sfm'):
                val = 5
            else:
                val = 15
            message = json.dumps({'status': val})
            ws_client.send_message(wsClient, message)
            time.sleep(1)

    except KeyboardInterrupt:
        running = False


# endpoint either 'cache_images'
# or 'cache_mesh'
def sendDummyFiles(endpoint, host):
    # dummy data, files with those names should exist in this dir
    if (endpoint == 'cache_images'):
        filesNames = listdir('./images')
        files = map(lambda fileName: './images/' + fileName, filesNames)
    elif (endpoint == 'cache_mesh'):
        filesNames = listdir('./mesh')
        files = map(lambda fileName: './mesh/' + fileName, filesNames)
    http_client.send_images('http://' + host + ':' + httpPort + '/' + endpoint, files)


# obj upload example (mesh)
# e.g. sendMesh('mesh.obj')
def sendMesh(fName):
    http_client.uploadMesh('http://' + host + ':' + httpPort + '/cache_mesh', fName)


def getImages(host, httpPort, path_to_dir):
    images = http_client.getImageNames('http://' + str(host) + ':' + str(httpPort) + '/' + 'image_names')
    print(images)
    for image in images:
        url = 'http://' + str(host) + ':' + str(httpPort) + '/serve_image?name=' + str(image)
        content = http_client.downloadImage(url)
        path_to_image = os.path.join(path_to_dir, str(image))
        with open(path_to_image, 'wb') as f:
            print("Writing image: {}".format(path_to_image))
            f.write(content)

def getMeshFiles(host, httpPort, path_to_dir, mesh_files = ["transformed_mesh.obj","transformed_mesh.mtl","transformed_mesh_0.png"]):
    files = http_client.getImageNames('http://' + str(host) + ':' + str(httpPort) + '/' + 'image_names')
    print(files)
    if (mesh_files not in files):
        print("The files not uploaded yet!")
        return False
    
    for _file in mesh_files:
        url = 'http://' + str(host) + ':' + str(httpPort) + '/serve_image?name=' + str(_file)
        content = http_client.downloadImage(url)
        path_to_file = os.path.join(path_to_dir, str(_file))
        with open(path_to_file, 'wb') as f:
            print("Writing image: {}".format(path_to_file))
            f.write(content)
        return True
    

def runMe():
    if (len(sys.argv) < 4):
        print("wrong number of arguments")
        return
    host = sys.argv[1]
    if (sys.argv[2] == 'ws'):
        thisModuleHeader = sys.argv[3]
        connectWS(thisModuleHeader, host)
    elif (sys.argv[2] == 'http'):
        thisModuleFileEndpoint = sys.argv[3]
        sendDummyFiles(thisModuleFileEndpoint, host)


if __name__ == '__main__':
    runMe()
