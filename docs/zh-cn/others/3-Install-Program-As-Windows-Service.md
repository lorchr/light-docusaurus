将 Spring Boot 程序注册为 Windows 服务，并在开机时自动后台运行，可以通过以下步骤实现。我们将使用 [WinSW](https://github.com/winsw/winsw)（Windows Service Wrapper）工具来实现这一目标。

---

### 步骤 1：下载 WinSW
1. 访问 [WinSW 的 GitHub 发布页面](https://github.com/winsw/winsw/releases)。
2. 下载适合的版本（例如 `WinSW-x64.exe`）。
3. 将下载的 `WinSW-x64.exe` 重命名为 `app-service.exe`（名称可以根据需要修改）。

---

### 步骤 2：准备 Spring Boot 程序
1. 确保你的 Spring Boot 程序已经打包为可执行的 JAR 文件（例如 `app.jar`）。
2. 将 `app.jar` 和 `app-service.exe` 放在同一个目录下。

---

### 步骤 3：创建配置文件
在 `app-service.exe` 所在的目录下，创建一个 XML 配置文件，命名为 `app-service.xml`，内容如下：

```xml
<service>
  <!-- 服务 ID，必须唯一 -->
  <id>app-service</id>
  <!-- 服务名称 -->
  <name>App Service</name>
  <!-- 服务描述 -->
  <description>This service runs the Spring Boot application.</description>

  <!-- 可执行文件的路径 -->
  <executable>java</executable>
  <!-- JVM 参数（可选） -->
  <arguments>-Xmx512m -jar "app.jar"</arguments>

  <!-- 工作目录 -->
  <workingdirectory>%BASE%</workingdirectory>
  <!-- 日志目录 -->
  <logpath>%BASE%\logs</logpath>
  <!-- 日志模式 -->
  <log mode="roll-by-size">
    <sizeThreshold>10240</sizeThreshold>
    <keepFiles>8</keepFiles>
  </log>
</service>
```

#### 配置说明：
- `<id>`：服务的唯一标识符。
- `<name>`：服务的显示名称。
- `<description>`：服务的描述。
- `<executable>`：Java 可执行文件的路径（确保 `java` 在系统环境变量中）。
- `<arguments>`：传递给 Java 的命令行参数（例如 `-jar app.jar`）。
- `<workingdirectory>`：工作目录，`%BASE%` 表示配置文件所在的目录。
- `<logpath>`：日志文件存储路径。
- `<log>`：日志配置，支持按大小滚动。

---

### 步骤 4：安装服务
1. 打开命令提示符（以管理员身份运行）。
2. 导航到 `app-service.exe` 所在的目录。
3. 运行以下命令安装服务：
   ```cmd
   app-service.exe install
   ```
   如果成功，会显示类似以下的消息：
   ```
   2023-10-10 12:00:00 INFO  - Installing service 'App Service (app-service)'...
   2023-10-10 12:00:00 INFO  - Service 'App Service (app-service)' installed successfully.
   ```

---

### 步骤 5：启动服务
1. 在命令提示符中运行以下命令启动服务：
   ```cmd
   app-service.exe start
   ```
2. 检查服务是否正常运行：
   ```cmd
   app-service.exe status
   ```

---

### 步骤 6：设置开机自启动
1. 打开 Windows 服务管理器：
   - 按 `Win + R`，输入 `services.msc`，然后按回车。
2. 找到 `App Service`，右键点击并选择“属性”。
3. 在“启动类型”中选择“自动”，然后点击“确定”。

---

### 步骤 7：验证服务
1. 重启计算机，确保服务在开机时自动启动。
2. 打开浏览器，访问 Spring Boot 应用的接口或页面，验证服务是否正常运行。

---

### 其他常用命令
- **停止服务**：
  ```cmd
  app-service.exe stop
  ```
- **卸载服务**：
  ```cmd
  app-service.exe uninstall
  ```
- **查看日志**：
  日志文件会存储在 `logs` 目录下，可以查看日志以排查问题。

---

### 注意事项
1. 确保 Java 已正确安装，并且 `java` 命令可以在命令行中运行。
2. 如果 Spring Boot 程序需要访问网络或其他资源，确保服务账户有足够的权限。
3. 如果服务启动失败，检查日志文件以获取更多信息。

通过以上步骤，你可以将 Spring Boot 程序注册为 Windows 服务，并实现开机自启动和后台运行。