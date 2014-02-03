// Generated by CoffeeScript 1.6.2
(function() {
  'use strict';
  var checkInView, checkInViewDebounced, checkInViewItems, debounce, getViewportHeight, offsetTop, removeInViewItem;

  angular.module('angular-inview', []).directive('inViewContainer', function() {
    return {
      restrict: 'AC',
      controller: function($scope) {
        this.items = [];
        this.addItem = function(item) {
          item.scope = $scope;
          return this.items.push(item);
        };
        this.removeItem = function(item) {
          var i;

          return this.items = (function() {
            var _i, _len, _ref, _results;

            _ref = this.items;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              i = _ref[_i];
              if (i !== item) {
                _results.push(i);
              }
            }
            return _results;
          }).call(this);
        };
        return this;
      },
      link: function(scope, element, attrs, controller) {
        var check;

        check = debounce(function() {
          return checkInView(controller.items);
        });
        element.bind('scroll', check);
        return scope.$on('$destroy', function() {
          return element.unbind('scroll', check);
        });
      }
    };
  }).directive('inView', function($parse) {
    return {
      restrict: 'A',
      require: '?^inViewContainer',
      link: function(scope, element, attrs, container) {
        var inViewFunc, item;

        if (!attrs.inView) {
          return;
        }
        inViewFunc = $parse(attrs.inView);
        item = {
          element: element,
          wasInView: false,
          offset: 0,
          scope: scope,
          callback: function($inview, $inviewpart) {
            var _this = this;

            return this.scope.$apply(function() {
              return inViewFunc(_this.scope, {
                '$inview': $inview,
                '$inviewpart': $inviewpart
              });
            });
          }
        };
        if (container != null) {
          container.addItem(item);
        }
        if (attrs.inViewOffset != null) {
          attrs.$observe('inViewOffset', function(offset) {
            item.offset = offset;
            return checkInViewDebounced();
          });
        }
        checkInViewItems.push(item);
        checkInViewDebounced();
        return scope.$on('$destroy', function() {
          if (container != null) {
            container.removeItem(item);
          }
          return removeInViewItem(item);
        });
      }
    };
  });

  getViewportHeight = function() {
    var height, mode, _ref;

    height = window.innerHeight;
    if (height) {
      return height;
    }
    mode = document.compatMode;
    if (mode || !(typeof $ !== "undefined" && $ !== null ? (_ref = $.support) != null ? _ref.boxModel : void 0 : void 0)) {
      height = mode === 'CSS1Compat' ? document.documentElement.clientHeight : document.body.clientHeight;
    }
    return height;
  };

  offsetTop = function(el) {
    var rect = el.getBoundingClientRect();
    return rect.top;
  };

  checkInViewItems = [];

  removeInViewItem = function(item) {
    var i;

    return checkInViewItems = (function() {
      var _i, _len, _results;

      _results = [];
      for (_i = 0, _len = checkInViewItems.length; _i < _len; _i++) {
        i = checkInViewItems[_i];
        if (i !== item) {
          _results.push(i);
        }
      }
      return _results;
    })();
  };

  checkInView = function(items) {
    var elementBottom, elementHeight, elementTop, inView, inViewWithOffset, inviewpart, isBottomVisible, isTopVisible, item, viewportBottom, viewportTop, _i, _len, _results;

    viewportTop = 0;
    viewportBottom = viewportTop + getViewportHeight();
    _results = [];
    for (_i = 0, _len = items.length; _i < _len; _i++) {
      item = items[_i];
      elementTop = offsetTop(item.element[0]);
      elementHeight = item.element[0].offsetHeight;
      elementBottom = elementTop + elementHeight;
      inView = elementTop > viewportTop && elementBottom < viewportBottom;
      isBottomVisible = elementBottom + item.offset > viewportTop && elementTop < viewportTop;
      isTopVisible = elementTop - item.offset < viewportBottom && elementBottom > viewportBottom;
      inViewWithOffset = inView || isBottomVisible || isTopVisible || (elementTop < viewportTop && elementBottom > viewportBottom);
      if (inViewWithOffset) {
        inviewpart = (isTopVisible && 'top') || (isBottomVisible && 'bottom') || 'both';
        if (!(item.wasInView && item.wasInView === inviewpart)) {
          item.wasInView = inviewpart;
          _results.push(item.callback(true, inviewpart));
        } else {
          _results.push(void 0);
        }
      } else if (!inView && item.wasInView) {
        item.wasInView = false;
        _results.push(item.callback(false));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  debounce = function(f, t) {
    var timer;

    timer = null;
    return function() {
      if (timer != null) {
        clearTimeout(timer);
      }
      return timer = setTimeout(f, t != null ? t : 100);
    };
  };

  checkInViewDebounced = debounce(function() {
    return checkInView(checkInViewItems);
  });

  angular.element(window).bind('checkInView click ready scroll resize', checkInViewDebounced);

}).call(this);
