## 降采样
- 降采样 https://docs.influxdata.com/influxdb/v1.8/guides/downsample_and_retain/
- RP: https://archive.docs.influxdata.com/influxdb/v1.2/query_language/database_management/#retention-policy-management
- CQ: https://archive.docs.influxdata.com/influxdb/v1.2/query_language/continuous_queries/


## Retention Policy
- https://docs.influxdata.com/influxdb/v1.8/query_language/manage-database/#retention-policy-management


## Continuous Query
- https://docs.influxdata.com/influxdb/v1.8/query_language/continuous_queries/
- https://docs.influxdata.com/influxdb/v1.8/query_language/functions/

## 准备工作
```shell
# 创建数据库
CREATE DATABASE seconds_36;

# 删除MEASUREMENT
DROP MEASUREMENT rq_36_test1;

# 修改保留策略
ALTER RETENTION POLICY default ON "yunyi" DURATION 52w REPLICATION 1 DEFAULT;
```

## 使用Continuous Query降采样
```shell
# 创建保留策略
CREATE RETENTION POLICY "rp_36" ON "yunyi" DURATION 2w REPLICATION 1;

# 创建连续查询 
# EVERY 36s 每隔36s执行一次，
# FOR   36s 统计36s之内的数据
CREATE CONTINUOUS QUERY "cq_36_test1" ON "yunyi"
RESAMPLE EVERY 36s
BEGIN 
    SELECT mean(*::field) INTO "rp_36"."cq_36_test1" FROM "test1" GROUP BY time(36s),* fill(0);
END;

# 查询连续查询
SHOW CONTINUOUS QUERIES;

# 删除连续查询
DROP CONTINUOUS QUERY "cq_36_test1" ON "yunyi";

# 查询原始数据
SELECT mean(*::field),min(*::field),max(*::field) FROM test1 GROUP BY time(36s),* fill(0);

# 查询采样结果
SELECT * FROM "rp_36"."rp_36_test1";
```

## 批量创建降采样 RP CQ
### DownSampleParam

```java
package com.light.cloud.downsample.param;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * 创建RP
 *
 * @author Hui Liu
 * @date 2023/6/10
 */
@Data
public class DownSampleParam implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty("数据库名称 pd")
    private String databaseName;

    @ApiModelProperty("RP名称 rp_36")
    private String rpName;

    @ApiModelProperty("RP存储时间 2w")
    private String rpDuration;

    @ApiModelProperty("CQ名称前缀 cq_36")
    private String cqPrefix;

    @ApiModelProperty("执行时间间隔 36s")
    private String execInterval;

    @ApiModelProperty("GROUP BY时间间隔 36s")
    private String groupInterval;

    @ApiModelProperty("数据表名 test2")
    private List<String> measurements;

    @ApiModelProperty("对所有表创建降采样 0-否；1-是")
    private Integer allMeasurements;

    @ApiModelProperty("覆盖已存在的CQ 0-否；1-是")
    private Integer overrideCQ;

}
```

### DownSampleController

```java
package com.light.cloud.downsample.controller;

import com.light.cloud.constant.config.Result;
import com.light.cloud.downsample.param.DownSampleParam;
import com.light.cloud.downsample.service.DownSampleService;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.util.List;

/**
 * 降采样配置接口
 *
 * @author Hui Liu
 * @date 2023/6/10
 */
@RestController
@RequestMapping("/downsample")
@Api(tags = "降采样")
@Slf4j
public class DownSampleController {

    @Resource
    private DownSampleService downSampleService;

    @ApiOperation("初始化降采样配置")
    @PostMapping(value = "initSetting")
    public Result<Boolean> initSetting(@RequestBody DownSampleParam param) {
        downSampleService.initSetting(param);
        return Result.OK(true);
    }

    @ApiOperation("创建RP")
    @PostMapping(value = "rp")
    public Result<Boolean> createRP(@RequestBody DownSampleParam param) {
        downSampleService.createRP(param);
        return Result.OK(true);
    }

    @ApiOperation("创建CQ")
    @PostMapping(value = "cq")
    public Result<Boolean> createCQ(@RequestBody DownSampleParam param) {
        downSampleService.createCQ(param);
        return Result.OK(true);
    }

    @ApiOperation("查询CQ")
    @GetMapping(value = "queryCQ")
    public Result<List<String>> queryCQ(String databaseName) {
        List<String> cqs = downSampleService.queryCQ(databaseName);
        return Result.OK(cqs);
    }
}
```

### DownSampleService

```java
package com.light.cloud.downsample.service;

import java.util.List;

/**
 * 降采样配置业务类
 *
 * @author Hui Liu
 * @date 2023/6/10
 */
public interface DownSampleService {

    void initSetting(DownSampleParam param);

    void createRP(DownSampleParam param);

    void createCQ(DownSampleParam param);

    List<String> queryCQ(String databaseName);
}

```

### DownSampleServiceImpl

```java
package com.light.cloud.downsample.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;

import com.light.cloud.constant.enumerate.YesNoEnum;
import com.light.cloud.common.influxDb.TimingDbService;
import com.light.cloud.measurement.entity.Measurement;
import com.light.cloud.measurement.service.MeasurementService;

import org.apache.commons.collections4.CollectionUtils;
import org.influxdb.dto.QueryResult;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 降采样配置业务类
 *
 * @author Hui Liu
 * @date 2023/6/10
 */
@Service
public class DownSampleServiceImpl implements DownSampleService {

    // rpName  database  rpDuration
    public static final String CREATE_RP = "CREATE RETENTION POLICY \"%s\" ON \"%s\" DURATION  %s REPLICATION 1";
    // cqPrefix_measurement  database  execInterval  rpName  cqPrefix_measurement  measurement
    public static final String CREATE_CQ = "CREATE CONTINUOUS QUERY \"%s\" ON \"%s\"\n" +
            "RESAMPLE EVERY %s\n" +
            "BEGIN \n" +
            "    SELECT mean(*::field), min(*::field), max(*::field) INTO \"%s\".\"%s\" FROM \"%s\" GROUP BY time(%s)\n" +
            "END";

    public static final String QUERY_CQ = "SHOW CONTINUOUS QUERIES";
    // cqName database
    public static final String DELETE_CQ = "DROP CONTINUOUS QUERY \"%s\" ON \"%s\"";

    @Resource
    private MeasurementService measurementService;

    @Resource
    private TimingDbService timingDbService;

    @Override
    public void initSetting(DownSampleParam param) {
        createRP(param);
        if (YesNoEnum.YES.eqValue(param.getAllMeasurements())) {
            LambdaQueryWrapper<Measurement> queryWrapper = Wrappers.lambdaQuery(Measurement.class)
                    .select(Measurement::getName);
            List<Measurement> measurements = measurementService.list(queryWrapper);
            List<String> measurementNames = measurements.stream()
                    .map(Measurement::getName).collect(Collectors.toList());
            param.setMeasurements(measurementNames);
        }
        createCQ(param);
    }

    @Override
    public void createRP(DownSampleParam param) {
        String command = String.format(CREATE_RP, 
        param.getRpName(), 
        param.getDatabaseName(), 
        param.getRpDuration());
        timingDbService.query(command);
    }

    @Override
    public void createCQ(DownSampleParam param) {
        QueryResult result = timingDbService.query(QUERY_CQ);
        List<QueryResult.Result> results = result.getResults();
        if (CollectionUtils.isEmpty(results) || CollectionUtils.isEmpty(results.get(0).getSeries())) {
            return;
        }
        Boolean overrideCQ = YesNoEnum.YES.eqValue(param.getOverrideCQ());
        String cqPrefix = param.getCqPrefix();
        List<String> measurements = param.getMeasurements();
        List<QueryResult.Series> seriesList = results.get(0).getSeries();
        for (QueryResult.Series series : seriesList) {
            if (series.getName().equals(param.getDatabaseName()) && CollectionUtils.isNotEmpty(series.getValues())) {
                List<String> columns = series.getColumns();
                List<List<Object>> valuesList = series.getValues();
                int index = Collections.binarySearch(columns, "name");
                for (List<Object> values : valuesList) {
                    String cqName = (String) values.get(index);
                    if (cqName.startsWith(cqPrefix + "_")) {
                        // 删除旧的 CQ
                        if (overrideCQ) {
                            overrideCQ(cqName, param.getDatabaseName());
                        } else {
                            // 保留旧的CQ
                            measurements.remove(cqName.substring(cqPrefix.length() + 1));
                        }
                    }
                }

            }
        }

        for (String measurement : measurements) {
            String command = String.format(CREATE_CQ,
                    cqPrefix + "_" + measurement,
                    param.getDatabaseName(), param.getExecInterval(), param.getRpName(),
                    cqPrefix + "_" + measurement,
                    measurement, param.getGroupInterval());

            timingDbService.query(command);
        }
    }

    private void overrideCQ(String cqName, String databaseName) {
        String command = String.format(DELETE_CQ, cqName, databaseName);
        timingDbService.query(command);
    }

    @Override
    public List<String> queryCQ(String databaseName) {
        QueryResult result = timingDbService.query(QUERY_CQ);
        List<QueryResult.Result> results = result.getResults();
        if (CollectionUtils.isEmpty(results) || CollectionUtils.isEmpty(results.get(0).getSeries())) {
            return Collections.emptyList();
        }

        List<String> resultList = new ArrayList<>();
        List<QueryResult.Series> seriesList = results.get(0).getSeries();
        for (QueryResult.Series series : seriesList) {
            if (series.getName().equals(databaseName) && CollectionUtils.isNotEmpty(series.getValues())) {
                List<String> columns = series.getColumns();
                List<List<Object>> valuesList = series.getValues();
                int index = Collections.binarySearch(columns, "name");
                for (List<Object> values : valuesList) {
                    String cqName = (String) values.get(index);
                    resultList.add(cqName);
                }
            }
        }
        return resultList;
    }

}

```

### 参数示例

```json
// 8小时的数据  间隔4s
{
  "databaseName": "pd",
  "rpName": "rp_4",
  "rpDuration": "1d",
  "cqPrefix": "cq_4",
  "execInterval": "4s",
  "groupInterval": "4s",
  "measurements": [
    "test1",
    "test2"
  ],
  "overrideCQ": 0,
  "allMeasurements": 1
}

// 24小时的数据  间隔12s
{
  "databaseName": "pd",
  "rpName": "rp_12",
  "rpDuration": "3d",
  "cqPrefix": "cq_12",
  "execInterval": "12s",
  "groupInterval": "12s",
  "measurements": [
    "test1",
    "test2"
  ],
  "overrideCQ": 0,
  "allMeasurements": 1
}

// 72小时的数据  间隔36s
{
  "databaseName": "pd",
  "rpName": "rp_36",
  "rpDuration": "2w",
  "cqPrefix": "cq_36",
  "execInterval": "36s",
  "groupInterval": "36s",
  "measurements": [
    "test1",
    "test2"
  ],
  "overrideCQ": 0,
  "allMeasurements": 1
}
```
