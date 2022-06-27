class MessagePackToJSONDeserializer {

    deserializeMessage(decodedMessage) {
        const message = {
            MessageType : decodedMessage[0],
            ReplayName : decodedMessage[1]
        }

        switch (message.MessageType) {
            case "getreplaybatch":
                message.Name = decodedMessage[2];
                break;
            case "setreplayrecords":
                message.ReplayRecords = this.buildReplayRecords(decodedMessage[2]);
                break;
            case "setaudiorecords":
                message.AudioRecords = this.buildAudioRecords(decodedMessage[2]);
                break;
            case "setanimationrecords":
                message.AnimationRecords = this.buildAnimationRecords(decodedMessage[2]);
                break;
            case "createtimelineevent":
                message.Type = decodedMessage[2];
                message.StartTime = decodedMessage[3];
                message.EndTime = decodedMessage[4];
                message.EventDescription = decodedMessage[5];
                message.GameObjectName = decodedMessage[6];
                break;
        }

        return message;
    }

    buildReplayRecords(replayRecordsBytes) {
        const replayRecords = [];

        for(let i = 0; i < replayRecordsBytes.length; i++) {
            replayRecords.push({
                GameObjectName: replayRecordsBytes[i][0],
                Timestamp: replayRecordsBytes[i][1],
                Position: {
                    x : replayRecordsBytes[i][2][0],
                    y : replayRecordsBytes[i][2][1],
                    z : replayRecordsBytes[i][2][2],
                },
                Rotation: {
                    x : replayRecordsBytes[i][3][0],
                    y : replayRecordsBytes[i][3][1],
                    z : replayRecordsBytes[i][3][2],
                    w : replayRecordsBytes[i][3][3],
                },
                IsActive: replayRecordsBytes[i][4],
            })
        }

        return replayRecords;
    }

    buildAudioRecords(audioRecordsBytes) {
        const audioRecords = [];

        for(let i = 0; i < audioRecordsBytes.length; i++) {
            audioRecords.push({
                GameObjectName: audioRecordsBytes[i][0],
                Timestamp: audioRecordsBytes[i][1],
                AudioClipName: audioRecordsBytes[i][2],
                IsPlaying: audioRecordsBytes[i][3],
                Time: audioRecordsBytes[i][4],
            })
        }

        return audioRecords;
    }

    /**
     * @param animationRecordsBytes
     * @returns {*[]}
     */
    buildAnimationRecords(animationRecordsBytes) {
        const animationRecords = [];

        for(let i = 0; i < animationRecordsBytes.length; i++) {
            animationRecords.push({
                GameObjectName: animationRecordsBytes[i][0],
                Timestamp: animationRecordsBytes[i][1],
                AnimatorName: animationRecordsBytes[i][2],
                AnimationControllerName: animationRecordsBytes[i][3],
                AnimationStateFullPathHash: animationRecordsBytes[i][4],
                NormalizedTime: animationRecordsBytes[i][5],
            })
        }

        return animationRecords;
    }
}

module.exports = new MessagePackToJSONDeserializer();