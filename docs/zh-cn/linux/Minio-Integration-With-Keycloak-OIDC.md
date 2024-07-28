# 将 MinIO 与 Keycloak OIDC 集成

Keycloak是一种单点登录解决方案。使用Keycloak，用户使用Keycloak而不是MinIO进行身份验证。如果没有Keycloak，您将不得不为每个用户创建一个单独的身份 - 从长远来看，这将很麻烦。您需要一个集中身份解决方案来管理 MinIO 的身份验证和授权。在这篇博文中，我们将向您展示如何设置 MinIO 以使用 Keycloak。但从广义上讲，它还应该让您了解 OIDC 是如何配置 MinIO 的，因此您可以将其与 Keycloak 以外的任何东西一起使用，这里我们只是以它为例。

## 如何设置 Keycloak

在这里，我们将Keycloak作为docker容器启动，以使其快速启动并运行以进行测试。但在生产环境中，请遵循 Kubernetes 部署方法与 MinIO 一起使用。

让我们继续安装 keycloak

```javascript
cd ~
```

Git 克隆 keycloak 容器仓库

```javascript
sudo rm -rf keycloak-containers

git clone git@github.com:keycloak/keycloak-containers.git
```

启动 keycloak 实例

```javascript
cd keycloak-containers/server

git checkout 12.0.4

docker build -t jboss/keycloak:12.0.4 .

docker run --rm -p 9080:8080 -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=admin jboss/keycloak:12.0.4
```

启动后， http://localhost:9080 使用以下凭据访问 keycloak

```javascript
user: admin

password: admin
```

按照以下步骤将Keycloak配置为与MinIO一起使用。这些将在 Keycloak UI 中遵循。

步骤1：

```javascript
Create a Realm called "myrealm"
```

步骤2：

```javascript
Clients

Click on account

Settings, set "Valid Redirect URIs" to "*"

expand "Advanced Settings" and set "Access Token Lifespan" to 1 Hours

Save
```

步骤3：

```javascript
Clients

Click on `account`

Mappers Tab in the middle

Click `Create` button

"Name" with "anytext"

`Mapper Type` is `User Attribute`

`User Attribute` is `policy`

Token Claim Name is policy

Claim JSON Type is string

Click "Create" button

Name: Audience

Mapper Type: Audience

Included Client Audience: security-admin-console

Save the two mappers

Clients > account > Setting > "Service Accounts Enabled" = ON
```

步骤4：

```javascript
Go to Roles

Add new Role `admin` with Description `${role_admin}`

"Composite Roles" as "ON"

"Available Roles" move them to "Associated Roles"

Do the same for all "Client Roles" from left to right.
```

步骤5：

```javascript
Roles

Default Roles

"Available Roles" move all to "Real Default Roles"

Same for all "Client Roles" all from left to right
```

步骤6：

```javascript
Clients

account

"Service Account Roles" tab.

"Available Roles" move to "Assigned Roles"

Same for all "Client Roles"
```

步骤7：

```javascript
Users

Create "minio" user

Attribute "policy" value "readwrite"

 

Put `minio123` password

"Role Mappings" Tab

"Available Roles" all from left to right

Same for all "Client Roles"

Add and Save
```

步骤8：

将以下内容复制到 MinIO ENV var MINIO_IDENTITY_OPENID_CLIENT_SECRET

```javascript
Clients

account

Credentials

Secret

81f55c5f-137f-4d83-82c5-c7fdc73cad5e
```

这样

```javascript
MINIO_IDENTITY_OPENID_CLIENT_SECRET="81f55c5f-137f-4d83-82c5-c7fdc73cad5e"
```

接下来，让我们使用 MinIO 进行配置

## 使用 MinIO 进行配置

我们将向您展示使用 MinIO 进行配置的几种不同方法。首先是裸机安装，其次是 Kubernetes。

如果您在裸机或 docker 中启动它，您可以"导出"以下环境变量

```javascript
export MINIO_IDENTITY_OPENID_SCOPES="openid,profile,email"

export MINIO_BROWSER_REDIRECT_URL=http://localhost:9001

export MINIO_SERVER_URL=http://localhost:9000

export MINIO_IDENTITY_OPENID_CLIENT_ID="account"

export MINIO_IDENTITY_OPENID_CLIENT_SECRET="81f55c5f-137f-4d83-82c5-c7fdc73cad5e"

export MINIO_IDENTITY_OPENID_CONFIG_URL=http://localhost:9080/auth/realms/myrealm/.well-known/openid-configuration

export MINIO_ROOT_USER=minio

export MINIO_ROOT_PASSWORD=minio123


minio server /Volumes/data{1...4} --address :9000 --console-address :9001
```

然后使用 SSO 登录 http://localhost:9001/login

 ![pastedimage029.png](http://minio-blog.oss-cn-beijing.aliyuncs.com/b037aa1bdbd8c23a808159f1461132acb7cf1dfa.png)

如果您使用的是 Tenant Operator，则其过程有点类似。在租户规范中设置以下环境变量

```javascript
env:

  - name: MINIO_IDENTITY_OPENID_CLIENT_SECRET

	value: 6aabe0ea-8d5f-412c-99f8-63b999ccd281

  - name: MINIO_IDENTITY_OPENID_SCOPES

	value: openid,profile,email

  - name: MINIO_BROWSER_REDIRECT_URL

	value: "https://72.140.145.27"

  - name: MINIO_SERVER_URL

	value: "https://minio.tenant-lite.svc.cluster.local:443"

  - name: MINIO_IDENTITY_OPENID_CLIENT_ID

	value: account

  - name: MINIO_IDENTITY_OPENID_CONFIG_URL

	value: "http://72.140.145.27/auth/realms/myrealm/.well-known/openid-configuration"
```

* 注1：MINIO_BROWSER_REDIRECT_URL是控制台UI。它必须从节点端口公开到群集，以端口转发到公共 IP。
* 注2：MINIO_IDENTITY_OPENID_CONFIG_URL我们的密钥斗篷是公开的，这也需要端口转发并设置公共IP地址。期望 SSO 的配置方式与连接到类似软件的公共方式相同，并且也可以是 auth0。

使用 SSO 访问租户

 ![16161802636e07512153245eda92ba6814551dcac.png](http://minio-blog.oss-cn-beijing.aliyuncs.com/16b86f799da020ddfa7cb1b8bd40f3a89f5b4e11.png)

该过程的其余部分是相同的，无论是裸机、docker 还是 Kubernetes。提供您的 MinIO 登录凭据。

 ![pastedimage030.png](http://minio-blog.oss-cn-beijing.aliyuncs.com/131661087f58133af4b3b84e867e2f3919264023.png)

正如预期的那样，您应该会看到如下所示的 UI

 ![pastedimage032.png](http://minio-blog.oss-cn-beijing.aliyuncs.com/ae02268b6b0ffaea6dabd7ed597d300927ac8cdf.png)\n ![pastedimage031.png](http://minio-blog.oss-cn-beijing.aliyuncs.com/26845688b30785d2cae78c1d662faed8b1c69e28.png)

就这么简单。

## 最后的思考

如您所见，要使 Keycloak 等 OIDC 工具与 MinIO 集成，无需做太多工作。您只需将 OIDC 工具配置为接受来自 MinIO 的身份验证请求，并将 MinIO 设置为重定向到您的 OIDC 工具。您现在可以使用这个实际工作示例来配置您自己的 OIDC。


[将 MinIO 与 Keycloak OIDC 集成](http://blog.minio.org.cn/integrate-minio-with-keycloak-oidc)
