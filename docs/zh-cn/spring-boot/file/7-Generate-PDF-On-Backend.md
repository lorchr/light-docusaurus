- [服务端自定义生成PDF的几种方案](https://mp.weixin.qq.com/s/IewtFNljKv7-mIvoLcCTsA)

这个文档太复杂了，还要导出pdf？

废话不多说直接进入正题，首先分析生成pdf场景及生成内容，考虑复用性和维护难度是我们当前开发工作的第一要务！

下面是调研的几个主要方案：

## 一、itext 表单填充
使用方式：

itext表单填充方案是以pdf作为基础模板，通过在pdf中嵌入表单元素组件的方式（需要使用pdf编辑工具），最后由程序进行数据填充并另存为pdf结果。

方案优缺点：

- 优点：代码优雅，生成后格式变化影响极小。
- 缺点：原始模板变化需要重新生成pdf，重新编辑表单元素；不支持列表填充数据。

## 二、freemarker + doc4J 基于Word 生成 PDF
使用方式：

首先将调整好格式的原始 word 导出为 XML 格式，编辑 XML 模板中需要填充元素的位置，最后由程序处理先由freemarker模板工具替换元素内容，再使用doc4J进行pdf导出。

方案优缺点：

- 优点：通用性强，基于模板引擎功能强大。
- 缺点：XML 格式的word真的有够复杂，想要在此模板上调整样式真的难上加难；由于系统不支持的原因需要导入中文字体库；doc4J 部分 doc 元素不支持（例如直线），导出格式差异较大。

这可能是由于doc4J迭代问题无法保证新元素的支持，导出结果比较奔放。。。

## 三、freemarker + aspose-words 导出PDF
使用方式：

类似于 freemarker+doc4J 方式，同样需要编辑XML，导出格式相较doc4J而言有极大提升。

方案优缺点：

- 优点：通用性强，基于模板引擎功能强大，无需手工管理字体（macOS），代码简单，导出格式与模板基本无差异。
- 缺点：需要编辑 XML 模板；该方案不是免费版（当然有大神）。

受限于调试前期需要的修修改改，模板能给人整吐了，所以才有了下一个方案。

## 四、html + freemarker + itextpdf（html2pdf）
使用方式：

翻译 word 为 html 页面（当然就是手写啦，还原度很重要！），html中模板元素插入（文字填充、列表循环 freemarker 支持的全都能写），最后由程序处理先由freemarker模板工具替换元素内容，再使用html2pdf进行pdf导出。

方案优缺点：

- 优点：可维护性相较与上面方案都有极大提升（调试可见性，动态替换生效）；通用性强，基于模板引擎功能强大；导出格式可控性较强；
- 缺点：需要中文字体库。
这个方案是综合以上多次踩坑的结果，结果是显而易见的。

浅浅来一点代码，省的大家到处找
```xml
<dependencies>
    <dependency>
        <groupId>com.itextpdf</groupId>
        <artifactId>itextpdf</artifactId>
        <version>5.5.13</version>
    </dependency>
    <dependency>
        <groupId>com.itextpdf</groupId>
        <artifactId>html2pdf</artifactId>
        <version>3.0.3</version>
    </dependency>
    <dependency>
        <groupId>org.xhtmlrenderer</groupId>
        <artifactId>flying-saucer-pdf-itext5</artifactId>
        <version>9.0.3</version>
    </dependency>
    <dependency>
        <groupId>binarta.oss</groupId>
        <artifactId>groovy-template-enginex-freemarker</artifactId>
        <version>0.1.3</version>
    </dependency>
<dependencies>
```

个人以为自己的代码会自解释，就不贴太多注释了图片

```java
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.map.MapUtil;
import com.google.common.collect.Lists;
import com.itextpdf.text.pdf.BaseFont;
import freemarker.cache.ByteArrayTemplateLoader;
import freemarker.template.Configuration;
import freemarker.template.Template;
import lombok.SneakyThrows;
import org.xhtmlrenderer.pdf.ITextFontResolver;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.BufferedWriter;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.StringWriter;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.function.Supplier;

public class HtmlToPdfUtil {

    private static final ByteArrayTemplateLoader TEMPLATE_LOADER = new ByteArrayTemplateLoader();

    // 导入需要字体库的位置哦；simsun 为 宋体
    public static final String FRONT_PATH = "/usr/share/fonts/simsun.ttc";

    /**
     * 看明白的话只用这个方法就够
     */
    public static ByteArrayOutputStream htmlToPdf(String templateName, Supplier<byte[]> loadTemplateSupplier, Map<String, Object> modeViewMap) {

        String html = xmlFormat(templateName, loadTemplateSupplier, modeViewMap);

        return htmlToPdf(html);
    }

    @SneakyThrows
    public static ByteArrayOutputStream htmlToPdf(String htmlStr) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ITextRenderer renderer = new ITextRenderer();
        renderer.setDocumentFromString(htmlStr);
        ITextFontResolver resolver = renderer.getFontResolver();
        //添加字体，解决中文不显示的问题
        resolver.addFont(FRONT_PATH, BaseFont.IDENTITY_H, BaseFont.NOT_EMBEDDED);
        renderer.layout();
        renderer.createPDF(outputStream);
        return outputStream;
    }


    public static String xmlFormat(String templateName, Supplier<byte[]> loadTemplateSupplier, Map<String, Object> modeViewMap) {
        if (Objects.isNull(TEMPLATE_LOADER.findTemplateSource(templateName))) {
            synchronized (TEMPLATE_LOADER) {
                if (Objects.isNull(TEMPLATE_LOADER.findTemplateSource(templateName))) {
                    TEMPLATE_LOADER.putTemplate(templateName, loadTemplateSupplier.get());
                }
            }
        }
        return xmlFormat(templateName, modeViewMap);
    }

    @SneakyThrows
    public static String xmlFormat(String templateName, Map<String, Object> modeViewMap) {
        Configuration cfg = new Configuration(Configuration.DEFAULT_INCOMPATIBLE_IMPROVEMENTS);
        // 指定FreeMarker模板文件的位置
        cfg.setTemplateLoader(TEMPLATE_LOADER);
        // 设置模板的编码格式
        cfg.setEncoding(Locale.CHINA, Charset.defaultCharset().name());
        // 获取模板文件 template
        Template template = cfg.getTemplate(templateName, Charset.defaultCharset().name());
        StringWriter stringWriter = new StringWriter();

        BufferedWriter writer = new BufferedWriter(stringWriter);
        template.process(modeViewMap, writer);
        return stringWriter.toString();
    }

}
```

## 结
解决这个问题的核心思路方案其实一直没变，变化的只是工具，一定要思路清晰！
