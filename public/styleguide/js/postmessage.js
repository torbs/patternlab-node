/*!
 * Basic postMessage Support - v0.1
 *
 * Copyright (c) 2013-2014 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * Handles the postMessage stuff in the pattern, view-all, and style guide templates.
 *
 */

/*jslint indent:4*/
/*global window*/

function _jwertyCb(k, t) {
    return function () {
        var obj = JSON.stringify({ "keyPress": "ctrl+shift+" + k });
        window.parent.postMessage(obj, t);
        return false;
    };
}

function _aClick(e) {
    e.preventDefault();
    var href = this.getAttribute("href");
    if (href !== "#") {
        window.location.replace(href);
    }
}

// alert the iframe parent that the pattern has loaded assuming this view was loaded in an iframe
if (window.self !== window.top) {
    // handle the options that could be sent to the parent window
    //   - all get path
    //   - pattern & view all get a pattern partial, styleguide gets all
    //   - pattern shares lineage
    var path = window.location.toString(),
        parts = path.split('?'),
        options = {'path': parts[0]},
        i;

    options.patternpartial = (window.patternPartial !== '') ? window.patternPartial : 'all';
    if (window.lineage !== '') {
        options.lineage = window.lineage;
    }

    var targetOrigin = (window.location.protocol === 'file:') ? '*' : window.location.protocol + '//' + window.location.host;
    window.parent.postMessage(options, targetOrigin);

    // find all links and add an onclick handler for replacing the iframe address so the history works
    var aTags = document.getElementsByTagName('a');
    for (i = 0; i < aTags.length; i++) {
        aTags[i].onclick = _aClick;
    }

    // bind the keyboard shortcuts for various viewport resizings + pattern search
    var keys = [ "s", "m", "l", "d", "h", "f" ];
    for (i = 0; i < keys.length; i++) {
        window.jwerty.key('ctrl+shift+' + keys[i], _jwertyCb(keys[i], targetOrigin));
    }

    // bind the keyboard shortcuts for mqs
    var i = 0;
    while (i < 10) {
        window.jwerty.key('ctrl+shift+' + i, _jwertyCb(i, targetOrigin));
        i++;
    }
}

// if there are clicks on the iframe make sure the nav in the iframe parent closes
var body = document.getElementsByTagName('body');
body[0].onclick = function () {
    var targetOrigin = (window.location.protocol === "file:") ? "*" : window.location.protocol + "//" + window.location.host;
    var obj = JSON.stringify({ "bodyclick": "bodyclick" });
    window.parent.postMessage(obj, targetOrigin);
};

// watch the iframe source so that it can be sent back to everyone else.
function receiveIframeMessage(event) {
    var data = (typeof event.data !== "string") ? event.data : JSON.parse(event.data),
        path;

    // does the origin sending the message match the current host? if not dev/null the request
    if ((window.location.protocol !== "file:") && (event.origin !== window.location.protocol + "//" + window.location.host)) {
        return;
    }

    // see if it got a path to replace
    if (data.path !== undefined) {

        if (window.patternPartial !== '') {

            // handle patterns and the view all page
            /*jslint regexp:true*/
            var re = /patterns\/(.*)$/;
            path = window.location.protocol + "//" + window.location.host + window.location.pathname.replace(re, '') + data.path + '?' + Date.now();
            window.location.replace(path);

        } else {

            // handle the style guide
            path = window.location.protocol + "//" + window.location.host + window.location.pathname.replace("styleguide\/html\/styleguide.html", "") + data.path + '?' + Date.now();
            window.location.replace(path);

        }

    } else if (data.reload !== undefined) {

        // reload the location if there was a message to do so
        window.location.reload();

    }

}
window.addEventListener("message", receiveIframeMessage, false);