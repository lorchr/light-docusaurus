
- [Caddy](https://caddyserver.com/)
- [Caddy Github](https://github.com/caddyserver/caddy)

```bash
# 生成私钥，需要输入密码
openssl genrsa -des3 -out caddy.pass.key 2048
# 删除私钥中的密码
openssl rsa -in caddy.pass.key -out caddy.key
# 生成CSR
openssl req -new -key caddy.key -out caddy.csr -subj "/C=CN/ST=Shanghai/L=Shanghai/O=light/OU=caddy/CN=caddy.light.local"
# 生成证书
openssl x509 -req -days 3650 -in caddy.csr -signkey caddy.key -out caddy.crt


# 生成私钥，需要输入密码
openssl genrsa -des3 -out outline.pass.key 2048
# 删除私钥中的密码
openssl rsa -in outline.pass.key -out outline.key
# 生成CSR
openssl req -new -key outline.key -out outline.csr -subj "/C=CN/ST=Shanghai/L=Shanghai/O=light/OU=outline/CN=outline.light.local"
# 生成证书
openssl x509 -req -days 3650 -in outline.csr -signkey outline.key -out outline.crt
```

```yaml
version: "3.7"

services:
  caddy:
    image: caddy:2.8
    restart: unless-stopped
    cap_add:
      - NET_ADMIN
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
    #   - ./site:/srv
      - caddy_config:/config
      - caddy_data:/data

volumes:
  caddy_config:
  caddy_data:
    external: true

```


Caddyfile

```conf
# 反代Outline
outline.light.local {
    encode zstd gzip

    # tls <你的邮箱>

    header / {
        X-Content-Type-Options nosniff
        X-Frame-Options "SAMEORIGIN"
        X-XSS-Protection "1; mode=block"
        X-Robots-Tag none
        X-Download-Options noopen
        X-Permitted-Cross-Domain-Policies none
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        -Server
    }

    # 反代Outline的3000端口
    reverse_proxy 127.0.0.1:3000 {
        header_up X-Real-IP {remote_host}
    }
}

# 反代minio
minio.light.local {
    encode zstd gzip

    # tls <你的邮箱>

    # 反代minio的9001端口
    reverse_proxy 127.0.0.1:9001 {
        header_up X-Forwarded-Proto {http.request.scheme}
        header_up X-Forwarded-Host {http.request.host}
        header_up Host {http.request.host}
        header_down Access-Control-Allow-Origin "*"
    }
}

# 反代keycloak
keycloak.light.local {
    encode zstd gzip

    # tls <你的邮箱>

    # 反代minio的9001端口
    reverse_proxy 127.0.0.1:3679 {
        header_up X-Forwarded-Proto {http.request.scheme}
        header_up X-Forwarded-Host {http.request.host}
        header_up Host {http.request.host}
        header_down Access-Control-Allow-Origin "*"
    }
}

```


```bash
docker compose -f caddy.yaml -p caddy up -d

docker compose -f caddy.yaml -p caddy down

```
