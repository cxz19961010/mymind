# 进行文件转存、计算MD5、校验等操作
import hashlib
import os
import sys
import shutil

FILE_PATH = './files/'
E_PATH_NOT_EXIST = 2
E_FILE_EXIST = 3
E_FILE_NOT_EXIST = 4
E_DIR_NOT_EXIST = 5
E_PERMISSION_DENIED = 6

FILE_EXIST = 16 + E_FILE_EXIST
FILE_NOT_EXIST = 16 + E_FILE_NOT_EXIST
DIR_NOT_EXIST = 16 + E_DIR_NOT_EXIST


def file_get_md5(path):  # get file's md5
    try:
        md5file = open(path, 'rb')
    except:
        return E_FILE_NOT_EXIST

    md5 = hashlib.md5(md5file.read()).hexdigest()
    md5file.close()
    return md5


def file_ifexist(md5):  # return whether file is in FILE_PATH

    if md5[0:2] not in os.listdir(FILE_PATH):
        return DIR_NOT_EXIST

    path_dir = os.path.join(FILE_PATH, md5[0:2])

    # file has exists and no need to create again
    if md5 in os.listdir(path_dir):
        return FILE_EXIST
    else:
        return FILE_NOT_EXIST


def file_copy_in(path_src):  # if file isn't in FILE_PATH(by compare its md5 with others in FILE_PATH),then rename it after its md5 and return 0,else return E_FILE_EXIST
    md5 = file_get_md5(path_src)
    if md5 == E_FILE_NOT_EXIST:
        return E_FILE_NOT_EXIST

    path_dir = os.path.join(FILE_PATH, md5[0:2])
    path_dst = os.path.join(path_dir, md5)

    file_status = file_ifexist(md5)
    if file_status == DIR_NOT_EXIST:
        try:
            os.mkdir(path_dir)
        except:
            return E_PERMISSION_DENIED

    if file_status == FILE_NOT_EXIST or file_status == DIR_NOT_EXIST:

        try:
            shutil.copyfile(path_src,path_dst)
            return 0
        except:  # maybe because of permission denied
            return E_PERMISSION_DENIED
    else:  # file exists
        return FILE_EXIST


def file_remove(md5):

    if md5[0:2] not in os.listdir(FILE_PATH):
        return DIR_NOT_EXIST
    else:
        path_dir = os.path.join(FILE_PATH, md5[0:2])
        if md5 in os.listdir(path_dir):
            path_file = os.path.join(path_dir, md5)
            try:
                os.remove(path_file)
                if []==os.listdir(path_dir):
                    os.removedirs(path_dir)
                return 0
            except:
                return E_PERMISSION_DENIED
        else:
            return FILE_NOT_EXIST


def file_copy_out(md5, path_dst):

    if not os.path.isdir(os.path.dirname(path_dst)):  # path_dst not exists
        return E_DIR_NOT_EXIST
    '''elif os.path.isdir(path_dst): #file has exists
        return E_FILE_EXIST'''
    # there is no need to return E_FILE_EXIST,because under most conditions we will choose to override older file

    file_status = file_ifexist(md5)
    path_dir = os.path.join(FILE_PATH, md5[0:2])
    path_src = os.path.join(path_dir, md5)
    if file_status == FILE_EXIST:
        try:
            shutil.copyfile(path_src, path_dst)
            return 0
        except:
            return E_PERMISSION_DENIED
    else:
        return E_FILE_NOT_EXIST

