/// <reference path="Constants.js" />
import { 
    SQL_PATH, SQL_SCRIPT, SQL_SCRIPT_ID, JAM_ACCENT,
    STYLE_PATH, STYLE_ID, DB_PATH 
} from './Constants.js';
import { SetTitle, AddFooter, AddScript, AddStyle } from './Common.js';
import { GetProfile } from './Data.js';

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
                GetPerson();
            }
            else console.log("DB Null");
        }, 200);
    };
        dbRequest.send();
    });
}, 200);

function GetPerson()
{
    var profile = GetProfile(db);
    
    if (profile == null) 
    {
        console.error(`Couldn't find user ${userID}`);
        return;
    }
    SetTitle(profile.Name)
    var container = document.getElementById('main-content')
    container.innerHTML = 
        `<div class="jam-container">` +
        `<h1 class="jamheading">${profile.Name}</h1>` +
        JAM_ACCENT + `</div>`;

    if (profile.Judged.length > 0)
    {
        var guestDiv = document.createElement('div');
        guestDiv.className = "directory";
        container.appendChild(guestDiv);
        var judgeP = document.createElement('p');
        guestDiv.appendChild(judgeP);

        var judgeHeader = document.createElement('h1');
        judgeHeader.className = "profile-header";
        judgeHeader.innerText = "Judged";
        judgeP.appendChild(judgeHeader);
        var judgeAccent = document.createElement('div');
        judgeAccent.className = "accent-small";
        judgeP.appendChild(judgeAccent);
        
        var jList = document.createElement('ul');
        for (var i = 0; i < profile.Judged.length; i++)
        {
            var jItem = ListItem(jList);
            var jamLink = document.createElement('a');
            jamLink.href = profile.Judged[i].href;
            jamLink.innerText = profile.Judged[i].Name;
            jItem.appendChild(jamLink);
        }
        judgeP.appendChild(jList);
    }

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
        gamesAccent.style = "margin-top: -10px;";
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
                gameSpan.innerText = game.Game.Name;
                gameLink.className = "game-item";
                resultItem.appendChild(gameSpan);
            }
            if (game.Game.Team != null)
            {
                resultItem.innerHTML += ` by ${game.Game.Team}`;
            }
            if (game.Role != null)
            {
                resultItem.innerHTML += `<br>${game.Role} `;
            }
            if (game.Name != null && game.Name != profile.Name)
            {
                resultItem.innerHTML += `<i>(credited as ${game.Name})</i>`;
            }
            resultItem.innerHTML += 
                `<br>for <a href="${game.Jam.href}">${game.Jam.Name}</a>`;
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