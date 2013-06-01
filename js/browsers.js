(function () { // Cross mobile detect // requestAnimationFrame
	
	window.isMobile = (Modernizr.touch ? true : false); // http://stackoverflow.com/questions/11381673/javascript-solution-to-detect-mobile-browser/16836337#16836337
	
	window.isMozMobile = (/Firefox/i.test(navigator.userAgent) && /Android/i.test(navigator.userAgent));
	
	if (/iPhone/i.test(navigator.userAgent)) {
		var $metas = $('meta[name=viewport]');
		$metas.attr('content', 'width=device-width, minimum-scale=1.0, maximum-scale=1.0');
		document.addEventListener('gesturestart', function () {
		  $metas.attr('content', 'width=device-width, minimum-scale=0.25, maximum-scale=1.6');
		}, false);
	}
	
	if (!('requestAnimationFrame' in window)) {
		var lastTime = 0,
			vendors = ['webkit', 'moz', 'ms', 'o'];
		
		for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
		}
		
		if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function () {
					callback(currTime + timeToCall);
				},
				timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		}
		
		if (!window.cancelAnimationFrame) {
			window.cancelAnimationFrame = function (id) {
				clearTimeout(id);
			};
		}
	}

}());