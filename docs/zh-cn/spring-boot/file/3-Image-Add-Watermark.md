- [](https://csdn.net/qq_26383975/article/details/125996277)
- [Java实现添加文字水印、图片水印功能实战](https://mp.weixin.qq.com/s/Q3mea4QBRZ8ckn6u2uZaHg)

本文介绍java实现在图片上加文字水印的方法，水印可以是图片或者文字，操作方便。

java实现给图片添加水印实现步骤：

（1）获取原图片对象信息（本地图片或网络图片）
（2）添加水印（设置水印颜色、字体、坐标等）
（3）处理输出目标图片

# java实现给图片添加文字水印

## 1. 获取原图片对象信息

第一步：获取需要处理的图片

获取图片的方式，通常由两种：
一种是通过下载到本地，从本地读取（本地图片）；
另外一种是通过网络地址进行读取（网络图片）

### 1.1 读取本地图片

图片
```java
通过代码实现读取本地目录（F:\image\1.png）下图片，代码如下：
// 读取原图片信息 得到文件
File srcImgFile = new File("F:/image/1.png");
//将文件对象转化为图片对象
Image srcImg = ImageIO.read(srcImgFile);
//获取图片的宽
int srcImgWidth = srcImg.getWidth(null);
//获取图片的高
int srcImgHeight = srcImg.getHeight(null);
System.out.println("图片的宽:"+srcImgWidth);
System.out.println("图片的高:"+srcImgHeight);
```
代码效果如下：
图片

### 1.2 读取网络图片
```java
//创建一个URL对象,获取网络图片的地址信息
URL url = new URL("https://pngimg.com/distr/img/ukraine.png");
//将URL对象输入流转化为图片对象 (url.openStream()方法，获得一个输入流)
Image srcImg = ImageIO.read(url.openStream());
//获取图片的宽
int srcImgWidth = srcImg.getWidth(null);
//获取图片的高
int srcImgHeight = srcImg.getHeight(null);
System.out.println("图片的宽:"+srcImgWidth);
System.out.println("图片的高:"+srcImgHeight);
```
代码效果如下：

图片

## 2.添加水印

通过上面的步骤，我们已经获取到了原始图片信息，下面需要创建一个画笔进行水印的添加。水印包含文字水印、图片水印。

画笔可以设置水印颜色、字体大小、字体样式等。
```java
BufferedImage bufImg = new BufferedImage(srcImgWidth, srcImgHeight, BufferedImage.TYPE_INT_RGB);
// 加水印
//创建画笔
Graphics2D g = bufImg.createGraphics();
//srcImg 为上面获取到的原始图片的图片对象
g.drawImage(srcImg, 0, 0, srcImgWidth, srcImgHeight, null);
//根据图片的背景设置水印颜色
g.setColor(new Color(255,255,255,128));
//设置字体  画笔字体样式为微软雅黑，加粗，文字大小为60pt
g.setFont(new Font("微软雅黑", Font.BOLD, 60));
//设置水印的坐标
//int x=200;
//int y=200;
int x=(srcImgWidth - getWatermarkLength(waterMarkContent, g)) / 2;
int y=srcImgHeight / 2;
//画出水印 第一个参数是水印内容，第二个参数是x轴坐标，第三个参数是y轴坐标
g.drawString("图片来源：https://image.baidu.com/", x, y);
g.dispose();
```

getWatermarkLength方法用于计算水印内容的长度：
```java
    /**
     * 获取水印文字的长度
     * @param waterMarkContent
     * @param g
     * @return
     */
    public static int getWatermarkLength(String waterMarkContent, Graphics2D g) {
        return g.getFontMetrics(g.getFont()).charsWidth(waterMarkContent.toCharArray(), 0, waterMarkContent.length());
    }
```

### Font 字体说明：

Font 类的构造函数为：`public Font(String familyName, int style, int size)`
参数说明：第一个参数为字体类型，第二个参数为字体风格，第三个参数为字体大小
字体的风格有：

- Font.PLAIN（普通）
- Font.BOLD（加粗）
- Font.ITALIC（斜体）
- Font.BOLD+Font.ITALIC（粗斜体）

size字体大小 默认单位是pt(磅)，数字越大，字就越大

需要注意是 水印坐标位置。设置不当，就看不到水印效果。

### 如何确定水印位置 ？

方法一：设置固定值

1. 首先，我们要知道图片上的坐标的表示法。具体如下：
2. 将图片保存到本地，然后选中图片点击右键，编辑，选择“画图”软件打开
3. 将鼠标移动到想要添加水印的位置，左下角可以看到鼠标点击位置对应的坐标值，拿到这个坐标值写入程序即可

方法二：根据原图大小进行设置，如放置在原图的中间位置

- x轴坐标：(原始图的宽度 - 水印的宽度) / 2
- y轴坐标：(原始图的高度 - 水印的高度) / 2

## 3. 获取目标图片

经过上面的操作后，我们的图片添加文字就已经处理完成了。但他现在还保存在Java对象中。

我们想要看得到效果，需要进行处理，保存图片到本地。
```java
//待存储的地址
String tarImgPath="F:/image/t.png";
// 输出图片
FileOutputStream outImgStream = new FileOutputStream(tarImgPath);
ImageIO.write(bufImg, "png", outImgStream);
System.out.println("添加水印完成");
outImgStream.flush();
outImgStream.close();
```

执行效果：
执行，目标目录下多了一个t.png的图片：
图片
t.png打开可以看到添加的文字水印，水印添加成功：

图片

## 4.完成代码
```java
package com.example.listdemo.utils;
import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
/**
 * 图片添加水印
 * @author qzz
 */
public class ImageUtils {
    public static void main(String[] args) throws IOException {
        // 读取原图片信息 得到文件（本地图片）
        File srcImgFile = new File("F:/image/1.png");
        //将文件对象转化为图片对象
        Image srcImg = ImageIO.read(srcImgFile);
        //获取图片的宽
        int srcImgWidth = srcImg.getWidth(null);
        //获取图片的高
        int srcImgHeight = srcImg.getHeight(null);
        System.out.println("图片的宽:"+srcImgWidth);
        System.out.println("图片的高:"+srcImgHeight);
        //创建一个URL对象,获取网络图片的地址信息（网络图片）
//        URL url = new URL("https://pngimg.com/distr/img/ukraine.png");
//        //将URL对象输入流转化为图片对象 (url.openStream()方法，获得一个输入流)
//        Image srcImg = ImageIO.read(url.openStream());
//        //获取图片的宽
//        int srcImgWidth = srcImg.getWidth(null);
//        //获取图片的高
//        int srcImgHeight = srcImg.getHeight(null);
//        System.out.println("图片的宽:"+srcImgWidth);
//        System.out.println("图片的高:"+srcImgHeight);
        BufferedImage bufImg = new BufferedImage(srcImgWidth, srcImgHeight, BufferedImage.TYPE_INT_RGB);
        // 加水印
        //创建画笔
        Graphics2D g = bufImg.createGraphics();
        //绘制原始图片
        g.drawImage(srcImg, 0, 0, srcImgWidth, srcImgHeight, null);
        //-------------------------文字水印 start----------------------------
        //根据图片的背景设置水印颜色
        g.setColor(new Color(255,255,255,128));
        //设置字体  画笔字体样式为微软雅黑，加粗，文字大小为60pt
        g.setFont(new Font("微软雅黑", Font.BOLD, 60));
        //水印内容
        String waterMarkContent="图片来源：https://image.baidu.com/";
        //设置水印的坐标(为原图片中间位置)
        int x=(srcImgWidth - getWatermarkLength(waterMarkContent, g)) / 2;
        int y=srcImgHeight / 2;
        //画出水印 第一个参数是水印内容，第二个参数是x轴坐标，第三个参数是y轴坐标
        g.drawString(waterMarkContent, x, y);
        g.dispose();
        //-------------------------文字水印 end----------------------------
        //待存储的地址
        String tarImgPath="F:/image/t.png";
        // 输出图片
        FileOutputStream outImgStream = new FileOutputStream(tarImgPath);
        ImageIO.write(bufImg, "png", outImgStream);
        System.out.println("添加水印完成");
        outImgStream.flush();
        outImgStream.close();
    }
    
    /**
     * 获取水印文字的长度
     * @param waterMarkContent
     * @param g
     * @return
     */
    public static int getWatermarkLength(String waterMarkContent, Graphics2D g) {
        return g.getFontMetrics(g.getFont()).charsWidth(waterMarkContent.toCharArray(), 0, waterMarkContent.length());
    }
}
```

# java实现给图片添加图片水印

下载水印图片到本地：

## 1. 添加图片水印方法：

```java
// 水印文件
String waterMarkImage="F:/image/s.png";
Image srcWaterMark = ImageIO.read(new File(waterMarkImage));
//获取水印图片的宽度
int widthWaterMark= srcWaterMark.getWidth(null);
//获取水印图片的高度
int heightWaterMark = srcWaterMark.getHeight(null);
//设置 alpha 透明度：alpha 必须是范围 [0.0, 1.0] 之内（包含边界值）的一个浮点数字
g.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_ATOP, 0.9f));
//绘制水印图片  坐标为中间位置
g.drawImage(srcWaterMark, (srcImgWidth - widthWaterMark) / 2,
        (srcImgHeight - heightWaterMark) / 2, widthWaterMark, heightWaterMark, null);
// 水印文件结束
g.dispose();
```

## 2. 完成代码

```java
package com.example.listdemo.utils;
import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
/**
 * 图片添加水印
 * @author qzz
 */
public class ImageUtils {
    public static void main(String[] args) throws IOException {
        // 读取原图片信息 得到文件（本地图片）
        File srcImgFile = new File("F:/image/1.png");
        //将文件对象转化为图片对象
        Image srcImg = ImageIO.read(srcImgFile);
        //获取图片的宽
        int srcImgWidth = srcImg.getWidth(null);
        //获取图片的高
        int srcImgHeight = srcImg.getHeight(null);
        System.out.println("图片的宽:"+srcImgWidth);
        System.out.println("图片的高:"+srcImgHeight);
        //创建一个URL对象,获取网络图片的地址信息（网络图片）
//        URL url = new URL("https://pngimg.com/distr/img/ukraine.png");
//        //将URL对象输入流转化为图片对象 (url.openStream()方法，获得一个输入流)
//        Image srcImg = ImageIO.read(url.openStream());
//        //获取图片的宽
//        int srcImgWidth = srcImg.getWidth(null);
//        //获取图片的高
//        int srcImgHeight = srcImg.getHeight(null);
//        System.out.println("图片的宽:"+srcImgWidth);
//        System.out.println("图片的高:"+srcImgHeight);
        BufferedImage bufImg = new BufferedImage(srcImgWidth, srcImgHeight, BufferedImage.TYPE_INT_RGB);
        // 加水印
        //创建画笔
        Graphics2D g = bufImg.createGraphics();
        //绘制原始图片
        g.drawImage(srcImg, 0, 0, srcImgWidth, srcImgHeight, null);
        //-------------------------文字水印 start----------------------------
//        //根据图片的背景设置水印颜色
//        g.setColor(new Color(255,255,255,128));
//        //设置字体  画笔字体样式为微软雅黑，加粗，文字大小为60pt
//        g.setFont(new Font("微软雅黑", Font.BOLD, 60));
//        String waterMarkContent="图片来源：https://image.baidu.com/";
//        //设置水印的坐标(为原图片中间位置)
//        int x=(srcImgWidth - getWatermarkLength(waterMarkContent, g)) / 2;
//        int y=srcImgHeight / 2;
//        //画出水印 第一个参数是水印内容，第二个参数是x轴坐标，第三个参数是y轴坐标
//        g.drawString(waterMarkContent, x, y);
//        g.dispose();
        //-------------------------文字水印 end----------------------------
        //-------------------------图片水印 start----------------------------
        // 水印文件
        String waterMarkImage="F:/image/s.png";
        Image srcWaterMark = ImageIO.read(new File(waterMarkImage));
        //获取水印图片的宽度
        int widthWaterMark= srcWaterMark.getWidth(null);
        //获取水印图片的高度
        int heightWaterMark = srcWaterMark.getHeight(null);
        //设置 alpha 透明度：alpha 必须是范围 [0.0, 1.0] 之内（包含边界值）的一个浮点数字
        g.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_ATOP, 0.9f));
        //绘制水印图片  坐标为中间位置
        g.drawImage(srcWaterMark, (srcImgWidth - widthWaterMark) / 2,
                (srcImgHeight - heightWaterMark) / 2, widthWaterMark, heightWaterMark, null);
        // 水印文件结束
        g.dispose();
        //-------------------------图片水印 end----------------------------
        //待存储的地址
        String tarImgPath="F:/image/t.png";
        // 输出图片
        FileOutputStream outImgStream = new FileOutputStream(tarImgPath);
        ImageIO.write(bufImg, "png", outImgStream);
        System.out.println("添加水印完成");
        outImgStream.flush();
        outImgStream.close();
    }
    
    /**
     * 获取水印文字的长度
     * @param waterMarkContent
     * @param g
     * @return
     */
    public static int getWatermarkLength(String waterMarkContent, Graphics2D g) {
        return g.getFontMetrics(g.getFont()).charsWidth(waterMarkContent.toCharArray(), 0, waterMarkContent.length());
    }
}
```

## 3.代码执行效果
