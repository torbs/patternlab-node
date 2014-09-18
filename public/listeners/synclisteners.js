
/*!
 * Sync Listeners, v0.1
 *
 * Copyright (c) 2013 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * The JavaScript component of the WebSocket set-up that supports syncing
 * navigation between browsers and content updates with the server.
 *
 * The WebSocket test is from Modernizr. It might be a little too strict for our purposes.
 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/websockets.js
 *
 */

var wsn;
var wsnConnected = false;
var wsc;
var wscConnected = false;
var dataPrevious = 0;
var host = (window.location.host !== '') ? window.location.hostname : '127.0.0.1';

// handle page updates from one browser to another
function connectNavSync() {

	if ('WebSocket' in window && window.WebSocket.CLOSING === 2) {
		
		var navSyncCopy = "Page Follow";
		wsn = new WebSocket("ws://"+host+":"+navSyncPort+"/navsync");
		
		// when trying to open a connection to WebSocket update the pattern lab nav bar
		wsn.onopen = function (event) {
			wsnConnected = true;
			$('#navSyncButton').attr("data-state","on");
			$('#navSyncButton').addClass("connected");
			$('#navSyncButton').html(navSyncCopy+' On');
		}
		
		// when closing a connection (or failing to make a connection) to WebSocket update the pattern lab nav bar
		wsn.onclose = function (event) {
			wsnConnected = false;
			$('#navSyncButton').attr("data-state","off");
			if ($('#navSyncButton').hasClass("connected")) {
				$('#navSyncButton').removeClass("connected");
			}
			$('#navSyncButton').html(navSyncCopy+' Disabled');
		}
		
		// when receiving a message from WebSocket update the iframe source
		wsn.onmessage = function (event) {
			
			var data = JSON.parse(event.data);
			var vpLocation  = document.getElementById('sg-viewport').contentWindow.location.href;
			var mLocation   = "http://"+host+data.url;
			
			if (vpLocation != mLocation) {
				
				document.getElementById('sg-viewport').contentWindow.location.replace(mLocation);
				
				// make sure the pop doesn't fire and push the pattern
				urlHandler.doPop = false;
				urlHandler.pushPattern(data.patternpartial);
				
				// reset the defaults
				urlHandler.doPop    = true;
				urlHandler.skipBack = false;
				
			}
		}
		
		// when there's an error update the pattern lab nav bar
		wsn.onerror = function (event) {
			wsnConnected = false;
			$('#navSyncButton').attr("data-state","off");
			if ($('#navSyncButton').hasClass("connected")) {
				$('#navSyncButton').removeClass("connected");
			}
			$('#navSyncButton').html(navSyncCopy+' Disabled');
		}
		
	}
	
}
connectNavSync();

// handle content updates generated by the watch
function connectContentSync() {
	
	if ('WebSocket' in window && window.WebSocket.CLOSING === 2) {
		
		var dc = true;
		var contentSyncCopy = "Auto-reload";
		
		wsc = new WebSocket("ws://"+host+":"+contentSyncPort+"/contentsync");
		
		// when trying to open a connection to WebSocket update the pattern lab nav bar
		wsc.onopen = function (event) {
			wscConnected = true;
			$('#contentSyncButton').attr("data-state","on");
			$('#contentSyncButton').addClass("connected");
			$('#contentSyncButton').html(contentSyncCopy+' On');
		}
		
		// when closing a connection (or failing to make a connection) to WebSocket update the pattern lab nav bar
		wsc.onclose = function (event) {
			wscConnected = false;
			$('#contentSyncButton').attr("data-state","off");
			if ($('#contentSyncButton').hasClass("connected")) {
				$('#contentSyncButton').removeClass("connected");
			}
			$('#contentSyncButton').html(contentSyncCopy+' Disabled');
		}
		
		// when receiving a message from WebSocket reload the current frame adding the received timestamp
		// as a request var to, hopefully, bust caches... cachi(?)
		wsc.onmessage = function (event) {
			document.getElementById('sg-viewport').contentWindow.location.reload();
		}
		
		// when there's an error update the pattern lab nav bar
		wsc.onerror = function (event) {
			wscConnected = false;
			$('#contentSyncButton').attr("data-state","off");
			if ($('#contentSyncButton').hasClass("connected")) {
				$('#contentSyncButton').removeClass("connected");
			}
			$('#contentSyncButton').html(contentSyncCopy+' Disabled');
		}
		
	}
	
}
connectContentSync();

// handle when a user manually turns navSync and contentSync on & off
$('#navSyncButton').click(function() {
	if ($(this).attr("data-state") == "on") {
		wsn.close();
		$(this).attr("data-state","off");
		$(this).removeClass("connected");
		$(this).html('Nav Sync Off');
	} else {
		connectNavSync();
		$(this).attr("data-state","on");
		$(this).addClass("connected");
		$(this).html('Nav Sync On');
	}
});

$('#contentSyncButton').click(function() {
	if ($(this).attr("data-state") == "on") {
		wsc.close();
		$(this).attr("data-state","off");
		$(this).removeClass("connected");
		$(this).html('Content Sync Off');
	} else {
		connectContentSync();
		$(this).attr("data-state","on");
		$(this).addClass("connected");
		$(this).html('Content Sync On');
	}
});
