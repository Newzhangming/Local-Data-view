# 供需AI分析统计管理系统

## Docker
### Build
> 开发环境
- `docker rm -f sad-admin;docker rmi -f sad-admin;docker build -t sad-admin -f Dockerfile --no-cache --progress=plain .`
> 生成环境
- `docker build -t sad-admin:latest .`

### Run
> 生成环境
- `docker rm -f sad-admin;docker run -p 3003:3000 --name sad-admin sad-admin:latest`
- `docker pull kennytian/sad-admin:latest;docker rm -f sad-admin;docker run -p 3003:3000 --name sad-admin --restart=on-failure:10 -d kennytian/sad-admin:latest;docker logs -f sad-admin`

### Push
#### AMD64
- `docker buildx build --platform linux/amd64 --tag kennytian/sad-admin:0.0.6 --tag kennytian/sad-admin:latest --push .`
#### ARM64
- `docker buildx build --platform linux/arm64 --tag kennytian/sad-admin:0.0.6 --tag kennytian/sad-admin:latest --push .`

