[Vector Offical](https://vector.dev/)
[Vector Offical](https://vector.dev/docs/setup/installation/platforms/docker/)
[Vector Github](https://github.com/vectordotdev/vector)

## Docker安装
1. 准备数据脚本

```shell
cat <<-EOF > $PWD/vector.toml
[api]
enabled = true
address = "0.0.0.0:8686"

[sources.demo_logs]
type = "demo_logs"
interval = 1.0
format = "json"

[sinks.console]
inputs = ["demo_logs"]
target = "stdout"
type = "console"
encoding.codec = "json"
EOF
```

2. 运行镜像

```shell
# Start
docker run \
  -d \
  -v $PWD/vector.toml:/etc/vector/vector.toml:ro \
  -p 8686:8686 \
  timberio/vector:0.31.0-debian
```

3. 其他命令

```shell
# Stop
docker stop timberio/vector

# Reload
docker kill --signal=HUP timberio/vector

# Restart
docker restart -f $(docker ps -aqf "name=vector")

# Observe
# To tail the logs from your Vector image:
docker logs -f $(docker ps -aqf "name=vector")
# To access metrics from your Vector image:
vector top

# Uninstall
docker rm timberio/vector
```

## 向ES插入数据
```shell
[sources.in]
  type = "generator"
  format = "syslog"
  interval = 0.01
  count = 100000

[transforms.clone_message]
  type = "add_fields"
  inputs = ["in"]
  fields.raw = "{{ message }}"

[transforms.parser]
  # General
  type = "regex_parser"
  inputs = ["clone_message"]
  field = "message" # optional, default
  patterns = ['^<(?P<priority>\d*)>(?P<version>\d) (?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z) (?P<hostname>\w+\.\w+) (?P<application>\w+) (?P<pid>\d+) (?P<mid>ID\d+) - (?P<message>.*)$']

[transforms.coercer]
  type = "coercer"
  inputs = ["parser"]
  types.timestamp = "timestamp"
  types.version = "int"
  types.priority = "int"

[sinks.out_console]
  # General
  type = "console"
  inputs = ["coercer"]
  target = "stdout"

  # Encoding
  encoding.codec = "json"


[sinks.out_clickhouse]
  host = "http://host.docker.internal:8123"
  inputs = ["coercer"]
  table = "syslog"
  type = "clickhouse"

  encoding.only_fields = ["application", "hostname", "message", "mid", "pid", "priority", "raw", "timestamp", "version"]
  encoding.timestamp_format = "unix"

[sinks.out_es]
  # General
  type = "elasticsearch"
  inputs = ["coercer"]
  compression = "none"
  endpoint = "http://host.docker.internal:9200"
  index = "syslog-%F"

  # Encoding

  # Healthcheck
  healthcheck.enabled = true
```

这里简单介绍一下这个流水线：

- source.in 生成syslog的模拟数据，生成10w条，生成间隔和0.01秒
- transforms.clone_message 把原始消息复制一份，这样抽取的信息同时可以保留原始消息
- transforms.parser 使用正则表达式，按照syslog的定义，抽取出application，hostname，message ，mid ，pid ，- priority ，timestamp ，version 这几个字段
- transforms.coercer 数据类型转化
- sinks.out_console 把生成的数据打印到控制台，供开发调试
- sinks.out_clickhouse 把生成的数据发送到Clickhouse
- sinks.out_es 把生成的数据发送到ES