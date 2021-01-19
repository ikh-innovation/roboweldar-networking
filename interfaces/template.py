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

import os
import ws_client, http_client, json, sys, threading, time

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
def send_dummy_files(endpoint, host):
    # dummy data, files with those names should exist in this dir
    if endpoint == 'cache_images':
        filesNames = os.listdir('./images')
        files = map(lambda fileName: './images/' + fileName, filesNames)
    elif endpoint == 'cache_mesh':
        filesNames = os.listdir('./mesh')
        files = map(lambda fileName: './mesh/' + fileName, filesNames)
    http_client.send_files('http://' + host + ':' + httpPort + '/' + endpoint, files)


# obj upload example (mesh)
# e.g. sendMesh('mesh.obj')
def send_mesh(fName):
    http_client.upload_mesh('http://' + host + ':' + httpPort + '/cache_mesh', fName)


def get_images(host, httpPort, path_to_dir):
    images = http_client.get_filenames('http://' + str(host) + ':' + str(httpPort) + '/' + 'image_names')
    print(images)
    for image in images:
        url = 'http://' + str(host) + ':' + str(httpPort) + '/serve_image?name=' + str(image)
        content = http_client.download_file(url)
        path_to_image = os.path.join(path_to_dir, str(image))
        with open(path_to_image, 'wb') as f:
            print("Writing image: {}".format(path_to_image))
            f.write(content)


def get_mesh_files(host, httpPort, path_to_dir, mesh_files):
    # Default mesh files: ["transformed_mesh.obj", "transformed_mesh.mtl", "transformed_mesh_0.png"]
    files = http_client.get_filenames('http://' + str(host) + ':' + str(httpPort) + '/' + 'mesh_filenames')
    print(files)
    try:
        [files.index(file) for file in mesh_files]
    except ValueError as err:
        print("Not all files are uploaded yet!")
        return False

    for _file in mesh_files:
        url = 'http://' + str(host) + ':' + str(httpPort) + '/serve_mesh_files?name=' + str(_file)
        content = http_client.download_file(url)
        path_to_file = os.path.join(path_to_dir, str(_file))
        with open(path_to_file, 'wb') as f:
            print("Writing mesh: {}".format(path_to_file))
            f.write(content)

    return True


def get_trajectory_file(host, httpPort, path_to_dir, trajectory_file_name):
    """ Get .npy trajectory file from Server
        @param host: host IP - Type: string
        @param httpPort: HTTP port - Type: string
        @param path_to_dir: local path to save the trajectory file - Type: string
        @param trajectory_file_name: name of .npy trajectory file - Type: string 
    """
    files = http_client.get_filenames('http://' + str(host) + ':' + str(httpPort) + '/' + 'welding_trajectory')
    print(files)
    try:
        [files.index(file) for file in trajectory_file_name]
    except ValueError as err:
        print("Not all files are uploaded yet!")
        return False

    for _file in trajectory_file_name:
        url = 'http://' + str(host) + ':' + str(httpPort) + '/serve_trajectory_files?name=' + str(_file)
        content = http_client.download_file(url)
        path_to_file = os.path.join(path_to_dir, str(_file))
        with open(path_to_file, 'wb') as f:
            print("Writing mesh: {}".format(path_to_file))
            f.write(content)

    return True



def runMe():
    if len(sys.argv) < 4:
        print("wrong number of arguments")
        return
    host = sys.argv[1]
    if sys.argv[2] == 'ws':
        this_module_header = sys.argv[3]
        connectWS(this_module_header, host)
    elif sys.argv[2] == 'http':
        this_module_file_endpoint = sys.argv[3]
        send_dummy_files(this_module_file_endpoint, host)


if __name__ == '__main__':
    runMe()
