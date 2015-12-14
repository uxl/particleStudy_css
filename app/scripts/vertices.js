/* global console, PARTICLES, dat */
//1359x800

(function () {
   'use strict';
   // this function is strict...
}());

var VERTICES = (function($) {

    // 1. Get the untransformed bounds of the transformed parent element in the document coordinate system.
    // 2. Get the untransformed bounds of the target element in the document coordinate system.
    // 3. Compute the target's untransformed bounds relative to the parent's untransformed bounds.
    //     a. Subtract the top/left offset of (1) from the bounds of (2).
    // 4. Get the css transform of the parent element.
    // 5. Get the transform-origin of the parent element (defaults to (50%, 50%)).
    // 6. Get the actual applied transform (-origin * css transform * origin)
    // 7. Multiply the four vertices from (3) by the computed transform from (6).
    // 8. Perform the homogeneous divide (divide x, y, z by the w component) to apply perspective.
    // 9. Transform the projected vertices back into the document coordinate system.
    // 10. Fun!

    // $(".target").on('click', function(){
    //     $(".vertex").remove();

    // Note: The 'parentOrigin' and 'rect' are computed relative to their offsetParent rather than in doc
    //       coordinates. You would need to change how these offsets are computed to make this work in a
    //       more complicated page. In particular, if txParent becomes the offsetParent of 'this', then the
    //       origin will be wrong.

    // (1) Get the untransformed bounds of the parent element. Here we only care about the relative offset
    //     of the parent element to its offsetParent rather than it's full bounding box. This is the origin
    //     that the target elements are relative to.
    var init = function(targetID, targetParentID) { //takes id as a string
            var txParent = document.getElementById(targetParentID);
            var txElem = document.getElementById(targetID);
            var parentOrigin = [txParent.offsetLeft, txParent.offsetTop, 0, 0];
            console.log('Parent Origin: ', parentOrigin);

            // (2) Get the untransformed bounding box of the target elements. This will be the box that is transformed.
            var rect = {
                left: txElem.offsetLeft,
                top: txElem.offsetTop,
                right: txElem.offsetLeft + txElem.offsetWidth,
                bottom: txElem.offsetTop + txElem.offsetHeight
            };

            // Create the vertices in the coordinate system of their offsetParent - in this case <body>.
            var vertices =
                [
                    [rect.left, rect.top, 0, 1],
                    [rect.right, rect.bottom, 0, 1],
                    [rect.right, rect.top, 0, 1],
                    [rect.left, rect.bottom, 0, 1]
                ];
            console.log('Original: ', vertices);

            // (3) Transform the vertices to be relative to transformed parent (the element with
            //     the CSS transform on it).
            var relVertices = [
                [],
                [],
                [],
                []
            ];
            for (var i = 0; i < 4; ++i) {
                relVertices[i][0] = vertices[i][0] - parentOrigin[0];
                relVertices[i][1] = vertices[i][1] - parentOrigin[1];
                relVertices[i][2] = vertices[i][2];
                relVertices[i][3] = vertices[i][3];
            }

            // (4) Get the CSS transform from the transformed parent
            var tx = getTransform(txParent);
            console.log('Transform: ', tx);

            // (5) Get the CSS transform origin from the transformed parent - default is '50% 50%'
            var txOrigin = getTransformOrigin(txParent);
            console.log('Transform Origin: ', txOrigin);

            // (6) Compute the full transform that is applied to the transformed parent (-origin * tx * origin)
            var fullTx = computeTransformMatrix(tx, txOrigin);
            console.log('Full Transform: ', fullTx);

            // (7) Transform the vertices from the target element's bounding box by the full transform
            var txVertices = [];
            for (var d = 0; d < 4; ++d) {
                txVertices[d] = transformVertex(fullTx, relVertices[d]);
            }

            console.log('Transformed: ', txVertices);

            // (8) Perform the homogeneous divide to apply perspective to the points (divide x,y,z by the w component).
            var projectedVertices = [];
            for (var j = 0; j < 4; ++j) {
                projectedVertices[j] = projectVertex(txVertices[j]);
            }

            console.log('Projected: ', projectedVertices);
            // (9) After the transformed vertices have been computed, transform them back into the coordinate
            // system of the offsetParent.
            var finalVertices = [
                [],
                [],
                [],
                []
            ];
            for (var k = 0; k < 4; ++k) {
                finalVertices[k][0] = projectedVertices[k][0] + parentOrigin[0];
                finalVertices[k][1] = projectedVertices[k][1] + parentOrigin[1];
                finalVertices[k][2] = projectedVertices[k][2];
                finalVertices[k][3] = projectedVertices[k][3];
            }

            // (10) And then add the vertex elements in the 'offsetParent' coordinate system (in this case again
            //      it is <body>).
            for (var r = 0; r < 4; ++r) {
                $("<div></div>").addClass("vertex")
                    .css('position', 'absolute')
                    .css('left', finalVertices[r][0])
                    .css('top', finalVertices[r][1])
                    .appendTo('#particles');
            }
        },
        printMatrix = function(mat) {
            var str = '';
            for (var i = 0; i < 4; ++i) {
                for (var j = 0; j < 4; ++j) {
                    str += (' ' + mat[i][j]);
                }

                str += '\r\n';
            }

            console.log(str);
        },

        getTransform = function(ele) {
            var st = window.getComputedStyle(ele, null);

            var tr = st.getPropertyValue("-webkit-transform") ||
                st.getPropertyValue("-moz-transform") ||
                st.getPropertyValue("-ms-transform") ||
                st.getPropertyValue("-o-transform") ||
                st.getPropertyValue("transform");

            var values = tr.split('(')[1],
                values = values.split(')')[0],
                values = values.split(',');

            var mat = [
                [1, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1]
            ];
            if (values.length === 16) {
                for (var i = 0; i < 4; ++i) {
                    for (var j = 0; j < 4; ++j) {
                        mat[j][i] = +values[i * 4 + j];
                    }
                }
            } else {
                for (var b = 0; b < 3; ++b) {
                    for (var t = 0; t < 2; ++t) {
                        mat[t][b] = +values[b * 2 + t];
                    }
                }
            }

            return mat;
        },

        getTransformOrigin = function(ele) {
            var st = window.getComputedStyle(ele, null);

            var tr = st.getPropertyValue("-webkit-transform-origin") ||
                st.getPropertyValue("-moz-transform-origin") ||
                st.getPropertyValue("-ms-transform-origin") ||
                st.getPropertyValue("-o-transform-origin") ||
                st.getPropertyValue("transform-origin");

            var values = tr.split(' ');

            var out = [0, 0, 0, 1];
            for (var i = 0; i < values.length; ++i) {
                out[i] = parseInt(values[i]);
            }

            return out;
        },

        createTranslateMatrix = function(x, y, z) {
            var out =
                [
                    [1, 0, 0, x],
                    [0, 1, 0, y],
                    [0, 0, 1, z],
                    [0, 0, 0, 1]
                ];

            return out;
        },

        multiply = function(pre, post) {
            var out = [
                [],
                [],
                [],
                []
            ];

            for (var i = 0; i < 4; ++i) {
                for (var j = 0; j < 4; ++j) {
                    var sum = 0;

                    for (var k = 0; k < 4; ++k) {
                        sum += (pre[k][i] * post[j][k]);
                    }

                    out[j][i] = sum;
                }
            }

            return out;
        },

        computeTransformMatrix = function(tx, origin) {
            var out;

            var preMul = createTranslateMatrix(-origin[0], -origin[1], -origin[2]);
            var postMul = createTranslateMatrix(origin[0], origin[1], origin[2]);

            var temp1 = multiply(preMul, tx);

            out = multiply(temp1, postMul);

            return out;
        },

        transformVertex = function(mat, vert) {            var out = [];

            for (var i = 0; i < 4; ++i) {
                var sum = 0;
                for (var j = 0; j < 4; ++j) {
                    sum += +mat[i][j] * vert[j];
                }

                out[i] = sum;
            }

            return out;
        },

        projectVertex = function(vert) {
            var out = [];

            for (var i = 0; i < 4; ++i) {
                out[i] = vert[i] / vert[3];
            }

            return out;
        };
    return {
        init: init
    };
}(jQuery));
