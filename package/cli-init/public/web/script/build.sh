#!/bin/bash

npm install -g yarn@1.22.19

echo -e "[SH]: 安装依赖\n"
yarn

echo -e "[SH]: 开始执行构建...\n"
npm run build

rm -r output
mkdir -p output

echo -e "[SH]: 复制 nginx.conf 文件至 output 下\n"
cp nginx.conf output/

echo -e "[SH]: 复制 dist 目录内的文件至 output 下\n"
cp -r dist output/

echo "done"
exit 0
