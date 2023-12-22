---
title: Spring Boot Slice Upload with Minio(S3) and LocalFileSystem
authors: [lorchr]
tags: [upload, minio, s3, oss, localFileSystem]
image: ../img/docusaurus.png
date: 2023-12-22
---

## 前言

### 什么是 OSS?
OSS（Object Storage Service），对象存储服务，对象存储服务是一种使用 HTTP API 存储和检索对象的工具。就是将系统所要用的文件上传到云硬盘上，该云硬盘提供了文件下载、上传、预览等一系列服务，具备版本，权限控制能力，具备数据生命周期管理能力这样的服务以及技术可以统称为 OSS

一般项目使用 OSS 对象存储服务，主要是对图片、文件、音频等对象集中式管理权限控制，管理数据生命周期等等，提供上传，下载，预览，删除等功能。

### 什么是 AmazonS3？
Amazon Simple Storage Service（Amazon S3，Amazon 简便存储服务）是 AWS 最早推出的云服务之一，经过多年的发展，S3 协议在对象存储行业事实上已经成为标准。

- 提供了统一的接口 REST/SOAP 来统一访问任何数据
- 对 S3 来说，存在里面的数据就是对象名（键），和数据（值）
- 不限量，单个文件最高可达 5TB，可动态扩容。
- 高速。每个 bucket 下每秒可达 3500 PUT/COPY/POST/DELETE 或 5500 GET/HEAD 请求。
- 具备版本，权限控制能力
- 具备数据生命周期管理能力

文档地址：https://docs.aws.amazon.com/zh_cn/AmazonS3/latest/userguide/Welcome.html

作为一个对象存储服务，S3 功能真的很完备，行业的标杆，目前市面上大部分 OSS 对象存储服务都支持 AmazonS3，本文主要讲解的就是基于 AmazonS3 实现我们自己的 Spring Boot Starter。

- 阿里云 OSS 兼容 S3
- 七牛云对象存储兼容 S3
- 腾讯云 COS 兼容 S3
- Minio 兼容 S3

### 为什么要基于AmazonS3 实现 Spring Boot Starter？
原因：市面上 OSS 对象存储服务基本都支持 AmazonS3，我们封装我们的自己的 starter 那么就必须考虑适配，迁移，可扩展。比喻说我们今天使用的是阿里云 OSS 对接阿里云 OSS 的 SDK，后天我们使用的是腾讯 COS 对接是腾讯云 COS，我们何不直接对接 AmazonS3 实现呢，这样后续不需要调整代码，只需要去各个云服务商配置就好了。


## 一、自定义 spring-boot-starter-oss

### 1.1 Maven工程定义及依赖 pom.xml
核心是引入 `AmazonS3` 依赖包
```xml
<dependency>
    <groupId>com.amazonaws</groupId>
    <artifactId>aws-java-sdk-s3</artifactId>
</dependency>
```

完整的`pom.xml`如下
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <artifactId>cloud-sdk-oss</artifactId>
    <packaging>jar</packaging>

    <name>Cloud SDK OSS</name>
    <description>OSS SDK Support Amazon S3, Alibaba OSS, Tencent COS, Qiniu, MinIO etc</description>

    <parent>
        <groupId>com.light</groupId>
        <artifactId>spring-cloud-samples</artifactId>
        <version>2023.0.0</version>
    </parent>

    <properties>
        <skipTests>true</skipTests>
    </properties>

    <dependencies>
        <dependency>
            <groupId>com.light</groupId>
            <artifactId>cloud-common-core</artifactId>
        </dependency>

        <dependency>
            <groupId>com.amazonaws</groupId>
            <artifactId>aws-java-sdk-s3</artifactId>
        </dependency>

        <!--自动配置-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-autoconfigure</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-autoconfigure-processor</artifactId>
            <optional>true</optional>
        </dependency>
        <!--生成配置说明文件-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-configuration-processor</artifactId>
            <scope>compile</scope>
            <optional>true</optional>
        </dependency>
    </dependencies>

    <build>
        <resources>
            <resource>
                <directory>src/main/resources</directory>
                <!--yml中引用pom信息-->
                <filtering>true</filtering>
            </resource>
        </resources>

        <plugins>
            <!--跳过向maven私服推送服务jar包-->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-deploy-plugin</artifactId>
                <configuration>
                    <skip>true</skip>
                </configuration>
            </plugin>
            <!-- maven 打包时跳过测试 -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <configuration>
                    <skip>true</skip>
                </configuration>
            </plugin>
            <!--可依赖jar包插件-->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <configuration>
                    <encoding>${project.build.sourceEncoding}</encoding>
                    <source>${maven.compiler.source}</source>
                    <target>${maven.compiler.target}</target>
                </configuration>
            </plugin>
            <!-- 在打好的jar包中保留javadoc注释,实际会另外生成一个xxxxx-sources.jar -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-source-plugin</artifactId>
                <executions>
                    <execution>
                        <id>attach-sources</id>
                        <goals>
                            <goal>jar</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>

</project>
```

### 1.2 OSS操作类接口定义
OssTemplate：OSS 模板接口，此接口主要是对 OSS 操作的方法的一个接口，定义为接口主要是满足可扩展原则，就是其他人使用了我们的 jar 包，实现此接口可以自定义相关操作。

如下面所示代码：定义了一些对 OSS 操作的方法。
```java
package com.light.cloud.sdk.oss.service;

import java.io.InputStream;
import java.util.Date;
import java.util.List;
import java.util.Map;

import com.amazonaws.services.s3.model.Bucket;
import com.amazonaws.services.s3.model.CompleteMultipartUploadResult;
import com.amazonaws.services.s3.model.CopyObjectResult;
import com.amazonaws.services.s3.model.InitiateMultipartUploadResult;
import com.amazonaws.services.s3.model.MultipartUpload;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PartSummary;
import com.amazonaws.services.s3.model.PutObjectResult;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectSummary;
import com.amazonaws.services.s3.model.UploadPartResult;

/**
 * OSS操作模板
 *
 * @author Hui Liu
 * @date 2023/5/9
 */
public interface OssTemplate {

    /**
     * 创建Bucket <p>
     * AmazonS3：https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateBucket.html <p>
     *
     * @param bucketName bucket名称
     * @return 存储桶
     */
    Bucket createBucket(String bucketName) throws Exception;

    /**
     * 获取所有的buckets <p>
     * AmazonS3：https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListBuckets.html <p>
     *
     * @return 存储桶列表
     */
    List<Bucket> listBuckets() throws Exception;

    /**
     * 通过Bucket名称删除Bucket <p>
     * AmazonS3：https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteBucket.html <p>
     *
     * @param bucketName bucket名称
     */
    void removeBucket(String bucketName) throws Exception;

    /**
     * 上传对象 <p>
     * AmazonS3：https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObject.html <p>
     *
     * @param bucketName  bucket名称
     * @param objectName  文件名称
     * @param inputStream 文件输入流
     * @param contextType 文件类型
     * @return 上传结果
     */
    PutObjectResult putObject(String bucketName, String objectName, InputStream inputStream, String contextType) throws Exception;


    /**
     * 上传对象 <p>
     * AmazonS3：https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObject.html <p>
     *
     * @param bucketName bucket名称
     * @param objectName 文件名称
     * @param stream     文件流
     * @return 上传结果
     */
    PutObjectResult putObject(String bucketName, String objectName, InputStream stream) throws Exception;

    /**
     * 获取对象元信息 <p>
     * AmazonS3：https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObjectMetadata.html <p>
     *
     * @param bucketName bucket名称
     * @param objectName 文件名称
     * @return 文件对象
     */
    ObjectMetadata getObjectMetadata(String bucketName, String objectName);

    /**
     * 获取对象 <p>
     * AmazonS3：https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html <p>
     *
     * @param bucketName bucket名称
     * @param objectName 文件名称
     * @return 文件对象
     */
    S3Object getObject(String bucketName, String objectName) throws Exception;

    /**
     * 复制对象 <p>
     * AmazonS3：https://docs.aws.amazon.com/AmazonS3/latest/API/API_CopyObject.html <p>
     *
     * @param bucketName    bucket名称
     * @param objectName    文件名称
     * @param newBucketName 新bucket名称
     * @param newObjectName 新文件名称
     */
    CopyObjectResult copyObject(String bucketName, String objectName, String newBucketName, String newObjectName) throws Exception;

    /**
     * 移动对象 <p>
     * AmazonS3：https://docs.aws.amazon.com/AmazonS3/latest/API/API_CopyObject.html <p>
     *
     * @param bucketName    bucket名称
     * @param objectName    文件名称
     * @param newBucketName 新bucket名称
     * @param newObjectName 新文件名称
     */
    void moveObject(String bucketName, String objectName, String newBucketName, String newObjectName) throws Exception;

    /**
     * 获取对象，分段获取 <p>
     * AmazonS3：https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html <p>
     *
     * @param bucketName bucket名称
     * @param objectName 文件名称
     * @param startByte  开始字节
     * @param endByte    结束字节
     * @return 文件对象
     */
    S3Object getObjectWithRange(String bucketName, String objectName, Long startByte, Long endByte) throws Exception;

    /**
     * 获取对象的url <p>
     * AmazonS3：https://docs.aws.amazon.com/AmazonS3/latest/API/API_GeneratePresignedUrl.html <p>
     *
     * @param bucketName bucket名称
     * @param objectName 文件名称
     * @param expireAt   过期时间
     * @return 对象的URL
     */
    String getPreSignViewUrl(String bucketName, String objectName, Date expireAt) throws Exception;

    /**
     * 根据前缀查询对象 <p>
     * AmazonS3：https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjects.html <p>
     *
     * @param bucketName bucket名称
     * @param recursive  是否递归查询
     * @return S3ObjectSummary 列表
     */
    List<S3ObjectSummary> listObjects(String bucketName, boolean recursive) throws Exception;

    /**
     * 根据前缀查询对象 <p>
     * AmazonS3：https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjects.html <p>
     * AmazonS3：http://docs.aws.amazon.com/AmazonS3/latest/API/RESTBucketGET.html <p>
     *
     * @param bucketName bucket名称
     * @param prefix     前缀
     * @param recursive  是否递归查询
     * @return S3ObjectSummary 列表
     */
    List<S3ObjectSummary> listObjectsByPrefix(String bucketName, String prefix, boolean recursive) throws Exception;

    /**
     * 删除对象 <p>
     * AmazonS3：https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteObject.html <p>
     *
     * @param bucketName bucket名称
     * @param objectName 文件名称
     */
    void removeObject(String bucketName, String objectName) throws Exception;

    /**
     * 判断文件是否存在 <p>
     * AmazonS3：
     *
     * @param bucketName bucket名称
     * @param objectName 文件名称
     * @throws Exception
     */
    Boolean doesObjectExist(String bucketName, String objectName) throws Exception;

    /**
     * 列出已经存在的分片 <p>
     * AmazonS3：https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListParts.html <p>
     *
     * @param bucketName bucket名称
     * @param objectName 文件名称
     * @param uploadId   上传id
     * @throws Exception
     */
    List<PartSummary> listParts(String bucketName, String objectName, String uploadId) throws Exception;

    /**
     * 列出正在进行的上传操作 <p>
     * AmazonS3：https://docs.aws.amazon.com/zh_cn/AmazonS3/latest/API/API_ListMultipartUploads.html <p>
     *
     * @param bucketName bucket名称
     * @throws Exception
     */
    List<MultipartUpload> listMultiUploads(String bucketName) throws Exception;

    /**
     * 初始化分片上传任务 <p>
     * AmazonS3：https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateMultipartUpload.html <p>
     *
     * @param bucketName bucket名称
     * @param objectName 文件名称
     * @throws Exception
     */
    InitiateMultipartUploadResult initMultiUpload(String bucketName, String objectName) throws Exception;

    /**
     * 取消分片上传任务 <p>
     * AmazonS3：https://docs.aws.amazon.com/AmazonS3/latest/API/API_AbortMultipartUpload.html <p>
     *
     * @param bucketName bucket名称
     * @param objectName 文件名称
     * @param uploadId   上传id
     * @throws Exception
     */
    void abortMultiUpload(String bucketName, String objectName, String uploadId) throws Exception;

    /**
     * 上传分片 <p>
     * AmazonS3：https://docs.aws.amazon.com/AmazonS3/latest/API/API_UploadPart.html <p>
     * AmazonS3：https://docs.aws.amazon.com/AmazonS3/latest/API/API_UploadPartCopy.html <p>
     *
     * @param bucketName  bucket名称
     * @param objectName  文件名称
     * @param uploadId    上传id
     * @param inputStream 文件输入流
     * @param partNumber  分片号
     * @throws Exception
     */
    UploadPartResult uploadPart(String bucketName, String objectName, String uploadId,
                                InputStream inputStream, Integer partNumber) throws Exception;

    /**
     * 获取预签名上传url <p>
     * AmazonS3：https://docs.aws.amazon.com/AmazonS3/latest/API/API_GeneratePresignedUrl.html <p>
     *
     * @param bucketName bucket名称
     * @param objectName 文件名称
     * @param expireAt   过期时间
     * @param params     签名参数
     * @return 预签名上传URL
     * @throws Exception
     */
    String getPreSignUploadUrl(String bucketName, String objectName, Date expireAt, Map<String, String> params) throws Exception;

    /**
     * 合并分片 <p>
     * AmazonS3：https://docs.aws.amazon.com/AmazonS3/latest/API/API_CompleteMultipartUpload.html <p>
     * <p>
     * Note: Minio对象存储要求的最小分片是5MB {@link com.amazonaws.services.s3.AmazonS3#completeMultipartUpload(com.amazonaws.services.s3.model.CompleteMultipartUploadRequest)}
     *
     * @param bucketName bucket名称 bucket名称
     * @param objectName 文件名称 文件名
     * @param uploadId   上传id
     * @param chunkNum   分片数量
     * @return 上传结果
     * @throws Exception
     */
    CompleteMultipartUploadResult completeMultiUpload(String bucketName, String objectName, String uploadId, Integer chunkNum) throws Exception;
}
```

基于上面定义的 `OssTemplate` 接口，扩展了 `S3OssTemplate` `LfsOssTemplate`，分别对应与S3存储和本地文件存储

### 1.3 OSS操作类S3实现
实现 OssTemplate 里面的方法，调用 AmazonS3 JavaSDK 的方法实现。

AmazonS3 提供了众多的方法，这里就不写全部的了，公司要用到那些就写那些吧，后续扩展就行。

AmazonS3 接口地址: https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateBucket.html

```java
package com.light.cloud.sdk.oss.service.impl;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URL;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.apache.commons.collections4.MapUtils;
import org.apache.commons.lang3.StringUtils;

import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;

import com.amazonaws.HttpMethod;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.internal.Mimetypes;
import com.amazonaws.services.s3.model.AbortMultipartUploadRequest;
import com.amazonaws.services.s3.model.Bucket;
import com.amazonaws.services.s3.model.CompleteMultipartUploadRequest;
import com.amazonaws.services.s3.model.CompleteMultipartUploadResult;
import com.amazonaws.services.s3.model.CopyObjectRequest;
import com.amazonaws.services.s3.model.CopyObjectResult;
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.InitiateMultipartUploadRequest;
import com.amazonaws.services.s3.model.InitiateMultipartUploadResult;
import com.amazonaws.services.s3.model.ListMultipartUploadsRequest;
import com.amazonaws.services.s3.model.ListObjectsRequest;
import com.amazonaws.services.s3.model.ListPartsRequest;
import com.amazonaws.services.s3.model.MetadataDirective;
import com.amazonaws.services.s3.model.MultipartUpload;
import com.amazonaws.services.s3.model.MultipartUploadListing;
import com.amazonaws.services.s3.model.ObjectListing;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PartETag;
import com.amazonaws.services.s3.model.PartListing;
import com.amazonaws.services.s3.model.PartSummary;
import com.amazonaws.services.s3.model.PutObjectResult;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectSummary;
import com.amazonaws.services.s3.model.UploadPartRequest;
import com.amazonaws.services.s3.model.UploadPartResult;
import com.amazonaws.util.IOUtils;
import com.light.cloud.common.core.exception.BizException;
import com.light.cloud.sdk.oss.properties.OssProperties;
import com.light.cloud.sdk.oss.service.OssTemplate;

/**
 * OSS操作业务实现
 *
 * @author Hui Liu
 * @date 2023/5/9
 */
public class S3OssTemplate implements OssTemplate {

    private final AmazonS3 amazonS3;

    private final OssProperties ossProperties;

    public S3OssTemplate(AmazonS3 amazonS3, OssProperties ossProperties) {
        this.amazonS3 = amazonS3;
        this.ossProperties = ossProperties;
    }

    @Override
    public Bucket createBucket(String bucketName) throws Exception {
        if (!amazonS3.doesBucketExistV2(bucketName)) {
            return amazonS3.createBucket((bucketName));
        }
        return null;
    }

    @Override
    public List<Bucket> listBuckets() throws Exception {
        return amazonS3.listBuckets();
    }

    @Override
    public void removeBucket(String bucketName) throws Exception {
        amazonS3.deleteBucket(bucketName);
    }

    @Override
    public PutObjectResult putObject(String bucketName, String objectName, InputStream inputStream, String contextType) throws Exception {
        return putObject(bucketName, objectName, inputStream, inputStream.available(), contextType);
    }

    @Override
    public PutObjectResult putObject(String bucketName, String objectName, InputStream stream) throws Exception {
        return putObject(bucketName, objectName, stream, stream.available(), Mimetypes.MIMETYPE_OCTET_STREAM);
    }

    private PutObjectResult putObject(String bucketName, String objectName, InputStream stream, long size,
                                      String contextType) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }
        byte[] bytes = IOUtils.toByteArray(stream);
        ObjectMetadata objectMetadata = new ObjectMetadata();
        objectMetadata.setContentLength(size);
        objectMetadata.setContentType(contextType);
        ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(bytes);
        // 上传
        return amazonS3.putObject(bucketName, objectName, byteArrayInputStream, objectMetadata);
    }

    @Override
    public ObjectMetadata getObjectMetadata(String bucketName, String objectName) {
        return amazonS3.getObjectMetadata(bucketName, objectName);
    }

    @Override
    public S3Object getObject(String bucketName, String objectName) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }
        return amazonS3.getObject(bucketName, objectName);
    }

    @Override
    public CopyObjectResult copyObject(String bucketName, String objectName, String newBucketName, String newObjectName) throws Exception {
        CopyObjectRequest request = new CopyObjectRequest();
        request.setSourceBucketName(bucketName);
        request.setSourceKey(objectName);
        request.setDestinationBucketName(newBucketName);
        request.setDestinationKey(newObjectName);
        request.setMetadataDirective(MetadataDirective.COPY.name());
        return amazonS3.copyObject(request);
    }

    @Override
    public void moveObject(String bucketName, String objectName, String newBucketName, String newObjectName) throws Exception {
        CopyObjectRequest request = new CopyObjectRequest();
        request.setSourceBucketName(bucketName);
        request.setSourceKey(objectName);
        request.setDestinationBucketName(newBucketName);
        request.setDestinationKey(newObjectName);
        request.setMetadataDirective(MetadataDirective.COPY.name());
        CopyObjectResult copyObjectResult = amazonS3.copyObject(request);

        if (Objects.nonNull(copyObjectResult)) {
            amazonS3.deleteObject(bucketName, objectName);
        }
    }

    @Override
    public S3Object getObjectWithRange(String bucketName, String objectName, Long startByte, Long endByte) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }
        GetObjectRequest request = new GetObjectRequest(bucketName, objectName)
                .withRange(startByte, endByte);
        return amazonS3.getObject(request);
    }

    @Override
    public String getPreSignViewUrl(String bucketName, String objectName, Date expireAt) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }
        GeneratePresignedUrlRequest request = new GeneratePresignedUrlRequest(bucketName, objectName)
                .withExpiration(expireAt)
                .withMethod(HttpMethod.PUT);
        URL url = amazonS3.generatePresignedUrl(request);
        return url.toString();
    }

    @Override
    public List<S3ObjectSummary> listObjects(String bucketName, boolean recursive) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }
        ListObjectsRequest request = new ListObjectsRequest();
        request.setBucketName(bucketName);
        ObjectListing objectListing = amazonS3.listObjects(request);
        return objectListing.getObjectSummaries();
    }

    @Override
    public List<S3ObjectSummary> listObjectsByPrefix(String bucketName, String prefix, boolean recursive) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }
        ListObjectsRequest request = new ListObjectsRequest();
        request.setBucketName(bucketName);
        request.setPrefix(prefix);
        ObjectListing objectListing = amazonS3.listObjects(request);
        return objectListing.getObjectSummaries();
    }

    @Override
    public void removeObject(String bucketName, String objectName) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }
        amazonS3.deleteObject(bucketName, objectName);
    }

    @Override
    public Boolean doesObjectExist(String bucketName, String objectName) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }
        return amazonS3.doesObjectExist(bucketName, objectName);
    }

    @Override
    public List<PartSummary> listParts(String bucketName, String objectName, String uploadId) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }
        ListPartsRequest request = new ListPartsRequest(bucketName, objectName, uploadId);
        PartListing partListing = amazonS3.listParts(request);
        return partListing.getParts();
    }

    @Override
    public List<MultipartUpload> listMultiUploads(String bucketName) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }
        ListMultipartUploadsRequest request = new ListMultipartUploadsRequest(bucketName);
        MultipartUploadListing result = amazonS3.listMultipartUploads(request);
        return result.getMultipartUploads();
    }

    @Override
    public InitiateMultipartUploadResult initMultiUpload(String bucketName, String objectName) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }
        String contentType = MediaTypeFactory.getMediaType(objectName)
                .orElse(MediaType.APPLICATION_OCTET_STREAM).toString();
        ObjectMetadata objectMetadata = new ObjectMetadata();
        objectMetadata.setContentType(contentType);
        InitiateMultipartUploadRequest request = new InitiateMultipartUploadRequest(bucketName, objectName)
                .withObjectMetadata(objectMetadata);
        return amazonS3.initiateMultipartUpload(request);
    }

    @Override
    public void abortMultiUpload(String bucketName, String objectName, String uploadId) throws Exception {
        AbortMultipartUploadRequest request = new AbortMultipartUploadRequest(bucketName, objectName, uploadId);
        amazonS3.abortMultipartUpload(request);
    }

    @Override
    public UploadPartResult uploadPart(String bucketName, String objectName, String uploadId,
                                       InputStream inputStream, Integer partNumber) throws Exception {
        byte[] bytes = IOUtils.toByteArray(inputStream);
        UploadPartRequest request = new UploadPartRequest()
                .withBucketName(bucketName)
                .withKey(objectName)
                .withUploadId(uploadId)
                .withPartNumber(partNumber)
                .withInputStream(new ByteArrayInputStream(bytes))
                .withPartSize(bytes.length);
        return amazonS3.uploadPart(request);
    }

    @Override
    public String getPreSignUploadUrl(String bucketName, String objectName, Date expireAt, Map<String, String> params) throws Exception {
        GeneratePresignedUrlRequest request = new GeneratePresignedUrlRequest(bucketName, objectName)
                .withExpiration(expireAt)
                .withMethod(HttpMethod.PUT);
        if (MapUtils.isNotEmpty(params)) {
            params.forEach(request::addRequestParameter);
        }
        return amazonS3.generatePresignedUrl(request).toString();
    }

    @Override
    public CompleteMultipartUploadResult completeMultiUpload(String bucketName, String objectName, String uploadId, Integer chunkNum) throws Exception {
        List<PartSummary> parts = listParts(bucketName, objectName, uploadId);
        if (!chunkNum.equals(parts.size())) {
            // 已上传分块数量与记录中的数量不对应，不能合并分块
            throw BizException.throwException("分片缺失，请重新上传");
        }
        List<PartETag> partETagList = parts.stream()
                .map(partSummary -> new PartETag(partSummary.getPartNumber(), partSummary.getETag()))
                .collect(Collectors.toList());
        CompleteMultipartUploadRequest request = new CompleteMultipartUploadRequest()
                .withBucketName(bucketName)
                .withKey(objectName)
                .withUploadId(uploadId)
                .withPartETags(partETagList);
        return amazonS3.completeMultipartUpload(request);
    }

}
```

### 1.4 OSS操作类LocalFileSystem实现
实现 OssTemplate 里面的方法，基于本地文件系统实现。 主要是用于本地的演示，以及加深对文件系统的理解，不适用于生产环境。
```java
package com.light.cloud.sdk.oss.service.impl;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FilenameFilter;
import java.io.InputStream;
import java.net.URI;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.StringUtils;

import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;

import com.amazonaws.services.s3.internal.Mimetypes;
import com.amazonaws.services.s3.model.Bucket;
import com.amazonaws.services.s3.model.CompleteMultipartUploadResult;
import com.amazonaws.services.s3.model.CopyObjectResult;
import com.amazonaws.services.s3.model.InitiateMultipartUploadResult;
import com.amazonaws.services.s3.model.MultipartUpload;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PartSummary;
import com.amazonaws.services.s3.model.PutObjectResult;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectSummary;
import com.amazonaws.services.s3.model.UploadPartResult;
import com.light.cloud.common.core.constant.BaseConstant;
import com.light.cloud.common.core.crypto.AESTool;
import com.light.cloud.common.core.exception.BizException;
import com.light.cloud.common.core.tool.DateTool;
import com.light.cloud.common.core.tool.JsonTool;
import com.light.cloud.sdk.oss.properties.OssProperties;
import com.light.cloud.sdk.oss.service.OssTemplate;

/**
 * 本地文件存储实现 LocalFileSystemTemplate
 *
 * @author Hui Liu
 * @date 2023/5/9
 */
public class LfsOssTemplate implements OssTemplate {

    public static final String DEFAULT_PART_BUCKET = "partUpload";
    private final OssProperties ossProperties;

    public LfsOssTemplate(OssProperties ossProperties) {
        this.ossProperties = ossProperties;
        URI endpoint = ossProperties.getEndpoint();
        File rootFolder = new File(endpoint);
        if (!rootFolder.exists()) {
            rootFolder.mkdirs();
        }
    }

    public File getRootFolder() {
        URI endpoint = ossProperties.getEndpoint();
        return new File(endpoint);
    }

    public File getBucketFolder(String bucketName) {
        URI endpoint = ossProperties.getEndpoint();
        return new File(endpoint.getPath(), bucketName);
    }

    public File getFile(String bucketName, String objectName) {
        URI endpoint = ossProperties.getEndpoint();
        File bucketFolder = new File(endpoint.getPath(), bucketName);
        return new File(bucketFolder, objectName);
    }

    public File getPartBucketFolder(String bucketName) {
        URI endpoint = ossProperties.getEndpoint();
        File partBucketFolder = new File(endpoint.getPath(), DEFAULT_PART_BUCKET);
        return new File(partBucketFolder, bucketName);
    }

    public File getPartFolder(String bucketName, String objectName, String uploadId) {
        URI endpoint = ossProperties.getEndpoint();
        File partBucketFolder = new File(endpoint.getPath(), DEFAULT_PART_BUCKET);
        File bucketFolder = new File(partBucketFolder, bucketName);
        return new File(bucketFolder, objectName + BaseConstant.UNDERSCORE + uploadId);
    }

    public String getPartFilename(String filename, Integer partNumber) {
        return filename + BaseConstant.DOT + partNumber;
    }

    public Integer getPartNumber(String partFilename) {
        String partNum = partFilename.substring(partFilename.lastIndexOf(BaseConstant.DOT) + 1);
        return Integer.parseInt(partNum);
    }

    public String getETag(String bucketName, String objectName) {
        return AESTool.encryptBase64(objectName, bucketName);
    }

    public static File[] listFiles(File file, String prefix, Boolean recursion) {
        if (Objects.isNull(file)) {
            return new File[0];
        }
        if (file.isFile()) {
            return new File[]{file};
        }
        FilenameFilter filenameFilter = (dir, name) -> {
            if (dir.isDirectory()) {
                return recursion;
            }
            if (StringUtils.isNotBlank(prefix)) {
                return name.startsWith(prefix);
            }
            return true;
        };
        return file.listFiles(filenameFilter);
    }

    @Override
    public Bucket createBucket(String bucketName) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }
        File bucketFolder = getBucketFolder(bucketName);
        if (!bucketFolder.exists()) {
            bucketFolder.mkdirs();
        }
        Bucket bucket = new Bucket();
        bucket.setName(bucketName);
        bucket.setCreationDate(DateTool.now());
        return bucket;
    }

    @Override
    public List<Bucket> listBuckets() throws Exception {
        File rootFolder = getRootFolder();
        int idx = rootFolder.getPath().length() + 1;
        File[] folders = rootFolder.listFiles();
        if (ArrayUtils.isEmpty(folders)) {
            return Collections.emptyList();
        }

        List<Bucket> buckets = new ArrayList<>();
        Date now = DateTool.now();
        for (File folder : folders) {
            String path = folder.getPath();
            Bucket bucket = new Bucket();
            bucket.setName(path.substring(idx));
            bucket.setCreationDate(now);

            buckets.add(bucket);
        }
        return buckets;
    }

    @Override
    public void removeBucket(String bucketName) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }
        File bucketFolder = getBucketFolder(bucketName);
        bucketFolder.delete();
    }

    @Override
    public PutObjectResult putObject(String bucketName, String objectName, InputStream inputStream, String contextType) throws Exception {
        return putObject(bucketName, objectName, inputStream, inputStream.available(), contextType);
    }

    @Override
    public PutObjectResult putObject(String bucketName, String objectName, InputStream stream) throws Exception {
        return putObject(bucketName, objectName, stream, stream.available(), Mimetypes.MIMETYPE_OCTET_STREAM);
    }

    private PutObjectResult putObject(String bucketName, String objectName, InputStream stream, long size,
                                      String contextType) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }
        ObjectMetadata objectMetadata = new ObjectMetadata();
        objectMetadata.setContentLength(size);
        objectMetadata.setContentType(contextType);
        // 上传
        File file = getFile(bucketName, objectName);
        FileUtils.copyInputStreamToFile(stream, file);

        PutObjectResult result = new PutObjectResult();
        result.setETag(getETag(bucketName, objectName));
        result.setMetadata(objectMetadata);
        return result;
    }

    @Override
    public ObjectMetadata getObjectMetadata(String bucketName, String objectName) {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }

        File file = getFile(bucketName, objectName);
        String contentType = MediaTypeFactory.getMediaType(objectName)
                .orElse(MediaType.APPLICATION_OCTET_STREAM).toString();

        ObjectMetadata result = new ObjectMetadata();
        result.setLastModified(new Date(file.lastModified()));
        result.setContentLength(file.length());
        result.setContentType(contentType);
        return result;
    }

    @Override
    public S3Object getObject(String bucketName, String objectName) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }

        File file = getFile(bucketName, objectName);
        // 下载文件
        S3Object result = new S3Object();
        result.setBucketName(bucketName);
        result.setKey(objectName);
        result.setObjectContent(new FileInputStream(file));
        return result;
    }

    @Override
    public CopyObjectResult copyObject(String bucketName, String objectName, String newBucketName, String newObjectName) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }

        File file = getFile(bucketName, objectName);
        // 复制文件
        File newBucketFolder = getBucketFolder(newBucketName);
        if (!newBucketFolder.exists()) {
            newBucketFolder.mkdirs();
        }
        File newFile = getFile(newBucketName, newObjectName);
        FileUtils.copyFile(file, newFile);

        CopyObjectResult result = new CopyObjectResult();
        result.setETag(getETag(newBucketName, newObjectName));
        result.setLastModifiedDate(DateTool.now());
        return result;
    }

    @Override
    public void moveObject(String bucketName, String objectName, String newBucketName, String newObjectName) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }

        File file = getFile(bucketName, objectName);
        // 复制文件
        File newBucketFolder = getBucketFolder(newBucketName);
        if (!newBucketFolder.exists()) {
            newBucketFolder.mkdirs();
        }
        File newFile = getFile(newBucketName, newObjectName);
        FileUtils.copyFile(file, newFile);
        // 删除文件
        file.delete();
    }

    @Override
    public S3Object getObjectWithRange(String bucketName, String objectName, Long startByte, Long endByte) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }
        File file = getFile(bucketName, objectName);
        FileInputStream inputStream = new FileInputStream(file);

        // 获取指定范围的字节
        byte[] buffer = new byte[(int) (endByte - startByte + 1)];
        inputStream.skip(startByte);
        int byteRead = inputStream.read(buffer);
        if (byteRead <= 0) {
            return null;
        }
        // 下载文件
        S3Object result = new S3Object();
        result.setBucketName(bucketName);
        result.setKey(objectName);
        result.setObjectContent(new ByteArrayInputStream(buffer, 0, byteRead));
        return result;
    }

    @Override
    public String getPreSignViewUrl(String bucketName, String objectName, Date expireAt) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }
        Map<String, Object> urlParam = new HashMap<>();
        urlParam.put("bucketName", bucketName);
        urlParam.put("objectName", objectName);
        urlParam.put("expireAt", DateTool.format(expireAt, DateTool.PATTERN_YYYYMMDDHHMMSS));
        URI uri = URI.create(ossProperties.getPreSignUrl() + BaseConstant.SLASH + AESTool.encryptBase64(JsonTool.beanToJson(urlParam)));
        return uri.toString();
    }

    @Override
    public List<S3ObjectSummary> listObjects(String bucketName, boolean recursive) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }
        File bucketFolder = getBucketFolder(bucketName);
        if (!bucketFolder.exists()) {
            return Collections.emptyList();
        }

        File[] subFiles = listFiles(bucketFolder, null, recursive);

        List<S3ObjectSummary> summaryList = new ArrayList<>();
        for (File subFile : subFiles) {
            if (subFile.isDirectory()) {
                continue;
            }
            S3ObjectSummary s3ObjectSummary = new S3ObjectSummary();
            s3ObjectSummary.setBucketName(bucketName);
            s3ObjectSummary.setKey(subFile.getName());
            s3ObjectSummary.setLastModified(new Date(subFile.lastModified()));
            s3ObjectSummary.setSize(subFile.length());
            s3ObjectSummary.setETag(getETag(bucketName, subFile.getName()));

            summaryList.add(s3ObjectSummary);
        }
        return summaryList;
    }

    @Override
    public List<S3ObjectSummary> listObjectsByPrefix(String bucketName, String prefix, boolean recursive) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }
        File bucketFolder = getBucketFolder(bucketName);
        if (!bucketFolder.exists()) {
            return Collections.emptyList();
        }
        File[] subFiles = listFiles(bucketFolder, prefix, recursive);

        List<S3ObjectSummary> summaryList = new ArrayList<>();
        for (File subFile : subFiles) {
            if (subFile.isDirectory()) {
                continue;
            }
            S3ObjectSummary s3ObjectSummary = new S3ObjectSummary();
            s3ObjectSummary.setBucketName(bucketName);
            s3ObjectSummary.setKey(subFile.getName());
            s3ObjectSummary.setLastModified(new Date(subFile.lastModified()));
            s3ObjectSummary.setSize(subFile.length());
            s3ObjectSummary.setETag(getETag(bucketName, subFile.getName()));

            summaryList.add(s3ObjectSummary);
        }
        return summaryList;
    }

    @Override
    public void removeObject(String bucketName, String objectName) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }
        File file = getFile(bucketName, objectName);
        file.delete();
    }

    @Override
    public Boolean doesObjectExist(String bucketName, String objectName) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }
        File file = getFile(bucketName, objectName);
        return file.exists();
    }

    @Override
    public List<PartSummary> listParts(String bucketName, String objectName, String uploadId) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }
        File partFolder = getPartFolder(bucketName, objectName, uploadId);
        File[] partFiles = partFolder.listFiles();
        if (ArrayUtils.isEmpty(partFiles)) {
            return Collections.emptyList();
        }

        List<PartSummary> parts = new ArrayList<>();
        for (File partFile : partFiles) {
            String partFilename = partFile.getName();
            Integer partNumber = getPartNumber(partFilename);
            PartSummary partSummary = new PartSummary();
            partSummary.setPartNumber(partNumber);
            partSummary.setSize(partFile.length());
            partSummary.setETag(getETag(bucketName, partFilename));
            partSummary.setLastModified(new Date(partFile.lastModified()));

            parts.add(partSummary);
        }
        return parts;
    }

    @Override
    public List<MultipartUpload> listMultiUploads(String bucketName) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }
        File partBucketFolder = getPartBucketFolder(bucketName);
        File[] partFolders = partBucketFolder.listFiles();
        if (ArrayUtils.isEmpty(partFolders)) {
            return Collections.emptyList();
        }

        List<MultipartUpload> uploads = new ArrayList<>();
        for (File partFolder : partFolders) {
            String partFolderName = partFolder.getName();
            String[] split = partFolderName.split("_");
            MultipartUpload multipartUpload = new MultipartUpload();
            multipartUpload.setUploadId(split[1]);
            multipartUpload.setKey(split[0]);

            uploads.add(multipartUpload);
        }
        return uploads;
    }

    @Override
    public InitiateMultipartUploadResult initMultiUpload(String bucketName, String objectName) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }
        String uploadId = UUID.randomUUID().toString().replace(BaseConstant.DASH, BaseConstant.EMPTY);

        File partFolder = getPartFolder(bucketName, objectName, uploadId);
        if (!partFolder.exists()) {
            partFolder.mkdirs();
        }

        InitiateMultipartUploadResult result = new InitiateMultipartUploadResult();
        result.setBucketName(bucketName);
        result.setKey(objectName);
        result.setUploadId(uploadId);
        return result;
    }

    @Override
    public void abortMultiUpload(String bucketName, String objectName, String uploadId) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }
        File partFolder = getPartFolder(bucketName, objectName, uploadId);
        partFolder.delete();
    }

    @Override
    public UploadPartResult uploadPart(String bucketName, String objectName, String uploadId,
                                       InputStream inputStream, Integer partNumber) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }
        File partFolder = getPartFolder(bucketName, objectName, uploadId);
        // 上传分片
        File partFile = new File(partFolder, getPartFilename(objectName, partNumber));
        FileUtils.copyInputStreamToFile(inputStream, partFile);

        UploadPartResult result = new UploadPartResult();
        result.setETag(getETag(bucketName, partFile.getName()));
        result.setPartNumber(partNumber);
        return result;
    }

    @Override
    public String getPreSignUploadUrl(String bucketName, String objectName, Date expireAt, Map<String, String> params) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }
        Map<String, Object> urlParam = new HashMap<>(8);
        urlParam.put("bucketName", bucketName);
        urlParam.put("objectName", objectName);
        urlParam.put("expireAt", DateTool.format(expireAt, DateTool.PATTERN_YYYYMMDDHHMMSS));
        urlParam.putAll(params);
        URI uri = URI.create(ossProperties.getPreSignUrl() + BaseConstant.SLASH + AESTool.encryptBase64(JsonTool.beanToJson(urlParam)));
        return uri.toString();
    }

    @Override
    public CompleteMultipartUploadResult completeMultiUpload(String bucketName, String objectName, String uploadId, Integer chunkNum) throws Exception {
        if (StringUtils.isBlank(bucketName)) {
            bucketName = ossProperties.getDefaultBucket();
        }
        // 合并前的分片文件夹
        File partFolder = getPartFolder(bucketName, objectName, uploadId);
        File[] parts = partFolder.listFiles();
        if (ArrayUtils.isEmpty(parts) || !chunkNum.equals(parts.length)) {
            // 已上传分块数量与记录中的数量不对应，不能合并分块
            throw BizException.throwException("分片缺失，请重新上传");
        }

        // 合并后的文件
        File mergeFile = getFile(bucketName, objectName);
        // 执行合并
        try (BufferedOutputStream outputStream = new BufferedOutputStream(Files.newOutputStream(mergeFile.toPath()))) {
            List<File> partList = Arrays.stream(parts).sorted(Comparator.comparing(File::getName)).toList();

            int len;
            byte[] bytes = new byte[1024];
            for (File part : partList) {
                BufferedInputStream inputStream = new BufferedInputStream(Files.newInputStream(part.toPath()));

                while ((len = inputStream.read(bytes)) != -1) {
                    outputStream.write(bytes, 0, len);
                }
                inputStream.close();
            }
        }
        CompleteMultipartUploadResult result = new CompleteMultipartUploadResult();
        result.setBucketName(bucketName);
        result.setKey(objectName);
        result.setETag(getETag(bucketName, mergeFile.getName()));
        return result;
    }

}
```

### 1.5 OSS配置属性类 OssProperties
OssTemplate 相关的配置属性，方便客户端进行定制化配置，可以根据需求进行属性增删
```java
package com.light.cloud.sdk.oss.properties;

import java.net.URI;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Data;

/**
 * OSS属性配置
 *
 * @author Hui Liu
 * @date 2023/5/9
 */
@Data
@ConfigurationProperties(prefix = OssProperties.PREFIX)
public class OssProperties {

    public static final String PREFIX = "light.cloud.oss";

    /**
     * 对象存储服务的URL
     */
    private URI endpoint;

    /**
     * 区域
     */
    private String region;

    /**
     * true path-style nginx 反向代理和S3默认支持 pathStyle模式 {http://endpoint/bucketname}
     * false supports virtual-hosted-style 阿里云等需要配置为 virtual-hosted-style 模式{http://bucketname.endpoint}
     * 只是url的显示不一样
     */
    private Boolean pathStyleAccess = true;

    /**
     * Access key
     */
    private String accessKey;

    /**
     * Secret key
     */
    private String secretKey;

    /**
     * 默认的读写 Bucket
     */
    private String defaultBucket;

    /**
     * 预签名地址
     */
    private String preSignUrl;

    /**
     * 最大线程数，默认：100
     */
    private Integer maxConnections = 100;

    /**
     * 使用本地文件系统 use Local FileSystem
     */
    public Boolean local = false;

}
```

### 1.6 OSS自动配置类 OssAutoConfiguration
自动装配类，将 OssTemplate 实现注入到Spring 容器中，开箱即用。
```java
package com.light.cloud.sdk.oss.configuration;

import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.amazonaws.ClientConfiguration;
import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.AWSCredentialsProvider;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;
import com.light.cloud.sdk.oss.properties.OssProperties;
import com.light.cloud.sdk.oss.service.OssTemplate;
import com.light.cloud.sdk.oss.service.impl.LfsOssTemplate;
import com.light.cloud.sdk.oss.service.impl.S3OssTemplate;
import lombok.RequiredArgsConstructor;

/**
 * OSS配置类
 *
 * @author Hui Liu
 * @date 2023/5/9
 */
@Configuration
@RequiredArgsConstructor
@EnableConfigurationProperties(OssProperties.class)
public class OssAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnProperty(prefix = OssProperties.PREFIX, name = "local", havingValue = "false", matchIfMissing = true)
    public AmazonS3 ossClient(OssProperties ossProperties) {
        // 客户端配置，主要是全局的配置信息
        ClientConfiguration clientConfiguration = new ClientConfiguration();
        clientConfiguration.setMaxConnections(ossProperties.getMaxConnections());
        // url以及region配置
        AwsClientBuilder.EndpointConfiguration endpointConfiguration = new AwsClientBuilder.EndpointConfiguration(
                ossProperties.getEndpoint().toString(), ossProperties.getRegion());
        // 凭证配置
        AWSCredentials awsCredentials = new BasicAWSCredentials(ossProperties.getAccessKey(),
                ossProperties.getSecretKey());
        AWSCredentialsProvider awsCredentialsProvider = new AWSStaticCredentialsProvider(awsCredentials);
        // build amazonS3Client客户端
        return AmazonS3Client.builder().withEndpointConfiguration(endpointConfiguration)
                .withClientConfiguration(clientConfiguration).withCredentials(awsCredentialsProvider)
                .disableChunkedEncoding().withPathStyleAccessEnabled(ossProperties.getPathStyleAccess()).build();
    }

    @Bean
    @ConditionalOnBean(AmazonS3.class)
    public OssTemplate ossTemplate(AmazonS3 amazonS3, OssProperties ossProperties) {
        return new S3OssTemplate(amazonS3, ossProperties);
    }

    @Bean
    @ConditionalOnProperty(prefix = OssProperties.PREFIX, name = "local", havingValue = "true")
    public OssTemplate lfsOssTemplate(OssProperties ossProperties) {
        return new LfsOssTemplate(ossProperties);
    }

}
```

### 1.7 SpringBoot自动装配配置文件

#### 1.7.1 Spring Boot 2.x

Spring Boot 2.x的自动装配文件 `resouces/META-INF/spring.factories`
```factories
# Auto Configure
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
  com.light.cloud.sdk.oss.configuration.OssAutoConfiguration
```

#### 1.7.2 Spring Boot 3.x
Spring Boot 2.x的自动装配文件 `resouces/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`
```imports
com.light.cloud.sdk.oss.configuration.OssAutoConfiguration
```

### 1.8 application.yaml配置示例
```yaml
# 使用MinIO S3 Aliyun Tencent登OSS存储
light:
  cloud:
    oss:
      endpoint: http://127.0.0.1:9000
      access-key: admin
      secret-key: secret
      default-bucket: light
      pre-sign-url: http://127.0.0.1:9001
      region: cn-wuhan
      max-connections: 100
      path-style-access: true
      local: false

---

# 使用本地文件系统 LocalFileSystem
light:
  cloud:
    oss:
      endpoint: file:///d:/storage/
      default-bucket: light
      pre-sign-url: http://127.0.0.1:80/file
      local: true

```

## 二、环境准备
### 2.1 搭建MinIO Server
```shell
docker run -d \
  --publish 9000:9000 \
  --publish 9001:9001 \
  --volume //d/docker/minio/data:/data \
  --env MINIO_ROOT_USER=minioaccess \
  --env MINIO_ROOT_PASSWORD=miniosecret \
  --env MINIO_SERVER_URL=http://minio.example.net:9000 \
  --net dev \
  --restart=on-failure:3 \
  --name minio \
  minio/minio:RELEASE.2023-05-18T00-05-36Z server /data --console-address ":9001"
```

### 2.2 初始化数据库
以下为pgsql数据库脚本示例
```sql
-- ----------------------------
-- Table structure for slice_upload
-- ----------------------------
DROP TABLE IF EXISTS "public"."slice_upload";
CREATE TABLE "public"."slice_upload"
(
    "id"                int8                                        NOT NULL,
    "file_identifier"   varchar(64) COLLATE "pg_catalog"."default"  NOT NULL,
    "filename"          varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
    "bucket_name"       varchar(64) COLLATE "pg_catalog"."default"  NOT NULL,
    "object_name"       varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
    "upload_id"         varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
    "total_size"        int8                                        NOT NULL,
    "chunk_size"        int8                                        NOT NULL,
    "chunk_num"         int4                                        NOT NULL,
    "deleted"           int4                                        NOT NULL,
    "data_dept_id"      int8                                        NOT NULL,
    "remark"            varchar(255) COLLATE "pg_catalog"."default",
    "created_user"      int8                                        NOT NULL,
    "created_user_name" varchar(32) COLLATE "pg_catalog"."default"  NOT NULL,
    "created_time"      timestamp(6)                                NOT NULL,
    "updated_user"      int8                                        NOT NULL,
    "updated_user_name" varchar(32) COLLATE "pg_catalog"."default"  NOT NULL,
    "updated_time"      timestamp(6)                                NOT NULL,
    "revision"          int4                                        NOT NULL,
    "tenant_id"         int8                                        NOT NULL
);

COMMENT ON COLUMN "public"."slice_upload"."id" IS '主键';
COMMENT ON COLUMN "public"."slice_upload"."file_identifier" IS '文件唯一标识 MD5';
COMMENT ON COLUMN "public"."slice_upload"."filename" IS '文件名';
COMMENT ON COLUMN "public"."slice_upload"."bucket_name" IS 'S3存储桶';
COMMENT ON COLUMN "public"."slice_upload"."object_name" IS 'S3文件的key';
COMMENT ON COLUMN "public"."slice_upload"."upload_id" IS 'S3分片上传的 uploadId';
COMMENT ON COLUMN "public"."slice_upload"."total_size" IS '文件大小 bytes';
COMMENT ON COLUMN "public"."slice_upload"."chunk_size" IS '每个分片大小 bytes';
COMMENT ON COLUMN "public"."slice_upload"."chunk_num" IS '分片数量';
COMMENT ON COLUMN "public"."slice_upload"."deleted" IS '是否删除;0-否；1-是';
COMMENT ON COLUMN "public"."slice_upload"."data_dept_id" IS '数据所属部门id';
COMMENT ON COLUMN "public"."slice_upload"."remark" IS '备注';
COMMENT ON COLUMN "public"."slice_upload"."created_user" IS '创建人Id';
COMMENT ON COLUMN "public"."slice_upload"."created_user_name" IS '创建人';
COMMENT ON COLUMN "public"."slice_upload"."created_time" IS '创建时间';
COMMENT ON COLUMN "public"."slice_upload"."updated_user" IS '更新人Id';
COMMENT ON COLUMN "public"."slice_upload"."updated_user_name" IS '更新人';
COMMENT ON COLUMN "public"."slice_upload"."updated_time" IS '更新时间';
COMMENT ON COLUMN "public"."slice_upload"."revision" IS '乐观锁';
COMMENT ON COLUMN "public"."slice_upload"."tenant_id" IS '租户号';
COMMENT ON TABLE "public"."slice_upload" IS '分片上传表';

-- ----------------------------
-- Primary Key structure for table slice_upload
-- ----------------------------
ALTER TABLE "public"."slice_upload"
    ADD CONSTRAINT "slice_upload_pkey" PRIMARY KEY ("id");

```

## 三、使用示例
对于文件的简单操作接口示例，包括
- 添加存储桶
- 删除存储桶
- 获取存储桶列表
- 获取文件列表
- 上传文件
- 下载文件
- 获取文件的预览url

### 3.1 接口定义
```java
@RestController
@RequestMapping("/oss")
@Tags(value = {
        @Tag(name = "【1.0.0】-【OSS】")
})
public class OssController {

    @Autowired(required = false)
    private FileService fileService;

    @PostMapping("bucket/create")
    @Operation(summary = "【新建存储桶】", description = "Hui Liu")
    @Parameters(value = {
            @Parameter(name = "bucketName", description = "bucket", in = ParameterIn.QUERY)
    })
    public Result<Bucket> createBucket(@RequestParam String bucketName) throws Exception {
        Bucket result = fileService.createBucket(bucketName);
        return Result.success(result);
    }

    @GetMapping("bucket/list")
    @Operation(summary = "【存储桶列表】", description = "Hui Liu")
    public Result<List<Bucket>> listBucket() throws Exception {
        List<Bucket> results = fileService.listBuckets();
        return Result.success(results);
    }

    @DeleteMapping("bucket/delete")
    @Operation(summary = "【删除存储桶】", description = "Hui Liu")
    @Parameters(value = {
            @Parameter(name = "bucketName", description = "bucket", in = ParameterIn.QUERY)
    })
    public Result<Boolean> removeBucket(@RequestParam String bucketName) throws Exception {
        fileService.removeBucket(bucketName);
        return Result.success(true);
    }

    @GetMapping("list")
    @Operation(summary = "【文件列表】", description = "Hui Liu")
    @Parameters(value = {
            @Parameter(name = "bucketName", description = "bucket", in = ParameterIn.QUERY)
    })
    public Result<List<S3ObjectSummary>> list(String bucketName) throws Exception {
        List<S3ObjectSummary> results = fileService.listObjects(bucketName, true);
        return Result.success(results);
    }

    @PostMapping("upload")
    @Operation(summary = "【上传文件】", description = "Hui Liu")
    @Parameters(value = {
            @Parameter(name = "file", description = "文件", in = ParameterIn.QUERY)
    })
    public Result<PutObjectResult> upload(MultipartFile file) throws Exception {
        PutObjectResult result = fileService.putObject(null, file.getOriginalFilename(), file.getInputStream(), file.getContentType());
        return Result.success(result);
    }

    @PostMapping("preview")
    @Operation(summary = "【获取预览url】", description = "Hui Liu")
    @Parameters(value = {
            @Parameter(name = "filename", description = "文件名", in = ParameterIn.QUERY)
    })
    public Result<String> preview(@RequestParam String filename) throws Exception {
        String result = fileService.getPreSignViewUrl(null, filename, DateTool.fromNow(Duration.ofHours(1L)));
        return Result.success(result);
    }

    @GetMapping("download")
    @Operation(summary = "【下载文件】", description = "Hui Liu")
    @Parameters(value = {
            @Parameter(name = "filename", description = "文件名", in = ParameterIn.QUERY)
    })
    public void download(@RequestParam String filename, HttpServletResponse response) throws Exception {
        S3Object object = fileService.getObject(null, filename);
        byte[] results = object.getObjectContent().readAllBytes();
        download(response, filename, results);
    }

    public void download(HttpServletResponse response, String filename, byte[] bytes) throws IOException {
        try {
            // 防止中文乱码
            String encodedFilename = URLEncoder.encode(filename, StandardCharsets.UTF_8.name())
                    .replaceAll("\\+", "%20");

            MediaType mediaType = MediaTypeFactory.getMediaType(filename)
                    .orElse(MediaType.APPLICATION_OCTET_STREAM);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentLength(bytes.length);
            headers.setContentType(mediaType);
            headers.setAccessControlAllowOrigin("*");
            headers.setContentDisposition(ContentDisposition.attachment().filename(encodedFilename).build());

            for (Map.Entry<String, List<String>> entry : headers.entrySet()) {
                response.setHeader(entry.getKey(), entry.getValue().getFirst());
            }
            ServletOutputStream outputStream = response.getOutputStream();
            outputStream.write(bytes);
            outputStream.flush();
        } catch (Exception e) {
            throw BizException.throwException(ResponseEnum.EXCEL_EXPORT_ERROR.getDesc(), e);
        }
    }
}
```

### 3.2 业务接口定义
```java
public interface FileService {

    Bucket createBucket(String bucketName) throws Exception;

    List<Bucket> listBuckets() throws Exception;

    void removeBucket(String bucketName) throws Exception;

    List<S3ObjectSummary> listObjects(String bucketName, boolean recursive) throws Exception;

    PutObjectResult putObject(String bucketName, String objectName, InputStream inputStream, String contentType) throws Exception;

    String getPreSignViewUrl(String bucketName, String filename, Date expireAt) throws Exception;

    S3Object getObject(String bucketName, String filename) throws Exception;

}
```

### 3.3 业务实现类
```java
@Slf4j
@Service
public class FileServiceImpl implements FileService {

    @Resource
    private OssTemplate ossTemplate;

    @Override
    public Bucket createBucket(String bucketName) throws Exception {
        return ossTemplate.createBucket(bucketName);
    }

    @Override
    public List<Bucket> listBuckets() throws Exception {
        return ossTemplate.listBuckets();
    }

    @Override
    public void removeBucket(String bucketName) throws Exception {
        ossTemplate.removeBucket(bucketName);
    }

    @Override
    public List<S3ObjectSummary> listObjects(String bucketName, boolean recursive) throws Exception {
        return ossTemplate.listObjects(bucketName, recursive);
    }

    @Override
    public PutObjectResult putObject(String bucketName, String objectName, InputStream inputStream, String contentType) throws Exception {
        return ossTemplate.putObject(bucketName, objectName, inputStream, contentType);
    }

    @Override
    public String getPreSignViewUrl(String bucketName, String filename, Date expireAt) throws Exception {
        return ossTemplate.getPreSignViewUrl(bucketName, filename, expireAt);
    }

    @Override
    public S3Object getObject(String bucketName, String filename) throws Exception {
        return ossTemplate.getObject(bucketName, filename);
    }

}
```

### 3.4 接口调用示例
```shell
# 创建bucket
curl -X POST 'http://localhost:10030/demo/oss/bucket/create?bucketName=test'

# 获取bucket列表
curl -X GET 'http://localhost:10030/demo/oss/bucket/list'

# 删除bucket
curl -X DELETE 'http://localhost:10030/demo/oss/bucket/delete?bucketName=test'

# 获取文件列表
curl -X GET 'http://localhost:10030/demo/oss/list?bucketName=test'

# 上传文件
curl -X POST 'http://localhost:10030/demo/oss/upload?bucketName=test'  -H "Content-Type: multipart/form-data" --form 'file=@C:/Users/light/Desktop/temp.yaml'

# 获取文件预览url
curl -X POST 'http://localhost:10030/demo/oss/preview?filename=temp'

# 下载文件
curl -X GET 'http://localhost:10030/demo/oss/download?filename=temp.yaml' -o temp.yaml
```

## 四、分片下载
支持将文件分片下载，可由客户端指定每个分片的大小
### 4.1 接口定义
```java
/**
 * 断点下载 <p>
 * https://mp.weixin.qq.com/s/HMIMpbDvuMmPU-ax43BzuA <p>
 * https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html <p>
 * https://help.aliyun.com/document_detail/39571.html <p>
 */
@GetMapping("downloadChunk")
@Operation(summary = "【下载文件(支持分片)】", description = "Hui Liu")
@Parameters(value = {
        @Parameter(name = "bucketName", description = "bucket", in = ParameterIn.QUERY),
        @Parameter(name = "objectName", description = "文件名", in = ParameterIn.QUERY),
        @Parameter(name = "range", description = "下载的范围 bytes=0-, bytes=1024-2048, bytes=-4096", in = ParameterIn.QUERY),
})
public void downloadChunk(@RequestParam String bucketName, @RequestParam String objectName, @RequestParam(required = false) String range, HttpServletResponse response) throws Exception {
    ChunkDownload chunkDownload = fileService.downloadFile(bucketName, objectName, range);
    byte[] bytes = chunkDownload.getS3Object().getObjectContent().readAllBytes();
    download(response, bytes, chunkDownload.getStartByte(), chunkDownload.getEndByte());
}

public void download(HttpServletResponse response, byte[] bytes, Long startByte, Long endByte) throws IOException {
    // 设置HTTP响应头
    HttpHeaders headers = new HttpHeaders();
    headers.setContentLength(bytes.length);
    headers.set(HttpHeaders.CONTENT_RANGE, String.format("bytes %d-%d/%d", startByte, endByte, bytes.length));
    for (Map.Entry<String, List<String>> entry : headers.entrySet()) {
        response.setHeader(entry.getKey(), entry.getValue().getFirst());
    }
    // 设置响应状态码
    response.setStatus(HttpStatus.PARTIAL_CONTENT.value());
    // 设置响应字节
    ServletOutputStream outputStream = response.getOutputStream();
    outputStream.write(bytes);
    outputStream.flush();
}
```

### 4.2 业务接口定义
```java
/**
     * 下载文件 <p>
     * Tips： 支持断点下载
     *
     * @param bucketName 文件标识MD5
     * @param objectName 文件标识MD5
     * @param range      范围
     */
    ChunkDownload downloadFile(String bucketName, String objectName, String range) throws Exception;
```

### 4.3 业务实现类
```java
@Override
public ChunkDownload downloadFile(String bucketName, String objectName, String range) throws Exception {
    ObjectMetadata objectMetadata = ossTemplate.getObjectMetadata(bucketName, objectName);
    Long totalSize = objectMetadata.getContentLength();
    // 处理字节信息
    ChunkDownload chunkDownload = executeRangeInfo(range, totalSize);

    // rangeInfo = null，直接下载整个文件
    S3Object s3Object = null;
    if (Objects.isNull(chunkDownload)) {
        chunkDownload = new ChunkDownload();
        s3Object = ossTemplate.getObject(bucketName, objectName);
    } else {
        // 下载部分文件
        s3Object = ossTemplate.getObjectWithRange(bucketName, objectName,
                chunkDownload.getStartByte(), chunkDownload.getEndByte());
    }

    chunkDownload.setTotalSize(totalSize);
    chunkDownload.setS3Object(s3Object);
    chunkDownload.setPartSize(s3Object.getObjectMetadata().getContentLength());
    return chunkDownload;
}

private ChunkDownload executeRangeInfo(String range, Long fileSize) {
    if (StringUtils.isEmpty(range) || !range.contains("bytes=") || !range.contains("-")) {
        return null;
    }

    long startByte = 0;
    long endByte = fileSize - 1;
    range = range.substring(range.lastIndexOf("=") + 1).trim();
    String[] ranges = range.split("-");
    if (ranges.length <= 0 || ranges.length > 2) {
        return null;
    }

    try {
        if (ranges.length == 1) {
            if (range.startsWith("-")) {
                // 1. 如：bytes=-1024  从开始字节到第1024个字节的数据
                endByte = Long.parseLong(ranges[0]);
            } else if (range.endsWith("-")) {
                // 2. 如：bytes=1024-  第1024个字节到最后字节的数据
                startByte = Long.parseLong(ranges[0]);
            }
        } else {
            // 3. 如：bytes=1024-2048  第1024个字节到2048个字节的数据
            startByte = Long.parseLong(ranges[0]);
            endByte = Long.parseLong(ranges[1]);
        }
    } catch (NumberFormatException e) {
        startByte = 0;
        endByte = fileSize - 1;
    }

    if (startByte >= fileSize) {
        log.error("range error, startByte >= fileSize. startByte: {}, fileSize: {}", startByte, fileSize);
        return null;
    }

    return BuilderTool.of(ChunkDownload.class)
            .with(ChunkDownload::setStartByte, startByte)
            .with(ChunkDownload::setEndByte, endByte)
            .build();
}
```

### 4.4 接口调用示例
```shell
# 下载分片1
curl -X GET 'http://localhost:10030/demo/oss/downloadChunk?bucketName=light&objectName=temp.yaml&range=bytes=0-102400' -o temp.yaml.1

# 下载分片2
curl -X GET 'http://localhost:10030/demo/oss/downloadChunk?bucketName=light&objectName=temp.yaml&range=bytes=102401-204800' -o temp.yaml.2

# 下载分片3
curl -X GET 'http://localhost:10030/demo/oss/downloadChunk?bucketName=light&objectName=temp.yaml&range=bytes=204801-' -o temp.yaml.3
```

## 五、分片上传
对于超大文件的上传，可以在前端对文件惊醒切分，分片上传
- 校验当前文件是否存在
- 初始化上传任务
- 获取预签名的上传URL，前端直传到S3
- 上传分片
- 获取所有分片
- 合并分片

### 5.1 接口定义
```java
@GetMapping("chunkUpload/validate/{identifier}")
@Operation(summary = "【断点续传：上传前的校验】", description = "Hui Liu")
@Parameters(value = {
        @Parameter(name = "identifier", description = "待上传文件的MD5", in = ParameterIn.PATH)
})
public Result<TaskInfo> validate(@PathVariable("identifier") String identifier) throws Exception {
    TaskInfo result = fileService.getTaskInfo(identifier);
    return Result.success(result);
}

@PostMapping("chunkUpload/initTask")
@Operation(summary = "【断点续传：初始化上传任务】", description = "Hui Liu")
public Result<TaskInfo> initTask(@RequestBody InitTaskParam param) throws Exception {
    TaskInfo result = fileService.initTask(param);
    return Result.success(result);
}

@GetMapping("chunkUpload/{identifier}/{partNumber}")
@Operation(summary = "【断点续传：获取分片的预签名上传地址】", description = "Hui Liu")
@Parameters(value = {
        @Parameter(name = "identifier", description = "待上传文件的MD5", in = ParameterIn.PATH),
        @Parameter(name = "partNumber", description = "分片号", in = ParameterIn.PATH)
})
public Result<String> preSignUploadUrl(@PathVariable("identifier") String identifier,
                                        @PathVariable("partNumber") Integer partNumber) throws Exception {
    TaskInfo taskInfo = fileService.getTaskInfo(identifier);
    if (Objects.isNull(taskInfo)) {
        Result.failure(400, "分片任务不存在");
    }
    Map<String, String> params = new HashMap<>(16);
    params.put("partNumber", partNumber.toString());
    params.put("uploadId", taskInfo.getUploadId());
    String result = fileService.getPreSignUploadUrl(taskInfo.getBucketName(), taskInfo.getObjectName(),
            DateTool.fromNow(Duration.ofHours(1L)), params);
    return Result.success(result);
}

@PostMapping("chunkUpload/uploadPart")
@Operation(summary = "【断点续传：上传分片】", description = "Hui Liu")
@Parameters(value = {
        @Parameter(name = "bucketName", description = "bucket", in = ParameterIn.QUERY),
        @Parameter(name = "objectName", description = "文件名", in = ParameterIn.QUERY),
        @Parameter(name = "uploadId", description = "上传id", in = ParameterIn.QUERY),
        @Parameter(name = "partNumber", description = "分片号", in = ParameterIn.QUERY),
})
public Result<UploadPartResult> uploadPart(@RequestParam String bucketName, @RequestParam String objectName,
                                            @RequestParam String uploadId, @RequestParam Integer partNumber,
                                            MultipartFile file) throws Exception {
    UploadPartResult result = fileService.uploadPart(bucketName, objectName, uploadId, file.getInputStream(), partNumber);
    return Result.success(result);
}

@GetMapping("chunkUpload/listParts")
@Operation(summary = "【断点续传：分片列表】", description = "Hui Liu")
@Parameters(value = {
        @Parameter(name = "bucketName", description = "bucket", in = ParameterIn.QUERY),
        @Parameter(name = "objectName", description = "文件名", in = ParameterIn.QUERY),
        @Parameter(name = "uploadId", description = "上传id", in = ParameterIn.QUERY),
})
public Result<List<PartSummary>> listParts(@RequestParam String bucketName, @RequestParam String objectName,
                                            @RequestParam String uploadId) throws Exception {
    List<PartSummary> results = fileService.listParts(bucketName, objectName, uploadId);
    return Result.success(results);
}

/**
 * 断点续传：合并分片
 */
@GetMapping("chunkUpload/merge/{identifier}")
@Operation(summary = "【断点续传：合并分片】", description = "Hui Liu")
@Parameters(value = {
        @Parameter(name = "identifier", description = "待上传文件的MD5", in = ParameterIn.PATH)
})
public Result<CompleteMultipartUploadResult> mergeParts(@PathVariable("identifier") String identifier) throws Exception {
    TaskInfo taskInfo = fileService.getTaskInfo(identifier);
    if (Objects.isNull(taskInfo)) {
        Result.failure(400, "分片任务不存在");
    }
    if (YesNoEnum.NO.eqValue(taskInfo.getFinish())) {
        CompleteMultipartUploadResult result = fileService.completeMultiUpload(taskInfo.getBucketName(), taskInfo.getObjectName(),
                taskInfo.getUploadId(), taskInfo.getChunkNum());

        return Result.success(result);
    }
    return Result.success(null);
}
```

### 5.2 业务接口定义
```java
/**
 * 根据文件的唯一标识获取文件信息
 */
TaskInfo getTaskInfo(String identifier) throws Exception;

/**
 * 初始化一个任务
 */
TaskInfo initTask(InitTaskParam param) throws Exception;

String getPreSignUploadUrl(String bucketName, String objectName, Date expireAt, Map<String, String> params) throws Exception;

UploadPartResult uploadPart(String bucketName, String objectName, String uploadId, InputStream inputStream, Integer partNumber) throws Exception;

List<PartSummary> listParts(String bucketName, String objectName, String uploadId) throws Exception;

CompleteMultipartUploadResult completeMultiUpload(String bucketName, String objectName, String uploadId, Integer chunkNum) throws Exception;
```

### 5.3 业务实现类
```java
@Override
public TaskInfo getTaskInfo(String identifier) throws Exception {
    // 从DB查询分片信息
    SliceUpload sliceUpload = sliceUploadService.queryByIdentifier(identifier);

    // 没有分片信息，表示还未初始化分片上传任务
    if (Objects.isNull(sliceUpload)) {
        return null;
    }

    // 文件是否存在，存在表示上传完成，不存在表示未完成
    Boolean exists = ossTemplate.doesObjectExist(sliceUpload.getBucketName(), sliceUpload.getObjectName());
    if (exists) {
        return BuilderTool.of(TaskInfo.class)
                .with(TaskInfo::setFilename, sliceUpload.getFilename())
                .with(TaskInfo::setFileIdentifier, sliceUpload.getFileIdentifier())
                .with(TaskInfo::setBucketName, sliceUpload.getBucketName())
                .with(TaskInfo::setObjectName, sliceUpload.getObjectName())
                .with(TaskInfo::setUploadId, sliceUpload.getUploadId())
                .with(TaskInfo::setTotalSize, sliceUpload.getTotalSize())
                .with(TaskInfo::setChunkSize, sliceUpload.getChunkSize())
                .with(TaskInfo::setChunkNum, sliceUpload.getChunkNum())
                .with(TaskInfo::setFinish, YesNoEnum.YES.getValue())
                .build();
    }
    // 查询已完成的分片
    List<PartSummary> parts = ossTemplate.listParts(sliceUpload.getBucketName(),
            sliceUpload.getObjectName(), sliceUpload.getUploadId());
    return BuilderTool.of(TaskInfo.class)
            .with(TaskInfo::setFilename, sliceUpload.getFilename())
            .with(TaskInfo::setFileIdentifier, sliceUpload.getFileIdentifier())
            .with(TaskInfo::setBucketName, sliceUpload.getBucketName())
            .with(TaskInfo::setObjectName, sliceUpload.getObjectName())
            .with(TaskInfo::setUploadId, sliceUpload.getUploadId())
            .with(TaskInfo::setTotalSize, sliceUpload.getTotalSize())
            .with(TaskInfo::setChunkSize, sliceUpload.getChunkSize())
            .with(TaskInfo::setChunkNum, sliceUpload.getChunkNum())
            .with(TaskInfo::setExistsParts, parts)
            .with(TaskInfo::setFinish, YesNoEnum.NO.getValue())
            .build();
}

@Override
public TaskInfo initTask(InitTaskParam param) throws Exception {
    String filename = param.getFilename();
    String bucketName = ossProperties.getDefaultBucket();
    String suffix = filename.substring(filename.lastIndexOf(".") + 1);
    String objectName = StrUtil.format("{}.{}", IdUtil.randomUUID(), suffix);

    // 从S3获取上传id
    InitiateMultipartUploadResult initiateMultipartUploadResult = ossTemplate.initMultiUpload(bucketName, objectName);
    String uploadId = initiateMultipartUploadResult.getUploadId();

    // 持久化到数据库
    int chunkNum = (int) Math.ceil(param.getTotalSize() * 1.0 / param.getChunkSize());
    SliceUpload sliceUpload = BuilderTool.of(SliceUpload.class)
            .with(SliceUpload::setFilename, param.getFilename())
            .with(SliceUpload::setFileIdentifier, param.getFileIdentifier())
            .with(SliceUpload::setBucketName, bucketName)
            .with(SliceUpload::setObjectName, objectName)
            .with(SliceUpload::setUploadId, uploadId)
            .with(SliceUpload::setTotalSize, param.getTotalSize())
            .with(SliceUpload::setChunkSize, param.getChunkSize())
            .with(SliceUpload::setChunkNum, chunkNum)
            .build();
    sliceUploadService.save(sliceUpload);

    // 返回结果
    return BuilderTool.of(TaskInfo.class)
            .with(TaskInfo::setUploadId, sliceUpload.getUploadId())
            .with(TaskInfo::setBucketName, sliceUpload.getBucketName())
            .with(TaskInfo::setObjectName, sliceUpload.getObjectName())
            .with(TaskInfo::setFinish, YesNoEnum.NO.getValue())
            .build();
}

@Override
public String getPreSignUploadUrl(String bucketName, String objectName, Date expireAt, Map<String, String> params) throws Exception {
    return ossTemplate.getPreSignUploadUrl(bucketName, objectName, expireAt, params);
}

@Override
public UploadPartResult uploadPart(String bucketName, String objectName, String uploadId, InputStream inputStream, Integer partNumber) throws Exception {
    SliceUpload sliceUpload = sliceUploadService.querySliceUpload(bucketName, objectName, uploadId);
    if (Objects.isNull(sliceUpload)) {
        throw BizException.throwException("未找到上传信息! bucketName: %s, bucketName: %s, bucketName: %s",
                bucketName, objectName, uploadId);
    }
    return ossTemplate.uploadPart(bucketName, objectName, uploadId, inputStream, partNumber);
}

@Override
public List<PartSummary> listParts(String bucketName, String objectName, String uploadId) throws Exception {
    return ossTemplate.listParts(bucketName, objectName, uploadId);
}

@Override
public CompleteMultipartUploadResult completeMultiUpload(String bucketName, String objectName, String uploadId, Integer chunkNum) throws Exception {
    return ossTemplate.completeMultiUpload(bucketName, objectName, uploadId, chunkNum);
}
```

### 5.4 接口调用示例
**注意：** MinIO S3 等对文件分片大小有要求(> 5MB)，太小的文件不支持合并
```shell
# 上传前的校验
curl -X GET 'http://localhost:10030/demo/oss/chunkUpload/validate/file-md5'

# 初始化上传任务
curl -X POST 'http://localhost:10030/demo/oss/chunkUpload/initTask' \
--header 'MockSeed: 1' \
--header 'Content-Type: application/json' \
--data-raw '{
    "fileIdentifier": "file-md5",
    "filename": "temp.yaml",
    "totalSize": 265135,
    "chunkSize": 102400,
    "chunkNum": 3
}'

# 上传分片
curl -X POST 'http://localhost:10030/demo/oss/chunkUpload/uploadPart' \
--header 'MockSeed: 1' \
--form 'bucketName="light"' \
--form 'objectName="b16f23a1-fcd5-4bc1-a4b6-2d9034f58f87.yaml"' \
--form 'uploadId="YjIxYmUxZDgtMGFiYS00NGU3LWJlNTUtM2JiZTU2MWI2ZmJmLjc1YmVmODBiLWY4MDgtNDZiMi05ODQ3LWE1OTU1NjNlYWE0Mg"' \
--form 'partNumber="1"' \
--form 'file=@C:/Users/light/Desktop/temp.yaml.1'

curl -X POST 'http://localhost:10030/demo/oss/chunkUpload/uploadPart' \
--header 'MockSeed: 1' \
--form 'bucketName="light"' \
--form 'objectName="b16f23a1-fcd5-4bc1-a4b6-2d9034f58f87.yaml"' \
--form 'uploadId="YjIxYmUxZDgtMGFiYS00NGU3LWJlNTUtM2JiZTU2MWI2ZmJmLjc1YmVmODBiLWY4MDgtNDZiMi05ODQ3LWE1OTU1NjNlYWE0Mg"' \
--form 'partNumber="2"' \
--form 'file=@C:/Users/light/Desktop/temp.yaml.2'

curl -X POST 'http://localhost:10030/demo/oss/chunkUpload/uploadPart' \
--header 'MockSeed: 1' \
--form 'bucketName="light"' \
--form 'objectName="b16f23a1-fcd5-4bc1-a4b6-2d9034f58f87.yaml"' \
--form 'uploadId="YjIxYmUxZDgtMGFiYS00NGU3LWJlNTUtM2JiZTU2MWI2ZmJmLjc1YmVmODBiLWY4MDgtNDZiMi05ODQ3LWE1OTU1NjNlYWE0Mg"' \
--form 'partNumber="3"' \
--form 'file=@C:/Users/light/Desktop/temp.yaml.3'

# 分片列表
curl -X GET 'http://localhost:10030/demo/oss/chunkUpload/listParts?bucketName=light&objectName=b16f23a1-fcd5-4bc1-a4b6-2d9034f58f87.yaml&uploadId=YjIxYmUxZDgtMGFiYS00NGU3LWJlNTUtM2JiZTU2MWI2ZmJmLjc1YmVmODBiLWY4MDgtNDZiMi05ODQ3LWE1OTU1NjNlYWE0Mg'

# 获取预签名上传地址
curl -X GET 'http://localhost:10030/demo/oss/chunkUpload/file-md5/1' --header 'MockSeed: 1'

# 合并分片
curl -X GET 'http://localhost:10030/demo/oss/chunkUpload/merge/file-md5'
```
