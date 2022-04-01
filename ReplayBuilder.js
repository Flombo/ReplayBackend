var ReplayBuilder = /** @class */ (function () {
    function ReplayBuilder() {
    }
    /**
     * ➖ ToDo
     * @param replays
     */
    ReplayBuilder.buildReplays = function (replays) {
        var replayHTML = '<div class="replayContainer">';
        replays.map(function (replay) {
            replayHTML += "<div class=\"replay\"><div>" + replay.name + "</div><div>" + replay.timestamp + "</div><button class=\"more\">\u2795</button></div>";
        });
        replayHTML += '</div>';
        return replayHTML;
    };
    return ReplayBuilder;
}());
module.exports = ReplayBuilder;
