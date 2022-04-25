class ReplayBuilder {

    public static buildReplays(replays) : string {
        let replayHTML = '<div class="replayContainer">';

        replays.map(replay => {
            replayHTML += `<div class="replay more" title="${replay._id}">`
                            + `<div class="replayHeader">`
                                + `<div>${replay.name}</div>`
                                + `<div>${replay.starttime}</div>`
                                + `<button>➕</button>`
                            + `</div>`
                           + `</div>`
        });

        replayHTML += '</div>';

        return replayHTML;
    }

    public static buildReplayDetails(replay) : string {
        const detailContainers = this.buildReplayRecordContainer(replay.replayRecords)
            + this.buildTimeContainer(replay)
            + this.buildUserNameContainer(replay.username);

        return `<div class="replayDetails">${detailContainers}</div>`;
    }

    private static buildTimeContainer(replay) : string {
        return `<div><p>starttime: ${replay.starttime}</p><p>endtime: ${replay.endtime}</p><p>duration: ${replay.duration}</p></div>`;
    }

    private static buildReplayRecordContainer(replayRecords) : string {
        return `<div><p>ReplayRecord-count: ${replayRecords.length}</p></div>`
    }

    private static buildUserNameContainer(userName) : string {
        return `<div><p>userName: ${userName}</p></div>`;
    }

}

module.exports = ReplayBuilder;