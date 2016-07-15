/*!
	pngtoy version 0.5.0 ALPHA

	By Epistemex (c) 2015-2016
	www.epistemex.com
	MIT License (this header required)
*/

/**
 * Creates a new PngToy object which is used to load a PNG image off the
 * network as raw file. It provides methods to extract chunks as parsed
 * objects as well as decompressing, decoding and filtering the bitmap.
 * @param {object} options - options
 * @param {boolean} [options.doCRC=true] - enable/disable CRC-32 check for chunks (useful for repairing PNG files)
 * @param {boolean} [options.allowInvalid=false] - less strict passing allowing invalid data/chunks (useful for repairing PNG files)
 * @param {function} [options.beforeSend] - callback allowing setting headers before making xhr request.
 * @constructor
 */
function PngToy(options) {

	options = options || {};

	this.doCRC = isBool(options.doCRC) ? options.doCRC : true;
	this.allowInvalid = isBool(options.allowInvalid) ? options.allowInvalid : false;
	this.beforeSend = options.beforeSend || function(xhr) {};

	/**
	 * The URL that has been fetched.
	 * @type {null|string}
	 */
	this.url = null;

	/**
	 * The fetched buffer (the raw file bytes).
	 * @type {null|ArrayBuffer}
	 */
	this.buffer = null;							// raw file

	/**
	 * The view used for the file buffer.
	 * @type {null|DataView}
	 */
	this.view = null;

	/**
	 * Array holding all the chunks objects. These can be used to manually
	 * parse the file.
	 * @type {null|Array}
	 */
	this.chunks = null;

	this.debug = {};

	function isBool(b) {return typeof b === "boolean"}
}

PngToy.prototype = {

	/**
	 * Start loading a PNG image from an URL. CORS restrictions apply.
	 * It will call the resolve function with a bitmap representing the
	 * raw unfiltered bitmap. Pass this bitmap object to decode() to get
	 * a raw filtered bitmap, and further to convert() to get a RGBA
	 * bitmap.
	 *
	 * @param {string} url - url to PNG image
	 * @returns {Promise}
	 */
	fetch: function(url) {

		var me = this;
		me.url = url;
		me.buffer =
		me.chunks =
		me.view = null;
		me._pos = 0;

		return new Promise(function(resolve, reject) {
			try {
				var xhr = new XMLHttpRequest();
				xhr.open("GET", url, true);
				xhr.responseType = "arraybuffer";
				me.beforeSend(xhr);
				xhr.onerror = function(e) {reject("Network error. " + e.message)};
				xhr.onload = function() {
					if (xhr.status === 200) {
						var view = new DataView(xhr.response),
							chunkO;
						if (view.getUint32(0) === 0x89504E47 && view.getUint32(4) === 0x0D0A1A0A) {
							me.buffer = view.buffer;
							me.view = view;
							chunkO = PngToy._getChunks(me.buffer, me.view, me.doCRC, me.allowInvalid);
							me.chunks = chunkO.chunks || null;
							if (me.chunks || me.allowInvalid)
								resolve();
							else
								reject(chunkO.error);
						}
						else {
							reject("Not a PNG file.");
						}
					}
					else reject("Loading error:" + xhr.statusText);
				};
				xhr.send();
			}
			catch(err) {reject(err.message)}
		})
	},

	/**
	 * Get a parsed version of the named chunk. An object is returned
	 * with properties representing the specifics of this chunk. If no
	 * chunks are present null will be returned.
	 * @returns {*|null}
	 */
	getChunk: function(chunkName) {
		var chunks = [
			"IHDR", "IDAT", "PLTE", "sPLT", "tRNS", "iTXt", "tEXt", "zTXt",
			"iCCP", "gAMA", "cHRM", "sRGB", "hIST", "sBIT", "pHYs", "bKGD",
			"tIME", "oFFs", "sTER", "sCAL", "pCAL", "IEND"];

		if (chunks.indexOf(chunkName) > -1) {
			return chunkName === "IEND" ?
				   !!PngToy._findChunk(this.chunks, "IEND") : PngToy["_" + chunkName](this);
		}
		else {
			return PngToy._findChunk(this.chunks, chunkName)
		}
	},

	/*
	Conversion and misc
	 */

	/**
	 * Converts current data into a standard Image object.
	 * @returns {Promise}
	 * @private
	 */
	/*toImage: function() {
		return new Promise(function(resolve, reject) {

			// todo create data-uri of array, image, onload/error/abort

		})
	},*/

	/**
	 * Creates a look-up table (LUT) for the provided file gamma, and
	 * optionally display and user gamma. Display gamma is usually either
	 * 2.2 (Windows, Linux) or 1.8 (Mac). It is used internally but is
	 * provided if you want to apply gamma to the bitmap manually.
	 *
	 * NOTE that this LUT table is limited to 8-bit values.
	 *
	 * @param {number} [fileGamma=1]
	 * @param {number} [dispGamma=2.2]
	 * @param {number} [userGamma=1]
	 * @returns {Uint8Array}
	 */
	getGammaLUT: function(fileGamma, dispGamma, userGamma) {

		fileGamma = fileGamma || 1;
		dispGamma = dispGamma || 2.2;
		userGamma = userGamma || 1;

		var buffer = new Uint8Array(256), i = 0,
			gamma =  1 / (fileGamma * dispGamma * userGamma);

		for(; i < 256; i++) buffer[i] = (Math.pow(i / 255, gamma) * 255 + 0.5)|0;
		return buffer
	},

	/**
	 * Guess the display gamma on this system, usually 2.2 (Windows, Linux)
	 * or 1.8 (Mac). If unable to detect system a default of 2.2 will be used.
	 * This is used when a raw bitmap is converted to a RGBA bitmap and
	 * gamma is enabled.
	 * @returns {number}
	 */
	guessDisplayGamma: function() {
		return (navigator.userAgent.indexOf("Mac OS") > -1) ? 1.8 : 2.2;
	}
};

PngToy._blockSize = 3000000;
PngToy._delay = 7;
