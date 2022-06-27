var ReplayBuilder = /** @class */ (function () {
    function ReplayBuilder() {
    }
    ReplayBuilder.buildReplays = function (replays) {
        var replayHTML = '<div class="replayContainer">';
        replays.map(function (replay) {
            replayHTML += "<div class=\"replay more\" title=\"".concat(replay._id, "\">")
                + "<div class=\"replayHeader\">"
                + "<div>".concat(replay.name, "</div>")
                + "<div>".concat(replay.starttime, "</div>")
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
        return "<div class=\"replayDetails\">".concat(detailContainers, "</div>");
    };
    ReplayBuilder.buildTimeContainer = function (replay) {
        return "<div><p>starttime: ".concat(replay.starttime, "</p><p>endtime: ").concat(replay.endtime, "</p><p>duration: ").concat(replay.duration, "</p></div>");
    };
    ReplayBuilder.buildReplayRecordContainer = function (replayRecords) {
        return "<div><p>ReplayRecord-count: ".concat(replayRecords.length, "</p></div>");
    };
    ReplayBuilder.buildUserNameContainer = function (userName) {
        return "<div><p>userName: ".concat(userName, "</p></div>");
    };
    return ReplayBuilder;
}());
module.exports = ReplayBuilder;
