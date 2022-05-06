class ThemeHandler {

    constructor() {
        this.themeButton = document.getElementById('themeButton');
        this.initTheme();
    }

    initHandling() {
        this.themeButton.addEventListener('click', () => {
            this.switchMode();
        });
    }

    /**
     * Loads persisted mode-item from LocalStorage.
     * If there is an item and its value equals dark, we need to switch the mode from light to dark.
     * This is necessary, because the initial state of the page is lightmode.
     */
    initTheme() {
        let mode = localStorage.getItem('mode');
        if(mode === 'dark'){
            this.switchMode();
        }
    }

    switchMode() {
        const htmlTag = document.getElementsByTagName('html')[0];
        let iconPath;
        let modeValue;

        if(htmlTag.className === 'lightmode') {
            htmlTag.className = '';
            iconPath = '/icons/DarkModeIcon.svg';
            modeValue = 'dark';
        } else {
            htmlTag.className = 'lightmode';
            iconPath = '/icons/LightModeIcon.svg';
            modeValue = 'light';
        }

        localStorage.setItem('mode', modeValue)
        this.themeButton.getElementsByTagName('img')[0].src = iconPath;
    }

}

export default new ThemeHandler();