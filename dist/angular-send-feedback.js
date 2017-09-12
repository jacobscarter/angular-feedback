/**
 * Angular feedback directive similar to Google Feedback
 * @version v1.2.2 - 2017-09-10 * @link https://github.com/pepperlabs/angular-feedback
 * @author Jacob Carter <jacob@ieksolutions.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
angular.module('templates-angularsendfeedback', ['angularsendfeedback.html']);

angular.module("angularsendfeedback.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("angularsendfeedback.html",
    "<div>\n" +
    "  <div id=\"feedback-button\" ng-if='settings.feedbackButtonNative && feedbackButtonEnabled && !start' ng-click='startFeedback()'>\n" +
    "    <button class=\"feedback-btn feedback-btn-gray\">Send feedback</button>\n" +
    "  </div>\n" +
    "  <div id=\"feedback-module\" ng-show='start' ng-mousemove='moveWindow($event)'>\n" +
    "    <div id=\"feedback-submit-success\" ng-if=\"submitSuccess\">\n" +
    "      <div class=\"feedback-logo\">Feedback</div>\n" +
    "      <p>Thank you for your feedback. We value every piece of feedback we receive.</p>\n" +
    "      <p>We cannot respond individually to every one, but we will use your comments as we strive to improve your experience.</p>\n" +
    "      <button class=\"feedback-close-btn feedback-btn-blue\" ng-click='close()'>OK</button>\n" +
    "      <div class=\"feedback-wizard-close\" ng-click='close()'></div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div id=\"feedback-submit-error\" ng-if=\"submitError\">\n" +
    "      <div class=\"feedback-logo\">Feedback</div>\n" +
    "      <p>Sadly an error occurred while sending your feedback. Please try again.</p>\n" +
    "      <button class=\"feedback-close-btn feedback-btn-blue\" ng-click='close()'>OK</button>\n" +
    "      <div class=\"feedback-wizard-close\" ng-click='close()'></div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div id=\"feedback-welcome\" ng-if='!hideWelcome'>\n" +
    "      <div class=\"feedback-logo\">Feedback</div>\n" +
    "      <p>Feedback lets you send us suggestions about our products. We welcome problem reports, feature ideas and general comments.</p>\n" +
    "      <p>Start by writing a brief description:</p>\n" +
    "      <textarea id=\"feedback-note-tmp\"></textarea>\n" +
    "      <p>Next we'll let you identify areas of the page related to your description.</p>\n" +
    "      <button id=\"feedback-welcome-next\" class=\"feedback-next-btn feedback-btn-gray\" ng-click='launchHighlight()'>Next</button>\n" +
    "      <div id=\"feedback-welcome-error\">Please enter a description.</div>\n" +
    "      <div class=\"feedback-wizard-close\" ng-click='close()'></div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div id=\"feedback-highlighter\" ng-show=\"showFeedbackHighlighter\" ng-mousedown='trackHighlighter($event)' \n" +
    "      ng-mouseup='untrackHighlighter()' ng-class='{\"feedback-draggable\":draggingHighlighter}'>\n" +
    "      <div class=\"feedback-logo\">Feedback</div>\n" +
    "      <p>Click and drag on the page to help us better understand your feedback. You can move this dialog if it's in the way.</p>\n" +
    "      <button class=\"feedback-sethighlight\" ng-mousedown='setHighlight(true)' ng-class='{\"feedback-active\": highlight}'>\n" +
    "        <div class=\"ico\"></div>\n" +
    "        <span>Highlight</span>\n" +
    "      </button>\n" +
    "      <label>Highlight areas relevant to your feedback.</label>\n" +
    "      <button class=\"feedback-setblackout\" ng-mousedown='setHighlight(false)' ng-class='{\"feedback-active\": !highlight}'>\n" +
    "        <div class=\"ico\"></div>\n" +
    "        <span>Black out</span>\n" +
    "      </button>\n" +
    "      <label class=\"lower\">Black out any personal information.</label>\n" +
    "      <div class=\"feedback-buttons\">\n" +
    "        <button id=\"feedback-highlighter-next\" class=\"feedback-next-btn feedback-btn-gray\" ng-click='startHtml2Canvas()'>Next</button>\n" +
    "        <button id=\"feedback-highlighter-back\" class=\"feedback-back-btn feedback-btn-gray\" ng-click='backToWelcome()' ng-show='settings.initialBox'>Back</button>\n" +
    "      </div>\n" +
    "      <div class=\"feedback-wizard-close\" ng-click='close()'></div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div id=\"feedback-overview\">\n" +
    "      <div class=\"feedback-logo\">Feedback</div>\n" +
    "      <div id=\"feedback-overview-description\">\n" +
    "        <div id=\"feedback-overview-description-text\">\n" +
    "          <h3>Description</h3>\n" +
    "          <h3 class=\"feedback-additional\">Additional info</h3>\n" +
    "          <div id=\"feedback-additional-none\" ng-show='!settings.postBrowserInfo&&!settings.pageInfo&&!settings.postHTML&&!settings.postTimeStamp'>\n" +
    "            <span>None</span>\n" +
    "          </div>\n" +
    "          <div id=\"feedback-browser-info\" ng-show='settings.postBrowserInfo'>\n" +
    "            <span>Browser Info</span>\n" +
    "          </div>\n" +
    "          <div id=\"feedback-page-info\" ng-show='settings.pageInfo'>\n" +
    "            <span>Page Info</span>\n" +
    "          </div>\n" +
    "          <div id=\"feedback-timestamp\" ng-show='settings.postTimeStamp'>\n" +
    "            <span>Time Stamp</span>'\n" +
    "          </div>\n" +
    "          <div id=\"feedback-page-structure\" ng-show='settings.postHTML'>\n" +
    "            <span>Page Structure</span>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "      <div id=\"feedback-overview-screenshot\">\n" +
    "        <h3>Screenshot</h3>\n" +
    "      </div>\n" +
    "      <div class=\"feedback-buttons\">\n" +
    "        <button id=\"feedback-submit\" class=\"feedback-submit-btn feedback-btn-blue\">Submit</button>\n" +
    "        <button id=\"feedback-overview-back\" class=\"feedback-back-btn feedback-btn-gray\" ng-click='backToHighlight()'>Back</button>\n" +
    "      </div>\n" +
    "      <div id=\"feedback-overview-error\">Please enter a description.</div>\n" +
    "      <div class=\"feedback-wizard-close\" ng-click='close()'></div>\n" +
    "    </div>\n" +
    "    <canvas id=\"feedback-canvas\" ng-mousemove='onMoveCanvas($event)' ng-click='onMoveCanvas($event)' ng-mousedown='startDragging($event)' ng-mouseleave='redraw()'></canvas>\n" +
    "    <div id=\"feedback-helpers\" ng-show='showFeedbackHelpers'>\n" +
    "\n" +
    "    </div>\n" +
    "    <input id=\"feedback-note\" name=\"feedback-note\" type=\"hidden\">\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module('angular-send-feedback', ['templates-angularsendfeedback']);

/* globals html2canvas, jQuery */
console.log('refactored')
function loadScript (src, callback) {
  var s, r, t
  r = false
  s = document.createElement('script')
  s.type = 'text/javascript'
  s.src = src
  s.onload = s.onreadystatechange = function () {
    if (!r && (!this.readyState || this.readyState === 'complete')) {
      r = true
      callback()
    }
  }
  t = document.getElementsByTagName('script')[0]
  t.parentNode.insertBefore(s, t)
}

angular.module('angular-send-feedback')
.directive('angularFeedback', ['$document', '$window', function ($document, $window) {
  return {
    restrict: 'EA',
    replace: true,
    transclude: true,
    scope: {
      options: '='
    },
    templateUrl: function (element, attributes) {
      return attributes.template || 'angularsendfeedback.html'
    },
    link: function ($scope, $element, $attrs) {
      var $ = jQuery
      var options = $scope.options
      var settings = angular.extend({
        ajaxURL: '',
        postBrowserInfo: true,
        postHTML: true,
        postURL: true,
        postTimeStamp: true,
        proxy: undefined,
        letterRendering: false,
        initButtonText: 'Send feedback',
        strokeStyle: 'black',
        shadowColor: 'black',
        shadowOffsetX: 1,
        shadowOffsetY: 1,
        shadowBlur: 10,
        lineJoin: 'bevel',
        lineWidth: 3,
        html2canvasURL: 'html2canvas.js',
        feedbackButton: '.feedback-btn',
        feedbackButtonNative: true,
        showDescriptionModal: true,
        isDraggable: true,
        onScreenshotTaken: function () {},
        tpl: {
          initButton: 'initButton',
          description: 'description',
          highlighter: 'highlighter',
          overview: 'overview',
          submitSuccess: 'submitSuccess',
          submitError: 'submitError'
        },
        onClose: function () {},
        screenshotStroke: true,
        highlightElement: true,
        initialBox: true
      }, options)
      $scope.settings = settings
      var supportedBrowser = !!window.HTMLCanvasElement
      var isFeedbackButtonNative = settings.feedbackButton === '.feedback-btn'
      var dtype
      var canDraw
      if (!supportedBrowser) {
        return
      }
      var doc = angular.element($document)

      $scope.feedbackButtonEnabled = true
      $scope.start = false
      $scope.startFeedback = function () {
        console.log('true !')
        $scope.start = true
        $scope.hideWelcome = false
        if (isFeedbackButtonNative) {
          $scope.feedbackButtonEnabled = false
        }

        var feedbackModule = angular.element('#feedback-module')
        var feedbackCanvas = angular.element('#feedback-canvas')
        var feedbackHighlighter = angular.element('#feedback-highlighter')

        console.log('start', $scope.start)
        canDraw = false
        var img = ''
        var h = $document.height()
        var w = $document.width()

        var moduleStyle = {
          position: 'absolute',
          left: '0px',
          top: '0px'
        }
        var canvasAttr = {
          width: w,
          height: h
        }

        console.log('feebackCanvas', feedbackCanvas)

        feedbackModule.css(moduleStyle)
        feedbackCanvas
          .attr(canvasAttr)
          .css('z-index', '30000')

        if (!settings.initialBox) {
          console.log('no initial box')
          canDraw = true
          feedbackCanvas.css('cursor', 'crosshair')
          $scope.showFeedbackHelpers = true
          $scope.hideWelcome = true
          $scope.showFeedbackHighlighter = true
        }
        if (typeof html2canvas === 'undefined') {
          loadScript(settings.html2canvasURL, start)
        } else {
          start()
        }

        var fHposY, fHposX, fHdragH, fHdragW

        $scope.moving = false

        $scope.moveWindow = function (e) {
          if (!settings.isDraggable || !$scope.moving) return
          console.log('move window')

          var _top = e.pageY + fHposY - fHdragH
          var _left = e.pageX + fHposX - fHdragW
          var _bottom = fHdragH - e.pageY
          var _right = fHdragW - e.pageX
          var width = angular.element($window).width()
          var height = angular.element($window).height()

          if (_left < 0) _left = 0
          if (_top < 0) _top = 0
          if (_right > width) {
            _left = width - fHdragW
          }
          if (_left > width - fHdragW) {
            _left = width - fHdragW
          }
          if (_bottom > height) {
            _top = height - fHdragH
          }
          if (_top > height - fHdragH) {
            _top = height - fHdragH
          }

          feedbackHighlighter.offset({
            top: _top,
            left: _left
          })
        }

        $scope.trackHighlighter = function (e) {
          if (!settings.isDraggable) return
          console.log('trackHighlighter')
          $scope.moving = true
          $scope.draggingHighlighter = true
          fHdragH = feedbackHighlighter.outerHeight()
          fHdragW = feedbackHighlighter.outerWidth()
          fHposY = feedbackHighlighter.offset().top + fHdragH - e.pageY
          fHposX = feedbackHighlighter.offset().left + fHdragW - e.pageX
          feedbackHighlighter.css('z-index', 40000)
          e.preventDefault()
        }

        $scope.untrackHighlighter = function () {
          if (!settings.isDraggable || !$scope.moving) return
          console.log('untrackHighlighter')
          $scope.moving = false
          $scope.draggingHighlighter = false
        }

        function start () {
          var ctx = feedbackCanvas[0].getContext('2d')

          ctx.fillStyle = 'rgba(102,102,102,0.5)'
          ctx.fillRect(0, 0, feedbackCanvas.width(), feedbackCanvas.height())

          var rect = {}
          var drag = false
          $scope.highlight = 1
          var post = {}

          if (settings.postBrowserInfo) {
            post.browser = {
              appCodeName: navigator.appCodeName,
              appName: navigator.appName,
              appVersion: navigator.appVersion,
              cookieEnabled: navigator.cookieEnabled,
              onLine: navigator.onLine,
              platform: navigator.platform,
              userAgent: navigator.userAgent,
              plugins: []
            }

            $.each(navigator.plugins, function (i) {
              post.browser.plugins.push(navigator.plugins[i].name)
            })
          }

          if (settings.postURL) {
            post.url = document.URL
          }

          if (settings.postTimeStamp) {
            post.timestamp = new Date().getTime()
          }

          if (settings.postHTML) {
            post.html = $('html').html()
          }

          $scope.startDragging = function (e) {
            if (!canDraw) return
            rect.startX = e.pageX - $(this).offset().left
            rect.startY = e.pageY - $(this).offset().top
            rect.w = 0
            rect.h = 0
            drag = true
          }

          doc.bind('mouseup', function () {
            if (canDraw) return
            console.log('mouseup document')
            drag = false

            var dtop = rect.startY
            var dleft = rect.startX
            var dwidth = rect.w
            var dheight = rect.h
            dtype = 'highlight'

            if (dwidth === 0 || dheight === 0) return

            if (dwidth < 0) {
              dleft += dwidth
              dwidth *= -1
            }
            if (dheight < 0) {
              dtop += dheight
              dheight *= -1
            }

            if (dtop + dheight > $document.height()) {
              dheight = $document.height() - dtop
            }
            if (dleft + dwidth > $document.width()) { dwidth = $document.width() - dleft }

            if ($scope.highlight === 0) {
              dtype = 'blackout'
            }

            $('#feedback-helpers').append('<div class="feedback-helper" data-type="' + dtype + '" data-time="' + Date.now() + '" style="position:absolute;top:' + dtop + 'px;left:' + dleft + 'px;width:' + dwidth + 'px;height:' + dheight + 'px;z-index:30000;"></div>')

            redraw(ctx)
            rect.w = 0
          })

          doc.bind('mousemove', function (e) {
            if (!canDraw || !drag) return
            feedbackHighlighter.css('cursor', 'default')

            rect.w = (e.pageX - feedbackCanvas.offset().left) - rect.startX
            rect.h = (e.pageY - feedbackCanvas.offset().top) - rect.startY

            ctx.clearRect(0, 0, feedbackCanvas.width(), feedbackCanvas.height())
            ctx.fillStyle = 'rgba(102,102,102,0.5)'
            ctx.fillRect(0, 0, feedbackCanvas.width(), feedbackCanvas.height())
            $('.feedback-helper').each(function () {
              if ($(this).attr('data-type') === 'highlight') {
                drawlines(ctx, parseInt($(this).css('left'), 10), parseInt($(this).css('top'), 10), $(this).width(), $(this).height())
              }
            })
            if ($scope.highlight === 1) {
              drawlines(ctx, rect.startX, rect.startY, rect.w, rect.h)
              ctx.clearRect(rect.startX, rect.startY, rect.w, rect.h)
            }
            $('.feedback-helper').each(function () {
              if ($(this).attr('data-type') === 'highlight') {
                ctx.clearRect(parseInt($(this).css('left'), 10), parseInt($(this).css('top'), 10), $(this).width(), $(this).height())
              }
            })
            $('.feedback-helper').each(function () {
              if ($(this).attr('data-type') === 'blackout') {
                ctx.fillStyle = 'rgba(0,0,0,1)'
                ctx.fillRect(parseInt($(this).css('left'), 10), parseInt($(this).css('top'), 10), $(this).width(), $(this).height())
              }
            })
            if ($scope.highlight === 0) {
              ctx.fillStyle = 'rgba(0,0,0,0.5)'
              ctx.fillRect(rect.startX, rect.startY, rect.w, rect.h)
            }
          })

          if (settings.highlightElement) {
            var highlighted = []
            var tmpHighlighted = []
            var hidx = 0

            $scope.onMoveCanvas = function (e) {
              if (!canDraw) return
              console.log('here? ')
              redraw(ctx)
              tmpHighlighted = []

              feedbackCanvas.css('cursor', 'crosshair')

              $('* :not(body,script,iframe,div,section,.feedback-btn,#feedback-module *)')
              .each(function () {
                if ($(this).attr('data-highlighted') === 'true') {
                  return
                }

                if (e.pageX > $(this).offset().left &&
                    e.pageX < $(this).offset().left + $(this).width() &&
                    e.pageY > $(this).offset().top + parseInt($(this).css('padding-top'), 10) &&
                    e.pageY < $(this).offset().top + $(this).height() + parseInt($(this).css('padding-top'), 10)) {
                  tmpHighlighted.push($(this))
                }
              })

              var $toHighlight = tmpHighlighted[tmpHighlighted.length - 1]

              if ($toHighlight && !drag) {
                feedbackCanvas.css('cursor', 'pointer')

                var _x = $toHighlight.offset().left - 2
                var _y = $toHighlight.offset().top - 2
                var _w = $toHighlight.width() + parseInt($toHighlight.css('padding-left'), 10) + parseInt($toHighlight.css('padding-right'), 10) + 6
                var _h = $toHighlight.height() + parseInt($toHighlight.css('padding-top'), 10) + parseInt($toHighlight.css('padding-bottom'), 10) + 6

                if ($scope.highlight === 1) {
                  drawlines(ctx, _x, _y, _w, _h)
                  ctx.clearRect(_x, _y, _w, _h)
                  dtype = 'highlight'
                }

                $('.feedback-helper').each(function () {
                  if ($(this).attr('data-type') === 'highlight') {
                    ctx.clearRect(parseInt($(this).css('left'), 10), parseInt($(this).css('top'), 10), $(this).width(), $(this).height())
                  }
                })

                if ($scope.highlight === 0) {
                  dtype = 'blackout'
                  ctx.fillStyle = 'rgba(0,0,0,0.5)'
                  ctx.fillRect(_x, _y, _w, _h)
                }

                $('.feedback-helper').each(function () {
                  if ($(this).attr('data-type') === 'blackout') {
                    ctx.fillStyle = 'rgba(0,0,0,1)'
                    ctx.fillRect(parseInt($(this).css('left'), 10), parseInt($(this).css('top'), 10), $(this).width(), $(this).height())
                  }
                })

                if (e.type === 'click' && e.pageX === rect.startX && e.pageY === rect.startY) {
                  $('#feedback-helpers').append('<div class="feedback-helper" data-highlight-id="' + hidx + '" data-type="' + dtype + '" data-time="' + Date.now() + '" style="position:absolute;top:' + _y + 'px;left:' + _x + 'px;width:' + _w + 'px;height:' + _h + 'px;z-index:30000;"></div>')
                  highlighted.push(hidx)
                  ++hidx
                  redraw(ctx)
                }
              }
            }
          }

          $scope.redraw = function () {
            redraw(ctx)
          }

          doc.bind('mouseleave', 'body', function () {
            redraw(ctx)
          })

          doc.bind('mouseenter', '.feedback-helper', function () {
            redraw(ctx)
          })

          $scope.launchHighlight = function () {
            console.log('yolo')
            if ($('#feedback-note').val().length > 0) {
              canDraw = true
              feedbackCanvas.css('cursor', 'crosshair')
              $scope.showFeedbackHelpers = true
              $scope.hideWelcome = true
              feedbackHighlighter.show()
              $scope.showFeedbackHighlighter = true
            } else {
              $('#feedback-welcome-error').show()
            }
          }

          doc.bind('mouseenter mouseleave', '.feedback-helper', function (e) {
            if (drag) { return }
            console.log('hhhhh')

            rect.w = 0
            rect.h = 0

            if (e.type !== 'mouseenter') {
              $(this).css('z-index', '30000')
              $(this).children().remove()
              if ($(this).attr('data-type') === 'blackout') {
                redraw(ctx)
              }
              return
            }
            $(this).css('z-index', '30001')
            $(this).append('<div class="feedback-helper-inner" style="width:' + ($(this).width() - 2) + 'px;height:' + ($(this).height() - 2) + 'px;position:absolute;margin:1px;"></div>')
            $(this).append('<div id="feedback-close"></div>')
            $(this).find('#feedback-close').css({
              'top': -1 * ($(this).find('#feedback-close').height() / 2) + 'px',
              'left': $(this).width() - ($(this).find('#feedback-close').width() / 2) + 'px'
            })

            if ($(this).attr('data-type') === 'blackout') {
              /* redraw white */
              ctx.clearRect(0, 0, $('#feedback-canvas').width(), $('#feedback-canvas').height())
              ctx.fillStyle = 'rgba(102,102,102,0.5)'
              ctx.fillRect(0, 0, $('#feedback-canvas').width(), $('#feedback-canvas').height())
              $('.feedback-helper').each(function () {
                if ($(this).attr('data-type') === 'highlight') {
                  drawlines(ctx, parseInt($(this).css('left'), 10), parseInt($(this).css('top'), 10), $(this).width(), $(this).height())
                }
              })
              $('.feedback-helper').each(function () {
                if ($(this).attr('data-type') === 'highlight') {
                  ctx.clearRect(parseInt($(this).css('left'), 10), parseInt($(this).css('top'), 10), $(this).width(), $(this).height())
                }
              })

              ctx.clearRect(parseInt($(this).css('left'), 10), parseInt($(this).css('top'), 10), $(this).width(), $(this).height())
              ctx.fillStyle = 'rgba(0,0,0,0.75)'
              ctx.fillRect(parseInt($(this).css('left'), 10), parseInt($(this).css('top'), 10), $(this).width(), $(this).height())

              var ignore = $(this).attr('data-time')

              /* redraw black */
              $('.feedback-helper').each(function () {
                if ($(this).attr('data-time') === ignore) return true
                if ($(this).attr('data-type') === 'blackout') {
                  ctx.fillStyle = 'rgba(0,0,0,1)'
                  ctx.fillRect(parseInt($(this).css('left'), 10), parseInt($(this).css('top'), 10), $(this).width(), $(this).height())
                }
              })
            }
          })

          $(document).on('click', '#feedback-close', function () {
            if (settings.highlightElement && $(this).parent().attr('data-highlight-id')) {
              var _hidx = $(this).parent().attr('data-highlight-id')
            }

            $(this).parent().remove()

            if (settings.highlightElement && _hidx) {
              $('[data-highlight-id="' + _hidx + '"]').removeAttr('data-highlighted').removeAttr('data-highlight-id')
            }

            redraw(ctx)
          })

          $scope.close = close

          doc.bind('keyup', function (e) {
            if (e.keyCode === 27) {
              close()
            }
          })

          doc.bind('selectstart', function (e) {
            e.preventDefault()
          })
          doc.bind('dragstart', function (e) {
            e.preventDefault()
          })

          $scope.backToWelcome = function () {
            canDraw = false
            feedbackCanvas.css('cursor', 'default')
            $('#feedback-helpers').hide()
            console.log('click high back')
            $('#feedback-highlighter').hide()
            $('#feedback-welcome-error').hide()
            $('#feedback-welcome').show()
          }

          $scope.setHighlight = function (val) {
            $scope.highlight = val ? 1 : 0
          }

          $scope.startHtml2Canvas = function () {
            console.log('startHTML2Canvas')
            canDraw = false
            feedbackCanvas.css('cursor', 'default')
            var sy = $(document).scrollTop()
            var dh = $(window).height()
            $('#feedback-helpers').hide()
            console.log('click high next')
            $('#feedback-highlighter').hide()
            if (!settings.screenshotStroke) {
              redraw(ctx, false)
            }
            html2canvas(angular.element('body'), {
              onrendered: function (canvas) {
                console.log('rendered')
                if (!settings.screenshotStroke) {
                  redraw(ctx)
                }
                var _canvas = $('<canvas id="feedback-canvas-tmp" width="' + w + '" height="' + dh + '"/>').hide().appendTo('body')
                var _ctx = _canvas.get(0).getContext('2d')
                _ctx.drawImage(canvas, 0, sy, w, dh, 0, 0, w, dh)
                img = _canvas.get(0).toDataURL()
                $(document).scrollTop(sy)
                post.img = img
                settings.onScreenshotTaken(post.img)
                if (settings.showDescriptionModal) {
                  $('#feedback-canvas-tmp').remove()
                  $('#feedback-overview').show()
                  $('#feedback-overview-description-text>textarea').remove()
                  $('#feedback-overview-screenshot>img').remove()
                  $('<textarea id="feedback-overview-note">' + $('#feedback-note').val() + '</textarea>').insertAfter('#feedback-overview-description-text h3:eq(0)')
                  $('#feedback-overview-screenshot').append('<img class="feedback-screenshot" src="' + img + '" />')
                } else {
                  console.log('remove feedback-module')
                  feedbackModule.remove()
                  close()
                  _canvas.remove()
                }
              },
              proxy: settings.proxy,
              letterRendering: settings.letterRendering
            })
          }

          $scope.backToHighlight = function (e) {
            canDraw = true
            console.log('backToHighlight')
            $('#feedback-canvas').css('cursor', 'crosshair')
            $('#feedback-overview').hide()
            $('#feedback-helpers').show()
            $('#feedback-highlighter').show()
            $('#feedback-overview-error').hide()
          }

          $(document).on('keyup', '#feedback-note-tmp,#feedback-overview-note', function (e) {
            var tx
            if (e.target.id === 'feedback-note-tmp') { tx = $('#feedback-note-tmp').val() } else {
              tx = $('#feedback-overview-note').val()
              $('#feedback-note-tmp').val(tx)
            }

            $('#feedback-note').val(tx)
          })

          $(document).on('click', '#feedback-submit', function () {
            canDraw = false

            if ($('#feedback-note').val().length > 0) {
              $('#feedback-submit-success,#feedback-submit-error').remove()
              $('#feedback-overview').hide()

              post.img = img
              post.note = $('#feedback-note').val()
              var data = {feedback: post}
              var jsonData = JSON.stringify(data)
              $.ajax({
                url: typeof settings.ajaxURL === 'function' ? settings.ajaxURL() : settings.ajaxURL,
                dataType: 'json',
                contentType: 'application/json',
                type: 'POST',
                data: jsonData,
                headers: {
                  'Content-Type': 'application/json'
                },
                success: function () {
                  $scope.submitSuccess = true
                },
                error: function () {
                  $scope.submitError = true
                }
              })
            } else {
              $('#feedback-overview-error').show()
            }
          })
        }
      }

      function close () {
        console.log('close')
        canDraw = false
        $scope.feedbackButtonEnabled = true
        $scope.start = false
        $(document).off('mouseenter mouseleave', '.feedback-helper')
        $(document).off('mouseup keyup')
        $(document).off('mousedown', '.feedback-setblackout')
        $(document).off('mousedown', '.feedback-sethighlight')
        $(document).off('mousedown click', '#feedback-close')
        $(document).off('mousedown', '#feedback-canvas')
        $(document).off('click', '#feedback-highlighter-next')
        $(document).off('click', '#feedback-highlighter-back')
        $(document).off('click', '#feedback-welcome-next')
        $(document).off('click', '#feedback-overview-back')
        $(document).off('mouseleave', 'body')
        $(document).off('mouseenter', '.feedback-helper')
        $(document).off('selectstart dragstart', document)
        $('#feedback-module').off('click', '.feedback-wizard-close,.feedback-close-btn')
        $(document).off('click', '#feedback-submit')

        if (settings.highlightElement) {
          $(document).off('click', '#feedback-canvas')
          $(document).off('mousemove', '#feedback-canvas')
        }
        $('[data-highlighted="true"]').removeAttr('data-highlight-id').removeAttr('data-highlighted')
        $('#feedback-module').remove()
        $('.feedback-btn').show()

        settings.onClose.call(this)
      }

      function redraw (ctx, border) {
        var feedbackCanvas = angular.element('#feedback-canvas')
        border = typeof border !== 'undefined' ? border : true
        ctx.clearRect(0, 0, feedbackCanvas.width(), feedbackCanvas.height())
        ctx.fillStyle = 'rgba(102,102,102,0.5)'
        ctx.fillRect(0, 0, feedbackCanvas.width(), feedbackCanvas.height())
        $('.feedback-helper').each(function () {
          if ($(this).attr('data-type') === 'highlight') {
            if (border) {
              drawlines(ctx, parseInt($(this).css('left'), 10), parseInt($(this).css('top'), 10), $(this).width(), $(this).height())
            }
          }
        })
        $('.feedback-helper').each(function () {
          if ($(this).attr('data-type') === 'highlight') {
            ctx.clearRect(parseInt($(this).css('left'), 10), parseInt($(this).css('top'), 10), $(this).width(), $(this).height())
          }
        })
        $('.feedback-helper').each(function () {
          if ($(this).attr('data-type') === 'blackout') {
            ctx.fillStyle = 'rgba(0,0,0,1)'
            ctx.fillRect(parseInt($(this).css('left'), 10), parseInt($(this).css('top'), 10), $(this).width(), $(this).height())
          }
        })
      }

      function drawlines (ctx, x, y, w, h) {
        ctx.strokeStyle = settings.strokeStyle
        ctx.shadowColor = settings.shadowColor
        ctx.shadowOffsetX = settings.shadowOffsetX
        ctx.shadowOffsetY = settings.shadowOffsetY
        ctx.shadowBlur = settings.shadowBlur
        ctx.lineJoin = settings.lineJoin
        ctx.lineWidth = settings.lineWidth

        ctx.strokeRect(x, y, w, h)

        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
        ctx.shadowBlur = 0
        ctx.lineWidth = 1
      }
    }
  }
}])
