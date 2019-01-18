(function(doc, win) {
	var docEle = doc.documentElement,
		dpr = Math.min(win.devicePixelRatio, 3),
		scale = 1 / dpr,
		resizeEvent = 'orientationchange' in window ? 'orientationchange' : 'resize';
	var metaEle = doc.createElement('meta');
	metaEle.name = 'viewport';
	metaEle.content = 'initial-scale=' + scale + ',maximum-scale=' + scale;
	docEle.firstElementChild.appendChild(metaEle);

	var recalCulate = function() {
		var width = docEle.clientWidth;
		if (width < 1300) {
			docEle.style.fontSize = 10 * (width / 750) + 'px';
		} else {
			docEle.style.fontSize = 10 * (1300 / 750) + 'px';
		}
	};

	recalCulate();

	if (!doc.addEventListener) return;
	win.addEventListener(resizeEvent, recalCulate, false);
})(document, window);