const YOUTUBE = `https://www.youtube.com/channel/UCGu0wtYct94lFuAKN_SrFAg/playlists?view=50&sort=dd&shelf_id=3`;
const URL_INDEX = `<a href="/"><i class="fa fa-home"></i></a>`;
const URL_REPO = `<a href="${YOUTUBE}" target="new"><i class="fa fa-youtube"></i></a>`;
const URL_DISCORD = `<a href="https://discord.gg/YvXrB62" target="new"><i class="fab fa-discord"></i></a>`;
const URL_T = `<a href="https://twitter.com/TeamDogpit" target="new"><i class="fa fa-twitter"></i></a>`;
const EXTERNAL_LINKS = `${URL_REPO} ${URL_T} ${URL_DISCORD}`;

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
    sourceText.classList = "hidden";

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
}
export { SetTitle, AddFooter, AddScript, AddStyle };