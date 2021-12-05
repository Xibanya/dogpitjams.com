var DIRECTORY_CLASS = "directory";
var SUBDIRECTORY_CLASS = "subdirectory";
var INCLUDES_DIRECTORY_ID = "jams-dogpit";
var JAM_INFO_ID = "jam-info";
var PRETTYPRINT_CLASS = "prettyprint";
var LINENUMS_CLASS = "linenums";
var JAMS_TABLE = "Jams";
var RESULTS_TABLE = "Results";
var GAMES_TABLE = "Games"
var DEFINITIONS_TABLE = "Definitions";
var DIRECTORIES_TABLE = "Directories";
var SMALL_ACCENT = `<div class="accent-small"></div>`;
var JAM_NAME = 1;
var JAM_ORGANIZER = 3;
var JAM_THEME = 4;
var JAM_URL = 5;
var JAM_PAGE = 6;
var TITLE = "The Dogpitjamcronomicon"
var isSource = false;
var sourceName = null;
var BASE = "/"

var SCRIPTS_PATH = BASE + "Scripts/";

var STYLE_PATH = BASE + "Styles/Style.css";
var STYLE_ID = "MainStyle";

var LIBRARY_PATH = BASE + "Library/";

var SQL_SCRIPT_ID = "SQLScript";
var SQL_SCRIPT = "sql-wasm.js";
var SQL_PATH = "https://kripken.github.io/sql.js/dist/";
var DB_PATH = "https://dogpitjams.com/Data/Jams.db";
var YOUTUBE = `https://www.youtube.com/channel/UCGu0wtYct94lFuAKN_SrFAg/playlists?view=50&sort=dd&shelf_id=3`;
var db = null;

var URL_INDEX = `<a href="${BASE}"><i class="fa fa-home"></i></a>`;
var URL_REPO = `<a href="${YOUTUBE}" target="new"><i class="fa fa-youtube"></i></a>`;
var URL_DISCORD = `<a href="https://discord.gg/YvXrB62" target="new"><i class="fab fa-discord"></i></a>`;
var URL_T = `<a href="https://twitter.com/TeamDogpit" target="new"><i class="fa fa-twitter"></i></a>`;
var EXTERNAL_LINKS = `${URL_REPO} ${URL_T} ${URL_DISCORD}`;

AddScript(SQL_PATH + SQL_SCRIPT, SQL_SCRIPT_ID);

window.setTimeout(function() {
initSqlJs({ locateFile: filename => SQL_PATH + `${filename}` }).then(function (SQL) {  
    var dbRequest = new XMLHttpRequest();
    console.info("Begin request");
    dbRequest.withCredentials = true;
    dbRequest.open('GET', DB_PATH, true);
    dbRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencode');
    dbRequest.responseType = 'arraybuffer';
    dbRequest.onload = function(e) 
    {
        if (db == null)
        {
            var uInt8Array = new Uint8Array(this.response);
            db = new SQL.Database(uInt8Array);
        }
        AddStyle(STYLE_PATH, STYLE_ID);
        window.setTimeout(function(){
            if (db != null)
            {
                console.info("Loaded DB");
                IncludesDirectory();
                AddFooter();
                GetJamPage();
                //LinkIncludes();
                //MakeLinks();
                
            }
            else console.log("DB Null");
        }, 200);
    };
        dbRequest.send();
    });
}, 200);
   
function Tableify(strigified)
{
    var array = [];
    for (var i = 0; i < strigified[0].values.length; i++)
    {
        array.push(strigified[0].values[i]);
    }
    return array;
}
class Group {
    constructor(row)
    {
        this.ID = row[0];
        this.Path = row[1];
        this.Name = row[2];
        this.ElementID = row[3];
        this.Parent = row[4];
        this.Descripton = row[5];
        this.Show = parseInt(row[6]) == 1;
    }
}
class Guest {
    constructor(row)
    {
        this.ID = row[0];
        this.Name = row[1];
        this.Judge = parseInt(row[2]) == 1;
        this.Jam = row[3];
    }
}
function GetSeason(monthNumber)
{
    if (monthNumber < 3 || monthNumber > 10) return "Winter";
    else if (monthNumber > 2 && monthNumber < 6) return "Spring";
    else if (monthNumber > 5 && monthNumber < 9) return "Summer";
    else return "Fall";
}
class Jam {
    constructor(row)
    {
        this.ID = row[0];
        this.Name = row[JAM_NAME];
        this.When = row[2];
        var times = String(row[2]).split(".");
        this.Year = times[0];
        this.Season = GetSeason(parseInt(times[1]));
        this.Organizer = row[JAM_ORGANIZER];
        this.Theme = row[JAM_THEME];
        this.URL = row[JAM_URL];
        this.Page = row[JAM_PAGE];
        this.Logo = row[7];
        this.External = row[8];
        this.Notes = row[9];
        this.Next = null;
        this.Previous = null;
        this.Results = null;
        this.Entries = [];
        this.Judges = [];
        this.Guests = [];
        if (window.location.href.includes("Library"))
        {
            var nextInt = row[10];
            if (nextInt > 0)
            {
                var nextQuery = `SELECT * FROM ${JAMS_TABLE} WHERE ID IS ${nextInt}`;
                var nextResults = db.exec(nextQuery);
                if (nextResults != null)
                {
                    var nextArr = JSON.parse(JSON.stringify(nextResults));
                    if (nextArr != null && nextArr.length > 0) 
                    {
                        var nextRow = Tableify(nextArr)[0];
                        this.Next = LIBRARY_PATH + nextRow[JAM_URL] + nextRow[JAM_PAGE] + ".html";
                    }
                }
            }
            var prevInt = row[11];
            if (prevInt > 0)
            {
                var prevQuery = `SELECT * FROM ${JAMS_TABLE} WHERE ID IS ${prevInt}`;
                var prevResults = db.exec(prevQuery);
                if (prevResults != null)
                {
                    var prevArr = JSON.parse(JSON.stringify(prevResults));
                    if (prevArr != null && prevArr.length > 0) 
                    {
                        var prevRow = Tableify(prevArr)[0];
                        this.Previous = LIBRARY_PATH + prevRow[JAM_URL] + prevRow[JAM_PAGE] + ".html";
                    }
                }
            }

            var cats = `SELECT * FROM ${RESULTS_TABLE} WHERE Jam IS '${this.ID}'`;
            var catsResults = db.exec(cats);
            if (catsResults != null)
            {
                var jsonArr = JSON.parse(JSON.stringify(catsResults));
                if (jsonArr != null && jsonArr.length > 0) this.Results = Tableify(jsonArr);
            }
            var ents =  `SELECT * FROM ${GAMES_TABLE} WHERE Jam IS '${this.ID}'`;
            var entResults = db.exec(ents);
            if (entResults != null)
            {
                var entArr = JSON.parse(JSON.stringify(entResults));
                if (entArr != null && entArr.length > 0)
                {
                    var entryTable = Tableify(entArr);
                    if (entryTable != null)
                    {
                        for (var i = 0; i < entryTable.length; i++)
                        {
                            var game = new Game(entryTable[i]);
                            this.Entries.push(game);
                        }
                    }
                }
            }
            var juds =  `SELECT * FROM Guests WHERE Jam IS '${this.ID}'`;
            var judResults = db.exec(juds);
            if (judResults != null)
            {
                var judArr = JSON.parse(JSON.stringify(judResults));
                if (judArr != null && judArr.length > 0)
                {
                    var judgeTable = Tableify(judArr);
                    if (judgeTable != null)
                    {
                        for (var i = 0; i < judgeTable.length; i++)
                        {
                            var judge = new Guest(judgeTable[i]);
                            if (judge.Judge) this.Judges.push(judge);
                            else this.Guests.push(judge);
                        }
                    }
                }
            }
        }
    }
}
class Game {
    constructor(row)
    {
        this.ID = row[0];
        this.Name = row[1];
        this.User = row[2];
        this.Link = row[3];
        this.Team = row[4];
        this.Members = row[5];
        this.Jam = row[6];
        this.Score = row[7];
    }
}
class Result {
    constructor(row)
    {
        this.ID = row[0];
        this.Jam = row[1];
        this.Name = row[2];
        this.Winner = row[3];
        this.Points = parseFloat(row[4]);
        this.Game = null;
        if (this.Winner != null)
        {
            var winQuery =  `SELECT * FROM Games WHERE ID IS '${this.Winner}'`;
            var gameTable = Tableify(JSON.parse(JSON.stringify(db.exec(winQuery))));
        
            if (gameTable != null && gameTable.length > 0)
            {
                this.Game = new Game(gameTable[0]);
            }
        }
    }
}

function SetTitle(titleText)
{
    var title = document.getElementsByTagName('title')[0];
    if (title == null)
    {
        var head = document.getElementsByTagName('head')[0];
        title = document.createElement('title');
        head.appendChild(title);
    }
    title.innerText = titleText;
}
function IncludesDirectory()
{
    if (window.location.href.includes("Library")) return;
    SetTitle(TITLE);
    document.getElementById("site-title").innerText = TITLE;
    var query = `SELECT * FROM ${DIRECTORIES_TABLE} ORDER BY ID ASC`;
    console.info(query);
    var dbDirectoryTable = db.exec(query);
    var table = Tableify(JSON.parse(JSON.stringify(dbDirectoryTable)));
    var lastElement;
    for (var i = 0; i < table.length; i ++)
    {
        var row = new Group(table[i]);
        if (row.Show == false) continue;
        else if (i == 0) 
        {
            console.info("First element")
            lastElement = document.getElementById(row.ElementID);
            if (lastElement == null) 
            {
                console.info(`Couldn't find element ${row.ElementID}!`)
                return;
            }
            var header = HeaderBefore(3, row.Name, lastElement, true);
            var accent = document.getElementById(row.Name + "-accent");
            InsertAfter(lastElement, accent);
        }
        else
        {
            var header = HeaderAfter(3, row.Name, lastElement, true);
            var accent =  document.getElementById(row.Name + "-accent");
            lastElement = DirectoryAfter(row.ElementID, accent);
        }
        var sql =  `SELECT * FROM ${JAMS_TABLE} WHERE URL IS '${row.Path}'`;
        var includes = db.exec(sql);
        var includesTable = Tableify(
            JSON.parse(JSON.stringify(includes)).sort((a, b) => a.When - b.When));
        
        GenerateDirectory(includesTable, row.ElementID, row.Descripton);
    }
}
function GetJamPage()
{
    if (!window.location.href.includes("Library")) return;
    var components = window.location.href.split("/");
    if (components.length <= 1) return;
    var pageName = components[components.length - 1].replace(".html", "");
    var sql =  `SELECT * FROM ${JAMS_TABLE} WHERE Page IS '${pageName}'`;
    console.info(sql);
    var jamPageResult = db.exec(sql);
    var jamPageTable = Tableify(JSON.parse(JSON.stringify(jamPageResult)));
    if (jamPageTable != null && jamPageTable.length > 0)
    {
        var row = new Jam(jamPageTable[0]);
        SetTitle(row.Name)
        var container = document.getElementById(JAM_INFO_ID)
        container.innerHTML = "";
        if (row.Logo != null)
        {
            var imgString = `<img src="https://dogpitjams.com/Images/${row.Logo}" alt="Jam Logo" class="logo">`;
            if (row.External != null)
            {
                imgString = `<a href="${row.External}" target="new">${imgString}</a>`;
            }
            container.innerHTML += imgString;
        }
      
        container.innerHTML += 
            `<div class="jam-container">` +
            `<h1 class="jamheading">${row.Name}</h1>` + 
            `<h3 class="subheading">${row.Theme}</h3>` + 
            `<div class="accent" id="jam-accent"></div>` +  
            `<h4 class="subheading">${row.Season} ${row.Year}, Organized by ${row.Organizer}</h4>` +  
            `</div>`;
       
        var mainDiv = document.createElement('div');
        mainDiv.className = "directory";

        if (row.Judges != null && row.Judges.length > 0)
        {
            var judgeP = document.createElement('p');
            judgeP.innerHTML = `<h2>Judges</h2>${SMALL_ACCENT}`;
            mainDiv.appendChild(judgeP);
            var jList = DirectoryList(false);
            for (var i = 0; i < row.Judges.length; i++)
            {
                var jItem = ListItem(jList, i);
                jItem.innerHTML = `<span>${row.Judges[i].Name}</span>`;
            }
            judgeP.appendChild(jList);
        }

        container.appendChild(mainDiv);
        var mainP = document.createElement('p');
        mainDiv.appendChild(mainP);

        if (row.Results != null && row.Results.length > 0)
        {
            if (row.Organizer == "Shalinor")
            {
                mainP.innerHTML += "<h2>Categories</h2>";
            }
            else mainP.innerHTML += "<h2>Winners</h2>";
            mainP.innerHTML +=  SMALL_ACCENT;
            var resultList = DirectoryList(false);
            resultList.id = "Judging-Categories";
            mainP.appendChild(resultList);

            for (var i = 0; i < row.Results.length; i++)
            {
                var result = new Result(row.Results[i]);
                if (result.Points > 0)
                {
                    var resultItem = ListItem(resultList, i);
                    resultItem.id = `category-${result.Name}`;
                    resultItem.innerHTML = 
                        `<span>${result.Name}</span> <i>(${result.Points} Points)</i>`;
                    resultList.appendChild(resultItem);
                }
                else
                {
                    var category = document.createElement('h3');
                    category.className = "winner";
                    category.innerText = result.Name;
                    mainP.appendChild(category);
                    var gameDiv = document.createElement('div');
                    mainP.appendChild(gameDiv);
                    if (result.Game != null)
                    {
                        if (result.Game.Link != null)
                        {
                            var catLink = document.createElement('a');
                            catLink.innerText = result.Game.Name;
                            catLink.href = result.Game.Link;
                            gameDiv.appendChild(catLink);
                        }
                        else
                        {
                            var catSpan = document.createElement('span');
                            catSpan.innerText = result.Game.Name;
                            gameDiv.appendChild(catSpan);
                        }
                        if (result.Game.Team != null) gameDiv.innerHTML += ` by ${result.Game.Team}`;
                        else if (result.Game.User != null) gameDiv.innerHTML += ` by ${result.Game.User}`;  
                    }
                }
            }
        }
       
        if (row.Entries != null && row.Entries.length > 0)
        {
            var entP = document.createElement('p');
            entP.innerHTML = `<h2>Entries</h2>${SMALL_ACCENT}`;
            mainDiv.appendChild(entP);
            var entryList = DirectoryList(false);
            for (var i = 0; i < row.Entries.length; i++)
            {
                var listItem = ListItem(entryList, i);
                if (row.Entries[i].Link != null)
                {
                    listItem.innerHTML = 
                        `<a href="${row.Entries[i].Link}" target="new">${row.Entries[i].Name}</a>`;
                }
                else listItem.innerHTML = `<span>${row.Entries[i].Name}</span>`;
                if (row.Entries[i].Team != null)
                {
                    listItem.innerHTML += ` by ${row.Entries[i].Team}`;
                    //if (row.Entries[i].Team.includes("Team")) listItem.innerHTML += ` by ${row.Entries[i].Team}`;
                    //else listItem.innerHTML += ` by Team ${row.Entries[i].Team}`;
                }
                else if (row.Entries[i].User != null) listItem.innerHTML += ` by ${row.Entries[i].User}`;
                if (row.Entries[i].Score != null)
                {
                    listItem.innerHTML += `<br>Score: ${row.Entries[i].Score}`;
                }
            }
            entP.appendChild(entryList);
        }
        var navLinks = "";
        if (row.Previous != null || row.Next != null)
        {
            navLinks = `<p><h4 class="subheading" style="text-align: center;">`;
            if (row.Previous != null)
            {
                navLinks += `<a href="${row.Previous}">&laquo; Previous Jam</a> `;
                if (row.Next != null) navLinks += "| ";
            }
            if (row.Next != null)
            {
                navLinks += `<a href="${row.Next}">Next Jam &raquo;</a> `;
            }
            navLinks += "</h4></p>";
        }
        mainDiv.innerHTML += navLinks;
    }
    else
    {
        console.info(`Can't find a jam with a page ${pageName}`)
    }
}

function InsertDirectoryLink(row, lastElement)
{
    var header = HeaderAfter(3, row.Name, lastElement, true);
    var accent =  document.getElementById(row.Name + "-accent");
    lastElement = DirectoryAfter(row.ElementID, accent);
    return lastElement;
}
function InsertSubDirectoryLink(row, lastElement)
{
    var header = HeaderAfter(4, row.Name, lastElement, true);
    var accent =  document.getElementById(row.Name + "-accent");
    lastElement = DirectoryInto(row.ElementID, accent);
    return lastElement;
}

//generate links to members of the provided table within the DOM element of the specified ID
function GenerateDirectory(table, elementID, description)
{
    if (table != null)
    {
        var node = document.getElementById(elementID);
        var desc = document.createElement('p');
        desc.innerHTML = description;
        node.appendChild(desc);
        if (node != null)
        {
            var increment = 0;
            var directoryList = DirectoryList(false);
            for (var i = 0; i < table.length; i ++)
            {
                var row = new Jam(table[i]);
                console.info(`Generate link to ${row.Name}`)
                var listItem = ListItem(directoryList, increment);
                if (row.Page != null)
                {
                    var link = document.createElement('a');
                    if (row.Page != null) link.href = LIBRARY_PATH + row.URL + row.Page + ".html";
                    else link.href = "/";
                    link.innerText = row.Name;
                    listItem.appendChild(link);
                }
                else listItem.innerHTML += `<span>${row.Name}</span>`;
                listItem.innerHTML += ` ${row.Theme}`
                increment++;
            }
            node.appendChild(directoryList);
        }
        else console.log("No such element " + elementID + "!");
    }
    else console.log("Table for " + elementID + " is null!");
}
function DirectoryLink(url, page, displayName)
{
    var link = document.createElement('a');
    link.href = LIBRARY_PATH + url + page + ".html";
    link.innerText = displayName;
    return link;
}
function DirectoryList(addLinenums)
{
    var listContainer = document.createElement(addLinenums? 'ol' : 'ul');
    if (addLinenums) listContainer.className = LINENUMS_CLASS;
    return listContainer;
}
function ListItem(parentNode, increment)
{
    var listItem = document.createElement('li');
    parentNode.appendChild(listItem);
    if (parentNode.classList.contains(LINENUMS_CLASS))
    {
        listItem.className = `${increment}`;
    }
    return listItem
}

function MakeLinks()
{
    var replaced = [];
    var nodes = document.getElementsByTagName("span");
    for (var i = 0; i < nodes.length; i++) 
    {
        var field = nodes[i].textContent;
        if (field != null && !replaced.includes(field))
        {
            var stmt = db.prepare(`SELECT * FROM ${DEFINITIONS_TABLE} WHERE Field=:val`);
            var result = stmt.getAsObject({':val' : field});
            var jsonResult = JSON.parse(JSON.stringify(result));
            if (jsonResult.Field != null) 
            {
                stmt = db.prepare(`SELECT URL FROM ${JAMS_TABLE} WHERE Name=:val`);
                var includePath = stmt.getAsObject({':val' : jsonResult.Include});
                var includeResult = JSON.parse(JSON.stringify(includePath));
                var page = LIBRARY_PATH + includeResult.URL + jsonResult.Include + ".html"
                if (jsonResult.Include != jsonResult.Field) page += "#" + jsonResult.Field;
                console.info(`Creating link to ${page}`);
                var newTag = `<a href="${page}">${jsonResult.Field}</a>`;
                findAndReplace(jsonResult.Field, newTag);
            }
            stmt.free();
            replaced.push(field);
        }
    }
}
//puts links on known Includes
function LinkIncludes()
{
    var includesTable = db.exec(`SELECT ID, Name, URL, Page FROM ${JAMS_TABLE}`);
    var nodes = document.getElementsByClassName("str");
    for (var i = 0; i < nodes.length; i++) 
    {
        table = JSON.parse(JSON.stringify(includesTable));
        table[0].values.forEach(row => {
            if (nodes[i].innerText.includes(displayName))
            {
                var page = LIBRARY_PATH + row[JAM_URL] + row[JAM_PAGE];
                var newTag = `<a href=\"${page}.html\">${displayName}</a>`;
                findAndReplace(row[JAM_NAME], newTag, nodes[i]);
            }
        });
    }
} 

function AddFooter()
{
    var body = document.getElementsByTagName('body')[0];
    var footer = document.getElementById('footer');
    if (footer == null)
    {
        var space = document.getElementById('footer-spacer');
        if (space == null)
        {
            space = document.createElement('div');
            body.appendChild(space);
            space.classList = "space";
            space.id = "footer-spacer";
        }
        footer = document.createElement('footer');
        body.appendChild(footer);
        footer.id = 'footer';
    }
    var sourceText = document.getElementById('footer-source');
    if (sourceText == null)
    {
        sourceText = document.createElement('span');
        sourceText.id = "footer-source";
        footer.appendChild(sourceText);
    }
    sourceText.classList = isSource? "source" : "hidden";

    var footerText = document.getElementById('footer-center');
    if (footerText == null)
    {
        footerText = document.createElement('span');
        footerText.id = "footer-center";
        footerText.classList = "center";
        footer.appendChild(footerText);
    }
    footerText.innerHTML = URL_INDEX;
    
    var linkText = document.getElementById('footer-links');
    if (linkText == null)
    {
        linkText = document.createElement('span');
        linkText.id = "footer-links";
        footer.appendChild(linkText);
        linkText.innerHTML = EXTERNAL_LINKS;
    }
    linkText.classList = isSource? "links" : "";
}

//adapted from https://j11y.io/snippets/find-and-replace-text-with-javascript/
function findAndReplace(searchText, replacement, searchNode) 
{
    if (!searchText || typeof replacement === 'undefined') {
        // Throw error here if you want...
        return;
    }
    var regex = typeof searchText === 'string' ?
                new RegExp(`\\b${searchText}\\b`, 'g') : searchText,
        childNodes = (searchNode || document.body).childNodes,
        cnLength = childNodes.length,
        excludes = 'html,head,style,title,link,meta,script,object,iframe';
    while (cnLength--) {
        var currentNode = childNodes[cnLength];
        if (currentNode.nodeType === 1 &&
            (excludes + ',').indexOf(currentNode.nodeName.toLowerCase() + ',') === -1) {
            arguments.callee(searchText, replacement, currentNode);
        }
        if (currentNode.nodeType !== 3 || !regex.test(currentNode.data) ) {
            continue;
        }
        var parent = currentNode.parentNode,
            frag = (function(){
                var html = currentNode.data.replace(regex, replacement),
                    wrap = document.createElement('div'),
                    frag = document.createDocumentFragment();
                wrap.innerHTML = html;
                while (wrap.firstChild) {
                    frag.appendChild(wrap.firstChild);
                }
                return frag;
            })();
        parent.insertBefore(frag, currentNode);
        parent.removeChild(currentNode);
    }
};

function AddStyle(path, uniqueID)
{
    var existing = document.getElementById(uniqueID);
    if (existing == null)
    {
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.rel = 'stylesheet';  
        link.type = 'text/css'; 
        link.id = uniqueID;
        link.href = path;
        head.appendChild(link);  
    }
}

function AddScript(path, uniqueID)
{
    var existing = document.getElementById(uniqueID);
    if (existing == null)
    {
        var head = document.getElementsByTagName('head')[0];
        var newScript = document.createElement('script');
        newScript.src = path;
        newScript.id = uniqueID;
        head.appendChild(newScript);
    }
}
function InsertAfter(newNode, referenceNode) 
{
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
function HeaderBefore(size, title, referenceNode, withAccent)
{
    var header = document.createElement('h' + size);
    header.innerText = title
    referenceNode.parentNode.insertBefore(header, referenceNode);
    if (withAccent)
    {
        var accent = document.createElement('div');
        accent.className = "accent";
        accent.id = `${title}-accent`;
        InsertAfter(accent, header);
    }
    return header;
}
function HeaderInto(size, title, referenceNode, withAccent)
{
    var newID = `${title}-header`;
    referenceNode.innerHTML += `<h${size} id="${newID}">${title}</h${size}>`;
    var header = document.getElementById(newID);
    if (withAccent)
    {
        var accent = document.createElement('div');
        accent.className = "accent";
        accent.id = `${title}-accent`;
        InsertAfter(accent, header);
    }
    return header;
}
function HeaderAfter(size, title, referenceNode, withAccent)
{
    var header = document.createElement('h' + size);
    header.innerText = title
    InsertAfter(header, referenceNode);
    if (withAccent)
    {
        var accent = document.createElement('div');
        accent.className = "accent";
        accent.id = `${title}-accent`;
        InsertAfter(accent, header);
    }
    return header;
}
function DirectoryAfter(uniqueID, referenceNode)
{
    var directory = document.createElement('div');
    directory.id = uniqueID;
    directory.className = DIRECTORY_CLASS;
    InsertAfter(directory, referenceNode);
    return directory;
}
function DirectoryInto(uniqueID, referenceNode)
{
    var directory = document.createElement('div');
    directory.id = uniqueID;
    directory.className = SUBDIRECTORY_CLASS;
    InsertAfter(directory, referenceNode);
    return directory;
}
function URLVars() 
{
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}
var searchedParams = [];
function GetParam(parameter, defaultvalue)
{
    if (!searchedParams.includes(parameter)) searchedParams.push(parameter);
    var urlparameter = defaultvalue;
    if(window.location.href.indexOf(parameter) > -1){
        urlparameter = URLVars()[parameter];
        }
    return urlparameter;
}