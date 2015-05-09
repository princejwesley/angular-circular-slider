# angular-circular-slider
Angular port of [circular-slider](http://www.toolitup.com/circular-slider.html) which helps to slide range of values and images. It supports half(top/bottom/up/down) and full circle shapes

![circular slider](http://www.toolitup.com/assets/images/circular-slider-demo.png)

[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/princejwesley/angular-circular-slider)

### Install
`bower install angular-circular-slider`

### Basic Usage

```javascript
var app = angular.module('yourApp',
  ['angular.circular-slider']);
```

```html
<link rel="stylesheet"
 href="dist/css/angular-circular-slider.min.css" />
<script src="dist/js/angular-circular-slider.js">
</script>
..
<circular-slider
  class='my-slider'
  shape='{{shape}}'
  touch="true"
  animate='true'
  on-slide='onSlide(value)'
  on-slide-end='onSlideEnd(value)'
  min="min"
  max="200"
  value="value">
  {{value}}
</circular-slider>

```

### Properites
#### radius
> `radius` of the circle in *px*.

#### innerCircleRatio
> ratio of inner circle area(used to display current sliding value).

#### indicatorBallRatio
> ratio of indicator ball.

#### min
> `min` value of the slider.

#### max
> `max` value of the slider.

#### value
> Initial value of the slider.

#### clockwise
> direction of the sliding value.

#### labelSuffix
> label to be used as suffix along with current sliding `value`.

#### labelPrefix
> label to be used as prefix along with current sliding `value`.

#### shape
> `shape` of the slider. Supported shapes are:

1. `'circle'` (*default*)
2. `'half circle'`
3. `'half circle left'`
4. `'half circle right'`
5. `'half circle bottom'`

### touch
> `touch` support. (default: *true*)

### animate
>linear `animation` support. (dafault: *true*)

### animateDuration
> Animation duration in milliseconds. (default: 360ms)

### selectable
> text selection enabled or not. (default: *false*)

### handleDistRatio
> Distance between handle and shape center(default: 1.0)

### borderWidth
> Border width(in px) of the slider(default: 1)

## Callbacks
###onSlide(value)
> `onSlide` callback is triggered whenever there is a change in sliding value.

Parameters:
```
value - Current sliding value
```

###onSlideEnd(value)
> `onSlideEnd` callback is triggered when the user action is done (on mouse up/touch end or click).

Parameters:
```
value - Current sliding value
```

##Default values
```javascript
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
  onSlide: angular.noop,
  onSlideEnd: angular.noop,
},
```

#### CSS classes
Use the below css classes for customization
> `.acs-panel` - circular slider panel

> `.acs` - Slider area

> `.acs-value` - Inner circle area

> `.acs-indicator` - Slide indicator ball


## License
This plugin is licensed under the [MIT license](https://github.com/princejwesley/angular-circular-slider/blob/master/LICENSE).

Copyright (c) 2015 [Prince John Wesley](http://www.toolitup.com)
