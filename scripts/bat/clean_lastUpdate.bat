@REM 简化删除指令
echo for /r %i in (*.lastUpdated) do del %i

@REM Malformed \uxxxx encoding.
@REM echo for /r %i in (resolver-status.properties) do del %i