from mongoengine import *
import datetime

class Node(Document):
    types = StringField()
    content = StringField()
    creation_time = DateTimeField(default=datetime.datetime.now)

    meta = {'allow_inheritance': True}


class FileNode(Node):  # node that save information of file
    types = StringField(default="File")
    filename = StringField()
    md5 = StringField()


# node that only have text,but can have attachments(through linked to FileNode
class TextNode(Node):
    types = StringField(default="Text")
    title = StringField(max_lenght=64)


class TagNode(Node):  # node that save information of tags
    types = StringField(default="Tag")
    tagname = StringField()


class SetNode(Node):  # node that move other nodes into a set
    types = StringField(default="Set")
    setname=StringField()


class LinkTagNode(Node):
    types = StringField(default="LinkTag")
    directed = BooleanField(default=False)


class Link(Document):
    tags = ListField(ObjectIdField())
    node_1 = ListField(ObjectIdField())
    node_2 = ListField(ObjectIdField())
