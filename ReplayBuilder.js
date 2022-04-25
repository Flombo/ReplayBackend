var ReplayBuilder = /** @class */ (function () {
    function ReplayBuilder() {
    }
    ReplayBuilder.buildReplays = function (replays) {
        var replayHTML = '<div class="replayContainer">';
        replays.map(function (replay) {
            replayHTML += "<div class=\"replay more\" title=\"" + replay._id + "\">"
                + "<div class=\"replayHeader\">"
                + ("<div>" + replay.name + "</div>")
                + ("<div>" + replay.starttime + "</div>")
                + "<button>\u2795</button>"
                + "</div>"
                + "</div>";
        });
        replayHTML += '</div>';
        return replayHTML;
    };
    ReplayBuilder.buildReplayDetails = function (replay) {
        var detailContainers = this.buildReplayRecordContainer(replay.replayRecords)
            + this.buildTimeContainer(replay)
            + this.buildUserNameContainer(replay.username);
        return "<div class=\"replayDetails\">" + detailContainers + "</div>";
    };
    ReplayBuilder.buildTimeContainer = function (replay) {
        return "<div><p>starttime: " + replay.starttime + "</p><p>endtime: " + replay.endtime + "</p><p>duration: " + replay.duration + "</p></div>";
    };
    ReplayBuilder.buildReplayRecordContainer = function (replayRecords) {
        return "<div><p>ReplayRecord-count: " + replayRecords.length + "</p></div>";
    };
    ReplayBuilder.buildUserNameContainer = function (userName) {
        return "<div><p>userName: " + userName + "</p></div>";
    };
    return ReplayBuilder;
}());
module.exports = ReplayBuilder;
