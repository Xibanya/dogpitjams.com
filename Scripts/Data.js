const LIBRARY_PATH = "/Library/";
const JAMS_TABLE = "Jams";
const RESULTS_TABLE = "Results";
const GAMES_TABLE = "Games"

const JAM_NAME = 1;
const JAM_ORGANIZER = 3;
const JAM_THEME = 4;
const JAM_URL = 5;
const JAM_PAGE = 6;
const GAME_TITLE = 1;
const GAME_USER = 2;
const GAME_URL = 3;
const GAME_TEAM = 4;
const GAME_SCORE = 7;

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
    constructor(row, db)
    {
        this.ID = row[0];
        this.Path = row[1];
        this.Name = row[2];
        this.ElementID = row[3];
        this.Parent = row[4];
        this.Descripton = row[5];
        this.Show = parseInt(row[6]) == 1;
        this.Jams = [];
        var sql = `SELECT * FROM ${JAMS_TABLE} WHERE URL IS '${this.Path}'`;
        var jams = db.exec(sql);
        var jamTable = Tableify(
            JSON.parse(JSON.stringify(jams)).sort((a, b) => a.When - b.When));
        for (var i = 0; i < jamTable.length; i ++)
        {
            this.Jams.push(new JamLink(jamTable[i]));
        }
    }
}
// only what's needed to make the link for the directory page
class JamLink {
    constructor(row) {
        this.ID = row[0];
        this.Name = row[JAM_NAME];
        this.Theme = row[JAM_THEME];
        this.URL = row[JAM_URL];
        this.Page = row[JAM_PAGE];
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
class Game {
    constructor(row)
    {
        this.ID = row[0];
        this.Name = row[GAME_TITLE];
        this.User = row[GAME_USER];
        this.Link = row[GAME_URL];
        this.Team = row[GAME_TEAM];
        this.Members = row[5];
        this.Jam = row[6];
        this.Score = row[GAME_SCORE];
    }
}
class Result {
    constructor(row, db)
    {
        this.ID = row[0];
        this.Jam = row[1];
        this.Name = row[2];
        this.Winner = row[3];
        this.Points = row[4];
        this.Type = row[5];
        this.Descripton = row[6];
        this.Place = row[7];
        this.Game = null;
        if (this.Winner != null)
        {
            var winQuery =  `SELECT * FROM ${GAMES_TABLE} WHERE ID IS '${this.Winner}'`;
            var gameTable = Tableify(JSON.parse(JSON.stringify(db.exec(winQuery))));
        
            if (gameTable != null && gameTable.length > 0)
            {
                this.Game = new Game(gameTable[0]);
            }
        }
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
    constructor(row, db)
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
        this.Winners = [];
        this.Categories = [];
        this.Entries = [];
        this.Judges = [];
        this.Guests = [];
        if (window.location.href.includes("Library"))
        {
            var nextInt = row[10];
            if (nextInt != null && parseInt(nextInt) > 0)
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
                if (jsonArr != null && jsonArr.length > 0) 
                {
                    var resultTable = Tableify(jsonArr);
                    for (var i = 0; i < resultTable.length; i++)
                    {
                        var result = new Result(resultTable[i], db);
                        if (result.Points != null) this.Categories.push(result);
                        else if (result.Winner != null) this.Winners.push(result);
                    }
                }
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
                            this.Entries.push(new Game(entryTable[i]));
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
// returns the Jam that belongs to the page being viewed
function GetJamFromPage(db)
{
    if (!window.location.href.includes("Library")) return null;
    var components = window.location.href.split("/");
    if (components.length <= 1) return;
    var pageName = components[components.length - 1].replace(".html", "");
    var sql = `SELECT * FROM ${JAMS_TABLE} WHERE Page IS '${pageName}'`;
    var jamPageResult = db.exec(sql);
    var jamPageTable = Tableify(JSON.parse(JSON.stringify(jamPageResult)));
    if (jamPageTable != null && jamPageTable.length > 0) return new Jam(jamPageTable[0], db);
    else return null;
}

export { Group, Result, Jam, Tableify, GetJamFromPage };