/// <reference path="Constants.js" />
import { 
    SQL_PATH, SQL_SCRIPT, SQL_SCRIPT_ID, JAM_ACCENT,
    STYLE_PATH, STYLE_ID, DB_PATH, JAM_INFO_ID, SMALL_ACCENT 
} from './Constants.js';
import { SetTitle, AddFooter, AddScript, AddStyle } from './Common.js';
import { GetJamFromPage, GetUserID } from './Data.js';

var db = null;
const TEST_DB_PATH  = "/Data/JamsTest.db";

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
            if (db != null) GetJamPage();
            else console.error("DB Null");
        }, 200);
    };
        dbRequest.send();
    });
}, 200);

function GetJamPage()
{
    var row = GetJamFromPage(db);
    if (row == null) return;
    SetTitle(row.Name)
    var container = document.getElementById(JAM_INFO_ID)
    container.innerHTML = "";
    if (row.Logo != null)
    {
        var imgString = `<img src="/Images/${row.Logo}" alt="Jam Logo" class="logo">`;
        if (row.External != null)
        {
            imgString = `<a href="${row.External}" target="new">${imgString}</a>`;
        }
        container.innerHTML += imgString;
    }
      
    container.innerHTML += 
        `<div class="jam-container">` +
        `<h1 class="jamheading">${row.Name}</h1>` + 
        `<h3 class="themeheading">${row.Theme}</h3>` + JAM_ACCENT +
        `<h4 class="jamsubtitle">${row.Season} ${row.Year}, Organized by ${row.Organizer}</h4>` +  
        `</div>`;
    
    var mainDiv = document.createElement('div');
    mainDiv.className = "directory";

    if (row.Judges != null && row.Judges.length > 0)
    {
        var judgeP = document.createElement('p');
        judgeP.innerHTML = `<h2>Judges</h2>${SMALL_ACCENT}`;
        mainDiv.appendChild(judgeP);
        var jList = document.createElement('ul');
        for (var i = 0; i < row.Judges.length; i++)
        {
            var jItem = ListItem(jList);
            jItem.innerHTML = 
                `<a href="${row.Judges[i].href}">${row.Judges[i].Name}</a>`;
        }
        judgeP.appendChild(jList);
    }

    container.appendChild(mainDiv);
    var mainP = document.createElement('p');
    mainDiv.appendChild(mainP);

    if (row.Categories.length > 0)
    {
        var categoryHeader = document.createElement('h2');
        categoryHeader.innerText = "Categories";
        mainP.appendChild(categoryHeader);
        mainP.innerHTML += SMALL_ACCENT;
        var resultList = document.createElement('ul');
        resultList.id = "Judging-Categories";
        mainP.appendChild(resultList);
        for (var i = 0; i < row.Categories.length; i++)
        {
            var category = row.Categories[i];
            var resultItem = ListItem(resultList);
            resultItem.id = `category-${category.Name}`;
            resultItem.innerHTML = `<span>${category.Name}</span>`;
            resultList.appendChild(resultItem);
            if (category.Points != null)
            {
                resultItem.innerHTML += ` <i>(${category.Points} Points)</i>`;
            }
            if (category.Descripton != null)
            {
                var rD = document.createElement('p');
                rD.innerText = category.Descripton;
                resultItem.appendChild(rD);
            }
        }
    }
    if (row.Winners.length > 0)
    {
        var winnerHeader = document.createElement('h2');
        winnerHeader.innerText = "Winners";
        mainP.appendChild(winnerHeader);
        mainP.innerHTML += SMALL_ACCENT;
        var winnerList = document.createElement('div');
        winnerList.classList = "winner-list";
        mainP.appendChild(winnerList);

        for (var i = 0; i < row.Winners.length; i++)
        {
            var result = row.Winners[i];
            if (i > 0 && result.Place == 1 && row.Winners[i - 1].Place == 1) continue;
            console.info(`${result.Name} points: ${result.Points}`);
            if (result.Points != null)
            {
                var resultItem = ListItem(resultList);
                resultItem.id = `category-${result.Name}`;
                resultItem.innerHTML = 
                    `<span>${result.Name}</span> <i>(${result.Points} Points)</i>`;
                resultList.appendChild(resultItem);
            }
            else
            {
                if (result.Place < 2)
                {
                    var category = document.createElement('h3');
                    category.className = "winner";
                    category.innerText = result.Name;
                    winnerList.appendChild(category);
                }
                var gameDiv = document.createElement('div');
                winnerList.appendChild(gameDiv);
                if (result.Game != null)
                {
                    if (result.Place == 2) gameDiv.innerText += "Runner up: ";
                    else if (result.Place == 3) gameDiv.innerText += "3rd Place: ";
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
                        if (result.Place == 1 && i < row.Winners.length - 1 && 
                            row.Winners[i + 1].Place == 1)
                        {
                            var tied = row.Winners[i + 1].Game.Name;
                            gameDiv.innerHTML += ` tied with <span>${tied}</span>`;
                        }
                    }
                    if (result.Game.Team != null) 
                    {
                        var teamName = result.Game.Team;
                        var teamhref = `/Team.html?teamid=${result.Game.TeamID}`;
                        gameDiv.innerHTML += ` by <a href="${teamhref}">${teamName}</a>`;
                    }
                    else if (result.Game.User != null) 
                    {
                        var strUser = result.Game.User;
                        var userID = GetUserID(strUser, db);
                        if (userID != null) 
                        {
                            var userHref = "/Person.html?userid=" + userID;
                            gameDiv.innerHTML += ` by <a href="${userHref}">${strUser}</a>`;
                        }
                        else gameDiv.innerHTML += ` by ${strUser}`;
                    }
                }
            }
        }
    }
       
    if (row.Entries != null && row.Entries.length > 0)
    {
        var entP = document.createElement('p');
        entP.innerHTML = `<h2>Entries</h2>${SMALL_ACCENT}`;
        mainDiv.appendChild(entP);
        var entryList = document.createElement('ul');
        for (var i = 0; i < row.Entries.length; i++)
        {
            var listItem = ListItem(entryList);
            if (row.Entries[i].Link != null)
            {
                listItem.innerHTML = 
                    `<a href="${row.Entries[i].Link}" target="new">${row.Entries[i].Name}</a>`;
            }
            else listItem.innerHTML = `<span>${row.Entries[i].Name}</span>`;
            if (row.Entries[i].Team != null)
            {
                var teamName = row.Entries[i].Team;
                var teamhref = `/Team.html?teamid=${row.Entries[i].TeamID}`;
                listItem.innerHTML += ` by <a href="${teamhref}">${teamName}</a>`;
            }
            else if (row.Entries[i].User != null) 
            {
                var strUser = row.Entries[i].User;
                var userID = GetUserID(strUser, db);
                if (userID != null) 
                {
                    var userHref = "/Person.html?userid=" + userID;
                    listItem.innerHTML += ` by <a href="${userHref}">${strUser}</a>`;
                }
                else listItem.innerHTML += ` by ${row.Entries[i].User}`;
            }
            if (row.Entries[i].Score != null)
            {
                listItem.innerHTML += `<br>Score: ${row.Entries[i].Score}`;
            }
        }
        entP.appendChild(entryList);
    }
    AddFooter(row.Previous, row.Next);
}
function ListItem(parentNode)
{
    var listItem = document.createElement('li');
    parentNode.appendChild(listItem);
    return listItem
}