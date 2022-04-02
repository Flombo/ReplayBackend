import RequestBuilder from "./RequestBuilder.js";
import ErrorMessageBuilder from "./ErrorMessageBuilder.js";

class SearchHandler {

    constructor() {
        this.searchForm = document.getElementsByClassName('searchForm')[0];
        this.searchBar = this.searchForm.getElementsByTagName('input')[0];
        this.replayContainer = document.getElementsByClassName('replayContainer')[0];
    }

    initSearchBar() {
        this.searchForm.addEventListener('submit', async(event) => {
            event.preventDefault();
            await this.onSearch();
        });
    }

    async onSearch() {
        try {
            const searchString = this.searchBar.value;

            if (searchString.length > 0) {

                const data = {
                    searchString: searchString,
                    currentPage: 1
                }

                const options = RequestBuilder(data);
                const response = await fetch('/search', options);
                const replays = await response.json();

                if(response.status !== 200) {
                    throw replays.error;
                }

                this.replayContainer.innerHTML = replays.replayHTML;
            }
        } catch (exception) {
            this.replayContainer.innerHTML = ErrorMessageBuilder(exception);
        }
    }

}

export default new SearchHandler();