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
    var query = `SELECT * FROM ${DIRECTORIES_TABLE} ORDER BY ID ASC`;
    var dbDirectoryTable = db.exec(query);
    var table = Tableify(JSON.parse(JSON.stringify(dbDirectoryTable)));
    var lastElement;
    for (var i = 0; i < table.length; i ++)
    {
        var row = new Group(table[i], db);
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
        GenerateDirectory(row, row.ElementID, row.Descripton);
    }
}
function GenerateDirectory(group, elementID, description)
{
    if (group != null)
    {
        var node = document.getElementById(elementID);
        var desc = document.createElement('p');
        desc.innerHTML = description;
        node.appendChild(desc);
        if (node != null)
        {
            var increment = 0;
            var directoryList = DirectoryList();
            for (var i = 0; i < group.Jams.length; i ++)
            {
                var row = group.Jams[i];
                var listItem = ListItem(directoryList);
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
function DirectoryList()
{
    var listContainer = document.createElement('ul');
    return listContainer;
}
function ListItem(parentNode)
{
    var listItem = document.createElement('li');
    parentNode.appendChild(listItem);
    return listItem
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