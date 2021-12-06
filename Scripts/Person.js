/// <reference path="Constants.js" />
import { 
    SQL_PATH, SQL_SCRIPT, SQL_SCRIPT_ID, JAM_ACCENT,
    STYLE_PATH, STYLE_ID, DB_PATH 
} from './Constants.js';
import { SetTitle, AddFooter, AddScript, AddStyle } from './Common.js';
import { GetProfile, GetUserID } from './Data.js';

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
        console.error(`Couldn't find user!`);
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
        judgeHeader.innerText = "Judge";
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
                gameLink.id = "game-" + game.GameID;
                resultItem.appendChild(gameLink);
            }
            else 
            {
                var gameSpan = document.createElement('span');
                gameSpan.innerText = game.Game.Name;
                gameSpan.className = "game-item";
                gameSpan.id = "game-" + game.GameID;
                resultItem.appendChild(gameSpan);
            }
            if (game.Game.Team != null) 
            {
                if (game.Game.Team != profile.Name && 
                    game.Game.TeamID != null && game.Game.TeamID > 0)
                {
                    var thref = `/Team.html?teamid=${game.Game.TeamID}`;
                    resultItem.innerHTML += 
                    ` by <a href="${thref}">${game.Game.Team}</a> `;
                }
                else resultItem.innerHTML += ` by ${game.Game.Team} `;
            }
            else if (game.Game.User != null)
            {
                var submitter = GetUserID(game.Game.User, db);
                if (submitter != profile.ID)
                {
                    var shref = `/Person.html?userid=${submitter}`;
                    resultItem.innerHTML += 
                        ` by <a href="${shref}">${game.Game.User}</a> `;
                }
                else resultItem.innerHTML += ` by ${game.Game.User} `;
            }

            if (game.Role != null)
            {
                var pRole = document.createElement('p');
                pRole.className = "result-line";
                pRole.innerText = game.Role;
                resultItem.appendChild(pRole);
            }
            if (game.Name != null && game.Name != profile.Name)
            {
                var pCredit = document.createElement('p');
                pCredit.className = "result-line";
                pCredit.innerHTML = `<i>(credited as ${game.Name})</i>`;
                resultItem.appendChild(pCredit);
            }
            var pJam = document.createElement('p');
            pJam.className = "result-line";
            pJam.innerHTML =  `for <a href="${game.Jam.href}">${game.Jam.Name}</a>`;
            resultItem.appendChild(pJam);
               
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