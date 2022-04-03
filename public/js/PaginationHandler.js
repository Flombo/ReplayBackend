import RequestBuilder from "./RequestBuilder.js";
import ErrorMessageBuilder from "./ErrorMessageBuilder.js";

class PaginationHandler {

    constructor() {
        this.replayContainer = document.getElementsByClassName('replayContainer')[0];
        this.paginationForm = document.getElementById('paginationForm');
        this.paginationButtons = [];
        this.paginationForm.addEventListener('submit', (event) => event.preventDefault());
        this.previousButton = document.getElementById('previousButton');
        this.forwardsButton = document.getElementById('forwardsButton');
        this.startButton = document.getElementById('startButton');
        this.endButton = document.getElementById('endButton');
        this.searchForm = document.getElementsByClassName('searchForm')[0];
        this.searchBar = this.searchForm.getElementsByTagName('input')[0];
        this.filterForm = document.getElementsByClassName('filterForm')[0];
        this.timestampFilter = this.filterForm.getElementsByTagName('select')[0];
    }

    async initHandling() {
        const allPaginationButtons = Array.from(document.getElementsByClassName('paginationButton'));

        allPaginationButtons.map(paginationButton => {
            if(paginationButton.id.length === 0) {
                this.paginationButtons.push(paginationButton);
                paginationButton.addEventListener('click', async() => await this.onClickPaginationButton(paginationButton));
            }
        });

        this.startButton.addEventListener('click', () => this.onClickControlButton(this.startButton));
        this.previousButton.addEventListener('click', () => this.onClickControlButton(this.previousButton));
        this.forwardsButton.addEventListener('click', () => this.onClickControlButton(this.forwardsButton));
        this.endButton.addEventListener('click', () => this.onClickControlButton(this.endButton));
        this.initSearchBar();
        this.initFilterHandling();
        await this.loadLastPaginationSettings();
    }

    initSearchBar() {
        this.searchForm.addEventListener('submit', async(event) => {
            event.preventDefault();
            await this.sendPaginationRequest(1);
        });
    }

    initFilterHandling() {
        this.filterForm.addEventListener('submit', async(event) => {
            event.preventDefault();
            await this.sendPaginationRequest(1);
        });
    }

    async loadLastPaginationSettings() {
        const currentPage = localStorage.getItem('currentPage');

        if(currentPage !== null) {
            this.replayContainer.innerHTML = await this.sendPaginationRequest(currentPage);
        }
    }

    async onClickPaginationButton(button) {
        this.replayContainer.innerHTML = await this.sendPaginationRequest(button.textContent);
    }

    async onClickControlButton(button) {
        let pageInfo;

        switch (button.id) {
            case 'startButton':
                pageInfo = 'start';
                break;
            case 'previousButton':
                pageInfo = 'previous';
                break;
            case 'forwardsButton':
                pageInfo = 'forwards';
                break;
            case 'endButton':
                pageInfo = 'end';
                break;
        }

        this.replayContainer.innerHTML = await this.sendPaginationRequest(pageInfo);
    }

    async sendPaginationRequest(pageInfo) {
        try {
            const currentPage = this.paginationButtons[0].textContent;
            const searchString = this.searchBar.value;
            const timestampFilter = this.timestampFilter.value;

            const data = {
                pageInfo: pageInfo,
                currentPage: currentPage,
                searchString: searchString,
                timestampFilter: timestampFilter
            };

            const requestOptions = RequestBuilder(data);
            const response = await fetch('/pagination', requestOptions);
            let replayJSON = await response.json();

            if(response.status !== 200) {
                throw replayJSON.error;
            }

            this.updatePaginationButtons(parseInt(replayJSON.page), parseInt(replayJSON.paginationEnd));
            localStorage.setItem('currentPage', replayJSON.page);
            return replayJSON.replayHTML;
        } catch (exception) {
            return ErrorMessageBuilder(exception);
        }
    }

    updatePaginationButtons(page, paginationEnd) {
        this.updateForwardsButton(page, paginationEnd);
        this.updatePreviousButton(page);

        if(page >= paginationEnd) {
            let decrementFactor = 0;
            for(let i = this.paginationButtons.length - 1; i >= 0; i--) {
                this.paginationButtons[i].textContent = paginationEnd + decrementFactor;
                decrementFactor--;
            }
        } else {
            for (let i = 0; i < this.paginationButtons.length; i++) {
                if(page + i <= paginationEnd) {
                    this.paginationButtons[i].textContent = page + i;
                } else {
                    this.paginationButtons[i].textContent = paginationEnd;
                }
            }
        }

    }

    updateForwardsButton(page, paginationEnd) {
        if(parseInt(page) !== parseInt(paginationEnd)) {
            this.forwardsButton.classList.remove('invisible');
        } else {
            this.forwardsButton.classList.add('invisible');
        }
    }

    updatePreviousButton(page) {
        if(page > 1) {
            this.previousButton.classList.remove('invisible');
        } else {
            this.previousButton.classList.add('invisible');
        }
    }

}

export default new PaginationHandler();