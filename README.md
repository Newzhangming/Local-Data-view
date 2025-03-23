# 供需AI分析统计管理系统

## Docker
### Build
> 开发环境
- `docker rm -f cpm-admin;docker rmi -f cpm-admin;docker buildx build -t cpm-admin -f Dockerfile --no-cache --progress=plain .`
> 生成环境
- `docker buildx build -t cpm-admin:latest .`

### Run
> 生成环境
- `docker rm -f cpm-admin;docker run -p 3003:3000 --name cpm-admin cpm-admin:latest`
- `docker pull kennytian/cpm-admin:latest;docker rm -f cpm-admin;docker run -p 3003:3000 --name cpm-admin --restart=on-failure:10 -d kennytian/cpm-admin:latest;docker logs -f cpm-admin`

### Push
#### AMD64
- `docker buildx build --platform linux/amd64 --tag kennytian/cpm-admin:0.0.6 --tag kennytian/cpm-admin:latest --push .`
#### ARM64
- `docker buildx build --platform linux/arm64 --tag kennytian/cpm-admin:0.0.6 --tag kennytian/cpm-admin:latest --push .`

