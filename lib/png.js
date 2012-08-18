// Copyright (c) 2012 Kuba Niegowski
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';


var util = require('util'),
    Parser = require('./parser');


var PNG = exports.PNG = function(options) {
    Parser.call(this, options);

    this.width = options.width || 0;
    this.height = options.height || 0;

    this.data = this.width > 0 && this.height > 0
            ? new Buffer(4 * this.width * this.height) : null;

    this.on('metadata', this._metadata.bind(this));

    this.readable = this.writable = true;
    this._buffers = [];
    this._buffLen = 0;

    this.on('parsed', function(data) {
        this.data = data;
    }.bind(this));
};
util.inherits(PNG, Parser);


PNG.prototype.pack = function() {
    this._pack(this.width, this.height, this.data);
};


PNG.prototype.parse = function(data, callback) {

    if (callback) {
        var onParsed = null, onError = null;

        this.once('parsed', onParsed = function(data) {
            this.removeListener('error', onError);

            this.data = data;
            callback(null, this);

        }.bind(this));

        this.once('error', onError = function(err) {
            this.removeListener('parsed', onParsed);

            callback(err, null);
        }.bind(this));
    }

    this._parse(data);
};

PNG.prototype.write = function(data) {
    this._buffers.push(data);
    this._buffLen += data.length;
};

PNG.prototype.end = function(data) {
    if (data) this.write(data);
    this._parse(Buffer.concat(this._buffers, this._buffLen));
    this._buffers = [];
    this._buffLen = 0;
};

PNG.prototype._metadata = function(width, height) {
    this.width = width;
    this.height = height;
    this.data = null;
};