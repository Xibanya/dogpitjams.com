const YOUTUBE = `https://www.youtube.com/channel/UCGu0wtYct94lFuAKN_SrFAg/playlists?view=50&sort=dd&shelf_id=3`;
const URL_INDEX = `<a href="/"><i class="fa fa-home"></i></a>`;
const URL_REPO = `<a href="${YOUTUBE}" target="new"><i class="fa fa-youtube"></i></a>`;
const URL_DISCORD = `<a href="https://discord.gg/YvXrB62" target="new"><i class="fab fa-discord"></i></a>`;
const URL_T = `<a href="https://twitter.com/TeamDogpit" target="new"><i class="fa fa-twitter"></i></a>`;
const FOOTER_LINKS = `${URL_INDEX} ${URL_REPO} ${URL_T} ${URL_DISCORD}`;

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
function AddFooter(previous = null, next = null)
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
    if (previous != null && !previous.includes("null"))
    {
        var sourceText = document.createElement('span');
        sourceText.id = "footer-previous";
        footer.appendChild(sourceText);
        sourceText.classList = "subheading";
        sourceText.innerHTML = `<a href="${previous}">&laquo; Previous Jam</a> `;
    }

    var footerText = document.getElementById('footer-center');
    if (footerText == null)
    {
        footerText = document.createElement('span');
        footerText.id = "footer-center";
        footerText.classList = "center";
        footer.appendChild(footerText);
    }
    footerText.innerHTML = FOOTER_LINKS;

    if (next != null)
    {
        var nextText = document.createElement('span');
        nextText.id = "footer-next";
        footer.appendChild(nextText);
        nextText.classList = "subheading";
        nextText.innerHTML = `<a href="${next}">Next Jam &raquo;</a> `;
    }
}
export { SetTitle, AddFooter, AddScript, AddStyle };