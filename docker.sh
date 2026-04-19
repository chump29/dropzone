#!/usr/bin/env -S bash -e

_yellow="\e[4;93m"
_nc="\e[0m"
_build=📦

echo -e "\n${_build} ${_yellow}Building${_nc}:\n"
./Dockerfile
