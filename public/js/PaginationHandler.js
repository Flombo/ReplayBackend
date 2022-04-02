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

        await this.loadLastPaginationSettings();
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
                pageInfo = '-1';
                break;
            case 'forwardsButton':
                pageInfo = '+1';
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

            const data = {
                pageInfo: pageInfo,
                currentPage: currentPage
            };

            const requestOptions = RequestBuilder(data);
            const response = await fetch('/pagination', requestOptions);

            if(response.status !== 200) {
                throw 'Pagination failed';
            }

            let replayJSON = await response.json();
            this.updatePaginationButtons(replayJSON.page, replayJSON.paginationEnd);
            localStorage.setItem('currentPage', replayJSON.page);
            return replayJSON.replayHTML;
        } catch (exception) {
            return ErrorMessageBuilder(exception);
        }
    }

    updatePaginationButtons(page, paginationEnd) {
        this.updateForwardsButton(page, paginationEnd);
        this.updatePreviousButton(page);

        for (let i = 0; i < this.paginationButtons.length; i++) {
            this.paginationButtons[i].textContent = parseInt(page) + i;
        }

    }

    updateForwardsButton(page, paginationEnd) {
        if(page !== paginationEnd) {
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