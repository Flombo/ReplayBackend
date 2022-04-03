class ReplayBuilder {

    public static buildReplays(replays) : string {
        let replayHTML = '<div class="replayContainer">';

        replays.map(replay => {
            replayHTML += `<div class="replay more" title="${replay._id}">`
                            + `<div class="replayHeader">`
                                + `<div>${replay.name}</div>`
                                + `<div>${replay.tag}</div>`
                                + `<div>${replay.timestamp}</div>`
                                + `<button>➕</button>`
                            + `</div>`
                           + `</div>`
        });

        replayHTML += '</div>';

        return replayHTML;
    }

    public static buildReplayDetails(replay) : string {
        const detailContainers = this.buildRotationContainer(replay.rotation)
            + this.buildPositionContainer(replay.position)
            + this.buildIsActiveContainer(replay.isActive);

        return `<div class="replayDetails">${detailContainers}</div>`;
    }

    private static buildPositionContainer(position) : string {
        return `<div><p>x: ${position.x}</p><p>y: ${position.y}</p><p>z: ${position.z}</p></div>`;
    }

    private static buildRotationContainer(rotation) : string {
        return `<div><p>x: ${rotation.x}</p><p>y: ${rotation.y}</p><p>z: ${rotation.z}</p><p>w: ${rotation.w}</p></div>`
    }

    private static buildIsActiveContainer(isActive) : string {
        return `<div>isActive: ${isActive}</div>`;
    }

}

module.exports = ReplayBuilder;