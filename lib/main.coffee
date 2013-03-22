Emitter = require 'emitter'
trigger = require 'trigger-event'
Whammy = require 'whammy'

saveURL = (file, uri) ->
  link = document.createElement "a"
  link.href = uri
  link.target = "_blank"
  link.download = file
  trigger link, "click"
  URL.revokeObjectURL link.href
  return

blobToUri = (blob, cb) ->
  reader = new FileReader
  reader.readAsDataURL blob
  reader.onload = (event) ->
    cb event.target.result

class Recorder extends Emitter
  constructor: (el, @fps=32) ->
    if el.jquery
      @height = el.height()
      @width = el.width()
      @el = el[0]
    else
      @height = el.clientHeight
      @width = el.clientWidth
      @el = el

    @canvas = document.createElement 'canvas'
    @context = @canvas.getContext '2d'
    @canvas.height = @height
    @canvas.width = @width

    @interval = 1000/@fps
    @frames = []
    @_requested = null
    @delta = null
    @then = Date.now()
    @now = null

  grab: =>
    @_requested = requestAnimationFrame @grab
    @now = Date.now()
    @delta = @now-@then
    if @delta > @interval
      @then = @now-(@delta%@interval)
      @context.drawImage @el, 0, 0, @width, @height
      uri = @canvas.toDataURL 'image/webp', 1
      @frames.push uri
      @emit "frame", uri
    return @

  start: =>
    @grab()
    return @

  save: (fileName="recording.webm") =>
    @toDataURL (err, uri) ->
      saveURL fileName, uri
    return @

  stop: =>
    cancelAnimationFrame @_requested
    return @

  toDataURL: (cb) =>
    @toBlob (err, blob) ->
      return cb err if err?
      blobToUri blob, (uri) ->
        return cb null, uri

  toBlob: (cb) =>
    blob = Whammy.fromImageArray @frames, @fps
    cb null, blob

  clear: =>
    @frames = []
    return @


wrapper = (el) -> new Recorder el
wrapper.Recorder = Recorder

module.exports = wrapper