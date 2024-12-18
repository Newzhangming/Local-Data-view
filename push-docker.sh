#!/bin/bash

version=$(grep '"version":' package.json | sed 's/.*"version": "\(.*\)",/\1/')
name=$(grep '"name":' package.json | sed 's/.*"name": "\(.*\)",/\1/')

ENV_TYPES=("dev" "test" "uat")

is_env_type() {
    [[ " ${ENV_TYPES[@]} " =~ " $1 " ]]
}

if is_env_type "$1"; then
    mv .env .env.bak && mv .env.$1 .env
    version=$1
    docker buildx build --platform linux/amd64 --tag kennytian/$name:$version --push .
    mv .env .env.$1 && mv .env.bak .env
else
    docker buildx build --platform linux/amd64 --tag kennytian/$name:$version --tag kennytian/$name:latest --push .
fi
