## Activiti
- [Activiti UI 6.x](https://www.activiti.org/userguide/#activiti.setup)
- [Activiti-cloud-query](https://hub.docker.com/r/activiti/activiti-cloud-query)
- [Activiti-cloud-modeling](https://hub.docker.com/r/activiti/activiti-cloud-modeling)
- [Activiti-cloud-modeling-service DEPRECATED](https://github.com/AlfrescoArchive/activiti-cloud-modeling-service)
- [Activiti-cloud-modeling-service](https://github.com/Activiti/activiti-cloud/tree/develop/activiti-cloud-modeling-service)
- [Doc docker-compose](https://activiti.gitbook.io/activiti-7-developers-guide/getting-started/getting-started-activiti-cloud/getting-started-docker-compose)
- [Doc modeling](https://activiti.gitbook.io/activiti-7-developers-guide/components/activiti-cloud-modeling)

```shell
git clone https://github.com/Activiti/activiti-cloud-examples.git
cd activiti-cloud-examples/docker-compose

docker run -d \
    --publish 18083:8080 \
    --network dev \
    --restart no \
    --name activiti \
    activiti/activiti-cloud-modeling:latest

docker run -d \
    --publish 18082:8080 \
    --network dev \
    --restart no \
    --name activiti-cloud-query \
    activiti/activiti-cloud-query:latest
```

- [Dashboard](http://localhost:8080/activiti-app)
- Account
  - demo / demo


## Camunda
- [Camunda Platform 7 Docker Images](https://hub.docker.com/r/camunda/camunda-bpm-platform)
- [Doc](https://github.com/camunda/docker-camunda-bpm-platform/blob/next/README.md)
- [Desktop Modeler](https://camunda.com/download/modeler/)

```shell
docker run -d \
    --publish 18081:8080 \
    --network dev \
    --restart no \
    --name camunda \
    camunda/camunda-bpm-platform:7.20.0-alpha4
```

- [Dashboard](http://localhost:8080/camunda-welcome/index.html)
- Account
  - demo / demo

## Flowable
- [Flowable-ui](https://hub.docker.com/r/flowable/flowable-ui)
- [Doc](https://www.flowable.com/open-source/docs/bpmn/ch14-Applications/)

```shell
docker run -d \
    --publish 18080:8080 \
    --network dev \
    --restart no \
    --name flowable \
    flowable/flowable-ui:6.8.0
```

- [Dashboard](http://localhost:8080/flowable-ui)
- Account
  - admin / test
