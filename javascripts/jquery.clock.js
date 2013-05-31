/*
    // Mutli-screen flat 3D analogue clock (V2.3) with jQuery & CSS3 - No image, no webGL
    // By molokoloco@gmail.com 10/10/2011 - Edit 3D 28/05/2013
    // Demo : http://www.b2bweb.fr/framework/myClock/
    // Infos : http://www.b2bweb.fr/coding-project/mutli-screen-flat-3d-analogue-clock-with-jquery-and-css3-v2-3/
    // jsFiddle 2D : http://jsfiddle.net/molokoloco/V2rFN/
    // jsFiddle + 3D : http://jsfiddle.net/molokoloco/x6yc3/
*/

(function ($, window) {

    var isMozMobile = (/Firefox/i.test(navigator.userAgent) && /Android/i.test(navigator.userAgent));
	
	(function () { // Cross mobile detect // requestAnimationFrame
        
        window.isMobile = ('DeviceOrientationEvent' in window || 'orientation' in window); // http://stackoverflow.com/questions/11381673/javascript-solution-to-detect-mobile-browser/16836337#16836337
        if (/Windows NT|Macintosh|Mac OS X|Linux/i.test(navigator.userAgent)) window.isMobile = false;
        if (/Mobile/i.test(navigator.userAgent)) window.isMobile = true;
        
		if (window.requestAnimationFrame) return; // Ok ?
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
		};
		if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (id) {
			clearTimeout(id);
		};
	}());
	
	// 3D iphone example /////////////////////
	// SOURCE : http://www.laplace2be.com/projects/phone/
	
	var Css3dRotator = function (element, options) {
		
		this.settings = $.extend({ // Default values
			reflet: null,
			refletBack: null,
			moveMouseEnabled: true,
			rotationX: 0,
			rotationY: 0,
			views: 0
		}, options || {});
	
		this.element = element;
		this.reflet = this.settings.reflet;
		this.refletBack = this.settings.refletBack;
		this.newRotationX = this.settings.rotationX;
		this.newRotationY = this.settings.rotationY;
		this.currentRotationX = 0;
		this.currentRotationY = 0;
	
		var that = this;
		if (window.isMobile) {
		   var orient = function(event) {
				if (that.settings.moveMouseEnabled !== true) return;
				var x = event.beta, // z = event.alpha,
					y = event.gamma;
				that.newRotationY = (isMozMobile ? y : -y);
				that.newRotationX = (isMozMobile ? -x : x); // $('#shadow').text('x:'+x+'/y:'+y);
		   };
		   //if ('deviceorientation' in window) // FF mobile ?? bug ?
		   window.addEventListener('deviceorientation', orient, false);
		   //else if ('DeviceOrientationEvent' in window) window.addEventListener('DeviceOrientationEvent', orient, false);
		}
		else {
			$(document)
				.mousemove(function (event) {
					if (that.settings.moveMouseEnabled === true) {
						that.newRotationY = -(event.pageX - $(window).width() * 0.5) * 0.15;
						that.newRotationX = -(event.pageY - $(window).height() * 0.5) * .5;
					}
				})
				.mouseenter(function (event) {
					that.settings.moveMouseEnabled = true;
				})
				.mouseleave(function (event) {
					that.settings.moveMouseEnabled = false;
					that.resetView();
				});
		}
		this.update();
	};
	
	Css3dRotator.prototype.limitedValue = function (value, miin, maax) {
		if (value <= miin) {
			value += 360;
			if (value < miin) value = this.limitedValue(value, miin, maax);
		}
		else if (value > maax) {
			value -= 360;
			if (value > maax) value = this.limitedValue(value, miin, maax);
		}
		return value;
	};
	
	Css3dRotator.prototype.update = function () {
		if (this.settings.moveMouseEnabled === true) {
			this.currentRotationX += (this.newRotationX - this.currentRotationX) * 0.1;
			this.currentRotationY += (this.newRotationY - this.currentRotationY) * 0.1;
			if (parseInt(this.currentRotationY * 10) != parseInt(this.newRotationY * 10) || parseInt(this.currentRotationX * 10) != parseInt(this.newRotationX * 10)) {
				this.element.css({
					perspective: '700px',
					rotateY: this.currentRotationY + 'deg',
					rotateX: this.currentRotationX + 'deg'
				});
				if (this.reflet) this.reflet.css({
					backgroundPosition: this.limitedValue(this.currentRotationY, -180, 180) * -5 + "px 0px"
				});
				if (this.refletBack) this.refletBack.css({
					backgroundPosition: (this.limitedValue(this.currentRotationY, 0, 360) - 180) * 5 + "px 0px"
				});
			}
		}
		requestAnimationFrame(this.update.bind(this));
	};
	
	Css3dRotator.prototype.resetView = function() {
		this.element.transition({
			rotateX: this.settings.rotationX,
			rotateY: this.settings.rotationY
		}, 1200);
		if (this.reflet) this.reflet.transition({
			backgroundPosition: this.limitedValue(this.currentRotationY, -180, 180) * -5 + "px 0px"
		}, 1200);
		if (this.refletBack) this.refletBack.transition({
			backgroundPosition: (this.limitedValue(this.currentRotationY, 0, 360) - 180) * 5 + "px 0px"
		}, 1200);
	};
	
	window.Css3dRotator = Css3dRotator; // Assign global
	
	// CSS3 Clock with jQuery /////////////////////

    $.fn.extend({ // Extend jQuery with custom plugin

        // Distribute elements clockwise inside a box
        circalise: function (options) { // $('div').circalise({targets:'div.unit'});
            options = $.extend({
                targets: '> *', // childs elements to distribute inside this box
                rotateTargets: false,
                rotate3d: false,
                startAngle: 270, // 270deg, start at top center (like a clock)
                xRadius: null, // default radius to the radius of the box, minus target width
                yRadius: null
            }, options || {});

            return this.each(function () {
                var $this = $(this),
                    thisW = parseInt($this.outerWidth(), 10),
                    thisH = parseInt($this.outerHeight(), 10),
                    $targets = $this.find(options.targets),
                    increase = (Math.PI * 2) / $targets.length, // Rad cheeseCake
                    angle = Math.PI * (options.startAngle / 180); // convert from DEG to RAD
                $targets.each(function () {
                    var $target = $(this),
                        xCenter = (thisW - parseInt($target.outerWidth(), 10)) / 2,
                        yCenter = (thisH - parseInt($target.outerHeight(), 10)) / 2,
                        xRadius = (options.xRadius || options.xRadius === 0 ? options.xRadius : xCenter),
                        yRadius = (options.yRadius || options.yRadius === 0 ? options.yRadius : yCenter),
                        params  = {
                            left: xRadius * Math.cos(angle) + xCenter,
                            top: yRadius * Math.sin(angle) + yCenter
                        };
                    if (options.rotateTargets || options.rotate3d) {
                        // (Math.PI/2) == 90deg in rad : rotate to keep tangent
                        var tanRot = Math.atan2(params.top - yCenter, params.left - xCenter) + (Math.PI / 2);
                        if (/e-/.test(tanRot+'')) tanRot = 0; // Infinity detected ?
                        tanRot = tanRot + 'rad';
                        if (options.rotate3d) params.transform = 'rotateX(90deg) rotateY('+tanRot+')';
                        else params.transform = 'rotate('+tanRot+')';
                    }
                    $target.transition(params, (window.isMobile ? 0 : 800));
                    angle += increase;
                });
                return $this;
            });
        },

        // Analogue Clock plugin
        analogueClock: function (options) {
            options = $.extend({ // Default values
                withHours: true, // Print digit time ?
                rotateHours: true, // Rotate digit time ?
                withUnits: true, // Print unit ?
                withDigitalTime: false, // Print time (digital) in center
                withDate: false // Print date
            }, options || {});

            return this.each(function () {

                // Build clock
                var $clock = $(this),
                    clockW = $clock.width(),
                    clockH = $clock.height(),
                    clockHalf = (clockW / 2),
                    $sec = $('<div class="sec"><div class="clockwise"></div></div>').appendTo($clock),
                    $min = $('<div class="min"><div class="clockwise"></div></div>').appendTo($clock),
                    $hour = $('<div class="hour"><div class="clockwise"></div></div>').appendTo($clock),
                    $time = (options.withDigitalTime ? $('<div class="time"></div>').appendTo($clock) : null),
                    $date = (options.withDate ? $('<div class="date"></div>').appendTo($clock) : null),
                    $innerCenter = $('<div class="innerCenter"></div>').appendTo($clock);

                // CSS Center elements with half clock diameter
                $sec.css({
                    left: (clockHalf - (parseInt($sec.width(), 10) / 2)) + 'px',
                    height: clockH + 'px'
                });
                $min.css({
                    left: (clockHalf - (parseInt($min.width(), 10) / 2)) + 'px',
                    height: clockH + 'px'
                });
                $hour.css({
                    left: (clockHalf - (parseInt($hour.width(), 10) / 2)) + 'px',
                    height: clockH + 'px'
                });
                $innerCenter.css({
                    margin: '-' + (parseInt($innerCenter.height(), 10) / 2) + 'px 0 0 -' + (parseInt($innerCenter.width(), 10) / 2) + 'px'
                });

                // Built analog digits number
                if (options.withHours) {
                    var plotsNum = 12, // 12 hours digits, normally ^^
                        digitsHtml = '';
                    for (var i = 0; i < plotsNum; i++) {
                        var digit = (i % 3 == 0 ? '<span>' + (i == 0 ? plotsNum : i) + '</span>' : i); // 0 == midnight == 12
                        digitsHtml += '<div class="digit">' + digit + '</div>';
                    }
                    $clock.append(digitsHtml);
                    $clock.circalise({
                        targets: 'div.digit',
                        rotateTargets: options.rotateHours
                    });
                }

                // Built analog digits number
                if (options.withUnits) {
                    var plotsNum = 12, // 12 hours digits, normally ^^
                        unitsHtml = '';
                    for (var i = 0; i < plotsNum; i++) unitsHtml += '<div class="unit"></div>';
                    $clock.append(unitsHtml);
                    var xRadius = parseInt($innerCenter.width(), 10) / 2 - (parseInt($clock.find('div.unit').eq(0).outerHeight(), 10) / 2),
                        yRadius = parseInt($innerCenter.height(), 10) / 2 - (parseInt($clock.find('div.unit').eq(0).outerHeight(), 10) / 2);
                    $clock.circalise({
                        targets: '.unit',
                        rotateTargets: true,
                        xRadius: xRadius,
                        yRadius: yRadius
                    });
                }

                // Built clock 3D border sides : 3D smooth cylinder, polygones like
                var plotsNum = 50,
                    sidesHtml = '';
                for (var i = 0; i < plotsNum; i++) {
                    sidesHtml += '<div class="side"></div>';
                }
                $('#clockBorder')
                    .append(sidesHtml)
                    .circalise({
                        targets: '.side',
                        rotate3d: true,
                        startAngle: 0,
                        xRadius: clockHalf,
                        yRadius: clockHalf
                    });

                // Animate clockwise
                var timer = function () {
                    var now     = new Date(),
                        seconds = now.getSeconds(),
                        mins    = now.getMinutes(),
                        hours   = now.getHours();
                    $sec.css({transform: 'rotate('+(seconds * 6) + 'deg)'}); // 60 * 6 == 360°
                    $min.css({transform: 'rotate('+(mins * 6) + 'deg)'});
                    $hour.css({transform: 'rotate('+(hours * 30 + (mins / 2)) + 'deg)'});
                    if (options.withDate) // Tue Oct 11 2011 00:37:36 GMT+0200 (Paris, Madrid (heure d'été))
                        $date.html(now.toString().split(now.getFullYear())[0]);
                    if (options.withDigitalTime)
                        $time.html(now.toString().split(now.getFullYear())[1].split(' ')[1]);
                    setTimeout(timer, 300); // precision 300ms is fine when widget is alone
                };
                timer(); // init !
                return $clock; // this 
            });
        }
    });

})(jQuery, window);

// DOM READY /////////////////////

$(function () {

    if (!Modernizr.csstransforms3d) {
        console.log('Sad, your computer doesn\'t support CSS 3D');
		// blacklisted graphic card with only browser software emulation will rotate in 3D but fail with clock background
        $('#clockBack,#refletBack,#clockBorder').hide(); 
    }
	
	var $content = $('#content'),
        cW       = $('#clock').width() + 50,
        cH       = $('#clock').height() + 50,
        browser  = null,
        scale    = 0,
        size     = null,
        offset   = 0;
    
    $(window)
        .on('resize', function() { // Auto-scale full screen
            browser = [$(window).innerWidth(), $(window).innerHeight()];
            scale   = Math.min(browser[0] / cW, browser[1] / cH); // scaleToFit
            scale   = Math.min(1.5, scale);
            size    = [cW * scale, cH * scale];
            offset  = [25 + (browser[0] - size[0]) / 2, 25 + (browser[1] - size[1]) / 2];
            $content.css({transform: 'translate('+offset[0]+'px, '+offset[1]+'px) scale('+scale+')'});
        })
        .trigger('resize');
    
	/* var landscapeOrientation = window.innerWidth/window.innerHeight > 1;
    if ( e.rotationRate )
    switch (window.orientation) {
         case 90: break;
         case -90: break;
         case 180: break;
         default: break;
    } */
    
    $('#clock').analogueClock({ // Create Clock
        withDate:false,
        withDigitalTime:false
    });

    var cssPhone = new Css3dRotator($('#rotator'), {
        reflet: $('#reflet'),
        refletBack: $('#refletBack'),
        rotationX: 6,
        rotationY: -18
    });

    $('#shadow').on('click', function() { // Test with/out shadow ?
        $("#rotator").toggleClass('shadow');
    });
    
    if (window.isMobile) setTimeout(function () { window.scrollTo(0, 1); }, 0);
    else $('#shadow').trigger('click'); // Activate shadow on desktop ?
});
