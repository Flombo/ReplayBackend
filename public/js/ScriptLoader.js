import ThemeHandler from "./ThemeHandler.js";
import PaginationHandler from "./PaginationHandler.js";
import ReplayDetailLoader from "./ReplayDetailLoader.js";

window.onload = async () => {
    ThemeHandler.initHandling();
    await PaginationHandler.initHandling();
    ReplayDetailLoader.initReplayHandling();
}