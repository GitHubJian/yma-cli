#!/bin/bash

docker images

exit_status=$?
if [ $exit_status -eq 0 ]; then
else
    echo "Docker 未启动"
    exit 1
fi

current_file="$0"
current_dir=$(dirname "$(readlink -f "$current_file")")
metadata=$current_dir/docker.json
expect_version=$(grep -o '"version": "[^"]*' $metadata | sed 's/"version": "//')
name=$(grep -o '"name": "[^"]*' $metadata | sed 's/"name": "//')
webapi=$(grep -o '"webapi": "[^"]*' $metadata | sed 's/"webapi": "//')
version=""

image_lines=$(docker image ls --format "{{.Repository}}:{{.Tag}}" | grep "$name")
max_version=""

# 遍历镜像标签列表
for tag in $image_lines; do
    # 提取版本号部分
    image_version=$(echo $tag | cut -d ":" -f 2)

    # 比较版本号大小
    if [[ "$image_version" > "$max_version" ]]; then
        max_version=$image_version
    fi
done

if [[ "$expect_version" != "$max_version" ]]; then
    echo "[ERROR]: 期望版本 $expect_version，获取版本 $max_version"
    echo "[ERROR]: 请重新执行 $ npm run docker:build 命令"
    exit
fi

version=$expect_version

read -p "请输入 HOST_WEB_API 参数（$webapi）: " host_web_api

if [ -z "$host_web_api" ]; then
    # 使用默认值
    host_web_api=$webapi
fi

echo "HOST_WEB_API: $host_web_api"
echo "VERSION: $expect_version"

container_id=$(docker ps -a -q --filter "name=$name")

if [ -n "$container_id" ]; then
    echo "正在停止容器 $container_id"
    docker stop $container_id
    docker rm -f $container_id
fi

# -it 可中断
# -d 后台运行
str="docker run -it --name $name -e HOST_WEB_API=$host_web_api -p 80:8080 $name:$version"
echo $str
echo ""

docker run -it --name $name -e HOST_WEB_API=$host_web_api -p 80:8080 $name:$version
