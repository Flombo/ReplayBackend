#!/bin/bash
sudo docker run --restart=always \
--name mongodb -d \
-p 27017:27017 \
--volume /opt/mongodbdata:/data/db \
--volume /etc/timezone:/etc/timezone:ro \
--volume /etc/localtime:/etc/localtime:ro \
mongo