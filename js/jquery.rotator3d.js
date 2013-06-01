/* =============================================================
    // Mutli-screen flat 3D analogue clock (V2.6) with jQuery & CSS3 - No image, no webGL
    // By molokoloco@gmail.com 05/2013
    
    // Demo : http://molokoloco.github.io/flatClock3d/
    
    // Infos : http://www.b2bweb.fr/coding-project/mutli-screen-flat-3d-analogue-clock-with-jquery-and-css3-v2-3/
    // GitHub sources : https://github.com/molokoloco/flatClock3d
    // jsFiddle 2D : http://jsfiddle.net/molokoloco/V2rFN/
    // jsFiddle + 3D : http://jsfiddle.net/molokoloco/x6yc3/
   =============================================================
    // Usage example...

    var $cssBox3d = $('#rotator').rotator3d({
        reflet: $('#reflet'),
        refletBack: $('#refletBack'),
        rotationX: 6,
        rotationY: -18
    });
    
    $cssBox3d.rotator3d('toggle3d');

* ============================================================== */


!function ($) {

    "use strict"; // jshint ;_;

   /* ROTATOR 3D 
    * Credits (before refactoring) : http://www.laplace2be.com/projects/phone/
    * ========================== */

    var rotator3d = function (element, options) {
        
        this.settings = $.extend(true, {}, $.fn.rotator3d.defaults, typeof options == 'object' && options || {});
    
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
                if (!that.settings.moveMouseEnabled || !that.settings.is3D) return;
                var x = event.beta, // z = event.alpha,
                    y = event.gamma;
                that.newRotationY = (window.isMozMobile ? y : -y);
                that.newRotationX = (window.isMozMobile ? -x : x); // $('#shadow').text('x:'+x+'/y:'+y);
           };
           //if ('deviceorientation' in window) // FF mobile ?? bug ?
           window.addEventListener('deviceorientation', orient, false);
           //else if ('DeviceOrientationEvent' in window) window.addEventListener('DeviceOrientationEvent', orient, false);
        }

        var mouseIsMove = function(event) { // Cross browser mousemouve/pointer/etc.. http://handjs.codeplex.com/
                if (!that.settings.moveMouseEnabled || !that.settings.is3D) return;
                that.newRotationY = -(event.pageX - $(window).width() * 0.5) * 0.15;
                that.newRotationX = -(event.pageY - $(window).height() * 0.5) * .5;
            },
            mouseEnter = function(event) {
                if (!that.settings.is3D) return;
                that.settings.moveMouseEnabled = true;
				that.update();
                document.addEventListener('pointermove', mouseIsMove);
            },
            mouseLeave = function(event) {
                if (!that.settings.is3D) return;
                document.removeEventListener('pointermove', mouseIsMove, false);
                that.settings.moveMouseEnabled = false;
                that.refresh();
            };

        $(document)
            .mouseenter(mouseEnter)
            .mouseleave(mouseLeave)
            .trigger('mouseenter');

        this.update();
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
        
        update: function () {
            if (!this.settings.moveMouseEnabled || !this.settings.is3D) return;
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
            
            requestAnimationFrame(this.update.bind(this));
        },
        
        toggle3d:  function () {
            if (this.settings.is3D) {
                this.settings.is3D = false;
                this.settings.moveMouseEnabled = false;
                this.element.css({rotateX:0, rotateY:0});
            }
            else {
                this.settings.is3D = true;
                this.settings.moveMouseEnabled = true;
                this.update();
            }
        },
        
        refresh: function() {
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
        }
        
    };

   /* ROTATOR3D PLUGIN DEFINITION
    * =========================== */

    var old = $.fn.rotator3d;

    $.fn.rotator3d = function (options) {
        return this.each(function() { // Iterate collections
            var $this          = $(this),
                data           = $this.data('rotator3d');
            if (!data) $this.data('rotator3d', (data = new rotator3d($this, options)));
            if (typeof options == 'string') data[options]();
        });
    };

    $.fn.rotator3d.Constructor = rotator3d;

    $.fn.rotator3d.defaults = { // Default values
        reflet: null,
        refletBack: null,
        is3D: true,
        moveMouseEnabled: true,
        rotationX: 0,
        rotationY: 0,
        views: 0
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

}(window.jQuery);