const {InfluxDB, Point} = require('@influxdata/influxdb-client')
const token = process.env.INFLUXDBTOKEN
const url = process.env.INFLUXDBURL
const org = process.env.INFLUXDBORG
const bucket = process.env.INFLUXDBBUCKET

class InfluxDBHandler {
    constructor() {
        this.client = new InfluxDB({url, token});
        this.writeClient = this.client.getWriteApi(org, bucket, 'ns')
    }

    /**
     * @param replayRecords
     * @returns {Promise<void>}
     */
    async writeReplayRecords(replayRecords) {
        try {
            const replayRecordPoints = [];

            replayRecords.map(replayRecord => {
                const replayRecordPoint = new Point('replayrecord')
                    .tag('replayname', replayRecord.replayname)
                    .tag('gameobjectname', replayRecord.name)
                    .tag('username', replayRecord.userName)
                    .floatField('x', replayRecord.position.x)
                    .floatField('y', replayRecord.position.y)
                    .floatField('z', replayRecord.position.z)
                    .floatField('rotationx', replayRecord.rotation.x)
                    .floatField('rotationy', replayRecord.rotation.y)
                    .floatField('rotationz', replayRecord.rotation.z)
                    .floatField('rotationw', replayRecord.rotation.w)
                    .booleanField('isactive', replayRecord.isActive);
                replayRecordPoints.push(replayRecordPoint);
            });


            this.writeClient.writePoints(replayRecordPoints);
            await this.writeClient.flush();
        } catch (exception) {
            throw exception;
        }

    }

    query() {
        let queryClient = this.client.getQueryApi(org)
        let fluxQuery = `from(bucket: "${bucket}") |> range(start: -10m) |> filter(fn: (r) => r._measurement == "replayrecord")`;
        queryClient.queryRows(fluxQuery, {
            next: (row, tableMeta) => {
                const tableObject = tableMeta.toObject(row)
                console.table(tableObject)
                console.log(row)
            },
            error: (error) => {
                console.error('\nError', error)
            },
            complete: () => {
                console.log('\nSuccess')
            },
        })
    }

    mean() {
        const queryClient = this.client.getQueryApi(org)
        const fluxQuery = `from(bucket: "replays") |> range(start: -30m) |> filter(fn: (r) => r._measurement == "measurement1")|> mean()`

        queryClient.queryRows(fluxQuery, {
            next: (row, tableMeta) => {
                const tableObject = tableMeta.toObject(row)
                console.table(tableObject)
            },
            error: (error) => {
                console.error('\nError', error)
            },
            complete: () => {
                console.log('\nSuccess')
            },
        })
    }
}


module.exports = new InfluxDBHandler();