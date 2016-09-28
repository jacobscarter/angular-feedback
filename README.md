# angular-feedback

Feedback directive similar to Google Feedback

This directive was built using [ivoviz's](http://github.com/ivoviz) feedback repo.

## Demo

[http://jacobscarter.github.io/angular-feedback/](http://jacobscarter.github.io/angular-feedback/)

## Install

`bower install angular-send-feedback`

## Dependencies

* jQuery
* html2canvas

## Use

Add as a dependency to your application:

`angular.module('myApp', ['angular-send-feedback']);`

Add directive to your HTML:

`<angular-feedback options="options"></angular-feedback>`

The options attribute is connected to a `$scope` value in your controller, you can use this object to change/modify any of the options listed below.

## Post Data

The information from the client will be sent through ajax post request. The information is in JSON format.

* `post.browser` - Browser information.
* `post.url` - The page URL.
* `post.note` - Description of the feedback.
* `post.img` - The screenshot of the feedback. - **base64 encoded data URI!**
* `post.html` - The structure of the page.
* `post.timestamp` - Timestamp create when request is sent.

Sample Request Body
```
{
    "feedback": {
        "browser": {
            "appCodeName": "Mozilla",
            "appName": "Netscape",
            "appVersion": "5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.110 Safari/537.36",
            "cookieEnabled": true,
            "onLine": true,
            "platform": "Win32",
            "userAgent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.110 Safari/537.36",
            "plugins": [
                "Shockwave Flash",
                "Widevine Content Decryption Module",
                "Chrome PDF Viewer",
                "Native Client",
                "Chrome PDF Viewer"
            ]
        },
        "html": "<html>...</html>"
        "url": "http://localhost:3000/",
        "timestamp": 1467129480643,
        "img": "data:image/png;base64,...",
        "note": "test"
    }
}
```

## Options

### ajaxURL (String)

The URL where the plugin will post the screenshot and additional informations. (JSON datatype)

`Default: ''`

### postTimeStamp (Boolean)

Whether you want a timestamp sent in the form of number of milliseconds since 1 January 1970 00:00:00 UTC.

`Default: true`

### postBrowserInfo (Boolean)

Whether you want your client to post their browser information (such as useragent, plugins used, etc.)

`Default: true`

### postHTML (Boolean)

Whether you want your client to post the page's HTML structure.

`Default: true`

### postURL (Boolean)

Whether you want your client to post the URL of the page.

`Default: true`

### proxy (String)

Url to the proxy which is to be used for loading cross-origin images. If left empty, cross-origin images won't be loaded.

`Default: ''`

### letterRendering (Boolean)

Whether to render each letter seperately. Necessary if letter-spacing is used.

`Default: false`

### initButtonText (String / HTML)

The default button text.

`Default: Send feedback`

### strokeStyle (String / HEX color)

The color of the highlight border. You can use values either like 'black', 'red', etc. or HEX codes like '#adadad'.

`Default: black`

### shadowColor (String / HEX color)

The color of the shadow.

`Default: black`

### shadowOffsetX / shadowOffsetY (Integer)

Sets the horizontal / vertical distance of the shadow from the shape.

`Default: 1`

### shadowBlur (Integer)

The blur level for the shadow.

`Default: black`

### lineJoin (String)

Sets the type of corner created, when two lines meet.

`Default: bevel`

### lineWidth (Integer)

Sets border of the highlighted area.

`Default: 3`

### loadHtml2Canvas (Boolean)

By Setting this false the user will have to include html2canvas library your self, the setting html2canvasURL will be ignored

`Default: true`

### html2canvasURL (String)

The URL where the plugin can download html2canvas.js from.

`Default: html2canvas.js`

### tpl.description / tpl.highlighter / tpl.overview / tpl.submitSuccess / tpl.submitError (String / HTML)

The template of the plugin. You could change it any time, but keep in mind to keep the elements' ids and classes so the script won't break.

`Default: ...`

### onClose (Function)

Function that runs when you close the plugin.

`Default: null`

### screenshotStroke (Boolean)

Changing to `false` will remove the borders from the highlighted areas when taking the screenshot.

`Default: true`

### highlightElement (Boolean)

By default when you move your cursor over an element the plugin will temporarily highlight it until you move your cursor out of that area.
I'm not exactly sure whether it's a good thing or not, but Google has it, so yeah.

`Default: true`

### initialBox (Boolean)

By Setting this true the user will have to describe the bug/idea before being able to highlight the area.

`Default: false`

### feedbackButton (String)

Define a custom button instead of the default button that appears on the lower right corner.

`Default: .feedback-btn`

### showDescriptionModal (Boolean)

Sets whether the next modal for entering description should appear or not

`Default: true`

### onScreenshotTaken (Function)

A callback function to be called when clicking on take screenshot button. The callback function's prototype is `function(post)`

`Default: {}`

### isDraggable (Boolean)

Sets whether the user will be able to drag the feedback options modal or not

`Default: true`

## //TODO List

* Pulling jQuery out into a more classical AngularJS Directive rather than just wrapping the jQuery plugin.
