var ReplayBuilder = /** @class */ (function () {
    function ReplayBuilder() {
    }
    ReplayBuilder.buildReplays = function (replays) {
        var replayHTML = '<div class="replayContainer">';
        replays.map(function (replay) {
            replayHTML += "<div class=\"replay more\" title=\"" + replay._id + "\">"
                + "<div class=\"replayHeader\">"
                + ("<div>" + replay.name + "</div>")
                + ("<div>" + replay.tag + "</div>")
                + ("<div>" + replay.timestamp + "</div>")
                + "<button>\u2795</button>"
                + "</div>"
                + "</div>";
        });
        replayHTML += '</div>';
        return replayHTML;
    };
    ReplayBuilder.buildReplayDetails = function (replay) {
        var detailContainers = this.buildRotationContainer(replay.rotation)
            + this.buildPositionContainer(replay.position)
            + this.buildIsActiveContainer(replay.isActive);
        return "<div class=\"replayDetails\">" + detailContainers + "</div>";
    };
    ReplayBuilder.buildPositionContainer = function (position) {
        return "<div><p>x: " + position.x + "</p><p>y: " + position.y + "</p><p>z: " + position.z + "</p></div>";
    };
    ReplayBuilder.buildRotationContainer = function (rotation) {
        return "<div><p>x: " + rotation.x + "</p><p>y: " + rotation.y + "</p><p>z: " + rotation.z + "</p><p>w: " + rotation.w + "</p></div>";
    };
    ReplayBuilder.buildIsActiveContainer = function (isActive) {
        return "<div>isActive: " + isActive + "</div>";
    };
    return ReplayBuilder;
}());
module.exports = ReplayBuilder;
