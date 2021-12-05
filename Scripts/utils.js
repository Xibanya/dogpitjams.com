// ---- SHADER VIEWER UTILS ---- //

//puts links on known Includes
function MakeIncludesDirectory()
{
    var includesTable = db.exec("SELECT * FROM Jams");
    var nodes = document.getElementsByClassName(PRETTYPRINT_CLASS);
    var i;
    var NAME = 1;
    var JAM_PATH = 5;
    var JAM_PAGE = 6
    for (i = 0; i < nodes.length; i++) 
    {
        table = JSON.parse(JSON.stringify(includesTable));
        table[0].values.forEach(row => {
            if (nodes[i].innerText.includes(row[NAME]))
            {
                var page = LIBRARY_PATH + row[JAM_PATH] + row[JAM_PAGE] + ".html";
                var newTag = "<a href=\"" + page + "\">" + row[NAME]+ "</a>";
                findAndReplace(row[NAME], newTag, nodes[i]);
            }
        });
    }
}