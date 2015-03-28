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
					<div clas="acs-value" ng-transclude>\
					</div>\
				</div>\
				<div class="acs-indicator">\
				</div>\
			</div>\
		',
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

    controller.validateBindings();

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

  angular.module('toolitup.circular-slider', [])
    .directive('circularSlider', circularSlider);

}(window, window.angular));
