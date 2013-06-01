/* =============================================================
    // Mutli-screen flat 3D analogue clock (V2.5) with jQuery & CSS3 - No image, no webGL
    // By molokoloco@gmail.com 05/2013
    
	// Demo : http://molokoloco.github.io/flatClock3d/
    
	// Infos : http://www.b2bweb.fr/coding-project/mutli-screen-flat-3d-analogue-clock-with-jquery-and-css3-v2-3/
    // GitHub sources : https://github.com/molokoloco/flatClock3d
	// jsFiddle 2D : http://jsfiddle.net/molokoloco/V2rFN/
    // jsFiddle + 3D : http://jsfiddle.net/molokoloco/x6yc3/
   =============================================================
	// Usage example...

    $('#clock').analogueClock({ // Create Clock
        withDate:false,
        withDigitalTime:false
    });

* ============================================================== */


!function ($) {

   /* CSS3 Clock with jQuery
    * ========================== */

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
				
                $('<div id="clockBorder"/>')
                    .append(sidesHtml)
					.appendTo($clock.parent())
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

}(window.jQuery);