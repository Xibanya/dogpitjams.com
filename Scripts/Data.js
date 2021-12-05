const LIBRARY_PATH = "/Library/";
const JAMS_TABLE = "Jams";
const RESULTS_TABLE = "Results";
const GAMES_TABLE = "Games";
const GUEST_TABLE = "Guests";

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
function Query(sql, db)
{
    var result = JSON.parse(JSON.stringify(db.exec(sql)));
    if (result != null && result.length > 0) return Tableify(result);
    else return null;
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
        this.href = LIBRARY_PATH + this.URL + this.Page + ".html";
    }
}
class PersonLink {
    constructor(id, name)
    {
        this.ID = id;
        this.Name = name;
        this.href = `/Person.html?userid=${id}`;
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
        this.TeamID = row[8];
    }
}
function GetJamLink(id, db)
{
    var sql = `SELECT * FROM ${JAMS_TABLE} WHERE ID IS '${id}'`;
    var jamTable = Tableify(JSON.parse(JSON.stringify(db.exec(sql))));
    return new JamLink(jamTable[0]);
}
class Role {
    constructor(name, role, gameID, db)
    {
        this.Name = name;
        this.Role = role;
        this.GameID = gameID;
        var gameQuery = `SELECT * FROM ${GAMES_TABLE} WHERE ID = ${gameID}`;
        var gameResults = JSON.parse(JSON.stringify(db.exec(gameQuery)));
        var gameTable = Tableify(gameResults);
        this.Game = new Game(gameTable[0]);
        this.Jam = GetJamLink(this.Game.Jam, db);
    }
}
class Profile {
    constructor(row, db)
    {
        this.ID = row[0];
        this.Name = row[1];
        this.Itch = row[2];
        this.SA = row[3];
        this.Judged = [];
        this.Guested = [];
        var guestQuery = `SELECT Jam, Judge FROM Guests WHERE UID = ${this.ID}`;
        var guestResults = JSON.parse(JSON.stringify(db.exec(guestQuery)));
        if (guestResults != null && guestResults.length > 0)
        {
            var guestTable = Tableify(guestResults);
            for (var i = 0; i < guestTable.length; i++)
            {
                var sql = `SELECT * FROM ${JAMS_TABLE} WHERE ID IS '${guestTable[i][0]}'`;
                var jamTable = Tableify(JSON.parse(JSON.stringify(db.exec(sql))));
                for (var j = 0; j < jamTable.length; j++)
                {
                    var jam = new JamLink(jamTable[j]);
                    if (guestTable[i][1] == 1) this.Judged.push(jam);
                    else this.Guested.push(jam);
                }
            }
        }
        this.Games = [];
        var jammerQuery = `SELECT GameID, Name, Role FROM Jammer WHERE UserID = '${this.ID}'`;
        var jammerResults = JSON.parse(JSON.stringify(db.exec(jammerQuery)));
        if (jammerResults != null && jammerResults.length > 0)
        {
            var jammerTable = Tableify(jammerResults);
            for (var i = 0; i < jammerTable.length; i++)
            {
                var row = jammerTable[i];
                if (row[0] < 1) continue;
                var sameID = this.Games.filter(function(item){return (item.GameID == row[0]);});
                if (sameID == null || sameID.length == 0)
                {
                    var creditedAs = row[1] != null? row[1] : this.Name;
                    this.Games.push(new Role(creditedAs, row[2], row[0], db));
                }
            }
        }
        var nQ = `SELECT ID FROM Games WHERE User = '${this.Name}'`;
        var gTable = Query(nQ, db);
        if (gTable != null && gTable.length > 0)
        {
            for (var q = 0; q < gTable.length; q++)
            {
                var gRow = gTable[q][0];
                var sameID = this.Games.filter(function(item){return (item.GameID == gRow);});
                if (sameID == null || sameID.length == 0)
                {
                    this.Games.push(new Role(this.Name, null, gRow, db));
                }
            }
        }
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
            var gameTable = Query(winQuery, db);
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
                var prevResults = Query(prevQuery, db);
                if (prevResults != null && prevResults.length > 0 && 
                    prevResults[0] != null && prevResults[0] != "null")
                {
                    var prevRow = prevResults[0];
                    this.Previous = LIBRARY_PATH + prevRow[JAM_URL] + prevRow[JAM_PAGE] + ".html";
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
            var juds =  `SELECT UID, Name FROM ${GUEST_TABLE} WHERE Jam IS '${this.ID}' AND Judge = 1`;
            var judResults = Query(juds, db);
            if (judResults != null && judResults.length > 0)
            {
                for (var q = 0; q < judResults.length; q++)
                {
                    var jRow = judResults[q];
                    this.Judges.push(new PersonLink(jRow[0], jRow[1]));
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
function URLVars() 
{
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}
function GetParam(parameter, defaultvalue)
{
    var urlparameter = defaultvalue;
    if(window.location.href.indexOf(parameter) > -1)
    {
        urlparameter = URLVars()[parameter];
    }
    return urlparameter;
}
function GetUserLink(id, creditedAs = null)
{
    var name = creditedAs;
    if (name == null)
    {
        var sql = `SELECT Name FROM User WHERE ID = ${id}`;
        var usrResults = JSON.parse(JSON.stringify(db.exec(sql)));
        if (usrResults != null && usrResults.length > 0)
        {
            var usrTable = Tableify(usrResults);
            name = usrTable[0][0];
        }
    }
    return new PersonLink(id, name);
}
function GetProfile(db)
{
    var profile = null;
    var userID = GetParam("userid", 0);
    if (userID > 0)
    {
        var sql = `SELECT * FROM User WHERE ID = ${userID}`;
        var usrResults = JSON.parse(JSON.stringify(db.exec(sql)));
        if (usrResults != null && usrResults.length > 0)
        {
            var usrTable = Tableify(usrResults);
            if (usrTable.length > 0) profile = new Profile(usrTable[0], db);
        }
    }
    return profile;
}
function GetUserID(name, db)
{
    var sql = `SELECT ID FROM User WHERE Name = '${name}' OR Itch = '${name}'`;
    var usrResults = JSON.parse(JSON.stringify(db.exec(sql)));
    if (usrResults != null && usrResults.length > 0)
    {
        var usrTable = Tableify(usrResults);
        if (usrTable.length > 0)
        {
            console.info(`${usrTable.length} matches for ${name}`);
            return usrTable[0][0];
        }
    }
    return null;
}
function GetTeam(db)
{
    var profile = null;
    var userID = GetParam("teamid", 0);
    if (userID > 0)
    {
        var sql = `SELECT * FROM Games WHERE TeamID = ${userID}`;
        var usrResults = JSON.parse(JSON.stringify(db.exec(sql)));
        if (usrResults != null && usrResults.length > 0)
        {
            var usrTable = Tableify(usrResults);
            if (usrTable.length > 0) profile = new TeamProfile(userID, usrTable, db);
        }
    }
    return profile;
}
class GameTeam {
    constructor(game, db)
    {
        this.Game = game;
        this.Jam = GetJamLink(this.Game.Jam, db);
        this.Links = [];
        var jammerQ = 
            `SELECT Jammer.UserID, Jammer.Name as Credited, ` + 
            `User.Name FROM Jammer INNER JOIN User ON Jammer.UserID = User.ID ` + 
            `WHERE Jammer.GameID = ${this.Game.ID}`;
        var jTable = Query(jammerQ, db);
        if (jTable != null)
        {
            for (var i = 0; i < jTable.length; i++)
            {
                var row = jTable[i];
                var sameID = this.Links.filter(function(item){return (item.ID == row[0]);});
                if (sameID == null || sameID.length == 0)
                {
                    var cName = row[1] != null? row[1] : row[2];
                    this.Links.push(new PersonLink(row[0], cName));
                }
            }
        }
    }
}
class TeamProfile
{
    constructor(id, gameTable, db)
    {
        this.ID = id;
        this.Name = null;
        var nTable = Query(`SELECT Name FROM Teams WHERE ID = ${id}`, db);
        if (nTable != null)
        {
            this.Name = nTable[0][0];
        }
        this.Games = [];
        for (var i = 0; i < gameTable.length; i++)
        {
            var row = gameTable[i];
            var game = new Game(row);
            this.Games.push(new GameTeam(game, db));
        } 
    }
}

export { Group, Result, Jam, Tableify, GetJamFromPage, GetProfile, GetUserID, GetTeam };