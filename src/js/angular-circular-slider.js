/*!The MIT License (MIT)

Copyright (c) 2015 Prince John Wesley (princejohnwesley@gmail.com)
**/

(function(window, angular, undefined) {

  //utility functions
  function toInteger(o) {
    return (o | 0) === o;
  }

  function truthy() {
    return true;
  }

  function and(left, right) {
    return function(o) {
      return left(o) && right(o);
    };
  }

  // elem is jqLite
  function $$(elem) {
    // only one element
    var dom = elem[0];
    var computedStyle = window.getComputedStyle(dom, null);

    function getCss(prop) {
      return function() {
        return computedStyle[prop];
      };
    }

    function props(p) {
      return dom[p];
    }

    function getProps(prop) {
      return function() {
        return props(prop);
      };
    }

    function parseToFloat(value) {
      return parseFloat(value) || 0.0;
    }

    function addFloats(left, right) {
      return function() {
        return parseToFloat(left()) + parseToFloat(right());
      }
    }

    function applyFloatFn(fn) {
      return function(param) {
        return parseToFloat(fn(param));
      };
    }

    function offsetParent() {
      return angular.element(dom.offsetParent);
    }

    function offset() {
      var box = dom.getBoundingClientRect();
      var docElem = dom.ownerDocument.documentElement;

      return {
        top: box.top + docElem.scrollTop - docElem.clientTop,
        left: box.left + docElem.scrollLeft - docElem.clientLeft
      };
    }

    function position() {
      var p = $$(offsetParent());
      var po = p.offset();
      var box = offset();

      po.top += parseToFloat(p.css('borderTopWidth'));
      po.left += parseToFloat(p.css('borderLeftWidth'));

      return {
        top: box.top - po.top - parseToFloat(elem.css('marginTop')),
        left: box.left - po.left - parseToFloat(elem.css('marginLeft')),
      };
    }

    return {
      css: elem.css,
      prop: props,
      width: applyFloatFn(getCss('width')),
      height: applyFloatFn(getCss('height')),
      // outer area + margin
      outerWidth: addFloats(addFloats(getProps('offsetWidth'), getCss('marginLeft')),
        getCss('marginRight')),
      outerHeight: addFloats(addFloats(getProps('offsetHeight'), getCss('marginTop')),
        getCss('marginBottom')),
      innerWidth: addFloats(addFloats(getCss('width'), getCss('paddingLeft')),
        getCss('paddingRight')),
      innerHeight: addFloats(addFloats(getCss('height'), getCss('paddingTop')),
        getCss('paddingBottom')),
      offset: offset,
      offsetParent: offsetParent,
      position: position,
    };
  }

  var cs = {};

  var props = {

    defaults: {
      min: 0,
      max: 359,
      value: 0,
      radius: 75,
      innerCircleRatio: 0.5,
      borderWidth: 1,
      indicatorBallRatio: 0.2,
      handleDistRatio: 1.0,
      clockwise: true,
      shape: "Circle",
      touch: true,
      animate: true,
      animateDuration: 360,
      selectable: false,
      disabled: false,
      onSlide: angular.noop,
      onSlideEnd: angular.noop,
    },

    template: '\
      <div class="acs-panel">\
        <div class="acs">\
          <div class="acs-value" ng-transclude>\
          </div>\
        </div>\
        <div class="acs-indicator">\
        </div>\
      </div>\
    ',
  };

  var shapes = {
    "Circle": {
      drawShape: function(acsComponents, radius) {
        var d = radius * 2;
        var rpx = d + "px";
        var acs = acsComponents.acs;
        var acsValue = acsComponents.acsValue;
        var acsPanel = acsComponents.acsPanel;
        var scope = acsComponents.scope;
        var w = scope.borderWidth;

        acs.css({
          'width': rpx,
          'height': rpx,
          'border-radius': rpx,
          'border-width': w + 'px',
        });

        var pd = d + w;

        acsPanel.css({
          'border-width': w + 'px',
          'border-radius': pd + 'px',
        });

        var $$acs = $$(acs);
        var $$acsValue = $$(acsValue);
        var iRadius = scope.innerCircleRatio * radius;

        acsValue.css({
          'width': (iRadius * 2) + "px",
          'height': (iRadius * 2) + "px",
          'font-size': iRadius / 2 + "px",
        });

        var corner = radius - iRadius;
        acsValue.css({
          'top': (corner - $$acs.prop('clientTop') - $$acsValue.prop('clientTop')) + "px",
          'left': (corner - $$acs.prop('clientLeft') - $$acsValue.prop('clientLeft')) +
            "px",
        });
      },
      getCenter: function(acsPosition, acsRadius) {
        return {
          x: acsPosition.left + acsRadius,
          y: acsPosition.top + acsRadius,
          r: acsRadius
        };
      },
      deg2Val: function(deg) {
        var scope = cs.components.scope;
        var range = scope.max - scope.min + 1;
        if (deg < 0 || deg > 359)
          throw "Invalid angle " + deg;

        deg = (deg + 90) % 360;
        return Math.round(deg * (range / 360.0)) + scope.min;
      },
      val2Deg: function(value) {
        var scope = cs.components.scope;
        var range = scope.max - scope.min + 1;
        if (value < scope.min || value > scope.max)
          throw "Invalid range " + value;

        var nth = value - scope.min;
        return (Math.round(nth * (360.0 / range)) - 90) % 360;
      },
    },
    "Half Circle": {
      drawShape: function(acsComponents, radius) {
        var d = radius * 2;
        var acs = acsComponents.acs;
        var acsValue = acsComponents.acsValue;
        var acsPanel = acsComponents.acsPanel;
        var scope = acsComponents.scope;
        var w = scope.borderWidth;

        acs.css({
          'width': d + "px",
          'height': radius + "px",
          'border-radius': d + "px " + d + "px 0 0",
          'border-bottom': 'none',
          'border-width': w + 'px',
        });

        var pd = d + w;

        acsPanel.css({
          'border-width': w + 'px',
          'border-radius': pd + "px " + pd + "px 0 0",
          'border-bottom': 'none'
        });

        var $$acs = $$(acs);
        var $$acsValue = $$(acsValue);
        var iRadius = scope.innerCircleRatio * radius;

        acsValue.css({
          'width': (iRadius * 2) + "px",
          'height': (iRadius * 2) + "px",
          'font-size': iRadius / 2 + "px",
        });

        var corner = radius - iRadius;
        acsValue.css({
          'top': (corner - $$acs.prop('clientTop') - $$acsValue.prop('clientTop')) + "px",
          'left': (corner - $$acs.prop('clientLeft') - $$acsValue.prop('clientLeft')) +
            "px",
        });
      },
      getCenter: function(acsPosition, acsRadius) {
        return {
          x: acsPosition.left + acsRadius,
          y: acsPosition.top + acsRadius,
          r: acsRadius
        };
      },
      deg2Val: function(deg) {
        var scope = cs.components.scope;
        var range = scope.max - scope.min + 1;
        if (deg < 0 || deg > 359)
          throw "Invalid angle " + deg;

        deg = (deg + 180) % 360;
        return Math.round(deg * (range / 180.0)) + scope.min;
      },
      val2Deg: function(value) {
        var scope = cs.components.scope;
        var range = scope.max - scope.min + 1;
        if (value < scope.min || value > scope.max)
          throw "Invalid range " + value;

        var nth = value - scope.min;

        return (Math.round(nth * (180.0 / range)) - 180) % 360;
      },
    },
    "Half Circle Left": {
      drawShape: function(acsComponents, radius) {
        var d = radius * 2;
        var acs = acsComponents.acs;
        var acsValue = acsComponents.acsValue;
        var acsPanel = acsComponents.acsPanel;
        var scope = acsComponents.scope;
        var w = scope.borderWidth;

        acs.css({
          'height': d + "px",
          'width': radius + "px",
          'border-radius': d + "px 0 0 " + d + "px",
          'border-right': 'none',
          'border-width': w + 'px',
        });

        var pd = d + w;

        acsPanel.css({
          'border-width': w + 'px',
          'border-radius': pd + "px 0 0" + pd + "px",
          'border-right': 'none'
        });

        var $$acs = $$(acs);
        var $$acsValue = $$(acsValue);
        var iRadius = scope.innerCircleRatio * radius;

        acsValue.css({
          'width': (iRadius * 2) + "px",
          'height': (iRadius * 2) + "px",
          'font-size': iRadius / 2 + "px",
        });

        var corner = radius - iRadius;
        acsValue.css({
          'top': (corner - $$acs.prop('clientTop') - $$acsValue.prop('clientTop')) + "px",
          'left': (corner - $$acs.prop('clientLeft') - $$acsValue.prop('clientLeft')) +
            "px",
        });
      },
      getCenter: function(acsPosition, acsRadius) {
        return {
          x: acsPosition.left + acsRadius * 2,
          y: acsPosition.top + acsRadius * 2,
          r: acsRadius * 2
        };
      },
      deg2Val: function(deg) {
        var scope = cs.components.scope;
        var range = scope.max - scope.min + 1;
        if (deg < 0 || deg > 359)
          throw "Invalid angle " + deg;

        deg = (deg - 90) % 360;
        return Math.round(deg * (range / 180.0)) + scope.min;
      },
      val2Deg: function(value) {
        var scope = cs.components.scope;
        var range = scope.max - scope.min + 1;
        if (value < scope.min || value > scope.max)
          throw "Invalid range " + value;

        var nth = value - scope.min;

        return (Math.round(nth * (180.0 / range)) + 90) % 360;
      },
    },

    "Half Circle Right": {
      drawShape: function(acsComponents, radius) {
        var d = radius * 2;
        var acs = acsComponents.acs;
        var acsValue = acsComponents.acsValue;
        var acsPanel = acsComponents.acsPanel;
        var scope = acsComponents.scope;
        var w = scope.borderWidth;

        acs.css({
          'height': d + "px",
          'width': radius + "px",
          'border-radius': "0 " + d + "px " + d + "px 0",
          'border-left': 'none',
          'border-width': w + 'px',
        });

        var pd = d + w;

        acsPanel.css({
          'border-width': w + 'px',
          'border-radius': "0 " + pd + "px" + pd + "px 0",
          'border-left': 'none'
        });

        var $$acs = $$(acs);
        var $$acsValue = $$(acsValue);
        var iRadius = scope.innerCircleRatio * radius;

        acsValue.css({
          'width': (iRadius * 2) + "px",
          'height': (iRadius * 2) + "px",
          'font-size': iRadius / 2 + "px",
        });

        var corner = radius - iRadius;
        acsValue.css({
          'top': (corner - $$acs.prop('clientTop') - $$acsValue.prop('clientTop')) + "px",
          'right': (corner - $$acs.prop('clientLeft') - $$acsValue.prop('clientLeft')) +
            "px",
        });
      },
      getCenter: function(acsPosition, acsRadius) {
        return {
          x: acsPosition.left,
          y: acsPosition.top + acsRadius * 2,
          r: acsRadius * 2
        };
      },
      deg2Val: function(deg) {
        var scope = cs.components.scope;
        var range = scope.max - scope.min + 1;
        if (deg < 0 || deg > 359)
          throw "Invalid angle " + deg;

        deg = (deg + 90) % 360;
        return Math.round(deg * (range / 180.0)) + scope.min;
      },
      val2Deg: function(value) {
        var scope = cs.components.scope;
        var range = scope.max - scope.min + 1;
        if (value < scope.min || value > scope.max)
          throw "Invalid range " + value;

        var nth = value - scope.min;

        return (Math.round(nth * (180.0 / range)) - 90) % 360;
      },
    },
    "Half Circle Bottom": {
      drawShape: function(acsComponents, radius) {
        var d = radius * 2;
        var acs = acsComponents.acs;
        var acsValue = acsComponents.acsValue;
        var acsPanel = acsComponents.acsPanel;
        var scope = acsComponents.scope;
        var w = scope.borderWidth;

        acs.css({
          'width': d + "px",
          'height': radius + "px",
          'border-radius': "0 0 " + d + "px " + d + "px",
          'border-top': 'none',
          'border-width': w + 'px',
        });

        var pd = d + w;

        acsPanel.css({
          'border-width': w + 'px',
          'border-radius': "0 0 " + pd + "px " + pd + "px",
          'border-top': 'none'
        });

        var $$acs = $$(acs);
        var $$acsValue = $$(acsValue);
        var iRadius = scope.innerCircleRatio * radius;

        acsValue.css({
          'width': (iRadius * 2) + "px",
          'height': (iRadius * 2) + "px",
          'font-size': iRadius / 2 + "px",
        });

        var corner = radius - iRadius;
        acsValue.css({
          'bottom': (corner - $$acs.prop('clientTop') - $$acsValue.prop('clientTop')) +
            "px",
          'left': (corner - $$acs.prop('clientLeft') - $$acsValue.prop('clientLeft')) +
            "px",
        });
      },
      getCenter: function(acsPosition, acsRadius) {
        return {
          x: acsPosition.left + acsRadius,
          y: acsPosition.top,
          r: acsRadius
        };
      },
      deg2Val: function(deg) {
        var scope = cs.components.scope;
        var range = scope.max - scope.min + 1;
        if (deg < 0 || deg > 359)
          throw "Invalid angle " + deg;

        return Math.round(deg * (range / 180.0)) + scope.min;
      },
      val2Deg: function(value) {
        var scope = cs.components.scope;
        var range = scope.max - scope.min + 1;
        if (value < scope.min || value > scope.max)
          throw "Invalid range " + value;

        var nth = value - scope.min;

        return Math.round(nth * (180.0 / range));
      },
    }
  };

  var eventHandlers = (function() {

    var mouseDown = false;
    var onAnimate = false;
    var lastTouchType = '';

    var touchHandler = function(e) {
      var touches = e.changedTouches;

      // Ignore multi-touch
      if (touches.length > 1) return;

      var touch = touches[0];
      var target = angular.element(touch.target);

      if (!target.hasClass('acs')) return;

      var $$target = $$(target);
      var offset = $$target.offset();
      var width = $$target.width();
      var height = $$target.height();
      var clientX = touch.clientX;
      var clientY = touch.clientY;

      if (clientX < offset.left || clientX > width + offset.left ||
        clientY < offset.top || clientY > height + offset.top)
        return;

      var events = ["touchstart", "touchmove", "touchend", "touchcancel"];
      var mouseEvents = ["mousedown", "mousemove", "mouseup", "mouseleave"];
      var ev = events.indexOf(e.type);

      if (ev === -1) return;

      var type = mouseEvents[ev];
      if (e.type === events[2] && lastTouchType === events[0]) {
        type = "click";
      }

      var simulatedEvent = document.createEvent("MouseEvent");
      simulatedEvent.initMouseEvent(type, true, true, window, 1,
        touch.screenX, touch.screenY,
        touch.clientX, touch.clientY, false,
        false, false, false, 0, null);
      touch.target.dispatchEvent(simulatedEvent);
      e.preventDefault();
      lastTouchType = e.type;
    };

    var translate = function(e) {
      var cursor = {
        x: e.offsetX || e.layerX,
        y: e.offsetY || e.layerY
      };

      var dx = cursor.x - cs.acsCenter.x;
      var dy = cursor.y - cs.acsCenter.y;

      var rad = Math.atan2(dy, dx);
      var deg = rad * 180.0 / Math.PI;
      var d360 = (parseInt(deg < 0 ? 360.0 + deg : deg)) % 360;

      // change coordinate
      var scope = cs.components.scope;
      var offset = scope.borderWidth + cs.acsBallRadius;

      var x = cs.acsCenter.x + (cs.acsCenter.r * scope.handleDistRatio * Math.cos(rad)) -
        offset;
      var y = cs.acsCenter.y + (cs.acsCenter.r * scope.handleDistRatio * Math.sin(rad)) -
        offset;

      var sd360 = (shapes[scope.shape].val2Deg(scope.value) + 360) % 360;

      if (sd360 === d360) return;

      var distance = Math.min((d360 + 360 - sd360) % 360, (sd360 + 360 - d360) % 360);
      if (!distance) distance = 180;

      var clockwise = ((d360 + 360 - sd360) % 360) === distance;
      var r = scope.animateDuration / distance;
      var delay = 4;
      var unitDeg = 1;

      if (r >= 4) {
        delay = parseInt(r);
      } else if (r >= 1) {
        unitDeg = parseInt(r) * 4;
      } else {
        unitDeg = (4 / r);
      }

      //linear animation
      // TODO: add easing effect
      var next = sd360;
      var count = parseInt(distance / unitDeg);

      onAnimate = true;
      var animate = function() {
        next = next + (clockwise ? unitDeg : -unitDeg);
        next = (next + 360) % 360;
        if (--count <= 0) {
          clearInterval(timer);
          onAnimate = false;
          next = d360;
        }
        cs.funs.setValue(shapes[scope.shape].deg2Val(next));
        scope.$apply();
        if (!onAnimate) onSlideEnd();
      };
      var timer = window.setInterval(animate, delay);
    };

    function onSlideEnd() {
      var scope = cs.components.scope;
      if (typeof scope.onSlideEnd === 'function')
        scope.onSlideEnd(scope.value);
    }

    var mousemoveHanlder = function(e) {
      e.stopPropagation();

      if (!mouseDown || onAnimate) return;

      var cursor = {
        x: e.offsetX || e.layerX,
        y: e.offsetY || e.layerY
      };

      var dx = cursor.x - cs.acsCenter.x;
      var dy = cursor.y - cs.acsCenter.y;

      var rad = Math.atan2(dy, dx);
      var deg = rad * 180.0 / Math.PI;
      var d360 = (parseInt(deg < 0 ? 360.0 + deg : deg)) % 360;
      var scope = cs.components.scope;
      var offset = scope.borderWidth + cs.acsBallRadius;

      var x = cs.acsCenter.x + (cs.acsCenter.r * scope.handleDistRatio * Math.cos(rad)) -
        offset;
      var y = cs.acsCenter.y + (cs.acsCenter.r * scope.handleDistRatio * Math.sin(rad)) -
        offset;

      cs.components.acsIndicator.css('top', y + "px");
      cs.components.acsIndicator.css('left', x + "px");

      var d2v = shapes[scope.shape].deg2Val(d360);
      var val = scope.clockwise ? d2v : (scope.max - d2v);

      if (val < scope.min) val = scope.min;
      else if (val > scope.max) val = scope.max;

      scope.value = scope.$$value = val;
      scope.onSlide(val);
      scope.$apply();
    };

    var mousedownHandler = function(e) {
      if(cs.components.scope.disabled)
        return;
      mouseDown = true;
      e.stopPropagation();
    };

    var mouseupHandler = function(e) {
      if(cs.components.scope.disabled)
        return;
      mouseDown = false;
      e.stopPropagation();
    };

    var clickHandler = function(e) {
      if(cs.components.scope.disabled)
        return;
      e.stopPropagation();
      var cursor = {
        x: e.offsetX || e.layerX,
        y: e.offsetY || e.layerY
      };

      var dx = cursor.x - cs.acsCenter.x;
      var dy = cursor.y - cs.acsCenter.y;
      var scope = cs.components.scope;

      var distance = Math.sqrt(dx * dx + dy * dy);
      if (cs.acsRadius - distance <= cs.acsRadius * 0.1 || distance > cs.acsRadius) {
        if (scope.animate) {
          translate(e);
        } else {
          mouseDown = true;
          mousemoveHanlder(e);
          onSlideEnd();
        }
      } else onSlideEnd();

      mouseDown = false;
    };

    return {
      touch: touchHandler,
      mousemove: mousemoveHanlder,
      mousedown: mousedownHandler,
      mouseup: mouseupHandler,
      mouseleave: mouseupHandler,
      click: clickHandler
    };
  })();

  function circularSlider() {
    return {
      template: props.template,
      restrict: 'EA',
      transclude: true,
      controller: CircularSliderController,
      controllerAs: 'slider',
      scope: {
        min: '=?',
        max: '=?',
        value: '=?',
        radius: '=?',
        innerCircleRatio: '=?',
        indicatorBallRatio: '=?',
        handleDistRatio: '=?',
        borderWidth: '=?',
        clockwise: '=?',
        shape: '@?',
        touch: '=?',
        animate: '=?',
        animateDuration: '=?',
        selectable: '=?',
        disabled: '=?',
        onSlide: '&',
        onSlideEnd: '&',
      },
      link: link,
    };

    function link(scope, element, attr, controller, transcludeFn) {
      
      if(angular.isUndefined(scope.value))
        scope.value = scope.min;
      
      angular.forEach(scope.$$isolateBindings, function(binding, key) {
        if (angular.isUndefined(scope[key])) {
          scope[key] = props.defaults[key];
        }
      });

      // validations
      controller.validateBindings();

      // building components
      element.addClass('acs-slider');
      // draw & wiring events
      redrawShape();

      cs.funs = {
        'setValue': setValue,
      };

      // assign cs scope as transclude elements scope
      transcludeFn(scope, function (clone) {
        angular.element(element[0].getElementsByClassName('acs-value')).empty().append(clone);
      });

      // watchers
      scope.$watch('value', function(v) {
        if(cs.components.scope.disabled)
          return;
        if(v !== scope.$$value) {
          try {
            cs.funs.setValue(v);
          } catch(e) {
            scope.value = scope.$$value;
            throw e;
          }
        }
      });

      // private functions

      function redrawShape() {
        var component = getComponents();
        var radius = getRadius();
        shapes[scope.shape].drawShape(component, radius);
        drawIndicatorBall(component, radius);

        var $$acs = $$(component.acs);
        var $$acsIndicator = $$(component.acsIndicator);
        cs.acsPosition = $$acs.position();
        cs.acsRadius = $$acs.width() / 2;
        cs.acsBallRadius = $$acsIndicator.width() / 2;
        cs.acsCenter = shapes[scope.shape].getCenter(cs.acsPosition, cs.acsRadius);

        if (!scope.selectable) component.acsPanel.addClass('noselect');
        else component.acsPanel.removeClass('noselect');

        if (scope.touch) touchable();

        angular.forEach(['mouseup', 'mousedown', 'mousemove', 'mouseleave', 'click'], function(type) {
          element.on(type, eventHandlers[type]);
        });

        setValue(scope.value || scope.min);
      }

      function touchable() {
        angular.forEach(["touchstart", "touchmove", "touchend", "touchcancel"], function(
          type) {
          element.on(type, eventHandlers.touch);
        });
      }

      function setValue(value) {
        controller.validateBinding('value');

        var val = scope.clockwise ? value : (scope.max - value);
        var d360 = shapes[scope.shape].val2Deg(val);
        var rad = d360 * Math.PI / 180;
        var components = getComponents();
        var offset = components.scope.borderWidth + cs.acsBallRadius;

        var x = cs.acsCenter.x + (cs.acsCenter.r * scope.handleDistRatio * Math.cos(rad)) -
          offset;
        var y = cs.acsCenter.y + (cs.acsCenter.r * scope.handleDistRatio * Math.sin(rad)) -
          offset;

        components.acsIndicator.css('top', y + "px");
        components.acsIndicator.css('left', x + "px");

        scope.value = scope.$$value = value;
        if (typeof scope.onSlide === 'function')
          scope.onSlide(value);
      }

      function drawIndicatorBall(component, radius) {
        component.acsIndicator.css({
          'width': (radius * scope.indicatorBallRatio) + "px",
          'height': (radius * scope.indicatorBallRatio) + "px",
        });
      };

      function getComponents() {
        return cs.components ? cs.components : buildComponents();

        function buildComponents() {
          var acsPanel = element.children();
          var acsPanelChildren = acsPanel.children();
          var acs = angular.element(acsPanelChildren[0]);
          var acsIndicator = angular.element(acsPanelChildren[1]);
          var acsValue = acs.children();

          var acsComponents = {
            'acsPanel': acsPanel,
            'acs': acs,
            'acsIndicator': acsIndicator,
            'acsValue': acsValue,
            'scope': scope,
            'ctrl': controller,
          };
          return (cs.components = acsComponents);
        }
      }

      function getRadius() {
        return Math.abs(parseInt(scope.radius)) || props.defaults.radius;
      }
    }
  }

  function CircularSliderController($scope) {

    function typeErrorMsg(typeName) {
      return function(binding, value) {
        return [binding, '(', value, ') - Expected', typeName].join(' ');
      };
    }

    var shapes = ['Circle', 'Half Circle', 'Half Circle Left', 'Half Circle Right',
      'Half Circle Bottom'
    ];

    var transforms = {
      integer: {
        bindings: ['min', 'max', 'value', 'radius', 'animateDuration', 'borderWidth'],
        transform: parseInt
      },
      number: {
        bindings: ['innerCircleRatio', 'indicatorBallRatio', 'handleDistRatio'],
        transform: parseFloat,
      },
      'boolean': {
        bindings: ['touch', 'animate', 'selectable', 'clockwise', 'disabled'],
        transform: function(o) {
          return o === 'true' || o === true;
        },
      },
      'function': {
        bindings: ['onSlide', 'onSlideEnd'],
        transform: function(fun) {
          return fun ? fun : angular.noop;
        },
      }
    };

    var rules = {
      type: {
        integer: {
          bindings: ['min', 'max', 'value', 'radius', 'animateDuration', 'borderWidth'],
          test: toInteger,
          onError: typeErrorMsg('integer')
        },
        number: {
          bindings: ['innerCircleRatio', 'indicatorBallRatio', 'handleDistRatio'],
          test: isFinite,
          onError: typeErrorMsg('number')
        },
        'boolean': {
          bindings: ['touch', 'animate', 'selectable', 'clockwise', 'disabled'],
          test: truthy,
          onError: typeErrorMsg('boolean')
        },
        'function': {
          bindings: ['onSlide', 'onSlideEnd'],
          test: angular.isFunction,
          onError: typeErrorMsg('function')
        },
      },

      constraint: {
        range: {
          bindings: ['min', 'max'],
          test: function minMax() {
            return $scope.min <= $scope.max;
          },
          onError: function() {
            return ['Invalid slide range: [', $scope.min, ',', $scope.max, ']'].join('');
          },
        },
        value: {
          bindings: ['value'],
          test: function valueInRange(value) {
            return $scope.min <= value && value <= $scope.max;
          },
          onError: function() {
            return [$scope.value, '(value) out of range: [', $scope.min, ',', $scope.max,
              ']'
            ].join('');
          },
        },
        shape: {
          bindings: ['shape'],
          test: function shapeSupported() {
            return shapes.indexOf($scope.shape) !== -1;
          },
          onError: function() {
            return ['Unsupported shape: ', $scope.shape].join('');
          },
        },
        ratio: {
          bindings: ['innerCircleRatio', 'handleDistRatio', 'indicatorBallRatio'],
          test: function ratio(value) {
            return value >= 0.0 && value <= 1.0;
          },
          onError: function(b, value) {
            return [b + '(', value, ') is out of range: [0,1]'].join('');
          },
        },
      }
    };

    this.validateBindings = function(property) {
      var props = property ? property : this.props,
        p, binding;

      for (p in props) {
        // Apply binding transformer
        if (props[p].transform) {
          $scope[p] = props[p].transform($scope[p]);
        }
        // test binding types and constraints
        props[p].tests.forEach(function(t) {
          if (!t.test($scope[p])) {
            throw t.onError(p, $scope[p]);
          }
        });
      }
    };

    this.validateBinding = function(binding) {
      if (angular.isUndefined(binding)) return;
      var property = {};
      property[binding] = this.props[binding];
      this.validateBindings(property);
    };

    function init(controller) {

      // build constraints & transforms
      angular.forEach(rules, function(category, rule) {
        angular.forEach(category, function(action, name) {
          var bindings = action.bindings;
          bindings.map(function(binding) {
            controller[binding] = controller[binding] || {
              tests: []
            };
            controller[binding].tests.push({
              test: action.test,
              onError: action.onError
            });
          });
        });
      });

      angular.forEach(transforms, function(transformer) {
        angular.forEach(transformer.bindings, function(binding) {
          controller[binding].transform = transformer.transform;
        })
      });
    }

    init(this.props = {});
  }

  CircularSliderController.$inject = ['$scope'];

  angular.module('angular.circular-slider', [])
    .directive('circularSlider', circularSlider);

}(window, window.angular));
