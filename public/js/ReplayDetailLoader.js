import ErrorMessageBuilder from "./ErrorMessageBuilder.js";
import RequestBuilder from "./RequestBuilder.js";

class ReplayDetailLoader {

    constructor() {
        this.replayContainer = document.getElementsByClassName('replayContainer')[0];
    }

    /**
     * Adds an click handler to the replayContainer and checks if the click-event was triggered by the replay-button.
     */
    initReplayHandling() {
        this.replayContainer.addEventListener('click', async (event) => {
            if(event.target instanceof HTMLButtonElement) {
                const replay = event.target.parentElement.parentElement;
                await this.onReplayDetailButtonClicked(replay, event.target);
            }
        });
    }

    /**
     * Switches the detail-button text from the plus- to the minus-sign.
     * Loads the replay-details asynchronously instead of retrieving all with each reload, for better performance.
     * @param replay
     * @param replayDetailButton
     * @returns {Promise<void>}
     */
    async onReplayDetailButtonClicked(replay, replayDetailButton) {
        if(replay.classList.contains('more')) {
            replayDetailButton.textContent = '➖';
            replay.classList.remove('more');

            //the replay-details will be loaded asynchronously just the first time.
            if(replay.getElementsByClassName('replayDetails').length === 0) {
                await this.sendReplayDetailsRequest(replay);
            }
        } else {
            replayDetailButton.textContent = '➕';
            replay.classList.add('more');
        }
    }

    /**
     * Sends the replayID of the clicked replay to the backend for retrieving the details.
     * If the request failed, an error message will be displayed instead.
     * Else the details will be added to the replay-container.
     * @param replay
     * @returns {Promise<void>}
     */
    async sendReplayDetailsRequest(replay) {
        try {
            const data = {replayID: replay.title};
            const options = RequestBuilder(data);
            const response = await fetch('/getreplaydetails', options);
            const replayDetailsJSON = await response.json();

            if(response.status !== 200) {
                throw replayDetailsJSON.error;
            }

            replay.innerHTML += replayDetailsJSON.replayDetails;

        } catch (exception) {
            this.replayContainer.innerHTML = ErrorMessageBuilder(exception);
        }
    }

}

export default new ReplayDetailLoader();