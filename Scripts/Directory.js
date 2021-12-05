/// <reference path="Constants.js" />
import { 
    SQL_PATH, SQL_SCRIPT, SQL_SCRIPT_ID,
    LIBRARY_PATH, STYLE_PATH, STYLE_ID, DB_PATH,
    DIRECTORIES_TABLE, TITLE, DIRECTORY_CLASS 
} from './Constants.js';
import { SetTitle, AddFooter, AddScript, AddStyle } from './Common.js';
import { Group, Tableify } from './Data.js';

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
                    IncludesDirectory();
                    AddFooter();
                    
                }
                else console.log("DB Null");
            }, 200);
        };
            dbRequest.send();
        });
    }, 200);

function IncludesDirectory()
{
    if (window.location.href.includes("Library")) return;
    SetTitle(TITLE);
    document.getElementById("site-title").innerText = TITLE;
    var container = document.getElementById('main-content');

    var query = `SELECT * FROM ${DIRECTORIES_TABLE} ORDER BY ID ASC`;
    var dbDirectoryTable = db.exec(query);
    var table = Tableify(JSON.parse(JSON.stringify(dbDirectoryTable)));
    for (var i = 0; i < table.length; i ++)
    {
        var group = new Group(table[i], db);
        if (group.Show == false) continue;
        
        var groupcontainer = document.createElement('div');
        groupcontainer.classList = "jam-container";
        container.appendChild(groupcontainer);

        var header = document.createElement('h3');
        header.innerText = group.Name;
        groupcontainer.appendChild(header);
        var accent = document.createElement('div');
        accent.className = "accent";
        accent.id = `${group.ElementID}-accent`;
        groupcontainer.appendChild(accent);
        
        var directory = document.createElement('div');
        directory.className = DIRECTORY_CLASS;
        directory.id = group.ElementID;
        groupcontainer.appendChild(directory);

        var desc = document.createElement('p');
        desc.innerHTML = group.Descripton;
        directory.appendChild(desc);

        var directoryList = document.createElement('ul');
        for (var n = 0; n < group.Jams.length; n ++)
        {
            var jam = group.Jams[n];
            var listItem = ListItem(directoryList);
            if (jam.Page != null)
            {
                var link = document.createElement('a');
                if (jam.Page != null) link.href = LIBRARY_PATH + jam.URL + jam.Page + ".html";
                else link.href = "/";
                link.innerText = jam.Name;
                listItem.appendChild(link);
            }
            else listItem.innerHTML += `<span>${jam.Name}</span>`;
            listItem.innerHTML += ` ${jam.Theme}`
        }
        directory.appendChild(directoryList);
    }
}
function ListItem(parentNode)
{
    var listItem = document.createElement('li');
    parentNode.appendChild(listItem);
    return listItem
}