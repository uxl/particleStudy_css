/* global console, PARTICLES, dat */
//rev 2
(function () {
   'use strict';
   // this function is strict...
}());

var VERTICES = (function() {
  var faces = null,
      context = null,

  getFaces = function(content){
    // Select the faces

    faces = [].slice.call(document.querySelectorAll(content));
    return faces;
  },
  /* Loop
  ---------------------------------------------------------------- */
  render = function(content, ctx) { //expects class as string
    //console.log('ctx:' + ctx)
    context = document.querySelector(ctx);

    getFaces(content);

    faces.forEach(function(face, i) {
      // Extract the elements transform
      var vertexData = computeVertexData(face);

      // Draw the vertices
      renderVertex("a", face, vertexData.a);
      renderVertex("b", face, vertexData.b);
      renderVertex("c", face, vertexData.c);
      renderVertex("d", face, vertexData.d);

    });

  /* Renders a vertex to the DOM
  ---------------------------------------------------------------- */
},
 renderVertex = function(id, face, vertex) {
    var id = "_vertex_" + id,
      vertexElem = face[id],
      x = vertex.x.toFixed(2),
      y = vertex.y.toFixed(2),
      z = vertex.z.toFixed(2),
      s = 1 - vertex.z / 400; // scale to keep the text readable
    if (!vertexElem) {
      vertexElem = face[id] = document.createElement("div");
      vertexElem.className = "vertex";
      context.appendChild(vertexElem);
    }

    // show the vertex coordinates
    vertexElem.textContent = "x:" + x + " y:" + y + " z:" + z;

    // apply the tralsation to the vertex
    vertexElem.style.cssText =
      "-webkit-transform: translate3d(" + x + "px," + y + "px," + z + "px) scale(" + s + ");" +
      "-moz-transform: translate3d(" + x + "px," + y + "px," + z + "px) scale(" + s + ");" +
      "-ms-transform: translate3d(" + x + "px," + y + "px," + z + "px) scale(" + s + ");" +
      "transform: translate3d(" + x + "px," + y + "px," + z + "px) scale(" + s + ");";
  },

  /* Returns A, B, C and D vertices of an element
  ---------------------------------------------------------------- */

  computeVertexData = function(elem) {
      var w = elem.offsetWidth,
          h = elem.offsetHeight,
          v = {
              a: { x: -w / 2, y: -h / 2, z: 0 },
              b: { x:  w / 2, y: -h / 2, z: 0 },
              c: { x:  w / 2, y:  h / 2, z: 0 },
              d: { x: -w / 2, y:  h / 2, z: 0 }
          },
          transform;

      while (elem.nodeType === 1) {
          transform = getTransform(elem);
          v.a = addVectors(rotateVector(v.a, transform.rotate), transform.translate);
          v.b = addVectors(rotateVector(v.b, transform.rotate), transform.translate);
          v.c = addVectors(rotateVector(v.c, transform.rotate), transform.translate);
          v.d = addVectors(rotateVector(v.d, transform.rotate), transform.translate);
          elem = elem.parentNode;
      }
      return v;
  },


  /* Returns the rotation and translation components of an element
  ---------------------------------------------------------------- */

  getTransform = function(elem) {
      var computedStyle = getComputedStyle(elem, null),
          val = computedStyle.transform ||
              computedStyle.webkitTransform ||
              computedStyle.MozTransform ||
              computedStyle.msTransform,
          matrix = parseMatrix(val),
          rotateY = Math.asin(-matrix.m13),
          rotateX,
          rotateZ;

          rotateX = Math.atan2(matrix.m23, matrix.m33);
          rotateZ = Math.atan2(matrix.m12, matrix.m11);

      /*if (Math.cos(rotateY) !== 0) {
          rotateX = Math.atan2(matrix.m23, matrix.m33);
          rotateZ = Math.atan2(matrix.m12, matrix.m11);
      } else {
          rotateX = Math.atan2(-matrix.m31, matrix.m22);
          rotateZ = 0;
      }*/

      return {
          transformStyle: val,
          matrix: matrix,
          rotate: {
              x: rotateX,
              y: rotateY,
              z: rotateZ
          },
          translate: {
              x: matrix.m41,
              y: matrix.m42,
              z: matrix.m43
          }
      };
  },


  /* Parses a matrix string and returns a 4x4 matrix
  ---------------------------------------------------------------- */

  parseMatrix = function(matrixString) {
      var c = matrixString.split(/\s*[(),]\s*/).slice(1,-1),
          matrix;

      if (c.length === 6) {
          // 'matrix()' (3x2)
          matrix = {
              m11: +c[0], m21: +c[2], m31: 0, m41: +c[4],
              m12: +c[1], m22: +c[3], m32: 0, m42: +c[5],
              m13: 0,     m23: 0,     m33: 1, m43: 0,
              m14: 0,     m24: 0,     m34: 0, m44: 1
          };
      } else if (c.length === 16) {
          // matrix3d() (4x4)
          matrix = {
              m11: +c[0], m21: +c[4], m31: +c[8], m41: +c[12],
              m12: +c[1], m22: +c[5], m32: +c[9], m42: +c[13],
              m13: +c[2], m23: +c[6], m33: +c[10], m43: +c[14],
              m14: +c[3], m24: +c[7], m34: +c[11], m44: +c[15]
          };

      } else {
          // handle 'none' or invalid values.
          matrix = {
              m11: 1, m21: 0, m31: 0, m41: 0,
              m12: 0, m22: 1, m32: 0, m42: 0,
              m13: 0, m23: 0, m33: 1, m43: 0,
              m14: 0, m24: 0, m34: 0, m44: 1
          };
      }
      return matrix;
  },

  /* Adds vector v2 to vector v1
  ---------------------------------------------------------------- */

  addVectors = function(v1, v2) {
      return {
          x: v1.x + v2.x,
          y: v1.y + v2.y,
          z: v1.z + v2.z
      };
  },


  /* Rotates vector v1 around vector v2
  ---------------------------------------------------------------- */

  rotateVector = function(v1, v2) {
      var x1 = v1.x,
          y1 = v1.y,
          z1 = v1.z,
          angleX = v2.x / 2,
          angleY = v2.y / 2,
          angleZ = v2.z / 2,

          cr = Math.cos(angleX),
          cp = Math.cos(angleY),
          cy = Math.cos(angleZ),
          sr = Math.sin(angleX),
          sp = Math.sin(angleY),
          sy = Math.sin(angleZ),

          w = cr * cp * cy + -sr * sp * -sy,
          x = sr * cp * cy - -cr * sp * -sy,
          y = cr * sp * cy + sr * cp * sy,
          z = cr * cp * sy - -sr * sp * -cy,

          m0 = 1 - 2 * ( y * y + z * z ),
          m1 = 2 * (x * y + z * w),
          m2 = 2 * (x * z - y * w),

          m4 = 2 * ( x * y - z * w ),
          m5 = 1 - 2 * ( x * x + z * z ),
          m6 = 2 * (z * y + x * w ),

          m8 = 2 * ( x * z + y * w ),
          m9 = 2 * ( y * z - x * w ),
          m10 = 1 - 2 * ( x * x + y * y );

      return {
          x: x1 * m0 + y1 * m4 + z1 * m8,
          y: x1 * m1 + y1 * m5 + z1 * m9,
          z: x1 * m2 + y1 * m6 + z1 * m10
      };
  };
  return {
      render: render,
      computeVertexData: computeVertexData,
      getTransform: getTransform
  };
}());
