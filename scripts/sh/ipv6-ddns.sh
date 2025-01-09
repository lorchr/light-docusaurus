#!/bin/sh

email=mail@163.com
zone_id=xxxxxxxxxxxxxxx
dns_record_domain=domain.ip-ddns.com 
dns_record_id=yyyyyyyyyyyyyyy
global_Key=zzzzzzzzzzzzzzz

# 获取ZoneId
get_zone_info() {
    # curl -s -X GET "https://api.cloudflare.com/client/v4/zones" \
    #     -H "X-Auth-Email: $email" \
    #     -H "X-Auth-Key: $global_Key" \
    #     -H "Content-Type: application/json"

    zone_info=`curl -s -X GET "https://api.cloudflare.com/client/v4/zones" -H "X-Auth-Email: $email" -H "X-Auth-Key: $global_Key" -H "Content-Type: application/json"`
    echo "zone_info: $zone_info ";
}

# 获取DNS RecordId
get_dns_record_info() {
    # curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$zone_id/dns_records?type=AAAA&name=$dns_record_domain&content=::1&page=1&per_page=100&order=type&direction=desc&match=any" \
    #     -H "X-Auth-Email: $email" \
    #     -H "X-Auth-Key: $global_Key" \
    #     -H "Content-Type: application/json"

    dns_record_info=`curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$zone_id/dns_records?type=AAAA&name=$dns_record_domain&content=::1&page=1&per_page=100&order=type&direction=desc&match=any" -H "X-Auth-Email: $email" -H "X-Auth-Key: $global_Key" -H "Content-Type: application/json"`
    echo "dns_record: $dns_record_info ";
}


# 设置DNS Record
set_dns_record() {
    ipv6=`ip -6 addr show dev eth0 | grep global | awk '{print $2}' | awk -F "/" '{print $1}'`
    echo "ipv6: $ipv6 "

    [ -z $ipv6 ] && exit
    # curl -X PUT "https://api.cloudflare.com/client/v4/zones/$zone_id/dns_records/$dns_record_id" \
    # -H "X-Auth-Email: $email" \
    # -H "X-Auth-Key: $global_Key" \
    # -H "Content-Type: application/json" \
    # --data '{"type":"AAAA","name":"$dns_record_domain","content":"'"${ipv6}"'","ttl":120,"proxied":false}'

    dns_record=`curl -X PUT "https://api.cloudflare.com/client/v4/zones/$zone_id/dns_records/$dns_record_id" -H "X-Auth-Email: $email" -H "X-Auth-Key: $global_Key" -H "Content-Type: application/json" --data '{"type":"AAAA","name":"'"\${dns_record_domain}"'","content":"'"\${ipv6}"'","ttl":120,"proxied":false}'`

    echo "ipv6: $ipv6 dns_record: $dns_record ";
}


case "$1" in
    get_zone_info)
        get_zone_info
        ;;
    get_dns_record_info)
        get_dns_record_info
        ;;
    set_dns_record)
        set_dns_record
        ;;
    *)
        echo "Usage: "
        echo "        sh $0 get_zone_info"
        echo "        sh $0 get_dns_record_info"
        echo "        sh $0 set_dns_record"
        exit 1
        ;;
esac

# crontab -e

# 0/2 * * * * /etc/ipv6-ddns.sh set_dns_record > /var/log/ipv6-ddns.log 2>&1
