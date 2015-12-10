/* global console, PARTICLES */
//1359x800

'use strict';

var PARTICLES = (function($) {

    var settings = {},
        gui = null,
        particles = null,
        windowX = null,
        windowY = null,
        windowHalfX = null,
        windowHalfY = null,
        mouseX = null,
        mouseY = null,
        stats = null,
        resetMe = false,
        particle = null,
        particleList = [],
        places = {
            'data': [
                ['ny', -1220, 1171],
                ['ny', -1480, 1084],
                ['ny', -2000, 1257],
                ['ny', -1220, 1171],
                ['ny', -1220, 1171],
                ['ny', -1220, 1171],
                ['ny', -1220, 1171]
            ]
        },
        init = function() {
            settings = {
                number: 100,
                perspective: 500,
                startDepth: 20,
                particleDelay: 5,
                timeMin: 3.5,
                timeMax: 7,
                scaleMax: 2,
                scaleMin: .5,
                width: screen.width,
                height: screen.height,
                shape: 0,
                rotation: 2,
                spread: 100, 
                renderer: 0,
                cameramove: false,
                reset: reset,
                angle: 0,
                lightZ: 15300,
                targetActive: false,
                targetX: 0,
                targetY: 0,
                targetXpercentage: 0,
                targetYpercentage: 0,
                camx: 0,
                camy: 0,
                camPercentY: 0,
                camPercentX: 0,
                regen: true,
                color1:'#A3B4E8', 
                color2:'#2D66C1', 
                color3:'#C4D4EC', 
                color4:'#82DFD6', 
                color5:'#9FE4E6',
                text: false
            };

            windowX = window.innerWidth;
            windowY = window.innerHeight;

            windowHalfX = windowX / 2;
            windowHalfY = windowY / 2;

            //user events
            // $(document).click(function(e) { //Default mouse Position 
            //     console.log(e.pageX + ' , ' + e.pageY);
            // });

            document.addEventListener('mousemove', onDocumentMouseMove, false);
            document.addEventListener('touchstart', onDocumentTouchStart, false);
            document.addEventListener('touchmove', onDocumentTouchMove, false);
            window.addEventListener('resize', onWindowResize, false);

            //add dat.gui//
            gui = new dat.GUI();
            gui.add(settings, 'number').min(0).max(500).step(1).onFinishChange(reset);
            gui.add(settings, 'particleDelay').min(0).max(30).step(0.5).onFinishChange(reset);
            gui.add(settings, 'startDepth').min(0).max(400).step(10).onFinishChange(reset);
            gui.add(settings, 'perspective').min(0).max(90000).step(500).onChange(function() {
                $('body').css('perspective', settings.perspective + 'px');
                reset();
            });

            gui.addColor(settings, 'color1').onChange(reset);
            gui.addColor(settings, 'color2').onChange(reset);
            gui.addColor(settings, 'color3').onChange(reset);
            gui.addColor(settings, 'color4').onChange(reset);
            gui.addColor(settings, 'color5').onChange(reset);

            gui.add(settings, "scaleMax").min(0).max(10).step(0.25).onFinishChange(reset);
            gui.add(settings, "scaleMin").min(0).max(20).step(0.25).onFinishChange(reset);

            gui.add(settings, "timeMin").min(0).max(20).step(0.5).onFinishChange(reset);
            gui.add(settings, "timeMax").min(0).max(20).step(0.5).onFinishChange(reset);
            gui.add(settings, "spread").min(0).max(1000).step(1).onFinishChange(reset);
            gui.add(settings, "width");
            gui.add(settings, "height");

            gui.add(settings, "text").onChange(reset);
            // gui.add(settings, "cameramove");
            // gui.add(settings, 'camx').listen();
            // gui.add(settings, 'camy').listen();
            // gui.add(settings, "camPercentX").listen();
            // gui.add(settings, "camPercentY").listen();
            // gui.add(settings, "shape", {
            //     circle: 0,
            //     heart: 1,
            //     hexagon: 2
            // });
            // gui.add(settings, "rotation", 0, 10).onChange(reset);
            gui.add(settings, "targetActive").onChange(reset);
            gui.add(settings, "targetX").min(-2000).max(4000).step(1).onFinishChange(
                function() {
                    reset();
                }
            );
            gui.add(settings, "targetY").min(0).max(4000).step(1).onFinishChange(
                function() {
                    reset();
                }
            );

            gui.add(settings, 'angle').listen();

            gui.add(settings, "regen").onChange(reset);
            gui.add(settings, "reset");

            //add stats
            stats = new Stats();
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.top = '0px';
            document.body.appendChild(stats.domElement);

            createParticles();
            animate();

        },
        reset = function() {
            removeParticles();
            createParticles();
            //$('.particle_color').css('background-color', settings.color)
        },
        getColor = function() {
            //var colorObj = new THREE.Color( settings.color );
            var hex = colorObj.getHexString();
            var newcolor = '0x' + hex;
            return eval(newcolor);
        },
        createParticles = function() {
            particles = document.createElement('div');
            particles.id = 'particles';
            document.body.appendChild(particles);

            for (var i = 0; i < settings.number; i++) {
                if(settings.text){
                    $('#particles').append('<div id="part' + i + '" class="hex1 hexagon-wrapper"><div id="partcontent' + i + '" class="particle-color hexagon"><h1>Happy Holidays</h1></div></div>');
                }else{
                    $('#particles').append('<div id="part' + i + '" class="hex1 hexagon-wrapper"><div id="partcontent' + i + '" class="particle-color hexagon"></div></div>');
                }
                //add to objStore
                particleList.push(particle);
                //particle.orbit = Math.random*365;
                //var $part = $('#' + particle.id);
                var part = document.getElementById('part' + i);
                //initParticle(i, delay);
                initParticle(part, i);
            }
        },
        initParticle = function(part, num) {

            var randomx = Math.round(settings.width - Math.random() * settings.width);
            var randomy = Math.round(settings.height / 4 - Math.random() * settings.height / 4);
            var randomz = Math.round(Math.random() * settings.startDepth + 100);

            var randomZrotation = Math.round(Math.random() * 1) * 360;
            var randomXrotation = Math.round(Math.random() * 1) * 360;
            var randomYrotation = Math.round(Math.random() * 1) * 360;

            var randomScale = Math.random() * (settings.scaleMax - settings.scaleMin) + settings.scaleMin;

            var particleSpeed = Math.random() * (settings.timeMax - settings.timeMin) + settings.timeMin;
            var particleDelay = Math.random() * settings.particleDelay;

            var randomPlace = Math.floor(Math.random() * places.data.length);

            var randomColor = settings['color' + (Math.floor(Math.random() * 5) + 1)];

            //console.log(randomColor); //+ " | " + colors.data[randomColor]);

            var myTargetX = places.data[randomPlace][1];
            var myTargetY = places.data[randomPlace][2];



            var randomOpacity = (Math.round(Math.random() * 100) * 0.01);

            $('#partcontent' + num).css('background-color', randomColor);

            $(part > 'div').removeClass('particle-color');

            TweenLite.set(part, {
                rotationZ: randomZrotation,
                rotationX: randomXrotation,
                rotationY: randomYrotation,
                scaleX: randomScale,
                scaleY: randomScale,
                x: randomx,
                y: randomy,
                z: randomz,
                opacity: randomOpacity
            });
            if (settings.targetActive) {
                TweenLite.to(part, particleSpeed, {
                    rotationZ: 0,
                    rotationX: 0,
                    rotationY: 0,
                    scaleX: randomScale,
                    scaleY: randomScale,
                    x: settings.targetX,
                    y: settings.targetY,
                    z: -1000,
                    opacity: 1,
                    transformOrigin: 'left 50% -5'
                });
            } else {
                TweenLite.to(part, particleSpeed, {
                    ease: Back.easeIn.config(1.7),
                    x: (myTargetX - ((Math.random() * settings.spread) - settings.spread)),
                    y: (myTargetY - ((Math.random() * settings.spread) - settings.spread)),
                    scaleX: 1,
                    scaleY: 1,
                    rotationX: 0,
                    rotationY: 0,
                    rotationZ: 0,
                    z: -1000,
                    delay: particleDelay,
                    transformOrigin: 'left 50% -5'
                    // ,
                    // onComplete: regenerate,
                    // onCompleteParams: {
                    //     part
                    // }
                });
            }
        },
        removeParticles = function() {
            // console.log('PARTICLES.removeParticles called');
            var len = particleList.length;
            for (var i = 0; i < len; i++) {
                $('#part' + i).remove();
            }
            particleList = [];
        },
        onDocumentMouseMove = function(event) {
            //console.log('moving');
            //console.log('mouseX: ' + mouseX + ' mouseY: ' + mouseY)

            mouseX = event.clientX;
            mouseY = event.clientY;

        },

        onDocumentTouchStart = function(event) {

            if (event.touches.length == 1) {
                event.preventDefault();
                mouseX = event.touches[0].pageX - windowHalfX;
                mouseY = event.touches[0].pageY - windowHalfY;
            }

        },

        onDocumentTouchMove = function(event) {

            if (event.touches.length == 1) {
                event.preventDefault();
                mouseX = event.touches[0].pageX - windowHalfX;
                mouseY = event.touches[0].pageY - windowHalfY;
            }
        },
        onWindowResize = function() {
            windowX = window.innerWidth;
            windowY = window.innerHeight;

            windowHalfX = window.innerWidth / 2;
            windowHalfY = window.innerHeight / 2;
        },
        animate = function() {
            //console.log('PARTICLES.animate');

            if (resetMe == true) {
                resetMe = false;
            } else {
                requestAnimationFrame(animate);

                render();
                stats.update();
            }
        },
        render = function() {
            settings.angle = (settings.angle + 1) % 360;

            if (settings.cameramove) {

                settings.camx += (mouseX - settings.camx) * 0.05;
                settings.camy += (-mouseY - settings.camy) * 0.05;

                //solve percent of screen width
                settings.camPercentX = mouseX * 100 / windowX;
                settings.camPercentY = mouseY * 100 / windowY;
                //$('body').css('perspective-origin', settings.camx + ' ' + settings.camy);
            }
        };
    return {
        init: init
    };
}(jQuery));