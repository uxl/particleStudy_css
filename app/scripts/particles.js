(function() {
  'use strict';
  // this function is strict...
}());

var PARTICLES = (function($) {

  var settings = {},
    gui = null,
    particles = null,
    mouseX = null,
    mouseY = null,
    stats = null,
    resetMe = false,
    particle = null,
    mapWidth = null,
    mapHeight = null,
    particleList = [],
    chromeHeight = null,

    places = {
      'data': [
        ['ny', 1440, 1171],
        ['ny', 900, 1084],
        ['ny', 800, 1257],
        ['ny', 700, 1171],
        ['ny', 500, 1171],
        ['ny', 600, 1171],
        ['ny', 200, 1171]
      ]
    },
    init = function() {
      settings = {
        number: 100,
        perspective: 200,
        particleDepthMax: -1000,
        particleDepthMin: 200,
        particleDelay: 5,
        timeMin: 3.5,
        timeMax: 7,
        scaleMax: 2,
        scaleMin: 0.5,
        shape: 0,
        rotation: 2,
        //experiments
        spread: 50,
        aspect: null,
        fov: null,
        //when spacer * width is over screenwidth row
        // frustumHeight: 2.0 * settings.particleDepth * Math.tan(settings.fov * 0.5 * (Math.PI / 180)),
        // frustumWidth: frustumHeight * aspect,
        //console.log('height: ' + frustumHeight + ' width: ' + frustumWidth);
        screenWidth: null,
        screenHeight: null,
        chromeHeight: null,
        windowHalfX: null,
        windowHalfY: null,
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
        color1: '#A3B4E8',
        color2: '#2D66C1',
        color3: '#C4D4EC',
        color4: '#82DFD6',
        color5: '#9FE4E6',
        regen: false,
        text: false,
        plot: false
      };

      console.log('init ');

      //set screen height and width
      settings.screenWidth = window.screen.availWidth;
      settings.screenHeight = window.screen.availHeight;
      settings.chromeHeight = settings.screenHeight - (document.documentElement.clientHeight || settings.screenHeight);
      settings.aspect = settings.screenWidth / settings.screenHeight,

        resetCamera();

      mapWidth = $('#map').width();
      mapHeight = $('#map').height();

      settings.windowHalfX = settings.screenWidth / 2;
      settings.windowHalfY = settings.screenHeight / 2;

      //user events
      $('#map').click(function(e) { //Default mouse Position
        //console.log('click: ' + e.pageX + ' , ' + e.pageY);
        // debugger;
        settings.targetX = (e.pageX * 100 / mapWidth);
        settings.targetY = (e.pageY * 100 / mapHeight);
        console.log('click x: ' + settings.targetX);
        reset();
      });

      document.addEventListener('mousemove', onDocumentMouseMove, false);
      document.addEventListener('touchstart', onDocumentTouchStart, false);
      document.addEventListener('touchmove', onDocumentTouchMove, false);
      window.addEventListener('resize', onWindowResize, false);

      //add dat.gui//
      gui = new dat.GUI();
      gui.add(settings, 'number').min(0).max(500).step(1).onFinishChange(reset);
      gui.add(settings, 'particleDelay').min(0).max(30).step(0.5).onFinishChange(reset);
      gui.add(settings, 'particleDepthMax').min(-4000).max(400).step(10).onFinishChange(reset);
      gui.add(settings, 'particleDepthMin').min(-4000).max(5000).step(10).onFinishChange(reset);
      gui.add(settings, 'perspective').min(0).max(90000).step(500).onChange(function() {
        $('#particles').css('perspective', settings.perspective + 'px');
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
      // gui.add(settings, 'angle').listen();

      gui.add(settings, "targetX").min(0).max(100).listen();
      gui.add(settings, "targetY").min(0).max(100).listen();
      gui.add(settings, "targetActive").onChange(reset);

      gui.add(settings, "regen").onChange(reset);
      gui.add(settings, "text").onChange(reset);
      gui.add(settings, "plot");

      gui.add(settings, "reset");

      //add stats
      stats = new Stats();
      stats.domElement.style.position = 'absolute';
      stats.domElement.style.top = '0px';
      document.body.appendChild(stats.domElement);

      createParticles();
      animate();

    },
    random = function(min, max) {
      return Math.floor(Math.random() * (1 + max - min) + min);
    },
    resetCamera = function() {
      $('#particles').css("perspective-origin", settings.screenWidth / 2 + "px " + ((settings.screenHeight * 0.45) - settings.chromeHeight) + "px");
    },
    reset = function() {
      console.log('reset called')
      removeParticles();
      createParticles();
    },
    //percent of current map scale to pixel value
    getX = function(myX) {
      var pixelValue = (mapWidth * myX / 100);
      return pixelValue;
    },
    getY = function(myY) {
      var pixelValue = (mapHeight * myY / 100);
      return pixelValue;
    },
    createParticles = function() {
      particles = document.createElement('div');
      particles.id = 'particles';
      document.body.appendChild(particles);

      for (var i = 0; i < settings.number; i++) {
        if (settings.text) {
          $('#particles').append('<div id="part' + i + '" class="particle hex-wrapper hex"><div id="partcontent' + i + '" class="particle-color hexagon"><h1>Message Text</h1></div></div>');
        } else {
          $('#particles').append('<div id="part' + i + '" class="particle hex-wrapper hex"><div id="partcontent' + i + '" class="particle-color hexagon"></div></div>');
        }
        //add to objStore
        particleList.push(particle);
        //var $part = $('#' + particle.id);
        var part = document.getElementById('part' + i);
        //initParticle(i, delay);
        initParticle(part, i);
      }
    },
    initParticle = function(part, num) {

      var randomx = Math.round(settings.screenWidth - Math.random() * settings.screenWidth);
      var randomy = Math.round(settings.screenHeight - Math.random() * settings.screenHeight / 4);
      var randomz = Math.round(Math.random() * settings.particleDepth + 100);

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

      //$(part).css('transform', 'translate3d('+ randomx +', '+ randomy +', '+ randomz +')')
      // console.log(num);


      // var ygrid = 0;
      // var hexsize = 100;
      // var xgrid = num * (hexsize + spacer) % screenWidth;
      // var ygrid = 100;
      //console.log(xgrid);
      //var ygrid = Math.round(hexsize+spacer/screenWidth)/

      $(part).velocity({
        translateX: [
          function() {
            return -settings.screenWidth / 2 + Math.random() * settings.screenWidth
          },
          function() {
            return -settings.screenWidth / 2 + Math.random() * settings.screenWidth
          }
        ],
        translateY: [
          function() {
            return -settings.screenHeight / 2 + Math.random() * settings.screenHeight
          },
          function() {
            return -settings.screenHeight / 2 + Math.random() * settings.screenHeight
          }
        ],
        translateZ: [
          function() {
            return random(settings.particleDepthMax, settings.particleDepthMin)
          },
          settings.particleDepthMin
        ],
        opacity: [
          function() {
            return Math.random()
          },
          function() {
            return Math.random() + 0.1
          }
        ],
        rotateY: random(0, 360),
        rotateX: random(0, 360),
        rotateZ: random(0, 360)
      }, {
        duration: random(200, 4000)
      })
      .velocity("reverse", {
        easing: "easeOutQuad"
      });


      //$(part).css({
      //transform: translate3d(48px, 176px, 0px) rotateY(30deg) rotateX(10deg);
      //'transform': 'translate3d(0px,-50px,0px) rotateY(45deg)'
      // 'transform': "translate3d(" + xgrid + "px, " + ygrid + "px , " + -distance + "px)",
      //  'animation': 'spin infinite 8s'
      //  });
      //$(part).css('animation', 'spin infinite 8s');

      if (num == 0) {

      }
      //////////////////


      // debugger;
      //$(part > 'div').removeClass('particle-color');


      /*
      if (settings.targetActive) {
          myTargetX = getX(settings.targetX);
          myTargetY = getY(settings.targetY);

          TweenLite.to(part, 1, {
              rotationZ: 0,
              rotationX: 0,
              rotationY: 0,
              scaleX: 1,
              scaleY: 1,
              x: myTargetX,
              y: myTargetY,
              z: -1000,
              opacity: 1,
              transformOrigin: 'left 50% -5'
          });
      } else {
          // console.log('init position');
          TweenLite.to(part, 1, {
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
          //animate onto map
          //console.log(myTargetX + ' | ' + myTargetY)
          TweenLite.to(part, particleSpeed, {
              // ease: Back.easeIn.config(1.7),
              // x: (myTargetX - ((Math.random() * settings.spread) - settings.spread)),
              // y: (myTargetY - ((Math.random() * settings.spread) - settings.spread)),
              scaleX: 1,
              scaleY: 1,
              rotationX: 0,
              rotationY: 0,
              rotationZ: 0,
              z: -1000,
              delay: particleDelay,
              transformOrigin: 'left 50% -5',
              onComplete: recycleParticle,
              onCompleteParams: [part, num]
          });

      }  */
    },
    recycleParticle = function(part, num) {
      if (settings.regen) {
        TweenLite.to(part, 0.5, {
          ease: Back.easeIn.config(1.7),
          delay: 5,
          opacity: 0,
          scaleX: 0.5,
          scaleY: 0.5,
          onComplete: initParticle,
          onCompleteParams: [part, num]
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
      $('#particles').remove();

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
        mouseX = event.touches[0].pageX - settings.windowHalfX;
        mouseY = event.touches[0].pageY - settings.windowHalfY;
      }

    },

    onDocumentTouchMove = function(event) {

      if (event.touches.length == 1) {
        event.preventDefault();
        mouseX = event.touches[0].pageX - settings.windowHalfX;
        mouseY = event.touches[0].pageY - settings.windowHalfY;
      }
    },
    onWindowResize = function() {
      settings.screenWidth = window.innerWidth;
      settings.screenHeight = window.innerHeight;

      mapWidth = $('#map').width();
      mapHeight = $('#map').height();

      settings.windowHalfX = window.innerWidth / 2;
      settings.windowHalfY = window.innerHeight / 2;
    },
    animate = function() {
      //console.log('PARTICLES.animate');

      if (resetMe) {
        resetMe = false;
      } else {
        requestAnimationFrame(animate);

        render();
        stats.update();
      }
      if (settings.plot) {
        VERTICES.render('.hex', '#particles');
      }
    },
    render = function() {
      settings.angle = (settings.angle + 1) % 360;
      if (settings.cameramove) {

        settings.camx += (mouseX - settings.camx) * 0.05;
        settings.camy += (-mouseY - settings.camy) * 0.05;

        //solve percent of screen width
        settings.camPercentX = mouseX * 100 / settings.screenWidth;
        settings.camPercentY = mouseY * 100 / settings.screenHeight;
        //$('body').css('perspective-origin', settings.camx + ' ' + settings.camy);
      }
    };
  return {
    init: init
  };
}(jQuery));
