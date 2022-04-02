class ReplayBuilder {

    /**
     * ➖ ToDo
     * @param replays
     */
    public static buildReplays(replays) : string {
        let replayHTML = '<div class="replayContainer">';

        replays.map(replay => {
            replayHTML += `<div class="replay" title="${replay._id}">`
                            + `<div>${replay.name}</div>`
                            + `<div>${replay.tag}</div>`
                            + `<div>${replay.timestamp}</div>`
                            + `<button class="more">➕</button>`
                           + `</div>`
        });

        replayHTML += '</div>';

        return replayHTML;
    }

}

module.exports = ReplayBuilder;