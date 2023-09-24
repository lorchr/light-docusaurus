- [k8s 操作命令 合集List](https://www.cnblogs.com/kangao/p/17526694.html)

## 一、K8S最常用命令如下：
1. 获取pod信息：`kubectl get pod`
2. 查看指定pod的日志信息：`kubectl logs -f --tail(最后多少行) 500 podName(pod名)`
3. 查看pod的描述信息：`kubectl describe pod podName`
4. 查看节点信息：`kubectl get nodes`
5. 查看pod的详细信息，以yaml或者json格式展示：`kubectl get pods -o yaml`、`kubectl get pods -o json`
6. 查看所有名称空间的pod：`kubectl get pod -A`
7. 查看指定pod的环境变量：`kubectl exec podName env`
8. 查看所有的service信息：`kubectl get svc -A`
9. 查看集群资源（ComponentStatuses）信息：`kubectl get cs`
10. 查看所有名称空间：`kubectl get ns`
11. 查看集群信息：`kubectl cluster-info` 、`kubectl cluster-info dump`
12. 进入pod容器：`kubectl exec -it podName -n nsName /bin/sh` 、`kubectl exec -it podName -n nsName /bin/bash`
13. 删除指定的pod：`kubectl delete pod podName`
14. 删除指定命名空间的pod：`kubectl delete pod -n test podName`
15. 编辑资源：`kubectl edit pod podName`
16. 获取pod详细信息：`kubectl get pod -o wide`

## 二、k8s操作命令详解：
### 1、基础操作命令
```shell
alias k=kubectl echo 'alias k=kubectl' >>~/.bashrc
kubectl get pods -o=json
kubectl get pods -o=yaml
kubectl get pods -o=wide
kubectl get pods -n=<namespace_name>
kubectl create -f ./
kubectl logs -l name=
```

### 2、资源相关
```shell
# Create objects.
kubectl create -f k8s.yaml

# Create objects in all manifest files in a directory.
kubectl create -f .

# Create objects from a URL.
kubectl create -f <'url'> 

# Delete an object.
kubectl delete -f k8s.yaml
```

### 3、集群相关
```shell
# Display endpoint information about the master and services in the cluster.
kubectl cluster-info 

# Display the Kubernetes version running on the client and server.
kubectl version 

# Get the configuration of the cluster.
kubectl config view 

# Get a list of users.
kubectl config view -o jsonpath='{.users[*].name}' 

# Display the current context.
kubectl config current-context 

# Display a list of contexts.
kubectl config get-contexts 

# Set the default context.
kubectl config use-context 

# List the API resources that are available.
kubectl api-resources

# List the API versions that are available. kubectl get all --all-namespaces
kubectl api-versions 
```

### 4、Daemonsets 相关
```shell
# List one or more daemonsets.
kubectl get daemonset 

# Edit and update the definition of one or more daemonset.
kubectl edit daemonset <daemonset_name> 

# Delete a daemonset.
kubectl delete daemonset <daemonset_name> 

# Create a new daemonset.
kubectl create daemonset <daemonset_name> 

# Manage the rollout of a daemonset.
kubectl rollout daemonset 

# Display the detailed state of daemonsets within a namespace.
kubectl describe ds <daemonset_name> -n <namespace_name> 
```

### 5、Deployments相关
```shell
# List one or more deployments.
kubectl get deployment 

# Display the detailed state of one or more deployments.
kubectl describe deployment <deployment_name> 

# Edit and update the definition of one or more deployments on the server.
kubectl edit deployment <deployment_name> 

# Create a new deployment.
kubectl create deployment <deployment_name> 

# Delete deployments.
kubectl delete deployment <deployment_name> 

# See the rollout status of a deployment.
kubectl rollout status deployment <deployment_name> 

# Perform a rolling update (K8S default), set the image of the container to a new version for a particular deployment.
kubectl set image deployment/ =image: 

# Rollback a previous deployment.
kubectl rollout undo deployment/ 

# Perform a replace deployment — Force replace, delete and then re-create the resource.
kubectl replace --force -f 
```

### 6、事件相关
```shell
# List recent events for all resources in the system.
kubectl get events

# List Warnings only.
kubectl get events –field-selector type=Warning 

# List events sorted by timestamp.
kubectl get events --sort-by=.metadata.creationTimestamp 

# List events but exclude Pod events.
kubectl get events --field-selector involvedObject.kind!=Pod 

# Pull events for a single node with a specific name.
kubectl get events --field-selector involvedObject.kind=Node, involvedObject.name=<node_name>

# Filter out normal events from a list of events.
kubectl get events --field-selector type!=Normal 
```

### 7、日志相关
```shell
# Print the logs for a pod.
kubectl logs <pod_name> 

# Print the logs for the last 6 hours for a pod.
kubectl logs --since=6h <pod_name> 

# Get the most recent 50 lines of logs.
kubectl logs --tail=50 <pod_name> 

# Get logs from a service and optionally select which container.
kubectl logs -f <service_name> [-c <$container>] 

# Print the logs for a pod and follow new logs.
kubectl logs -f <pod_name> 

# Print the logs for a container in a pod.
kubectl logs -c <container_name> <pod_name> 

# Output the logs for a pod into a file named ‘pod.log'.
kubectl logs <pod_name> pod.log 

# View the logs for a previously failed pod.
kubectl logs --previous <pod_name> 
```

### 8、Namespace 相关
```shell
# Create a namespace.
kubectl create namespace <namespace_name> 

# List one or more namespaces.
kubectl get namespace <namespace_name> 

# Display the detailed state of one or more namespaces.
kubectl describe namespace <namespace_name> 

# Delete a namespace.
kubectl delete namespace <namespace_name> 

# Edit and update the definition of a namespace.
kubectl edit namespace <namespace_name> 

# Display Resource (CPU/Memory/Storage) usage for a namespace.
kubectl top namespace <namespace_name> 
```

### 9、Nodes 相关
```shell
# Update the taints on one or more nodes.
kubectl taint node <node_name> 

# List one or more nodes.
kubectl get node 

# Delete a node or multiple nodes.
kubectl delete node <node_name> 

# Display Resource usage (CPU/Memory/Storage) for nodes.
kubectl top node <node_name> 

# Pods running on a node.
kubectl get pods -o wide | grep <node_name> 

# Annotate a node.
kubectl annotate node <node_name> 

# Mark a node as unschedulable.
kubectl cordon node <node_name> 

# Mark node as schedulable.
kubectl uncordon node <node_name> 

# Drain a node in preparation for maintenance.
kubectl drain node <node_name> 

# Add or update the labels of one or more nodes.
kubectl label node 
```

### 10、Pods 操作相关
```shell
# List one or more pods.
kubectl get pod 

# List pods Sorted by Restart Count.
kubectl get pods --sort-by='.status.containerStatuses[0].restartCount' 

# Get all running pods in the namespace.
kubectl get pods --field-selector=status.phase=Running 

# Delete a pod.
kubectl delete pod <pod_name> 

# Display the detailed state of a pods.
kubectl describe pod <pod_name> 

# Create a pod.
kubectl create pod <pod_name> 

# Execute a command against a container in a pod. Read more: Using Kubectl Exec: Connect to Your Kubernetes Containers
kubectl exec <pod_name> -c <container_name> 

# Get an interactive shell on a single-container pod.
kubectl exec -it <pod_name> /bin/sh 

# Display Resource usage (CPU/Memory/Storage) for pods.
kubectl top pod 

# Add or update the annotations of a pod.
kubectl annotate pod <pod_name>

# Add or update the label of a pod.
kubectl label pods <pod_name> new-label= 

# Get pods and show labels.
kubectl get pods --show-labels 

# Listen on a port on the local machine and forward to a port on a specified pod.
kubectl port-forward : 
```

### 11、Replication Controller 相关
```shell
# List the replication controllers.
kubectl get rc

# List the replication controllers by namespace.
kubectl get rc --namespace=<namespace_name>
```

### 12、ReplicaSets 相关
```shell
# List ReplicaSets.
kubectl get replicasets 

# Display the detailed state of one or more ReplicaSets.
kubectl describe replicasets <replicaset_name> 

# Scale a ReplicaSet.
kubectl scale --replicas=[x] 
```

### 13、Sercrets 相关
```shell
# Create a secret.
kubectl create secret 

# List secrets.
kubectl get secrets 

# List details about secrets.
kubectl describe secrets 

# Delete a secret.
kubectl delete secret <secret_name> 
```

### 14、Services 相关
```shell
# List one or more services.
kubectl get services 

# Display the detailed state of a service.
kubectl describe services 

# Expose a replication controller, service, deployment, or pod as a new Kubernetes service.
kubectl expose deployment [deployment_name] 

# Edit and update the definition of one or more services
kubectl edit services 
```

### 15、Service Account相关
```shell
# List service accounts.
kubectl get serviceaccounts 

# Display the detailed state of one or more service accounts.
kubectl describe serviceaccounts 

# Replace a service account.
kubectl replace serviceaccount 

# Delete a service account
kubectl delete serviceaccount <service_account_name> 
```

### 16、StatefulSets 相关
```shell
# List StatefulSet
kubectl get statefulset 

# Delete StatefulSet only (not pods).
kubectl delete statefulset/[stateful_set_name] --cascade=false 
```
