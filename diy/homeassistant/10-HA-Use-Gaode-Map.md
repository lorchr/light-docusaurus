- [Home Assistant + 树莓派：强大的智能家居系统 · 高德地图篇](https://sspai.com/post/40931)

- [cxlwill/HA_config](https://github.com/cxlwill/HA_config)
- [cxlwill/ha-inkwavemap](https://github.com/cxlwill/ha-inkwavemap)

- [d380025303/ha_gaode](https://github.com/d380025303/ha_gaode)
- [d380025303/ha_gaode_server](https://github.com/d380025303/ha_gaode_server)

## 配置高德地图
1. 注册并登录[高德地图控制台](https://console.amap.com/)
2. 进入【应用管理】-【我的应用】创建一个新的应用
3. 点击【添加key】，平台选择【web服务】，保存即可在页面显示如下的appkey appsecret

| Key 名称 | Key  商用说明                    | 安全密钥（点击查看安全密钥使用说明） | 绑定服务 | 操作     |
| -------- | -------------------------------- | ------------------------------------ | -------- | -------- |
| haos     | 3ac56a0455d7d8caeafabf0c07af1a5d | 9e7773f45555398e43f17ad3575b1c77     | Web端    | 设置 删除 |

4. `Terminal` 进入`/root/homeassistant`，编辑`configuration.yaml`

```yaml
vim /root/homeassistant/configuration.yaml

# Gaode Map
camera:
  name: Home
  platform: generic
  still_image_url: http://restapi.amap.com/v3/staticmap?location=地图中心经度,地图中心纬度&zoom=14&scale=2&size=305*185&traffic=1&&labels=家,0,0,35,0xFFFFFF,0x5288d8:标记经度,标记纬度&key=秘钥
  limit_refetch_to_url_change: false
```

5. 下载[墨澜地图](https://github.com/cxlwill/ha-inkwavemap)
6. 将 `www` `panels` 文件夹中的文档放到HA根目录 `/root/homeassistant`
7. 配置 `configuration.yaml`

```yaml
panel_custom:
  - name: inkwavemap
    sidebar_title: '墨澜地图'
    sidebar_icon: mdi:map
    url_path: inkwavemap
```