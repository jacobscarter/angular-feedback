/* globals html2canvas */
/**
  Following StandardJS linting rules:
  https://standardjs.com/
**/
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

angular.module('angular-send-feedback', ['templates-angularsendfeedback'])
.directive('feedbackHighlighter', ['$window', function ($window) {
  return {
    restrict: 'E',
    scope: {
      settings: '=feedbackSettings',
      next: '=',
      prev: '=',
      toggle: '=',
      close: '='
    },
    templateUrl: function (element, attributes) {
      return attributes.template || 'feedback-highlighter.html'
    },
    link: function ($scope, elem, attrs) {
      $scope.i10n = $scope.settings.i10n[$scope.settings.language]
      elem = elem.children()[0]

      $scope.dragging = false
      $scope.style = {}

      var prevX, prevY

      $scope.move = function (e) {
        if (!$scope.settings.isDraggable || !$scope.dragging) return

        var pos = elem.getBoundingClientRect()

        if (prevX === null) {
          prevX = e.pageX
          prevY = e.pageY
          return
        }

        var diffX = e.pageX - prevX
        var diffY = e.pageY - prevY

        $scope.style.height = pos.height + 'px'
        $scope.style.width = pos.width + 'px'
        $scope.style.top = (pos.top + diffY) + 'px'
        $scope.style.left = (pos.left + diffX) + 'px'

        prevX = e.pageX
        prevY = e.pageY
      }

      $scope.track = function (e) {
        if (!$scope.settings.isDraggable) return
        prevX = null
        prevY = null
        $scope.dragging = true
        e.preventDefault()
      }

      $scope.untrack = function () {
        $scope.dragging = false
      }

      var e = angular.element(elem)
      e.on('touchstart', $scope.track)
      e.on('touchend', $scope.untrack)
      e.on('touchmove', $scope.move)
    }
  }
}])

.directive('angularFeedback', ['$document', '$window', '$http', function ($document, $window, $http) {
  return {
    restrict: 'EA',
    scope: {
      options: '='
    },
    templateUrl: function (element, attributes) {
      return attributes.template || 'angularsendfeedback.html'
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
        postCategory: true,
        categories: ['Suggestion', 'Bug report', 'Product error', 'Other'],
        defaultCategory: 'Suggestion',
        excludeTags: ['body', 'script', 'iframe', 'div', 'section', 'canvas', '.feedback-btn', '#feedback-module'],
        onScreenshotTaken: function () {},
        language: 'fr',
        i10n: {
          en: {
            title: 'Feedback',
            initButton: 'Send feedback',
            submitButton: 'Submit',
            nextButton: 'Next',
            okButton: 'OK',
            backButton: 'Back',
            descriptionError: 'Please enter a description',
            networkError: 'Sadly an error occurred while sending your feedback. Please try again.',
            welcome: {
              message1: 'Feedback lets you send us suggestions about our products. ' +
                       'We welcome problem reports, feature ideas and general comments.',
              message2: 'Start by writing a brief description:',
              message3: "Next we'll let you identify areas of the page related to your description.",
              message4: 'Please indicate the category of your feedback, it helps up organize feedbacks.'
            },
            thanks: {
              message1: 'Thank you for your feedback. We value every piece of feedback we receive.',
              message2: 'We cannot respond individually to every one, but we will use your comments ' +
                        'as we strive to improve your experience.'
            },
            draw: {
              message1: 'Click and drag on the page to help us better understand your feedback.' +
                        "You can move this dialog if it's in the way.",
              highlightTitle: 'Highlight',
              highlight: 'Highlight areas relevant to your feedback.',
              blackoutTitle: 'Black out',
              blackout: 'Black out any personal information.'
            },
            data: {
              browser: 'Browser Info',
              page: 'Page Info',
              time: 'Time Stamp',
              structure: 'Page Structure'
            }
          },
          fr: {
            title: 'Avis',
            initButton: 'Un avis ?',
            submitButton: 'Envoyer',
            nextButton: 'Suivant',
            okButton: 'OK',
            backButton: 'Retour',
            descriptionError: 'Veuillez entrer une description',
            networkError: "Malheureusement une erreur s'est produite pendant l'envoi de votre avis. " +
                          'Veuillez réessayer.',
            welcome: {
              message1: 'Les avis vous permettent de nous envoyer des suggestions à propos de notre site. ' +
                        "Nous accueillons les rapports d'erreurs, idées de fonctionnalités et commentaires généraux",
              message2: 'Commencez par rédiger une brève description:',
              message3: 'Par la suite, nous vous laisserons identifier les zones de la page correspondant ' +
                        'à votre description',
              message4: 'À quelle catégorie correspond votre retour ?'
            },
            thanks: {
              message1: 'Merci pour votre retour. Nous analysons chaque avis que nous recevons.',
              message2: "Nous ne pouvons pas répondre à tous les commentaires, mais sachez qu'ils sont toujours " +
                        'pris en compte.'
            },
            draw: {
              message1: 'Cliquez et glissez votre curseur sur la page pour nous aider à mieux comprendre votre ' +
                        'avis',
              highlightTitle: 'Surligner',
              highlight: 'Surlignez les zones pertinentes',
              blackoutTitle: 'Masquer',
              blackout: 'Masquez vos informations personnelles'
            },
            data: {
              browser: 'Informations sur votre navigateur',
              page: 'Informations sur la page',
              time: 'Date du jour',
              structure: 'Structure de la page'
            }
          }
        },
        onClose: function () {},
        screenshotStroke: true,
        highlightElement: true,
        initialBox: true
      }, options)

      $scope.i10n = settings.i10n[settings.language]

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
      $scope.feedbackNote = ''
      $scope.feedbackCategory = ''
      $scope.start = false

      var feedbackCanvas = angular.element(document.getElementById('feedback-canvas'))

      function updateCanvas () {
        var h = document.body.clientHeight
        var w = document.body.clientWidth
        feedbackCanvas.attr('width', w)
        feedbackCanvas.attr('height', h)
      }

      function initCanvas () {
        $scope.showCanvas = false
        updateCanvas()
        angular.element($window).bind('resize', function () {
          updateCanvas()
        })
      }

      function showCanvas () {
        canDraw = true
        $scope.showCanvas = true
        $scope.showFeedbackHelpers = true
        $scope.showWelcome = false
        $scope.showFeedbackHighlighter = true
      }

      $scope.launchHighlight = function (note, cat) {
        $scope.feedbackCategory = cat
        $scope.feedbackNote = note
        if ($scope.feedbackNote && $scope.feedbackNote.length) {
          showCanvas()
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

        initCanvas()

        if (!settings.initialBox) {
          showCanvas()
        }

        if (typeof html2canvas === 'undefined') {
          loadScript(settings.html2canvasURL, start)
        } else {
          start()
        }

        function start () {
          var ctx = feedbackCanvas[0].getContext('2d')

          redrawBackground(ctx)

          var currentBlock = {}
          var tmpCurrentBlock = {} // store next block before assuring user wants to drag
          var drag = false
          var clicked = false
          $scope.highlight = true
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
            for (var i = 0; i < navigator.plugins.length; i++) {
              post.browser.plugins.push(navigator.plugins[i].name)
            }
          }

          if (settings.postURL) {
            post.url = document.URL
          }

          if (settings.postTimeStamp) {
            post.timestamp = Date.now()
          }

          if (settings.postHTML) {
            post.html = document.getElementsByTagName('html').innerHtml
          }

          $scope.onMouseDown = function (e) {
            if (!canDraw || drag) return
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

            currentBlock.width = (e.pageX - feedbackCanvas[0].getBoundingClientRect().left) - startX
            currentBlock.height = (e.pageY - feedbackCanvas[0].getBoundingClientRect().top) - startY

            redraw(ctx)
          })

          function highlightHovered (ctx, elem) {
            if (!elem || drag) return
            removePending()

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
            $scope.showCanvas = false
            $scope.showFeedbackHelpers = false
            $scope.showFeedbackHighlighter = false
            $scope.showWelcome = true
          }

          $scope.setHighlight = function (val) {
            if (typeof val === 'boolean') {
              $scope.highlight = val
            } else {
              return $scope.highlight
            }
          }

          $scope.takeScreenshot = function () {
            canDraw = false
            $window.scrollTo(0, 0) // scroll to top
            $scope.showFeedbackHelpers = false
            $scope.showFeedbackHighlighter = false
            removePending()
            if (!$scope.highlightblocks.length) {
              $scope.showCanvas = false
            } else {
              redraw(ctx)
            }

            if (!settings.screenshotStroke) {
              redraw(ctx, false)
            }

            setTimeout(function () {
              html2canvas(document.body, {
                onrendered: function (canvas) {
                  $scope.showCanvas = false
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
            $scope.showCanvas = true
            $scope.showOverview = false
            $scope.showFeedbackHelpers = true
            $scope.showFeedbackHighlighter = true
          }

          $scope.submit = function () {
            canDraw = false

            if ($scope.feedbackNote) {
              $scope.feedbackButtonEnabled = true
              $scope.submitSuccess = false
              $scope.submitError = false
              $scope.showOverview = false

              post.img = img
              post.note = $scope.feedbackNote
              post.category = $scope.feedbackCategory
              var data = {feedback: post}
              var jsonData = JSON.stringify(data)
              $http({
                url: typeof settings.ajaxURL === 'function' ? settings.ajaxURL() : settings.ajaxURL,
                method: 'POST',
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
        $scope.showWelcome = false
        $scope.showOverview = false
        $scope.showFeedbackHelpers = false
        $scope.showFeedbackHighlighter = false
        $scope.highlightblocks.length = 0
        $scope.showCanvas = false
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
