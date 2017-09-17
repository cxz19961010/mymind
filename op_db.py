import model
import settings
from mongoengine import *

def db_connect():
    if DATABASE['username']=='' or DATABASE['password']=='':
        connect(DATABASE['db_name'],host=DATABASE['host'],post=DATABASE['post'])
    else:
        connect(DATABASE['db_name'],host=DATABASE['host'],post=DATABASE['post'],username=DATABASE['username'],password=DATABASE['password'])

def 

