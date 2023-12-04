- [curl 用法简介](https://www.jianshu.com/p/54135cdca2f7)

## 简介
> [curl](https://curl.se/) is a tool to transfer data from or to a server, using one of the supported protocols (DICT, FILE, FTP, FTPS, GOPHER, HTTP, HTTPS, IMAP, IMAPS, LDAP, LDAPS, POP3, POP3S, RTMP, RTSP, SCP, SFTP, SMB, SMBS, SMTP, SMTPS, TELNET and TFTP). The command is designed to work without user interaction.

[curl](https://curl.se/) 是一个命令行客户端，支持多种传输协议，最经常使用的场景就是在终端请求服务器资源。

[curl](https://curl.se/) 命令非常强大，熟练掌握情况下，相当于一个微型终端浏览器。

## 基本使用
1. 请求资源：curl 直接使用的效果就是发送Get请求服务器资源：
    ```shell
    $ curl 'http://httpbin.org/get'
    ```

2. 指定请求方法：使用选项`-X, --request <command>`：
    ```shell
    $ curl -X GET 'http://httpbin.org/get'  # 默认即使用 GET 请求，故可忽略 -X GET
    $ curl -X POST 'http://httpbin.org/post' # 发送 POST 请求
    ```
    该选项的参数有：`GET`、`POST`、`HEAD`、`PUT`、`DELETE`、`FTP`、`POP3`、`IMAP`、`SMTP`...

    **注：** 一般情况下，`-X/--request`选项都无需携带，因为很多其他选项都默认带有请求方法的语义。虽如此，但还是推荐请求时携带该选项。

3. 发送请求头：使用选项`-H, --header <header/@file>`：
    ```shell
    # 发送请求头：accept: application/json
    $ curl -X GET 'http://httpbin.org/headers' -H 'accept: application/json'

    # 发送 JSON 数据
    $ curl -X POST -d '{"login": "emma","password": 123}' -H 'Content-Type: application/json' 'http://httpbin.org/post'
    ```

4. 重定向：使用选项`-L, --location`:
    ```shell
    # curl 默认不会自动重定向
    $ curl -X GET "http://httpbin.org/absolute-redirect/1" -H "accept: text/html"

    # 使用 -L 选项使能重定向
    $ curl -X GET "http://httpbin.org/absolute-redirect/1" -H "accept: text/html" -L
    ```

5. 使用 cookie：使用选项`-b, --cookie <data|filename>`、`-c, --cookie-jar <filename>`：
    ```shell
    # 请求头携带：Cookie: key1=value1;key2=value2 
    $ curl 'http://httpbin.org/cookies' -b 'key1=value1;key2=value2'

    # 保存 Cookie: name=whyn 到文件 cookies.txt
    $ curl 'http://httpbin.org/cookies/set/name/whyn' -c cookies.txt

    # 从文件中读取 Cookie 信息
    $ curl 'http://httpbin.org/cookies' -b cookies.txt
    ```

6. 指定 Referer：使用选项`-e, --referer <URL>`：
    ```shell
    # 请求头添加：Referer: http://www.baidu.com
    $ curl 'http://httpbin.org/get' -e 'http://www.baidu.com'

    # 当然同样可以直接指定请求头：Referer
    $ curl 'http://httpbin.org/get' -H 'Referer: http://www.baidu.com'

    # 重定向时，加上 ;auto，则会自动将第二次请求的 Referer 设置为重定向页面，即：
    # 首次请求：Referer: http://www.baidu.com
    # 第二次请求（重定向）：Referer: http://httpbin.org/redirect/1
    $ curl -L 'http://httpbin.org/redirect/1' -e 'http://www.baidu.com;auto'
    ```

7. 指定 User-Agent：使用选项`-A, --user-agent <name>`：
    ```shell
    # 添加请求头：User-Agent: xxxx
    $ curl 'http://httpbin.org/get' -A 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36'

    # 当然同样可以直接指定请求头：User-Agent
    $ curl 'http://httpbin.org/get' -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36'
    ```

8. 忽略 SSL 检测：使用选项`-k, --insecure`：
    ```shell
    # 跳过 www.baidu.com 的证书验证
    $ curl -k 'https://www.baidu.com'
    ```

9. 保存为文件：使用选项`-O, --remote-name、-o, --output <file>`：
    ```shell
    # 保存网页，自动命名为 index.html
    $ curl -O 'http://www.baidu.com/index.html' 

    # 保存网页，手动命名为 baidu.html
    $ curl -o 'baidu.html' 'http://www.baidu.com/index.html' 

    # 下载图片
    $ curl -X GET 'https://upload-images.jianshu.io/upload_images/2222997-88ad51461e1e15ba.png?imageMogr2/auto-orient/strip|imageView2/2/w/1200/format/webp' -o nginx.webp

    # 自动断点续传，注: -C - 后面带一个 -，表示自动续传，否则需要手动指定断点续传字节位置
    $ curl -X GET -C - 'https://upload-images.jianshu.io/upload_images/2222997-88ad51461e1e15ba.png?imageMogr2/auto-orient/strip|imageView2/2/w/1200/format/webp' -o nginx.webp
    url 
    ```
    **注：** `-O/-o`选项将 curl 结果重定向到文件，相当于下载资源，其效果等同于wget。

10. 查看完整请求信息：使用选项`-v, --verbose`：
    ```shell
    $ curl 'http:/httpbin.org/get' -v
    ```
    **注：** `-v/--verbose`选项会显示完整的请求通讯过程，其显示内容包含如下几方面：

    - 以`*`开头的行：表示 curl 提供的额外信息
    - 以`>`开头的行：表示 请求头 内容
    - 以`<`开头的行：表示 响应头 内容

## 其它选项
1. 查看响应头：使用选项`-I, --head`：
    ```shell
    # 相当于 head 请求
    $ curl 'http://httpbin.org/get' -I
    ```

2. 查看响应头及响应体：使用选项`-i, --include`：
    ```shell
    $ curl 'http://httpbin.org/get' -i
    ```

3. 发送表单数据：对应选项有如下几个：
   - `-d, --data <data>`：以`ContentType:application/x-www-form-urlencoded`的格式发送表单数据，即`key1=value1&key2=value2`形式：
        ```shell
        # -d 默认携带 POST 请求语义，故 -X POST 在此可省略
        $ curl -X POST -d 'login=emma&password=123' 'http://httpbin.org/post'

        # 可多次使用 -d，数据会自动合并，相当于`login=emma&password=123`
        $ curl -X POST -d 'login=emma' -d 'password=123' 'http://httpbin.org/post'

        $ curl -X POST -d "login=@name.txt" -d "password=-"
        ```

        **注：** 对于GET请求的参数，有如下两种格式：
        ```shell
        # 直接拼接到 URL 后面作为参数传递
        $ curl 'http://httpbin.org/anything?name=whyn'

        # 使用 -d 选项时，需加上 -G 选项将请求方式设置为 GET 
        # curl 'http://httpbin.org/anything' -G -d 'name=whyn'
        ```

   - `--data-urlencode <data>`：如果表单数据需要进行 URL 编码，则使用该选项：
        ```shell
        $ curl -X POST --data-urlencode 'name=emma wild' 'http://httpbin.org/post'
        ```

   - `-F, --form <name=content>`：以`ContentType: multipart/form-data`的格式发送表单数据，一般用于上传文件：
        ```shell
        # 以文件表单进行上传：发送文件 portrait.png，对应表单字段为 profile（ @ 用于指定上传文件）
        $ curl -F profile=@portrait.jpg https://example.com/upload.cgi

        # 以文本表单进行上传：先读取 hugefile.txt 内容，然后作为字段 story 进行上传（ < 表示读取文件内容）
        $ curl -F "story=<hugefile.txt" https://example.com/

        # 从标准输入流中读取内容进行上传（- 表示读取标准输入流，此时使用 @ 或 < 均可以）
        $ echo 'Whyn' | curl -X POST -F "name=@-" 'http://httpbin.org/post'

        # 发送表单字段 name 和文件 profile，多字段，会产生格式： boundary=------------------------d74496d66958873e
        $ curl -F name=yourname -F profile=@portrait.jpg https://example.com/upload.cgi

        # 使用 type 指定上传文件 MIME 类型，默认使用的 MIME 为：application/octet-stream
        $ curl -F "web=@index.html;type=text/html" example.com

        # 使用 filename 修改上传文件名，本地使用文件 portrait.jpg，服务器接受到的为 me.jgp
        $ curl -F 'profile=@portrait.jpg;filename=me.jpg' https://example.com/upload.cgi
        ```

4. 代理：使用选项`-x, --proxy [protocol://]host[:port]`
    ```shell
    # 使用 HTTP 代理（本地使用 Nginx 搭建一个正向代理，通过 -I 选项可以看到响应头`Server: nginx/1.18.0`，结果由 Nginx 返回，则表示代理成功）
    $ curl -x 'http://localhost:80' 'http://httpbin.org/get' -I

    # 使用 socks5 代理
    $ curl -x "socks5://localhost:10808" "https://www.google.com" 
    ```
    **注：** `-x, --proxy`选项默认使用 HTTP 协议，默认使用端口 1080。

5. 限速：使用选项：`--limit-rate <speed>`：
    ```shell
    # 带宽限制为 200k
    $ curl --limit-rate 200k http://www.badiu.com
    ```

6. 保存详细的通讯流程：使用选项`--trace <file>`，`--trace-ascii <file>`：
    ```shell
    # 16 进制 dump 文件：显示完整通讯过程
    $ curl 'http://httpbin.org/get' --trace trace.txt

    # ascii 码 dump 文件，更加易读
    $ curl 'http://httpbin.org/get' --trace-ascii trace-ascii.txt
    ```

7. 认证：使用选项：`-u, --user <user:password>`：
    ```shell
    # basic authentication
    $ curl -X GET 'https://httpbin.org/basic-auth/admin/this.is.the.password' -u 'admin:this.is.the.password' --header 'accept: application/json; charset=utf-8'
    ```

更多其他选项内容，请查看：`curl --help`、`man curl`、[curl-manpage](https://curl.se/docs/manpage.html)

## 参考
- [curl manpage](https://curl.se/docs/manpage.html)
- [Curl Cookbook](https://catonmat.net/cookbooks/curl)
- [curl网站开发指南](https://www.ruanyifeng.com/blog/2011/09/curl.html)
- [curl 的用法指南](https://www.ruanyifeng.com/blog/2019/09/curl-reference.html)
