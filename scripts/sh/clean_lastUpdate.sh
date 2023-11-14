#!/bin/bash
echo "开始清除..."

find . -name "*lastUpdated" | xargs rm -fr

echo "清除完毕!!!"

# Malformed \uxxxx encoding.
find . -name "resolver-status.properties" | xargs rm -fr