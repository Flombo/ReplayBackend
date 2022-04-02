import ThemeHandler from "./ThemeHandler.js";
import PaginationHandler from "./PaginationHandler.js";
import SearchHandler from "./SearchHandler.js";

window.onload = async () => {
    ThemeHandler.initHandling();
    await PaginationHandler.initHandling();
    SearchHandler.initSearchBar();
}