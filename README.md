pngtoy
======

Low-level implementation of PNG file parser/reader/decoder using JavaScript
on client size.

*Why this when browsers already parses PNG files?*

The browser will simply load and convert any PNG type into RGBA bitmaps.
It may also apply ICC and gamma correction to the image resulting in
different pixel values than in the original bitmap.

**pngtoy** is for special case scenarios where you need to work with the
original bitmap as-is (ie. no gamma, no ICC, indexed, 16-bit etc.) and
you need the original pixel values and format. This will also keep the bitmap values
consistent across browsers as some browser support ICC, gamma, others don't.

**pngtoy** can also be used to analyse PNG files, extract special information
such as header, chunks, texts, or to reduce file size, or as a tool to in
an attempt to repair a PNG file, add or remove chunks, and so forth.

**pngtoy** will allow you to work directly with, for example 16-bit greyscale
bitmap buffers as well as other formats such as bit-planes (you can still
convert the bitmap to RGBA bitmap or canvas).

**pngtoy** attempts to read all formats specified by the W3C standard (* interlaced
not currently supported).

**pngtoy** can also be used to clean up PNG files by stripping unnecessary
chunks and rebuild a file you can save as new.

**pngtoy** let you just parse the chunks without decompressing and decoding
any data.

**pngtoy** do currently not *encode* PNG files, but works only with existing
PNG files and content (chunks can be constructed manually and added - * build
tools not available in alpha).

**Coming: pngexp - save optimized PNG files.**


Features
--------

- Supports 8-bit, 16-bit, indexed, bit-planes, greyscale, rgb, rgba, transparency and (interlaced).
- Strict parsing conforming to the standard (can be turned off for error correction purposes)
- CRC-checking for each chunk (can be turned off for error correction purposes)
- Using typed arrays for best performance
- Fast gzip implementation (pako)
- Non UI-blocking asynchronous block based decoding and format converting
- Access to chunks without the need to decompress or decode bitmaps
- Access to all stages (raw unfiltered buffer, filtered original format, converted to RGBA)
- Apply gamma to converted bitmap (file, display and optional user gamma)
- Handles aspect ratio correctly (pHYs chunk) (can be disabled)
- Parses compressed ancillary chunks and fields
- Parses extended chunks such as oFFs, sCAL, pCAL, sTER
- Uses promises (use Promise polyfill for IE)
- Can be used in attempt to rescue corrupted PNG files

Run the PNG test suit from the tests directory to see current status/rendering (must run
from localhost in some browsers due to CORS restrictions). See known issues below.


Install
-------

**pngtoy** can be installed in various ways:

- Bower `bower install pngtoy`
- Git using HTTPS: `git clone https://github.com/epistemex/pngtoy.git`
- Git using SSH: `git clone git@github.com:epistemex/pngtoy.git`
- Download [zip archive](https://github.com/epistemex/pngtoy/archive/master.zip) and extract.
- [pngtoy.min.js](https://raw.githubusercontent.com/epistemex/pngtoy/master/pngtoy.min.js)


Usage
-----

Create a new and reusable instance of pngtoy parser:

    var pngtoy = new PngToy([options]);

Invoke asynchronous fetching of file using a promise:

    pngtoy.fetch("http://url.to/png.file").then( ... );

Now you can extract the information you like from the current PNG file:

    // get and parse chunks
    var chunks = pngtoy.getChunks();        	   // chunk list - does not decode any data

    // parse individual chunks to object (all official chunks are supported)
    var ihdr = pngtoy.get_IHDR();            	   // return object for parsed IHDR chunk
    var raw = pngtoy.get_IDAT();             	   // get unfiltered but uncompressed bitmap data
    var palette = pngtoy.get_PLTE();               // get parsed palette if exists, or null
    var texts = pngtoy.get_zTXt();                 // get array with parsed and uncompressed zTXt objects
    var stereo = pngtoy.get_sTER();                // get stereo mode if stereo image
    ...

    // decode
    pngtoy.decode(options).then( ...) ;            // get decoded bitmap in original depth and type
    pngtoy.bitmapToCanvas(bmp, options).then(...)  // convert to canvas and apply optional gamma

See also the `PngImage` object.

NOTE: ALPHA version - API may change, see tests for current examples.


Known issues (alpha)
--------------------

- Interlace (Adam7) mode is currently not implemented


Credits
-------

- The [pako inflate decompression code](https://github.com/nodeca/pako) was written by Andrey Tupitsin (@anrd83) and Vitaly Puzrin (@puzrin)
- The [Promise polyfill](https://github.com/taylorhakes/promise-polyfill) (optional) by @taylorhakes


Contributors
------------

See contributor list [here](https://github.com/epistemex/pngtoy/graphs/contributors).


License
-------

Released under [MIT license](http://choosealicense.com/licenses/mit/). You may use this class in both commercial and non-commercial projects provided that full header (minified and developer versions) is included.


*&copy; 2015-2016 Epistemex*

![Epistemex](http://i.imgur.com/wZSsyt8.png)
