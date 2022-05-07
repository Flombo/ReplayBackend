#!/bin/bash
# create config file
sudo docker run --rm influxdb:2.0.7 influxd print-config > config.yml
# create the container
sudo docker run --restart=always --name influxdb -d \
  -p 8086:8086 \
  --volume `pwd`/influxdb2:/var/lib/influxdb2 \
  --volume `pwd`/config.yml:/etc/influxdb2/config.yml \
  influxdb:2.0.7
# wait until the database server is ready
until sudo docker exec influxdb influx ping
do
  echo "Retrying..."
  sleep 5
done
# configure influxdb
sudo docker exec influxdb influx setup \
  --bucket replays \
  --org test \
  --password Ba11Ab22?? \
  --username test \
  --force
# get the token
sudo docker exec influxdb influx auth list | \
awk -v username=test '$5 ~ username {print $4 " "}'