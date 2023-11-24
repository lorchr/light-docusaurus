## Docker
运行容器直接添加参数 `--add-host`
```shell
docker run -it \
  --add-host="example1.domain.com:192.168.1.100" \
  --add-host="example2.domain.com:192.168.1.101" \
  --name hello-docker \
  hello-docker:1.0
```

## Docker Compose
配置 `extra_hosts`
```shell
version: '3'

services:
  hello-docker:
    restart: always
    image: hello-docker:1.0
    extra_hosts:
      - 'example1.domain.com:192.168.1.100'
      - 'example2.domain.com:192.168.1.101'
    container_name: hello-docker
    network_mode: bridge
    ports:
      - "80:80"
    environment:
      - ENV=dev
```

## Kubernates
在创建pod的yaml中指定`hostAliases`添加IP域名映射
```shell
apiVersion: apps/v1
kind: Deployment
metadata:
  namespace: dev
  name: hello-docker-deployment
  labels:
    app: hello-docker
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hello-docker
  template:
    metadata:
      labels:
        app: hello-docker
    spec:
      hostAliases:
        - hostnames:
          - example1.domain.com
          ip: 192.168.1.100
        - hostnames:
          - example2.domain.com
          ip: 192.168.1.101
      imagePullSecrets:
        - name: default-secret
      containers:
        - name: hello-docker
          image: hello-docker:1.0
          imagePullpolicy: Always
          ports:
            - containerPort: 80
          env:
            - name: ENV
              value: dev
```
