
var URL_INDEX = `<a href="${BASE}"><i class="fa fa-home"></i></a>`;
var URL_REPO = `<a href="${YOUTUBE}" target="new"><i class="fa fa-youtube"></i></a>`;
var URL_DISCORD = `<a href="https://discord.gg/YvXrB62" target="new"><i class="fab fa-discord"></i></a>`;
var URL_T = `<a href="https://twitter.com/TeamDogpit" target="new"><i class="fa fa-twitter"></i></a>`;
var YOUTUBE = `https://www.youtube.com/channel/UCGu0wtYct94lFuAKN_SrFAg/playlists?view=50&sort=dd&shelf_id=3`;
var EXTERNAL_LINKS = `${URL_REPO} ${URL_T} ${URL_DISCORD}`;

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
    sourceText.classList = isSource? "source" : "hidden";

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
    linkText.classList = isSource? "links" : "";
}