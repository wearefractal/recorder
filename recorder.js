;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
  }

  if (require.aliases.hasOwnProperty(index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-indexof/index.js", function(exports, require, module){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("component-inherit/index.js", function(exports, require, module){

module.exports = function(a, b){
  var fn = function(){};
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
};
});
require.register("adamsanderson-trigger-event/index.js", function(exports, require, module){
var inherit = require('inherit');
module.exports = trigger;

/** 
  Event type mappings.
  This is not an exhaustive list, feel free to fork and contribute more.
  Namely keyboard events are not currently supported.
*/
var eventTypes = {
  load:        'HTMLEvents', 
  unload:      'HTMLEvents', 
  abort:       'HTMLEvents', 
  error:       'HTMLEvents', 
  select:      'HTMLEvents', 
  change:      'HTMLEvents', 
  submit:      'HTMLEvents', 
  reset:       'HTMLEvents', 
  focus:       'HTMLEvents', 
  blur:        'HTMLEvents', 
  resize:      'HTMLEvents', 
  scroll:      'HTMLEvents', 
  input:       'HTMLEvents', 
  
  click:       'MouseEvents',
  dblclick:    'MouseEvents', 
  mousedown:   'MouseEvents', 
  mouseup:     'MouseEvents', 
  mouseover:   'MouseEvents', 
  mousemove:   'MouseEvents', 
  mouseout:    'MouseEvents',
  contextmenu: 'MouseEvents'
};

// Default event properties:
var defaults = {
  clientX: 0,
  clientY: 0,
  button: 0,
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
  metaKey: false,
  bubbles: true,
  cancelable: true
};

/**
 * Trigger a DOM event.
 * 
 *    trigger(document.body, "click", {clientX: 10, clientY: 35});
 *
 * Where sensible, sane defaults will be filled in.  See the list of event
 * types for supported events.
 *
 * Loosely based on:
 * https://github.com/kangax/protolicious/blob/master/event.simulate.js
 */
function trigger(el, name, options){
  var event, type;
  
  type = eventTypes[name];
  if (!type) {
    throw new SyntaxError('Unknown event type: '+type);
  }
  
  options = options || {};
  inherit(defaults, options);
  
  if (document.createEvent) {
    // Standard Event
    event = document.createEvent(type);
    initializers[type](el, name, event, options);
    el.dispatchEvent(event);
  } else {
    // IE Event
    event = document.createEventObject();
    for (var key in options){
      event[key] = options[key];
    }
    el.fireEvent('on' + name, event);
  }
}

var initializers = {
  HTMLEvents: function(el, name, event, o){
    return event.initEvent(name, o.bubbles, o.cancelable);
  },
  MouseEvents: function(el, name, event, o){
    var screenX = ('screenX' in o) ? o.screenX : o.clientX;
    var screenY = ('screenY' in o) ? o.screenY : o.clientY;
    var clicks;
    var button;
    
    if ('detail' in o) {
      clicks = o.detail;
    } else if (name === 'dblclick') {
      clicks = 2;
    } else {
      clicks = 1;
    }
    
    // Default context menu to be a right click
    if (name === 'contextmenu') {
      button = button = o.button || 2;
    }
    
    return event.initMouseEvent(name, o.bubbles, o.cancelable, document.defaultView, 
          clicks, screenX, screenY, o.clientX, o.clientY,
          o.ctrlKey, o.altKey, o.shiftKey, o.metaKey, button, el);
  }
};

});
require.register("Contra-whammy/whammy.js", function(exports, require, module){
/*
	var vid = new Whammy.Video();
	vid.add(canvas or data url)
	vid.compile()
*/
module.exports = (function () {
  // in this case, frames has a very specific meaning, which will be 
  // detailed once i finish writing the code

  function toWebM(frames, outputAsArray) {
    var info = checkFrames(frames);

    //max duration by cluster in milliseconds
    var CLUSTER_MAX_DURATION = 30000;

    var EBML = [{
        "id": 0x1a45dfa3, // EBML
        "data": [{
            "data": 1,
            "id": 0x4286 // EBMLVersion
          }, {
            "data": 1,
            "id": 0x42f7 // EBMLReadVersion
          }, {
            "data": 4,
            "id": 0x42f2 // EBMLMaxIDLength
          }, {
            "data": 8,
            "id": 0x42f3 // EBMLMaxSizeLength
          }, {
            "data": "webm",
            "id": 0x4282 // DocType
          }, {
            "data": 2,
            "id": 0x4287 // DocTypeVersion
          }, {
            "data": 2,
            "id": 0x4285 // DocTypeReadVersion
          }
        ]
      }, {
        "id": 0x18538067, // Segment
        "data": [{
            "id": 0x1549a966, // Info
            "data": [{
                "data": 1e6, //do things in millisecs (num of nanosecs for duration scale)
                "id": 0x2ad7b1 // TimecodeScale
              }, {
                "data": "whammy",
                "id": 0x4d80 // MuxingApp
              }, {
                "data": "whammy",
                "id": 0x5741 // WritingApp
              }, {
                "data": doubleToString(info.duration),
                "id": 0x4489 // Duration
              }
            ]
          }, {
            "id": 0x1654ae6b, // Tracks
            "data": [{
                "id": 0xae, // TrackEntry
                "data": [{
                    "data": 1,
                    "id": 0xd7 // TrackNumber
                  }, {
                    "data": 1,
                    "id": 0x63c5 // TrackUID
                  }, {
                    "data": 0,
                    "id": 0x9c // FlagLacing
                  }, {
                    "data": "und",
                    "id": 0x22b59c // Language
                  }, {
                    "data": "V_VP8",
                    "id": 0x86 // CodecID
                  }, {
                    "data": "VP8",
                    "id": 0x258688 // CodecName
                  }, {
                    "data": 1,
                    "id": 0x83 // TrackType
                  }, {
                    "id": 0xe0, // Video
                    "data": [{
                        "data": info.width,
                        "id": 0xb0 // PixelWidth
                      }, {
                        "data": info.height,
                        "id": 0xba // PixelHeight
                      }
                    ]
                  }
                ]
              }
            ]
          },

          //cluster insertion point
        ]
      }
    ];


    //Generate clusters (max duration)
    var frameNumber = 0;
    var clusterTimecode = 0;
    while (frameNumber < frames.length) {

      var clusterFrames = [];
      var clusterDuration = 0;
      do {
        clusterFrames.push(frames[frameNumber]);
        clusterDuration += frames[frameNumber].duration;
        frameNumber++;
      } while (frameNumber < frames.length && clusterDuration < CLUSTER_MAX_DURATION);

      var clusterCounter = 0;
      var cluster = {
        "id": 0x1f43b675, // Cluster
        "data": [{
            "data": clusterTimecode,
            "id": 0xe7 // Timecode
          }
        ].concat(clusterFrames.map(function (webp) {
          var block = makeSimpleBlock({
            discardable: 0,
            frame: webp.data.slice(4),
            invisible: 0,
            keyframe: 1,
            lacing: 0,
            trackNum: 1,
            timecode: Math.round(clusterCounter)
          });
          clusterCounter += webp.duration;
          return {
            data: block,
            id: 0xa3
          };
        }))
      }

      //Add cluster to segment
      EBML[1].data.push(cluster);
      clusterTimecode += clusterDuration;
    }

    return generateEBML(EBML, outputAsArray)
  }

  // sums the lengths of all the frames and gets the duration, woo

  function checkFrames(frames) {
    var width = frames[0].width,
      height = frames[0].height,
      duration = frames[0].duration;
    for (var i = 1; i < frames.length; i++) {
      if (frames[i].width != width) throw "Frame " + (i + 1) + " has a different width";
      if (frames[i].height != height) throw "Frame " + (i + 1) + " has a different height";
      if (frames[i].duration < 0 || frames[i].duration > 0x7fff) throw "Frame " + (i + 1) + " has a weird duration (must be between 0 and 32767)";
      duration += frames[i].duration;
    }
    return {
      duration: duration,
      width: width,
      height: height
    };
  }


  function numToBuffer(num) {
    var parts = [];
    while (num > 0) {
      parts.push(num & 0xff)
      num = num >> 8
    }
    return new Uint8Array(parts.reverse());
  }

  function strToBuffer(str) {
    // return new Blob([str]);

    var arr = new Uint8Array(str.length);
    for (var i = 0; i < str.length; i++) {
      arr[i] = str.charCodeAt(i)
    }
    return arr;
    // this is slower
    // return new Uint8Array(str.split('').map(function(e){
    // 	return e.charCodeAt(0)
    // }))
  }


  //sorry this is ugly, and sort of hard to understand exactly why this was done
  // at all really, but the reason is that there's some code below that i dont really
  // feel like understanding, and this is easier than using my brain.

  function bitsToBuffer(bits) {
    var data = [];
    var pad = (bits.length % 8) ? (new Array(1 + 8 - (bits.length % 8))).join('0') : '';
    bits = pad + bits;
    for (var i = 0; i < bits.length; i += 8) {
      data.push(parseInt(bits.substr(i, 8), 2))
    }
    return new Uint8Array(data);
  }

  function generateEBML(json, outputAsArray) {
    var ebml = [];
    for (var i = 0; i < json.length; i++) {
      var data = json[i].data;
      if (typeof data == 'object') data = generateEBML(data, outputAsArray);
      if (typeof data == 'number') data = bitsToBuffer(data.toString(2));
      if (typeof data == 'string') data = strToBuffer(data);

      if (data.length) {
        var z = z;
      }

      var len = data.size || data.byteLength || data.length;
      var zeroes = Math.ceil(Math.ceil(Math.log(len) / Math.log(2)) / 8);
      var size_str = len.toString(2);
      var padded = (new Array((zeroes * 7 + 7 + 1) - size_str.length)).join('0') + size_str;
      var size = (new Array(zeroes)).join('0') + '1' + padded;

      //i actually dont quite understand what went on up there, so I'm not really
      //going to fix this, i'm probably just going to write some hacky thing which
      //converts that string into a buffer-esque thing

      ebml.push(numToBuffer(json[i].id));
      ebml.push(bitsToBuffer(size));
      ebml.push(data)


    }

    //output as blob or byteArray
    if (outputAsArray) {
      //convert ebml to an array
      var buffer = toFlatArray(ebml)
      return new Uint8Array(buffer);
    } else {
      return new Blob(ebml, {
        type: "video/webm"
      });
    }
  }

  function toFlatArray(arr, outBuffer) {
    if (outBuffer == null) {
      outBuffer = [];
    }
    for (var i = 0; i < arr.length; i++) {
      if (typeof arr[i] == 'object') {
        //an array
        toFlatArray(arr[i], outBuffer)
      } else {
        //a simple element
        outBuffer.push(arr[i]);
      }
    }
    return outBuffer;
  }

  //OKAY, so the following two functions are the string-based old stuff, the reason they're
  //still sort of in here, is that they're actually faster than the new blob stuff because
  //getAsFile isn't widely implemented, or at least, it doesn't work in chrome, which is the
  // only browser which supports get as webp

  //Converting between a string of 0010101001's and binary back and forth is probably inefficient
  //TODO: get rid of this function

  function toBinStr_old(bits) {
    var data = '';
    var pad = (bits.length % 8) ? (new Array(1 + 8 - (bits.length % 8))).join('0') : '';
    bits = pad + bits;
    for (var i = 0; i < bits.length; i += 8) {
      data += String.fromCharCode(parseInt(bits.substr(i, 8), 2))
    }
    return data;
  }

  function generateEBML_old(json) {
    var ebml = '';
    for (var i = 0; i < json.length; i++) {
      var data = json[i].data;
      if (typeof data == 'object') data = generateEBML_old(data);
      if (typeof data == 'number') data = toBinStr_old(data.toString(2));

      var len = data.length;
      var zeroes = Math.ceil(Math.ceil(Math.log(len) / Math.log(2)) / 8);
      var size_str = len.toString(2);
      var padded = (new Array((zeroes * 7 + 7 + 1) - size_str.length)).join('0') + size_str;
      var size = (new Array(zeroes)).join('0') + '1' + padded;

      ebml += toBinStr_old(json[i].id.toString(2)) + toBinStr_old(size) + data;

    }
    return ebml;
  }

  //woot, a function that's actually written for this project!
  //this parses some json markup and makes it into that binary magic
  //which can then get shoved into the matroska comtainer (peaceably)

  function makeSimpleBlock(data) {
    var flags = 0;
    if (data.keyframe) flags |= 128;
    if (data.invisible) flags |= 8;
    if (data.lacing) flags |= (data.lacing << 1);
    if (data.discardable) flags |= 1;
    if (data.trackNum > 127) {
      throw "TrackNumber > 127 not supported";
    }
    var out = [data.trackNum | 0x80, data.timecode >> 8, data.timecode & 0xff, flags].map(function (e) {
      return String.fromCharCode(e)
    }).join('') + data.frame;

    return out;
  }

  // here's something else taken verbatim from weppy, awesome rite?

  function parseWebP(riff) {
    var VP8 = riff.RIFF[0].WEBP[0];

    var frame_start = VP8.indexOf('\x9d\x01\x2a'); //A VP8 keyframe starts with the 0x9d012a header
    for (var i = 0, c = []; i < 4; i++) c[i] = VP8.charCodeAt(frame_start + 3 + i);

    var width, horizontal_scale, height, vertical_scale, tmp;

    //the code below is literally copied verbatim from the bitstream spec
    tmp = (c[1] << 8) | c[0];
    width = tmp & 0x3FFF;
    horizontal_scale = tmp >> 14;
    tmp = (c[3] << 8) | c[2];
    height = tmp & 0x3FFF;
    vertical_scale = tmp >> 14;
    return {
      width: width,
      height: height,
      data: VP8,
      riff: riff
    }
  }

  // i think i'm going off on a riff by pretending this is some known
  // idiom which i'm making a casual and brilliant pun about, but since
  // i can't find anything on google which conforms to this idiomatic
  // usage, I'm assuming this is just a consequence of some psychotic
  // break which makes me make up puns. well, enough riff-raff (aha a
  // rescue of sorts), this function was ripped wholesale from weppy

  function parseRIFF(string) {
    var offset = 0;
    var chunks = {};

    while (offset < string.length) {
      var id = string.substr(offset, 4);
      var len = parseInt(string.substr(offset + 4, 4).split('').map(function (i) {
        var unpadded = i.charCodeAt(0).toString(2);
        return (new Array(8 - unpadded.length + 1)).join('0') + unpadded
      }).join(''), 2);
      var data = string.substr(offset + 4 + 4, len);
      offset += 4 + 4 + len;
      chunks[id] = chunks[id] || [];

      if (id == 'RIFF' || id == 'LIST') {
        chunks[id].push(parseRIFF(data));
      } else {
        chunks[id].push(data);
      }
    }
    return chunks;
  }

  // here's a little utility function that acts as a utility for other functions
  // basically, the only purpose is for encoding "Duration", which is encoded as
  // a double (considerably more difficult to encode than an integer)

  function doubleToString(num) {
    return [].slice.call(
    new Uint8Array(
    (
    new Float64Array([num]) //create a float64 array
    ).buffer) //extract the array buffer
    , 0) // convert the Uint8Array into a regular array
    .map(function (e) { //since it's a regular array, we can now use map
      return String.fromCharCode(e) // encode all the bytes individually
    })
      .reverse() //correct the byte endianness (assume it's little endian for now)
    .join('') // join the bytes in holy matrimony as a string
  }

  function WhammyVideo(speed, quality) { // a more abstract-ish API
    this.frames = [];
    this.duration = 1000 / speed;
    this.quality = quality || 0.8;
  }

  WhammyVideo.prototype.add = function (frame, duration) {
    if (typeof duration != 'undefined' && this.duration) throw "you can't pass a duration if the fps is set";
    if (typeof duration == 'undefined' && !this.duration) throw "if you don't have the fps set, you ned to have durations here."
    if ('canvas' in frame) { //CanvasRenderingContext2D
      frame = frame.canvas;
    }
    if ('toDataURL' in frame) {
      frame = frame.toDataURL('image/webp', this.quality)
    } else if (typeof frame != "string") {
      throw "frame must be a a HTMLCanvasElement, a CanvasRenderingContext2D or a DataURI formatted string"
    }
    if (!(/^data:image\/webp;base64,/ig).test(frame)) {
      throw "Input must be formatted properly as a base64 encoded DataURI of type image/webp";
    }
    this.frames.push({
      image: frame,
      duration: duration || this.duration
    })
  }

  WhammyVideo.prototype.compile = function (outputAsArray) {
    return new toWebM(this.frames.map(function (frame) {
      var webp = parseWebP(parseRIFF(atob(frame.image.slice(23))));
      webp.duration = frame.duration;
      return webp;
    }), outputAsArray)
  }

  return {
    Video: WhammyVideo,
    fromImageArray: function (images, fps, outputAsArray) {
      return toWebM(images.map(function (image) {
        var webp = parseWebP(parseRIFF(atob(image.slice(23))))
        webp.duration = 1000 / fps;
        return webp;
      }), outputAsArray)
    },
    toWebM: toWebM
    // expose methods of madness
  }
})()

});
require.register("recorder/dist/main.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.2
var Emitter, Recorder, Whammy, blobToUri, saveURL, trigger, wrapper,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Emitter = require('emitter');

trigger = require('trigger-event');

Whammy = require('whammy');

saveURL = function(file, uri) {
  var link;

  link = document.createElement("a");
  link.href = uri;
  link.target = "_blank";
  link.download = file;
  trigger(link, "click");
};

blobToUri = function(blob, cb) {
  var reader;

  reader = new FileReader;
  reader.readAsDataURL(blob);
  return reader.onload = function(event) {
    return cb(event.target.result);
  };
};

Recorder = (function(_super) {
  __extends(Recorder, _super);

  function Recorder(el, fps) {
    this.fps = fps != null ? fps : 32;
    this.clear = __bind(this.clear, this);
    this.toBlob = __bind(this.toBlob, this);
    this.toDataURL = __bind(this.toDataURL, this);
    this.stop = __bind(this.stop, this);
    this.save = __bind(this.save, this);
    this.start = __bind(this.start, this);
    this.grab = __bind(this.grab, this);
    if (el.jquery) {
      this.height = el.height();
      this.width = el.width();
      this.el = el[0];
    } else {
      this.height = el.clientHeight;
      this.width = el.clientWidth;
      this.el = el;
    }
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.canvas.height = this.height;
    this.canvas.width = this.width;
    this.interval = 1000 / this.fps;
    this.frames = [];
    this._requested = null;
    this.delta = null;
    this.then = Date.now();
    this.now = null;
  }

  Recorder.prototype.grab = function() {
    var uri;

    this._requested = requestAnimationFrame(this.grab);
    this.now = Date.now();
    this.delta = this.now - this.then;
    if (this.delta > this.interval) {
      this.then = this.now - (this.delta % this.interval);
      this.context.drawImage(this.el, 0, 0, this.width, this.height);
      uri = this.canvas.toDataURL('image/webp', 1);
      this.frames.push(uri);
      this.emit("frame", uri);
    }
    return this;
  };

  Recorder.prototype.start = function() {
    this.grab();
    return this;
  };

  Recorder.prototype.save = function(fileName) {
    if (fileName == null) {
      fileName = "recording.webm";
    }
    this.toDataURL(function(err, uri) {
      return saveURL(fileName, uri);
    });
    return this;
  };

  Recorder.prototype.stop = function() {
    cancelAnimationFrame(this._requested);
    return this;
  };

  Recorder.prototype.toDataURL = function(cb) {
    return this.toBlob(function(err, blob) {
      if (err != null) {
        return cb(err);
      }
      return blobToUri(blob, function(uri) {
        return cb(null, uri);
      });
    });
  };

  Recorder.prototype.toBlob = function(cb) {
    var blob;

    blob = Whammy.fromImageArray(this.frames, this.fps);
    return cb(null, blob);
  };

  Recorder.prototype.clear = function() {
    this.frames = [];
    return this;
  };

  return Recorder;

})(Emitter);

wrapper = function(el) {
  return new Recorder(el);
};

wrapper.Recorder = Recorder;

module.exports = wrapper;

});
require.alias("component-emitter/index.js", "recorder/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("adamsanderson-trigger-event/index.js", "recorder/deps/trigger-event/index.js");
require.alias("component-inherit/index.js", "adamsanderson-trigger-event/deps/inherit/index.js");

require.alias("Contra-whammy/whammy.js", "recorder/deps/whammy/whammy.js");
require.alias("Contra-whammy/whammy.js", "recorder/deps/whammy/index.js");
require.alias("Contra-whammy/whammy.js", "Contra-whammy/index.js");

require.alias("recorder/dist/main.js", "recorder/index.js");

if (typeof exports == "object") {
  module.exports = require("recorder");
} else if (typeof define == "function" && define.amd) {
  define(function(){ return require("recorder"); });
} else {
  window["recorder"] = require("recorder");
}})();