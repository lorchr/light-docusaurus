
以下是MacOS群晖NAS硬盘跑分文字攻略

1. 开启群晖机ssh
2. 打开terminal进入ssh进入docker

```bash
ssh xxxxxx@xxx.xxx.x.xxx
sudo su -
cd /etc/docker/
```

3. 安装ubuntu安装fio
```bash
docker run -it -v /volume1/docker/ubuntu:/mnt --privileged ubuntu bash
apt update
apt install fio
```

4. 创建挂载文件夹
```bash
cd /mnt
mkdir test
```

5. fio测试（128 io深度，2G文件，60秒）

顺序写
```bash
fio --filename=/mnt/test/testfile --direct=1 --iodepth=128 --rw=write --ioengine=libaio --bs=1M --size=2G --numjobs=1 --runtime=60 --group_reporting --name=sequential_write_test
```

顺序读
```bash
fio --filename=/mnt/test/testfile --direct=1 --iodepth=128 --rw=read --ioengine=libaio --bs=1M --size=2G --numjobs=1 --runtime=60 --group_reporting --name=sequential_read_test
```

随机读写里把块大小改成16k
随机写
```bash
fio --filename=/mnt/test/testfile --direct=1 --iodepth=128 --rw=randwrite --ioengine=libaio --bs=16k --size=2G --numjobs=1 --runtime=60 --group_reporting --name=random_write_test
```

随机读
```bash
fio --filename=/mnt/test/testfile --direct=1 --iodepth=128 --rw=randread --ioengine=libaio --bs=16k --size=2G --numjobs=1 --runtime=60 --group_reporting --name=random_read_test
```

随机读写混合测试
```bash
fio --filename=/mnt/test/testfile --direct=1 --iodepth=128 --rw=randrw --rwmixread=70 --ioengine=libaio --bs=16k --size=2G --numjobs=1 --runtime=60 --group_reporting --name=random_readwrite_test
```
