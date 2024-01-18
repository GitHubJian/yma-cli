#!/bin/bash

if [ -z "$1" ]; then
    echo "Tag 参数为空"
    exit 1
fi

docker build -t web:$1 .
docker save -o web-$1.tar web:$1
