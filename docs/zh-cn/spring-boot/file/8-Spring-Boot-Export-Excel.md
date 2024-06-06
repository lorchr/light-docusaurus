- [业务让我实现一个排队导出功能](https://juejin.cn/post/7259249904777838629)
- [多人同时导出 Excel 干崩服务器！新来的大佬给出的解决方案太优雅了！](https://mp.weixin.qq.com/s/uZGSodm3hG6VQUJUDiKL3Q)

## 前言
业务诉求：考虑到数据库数据日渐增多，导出会有全量数据的导出，多人同时导出可以会对服务性能造成影响，导出涉及到mysql查询的io操作，还涉及文件输入、输出流的io操作，所以对服务器的性能会影响的比较大；结合以上原因，对导出操作进行排队；
刚开始拿到这个需求，第一时间想到就是需要维护一个FIFO先进先出的队列，给定队列一个固定size，在队列里面的人进行排队进行数据导出，导出完成后立马出队列，下一个排队的人进行操作；还考虑到异步，可能还需要建个文件导出表，主要记录文件的导出情况，文件的存放地址，用户根据文件列表情况下载导出文件。

## 业务关系定义
分别是用户、导出队列、导出执行方法

- ExportQueue：维护一条定长队列，可以获取队列里前后排队的用户，提供查询，队列如果已经满了，其余的人需要进行等待
- User信息：排队执行导出方法对应用户；
- Export类：定义导出方法，异步执行，用户可以通过导出页面查看、下载，导出的文件；

## 具体代码实现

### ExportQueue队列

```java
package com.example.system.config;

import com.example.system.api.domain.ExportUser;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.LinkedList;

@Slf4j
@Component
public class ExportQueue {


    private final int MAX_CAPACITY = 10; // 队列最大容量
    private LinkedList<ExportUser> queue; // 用户队列

    public ExportQueue(LinkedList<ExportUser> queue) {
        this.queue = new LinkedList<>();
    }

    /**
     * 排队队列添加
     * @param sysUser
     */
    public synchronized LinkedList<ExportUser> add(ExportUser sysUser) {
        while (queue.size() >= MAX_CAPACITY) {
            try {
                log.info("当前排队人已满，请等待");
                wait();
            } catch (InterruptedException e) {
                e.getMessage();
            }
        }
        queue.add(sysUser);
        log.info("目前导出队列排队人数：" + queue.size());
        notifyAll();
        return queue;
    }


    /**
     * 获取排队队列下一个人
     * @return
     */
    public synchronized ExportUser getNextSysUser() {
        while (queue.isEmpty()) {
            try {
                wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        ExportUser sysUser = queue.remove();
        notifyAll(); //唤醒
        return sysUser;
    }
}
```

### AbstractExport导出类

引入EasyExcel百万级别的导出功能

```java
package com.example.system.config;


import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.util.PageUtil;
import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.ExcelWriter;
import com.alibaba.excel.write.metadata.WriteSheet;
import com.example.system.api.domain.ExportUser;
import lombok.extern.slf4j.Slf4j;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.util.List;

@Slf4j
public abstract class AbstractExport<T, K> {


    public abstract void export(ExportUser sysUser) throws InterruptedException;

    /**
     * 导出
     *
     * @param response 输出流
     * @param pageSize 每页大小
     * @param t        导出条件
     * @param k        Excel内容实体类
     * @param fileName 文件名称
     */
    public void export(HttpServletResponse response, int pageSize, T t, Class<K> k, String fileName) throws Exception {
        ExcelWriter writer = null;
        try {
            writer = getExcelWriter(response, fileName);
            //查询导出总条数
            int total = this.countExport(t);
            //页数
            int loopCount = PageUtil.totalPage(total, pageSize);
            BeanUtil.setProperty(t, "pageSize", pageSize);
            for (int i = 0; i < loopCount; i++) {
                //开始页
                BeanUtil.setProperty(t, "pageNum", PageUtil.getStart(i + 1, pageSize));
                //获取Excel导出信息
                List<K> kList = this.getExportDetail(t);
                WriteSheet writeSheet = EasyExcel.writerSheet(fileName).head(k).build();
                writer.write(kList, writeSheet);
            }
        } catch (Exception e) {
            String msg = "导出" + fileName + "异常";
            log.error(msg, e);
            throw new Exception(msg + e);
        } finally {
            if (writer != null) {
                writer.finish();
            }
        }
    }

    public com.alibaba.excel.ExcelWriter getExcelWriter(HttpServletResponse response, String fileName) throws IOException {
        response.setContentType("application/vnd.ms-excel");
        response.setCharacterEncoding("utf-8");
        // 这里URLEncoder.encode可以防止中文乱码 当然和easyexcel没有关系
        String fileNameUtf = URLEncoder.encode(fileName, "UTF-8").replaceAll("\\+", "%20");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileNameUtf + ".xlsx");
        return EasyExcel.write(response.getOutputStream()).build();
    }


    /**
     * （模版导出）
     *
     * @param t
     * @param fileName
     * @param response
     */
    public abstract void complexFillWithTable(T t, String fileName, HttpServletResponse response);

    /**
     * 查询导出总条数
     *
     * @param t
     * @return
     */
    public abstract int countExport(T t);

    /**
     * 查询导出数据
     *
     * @param t
     * @return
     */
    public abstract List<K> getExportDetail(T t);
}
```

### ExportImpl导出实现方法

```java
package com.example.system.service.impl;

import com.alibaba.excel.ExcelWriter;
import com.example.system.api.domain.ExportUser;
import com.example.system.config.AbstractExport;
import com.example.system.config.ExportQueue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.LinkedList;
import java.util.List;

@Service
@Slf4j
public class ExportImpl extends AbstractExport {

    @Autowired
    private ExportQueue exportQueue;


    @Override
    public void export(ExportUser sysUser) throws InterruptedException {

        //导出
        log.info("导出文件方法执行～～～～～～～～～");
//        export(response,pageSize,t,k,fileName);
        LinkedList<ExportUser> queue = exportQueue.add(sysUser);
        log.info("导出队列：" + queue);
        //休眠时间稍微设置大点，模拟导出处理时间
        Thread.sleep(20000);
        //导出成功后移除当前导出用户
        ExportUser nextSysUser = exportQueue.getNextSysUser();
        log.info("移除后获取下一个排队的用户: " + nextSysUser.getUserName());

    }


    @Override
    public void export(HttpServletResponse response, int pageSize, Object o, Class k, String fileName) throws Exception {
        super.export(response, pageSize, o, k, fileName);
    }

    @Override
    public ExcelWriter getExcelWriter(HttpServletResponse response, String fileName) throws IOException {
        return super.getExcelWriter(response, fileName);
    }

    @Override
    public void complexFillWithTable(Object o, String fileName, HttpServletResponse response) {

    }

    @Override
    public int countExport(Object o) {
        return 0;
    }

    @Override
    public List getExportDetail(Object o) {
        return null;
    }
}
```

### 测试controller

```java
package com.example.system.controller;

import com.example.system.api.domain.ExportUser;
import com.example.system.api.domain.SysUser;
import com.example.system.service.impl.ExportImpl;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/export")
@Slf4j
public class ExportController {

    @Autowired
    private ExportImpl export;


    @PostMapping("/exportFile")
    public void exportFile() {
            new Thread(new Runnable() {
                @SneakyThrows
                @Override
                public void run() {
                    Thread thread1 = Thread.currentThread();
                    ExportUser sysUser =new ExportUser();
                    sysUser.setUserName(thread1.getName());

                    export.export(sysUser);
                }
            }).start();
        }
}
```

### 测试结果

通过请求测试方法，限制了我们导出队列最大限制10次，队列场长度超过10次则无法进行继续提交；


第一次请求和第二次请求，间隔10秒，第一个用户导出完成后出列，下一个排队用户在队列首位，在进行导出请求排在上一个用户后面；


## 总结
⚠️其余的还未实现，导出文件的表的设计、oss文件上传、用户导出文件下载，还有高并发的场景下会不会出现什么问题，这些都还没有太考虑进去；
实现的方式应该挺多的，Redis的队列应该也是可以的，这里仅仅提供一个实现思路；
