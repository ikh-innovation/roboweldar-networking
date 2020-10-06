# https://pypi.org/project/requests/2.7.0/
import requests, json


# host should be like "http://localhost:3000/cache_images
# imagesPathArr like ["/path/to/image1", "path/to/image2", ...]
# maybe change names to custom ones, e.g. file1.jpg
def send_files(host, file_path_array):
    files = []
    for index, file_path in enumerate(file_path_array):
        openedFile = open(file_path, 'rb')
        files.append(('files', (openedFile.name, openedFile)))

    r = requests.post(host, files=files)


def get_filenames(link):
    r = requests.get(link)
    if (r.status_code == 200):
        names = json.loads(r.text)
        return names
    else:
        print('request not served correctly', r)


def download_file(link):
    r = requests.get(link)
    if (r.status_code == 200):
        return r.content
    else:
        print('request not served correctly', r)


def upload_mesh(link, meshFilePath):
    openedFile = open(meshFilePath, 'rb')
    files = [('files', (openedFile.name, openedFile))]
    r = requests.post(link, files=files)
