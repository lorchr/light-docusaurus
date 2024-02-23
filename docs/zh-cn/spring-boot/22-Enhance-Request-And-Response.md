
## 前言

## 基于过滤器实现请求响应的增强

### `Filter` 拦截请求
```java
import com.light.cloud.common.web.enhance.EnhanceHandler;
import com.light.cloud.common.web.enhance.EnhanceHandlerProxy;
import com.light.cloud.common.web.enhance.RequestWrapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 请求增强过滤器 <p>
 * <ul>
 *     <li>1. 拦截请求，并处理</li>
 * </ul>
 */
@Slf4j
public class RequestEnhanceFilter extends OncePerRequestFilter {

    private final EnhanceHandlerProxy enhanceHandlerProxy;

    public RequestEnhanceFilter(List<EnhanceHandler> enhanceHandlers) {
        this.enhanceHandlerProxy = new EnhanceHandlerProxy(enhanceHandlers);
    }

    /**
     * 对请求进行增强
     *
     * @param request     请求对象
     * @param response    响应对象
     * @param filterChain 过滤器链
     * @throws ServletException
     * @throws IOException
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        // 包装请求 响应对象，方便获取参数
        ContentCachingRequestWrapper requestWrapper = request instanceof ContentCachingRequestWrapper ?
                (ContentCachingRequestWrapper) request : new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper responseWrapper = response instanceof ContentCachingResponseWrapper ?
                (ContentCachingResponseWrapper) response : new ContentCachingResponseWrapper(response);
        // 再次包装请求对象
        RequestWrapper wrapperRequest = new RequestWrapper(requestWrapper);

        // 请求预处理
        Map<String, Object> context = new HashMap<>();
        context.put(EnhanceHandler.CONTEXT_KEY_URL, request.getRequestURL());
        context.put(EnhanceHandler.CONTEXT_KEY_URI, request.getRequestURI());
        enhanceHandlerProxy.preHandle(wrapperRequest, context);

        // 执行目标方法
        filterChain.doFilter(wrapperRequest, responseWrapper);

        // 写回响应值
        byte[] contentAsByteArray = responseWrapper.getContentAsByteArray();
        // Note: 此处需要使用原始的 HttpServletResponse 对象，不能使用 Wrapper的对象，否则会导致响应值丢失
        ServletOutputStream outputStream = response.getOutputStream();
        outputStream.write(contentAsByteArray);
        outputStream.flush();
        outputStream.close();

        // 请求后处理
        enhanceHandlerProxy.postHandle(responseWrapper, context);
    }

}
```

### `RequestWrapper` 包装请求，可以多次读取 `InputStream`
```java
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.MediaType;
import org.springframework.web.util.ContentCachingRequestWrapper;

import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Enumeration;
import java.util.Map;

/**
 * 请求缓存对象，方便多次读取请求中的参数 <p>
 * <p>
 * 1. {@link ContentCachingRequestWrapper}可以直接缓存请求URL上的参数，即 {@link ContentCachingRequestWrapper#getParameterMap()}<p>
 * 2. 由于请求体Body中的参数是流式传输，{@link ContentCachingRequestWrapper}无法直接缓存，必须是在{@link ContentCachingRequestWrapper#inputStream}的内容使用过后才能缓存,
 * 下次需要再使用body只能使用此方法{@link ContentCachingRequestWrapper#getContentAsByteArray()}才能再次获取body中的值。<p>
 * 3. 在一些场景下（过滤器，拦截器），需要在请求之前获取请求体中的参数，所以需要单独使用此类来进行解析缓存。<p>
 *
 * @see {@link ContentCachingRequestWrapper}
 */
@Slf4j
public class RequestWrapper extends HttpServletRequestWrapper {

    private final String body;

    public RequestWrapper(HttpServletRequest request) {
        super(request);
        this.body = parseStringBody(request);
    }

    // region implements ServletRequest
    @Override
    public ServletInputStream getInputStream() throws IOException {
        final ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(body.getBytes(StandardCharsets.UTF_8));
        ServletInputStream servletInputStream = new ServletInputStream() {
            @Override
            public int read() throws IOException {
                return byteArrayInputStream.read();
            }

            @Override
            public boolean isFinished() {
                return false;
            }

            @Override
            public boolean isReady() {
                return false;
            }

            @Override
            public void setReadListener(ReadListener listener) {

            }
        };
        return servletInputStream;
    }

    @Override
    public BufferedReader getReader() throws IOException {
        return new BufferedReader(new InputStreamReader(this.getInputStream()));
    }

    @Override
    public String getParameter(String name) {
        return super.getParameter(name);
    }

    @Override
    public Map<String, String[]> getParameterMap() {
        return super.getParameterMap();
    }

    @Override
    public Enumeration<String> getParameterNames() {
        return super.getParameterNames();
    }

    @Override
    public String[] getParameterValues(String name) {
        return super.getParameterValues(name);
    }

    // endregion

    public String getBody() {
        return this.body;
    }

    public byte[] getContentAsByteArray() {
        return this.body.getBytes(StandardCharsets.UTF_8);
    }

    /**
     * 解析请求的body
     */
    private String parseStringBody(ServletRequest request) {
        if (!shouldParse(request)) {
            return null;
        }
        try (
                InputStream inputStream = request.getInputStream();
                InputStreamReader inputStreamReader = new InputStreamReader(inputStream, StandardCharsets.UTF_8);
                BufferedReader bufferedReader = new BufferedReader(inputStreamReader);
        ) {
            StringBuilder builder = new StringBuilder();
            char[] buffer = new char[512];
            int len = 0;
            while ((len = bufferedReader.read(buffer)) > 0) {
                builder.append(buffer, 0, len);
            }
            return builder.toString();
        } catch (IOException e) {
            log.error("读取请求参数失败!", e);
        }
        return null;
    }

    /**
     * 解析请求的body
     */
    private byte[] parseBytesBody(ServletRequest request) {
        if (!shouldParse(request)) {
            return null;
        }
        try (
                InputStream inputStream = request.getInputStream();
                BufferedInputStream bufferedInputStream = new BufferedInputStream(inputStream);
                ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        ) {
            byte[] buffer = new byte[1024];
            int len = 0;
            while ((len = bufferedInputStream.read(buffer)) > 0) {
                byteArrayOutputStream.write(buffer, 0, len);
            }
            return byteArrayOutputStream.toByteArray();
        } catch (IOException e) {
            log.error("读取请求参数失败!", e);
        }
        return null;
    }

    private boolean shouldParse(ServletRequest request) {
        String contentType = request.getContentType();
        if (StringUtils.isNotBlank(contentType)) {
            try {
                MediaType mediaType = MediaType.parseMediaType(contentType);
                return MediaType.APPLICATION_JSON.includes(mediaType);
            } catch (IllegalArgumentException ex) {
            }
        }
        return false;
    }

}
```

### `ResponseWrapper` 包装响应，可以多次读取 `OutputStream`
```java
import lombok.extern.slf4j.Slf4j;

import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.WriteListener;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.Charset;
import java.util.Objects;

@Slf4j
public class ResponseWrapper extends HttpServletResponseWrapper {
    private ByteArrayOutputStream byteArrayOutputStream;

    private ServletOutputStream servletOutputStream;

    private PrintWriter printWriter;

    public ResponseWrapper(HttpServletResponse response) {
        super(response);
        this.byteArrayOutputStream = new ByteArrayOutputStream();
        this.servletOutputStream = newServletOutputStream(byteArrayOutputStream);
        this.printWriter = newPrintWriter(byteArrayOutputStream);
    }

    @Override
    public ServletOutputStream getOutputStream() throws IOException {
        return servletOutputStream;
    }

    @Override
    public PrintWriter getWriter() throws IOException {
        return printWriter;
    }

    @Override
    public void flushBuffer() throws IOException {
        if (Objects.isNull(servletOutputStream)) {
            try {
                servletOutputStream.flush();
            }catch (Exception e) {
                log.error("ResponseWrapper flushBuffer error", e);
            }
        }
        if (Objects.isNull(printWriter)) {
            printWriter.flush();
        }
    }

    @Override
    public void reset() {
        byteArrayOutputStream.reset();
    }

    public String getResponseData(Charset charset) throws IOException {
        return new String(getContent(), charset);
    }

    public byte[] getContent() throws IOException {
        flushBuffer();
        return byteArrayOutputStream.toByteArray();
    }

    public ServletOutputStream newServletOutputStream(ByteArrayOutputStream byteArrayOutputStream) {
        return new ServletOutputStream() {
            @Override
            public boolean isReady() {
                return false;
            }

            @Override
            public void setWriteListener(WriteListener listener) {

            }

            @Override
            public void write(int b) throws IOException {
                byteArrayOutputStream.write(b);
            }
        };
    }

    public PrintWriter newPrintWriter(ByteArrayOutputStream byteArrayOutputStream) {
        OutputStream outputStream = new OutputStream() {
            @Override
            public void write(int b) throws IOException {
                byteArrayOutputStream.write(b);
            }
        };
        return new PrintWriter(new OutputStreamWriter(outputStream));
    }
}
```

### `EnhanceHandler` 请求响应实际增强处理器
```java
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;

import java.util.Map;

public interface EnhanceHandler extends Ordered {

    /**
     * 请求的URL
     */
    String CONTEXT_KEY_URL = "url";
    
    /**
     * 接口的URI
     */
    String CONTEXT_KEY_URI = "uri";

    /**
     * 判断是否匹配当前的请求，对其做增强
     *
     * @param request http请求对象
     * @return
     */
    boolean matches(HttpServletRequest request);

    /**
     * 预处理方法
     *
     * @param request http请求对象
     * @param context 处理器上下文
     */
    void preHandle(HttpServletRequest request, Map<String, Object> context);

    /**
     * 后处理方法
     *
     * @param response http响应对象
     * @param context  处理器上下文
     */
    void postHandle(HttpServletResponse response, Map<String, Object> context);

}
```

```java
import com.google.common.collect.Lists;
import com.light.cloud.common.core.tool.JsonTool;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.PathMatcher;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Slf4j
public class DemoEnhanceHandler implements EnhanceHandler {

    private final Integer ORDER = 100;

    private final PathMatcher pathMatcher = new AntPathMatcher();

    public final List<String> matchUris = Lists.newArrayList("/demo/**");

    @Override
    public boolean matches(HttpServletRequest request) {
        String url = request.getServletPath();
        String pathInfo = request.getPathInfo();
        if (pathInfo != null) {
            url = StringUtils.isNotEmpty(url) ? url + pathInfo : pathInfo;
        }
        for (String uri : matchUris) {
            if (pathMatcher.match(uri, url)) {
                return true;
            }
        }
        return false;
    }

    @Override
    public void preHandle(HttpServletRequest request, Map<String, Object> context) {
        RequestWrapper requestWrapper = (RequestWrapper) request;
        Map<String, String[]> parameterMap = requestWrapper.getParameterMap();
        String body = requestWrapper.getBody();
        log.info(">>>>>>>>>> Pre handler. Parse request: {param: {}, body: {}}",
                JsonTool.beanToJson(parameterMap), body);
    }

    @Override
    public void postHandle(HttpServletResponse response, Map<String, Object> context) {
        ContentCachingResponseWrapper responseWrapper = (ContentCachingResponseWrapper) response;
        byte[] contentAsByteArray = responseWrapper.getContentAsByteArray();
        String body = new String(contentAsByteArray, StandardCharsets.UTF_8);
        log.info("<<<<<<<<<< Post handler. Parse response: {body: {}}", body);
    }

    @Override
    public int getOrder() {
        return ORDER;
    }
}
```

### `EnhanceHandlerProxy` 处理器代理，方便扩展处理器
```java
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.List;
import java.util.Map;

public class EnhanceHandlerProxy {

    private List<EnhanceHandler> enhanceHandlers;

    public EnhanceHandlerProxy(List<EnhanceHandler> enhanceHandlers) {
        this.enhanceHandlers = enhanceHandlers;
    }

    /**
     * 预处理流程，正序遍历各处理器
     *
     * @param request http请求对象
     * @param context 处理器上下文
     */
    public void preHandle(HttpServletRequest request, Map<String, Object> context) {
        for (int i = 0; i < enhanceHandlers.size(); i++) {
            EnhanceHandler handler = enhanceHandlers.get(i);
            if (handler.matches(request)) {
                // 记录是否已经处理过
                context.put(this.getClass().getName(), Boolean.TRUE);
                handler.preHandle(request, context);
            }
        }
    }

    /**
     * 后处理流程，倒序遍历各处理器
     *
     * @param response http响应对象
     * @param context  处理器上下文
     */
    public void postHandle(HttpServletResponse response, Map<String, Object> context) {
        for (int i = enhanceHandlers.size() - 1; i >= 0; i--) {
            EnhanceHandler handler = enhanceHandlers.get(i);
            // 执行了预处理的必须执行后处理
            if (Boolean.TRUE.equals(context.getOrDefault(handler.getClass().getName(), Boolean.FALSE))) {
                handler.postHandle(response, context);
            }
        }
    }
}
```

## 基于拦截器实现请求响应的增强

### `RequestBodyAdvice` 请求体增强
```java
import com.light.cloud.common.core.crypto.AESTool;
import com.light.cloud.common.core.crypto.Base64Tool;
import com.light.cloud.common.core.crypto.RSATool;
import com.light.cloud.common.core.enums.AlgorithmEnum;
import com.light.cloud.common.core.exception.BizException;
import com.light.cloud.common.core.tool.JsonTool;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.MapUtils;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.RequestBodyAdviceAdapter;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * 请求前处理器
 * <p>
 * 在执行目标方法之前执行，例如：参数解密，方法增强等
 *
 * @see org.springframework.web.servlet.mvc.method.annotation.RequestResponseBodyAdviceChain
 * @see org.springframework.web.servlet.mvc.method.annotation.RequestBodyAdvice
 * @see org.springframework.web.servlet.mvc.method.annotation.RequestBodyAdviceAdapter
 * @see org.springframework.web.servlet.mvc.method.annotation.JsonViewRequestBodyAdvice
 */
@Slf4j
@RestControllerAdvice
public class CustomRequestBodyAdvice extends RequestBodyAdviceAdapter {

    public static final String ENCRYPT = "Encrypt";
    public static final String BASE64 = "base64";

    /**
     * 该方法用于判断当前请求，是否要执行beforeBodyRead方法
     *
     * @param methodParameter handler方法的参数对象
     * @param targetType      handler方法的参数类型
     * @param converterType   将会使用到的Http消息转换器类类型
     * @return 返回true则会执行beforeBodyRead
     */
    @Override
    public boolean supports(MethodParameter methodParameter, Type targetType, Class<? extends HttpMessageConverter<?>> converterType) {
        /**
         * 返回对象必须是 Message 并且使用了 MappingJackson2HttpMessageConverter
         */
        return MappingJackson2HttpMessageConverter.class.isAssignableFrom(converterType);
    }

    /**
     * 在Http消息转换器执转换，之前执行
     *
     * @param inputMessage  客户端的请求数据
     * @param parameter     handler方法的参数对象
     * @param targetType    handler方法的参数类型
     * @param converterType 将会使用到的Http消息转换器类类型
     * @return 返回 一个自定义的HttpInputMessage
     */
    @Override
    public HttpInputMessage beforeBodyRead(HttpInputMessage inputMessage, MethodParameter parameter, Type targetType, Class<? extends HttpMessageConverter<?>> converterType) throws IOException {
        HttpHeaders headers = inputMessage.getHeaders();
        // 读取请求头，判断请求是否加密
        List<String> encrypt = headers.get(ENCRYPT);
        if (CollectionUtils.isEmpty(encrypt) || StringUtils.isBlank(encrypt.get(0))) {
            return inputMessage;
        }
        // 读取加密的请求体
        byte[] bytes = inputMessage.getBody().readAllBytes();
        String json = new String(bytes);
        Map<String, String> map = JsonTool.jsonToBean(json, Map.class);
        if (MapUtils.isEmpty(map)) {
            return inputMessage;
        }
        byte[] decode = decryptBody(map, encrypt.get(0).toLowerCase());
        if (ArrayUtils.isEmpty(decode)) {
            throw BizException.throwException("非法的请求参数，请求体加密参数的key必须与Header中的加密类型一致！");
        }
        log.warn("decode: {}", new String(decode));

        // 使用解密后的数据，构造新的读取流
        return new HttpInputMessage() {
            @NotNull
            @Override
            public HttpHeaders getHeaders() {
                return headers;
            }

            @NotNull
            @Override
            public InputStream getBody() throws IOException {
                return new ByteArrayInputStream(decode);
            }
        };
    }

    /**
     * 在Http消息转换器执转换，之后执行
     *
     * @param body          转换后的对象
     * @param inputMessage  客户端的请求数据
     * @param parameter     handler方法的参数类型
     * @param targetType    handler方法的参数类型
     * @param converterType 使用的Http消息转换器类类型
     * @return 返回一个新的对象
     */

    @Override
    public Object afterBodyRead(Object body, HttpInputMessage inputMessage, MethodParameter parameter, Type targetType, Class<? extends HttpMessageConverter<?>> converterType) {
        log.info(">>>>>>>>>> afterBodyRead. Parse request: {}", body);
        return body;
    }

    /**
     * 同上，不过这个方法处理的是，body为空的情况
     */
    @Override
    public Object handleEmptyBody(Object body, HttpInputMessage inputMessage, MethodParameter parameter, Type targetType, Class<? extends HttpMessageConverter<?>> converterType) {
        return super.handleEmptyBody(body, inputMessage, parameter, targetType, converterType);
    }

    public byte[] decryptBody(Map<String, String> map, String encrypt) {
        String body = map.get(encrypt);
        if (StringUtils.isBlank(body)) {
            for (Map.Entry<String, String> entry : map.entrySet()) {
                if (encrypt.equals(entry.getKey().toLowerCase())) {
                    body = entry.getValue();
                }
            }
        }
        if (StringUtils.isBlank(body)) {
            return null;
        }
        // 对称加密 非对称加密 Base64编码 等
        if (AlgorithmEnum.AES.getCode().toLowerCase().equals(encrypt)) {
            return AESTool.decrypt(body.getBytes(StandardCharsets.UTF_8), AESTool.DEFAULT_SEED);
        } else if (AlgorithmEnum.RSA.getCode().toLowerCase().equals(encrypt)) {
            return RSATool.privateDecrypt(body, RSATool.DEFAULT_PRIVATE_KEY).getBytes(StandardCharsets.UTF_8);
        } else {
            return Base64Tool.decode(body);
        }
    }

}
```

### `ResponseBodyAdvice` 响应体增强
```java
import com.light.cloud.common.core.crypto.AESTool;
import com.light.cloud.common.core.crypto.Base64Tool;
import com.light.cloud.common.core.crypto.RSATool;
import com.light.cloud.common.core.enums.AlgorithmEnum;
import com.light.cloud.common.core.tool.JsonTool;
import com.light.cloud.common.core.tool.ReflectionTool;
import com.light.cloud.common.web.entity.response.Result;
import lombok.extern.slf4j.Slf4j;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Objects;

/**
 * 请求后处理器
 * <p>
 * 在执行目标方法之后执行，例如：响应加密，方法增强等
 *
 * @see org.springframework.web.servlet.mvc.method.annotation.RequestResponseBodyAdviceChain
 * @see org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice
 * @see org.springframework.web.servlet.mvc.method.annotation.AbstractMappingJacksonResponseBodyAdvice
 * @see org.springframework.web.servlet.mvc.method.annotation.JsonViewResponseBodyAdvice
 */
@Slf4j
@RestControllerAdvice
public class CustomResponseBodyAdvice implements ResponseBodyAdvice<Result<Object>> {

    public static final String ENCRYPT = "Encrypt";

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        /**
         * 返回对象必须是 Message 并且使用了 MappingJackson2HttpMessageConverter
         */
        return MappingJackson2HttpMessageConverter.class.isAssignableFrom(converterType);
    }

    @Override
    public Result<Object> beforeBodyWrite(Result<Object> body, MethodParameter returnType, MediaType selectedContentType, Class<? extends HttpMessageConverter<?>> selectedConverterType, ServerHttpRequest request, ServerHttpResponse response) {
        // 读取请求头，判断请求是否加密
        List<String> encrypt = request.getHeaders().get(ENCRYPT);
        if (CollectionUtils.isEmpty(encrypt) || StringUtils.isBlank(encrypt.get(0))) {
            return body;
        }
        byte[] bytes = encryptBody(body, encrypt.get(0).toLowerCase());
        ReflectionTool.invokeSet("data", body, new String(bytes));
        return body;
    }

    public byte[] encryptBody(Result<Object> result, String encrypt) {
        Object data = result.getData();
        if (Objects.isNull(data)) {
            return null;
        }
        String json = JsonTool.beanToJson(data);
        // 对称加密 非对称加密 Base64编码 等
        if (AlgorithmEnum.AES.getCode().toLowerCase().equals(encrypt)) {
            return AESTool.decrypt(json.getBytes(StandardCharsets.UTF_8), AESTool.DEFAULT_SEED);
        } else if (AlgorithmEnum.RSA.getCode().toLowerCase().equals(encrypt)) {
            return RSATool.privateEncrypt(json, RSATool.DEFAULT_PRIVATE_KEY).getBytes(StandardCharsets.UTF_8);
        } else {
            return Base64Tool.encode(json);
        }
    }

}
```

如果有自定义注解来处理参数或响应值的，拦截器的方式并不适用，因为在解析注解时参数还没有解析出来或者已经加密过了，使用过滤器的实现更为适合。

## 总结

从 `HttpServletRequest` 的生命周期可知，请求会先经过一层层的过滤器 `Filter`，再到达 `Servlet`，在Spring MVC中即 `DispatcherServlet`，然后到达一系列的拦截器 `Interceptor` `Resolver`来就行校验及参数的转换等，然后到达真正的 `Handler`。

所以`Filter`的实现更加高效，特别是在一些有明确终结条件的场景下，如权限校验，接口分流；拦截器的实现在参数请求到达`Handler`的末段，适合做一些通用的处理场景，如日志记录，加解密等。