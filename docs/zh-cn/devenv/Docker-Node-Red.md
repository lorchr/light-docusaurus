- [NodeRed Offical](https://nodered.org/docs)
- [NodeRed Offical Docker](https://nodered.org/docs/getting-started/docker)
- [NodeRed Docker](https://hub.docker.com/r/nodered/node-red)

## Docker安装
```shell
# 创建Network
docker network create dev

# 创建数据卷
docker volume create nodered_data;

# 获取默认配置文件

# 运行容器
docker run -d \
  --publish 1880:1880 \
  --volume //d/docker/nodered/data:/data \
  --net dev \
  --restart=on-failure:3 \
  --name nodered \
  nodered/node-red:3.0

# 进入交互式命令行
docker exec -it -u root nodered /bin/bash
```

## 向MQTT上传数据

1. `节点管理` - `安装` - 搜索`node-red-contrib-modbus`并安装
2. 访问 [Node Red 控制台](http://localhost:1880)
3. 在流程中添加 `mqtt out` 模块
4. 配置 `mqtt out` 

## 部署MQTT Broker接收数据
1. `节点管理` - `安装` - 搜索`node-red-contrib-aedes`并安装
2. 在`网络`中将 `aedes-broker` 拖拽到工作区并进行配置
   1. Connection 
      1. name: mqtt-broker
      2. port: 1883
      3. ws bind : port
   2. Security
      1. username: 
      2. password: 
3. 在`网络`中将 `mqtt in` 拖拽到工作区并进行配置
   1. Broker: broker.emqx.io:1883
   2. Topic： test/data
   3. Qos: 1 
4. 在`mqtt in` 后面加入 `debug`
   1. [x] 调试窗口
   2. [ ] 控制台
   3. [x] 节点状态 自动的
5. 使用 [MQTTX](https://mqttx.app/zh/) 
   1. 连接Broker: broker.emqx.io:1883
   2. 发送Topic: test/data,  msg: {"msg": "Hello World"}
6. 发送完成后将在 NodeRed的流程界面看到输出参数，在debug界面也会有对应的输出
