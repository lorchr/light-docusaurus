## Spring Boot 快速实现 IP地址解析

作者：慕歌
链接：https://juejin.cn/post/7130544273421762573

引入：

如果使用本地ip 解析的话，我们将会借助ip2region，该项目维护了一份较为详细的本地ip 地址对应表，如果为了离线环境的使用，需要导入该项目依赖，并指定版本，不同版本的方法可能存在差异。
```xml
<!-- ip库 -->
<dependency>
  <groupId>org.lionsoul</groupId>
  <artifactId>ip2region</artifactId>
  <version>2.6.3</version>
</dependency>
```
官方gitee：gitee.com/lionsoul/ip2region

开发：

在使用时需要将 xdb 文件下载到工程文件目录下，使用ip2region即使是完全基于 xdb 文件的查询，单次查询响应时间在十微秒级别，可通过如下两种方式开启内存加速查询：

vIndex 索引缓存 ：使用固定的 512KiB 的内存空间缓存 vector index 数据，减少一次 IO 磁盘操作，保持平均查询效率稳定在10-20微秒之间。
xdb 整个文件缓存：将整个 xdb 文件全部加载到内存，内存占用等同于 xdb 文件大小，无磁盘 IO 操作，保持微秒级别的查询效率。

```java
/**
 * ip查询
 */
@Slf4j
public class IPUtil {

    private static final String UNKNOWN = "unknown";

    protected IPUtil(){ }

    /**
     * 获取 IP地址
     * 使用 Nginx等反向代理软件， 则不能通过 request.getRemoteAddr()获取 IP地址
     * 如果使用了多级反向代理的话，X-Forwarded-For的值并不止一个，而是一串IP地址，
     * X-Forwarded-For中第一个非 unknown的有效IP字符串，则为真实IP地址
     */
    public static String getIpAddr(HttpServletRequest request) {
        String ip = request.getHeader("x-forwarded-for");
        if (ip == null || ip.length() == 0 || UNKNOWN.equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || UNKNOWN.equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || UNKNOWN.equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return "0:0:0:0:0:0:0:1".equals(ip) ? "127.0.0.1" : ip;
    }

    public static  String getAddr(String ip){
        String dbPath = "src/main/resources/ip2region/ip2region.xdb";
        // 1、从 dbPath 加载整个 xdb 到内存。
        byte[] cBuff;
        try {
            cBuff = Searcher.loadContentFromFile(dbPath);
        } catch (Exception e) {
            log.info("failed to load content from `%s`: %s\n", dbPath, e);
            return null;
        }

        // 2、使用上述的 cBuff 创建一个完全基于内存的查询对象。
        Searcher searcher;
        try {
            searcher = Searcher.newWithBuffer(cBuff);
        } catch (Exception e) {
           log.info("failed to create content cached searcher: %s\n", e);
            return null;
        }
        // 3、查询
        try {
            String region = searcher.searchByStr(ip);
            return region;
        } catch (Exception e) {
            log.info("failed to search(%s): %s\n", ip, e);
        }
        return null;
    }
}
```
这里我们将ip 解析封装成一个工具类，包含获取IP和ip 地址解析两个方法，ip 的解析可以在请求中获取。获取到ip后，需要根据ip ，在xdb 中查找对应的IP地址的解析，由于是本地数据库可能存在一定的缺失，部分ip 存在无法解析的情况。

专属福利
👉点击领取：651页Java面试题库

在线解析:

如果想要获取更加全面的ip 地址信息，可使用在线数据库，这里提供的是 whois.pconline.com  的IP解析，该IP解析在我的使用过程中表现非常流畅，而且只有少数的ip 存在无法解析的情况。
```java
@Slf4j
public class AddressUtils {
    // IP地址查询
    public static final String IP_URL = "http://whois.pconline.com.cn/ipJson.jsp";

    // 未知地址
    public static final String UNKNOWN = "XX XX";

    public static String getRealAddressByIP(String ip) {
        String address = UNKNOWN;
        // 内网不查询
        if (IpUtils.internalIp(ip)) {
            return "内网IP";
        }
        if (true) {
            try {
                String rspStr = sendGet(IP_URL, "ip=" + ip + "&json=true" ,"GBK");
                if (StrUtil.isEmpty(rspStr)) {
                    log.error("获取地理位置异常 {}" , ip);
                    return UNKNOWN;
                }
                JSONObject obj = JSONObject.parseObject(rspStr);
                String region = obj.getString("pro");
                String city = obj.getString("city");
                return String.format("%s %s" , region, city);
            } catch (Exception e) {
                log.error("获取地理位置异常 {}" , ip);
            }
        }
        return address;
    }

    public static String sendGet(String url, String param, String contentType) {
        StringBuilder result = new StringBuilder();
        BufferedReader in = null;
        try {
            String urlNameString = url + "?" + param;
            log.info("sendGet - {}" , urlNameString);
            URL realUrl = new URL(urlNameString);
            URLConnection connection = realUrl.openConnection();
            connection.setRequestProperty("accept" , "*/*");
            connection.setRequestProperty("connection" , "Keep-Alive");
            connection.setRequestProperty("user-agent" , "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;SV1)");
            connection.connect();
            in = new BufferedReader(new InputStreamReader(connection.getInputStream(), contentType));
            String line;
            while ((line = in.readLine()) != null) {
                result.append(line);
            }
            log.info("recv - {}" , result);
        } catch (ConnectException e) {
            log.error("调用HttpUtils.sendGet ConnectException, url=" + url + ",param=" + param, e);
        } catch (SocketTimeoutException e) {
            log.error("调用HttpUtils.sendGet SocketTimeoutException, url=" + url + ",param=" + param, e);
        } catch (IOException e) {
            log.error("调用HttpUtils.sendGet IOException, url=" + url + ",param=" + param, e);
        } catch (Exception e) {
            log.error("调用HttpsUtil.sendGet Exception, url=" + url + ",param=" + param, e);
        } finally {
            try {
                if (in != null) {
                    in.close();
                }
            } catch (Exception ex) {
                log.error("调用in.close Exception, url=" + url + ",param=" + param, ex);
            }
        }
        return result.toString();
    }
}
```
场景：

那么在开发的什么流程获取ip 地址是比较合适的，这里就要用到我们的拦截器了。拦截进入服务的每个请求，进行前置操作，在进入时就完成请求头的解析，ip 获取以及ip 地址解析，这样在后续流程的全环节，都可以复用ip 地址等信息。

```java
/**
 * 对ip 进行限制，防止IP大量请求
 */
@Slf4j
@Configuration
public class IpUrlLimitInterceptor implements HandlerInterceptor{

    @Override
    public boolean preHandle(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o) {

        //更新全局变量
        Constant.IP = IPUtil.getIpAddr(httpServletRequest);
        Constant.IP_ADDR = AddressUtils.getRealAddressByIP(Constant.IP);
        Constant.URL = httpServletRequest.getRequestURI();
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o, ModelAndView modelAndView) {
        //通过本地获取
//        获得ip
//        String ip = IPUtil.getIpAddr(httpServletRequest);
        //解析具体地址
//        String addr = IPUtil.getAddr(ip);

        //通过在线库获取
//        String ip = IpUtils.getIpAddr(httpServletRequest);
//        String ipaddr = AddressUtils.getRealAddressByIP(ipAddr);
//        log.info("IP >> {},Address >> {}",ip,ipaddr);
    }

    @Override
    public void afterCompletion(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o, Exception e) {

    }
}
```
如果想要执行我们的ip 解析拦截器，

需要在spring boot的视图层进行拦截才会触发我们的拦截器。

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Autowired
    IpUrlLimitInterceptor ipUrlLimitInterceptor;
  
      //执行ip拦截器
    @Override
    public void addInterceptors(InterceptorRegistry registry){
        registry.addInterceptor(ipUrlLimitInterceptor)
                // 拦截所有请求
                .addPathPatterns("/**");
    }
}
```
