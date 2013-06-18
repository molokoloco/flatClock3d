/* =============================================================
    // Mutli-screen flat 3D analogue clock (V2.7) with jQuery & CSS3 - No image, no webGL
    // By molokoloco@gmail.com 05/2013
    
    // Demo : http://molokoloco.github.io/flatClock3d/
    
    // Infos : http://www.b2bweb.fr/coding-project/mutli-screen-flat-3d-analogue-clock-with-jquery-and-css3-v2-3/
    // GitHub sources : https://github.com/molokoloco/flatClock3d
    // jsFiddle 2D : http://jsfiddle.net/molokoloco/V2rFN/
    // jsFiddle + 3D : http://jsfiddle.net/molokoloco/x6yc3/
   =============================================================
    // Usage example...

    var $cssBox3d = $('#rotator').rotator3d({
        shadow: $('#shadow'),
        reflet: $('#reflet'),
        refletBack: $('#refletBack'),
        rotationX: 6,
        rotationY: -18
    });
    
    $cssBox3d.rotator3d('toggle3d');

* ============================================================== */


!function ($, window) {

    "use strict";

   /* ROTATOR 3D 
    * Credits (before refactoring) : http://www.laplace2be.com/projects/phone/
    * ========================== */

    var rotator3d = function (element, options) {
        
        this.settings = $.extend(true, {}, $.fn.rotator3d.defaults, typeof options == 'object' && options || {});
    
        this.element          = element;
        this.shadow           = this.settings.shadow;
        this.reflet           = this.settings.reflet;
        this.refletBack       = this.settings.refletBack;
        this.newRotationX     = this.settings.rotationX;
        this.newRotationY     = this.settings.rotationY;
        this.currentRotationX = 0;
        this.currentRotationY = 0;
        this.winW             = 0;
        this.winH             = 0;
        this.paused           = false;

        var that    = this,
            $window = $(window);
        
        $(window)
            .on('resize', function() {
                that.winW = $window.width();
                that.winH = $window.height();
             })
            .trigger('resize');
        
        if (window.isMobile) {
           var orient = function(event) {
                if (!that.settings.moveMouseEnabled || !that.settings.is3D) return;
                var rotx = event.beta, // rotz = event.alpha,
                    roty = event.gamma;
                that.newRotationY = (window.isMozMobile ? roty : -roty);
                that.newRotationX = (window.isMozMobile ? -rotx : rotx);
           };
           //if ('deviceorientation' in window) // FF mobile ?? bug ?
           window.addEventListener('deviceorientation', orient, false);
           //else if ('DeviceOrientationEvent' in window) window.addEventListener('DeviceOrientationEvent', orient, false);
        }

        var mouseIsMove = function(event) { // Cross browser mousemouve/pointer/etc.. http://handjs.codeplex.com/
                if (!that.settings.moveMouseEnabled || !that.settings.is3D) return;
                event.preventDefault();
                that.newRotationY = -(event.pageX - that.winW * 0.5) * 0.15;
                that.newRotationX = -(event.pageY - that.winH * 0.5) * .5;
            },
            mouseEnter = function(event) {
                if (!that.settings.is3D || !that.settings.moveMouseEnabled) return;
                that.paused  = false;
                that.update();
                document.addEventListener('pointermove', mouseIsMove, false);
            },
            mouseLeave = function(event) {
                if (!that.settings.is3D || !that.settings.moveMouseEnabled) return;
                document.removeEventListener('pointermove', mouseIsMove, false);
                that.paused  = true; // User iddle state
                that.refresh();
            };

        $(document)
            .mouseenter(mouseEnter)
            .mouseleave(mouseLeave)
            .trigger('mouseenter');
        
        that.refresh();
        that.update();
    };
    
    rotator3d.prototype = {
        
        constructor: rotator3d,
        
        limitedValue: function (value, miin, maax) {
            if (value <= miin) {
                value += 360;
                if (value < miin) value = this.limitedValue(value, miin, maax);
            }
            else if (value > maax) {
                value -= 360;
                if (value > maax) value = this.limitedValue(value, miin, maax);
            }
            return value;
        },
        
        rotate3d: function(rotationX, rotationY) {
            this.element.css({
                rotateX: rotationX,
                rotateY: rotationY
            });
            if (this.shadow) this.shadow.css({
                transform:'translate3d(80px,80px,-400px) rotateY('+(-rotationY)+'deg) rotateX('+(-rotationX)+'deg) scale(1.5,1.5)'
            });
            if (this.reflet) this.reflet.transition({
                backgroundPosition: this.limitedValue(rotationY, -180, 180) * -5 + "px 0px"
            }, 1200);
            if (this.refletBack) this.refletBack.transition({
                backgroundPosition: (this.limitedValue(rotationY, 0, 360) - 180) * 5 + "px 0px"
            }, 1200);
        },
        
        refresh: function() {
            this.rotate3d(this.settings.rotationX, this.settings.rotationY);
        },
        
        update: function () {
            if (!this.settings.moveMouseEnabled || !this.settings.is3D) return;
            if (
                parseInt(this.currentRotationY * 10) != parseInt(this.newRotationY * 10)
             || parseInt(this.currentRotationX * 10) != parseInt(this.newRotationX * 10)) {
                this.currentRotationX += (this.newRotationX - this.currentRotationX) * 0.1;
                this.currentRotationY += (this.newRotationY - this.currentRotationY) * 0.1;
                this.rotate3d(this.currentRotationX, this.currentRotationY);
            }
            if (!this.paused) window.requestAnimationFrame(this.update.bind(this));
        },
        
        presets: function(view) { // Predefined angles ?
            if (view && (view in $.fn.rotator3d.views)){
                this.settings.moveMouseEnabled = false;
                this.rotate3d($.fn.rotator3d.views[view].x, $.fn.rotator3d.views[view].y);
            }
            else {
                this.settings.moveMouseEnabled = true;
                this.refresh();
                this.update();
            }
        },
        
        toggle3d: function () {
            if (this.settings.is3D) {
                this.settings.is3D = false;
                this.settings.moveMouseEnabled = false;
                this.element.css({rotateX:0, rotateY:0});
                if (this.shadow) this.shadow.hide();
            }
            else {
                this.settings.is3D = true;
                this.settings.moveMouseEnabled = true;
                if (this.shadow) this.shadow.show();
                this.update();
            }
        }
        
    };

   /* ROTATOR3D PLUGIN DEFINITION
    * =========================== */

    var old = $.fn.rotator3d;
    
    // Create jQuery plugin
    // $('"monElement').rotator3d();

    $.fn.rotator3d = function (options, args) {
        return this.each(function() { // Iterate collections
            var $this = $(this),
                data  = $this.data('rotator3d');
            if (!data) $this.data('rotator3d', (data = new rotator3d($this, options)));
            if (typeof options == 'string') {
                if (args) data[options](args); // Add arguments for some methods
                else      data[options]();
            }
        });
    };

    $.fn.rotator3d.Constructor = rotator3d;
    
    // Plugin default values
    $.fn.rotator3d.defaults = { 
        shadow:           null,   // if element given : translate to Z and animate it like a shadow
        reflet:           null,   // if element given : first plan animate a texture inside
        refletBack:       null,   // if element given : last plan animate a texture inside
        is3D:             true,   // Can be toggled via $rotator.rotator3d('toggle3d');
        moveMouseEnabled: true,
        rotationX:        0,      // Starting and default rotationX value
        rotationY:        0       // Starting and default rotationY value
    };
    
    // Some Presets values
    // Ex. : $e.rotator3d('presets', 'squareRoot');
    $.fn.rotator3d.views = { // Perspective if from : #content { -webkit-transform-origin: 0px 0px; }
        front:       {x: 0, y: 0},
        back:        {x: 0, y: 180},
        appleFront:  {x: 0, y: -30}, 
        appleBack:   {x: 0, y: -140},
        frontFloor:  {x: 0, y: 90},
        backFloor:   {x: 0, y: -90},
        sideRight:   {x: -90, y: 0},
        sideLeft:    {x: 90, y: 0},
        squareRoot:  {x: 45, y: 45}
    };
    

   /* ROTATOR3D NO CONFLICT
    * ===================== */

    $.fn.rotator3d.noConflict = function () {
        $.fn.rotator3d = old;
        return this;
    };

   /* ROTATOR3D DATA-API
    * ================== */

    $(window).on('load', function () {
        $('[data-rotator3d="true"]').each(function () {
            var $this = $(this);
            $this.rotator3d($this.data());
        })
    });

}(window.jQuery, window);