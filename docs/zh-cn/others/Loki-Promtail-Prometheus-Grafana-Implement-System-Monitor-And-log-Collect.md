
# 介绍

这篇文章介绍了使用K8s搭建Prometheus + Grafana的服务监控系统，同时将Loki + Promtail 集成进来的实操步骤，
集合了[Prometheus服务监控](./4-LPG-Log-Collect.md) 和 [LPG日志收集方案](./5-Prometheus-Grafana-System-Monitor.md) 两篇文章内容，对于细节请参考原文章。

# 前置要求
1. 安装Docker
2. 安装Kubernetes
3. 安装JDK

# 准备工作
```shell
# Spring Boot服务打包基础镜像
docker pull azul/zulu-openjdk-centos:17-jre-latest

# Loki + Promtail + Grafana
docker pull grafana/loki:3.5.1
docker pull grafana/promtail:3.5.1
docker pull grafana/grafana:12.0.1

# Prometheus Operator
docker pull quay.io/prometheus/prometheus:v3.4.1
docker pull quay.io/prometheus/alertmanager:v0.28.1
docker pull quay.io/prometheus/node-exporter:v1.9.1
docker pull quay.io/prometheus-operator/admission-webhook:v0.82.2
docker pull quay.io/prometheus-operator/prometheus-operator:v0.82.2
docker pull quay.io/prometheus-operator/prometheus-config-reloader:v0.82.2
docker pull quay.io/thanos/thanos:v0.38.0
docker pull registry.k8s.io/ingress-nginx/kube-webhook-certgen:v1.5.3
docker pull registry.k8s.io/kube-state-metrics/kube-state-metrics:v2.15.0

# registry.k8s.io 拉取失败，使用代理拉取，拉取成功后重新打tag即可
docker pull k8s.mirror.nju.edu.cn/ingress-nginx/kube-webhook-certgen:v1.5.3
docker tag  k8s.mirror.nju.edu.cn/ingress-nginx/kube-webhook-certgen:v1.5.3 registry.k8s.io/ingress-nginx/kube-webhook-certgen:v1.5.3
docker pull k8s.mirror.nju.edu.cn/kube-state-metrics/kube-state-metrics:v2.15.0
docker tag  k8s.mirror.nju.edu.cn/kube-state-metrics/kube-state-metrics:v2.15.0 registry.k8s.io/kube-state-metrics/kube-state-metrics:v2.15.0

# Prometheus Operator 的 Helm Chart 
wget https://github.com/prometheus-community/helm-charts/releases/download/kube-prometheus-stack-73.2.0/kube-prometheus-stack-73.2.0.tgz

# Promtail 安装包、配置文件
wget https://github.com/grafana/loki/releases/download/v3.5.1/promtail-linux-amd64.zip
wget https://raw.githubusercontent.com/grafana/loki/v3.5.1/clients/cmd/promtail/promtail-local-config.yaml

# Prometheus node-exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.9.1/node_exporter-1.9.1.linux-amd64.tar.gz

```

# K8s 部署 Prometheus + Grafana

这里使用Helm Chart部署 Prometheus Operator，其中包含了Grafana的部署

## Helm 部署 Prometheus Operator

```shell
# 添加chart仓库
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

# 更新chart仓库
helm repo update

# 下载chart安装包
helm pull prometheus-community/kube-prometheus-stack --version 73.2.0

# 解压
tar -zxvf kube-prometheus-stack-73.2.0.tgz -C ~/
cd ~/kube-prometheus-stack

# 查看默认的配置文件
vim values.yaml

# 部署
helm install prometheus . --create-namespace --namespace monitoring

# 修改 Prometheus Grafana 服务为 NodePort，否则外部无法访问
kubectl patch svc prometheus-kube-prometheus-prometheus -n monitoring -p '{"spec": {"type": "NodePort"}}'
kubectl patch svc prometheus-grafana -n monitoring -p '{"spec": {"type": "NodePort"}}'

# 获取Grafana的默认账号密码 admin / prom-operator
kubectl --namespace monitoring get secrets prometheus-grafana -o jsonpath="{.data.admin-user}" | base64 -d ; echo
kubectl --namespace monitoring get secrets prometheus-grafana -o jsonpath="{.data.admin-password}" | base64 -d ; echo

```

## 部署完成后获取服务的状态及端口

```shell
# 查看 pod
kubectl get pods -n monitoring -o wide

# 输出结果
[diginn@k8s-master-01 ~]$ kubectl get pods -n monitoring -o wide
NAME                                                     READY   STATUS        RESTARTS      AGE   IP                NODE            NOMINATED NODE   READINESS GATES
alertmanager-prometheus-kube-prometheus-alertmanager-0   2/2     Running       2 (19m ago)   51m   10.244.151.185    k8s-master-01   <none>           <none>
prometheus-grafana-76cd8bb66b-4ttx5                      3/3     Running       0             51m   10.244.95.28      k8s-master-02   <none>           <none>
prometheus-kube-prometheus-operator-5cfd684899-rd877     1/1     Running       1 (19m ago)   51m   10.244.151.184    k8s-master-01   <none>           <none>
prometheus-kube-state-metrics-74b7dc4795-tmgdj           1/1     Running       0             51m   10.244.44.194     k8s-node-02     <none>           <none>
prometheus-prometheus-kube-prometheus-prometheus-0       2/2     Running       2 (19m ago)   51m   10.244.151.182    k8s-master-01   <none>           <none>
prometheus-prometheus-node-exporter-26xmn                0/1     Pending       0             51m   <none>            k8s-master-03   <none>           <none>
prometheus-prometheus-node-exporter-2crj7                1/1     Running       1 (19m ago)   51m   192.168.137.121   k8s-master-01   <none>           <none>
prometheus-prometheus-node-exporter-bktcd                1/1     Running       0             51m   192.168.137.122   k8s-master-02   <none>           <none>
prometheus-prometheus-node-exporter-h6bh6                0/1     Pending       0             51m   <none>            k8s-node-01     <none>           <none>
prometheus-prometheus-node-exporter-jqvkv                0/1     Pending       0             51m   <none>            k8s-node-03     <none>           <none>
prometheus-prometheus-node-exporter-vdtzd                1/1     Running       0             51m   192.168.137.132   k8s-node-02     <none>           <none>


# 查看服务端口信息
kubectl get svc -n monitoring -o wide

# 输出结果
[diginn@k8s-master-01 ~]$ kubectl get svc -n monitoring -o wide
NAME                                      TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)                         AGE   SELECTOR
alertmanager-operated                     ClusterIP   None             <none>        9093/TCP,9094/TCP,9094/UDP      52m   app.kubernetes.io/name=alertmanager
prometheus-grafana                        NodePort    10.111.36.16     <none>        80:30182/TCP                    52m   app.kubernetes.io/instance=prometheus,app.kubernetes.io/name=grafana
prometheus-kube-prometheus-alertmanager   ClusterIP   10.101.24.100    <none>        9093/TCP,8080/TCP               52m   alertmanager=prometheus-kube-prometheus-alertmanager,app.kubernetes.io/name=alertmanager
prometheus-kube-prometheus-operator       ClusterIP   10.110.144.229   <none>        443/TCP                         52m   app=kube-prometheus-stack-operator,release=prometheus
prometheus-kube-prometheus-prometheus     NodePort    10.100.104.204   <none>        9090:31694/TCP,8080:31199/TCP   52m   app.kubernetes.io/name=prometheus,operator.prometheus.io/name=prometheus-kube-prometheus-prometheus
prometheus-kube-state-metrics             ClusterIP   10.103.22.102    <none>        8080/TCP                        52m   app.kubernetes.io/instance=prometheus,app.kubernetes.io/name=kube-state-metrics
prometheus-operated                       ClusterIP   None             <none>        9090/TCP                        52m   app.kubernetes.io/name=prometheus
prometheus-prometheus-node-exporter       ClusterIP   10.100.244.250   <none>        9100/TCP                        52m   app.kubernetes.io/instance=prometheus,app.kubernetes.io/name=prometheus-node-exporter

```

## 浏览器访问服务的Web页面

**注：** 服务的端口见上方 `kubectl get svc -n monitoring -o wide` 输出的 `PORT(S)`

- Prometheus 主界面 `http://192.168.137.121:31694`

| URL                | 介绍           | 备注                                                                                   |
| ------------------ | -------------- | -------------------------------------------------------------------------------------- |
| /                  | 主界面         |                                                                                        |
| /metrics           | 自身指标       | 采集到的指标信息                                                                       |
| /config            | 配置页面       | 运行时的配置，如果发现目标服务的指标在Grafan搜索不到，需要比对这里的配置及Relabel Rule |
| /service-discovery | 服务发现       | 记录了所有服务的原始标签及经规则过滤后的标签信息，配合 /config 页面的配置比对          |
| /targets           | 采集对象的状态 | 采集对象的状态信息，可以简单排除服务问题                                               |

- Grafana 主界面 `http://192.168.137.121:30182`

| URL                      | 介绍     | 备注                                                      |
| ------------------------ | -------- | --------------------------------------------------------- |
| /                        | 主界面   |                                                           |
| /connections/datasources | 数据源   | 连接数据源 如 Prometheus AlertManager Loki等              |
| /explore                 | 搜索页   | 在这个页面使用GrafaQL搜索查看上报的原始数据（主要是日志） |
| /dashboards              | 监控面板 | 服务状态监控大屏                                          |

# K8s 部署 Loki

由于上面部署Prometheus Operator已经包含了Grafana，这里就不需要再部署Grafana了

官方的部署方案太消耗服务器资源（Pod数10+ 且随集群节点数增加而增加），这里仅部署一个节点

## k8s 资源文件定义

Loki部署资源文件: `lpg-loki.yaml`
```yaml
# Loki 账号定义
apiVersion: v1
kind: ServiceAccount
metadata:
  name: loki
  namespace: lpg
---

# Loki 角色定义
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: loki
  namespace: lpg
rules:
- apiGroups: ["extensions"]
  resources: ["podsecuritypolicies"]
  verbs: ["use"]
  resourceNames: [loki]
---

# Loki 角色绑定定义
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: loki
  namespace: lpg
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: loki
subjects:
- kind: ServiceAccount
  name: loki
---

# Loki配置文件
apiVersion: v1
kind: ConfigMap
metadata:
  name: loki
  namespace: lpg
  labels:
    app: loki
data:
  loki.yaml: |
    auth_enabled: false

    server:
      http_listen_port: 3100

    common:
      instance_addr: 127.0.0.1
      path_prefix: /data/loki
      storage:
        filesystem:
          chunks_directory: /data/loki/chunks
          rules_directory: /data/loki/rules
      replication_factor: 1
      ring:
        kvstore:
          store: inmemory

    schema_config:
      configs:
        - from: 2020-10-24
          store: tsdb
          object_store: filesystem
          schema: v13
          index:
            prefix: index_
            period: 24h

    ruler:
      alertmanager_url: http://localhost:9093

---

# Loki 服务定义
apiVersion: v1
kind: Service
metadata:
  name: loki
  namespace: lpg
  labels:
    app: loki
spec:
  type: NodePort
  ports:
    - port: 3100
      protocol: TCP
      name: http-metrics
      targetPort: http-metrics
      nodePort: 30310
  selector:
    app: loki
---

# Loki StatefulSet定义
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: loki
  namespace: lpg
  labels:
    app: loki
spec:
  podManagementPolicy: OrderedReady
  replicas: 1
  selector:
    matchLabels:
      app: loki
  serviceName: loki
  updateStrategy:
    type: RollingUpdate
  template:
    metadata:
      labels:
        app: loki
    spec:
      serviceAccountName: loki
      initContainers:
      - name: chmod-data
        image: busybox:1.28.4
        imagePullPolicy: IfNotPresent
        command: ["chmod","-R","777","/loki/data"]
        volumeMounts:
        - name: storage
          mountPath: /loki/data
      containers:
        - name: loki
          image: grafana/loki:3.5.1
          imagePullPolicy: IfNotPresent
          args:
            - -config.file=/etc/loki/loki.yaml
          ports:
            - name: http-metrics
              containerPort: 3100
              protocol: TCP
          # 添加安全上下文 id
          securityContext:
            runAsUser: 1000
            runAsGroup: 1000
          livenessProbe:
            httpGet: 
              path: /ready
              port: http-metrics
              scheme: HTTP
            initialDelaySeconds: 45
          readinessProbe:
            httpGet: 
              path: /ready
              port: http-metrics
              scheme: HTTP
            initialDelaySeconds: 45
          volumeMounts:
            - name: config
              mountPath: /etc/loki
            - name: storage
              mountPath: /data
      terminationGracePeriodSeconds: 4800
      volumes:
        - name: config
          configMap:
            name: loki
        - name: storage
          hostPath:
            path: /home/diginn/lpg/loki

```

如有需要，修改下面的几个属性:
- `*.namespace: lpg`
- `loki.hostPath.path: /home/diginn/lpg/loki`
- `loki.ports[*].port.nodePort: 30310`

## 部署资源
```shell
# 创建命名空间
kubectl get namespace lpg
kubectl create namespace lpg

# 部署
kubectl apply -f lpg-loki.yaml

# 删除
kubectl delete -f lpg-loki.yaml

```

## 部署完成后获取服务的状态及端口

```shell
# 查看 Pod
kubectl get pods -n lpg -o wide

# 输出结果
[diginn@k8s-master-01 ~]$ kubectl get pods -n lpg -o wide
NAME     READY   STATUS    RESTARTS      AGE    IP              NODE          NOMINATED NODE   READINESS GATES
loki-0   1/1     Running   1 (99m ago)   112m   10.244.44.249   k8s-node-02   <none>           <none>


# 查看服务端口信息
kubectl get services -n lpg -o wide 

# 输出结果
[diginn@k8s-master-01 ~]$ kubectl get services -n lpg -o wide
NAME      TYPE       CLUSTER-IP       EXTERNAL-IP   PORT(S)          AGE    SELECTOR
loki      NodePort   10.96.77.123     <none>        3100:30310/TCP   113m   app=loki

```

## 浏览器访问服务的Web页面

**注：** 服务的端口见上方 `kubectl get services -n lpg -o wide` 输出的 `PORT(S)`

- Loki 指标页面 `http://192.168.137.121:30310/metrics`

# K8s 部署 Promtail

Promtail将被部署为Kubernetes DaemonSet，集群的每个节点上都会运行一个Promtail Pod，来收集当前节点上的日志信息

## k8s 资源文件定义

Promtail DaemonSet配置文件 `promtail-daemonset.yaml`

```yaml
--- # DaemonSet.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: promtail-daemonset
spec:
  selector:
    matchLabels:
      name: promtail
  template:
    metadata:
      labels:
        name: promtail
    spec:
      serviceAccount: promtail-serviceaccount
      containers:
      - name: promtail-container
        image: grafana/promtail
        args:
        - -config.file=/etc/promtail/promtail.yaml
        env: 
        - name: 'HOSTNAME' # needed when using kubernetes_sd_configs
          valueFrom:
            fieldRef:
              fieldPath: 'spec.nodeName'
        volumeMounts:
        - name: logs
          mountPath: /var/log
        - name: promtail-config
          mountPath: /etc/promtail
        - mountPath: /var/lib/docker/containers
          name: varlibdockercontainers
          readOnly: true
      volumes:
      - name: logs
        hostPath:
          path: /var/log
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
      - name: promtail-config
        configMap:
          name: promtail-config
--- # configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: promtail-config
data:
  promtail.yaml: |
    server:
      http_listen_port: 9080
      grpc_listen_port: 0

    clients:
    # - url: http://192.168.137.121:3100/loki/api/v1/push  # 注意这里的协议为 HTTP，IP 端口为Loki映射的物理机IP 端口
    - url: http://loki.lpg:3100/loki/api/v1/push  # 如果是在同一个K8s中，可以使用 <服务名.命名空间> 例如: loki.lpg

    positions:
      filename: /tmp/positions.yaml
    target_config:
      sync_period: 10s
    scrape_configs:
    - job_name: pod-logs
      kubernetes_sd_configs:
        - role: pod
      pipeline_stages:
        - docker: {}
      relabel_configs:
        # 检查是否有标注为promtail.io/scrape=true的注解，没有注解的pod不采集
        - source_labels: [__meta_kubernetes_pod_annotation_promtail_io_scrape]
          action: keep
          regex: true
        - source_labels:
            - __meta_kubernetes_pod_node_name
          target_label: __host__
        - action: labelmap
          regex: __meta_kubernetes_pod_label_(.+)
        - action: replace
          replacement: $1
          separator: /
          source_labels:
            - __meta_kubernetes_namespace
            - __meta_kubernetes_pod_name
          target_label: job
        - action: replace
          source_labels:
            - __meta_kubernetes_namespace
          target_label: namespace
        - action: replace
          source_labels:
            - __meta_kubernetes_pod_name
          target_label: pod
        - action: replace
          source_labels:
            - __meta_kubernetes_pod_container_name
          target_label: container
        - replacement: /var/log/pods/*$1/$2/*.log # $1=pod_uid, $2=container_name
          separator: /
          source_labels:
            - __meta_kubernetes_pod_uid
            - __meta_kubernetes_pod_container_name
          target_label: __path__

--- # Clusterrole.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: promtail-clusterrole
rules:
  - apiGroups: [""]
    resources:
    - nodes
    - services
    - pods
    verbs:
    - get
    - watch
    - list

--- # ServiceAccount.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: promtail-serviceaccount

--- # Rolebinding.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: promtail-clusterrolebinding
subjects:
    - kind: ServiceAccount
      name: promtail-serviceaccount
      namespace: default
roleRef:
    kind: ClusterRole
    name: promtail-clusterrole
    apiGroup: rbac.authorization.k8s.io

```

重点关注 `ConfigMap` 部分的 `clients.url`，这里定义了日志发送目标Loki的地址，这里推荐采用第二种写法 即： `<服务名.命名空间>` 如 `loki.lpg` 

## 部署资源

```shell
# 部署
kubectl apply -f promtail-daemonset.yaml

# 删除
kubectl delete -f promtail-daemonset.yaml

```

## 部署完成后获取服务的状态及端口
```shell
# 查询出 Pod 以及它们部署到的节点
kubectl get pods -l name=promtail -o wide

# 输出结果
[diginn@k8s-master-01 ~]$ kubectl get pods -l name=promtail -o wide
NAME                       READY   STATUS        RESTARTS      AGE     IP               NODE            NOMINATED NODE   READINESS GATES
promtail-daemonset-52cbx   0/1     Terminating   0             46h     <none>           k8s-node-01     <none>           <none>
promtail-daemonset-8rrkv   0/1     Terminating   2             6d23h   <none>           k8s-master-03   <none>           <none>
promtail-daemonset-bcl54   1/1     Running       1 (57m ago)   66m     10.244.151.186   k8s-master-01   <none>           <none>
promtail-daemonset-bht72   1/1     Running       1 (20m ago)   66m     10.244.95.33     k8s-master-02   <none>           <none>
promtail-daemonset-fgkg6   0/1     Terminating   0             46h     <none>           k8s-node-03     <none>           <none>
promtail-daemonset-ml97l   1/1     Running       1 (54m ago)   66m     10.244.44.206    k8s-node-02     <none>           <none>

# 查询DaemonSet 的信息
kubectl get daemonset

# 输出结果
[diginn@k8s-master-01 ~]$ kubectl get daemonset
NAME                 DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE   NODE SELECTOR   AGE
promtail-daemonset   3         3         3       3            3           <none>          66m

```

## 浏览器访问服务的Web页面
**注** 这里K8s运行并没有暴露端口出来，外部无法访问到这些页面，后面使用二进制部署收集本地日志时可以打开

- Promtail 主界面 `http://192.168.137.132:9080`

| URL                | 介绍       | 备注                                    |
| ------------------ | ---------- | --------------------------------------- |
| /                  | 主界面     | 主界面默认跳转到 /targets               |
| /service-discovery | 服务发现页 | 记录收集日志的job名称及标签信息         |
| /config            | 配置页     | Promtail的配置信息                      |
| /targets           | 收集目标   | 日志文件所属的job，标签，路径，读取位置等信息 |

# K8s 部署 Spring Boot

## 服务改造
添加Prometheus依赖 `pom.xml`

```xml
<!-- 开启 Spring Boot Actuator -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<!-- 将 Actuator 指标转换为 Prometheus 格式 -->
<dependency>
  <groupId>io.micrometer</groupId>
  <artifactId>micrometer-registry-prometheus</artifactId>
  <version>${micrometer.version}</version>
</dependency>
```

开放Actuator端点 `application.yaml`

```yaml
# 开放 Actuator 管理端点
management:
  endpoints:
    web:
      exposure:
        include: "*"
    health:
      show-details: always
  metrics:
    export:
      prometheus:
        enable: true
    tags:
      application: ${spring.application.name}

```


日志配置修改（可选配置，将日志输出为json格式）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!--日志级别以及优先级排序: OFF > FATAL > ERROR > WARN > INFO > DEBUG > TRACE > ALL -->
<!--status用于设置log4j2自身内部的信息输出,可以不设置,当设置成trace时,你会看到log4j2内部各种详细输出-->
<!--monitorInterval：Log4j能够自动检测修改配置 文件和重新配置本身,设置间隔秒数-->
<configuration status="WARN" monitorInterval="60">
    <Properties>
        <Property name="log.timeZone">Asia/Shanghai</Property>
        <!-- 公共配置 -->
        <!-- 日志默认存放的位置,可以设置为项目根路径下,也可指定绝对路径 -->
        <!-- 存放路径一:通用路径,window平台 -->
        <property name="basePath">../logs</property>
        <!-- 存放路径二:web工程专用,java项目没有这个变量,需要删掉,否则会报异常,这里把日志放在web项目的根目录下 -->
        <!-- <property name="basePath">${web:rootDir}/${logFileName}</property> -->
        <!-- 存放路径三:web工程专用,java项目没有这个变量,需要删掉,否则会报异常,这里把日志放在tocmat的logs目录下 -->
        <!--<property name="basePath">${sys:catalina.home}/logs/${logFileName}</property>-->

        <!-- 控制台默认输出格式,"%-5level":日志级别,"%l":输出完整的错误位置,是小写的L,因为有行号显示,所以影响日志输出的性能 -->
        <!--<property name="console_log_pattern">%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] [%-5level] %l - %m%n</property>-->
        <property name="console_log_pattern">%d{yyyy-MM-dd HH:mm:ss.SSS} %highlight{%-5level}{ERROR=Bright RED, WARN=Bright Yellow, INFO=Bright Green, DEBUG=Bright Cyan, TRACE=Bright White} %style{[%t]}{bright,magenta} %style{%c{1.}.%M(%L)}{cyan}: %msg%n</property>
        <!-- 日志文件默认输出格式,不带行号输出(行号显示会影响日志输出性能);%C:大写,类名;%M:方法名;%m:错误信息;%n:换行 -->
        <!-- <property name="log_pattern">%d{yyyy-MM-dd HH:mm:ss.SSS} [%-5level] %C.%M - %m%n</property> -->
        <!-- 日志文件默认输出格式,另类带行号输出(对日志输出性能未知);%C:大写,类名;%M:方法名;%L:行号;%m:错误信息;%n:换行 -->
        <property name="log_pattern">%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] [%-5level] %C.%M[%L line] - %m%n</property>

        <!-- 日志默认切割的最小单位 -->
        <property name="every_file_size">50MB</property>
        <!-- 日志默认输出级别 -->
        <property name="output_log_level">DEBUG</property>

        <!-- 所有级别日志配置 -->
        <!-- 日志默认存放路径(所有级别日志) -->
        <property name="rolling_fileName">${basePath}/${spring:spring.application.name}-all.log</property>
        <!-- 日志默认压缩路径,将超过指定文件大小的日志,自动存入按"年月"建立的文件夹下面并进行压缩,作为存档 -->
        <property name="rolling_filePattern">${basePath}/%d{yyyy-MM}/${spring:spring.application.name}-all-%d{yyyy-MM-dd-HH}-%i.log.zip</property>
        <property name="rolling_fileName_json">${basePath}/${spring:spring.application.name}-all-json.log</property>
        <property name="rolling_filePattern_json">${basePath}/%d{yyyy-MM}/${spring:spring.application.name}-all-json-%d{yyyy-MM-dd-HH}-%i.log.zip</property>
        <!-- 日志默认同类型日志,同一文件夹下可以存放的数量,不设置此属性则默认为7个,filePattern最后要带%i才会生效 -->
        <property name="rolling_max">14</property>
        <!-- 日志默认同类型日志,多久生成一个新的日志文件,这个配置需要和filePattern结合使用;
                如果设置为1,filePattern是%d{yyyy-MM-dd}到天的格式,则间隔一天生成一个文件
                如果设置为12,filePattern是%d{yyyy-MM-dd-HH}到小时的格式,则间隔12小时生成一个文件 -->
        <property name="rolling_timeInterval">24</property>
        <!-- 日志默认同类型日志,是否对封存时间进行调制,若为true,则封存时间将以0点为边界进行调整,
                如:现在是早上3am,interval是4,那么第一次滚动是在4am,接着是8am,12am...而不是7am -->
        <property name="rolling_timeModulate">true</property>

        <!-- Info级别日志 -->
        <property name="info_fileName">${basePath}/${spring:spring.application.name}-info.log</property>
        <property name="info_filePattern">${basePath}/%d{yyyy-MM}/${spring:spring.application.name}-info-%d{yyyy-MM-dd}-%i.log.zip</property>
        <property name="info_max">14</property>
        <property name="info_timeInterval">1</property>
        <property name="info_timeModulate">true</property>

        <!-- Warn级别日志 -->
        <property name="warn_fileName">${basePath}/${spring:spring.application.name}-warn.log</property>
        <property name="warn_filePattern">${basePath}/%d{yyyy-MM}/${spring:spring.application.name}-warn-%d{yyyy-MM-dd}-%i.log.zip</property>
        <property name="warn_max">14</property>
        <property name="warn_timeInterval">1</property>
        <property name="warn_timeModulate">true</property>

        <!-- Error级别日志 -->
        <property name="error_fileName">${basePath}/${spring:spring.application.name}-error.log</property>
        <property name="error_filePattern">${basePath}/%d{yyyy-MM}/${spring:spring.application.name}-error-%d{yyyy-MM-dd}-%i.log.zip</property>
        <property name="error_max">14</property>
        <property name="error_timeInterval">1</property>
        <property name="error_timeModulate">true</property>

        <!-- druid sql日志配置 -->
        <property name="sql_fileName">${basePath}/${spring:spring.application.name}-sql.log</property>
        <property name="sql_filePattern">${basePath}/%d{yyyy-MM}/${spring:spring.application.name}-sql-%d{yyyy-MM-dd}-%i.log.zip</property>
        <property name="sql_max">7</property>
        <property name="sql_timeInterval">1</property>
        <property name="sql_timeModulate">true</property>

        <!-- message statistic日志配置 -->
        <property name="msg_statistic_fileName">${basePath}/${spring:spring.application.name}-msg.log</property>
        <property name="msg_filePattern">${basePath}/%d{yyyy-MM}/${spring:spring.application.name}-msg-%d{yyyy-MM-dd}-%i.log.zip</property>
        <property name="msg_max">7</property>
        <property name="msg_timeInterval">1</property>
        <property name="msg_timeModulate">true</property>

        <!-- 控制台显示控制,控制台显示的日志最低级别，生产环境不用打印sql语句 -->
        <property name="console_print_level_prod">DEBUG</property>
        <!-- 控制台显示控制,控制台显示的日志最低级别，开发环境使用可以打印sql语句 -->
        <property name="console_print_level_dev">TRACE</property>
    </Properties>

    <!--定义appender -->
    <appenders>
        <!-- 用来定义输出到控制台的配置 -->
        <Console name="console" target="SYSTEM_OUT">
            <Filters>
                <!-- 设置控制台只输出level及以上级别的信息(onMatch),其他的直接拒绝(onMismatch)-->
                <ThresholdFilter level="${console_print_level_prod}" onMatch="NEUTRAL" onMismatch="DENY"/>
                <Log4jWebFrontFilter/>
            </Filters>
            <!-- 设置输出格式,不设置默认为:%m%n -->
            <PatternLayout pattern="${console_log_pattern}" disableAnsi="false" noConsoleNoAnsi="false"/>
        </Console>

        <!-- 输出root中指定的level级别以上的所有日志到文件 -->
        <RollingFile name="allLogFile" fileName="${rolling_fileName}" filePattern="${rolling_filePattern}">
            <PatternLayout pattern="${log_pattern}"/>
            <Policies>
                <TimeBasedTriggeringPolicy interval="${rolling_timeInterval}" modulate="${warn_timeModulate}"/>
                <SizeBasedTriggeringPolicy size="${every_file_size}"/>
            </Policies>
            <!-- 设置同类型日志,同一文件夹下可以存放的数量 -->
            <DefaultRolloverStrategy max="${rolling_max}"/>
        </RollingFile>

        <RollingFile name="allLogFile_json" fileName="${rolling_fileName_json}" filePattern="${rolling_filePattern_json}">
            <!--
             locationInfo - 如果为“true”，则在生成的 JSON 中包含位置信息。
             complete - 如果为“true”，则包括 JSON 页眉和页脚，以及记录之间的逗号。
             compact - 如果为“true”，则不使用行尾和缩进，默认为“false”。
             eventEol - 如果为“true”，则在每个日志事件后强制执行 EOL（即使compact为“true”），默认为“false”。即使在紧凑模式下，这也允许一行甚至每一行。
             -->
            <JsonLayout compact="true" locationInfo="true" complete="false" eventEol="true" properties="true">
                <!--
                    日志配置文件中定义的属性，直接使用 ${propertyName} 读取
                    ThreadContext.put("requestId", generate()); 属性使用 $${ctx:propertyName}
                -->
                <KeyValuePair key="timestamp" value="${date:yyyy-MM-dd' 'HH:mm:ss.SSS}" />
                <KeyValuePair key="requestId" value="$${ctx:requestId}" />

                <!-- docker id  docker部署使用-->
                <!--
                <KeyValuePair key="containerId" value="${docker:containerId}"/>
                <KeyValuePair key="containerName" value="${docker:containerName}"/>
                <KeyValuePair key="imageName" value="${docker:imageName}"/>
                -->
            </JsonLayout>
            <Policies>
                <TimeBasedTriggeringPolicy interval="${rolling_timeInterval}" modulate="${warn_timeModulate}"/>
                <SizeBasedTriggeringPolicy size="${every_file_size}"/>
            </Policies>
            <!-- 设置同类型日志,同一文件夹下可以存放的数量 -->
            <DefaultRolloverStrategy max="${rolling_max}"/>
        </RollingFile>

        <!-- 输出INFO级别的日志到文件 -->
        <RollingFile name="infoLogFile" fileName="${info_fileName}" filePattern="${info_filePattern}">
            <PatternLayout pattern="${log_pattern}"/>
            <Policies>
                <TimeBasedTriggeringPolicy interval="${info_timeInterval}" modulate="${info_timeModulate}"/>
                <SizeBasedTriggeringPolicy size="${every_file_size}"/>
            </Policies>
            <DefaultRolloverStrategy max="${info_max}"/>
            <Filters>
                <!--只输出info级别的日志-->
                <ThresholdFilter level="WARN" onMatch="DENY" onMismatch="NEUTRAL"/>
                <ThresholdFilter level="INFO" onMatch="ACCEPT" onMismatch="DENY"/>
            </Filters>
        </RollingFile>

        <!-- 输出WARN级别的日志到文件 -->
        <RollingFile name="warnLogFile" fileName="${warn_fileName}" filePattern="${warn_filePattern}">
            <PatternLayout pattern="${log_pattern}"/>
            <Policies>
                <TimeBasedTriggeringPolicy interval="${warn_timeInterval}" modulate="${warn_timeModulate}"/>
                <SizeBasedTriggeringPolicy size="${every_file_size}"/>
            </Policies>
            <DefaultRolloverStrategy max="${warn_max}"/>
            <Filters>
                <!--只输出warn级别的日志-->
                <ThresholdFilter level="ERROR" onMatch="DENY" onMismatch="NEUTRAL"/>
                <ThresholdFilter level="WARN" onMatch="ACCEPT" onMismatch="DENY"/>
            </Filters>
        </RollingFile>

        <!-- 输出ERROR级别的日志到文件 -->
        <RollingFile name="errorLogFile" fileName="${error_fileName}" filePattern="${error_filePattern}">
            <PatternLayout pattern="${log_pattern}"/>
            <Policies>
                <TimeBasedTriggeringPolicy interval="${error_timeInterval}" modulate="${error_timeModulate}"/>
                <SizeBasedTriggeringPolicy size="${every_file_size}"/>
            </Policies>
            <DefaultRolloverStrategy max="${error_max}"/>
            <Filters>
                <!--只输出error级别的日志-->
                <ThresholdFilter level="ERROR" onMatch="ACCEPT" onMismatch="DENY"/>
            </Filters>
        </RollingFile>

        <!--记录druid的sql语句-->
        <RollingFile name="druidSqlLogFile" fileName="${sql_fileName}"
                     filePattern="${sql_filePattern}">
            <PatternLayout pattern="${log_pattern}"/>
            <Policies>
                <TimeBasedTriggeringPolicy interval="${sql_timeInterval}" modulate="${sql_timeModulate}"/>
                <SizeBasedTriggeringPolicy size="${every_file_size}"/>
            </Policies>
            <DefaultRolloverStrategy max="${sql_max}"/>
        </RollingFile>

        <!--统计message消费的全部消息-->
        <RollingFile name="msgStatisticLogfile" fileName="${msg_statistic_fileName}"
                     filePattern="${msg_filePattern}">
            <PatternLayout pattern="${log_pattern}"/>
            <Policies>
                <TimeBasedTriggeringPolicy interval="${msg_timeInterval}" modulate="${msg_timeModulate}"/>
                <SizeBasedTriggeringPolicy size="${every_file_size}"/>
            </Policies>
            <DefaultRolloverStrategy max="${msg_max}"/>
        </RollingFile>

        <!-- 配置重写日志 -->
        <Rewrite name="console_rewrite">
            <DataMaskingRewritePolicy/>
            <AppenderRef ref="console"/>
        </Rewrite>

        <Rewrite name="allLogFile_rewrite">
            <DataMaskingRewritePolicy/>
            <AppenderRef ref="allLogFile"/>
        </Rewrite>

        <Rewrite name="allLogFile_rewrite_json">
            <DataMaskingRewritePolicy/>
            <AppenderRef ref="allLogFile_json"/>
        </Rewrite>

        <Rewrite name="infoLogFile_rewrite">
            <DataMaskingRewritePolicy/>
            <AppenderRef ref="infoLogFile"/>
        </Rewrite>

        <Rewrite name="warnLogFile_rewrite">
            <DataMaskingRewritePolicy/>
            <AppenderRef ref="warnLogFile"/>
        </Rewrite>

        <Rewrite name="errorLogFile_rewrite">
            <DataMaskingRewritePolicy/>
            <AppenderRef ref="errorLogFile"/>
        </Rewrite>
    </appenders>

    <!--定义logger,只有定义了logger并引入了appender,appender才会生效-->
    <loggers>
        <!--记录druid-sql的记录-->
        <Logger name="druid.sql.Statement" level="DEBUG" additivity="false">
            <appender-ref ref="druidSqlLogFile"/>
        </Logger>

        <!--记录message消费日志的记录-->
        <Logger name="msg.statistic.Log" level="DEBUG" additivity="false">
            <appender-ref ref="msgStatisticLogfile"/>
        </Logger>

        <!-- sql语句输出配置 -->
        <logger name="org.hibernate.type.descriptor.sql.BasicBinder" level="TRACE"/>
        <logger name="org.hibernate.type.descriptor.sql.BasicExtractor" level="DEBUG"/>
        <logger name="org.hibernate.SQL" level="DEBUG"/>
        <logger name="org.hibernate.type" level="TRACE"/>
        <logger name="org.hibernate.engine.QueryParameters" level="DEBUG"/>
        <logger name="org.hibernate.engine.query.HQLQueryPlan" level="DEBUG"/>
        <logger name="org.camunda" level="DEBUG"/>
        <logger name="com.pisx.pd.datasource.lib.mybatis.interceptor" level="info"/>
        <logger name="com.pisx.pd" level="debug"/>
        <logger name="com.pisx.pd.dme.mybatis.MomQueryInterceptor" level="info"/>
        <!--<logger name="com.pisx" level="DEBUG" additivity="false">-->
        <!--    <appender-ref ref="console_rewrite"/>-->
        <!--</logger>-->
        <!-- 屏蔽掉opcda日志打印 -->
        <logger name="org.jinterop" level="WARN"/>
        <!--建立一个默认的root的logger-->
        <root level="info">
            <appender-ref ref="console_rewrite"/>
            <appender-ref ref="allLogFile_rewrite"/>
            <!-- <appender-ref ref="allLogFile_rewrite_json"/> -->
            <appender-ref ref="infoLogFile_rewrite"/>
            <appender-ref ref="warnLogFile_rewrite"/>
            <appender-ref ref="errorLogFile_rewrite"/>
        </root>
    </loggers>
</configuration>

```

这里只增加了一个输出 `allLogFile_json`，将会生成一个`{spring.application.name}-all-json.log`的文件，其余部分没有做修改

## 构建镜像

服务打包`mvn clean package`及上传到K8s所在服务器步骤省略

构建Docker镜像的 `Dockerfile`

```Dockerfile
FROM 192.168.1.210:5000/azul/zulu-openjdk-centos:17-jre-latest
VOLUME /tmp
ADD pd-service-hzpublic.jar /
ENV JAVA_OPTS="-Xms1g -Xmx1g -XX:MetaspaceSize=512m -XX:MaxMetaspaceSize=512m \
           -Duser.timezone=Asia/Shanghai \
           -Dfile.encoding=UTF-8 \
           -Dsun.jnu.encoding=UTF-8 \
           -Djava.awt.headless=true \
           --add-modules java.se \
           --add-opens java.base/java.lang=ALL-UNNAMED \
           --add-opens java.base/sun.nio.ch=ALL-UNNAMED \
           --add-opens java.management/sun.management=ALL-UNNAMED \
           --add-opens jdk.management/com.sun.management.internal=ALL-UNNAMED \
           --add-exports java.base/jdk.internal.ref=ALL-UNNAMED"
ENTRYPOINT java ${JAVA_OPTS} -jar /pd-service-hzpublic.jar

```

按照下面的步骤构建镜像，镜像的tag保持一致即可，前面的仓库名称可以删除或修改

```shell
# 重新打tag
docker tag azul/zulu-openjdk-centos:17-jre-latest 192.168.1.210:5000/azul/zulu-openjdk-centos:17-jre-latest

# 构建镜像
docker build -t 192.168.1.210:5000/library/pd-service-hzpublic:prom-1.0.0 .

# 导出镜像
docker save 192.168.1.210:5000/library/pd-service-hzpublic:prom-1.0.0 -o pd-service-hzpublic_prom-1.0.0.tar

# 发送到集群其他节点
scp pd-service-hzpublic_prom-1.0.0.tar diginn@192.168.137.122:/home/diginn

# 在集群其他节点导入镜像
docker load -i pd-service-hzpublic_prom-1.0.0.tar

```

这里需要将打包后的镜像同步到集群的其他节点上，或者推送到自托管的镜像仓库，以免服务部署到其他节点时拉取镜像失败

## K8s 资源文件定义

应用部署的定义 `k8s-dev.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: svc-hz-service-hzpublic
  namespace: hz-dev-service
  labels:
    app: hz-service-hzpublic
    job: hz-service-hzpublic-job
spec:
  type: NodePort
  selector:
    app: hz-service-hzpublic
  ports:
    - name: http
      port: 31121
      targetPort: 31121
      nodePort: 31121

---
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: svc-dz-service-hzpublic
  namespace: hz-dev-service
  labels:
    app: hz-service-hzpublic
    # Prometheus收集日志的核心标识
    release: prometheus
spec:
  jobLabel: job
  endpoints:
    - interval: 5s
      path: /hzpublic/actuator/prometheus
      port: http
  namespaceSelector:
    any: true
  selector:
    matchLabels:
      app: hz-service-hzpublic
      job: hz-service-hzpublic-job

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hz-dev-service-hzpublic
  namespace: hz-dev-service
spec:
  minReadySeconds: 50
  revisionHistoryLimit: 3
  strategy:
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  replicas: 1
  selector:
    matchLabels:
      app: hz-service-hzpublic
      version: "1.0.0"
  template:
    metadata:
      labels:
        app: hz-service-hzpublic
        version: "1.0.0"
      annotations:
        # promtail 收集日志的核心配置
        promtail.io/scrape: "true" # promtail筛选标签，需要设置scrape为true
        promtail.io/path: "/logs/pd-service-hzpublic-all.log" # 日志文件的路径名称
    spec:
      imagePullSecrets:
        - name: pisxdocker
      containers:
        - name: hz-service-hzpublic
          image: 192.168.1.210:5000/library/pd-service-hzpublic:prom-1.0.0
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 31121
          volumeMounts:
            - name: logs-hz-service-hzpublic
              mountPath: /logs
          # 启动探针，检测系统是否启动成功
          startupProbe:
            httpGet:
              path: /hzpublic/actuator/health/readiness
              port: 31121
            periodSeconds: 10 # 探测时间间隔
            timeoutSeconds: 5 # 超时时间
            failureThreshold: 30 # 重试次数
          # 存活探针，检测系统是否存活
          livenessProbe:
            httpGet:
              path: /hzpublic/actuator/health/liveness
              port: 31121
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 20
            failureThreshold: 5
          resources:
            limits:
              cpu: "2"
              memory: "2048Mi"
              ephemeral-storage: "2Gi"
            requests:
              cpu: "0.2"
              memory: "1024Mi"
          env:
            - name: TZ
              value: 'Asia/Shanghai'
      volumes:
        - name: logs-hz-service-hzpublic
          hostPath:
            path: /data/logs

```

重点关注以下两块配置:
- Prometheus指标采集的标识: `ServiceMonitor` 下的 `metadata.labels`
- Promtail日志收集的标识: `Deployment` 下的 `spec.template.metadata.annotations`

## 部署资源

```shell
# 创建命名空间
kubectl create namespace hz-dev-service
kubectl get namespace hz-dev-service

# 如有需要，先删除再部署服务
kubectl delete -f k8s-dev.yaml

kubectl apply -f k8s-dev.yaml

```

## 部署完成后获取服务的状态及端口

```shell
# 查看 Pod
kubectl get pods -n hz-dev-service -o wide

# 输出结果
NAME                                       READY   STATUS    RESTARTS      AGE   IP             NODE            NOMINATED NODE   READINESS GATES
hz-dev-service-hzpublic-85d4549b5f-2f4v4   1/1     Running   2 (15m ago)   95m   10.244.95.36   k8s-master-02   <none>           <none>

# 查看服务端口信息
kubectl get services -n hz-dev-service -o wide

# 输出结果
[diginn@k8s-master-01 ~]$ kubectl get services -n hz-dev-service -o wide
NAME                      TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)           AGE   SELECTOR
svc-hz-service-hzpublic   NodePort   10.106.162.19   <none>        31121:31121/TCP   23h   app=hz-service-hzpublic

```

## 测试调用指标采集端点
```shell
# 调用端点
curl -X GET -i 'http://192.168.137.121:31121/hzpublic/actuator/prometheus'

```

# 本地部署 Spring Boot

服务改造步骤同上面【K8s部署SpringBoot】的【服务改造章节】，这里不再重复。

JVM部署及环境遍历的配置步骤也省略，可以参考前置的两篇文章或网络上搜索。

## 启动服务
这里以 `pd-service-hzctm.jar` 为例，创建启动和停止脚本

```shell
# 启动脚本
cat > startup.sh << 'EOF'
#!/bin/bash
nohup java -jar pd-service-hzctm.jar > /dev/null 2>&1 &
echo "$!" > pid
EOF

# 停止脚本
cat > shutdown.sh << 'EOF'
#!/bin/bash
kill -9 `cat pid`
echo "关闭成功!"
EOF

# 脚本添加执行权限
chmod +x startup.sh shutdown.sh
```

直接启动服务即可
```shell
./startup.sh


```

***注:** 输出日志文件的路径不同会影响Promtail的配置，请根据实际进行修改
- 示例中的jar包及脚本路径为 `/home/diginn/lpg`
- 日志的输出路径为         `/home/diginn/logs`

## K8s 资源文件定义

由于Prometheus Operator的数据采集依赖于 `ServiceMonitor`，这里部署`Service` `Endpoint` `ServiceMonitor` 将本地的服务信息注册到K8s上

K8s 资源文件 `k8s-local-boot.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: spring-boot-exporter
  namespace: k8s-local-boot
  # 这里的labels要和 ServiceMonitor 的 spec.selector.matchLabels 一致
  labels:
    app: hz-service-hzctm
    job: hz-service-hzctm-job
spec:
 clusterIP: None
 type: ClusterIP

---

apiVersion: v1
kind: Endpoints
metadata:
  name: spring-boot-exporter
  namespace: k8s-local-boot
subsets:
  # 这里IP端口为本地服务的IP 和端口
  - addresses:
      - ip: 192.168.137.132
    ports:
      - name: http-metrics
        port: 31122
        protocol: TCP

---

apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: spring-boot-exporter
  namespace: k8s-local-boot
  labels:
    app: hz-service-hzctm
    # 这个标签必须要有，key和value的取值见上面章节【ServiceMonitor中的 `metadata.labels.realease: prometheus` 说明】
    release: prometheus
spec:
  jobLabel: job
  endpoints:
    # 指标采集的端点信息，端口引用上面Endpoints中定义的port，path为指标端点的访问地址，需要包含服务的contextpath
    - port: http-metrics
      interval: 5s
      honorLabels: true
      scheme: http
      path: /hzctm/actuator/prometheus
  selector:
    # 这里的取值要和Service 的 metadata.labels 一致
    matchLabels:
      app: hz-service-hzctm
      job: hz-service-hzctm-job

```

## 部署资源
```shell
# 创建命名空间
kubectl get namespace k8s-local-boot
kubectl create namespace k8s-local-boot

# 部署
kubectl apply -f k8s-local-boot.yaml

# 删除
kubectl apply -f k8s-local-boot.yaml

```

## 测试调用指标采集端点
```shell
# 调用端点
curl -X GET -i 'http://192.168.137.132:31122/hzctm/actuator/prometheus'

```

# 本地部署 Nginx

Nginx的按照部署步骤省略，这里主要时修改Nginx配置，输出json格式的 `access_log` 

```conf
    ##
    # Logging Settings
    ##
    log_format access_json escape=json
      '{'
        '"@timestamp":"$time_iso8601",'
        '"host":"$server_addr",'
        '"clientip":"$remote_addr",'
        '"size":$body_bytes_sent,'
        '"responsetime":$request_time,'
        '"upstreamtime":"$upstream_response_time",'
        '"upstreamhost":"$upstream_addr",'
        '"request":"$request",'
        '"uri":"$uri",'
        '"domain":"$host",'
        '"x_forwarded_for":"$http_x_forwarded_for",'
        '"referer":"$http_referer",'
        '"tcp_xff":"$proxy_protocol_addr",'
        '"http_user_agent":"$http_user_agent",'
        '"status":"$status"'
      '}';

    access_log /var/log/nginx/access.log access_json;

```


# 本地部署 Promtail
虽然在K8s中部署了Promtail，但是只能采集容器的日志，本地部署的Nginx及Spring Boot应用日志仍然需要本地部署Promtail来采集

## 安装Promtail
```shell
# 下载安装包
wget https://github.com/grafana/loki/releases/download/v3.5.1/promtail-linux-amd64.zip      -O promtail-linux-amd64.zip

# 下载配置文件
wget https://raw.githubusercontent.com/grafana/loki/v3.5.1/clients/cmd/promtail/promtail-local-config.yaml -O promtail-local-config.yaml

# 解压
unzip promtail-linux-amd64.zip -d /usr/local/promtail/

# 配置文件
cp promtail-local-config.yaml /usr/local/promtail/

# 运行
cd /usr/local/promtail
./promtail-linux-amd64 -config.file=promtail-local-config.yaml

```

## 配置文件
修改配置文件，采集Spring Boot及Nginx日志 `promtail-local-config.yaml`

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://192.168.137.121:30310/loki/api/v1/push

scrape_configs:
- job_name: nginx-log
  # 抓取本地Nginx日志
  static_configs:
  - targets:
      - localhost
    labels:
      job: nginx-log
      __path__: /var/log/nginx/*.log
  # 给文件打标签，不同类型的文件采用不同的解析策略
  relabel_configs:
  - source_labels: [__path__]
    regex: .*
    action: replace
    target_label: log_type
    replacement: text  # 默认类型
  - source_labels: [__path__]
    regex: .*(access).* # accesslog格式改为json了，使用json解析
    replacement: json
    target_label: log_type
  pipeline_stages:
  # 解析普通文本
  - match:
      selector: '{log_type="text"}'
      stages:
        # - debug:
        #   message: 'File: {{ .__path__ }} | Log type: {{ .log_type }} | __Log type__: {{ .__log_type__ }}' 
        - regex:
            expression: '^(?P<timestamp>\d{4}/\d{2}/\d{2} \d{2}:\d{2}:\d{2}) \[(?P<level>\w+)\] (?P<pid>\d+)\#(?P<tid>\d+): \*(?P<message>.*)$'
        - json:
            output: log
            expressions:
              timestamp: timestamp
              level: level
              process_id: pid
              thread_id: tid
              message: message
        # 3. 设置日志时间戳
        - timestamp:
            source: timestamp
            format: "2006/01/02 15:04:05"
            location: Asia/Shanghai   # 如果日志时间字符串是北京时间（UTC+8）
          
        # 4. 将关键字段转为标签（低基数字段）
        - labels:
            level:
          
        # 5. 添加结构化元数据（高基数字段）
        - structured_metadata:
            process_id:
            thread_id:
  # 解析json
  - match:
      selector: '{log_type="json"}'
      stages:
        - json:
            expressions: 
              timestamp: '"@timestamp"'
              host: host
              clientip: clientip
              size: size
              responsetime: responsetime
              upstreamtime: upstreamtime
              upstreamhost: upstreamhost
              request: request
              uri: uri
              domain: domain
              x_forwarded_for: x_forwarded_for
              referer: referer
              tcp_xff: tcp_xff
              http_user_agent: http_user_agent
              status: status
            max_depth: 3  # 防止深层嵌套消耗资源
            drop_malformed: true  # 丢弃无效JSON
        # 2. 设置时间戳
        - timestamp:
            source: timestamp
            format: "2006-01-02 15:04:05.000"
            location: Asia/Shanghai   # 如果日志时间字符串是北京时间（UTC+8）
        # 3. 添加结构化元数据（使字段显示在 Parsed Fields）
        - structured_metadata:
            clientip:
            x_forwarded_for:
            request:
            domain:
            uri:
            status:
- job_name: pd-service
  # 抓取本地SpringBoot日志
  static_configs:
  - targets:
      - localhost
    labels:
      job: pd-service
      __path__: /home/diginn/logs/*.log
  # 给文件打标签，不同类型的文件采用不同的解析策略
  relabel_configs:
  - source_labels: [__path__]
    regex: .*
    action: replace
    target_label: log_type
    replacement: text  # 默认类型
  - source_labels: [__path__]
    regex: .*(json).* # json格式的日志名称中包含 json
    replacement: json
    target_label: log_type
  pipeline_stages:
  # 解析普通文本
  - match:
      selector: '{log_type="text"}'
      stages:
        # - debug:
        #   message: 'File: {{ .__path__ }} | Log type: {{ .log_type }} | __Log type__: {{ .__log_type__ }}' 
        # 1. 使用正则提取所有字段 %d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] [%X{requestId}] [%-5level] %C.%M[%L line] - %m%n
        - regex:
            expression: '^(?P<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}) \[(?P<thread>[^\]]*)\] \[(?P<request_id>[^\]]*)\] \[(?P<level>\w+)\s*\] (?P<class>\w+(?:\.\w+)*)\.(?P<method>\w+)\[(?P<line>\d+) line\] - (?P<message>.*)$'
          
        # 2. 清理 level 字段的空格（Log4j2 左对齐补空格）
        - replace:
            source: level
            expression: '\s+$'
            replace: ''
          
        # 3. 设置日志时间戳
        - timestamp:
            source: timestamp
            format: "2006-01-02 15:04:05.000"
            location: Asia/Shanghai   # 如果日志时间字符串是北京时间（UTC+8）
          
        # 4. 将关键字段转为标签（低基数字段）
        - labels:
            level:
            request_id:
          
        # 5. 添加结构化元数据（高基数字段）
        - structured_metadata:
            thread: thread  # 引用 regex 提取的字段
            class: class
            method: method
            line: line
        # - template:
        #     source: new_line
        #     template: 'logger={{ .class }} threadName={{ .thread }} methodName={{ .method }} line={{ .line }} | {{ or .message .stack_trace }}'
        # - output:
        #     source: new_line
  # 解析json
  - match:
      selector: '{log_type="json"}'
      stages:
        # 1. 解析 JSON 并提取字段
        - json:
            expressions: 
              thread: thread
              threadId: threadId
              level: level
              loggerName: loggerName
              message: message
              requestId: requestId
              timestamp: timestamp
            max_depth: 3  # 防止深层嵌套消耗资源
            drop_malformed: true  # 丢弃无效JSON
        # 2. 设置时间戳
        - timestamp:
            source: timestamp
            format: "2006-01-02 15:04:05.000"
            location: Asia/Shanghai   # 如果日志时间字符串是北京时间（UTC+8）
        # 3. 添加结构化元数据（使字段显示在 Parsed Fields）
        - structured_metadata:
            thread:
            threadId:
            level:
            loggerName:
            requestId:

```

重点关注以下几个属性
- `clients.url`: Loki 服务的地址为 `http://192.168.137.121:30310/loki/api/v1/push`
- pd-service `static_configs.labels.__path__`: Spring Boot日志路径 `/home/diginn/logs/*.log`
- nginx-log `static_configs.labels.__path__`: Nginx 日志路径 `/var/log/nginx/*.log`

## 启动服务

启停脚本
```shell
# 启动脚本
cat > startup.sh << 'EOF'
#!/bin/bash
nohup ./promtail-linux-amd64 -config.file=promtail-local-config.yaml >./promtail.log 2>&1 &
echo "$!" > pid
EOF

# 停止脚本
cat > shutdown.sh << 'EOF'
#!/bin/bash
kill -9 `cat pid`
echo "关闭成功!"
EOF

# 脚本添加执行权限
chmod +x startup.sh shutdown.sh

```

启动Promtail
```shell
./startup.sh

```

## 浏览器访问服务的Web页面
- Promtail 主界面 `http://192.168.137.132:9080`

| URL                | 介绍       | 备注                                    |
| ------------------ | ---------- | --------------------------------------- |
| /                  | 主界面     | 主界面默认跳转到 /targets               |
| /service-discovery | 服务发现页 | 记录收集日志的job名称及标签信息         |
| /config            | 配置页     | Promtail的配置信息                      |
| /targets           | 收集目标   | 日志文件所属的job，标签，路径，读取位置等信息 |

# 本地部署 Prometheus Exporter

此处以Node-Exporter为里，用于监控非K8s集群节点的服务器状态信息，理论上来说适用于所有非K8s的信息采集

## 本地部署Node-Exporter
- [Node-Exporter配置文件说明](https://github.com/prometheus/exporter-toolkit/blob/master/docs/web-configuration.md)

```shell
# 下载
wget https://github.com/prometheus/node_exporter/releases/download/v1.9.1/node_exporter-1.9.1.linux-amd64.tar.gz

# 解压
tar -zxvf node_exporter-1.9.1.linux-amd64.tar.gz

# 运行
cd node_exporter-1.9.1.linux-amd64/
./node_exporter --web.listen-address=:9100 --web.config.file="web-config.yaml"

```

## 启动服务

启停脚本
```shell
# 启动脚本
cat > startup.sh << 'EOF'
#!/bin/bash
nohup ./node_exporter --web.listen-address=:9100 >./node-exporter.log 2>&1 &
echo "$!" > pid
EOF

# 停止脚本
cat > shutdown.sh << 'EOF'
#!/bin/bash
kill -9 `cat pid`
echo "关闭成功!"
EOF

# 脚本添加执行权限
chmod +x startup.sh shutdown.sh

```

启动NodeExporter
```shell
./startup.sh

```

## K8s 资源文件的定义
这部分同【本地部署 Spring Boot】的【K8s 资源文件的定义】章节，只需要做少许的修改即可

K8s 资源文件 `k8s-local-node.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: local-node-exporter
  namespace: k8s-local-node
  # 这里的labels要和 ServiceMonitor 的 spec.selector.matchLabels 一致
  labels:
    app: node-exporter
    job: node-exporter-job
spec:
 clusterIP: None
 type: ClusterIP

---

apiVersion: v1
kind: Endpoints
metadata:
  name: local-node-exporter
  namespace: k8s-local-node
subsets:
  # 这里IP端口为本地服务的IP 和端口
  - addresses:
      - ip: 192.168.137.132
    ports:
      - name: http-metrics
        port: 9100
        protocol: TCP

---

apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: local-node-exporter
  namespace: k8s-local-node
  labels:
    app: node-exporter
    # 这个标签必须要有，key和value的取值见上面章节【ServiceMonitor中的 `metadata.labels.realease: prometheus` 说明】
    release: prometheus
spec:
  jobLabel: job
  endpoints:
    # 指标采集的端点信息，端口引用上面Endpoints中定义的port，path为指标端点的访问地址，需要包含服务的contextpath
    - port: http-metrics
      interval: 5s
      honorLabels: true
      scheme: http
      path: /
  selector:
    # 这里的取值要和Service 的 metadata.labels 一致
    matchLabels:
      app: node-exporter
      job: node-exporter-job

```

## 部署资源
这部分同【本地部署 Spring Boot】的【部署资源】章节

```shell
# 创建命名空间
kubectl get namespace k8s-local-node
kubectl create namespace k8s-local-node

# 部署
kubectl apply -f k8s-local-node.yaml

# 删除
kubectl apply -f k8s-local-node.yaml

```

访问Node-Exporter服务Web页面: http://192.168.137.132:9100/

# 总结
按照上面的步骤安装完成后，我们得到了下面的这些服务

1. K8s 部署有状态的 Promtetheus 服务
2. K8s 部署有状态的 Loki 服务
3. K8s 管理的 Grafana 服务
4. K8s DaemonSet 运行的 Promtail 服务
5. K8s 部署 Spring Boot 服务
6. 本地部署 Spring Boot服务
7. 本地部署 Nginx 服务
8. 本地部署 Promtail 服务

可以实现以下的功能
1. K8s 集群的监控(服务器、K8s)
2. K8s 部署服务的监控（JVM、Spring Boot）
3. 本地部署服务的监控（服务器、Spring Boot）
4. K8s 服务日志的收集
5. 本地服务日志的收集（Nginx、Spring Boot）
