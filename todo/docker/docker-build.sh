#!/bin/bash

docker images

exit_status=$?
if [ $exit_status -ne 0 ]; then
    echo ""
    echo -e "\e[31m[Docker]\e[0m 未启动"
    echo ""
    exit 1
fi

rm -r dist
rm -r output

required_node_version="v14.18.0"
node_version=$(node -v)

if [ "$node_version" != "$required_node_version" ]; then
    echo "Error: node.js version $required_node_version is required, but found $node_version\n"
    exit 1
fi
echo "node.js version: $node_version"

npm_version=$(npm -v)
echo "npm version: $npm_version"

npm install -g yarn@1.22.19

yarn

npm run build

exit_status=$?

if [ $exit_status -eq 0 ]; then
    echo "\e[32m[NPM]\e[0m npm run build -> success"
else
    echo "\e[31m[NPM]\e[0m npm run build -> fail"
    exit 1
fi

mkdir -p output

cp nginx.conf output/

cp -r dist output/

echo "mkdir ouput success"

current_file="$0"
current_dir=$(dirname "$(readlink -f "$current_file")")
metadata=$current_dir/docker.json
# 读取原始的 metadata.json 内容
content=$(cat $metadata)
# 提取当前的版本号
name=$(echo "$content" | grep -o '"name": "[^"]*' | sed 's/"name": "//')
version=$(echo "$content" | grep -o '"version": "[^"]*' | sed 's/"version": "//')

# 解析版本号的每个部分
major=$(echo "$version" | cut -d '.' -f 1)
minor=$(echo "$version" | cut -d '.' -f 2)
patch=$(echo "$version" | cut -d '.' -f 3)

# 自增版本号的最后一部分
patch=$((patch + 1))

# 创建版本号
new_version="$major.$minor.$patch"

docker build -t $name:$new_version .

exit_status=$?
if [ $exit_status -eq 0 ]; then
    echo "docker build -> success"
else
    echo "docker build -> fail"
    exit 1
fi

docker save -o $name-$new_version.tar $name:$new_version

# 替换版本号
new_content=$(echo "$content" | sed "s/\"version\": \"$version\"/\"version\": \"$new_version\"/")

# 将更新后的内容写回 metadata.json 文件
echo "$new_content" >$metadata
