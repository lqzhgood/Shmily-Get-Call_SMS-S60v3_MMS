# -*- coding: utf-8 -*-

from messaging.mms.message import MMSMessage
from array import array
import os
import json
import copy


INPUT_DIR = os.path.join('../input')

list = []


def readDir(path):
    files = os.listdir(path)
    for file in files:
        sPath = os.path.join(path, file)
        if os.path.isdir(sPath):
            readDir(sPath)
        elif str(sPath).endswith('.mms'):
            print(sPath)
            decodeMMS(sPath)
            list.append(sPath)


def decodeMMS(path):
    data = array("B", open(path, 'rb').read())
    mms = MMSMessage.from_data(data)

    mmsObj = copy.deepcopy(mms.__dict__)
    mmsObj['_data_parts'] = []

    for p in mms.data_parts:
        mmsP = copy.deepcopy(p.__dict__)
        mmsObj['_data_parts'].append(mmsP)
        arr = []
        for i in p.data:
            arr.append(i)
        mmsP['_data'] = arr

    jsonStr = json.dumps(mmsObj, indent=4, sort_keys=True,
                         ensure_ascii=False, default=str)
    fo = open(path + ".json", "w", encoding='utf8')
    fo.write(jsonStr)


readDir(INPUT_DIR)

fo = open(INPUT_DIR+'./list.json', "w", encoding='utf8')
fo.write(json.dumps(list, indent=4,
                    ensure_ascii=False, default=str))
