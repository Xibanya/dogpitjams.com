const TITLE = "The Dogpitjamcronomicon"

const DIRECTORY_CLASS = "directory";
const SUBDIRECTORY_CLASS = "subdirectory";
const INCLUDES_DIRECTORY_ID = "jams-dogpit";
const JAM_INFO_ID = "jam-info";
const SMALL_ACCENT = `<div class="accent-small"></div>`;
const JAM_ACCENT = `<div class="accent" id="jam-accent"></div>`;

const BASE = "/"
const SCRIPTS_PATH = BASE + "Scripts/";
const LIBRARY_PATH = BASE + "Library/";
const STYLE_PATH = BASE + "Styles/Style.css";
const STYLE_ID = "MainStyle";
const SQL_SCRIPT_ID = "SQLScript";
const SQL_PATH = "https://kripken.github.io/sql.js/dist/";
const SQL_SCRIPT = "sql-wasm.js";
const DB_PATH = BASE + "Data/Jams.db";

const DEFINITIONS_TABLE = "Definitions";
const DIRECTORIES_TABLE = "Directories";

export { 
    SQL_PATH, SQL_SCRIPT, SQL_SCRIPT_ID, BASE, SCRIPTS_PATH, 
    LIBRARY_PATH, STYLE_PATH, STYLE_ID, DB_PATH, DEFINITIONS_TABLE, 
    DIRECTORIES_TABLE, TITLE, DIRECTORY_CLASS, SUBDIRECTORY_CLASS,
    INCLUDES_DIRECTORY_ID, JAM_INFO_ID, SMALL_ACCENT, JAM_ACCENT
};