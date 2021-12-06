/// <reference path="Constants.js" />
import { 
    SQL_PATH, SQL_SCRIPT, SQL_SCRIPT_ID, JAM_ACCENT,
    STYLE_PATH, STYLE_ID, DB_PATH 
} from './Constants.js';
import { SetTitle, AddFooter, AddScript, AddStyle } from './Common.js';
import { GetTeam } from './Data.js';

var db = null;

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
                AddFooter();
                DrawTeam();
            }
            else console.log("DB Null");
        }, 200);
    };
        dbRequest.send();
    });
}, 200);

function DrawTeam()
{
    var profile = GetTeam(db);
    
    if (profile == null) 
    {
        console.error(`Couldn't find team!`);
        return;
    }
    SetTitle(profile.Name)
    var container = document.getElementById('main-content')
    container.innerHTML = 
        `<div class="jam-container">` +
        `<h1 class="jamheading">${profile.Name}</h1>` +
        JAM_ACCENT + `</div>`;

    if (profile.Games.length > 0)
    {
        var gameDiv = document.createElement('div');
        gameDiv.className = "directory";
        container.appendChild(gameDiv);
        var mainP = document.createElement('p');
        gameDiv.appendChild(mainP);
        var categoryHeader = document.createElement('h1');
        categoryHeader.className = "profile-header";
        categoryHeader.innerText = "Games";
        mainP.appendChild(categoryHeader);
        var gamesAccent = document.createElement('div');
        gamesAccent.className = "accent-small";
        mainP.appendChild(gamesAccent);
      
        var resultList = document.createElement('ul');
        resultList.id = "games";
        mainP.appendChild(resultList);

        for (var i = 0; i < profile.Games.length; i++)
        {
            var game = profile.Games[i];
            var resultItem = ListItem(resultList);
            resultItem.className = "profile-result";

            if (game.Game.Link != null)
            {
                var gameLink = document.createElement('a');
                gameLink.href = game.Game.Link;
                gameLink.target = "new";
                gameLink.innerText = game.Game.Name;
                gameLink.className = "game-item";
                resultItem.appendChild(gameLink);
            }
            else 
            {
                var gameSpan = document.createElement('span');
                gameSpan.id = 'game-' + game.GameID;
                gameSpan.innerText = game.Game.Name;
                gameSpan.className = "game-item";
                resultItem.appendChild(gameSpan);
            }

            if (game.Links.length > 0)
            {
                var pList = document.createElement('ul');
                pList.className = "person-list";
                resultItem.appendChild(pList);

                for (var j = 0; j < game.Links.length; j++)
                {
                    var person = game.Links[j];
                    var pLi = document.createElement('li');
                    var pLink = document.createElement('a');
                    pLi.id = "userid-" + person.ID;
                    pLink.href = person.href;
                    pLink.innerText = person.Name;
                    if (game.Submitter != null && game.Submitter.ID == person.ID)
                    {
                        var submitterIcon = document.createElement('span');
                        submitterIcon.className = "submitter";
                        submitterIcon.title = "Game Submitter";
                        submitterIcon.innerText = "👑";
                        pLink.appendChild(submitterIcon);
                    }
                    pLi.appendChild(pLink);
                    pList.appendChild(pLi);
                }
            }
            resultItem.innerHTML += 
                ` for <a href="${game.Jam.href}">${game.Jam.Name}</a>`;
            resultList.appendChild(resultItem);
        }
    }
}
function ListItem(parentNode)
{
    var listItem = document.createElement('li');
    parentNode.appendChild(listItem);
    return listItem
}