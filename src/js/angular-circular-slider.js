/*!The MIT License (MIT)

Copyright (c) 2015 Prince John Wesley (princejohnwesley@gmail.com)
**/

(function(window, angular, undefined) {

  //utility functions
  function toInteger(o) {
    return (o | 0) === o;
  }

  function toBoolean(o) {
    return (o && o === 'true');
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

    function getCss(prop) {
      return function(param) {
        if (param) elem.css(prop, param);
        return param ? param : elem.css(prop);
      };
    }

    function getStyle(prop) {
      return function() {
        return dom.style[prop];
      };
    }

    function getProps(prop) {
      return function() {
        return dom[prop];
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

    return {
      width: applyFloatFn(getCss('width')),
      height: applyFloatFn(getCss('height')),
      // outer area + margin
      outerWidth: addFloats(addFloats(getProps('offsetWidth'), getStyle('marginLeft')),
        getStyle('marginRight')),
      outerHeight: addFloats(addFloats(getProps('offsetHeight'), getStyle('marginTop')),
        getStyle('marginBottom')),
      innerWidth: addFloats(addFloats(getCss('width'), getStyle('paddingLeft')),
        getStyle('paddingRight')),
      innerHeight: addFloats(addFloats(getCss('height'), getStyle('paddingTop')),
        getStyle('paddingBottom')),
    };
  }


  var cs = {};

  var props = {

    defaults: {
      min: 0,
      max: 359,
      value: 0,
      radius: 75,
      innerCircleRatio: '0.5',
      clockwise: true,
      shape: "Circle",
      touch: true,
      animate: true,
      animateDuration: 360,
      selectable: false,
      onSlide: angular.noop,

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

        acs.css({
          'width': rpx,
          'height': rpx,
          'border-radius': rpx
        });

        var pd = d + (radius / 10);

        acsPanel.css({
          'border-width': (radius / 10) + 'px',
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

        var outerArea = ($$acs.outerWidth() - $$acs.innerWidth()) + ($$acsValue.outerWidth() - $$acsValue.innerWidth());
        var corner = radius - iRadius - outerArea * 2;
        acsValue.css({
          'top': corner + "px",
          'left': corner + "px",
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
        if (deg < 0 || deg > 359)
          throw "Invalid angle " + deg;

        deg = (deg + 90) % 360;
        return Math.round(deg * (range / 360.0)) + scope.min;
      },
      val2Deg: function(value) {
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


        acs.css({
          'width': d + "px",
          'height': radius + "px",
          'border-radius': d + "px " + d + "px 0 0",
          'border-bottom': 'none'
        });

        var pd = d + (radius / 10);

        acsPanel.css({
          'border-width': (radius / 10) + 'px',
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

        var outerArea = ($$acs.outerWidth() - $$acs.innerWidth()) + ($$acsValue.outerWidth() - $$acsValue.innerWidth());
        var corner = radius - iRadius - outerArea * 2;
        acsValue.css({
          'top': corner + "px",
          'left': corner + "px",
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
        if (deg < 0 || deg > 359)
          throw "Invalid angle " + deg;

        deg = (deg + 180) % 360;
        return Math.round(deg * (range / 180.0)) + scope.min;
      },
      val2Deg: function(value) {
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

        acs.css({
          'height': d + "px",
          'width': radius + "px",
          'border-radius': d + "px 0 0 " + d + "px",
          'border-right': 'none'
        });

        var pd = d + (radius / 10);

        acsPanel.css({
          'border-width': (radius / 10) + 'px',
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

        var outerArea = ($$acs.outerWidth() - $$acs.innerWidth()) + ($$acsValue.outerWidth() - $$acsValue.innerWidth());
        var corner = radius - iRadius - outerArea * 2;
        acsValue.css({
          'top': corner + "px",
          'left': corner + "px",
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
        if (deg < 0 || deg > 359)
          throw "Invalid angle " + deg;

        deg = (deg - 90) % 360;
        return Math.round(deg * (range / 180.0)) + scope.min;
      },
      val2Deg: function(value) {
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

        acs.css({
          'height': d + "px",
          'width': radius + "px",
          'border-radius': "0 " + d + "px " + d + "px 0",
          'border-left': 'none'
        });

        var pd = d + (radius / 10);

        acsPanel.css({
          'border-width': (radius / 10) + 'px',
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

        var outerArea = ($$acs.outerWidth() - $$acs.innerWidth()) + ($$acsValue.outerWidth() - $$acsValue.innerWidth());
        var corner = radius - iRadius - outerArea * 2;
        acsValue.css({
          'top': corner + "px",
          'left': -corner + "px",
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
        if (deg < 0 || deg > 359)
          throw "Invalid angle " + deg;

        deg = (deg + 90) % 360;
        return Math.round(deg * (range / 180.0)) + scope.min;
      },
      val2Deg: function(value) {
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

        acs.css({
          'width': d + "px",
          'height': radius + "px",
          'border-radius': "0 0 " + d + "px " + d + "px",
          'border-top': 'none'
        });

        var pd = d + (radius / 10);

        acsPanel.css({
          'border-width': (radius / 10) + 'px',
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

        var outerArea = ($$acs.outerWidth() - $$acs.innerWidth()) + ($$acsValue.outerWidth() - $$acsValue.innerWidth());
        var corner = radius - iRadius - outerArea * 2;
        acsValue.css({
          'top': -corner + "px",
          'left': corner + "px",
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
        if (deg < 0 || deg > 359)
          throw "Invalid angle " + deg;

        return Math.round(deg * (range / 180.0)) + scope.min;
      },
      val2Deg: function(value) {
        if (value < scope.min || value > scope.max)
          throw "Invalid range " + value;

        var nth = value - scope.min;

        return Math.round(nth * (180.0 / range));
      },
    }
  };




  function circularSlider() {
    return {
      template: props.template,
      restrict: 'EA',
      transclude: true,
      controller: CircularSliderController,
      controllerAs: 'slider',
      scope: {
        min: '@',
        max: '@',
        value: '=?',
        radius: '@',
        innerCircleRatio: '@',
        clockwise: '@',
        shape: '@',
        touch: '@',
        animate: '@',
        animateDuration: '@',
        selectable: '@',
        onSlide: '@',
      },
      link: link,
    };
  }

  function link(scope, element, attr, controller) {
    angular.forEach(scope.$$isolateBindings, function(binding, key) {
      if (angular.isUndefined(scope[key])) {
        scope[key] = props.defaults[key];
      }
    });

    // validations
    controller.validateBindings();

    // building components
    shapes[scope.shape].drawShape(getComponents(), getRadius());

    // wiring events


    // private functions
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
          'scope': scope
        };
        return (cs.components = acsComponents);
      }
    }

    function getRadius() {
      return Math.abs(parseInt(scope.radius)) || props.defaults.radius;
    }
  }


  function CircularSliderController($scope, $attrs) {

    function typeErrorMsg(typeName) {
      return function(binding, value) {
        return [binding, '(', value, ') - Expected', typeName].join(' ');
      };
    }

    var shapes = ['Circle', 'Half Circle', 'Half Circle Left', 'Half Circle Right'];

    var transforms = {
      integer: {
        bindings: ['min', 'max', 'value', 'radius', 'animateDuration'],
        transform: parseInt
      },
      number: {
        bindings: ['innerCircleRatio'],
        transform: parseFloat,
      },
      'function': {
        bindings: ['onSlide'],
        transform: function(fun) {
          return fun ? fun : angular.noop;
        },
      }
    };

    var rules = {
      type: {
        integer: {
          bindings: ['min', 'max', 'value', 'radius', 'animateDuration'],
          test: toInteger,
          onError: typeErrorMsg('integer')
        },
        number: {
          bindings: ['innerCircleRatio'],
          test: Number.isFinite,
          onError: typeErrorMsg('number')
        },
        'boolean': {
          bindings: ['touch', 'animate', 'selectable', 'clockwise'],
          test: toBoolean,
          onError: typeErrorMsg('boolean')
        },
        'function': {
          bindings: ['onSlide'],
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
          test: function valueInRange() {
            return $scope.min <= value && value <= $scope.max;
          },
          onError: function() {
            return [$scope.value, '(value) out of range: [', $scope.min, ',', $scope.max, ']'].join('');
          },
        },
        shape: {
          bindings: ['shape'],
          test: function shapeSupported() {
            return this.shapes[$scope.shape];
          },
          onError: function() {
            return ['Unsupported shape: ', $scope.shape].join('');
          },
        },
        ratio: {
          bindings: ['innerCircleRatio'],
          test: function ratio() {
            return $scope.innerCircleRatio >= 0.0 && $scope.innerCircleRatio <= 1.0;
          },
          onError: function() {
            return ['innerCircleRatio(', $scope.innerCircleRatio, ') is out of range: [0,1]'].join('');
          },
        }
      }
    };


    this.validateBindings = function() {
      var props = this.props,
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


    function init(controller) {

      // build constraints & transforms
      angular.forEach(rules, function(category, rule) {
        angular.forEach(category, function(action, name) {
          var bindings = action.bindings;
          bindings.map(function(binding) {
            controller[binding] = controller[binding] || {
              tests: []
            };
            controller[binding].tests.push[{
              test: action.test,
              onError: action.onError
            }];
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


  CircularSliderController.$inject = ['$scope', '$attrs'];

  angular.module('angular.circular-slider', [])
    .directive('circularSlider', circularSlider);

}(window, window.angular));
