/*
    // Mutli-screen flat 3D analogue clock (V2.7) with jQuery & CSS3 - No image, no webGL
    // By molokoloco@gmail.com 05/2013
    
    // Demo : http://molokoloco.github.io/flatClock3d/
    
    // Infos : http://www.b2bweb.fr/coding-project/mutli-screen-flat-3d-analogue-clock-with-jquery-and-css3-v2-3/
    // GitHub sources : https://github.com/molokoloco/flatClock3d
    // jsFiddle 2D : http://jsfiddle.net/molokoloco/V2rFN/
    // jsFiddle + 3D : http://jsfiddle.net/molokoloco/x6yc3/
*/

$(function () { // DOM READY /////////////////////

    if (!Modernizr.csstransforms3d) {
        console.log('Sad, your computer doesn\'t support CSS 3D');
        // blacklisted graphics cards with only browser software emulation will rotate in 3D but fail with clock background
        $('#clockBack,#refletBack').remove(); 
    }
    
    var $window     = $(window),
        $content    = $('#content'),
        $rotator    = $('#rotator'),
        $clock      = $('#clock'),
        $shadow     = $('#shadow'),
        $emboss     = $('#emboss'),
        $toggleView = $('#toggleView'),
        $d3         = $('#d3');
    
    var cW          = $rotator.outerWidth(),
        cH          = $rotator.outerHeight(),
        browser     = null,
        scale       = 0,
        scaleMin    = 0.2,
        scaleMax    = 1.5,
        size        = null,
        offset      = 0,
        resizeInt   = null;
    
    var scaleToFit  = function() { // Auto-scale content to full screen
            // https://hacks.mozilla.org/2013/05/optimizing-your-javascript-game-for-firefox-os/
            browser = [$window.innerWidth(), $window.innerHeight()];
            scale   = (Math.min(browser[0] / cW, browser[1] / cH)) * 0.8; // scaleToFit - 20% marging
            scale   = Math.min(scaleMax, scale); // Don't scale too much
            scale   = Math.max(scaleMin, scale);
            size    = [cW * scale, cH * scale];
            offset  = [(browser[0] - size[0]) / 2, (browser[1] - size[1]) / 2];
            $content.css({transform: 'translate('+offset[0]+'px, '+offset[1]+'px) scale('+scale+')'});
        },
        callScaleToFit = function() { // Simple debounce
            if (resizeInt) clearInterval(resizeInt);
            resizeInt = setInterval(scaleToFit, 250);
        };

    $window
        .on('resize', callScaleToFit)
        .trigger('resize');
    
    /*
    var landscapeOrientation = window.innerWidth/window.innerHeight > 1;
    if ( e.rotationRate )
        switch (window.orientation) {
             case 90: break;
             case -90: break;
             case 180: break;
             default: break;
        }
    */

    // Create Clock with plugin
    $clock.analogueClock({ 
        withDate:true,
        withDigitalTime:false
    });
    
    // Take a DIV as a box, and rotate it...
    $rotator.rotator3d({
        shadow: $('#shadow'),
        reflet: $('#reflet'),
        refletBack: $('#refletBack'),
        rotationX: 20,
        rotationY: 20
    });
    
    // Test with/out emboss ? (Change some CSS3 features to low settings
    $emboss.on('click', function() { 
        $content.toggleClass('emboss');
    });
    
    // Preset views (Link commented in index.html example)
    var views       = ['front', 'back', 'appleFront', 'appleBack', 'frontFloor', 'backFloor', 'sideRight', 'sideLeft', 'squareRoot'],
        viewsNum    = views.length,
        viewCurrent = 0;

    $toggleView.on('click', function() { 
        if (viewCurrent < viewsNum)  {
            $rotator.addClass('smoothTransTransition');
            $rotator.rotator3d('presets', views[viewCurrent]); // Presets views
        }
        else {
            $rotator.rotator3d('presets'); // Reset, switch to mouse control
            viewCurrent = 0;
            $rotator.removeClass('smoothTransTransition');
        }
        viewCurrent++;
    });
    
    // Test with/out transform (2D and 3D)
    $d3.on('click', function() { 
        if (scaleMax == 1.5) { // reset scale 2D too
            scaleMax = 1;
            scaleMin = 1;
            $('#clockBack,#refletBack,#clockBorder,#shadow,.side').hide();
        }
        else {
            scaleMax = 1.5;
            scaleMin = 0.2;
            if (Modernizr.csstransforms3d)
                $('#clockBack,#refletBack,#clockBorder,#shadow,.side').show();
        }
        $window.trigger('resize'); // Re-scale 2D
        $rotator.rotator3d('toggle3d'); // Toggle 3D
    });
    
    if (window.isMobile) setTimeout(function () { window.scrollTo(0, 1); }, 0);
    else $emboss.trigger('click'); // Activate emboss on desktop ?
});