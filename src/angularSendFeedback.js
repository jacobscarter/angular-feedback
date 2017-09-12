/* globals html2canvas */
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

angular.module('angular-send-feedback', [])
.directive('angularFeedback', ['$document', '$window', '$http', function ($document, $window, $http) {
  return {
    restrict: 'EA',
    scope: {
      options: '='
    },
    templateUrl: function (element, attributes) {
      return attributes.template || 'angular-send-feedback/src/angularsendfeedback.html'
    },
    link: function ($scope) {
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
        excludeTags: ['body', 'script', 'iframe', 'div', 'section', 'canvas', '.feedback-btn', '#feedback-module'],
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

      $scope.highlightblocks = []

      var canDraw
      if (!supportedBrowser) {
        return
      }
      var doc = angular.element($document)

      $scope.feedbackButtonEnabled = true
      $scope.start = false

      var feedbackCanvas = angular.element(document.getElementById('feedback-canvas'))
      $scope.feedbackHighlighterStyle = {}
      $scope.canvasStyle = {}

      $scope.launchHighlight = function (feedbackNote) {
        $scope.feedbackNote = feedbackNote
        if ($scope.feedbackNote && $scope.feedbackNote.length) {
          canDraw = true
          $scope.canvasStyle['cursor'] = 'crosshair'
          $scope.showFeedbackHelpers = true
          $scope.showWelcome = false
          $scope.showFeedbackHighlighter = true
        }
      }

      $scope.startFeedback = function () {
        $scope.start = true
        $scope.showWelcome = true
        if (isFeedbackButtonNative) {
          $scope.feedbackButtonEnabled = false
        }

        canDraw = false
        var img = ''
        var h = document.body.clientHeight
        var w = document.body.clientWidth

        $scope.feedbackModuleStyle = {
          position: 'absolute',
          left: '0px',
          top: '0px'
        }

        $scope.canvasStyle['z-index'] = 30000
        $scope.canvasStyle['width'] = w
        $scope.canvasStyle['height'] = h
        feedbackCanvas.attr('width', w)
        feedbackCanvas.attr('height', h)

        if (!settings.initialBox) {
          canDraw = true
          $scope.canvasStyle['cursor'] = 'crosshair'
          $scope.showFeedbackHelpers = true
          $scope.showWelcome = false
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

          var _top = e.pageY + fHposY - fHdragH
          var _left = e.pageX + fHposX - fHdragW
          var _bottom = fHdragH - e.pageY
          var _right = fHdragW - e.pageX
          var width = angular.element($window)[0].offsetWidth
          var height = angular.element($window)[0].offsetHeight

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

          $scope.feedbackHighlighterStyle['top'] = _top + 'px'
          $scope.feedbackHighlighterStyle['left'] = _left + 'px'
        }

        $scope.trackHighlighter = function (e) {
          if (!settings.isDraggable) return
          $scope.moving = true
          $scope.draggingHighlighter = true
          fHdragH = e.target.offsetHeight
          fHdragW = e.target.offsetWidth
          fHposY = e.target.getBoundingClientRect().top + fHdragH - e.pageY
          fHposX = e.target.getBoundingClientRect().left + fHdragW - e.pageX
          $scope.feedbackHighlighterStyle['z-index'] = 40000
          e.preventDefault()
        }

        $scope.untrackHighlighter = function () {
          if (!settings.isDraggable || !$scope.moving) return
          $scope.moving = false
          $scope.draggingHighlighter = false
        }

        function start () {
          var ctx = feedbackCanvas[0].getContext('2d')

          redrawBackground(ctx)

          var currentBlock = {}
          var tmpCurrentBlock = {} // store next block before assuring user wants to drag
          var drag = false
          var clicked = false
          $scope.highlight = 1
          var post = {}

          var startX = -1
          var startY = -1

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

            angular.forEach(navigator.plugins, function (value) {
              post.browser.plugins.push(value.name)
            })
          }

          if (settings.postURL) {
            post.url = document.URL
          }

          if (settings.postTimeStamp) {
            post.timestamp = new Date().getTime()
          }

          if (settings.postHTML) {
            post.html = angular.element(document.getElementsByTagName('html')).innerHtml
          }

          $scope.onMouseDown = function (e) {
            if (!canDraw || drag) return
            // removePending()
            clicked = true

            startX = e.pageX - feedbackCanvas[0].getBoundingClientRect().left
            startY = e.pageY - feedbackCanvas[0].getBoundingClientRect().top

            tmpCurrentBlock = {
              type: $scope.highlight ? 'highlight' : 'blackout',
              time: Date.now(),
              top: startY,
              left: startX,
              width: 0,
              height: 0,
              zIndex: 30002,
              pending: true
            }
          }

          function dragBlock () {
            if (!clicked) return
            removePending()
            currentBlock = tmpCurrentBlock
            $scope.highlightblocks.push(currentBlock)
            drag = true
          }

          doc.bind('mouseup', function () {
            clicked = false
            if (!canDraw || !drag) return
            drag = false

            var dtop = currentBlock.top
            var dleft = currentBlock.left
            var dwidth = currentBlock.width
            var dheight = currentBlock.height

            if (dwidth === 0 || dheight === 0) {
              $scope.highlightblocks.pop()
            }

            if (dwidth < 0) {
              dleft += dwidth
              dwidth *= -1
            }
            if (dheight < 0) {
              dtop += dheight
              dheight *= -1
            }

            if (dtop + dheight > $document.innerHeight) {
              dheight = $document.innerHeight - dtop
            }
            if (dleft + dwidth > $document.innerWidth) {
              dwidth = $document.innerWidth - dleft
            }

            currentBlock.top = dtop
            currentBlock.left = dleft
            currentBlock.width = dwidth
            currentBlock.height = dheight
            currentBlock.pending = false

            redraw(ctx)
          })

          doc.bind('mousemove', function (e) {
            if (!canDraw || !drag) return
            $scope.feedbackHighlighterStyle['cursor'] = 'default'

            currentBlock.width = (e.pageX - feedbackCanvas[0].getBoundingClientRect().left) - startX
            currentBlock.height = (e.pageY - feedbackCanvas[0].getBoundingClientRect().top) - startY

            redraw(ctx)
          })

          function highlightHovered (ctx, elem) {
            if (!elem || drag) return
            removePending()

            $scope.canvasStyle['cursor'] = 'pointer'

            var pos = elem.getBoundingClientRect()

            currentBlock = {
              type: $scope.highlight ? 'highlight' : 'blackout',
              time: Date.now(),
              top: pos.top - 2,
              left: pos.left - 2,
              width: pos.width + 6,
              height: pos.height + 6,
              pending: true,
              hover: true,
              zIndex: 29999
            }

            $scope.highlightblocks.push(currentBlock)

            redraw(ctx)
          }

          function removePending (hover) {
            for (var i = 0; i < $scope.highlightblocks.length; i++) {
              if ($scope.highlightblocks[i].pending &&
              (!hover || $scope.highlightblocks[i].hover)) {
                $scope.highlightblocks.splice(i, 1)
              }
            }
          }

          $scope.removeBlock = function (index) {
            $scope.highlightblocks.splice(index, 1)
            redraw(ctx)
          }

          $scope.selectBlock = function (e) {
            if (e.pageX === startX && e.pageY === startY) {
              currentBlock.pending = false
              currentBlock.hover = false
              currentBlock.zIndex = 30002
              redraw(ctx)
            }
          }

          $scope.onHover = function (e) {
            if (!settings.highlightElement || !canDraw || drag) return
            if (clicked) return dragBlock()

            removePending(true)
            redraw(ctx)

            $scope.canvasStyle['cursor'] = 'crosshair'

            var excludeString = settings.excludeTags.join('):not(')

            var matching = document.querySelectorAll('* :not(' + excludeString + ')')

            var toHighlight

            for (var i = 0; i < matching.length; i++) {
              var pos = matching[i].getBoundingClientRect()
              if (e.pageX >= pos.left && e.pageX <= pos.left + pos.width &&
                e.pageY >= pos.top && e.pageY <= pos.top + pos.height) {
                toHighlight = matching[i]
              }
            }

            if (toHighlight) {
              highlightHovered(ctx, toHighlight)
            }
          }

          $scope.redraw = function () {
            redraw(ctx)
          }

          angular.element(document.getElementsByTagName('body'))
          .on('mouseleave', function () {
            redraw(ctx)
          })

          $scope.removeElem = function (e, item) {
            if (!settings.highlightElement || !item.id) {
              return
            }
            for (var i = 0; i < $scope.highlightblocks.length; i++) {
              if ($scope.highlightblocks[i].id === item.id) {
                $scope.highlightblocks.slice(i, 0)
                redraw(ctx)
                return
              }
            }
          }

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
            $scope.canvasStyle['cursor'] = 'default'
            $scope.showFeedbackHelpers = false
            $scope.showFeedbackHighlighter = false
            $scope.showWelcome = true
          }

          $scope.setHighlight = function (val) {
            $scope.highlight = val ? 1 : 0
          }

          $scope.takeScreenshot = function () {
            canDraw = false
            $scope.canvasStyle['cursor'] = 'default'
            $window.scrollTo(0, 0) // scroll to top
            $scope.showFeedbackHelpers = false
            $scope.showFeedbackHighlighter = false

            if (!settings.screenshotStroke) {
              redraw(ctx, false)
            }

            setTimeout(function () {
              html2canvas(document.body, {
                onrendered: function (canvas) {
                  if (!settings.screenshotStroke) {
                    redraw(ctx)
                  }
                  img = canvas.toDataURL()

                  $window.scrollTo(0, 0)
                  post.img = img

                  $scope.screenshot = img

                  settings.onScreenshotTaken(post.img)

                  if (settings.showDescriptionModal) {
                    $scope.showOverview = true
                  } else {
                    close()
                  }
                  $scope.$apply()
                },
                proxy: settings.proxy,
                letterRendering: settings.letterRendering
              })
            }, 100)
          }

          $scope.backToHighlight = function (e) {
            canDraw = true
            angular.element('#feedback-canvas').css('cursor', 'crosshair')
            angular.element('#feedback-overview').hide()
            angular.element('#feedback-helpers').show()
            angular.element('#feedback-highlighter').show()
            angular.element('#feedback-overview-error').hide()
          }

          $scope.submit = function () {
            canDraw = false

            if ($scope.feedbackNote) {
              $scope.submitSuccess = false
              $scope.submitError = false
              $scope.showOverview = false

              post.img = img
              post.note = $scope.feedbackNote
              var data = {feedback: post}
              var jsonData = JSON.stringify(data)
              $http.post({
                url: typeof settings.ajaxURL === 'function' ? settings.ajaxURL() : settings.ajaxURL,
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
            }
          }
        }
      }

      function close () {
        canDraw = false
        $scope.feedbackButtonEnabled = true
        $scope.start = false
        settings.onClose.call(this)
      }

      function redraw (ctx, border) {
        border = typeof border !== 'undefined' ? border : true

        redrawBackground(ctx)

        // redraw each rectangle
        drawBorders(ctx)
        drawHighlightBlocks(ctx)
        drawBlackoutBlocks(ctx)
      }

      function redrawBackground (ctx) {
        // redraw all with same background color
        ctx.clearRect(0, 0, feedbackCanvas[0].offsetWidth, feedbackCanvas[0].offsetHeight)
        ctx.fillStyle = 'rgba(102,102,102,0.5)'
        ctx.fillRect(0, 0, feedbackCanvas[0].offsetWidth, feedbackCanvas[0].offsetHeight)
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

      function drawBorders (ctx) {
        var block, i
        for (i = 0; i < $scope.highlightblocks.length; i++) {
          block = $scope.highlightblocks[i]
          if (block.type === 'highlight') {
            drawlines(ctx, block.left, block.top, block.width, block.height)
          }
        }
      }

      function drawHighlightBlocks (ctx) {
        var block, i
        for (i = 0; i < $scope.highlightblocks.length; i++) {
          block = $scope.highlightblocks[i]
          if (block.type === 'highlight') {
            ctx.clearRect(block.left, block.top, block.width, block.height)
          }
        }
      }

      function drawBlackoutBlocks (ctx) {
        var block, i
        for (i = 0; i < $scope.highlightblocks.length; i++) {
          block = $scope.highlightblocks[i]
          if (block.type === 'blackout') {
            if (block.pending) {
              ctx.fillStyle = 'rgba(0,0,0,0.5)'
            } else {
              ctx.fillStyle = 'rgba(0,0,0,1)'
            }
            ctx.fillRect(block.left, block.top, block.width, block.height)
          }
        }
      }
    }
  }
}])
