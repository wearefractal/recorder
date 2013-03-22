![status](https://secure.travis-ci.org/wearefractal/recorder.png?branch=master)

## Information

<table>
<tr> 
<td>Package</td><td>recorder</td>
</tr>
<tr>
<td>Description</td>
<td>Record video tags and media streams</td>
</tr>
<tr>
<td>Node Version</td>
<td>>= 0.4</td>
</tr>
</table>

## Usage

All output is WebM for now.

```coffee-script
# el can be a jquery element or vanilla el
el = $("#video")

# frameRate defaults to 32 - max is 60
controls = recorder(el, frameRate)

# start collecting frames - call this when video starts playing
controls.start()

# stops frame collection
controls.stop()

controls.toDataURL (err, uri) ->
controls.toBlob (err, blob) ->

# save the blob to the file system - filename defaults to recording.webm
controls.save(filename)
```

## Examples

You can view more examples in the [example folder.](https://github.com/wearefractal/recorder/tree/master/examples)

## LICENSE

(MIT License)

Copyright (c) 2013 Fractal <contact@wearefractal.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
