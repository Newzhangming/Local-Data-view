#!/bin/bash
file="package.json"
version=$(grep '"version":' $file | sed 's/.*"version": "\(.*\)",/\1/')
name=$(grep '"name":' $file | sed 's/.*"name": "\(.*\)",/\1/')

IFS='.' read -r -a version_parts <<< "$version"
last_part=$((version_parts[2] + 1))
new_version="${version_parts[0]}.${version_parts[1]}.$last_part"

#sed -i '' "s/\"version\": \"$version\"/\"version\": \"$new_version\"/" package.json
sed "s/\"version\": \"$version\"/\"version\": \"$new_version\"/" $file > temp.json && mv temp.json $file

ENV_TYPES=("dev" "test" "uat")

is_env_type() {
    [[ " ${ENV_TYPES[@]} " =~ " $1 " ]]
}

if is_env_type "$1"; then
    mv .env .env.bak && mv .env.$1 .env
    version=$1
    docker buildx build --platform linux/amd64 --tag kennytian/$name:$new_version --push .
    mv .env .env.$1 && mv .env.bak .env
else
    docker buildx build --platform linux/amd64 --tag kennytian/$name:$new_version --tag kennytian/$name:latest --push .
fi
