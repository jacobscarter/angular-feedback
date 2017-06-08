/* globals html2canvas, jQuery */

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

angular.module('angular-send-feedback').directive('angularFeedback', ['$document', '$window', function ($document, $window) {
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
        initialBox: false
      }, options)
      $scope.settings = settings
      var supportedBrowser = !!window.HTMLCanvasElement
      var isFeedbackButtonNative = settings.feedbackButton === '.feedback-btn'
      var dtype
      var canDraw
      if (!supportedBrowser) {
        return
      }
      $scope.feedbackButtonEnabled = true

      $(document).on('click', settings.feedbackButton, function () {
        if (isFeedbackButtonNative) {
          $scope.feedbackButtonEnabled = false
        }
        if (!html2canvas) {
          loadScript(settings.html2canvasURL, function () {})
        }
        canDraw = false
        var img = ''
        var h = $document.height()
        var w = $document.width()

        var moduleStyle = {
          'position': 'absolute',
          'left': '0px',
          'top': '0px'
        }
        var canvasAttr = {
          'width': w,
          'height': h
        }

        var feedbackModule = angular.element('#feedback-module')
        var feedbackCanvas = angular.element('#feedback-canvas')
        var feedbackHighlighterBack = angular.element('#feedback-highlighter-back')
        var feedbackHighlighter = angular.element('#feedback-highlighter')

        feedbackModule.css(moduleStyle)
        feedbackCanvas
          .attr(canvasAttr)
          .css('z-index', '30000')

        if (!settings.initialBox) {
          feedbackHighlighterBack.remove()
          canDraw = true
          feedbackCanvas.css('cursor', 'crosshair')
          $scope.showFeedbackHelpers = true
          $scope.hideWelcome = true
          $scope.showFeedbackHighlighter = true
        }

        if (settings.isDraggable) {
          feedbackHighlighter.on('mousedown', function (e) {
            var $d = feedbackHighlighter.addClass('feedback-draggable')
            var dragH = $d.outerHeight()
            var dragW = $d.outerWidth()
            var posY = $d.offset().top + dragH - e.pageY
            var posX = $d.offset().left + dragW - e.pageX
            $d.css('z-index', 40000).parent().on('mousemove', function (e) {
              var _top = e.pageY + posY - dragH
              var _left = e.pageX + posX - dragW
              var _bottom = dragH - e.pageY
              var _right = dragW - e.pageX

              if (_left < 0) _left = 0
              if (_top < 0) _top = 0
              if (_right > $window.width()) {
                _left = $window.width() - dragW
              }
              if (_left > $window.width() - dragW) { _left = $window.width() - dragW }
              if (_bottom > $document.height()) {
                _top = $document.height() - dragH
              }
              if (_top > $document.height() - dragH) { _top = $document.height() - dragH }

              $('.feedback-draggable').offset({
                top: _top,
                left: _left
              }).on('mouseup', function () {
                $(this).removeClass('feedback-draggable')
              })
            })
            e.preventDefault()
          }).on('mouseup', function () {
            $(this).removeClass('feedback-draggable')
            $(this).parents().off('mousemove mousedown')
          })
        }

        var ctx = $('#feedback-canvas')[0].getContext('2d')

        ctx.fillStyle = 'rgba(102,102,102,0.5)'
        ctx.fillRect(0, 0, $('#feedback-canvas').width(), $('#feedback-canvas').height())

        var rect = {}
        var drag = false
        var highlight = 1
        var post = {}

        if (settings.postBrowserInfo) {
          post.browser = {}
          post.browser.appCodeName = navigator.appCodeName
          post.browser.appName = navigator.appName
          post.browser.appVersion = navigator.appVersion
          post.browser.cookieEnabled = navigator.cookieEnabled
          post.browser.onLine = navigator.onLine
          post.browser.platform = navigator.platform
          post.browser.userAgent = navigator.userAgent
          post.browser.plugins = []

          $.each(navigator.plugins, function (i) {
            post.browser.plugins.push(navigator.plugins[i].name)
          })
          $('#feedback-browser-info').show()
        }

        if (settings.postURL) {
          post.url = document.URL
          $('#feedback-page-info').show()
        }

        if (settings.postTimeStamp) {
          post.timestamp = new Date().getTime()
          $('#feedback-timestamp').show()
        }

        if (settings.postHTML) {
          post.html = $('html').html()
          $('#feedback-page-structure').show()
        }

        if (!settings.postBrowserInfo && !settings.postURL && !settings.postHTML) { $('#feedback-additional-none').show() }

        $(document).on('mousedown', '#feedback-canvas', function (e) {
          if (canDraw) {
            rect.startX = e.pageX - $(this).offset().left
            rect.startY = e.pageY - $(this).offset().top
            rect.w = 0
            rect.h = 0
            drag = true
          }
        })

        $(document).on('mouseup', function () {
          if (canDraw) {
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

            if (dtop + dheight > $(document).height()) {
              dheight = $(document).height() - dtop
            }
            if (dleft + dwidth > $(document).width()) { dwidth = $(document).width() - dleft }

            if (highlight === 0) {
              dtype = 'blackout'
            }

            $('#feedback-helpers').append('<div class="feedback-helper" data-type="' + dtype + '" data-time="' + Date.now() + '" style="position:absolute;top:' + dtop + 'px;left:' + dleft + 'px;width:' + dwidth + 'px;height:' + dheight + 'px;z-index:30000;"></div>')

            redraw(ctx)
            rect.w = 0
          }
        })

        $(document).on('mousemove', function (e) {
          if (canDraw && drag) {
            $('#feedback-highlighter').css('cursor', 'default')

            rect.w = (e.pageX - $('#feedback-canvas').offset().left) - rect.startX
            rect.h = (e.pageY - $('#feedback-canvas').offset().top) - rect.startY

            ctx.clearRect(0, 0, $('#feedback-canvas').width(), $('#feedback-canvas').height())
            ctx.fillStyle = 'rgba(102,102,102,0.5)'
            ctx.fillRect(0, 0, $('#feedback-canvas').width(), $('#feedback-canvas').height())
            $('.feedback-helper').each(function () {
              if ($(this).attr('data-type') === 'highlight') {
                drawlines(ctx, parseInt($(this).css('left'), 10), parseInt($(this).css('top'), 10), $(this).width(), $(this).height())
              }
            })
            if (highlight === 1) {
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
            if (highlight === 0) {
              ctx.fillStyle = 'rgba(0,0,0,0.5)'
              ctx.fillRect(rect.startX, rect.startY, rect.w, rect.h)
            }
          }
        })

        if (settings.highlightElement) {
          var highlighted = []
          var tmpHighlighted = []
          var hidx = 0

          $(document).on('mousemove click', '#feedback-canvas', function (e) {
            if (canDraw) {
              redraw(ctx)
              tmpHighlighted = []

              $('#feedback-canvas').css('cursor', 'crosshair')

              $('* :not(body,script,iframe,div,section,.feedback-btn,#feedback-module *)').each(function () {
                if ($(this).attr('data-highlighted') === 'true') {
                  return
                }

                if (e.pageX > $(this).offset().left && e.pageX < $(this).offset().left + $(this).width() && e.pageY > $(this).offset().top + parseInt($(this).css('padding-top'), 10) && e.pageY < $(this).offset().top + $(this).height() + parseInt($(this).css('padding-top'), 10)) {
                  tmpHighlighted.push($(this))
                }
              })

              var $toHighlight = tmpHighlighted[tmpHighlighted.length - 1]

              if ($toHighlight && !drag) {
                $('#feedback-canvas').css('cursor', 'pointer')

                var _x = $toHighlight.offset().left - 2
                var _y = $toHighlight.offset().top - 2
                var _w = $toHighlight.width() + parseInt($toHighlight.css('padding-left'), 10) + parseInt($toHighlight.css('padding-right'), 10) + 6
                var _h = $toHighlight.height() + parseInt($toHighlight.css('padding-top'), 10) + parseInt($toHighlight.css('padding-bottom'), 10) + 6

                if (highlight === 1) {
                  drawlines(ctx, _x, _y, _w, _h)
                  ctx.clearRect(_x, _y, _w, _h)
                  dtype = 'highlight'
                }

                $('.feedback-helper').each(function () {
                  if ($(this).attr('data-type') === 'highlight') {
                    ctx.clearRect(parseInt($(this).css('left'), 10), parseInt($(this).css('top'), 10), $(this).width(), $(this).height())
                  }
                })

                if (highlight === 0) {
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
          })
        }

        $(document).on('mouseleave', 'body,#feedback-canvas', function () {
          redraw(ctx)
        })

        $(document).on('mouseenter', '.feedback-helper', function () {
          redraw(ctx)
        })

        $(document).on('click', '#feedback-welcome-next', function () {
          if ($('#feedback-note').val().length > 0) {
            canDraw = true
            $('#feedback-canvas').css('cursor', 'crosshair')
            $('#feedback-helpers').show()
            $('#feedback-welcome').hide()
            $('#feedback-highlighter').show()
          } else {
            $('#feedback-welcome-error').show()
          }
        })

        $(document).on('mouseenter mouseleave', '.feedback-helper', function (e) {
          if (drag) { return }

          rect.w = 0
          rect.h = 0

          if (e.type === 'mouseenter') {
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
          } else {
            $(this).css('z-index', '30000')
            $(this).children().remove()
            if ($(this).attr('data-type') === 'blackout') {
              redraw(ctx)
            }
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

        $('#feedback-module').on('click', '.feedback-wizard-close,.feedback-close-btn', function () {
          close()
        })

        $(document).on('keyup', function (e) {
          if (e.keyCode === 27) {
            close()
          }
        })

        $(document).on('selectstart dragstart', document, function (e) {
          e.preventDefault()
        })

        $(document).on('click', '#feedback-highlighter-back', function () {
          canDraw = false
          $('#feedback-canvas').css('cursor', 'default')
          $('#feedback-helpers').hide()
          $('#feedback-highlighter').hide()
          $('#feedback-welcome-error').hide()
          $('#feedback-welcome').show()
        })

        $(document).on('mousedown', '.feedback-sethighlight', function () {
          highlight = 1
          $(this).addClass('feedback-active')
          $('.feedback-setblackout').removeClass('feedback-active')
        })

        $(document).on('mousedown', '.feedback-setblackout', function () {
          highlight = 0
          $(this).addClass('feedback-active')
          $('.feedback-sethighlight').removeClass('feedback-active')
        })

        $(document).on('click', '#feedback-highlighter-next', function () {
          canDraw = false
          $('#feedback-canvas').css('cursor', 'default')
          var sy = $(document).scrollTop()
          var dh = $(window).height()
          $('#feedback-helpers').hide()
          $('#feedback-highlighter').hide()
          if (!settings.screenshotStroke) {
            redraw(ctx, false)
          }
          html2canvas($('body'), {
            onrendered: function (canvas) {
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
                $('#feedback-module').remove()
                close()
                _canvas.remove()
              }
            },
            proxy: settings.proxy,
            letterRendering: settings.letterRendering
          })
        })

        $(document).on('click', '#feedback-overview-back', function (e) {
          canDraw = true
          $('#feedback-canvas').css('cursor', 'crosshair')
          $('#feedback-overview').hide()
          $('#feedback-helpers').show()
          $('#feedback-highlighter').show()
          $('#feedback-overview-error').hide()
        })

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
      })

      function close () {
        canDraw = false
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
        border = typeof border !== 'undefined' ? border : true
        ctx.clearRect(0, 0, $('#feedback-canvas').width(), $('#feedback-canvas').height())
        ctx.fillStyle = 'rgba(102,102,102,0.5)'
        ctx.fillRect(0, 0, $('#feedback-canvas').width(), $('#feedback-canvas').height())
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
