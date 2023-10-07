SSH蜜罐 - 使用一个假的SSH服务端来接收来自互联网的登录攻击，并记录其登录ip及账号密码，以下为一些Github上的开源项目

```shell
docker run -d \
    --publish 22:22 \
    --restart=always \
    --name fakessh \
    fffaraz/fakessh

docker logs -f fakessh
```


* [fffaraz/fakessh](https://github.com/fffaraz/fakessh) - A dockerized fake SSH server honeypot written in Go that logs login attempts.
* [jaksi/sshesame](https://github.com/jaksi/sshesame) - A fake SSH server that lets everyone in and logs their activity.
* [shazow/ssh-chat](https://github.com/shazow/ssh-chat) - Custom SSH server written in Go. Instead of a shell, you get a chat prompt.
* [gliderlabs/ssh](https://github.com/gliderlabs/ssh) - Easy SSH servers in Golang.
* [gliderlabs/sshfront](https://github.com/gliderlabs/sshfront) - Programmable SSH frontend.
* [desaster/kippo](https://github.com/desaster/kippo) - Kippo - SSH Honeypot.
* [micheloosterhof/cowrie](https://github.com/micheloosterhof/cowrie) - Cowrie SSH/Telnet Honeypot.
* [fzerorubigd/go0r](https://github.com/fzerorubigd/go0r) - A simple ssh honeypot in golang.
* [droberson/ssh-honeypot](https://github.com/droberson/ssh-honeypot) - Fake sshd that logs ip addresses, usernames, and passwords.
* [x0rz/ssh-honeypot](https://github.com/x0rz/ssh-honeypot) - Fake sshd that logs ip addresses, usernames, and passwords.
* [tnich/honssh](https://github.com/tnich/honssh) - HonSSH is designed to log all SSH communications between a client and server.
* [Learn from your attackers - SSH HoneyPot](https://www.robertputt.co.uk/learn-from-your-attackers-ssh-honeypot.html)
* [cowrie](https://github.com/cowrie/cowrie) - Cowrie SSH/Telnet Honeypot.