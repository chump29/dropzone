#!/usr/bin/env -S bash -e

_yellow="\e[4;93m"
_nc="\e[0m"
_build=📦
_start="▶️ "

echo -e "\n${_build} ${_yellow}Building${_nc}:\n"
./Dockerfile

echo -e "\n${_start} ${_yellow}Starting${_nc}:\n"
docker container rm --force dropzonebot > /dev/null 2>&1
docker container run --rm --name dropzonebot --publish 8001:8001 --env TZ=America/Chicago --detach dropzonebot
