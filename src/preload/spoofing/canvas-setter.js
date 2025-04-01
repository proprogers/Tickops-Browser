/* global window, HTMLCanvasElement, CanvasRenderingContext2D, WebGLRenderingContext, WebGL2RenderingContext */

const colorStatistics = require('./color-statistics');
const webgl = require('./webgl');

let bitSet;

const original = {
  toDataURL: HTMLCanvasElement.prototype.toDataURL,
  toBlob: HTMLCanvasElement.prototype.toBlob,
  getImageData: CanvasRenderingContext2D.prototype.getImageData,
  isPointInPath: CanvasRenderingContext2D.prototype.isPointInPath,
  isPointInStroke: CanvasRenderingContext2D.prototype.isPointInStroke,
  fillText: CanvasRenderingContext2D.prototype.fillText,
  strokeText: CanvasRenderingContext2D.prototype.strokeText,
  readPixels: WebGLRenderingContext.prototype.readPixels,
  getParameter: WebGLRenderingContext.prototype.getParameter,
  readPixels2: WebGL2RenderingContext.prototype.readPixels,
  getParameter2: WebGL2RenderingContext.prototype.getParameter,
};

function prefs(name) {
  const defaults = {
    useCanvasCache: true,
    ignoreFrequentColors: 0,
    minColors: 0,
    fakeAlphaChannel: false,
  }
  return defaults[name];
}

function set(canvasSeedEncoded) {
  const seed = [];
  for (let count = 0, char; count < canvasSeedEncoded.length; count++) {
    char = canvasSeedEncoded.charCodeAt(count);
    seed.push(char);
  }
  bitSet = new Uint32Array(seed);

  Object.defineProperties(HTMLCanvasElement.prototype, {
    toDataURL: {
      value: function toDataURL() {
        const canvas = getFakeCanvas(this);
        return original.toDataURL.call(canvas, ...arguments);
      }
    },
    toBlob: {
      value: function toBlob() {
        const canvas = getFakeCanvas(this);
        return original.toBlob.call(canvas, ...arguments);
      }
    }
  });

  Object.defineProperties(CanvasRenderingContext2D.prototype, {
    getImageData: {
      // eslint-disable-next-line no-unused-vars
      value: function getImageData(sx, sy, sw, sh) {
        let fakeCanvas;
        let context = this;
        if (context && context.canvas) {
          fakeCanvas = getFakeCanvas(context.canvas);
        }
        if (fakeCanvas && fakeCanvas !== context.canvas) {
          context = window.HTMLCanvasElement.prototype.getContext.call(fakeCanvas, '2d');
        }
        return original.getImageData.call(context, ...arguments);
      }
    },
    isPointInPath: {
      value: function isPointInPath(x, y) {
        const rng = getValueRng();
        const originalValue = original.isPointInPath.call(this, ...arguments);
        if ((typeof originalValue) !== 'boolean') {
          return originalValue;
        }
        const index = x + this.width * y;
        return original.isPointInPath.call(this, rng(x, index), rng(y, index), arguments[2]);
      }
    },
    isPointInStroke: {
      value: function isPointInStroke(x, y) {
        const rng = getValueRng();
        const originalValue = original.isPointInStroke.call(this, ...arguments);
        if ((typeof originalValue) !== 'boolean') {
          return originalValue;
        }
        const index = x + this.width * y;
        if (!(x instanceof window.Path2D)) {
          return original.isPointInStroke.call(this, rng(x, index), rng(y, index));
        }
        const path = x;
        x = y;
        y = arguments[2];
        return original.isPointInStroke.call(this, path, rng(x, index), rng(y, index));
      }
    },
    fillText: {
      // eslint-disable-next-line no-unused-vars
      value: function fillText(str, x, y) {
        return mixOnInputCallback('fillText', this, arguments);
      }
    },
    strokeText: {
      // eslint-disable-next-line no-unused-vars
      value: function strokeText(str, x, y) {
        return mixOnInputCallback('strokeText', this, arguments);
      }
    },
  });

  webgl.initializeParameterDefinitions();

  const webGlProperties = {
    readPixels: {
      // eslint-disable-next-line no-unused-vars
      value: function (x, y, width, height, format, type, pixels) {
        const fakeCanvas = getFakeCanvas(this.canvas);
        const webGLVersion = this instanceof window.WebGLRenderingContext ? 'webgl' : 'webgl2';
        const context = webgl.copyCanvasToWebgl(fakeCanvas, webGLVersion);
        const originalFuncRefName = webGLVersion === 'webgl' ? 'readPixels' : 'readPixels2';
        return original[originalFuncRefName].call(context || this, ...arguments);
      }
    },
    getParameter: {
      value: function (pname) {
        const originalFuncRefName = this instanceof window.WebGLRenderingContext ? 'getParameter' : 'getParameter2';
        const originalValue = original[originalFuncRefName].call(this, ...arguments);
        const definition = webgl.parameterChangeDefinition[pname];
        if (!definition) return originalValue;
        return definition.fake(originalValue, getRng(bitSet), getBitRng(bitSet));
      }
    }
  };

  Object.defineProperties(WebGLRenderingContext.prototype, webGlProperties);
  Object.defineProperties(WebGL2RenderingContext.prototype, webGlProperties);
}

function getContext(canvas) {
  return window.HTMLCanvasElement.prototype.getContext.call(canvas, '2d') ||
    window.HTMLCanvasElement.prototype.getContext.call(canvas, 'webgl') ||
    window.HTMLCanvasElement.prototype.getContext.call(canvas, 'experimental-webgl') ||
    window.HTMLCanvasElement.prototype.getContext.call(canvas, 'webgl2') ||
    window.HTMLCanvasElement.prototype.getContext.call(canvas, 'experimental-webgl2');
}

function getImageData(context) {
  let imageData;
  let source;
  if ((context.canvas.width || 0) * (context.canvas.height || 0) === 0) {
    imageData = new ((window.wrappedJSObject || window).ImageData)(0, 0);
    source = new ((window.wrappedJSObject || window).ImageData)(0, 0);
  } else if (context instanceof window.CanvasRenderingContext2D) {
    imageData = original.getImageData.call(context, 0, 0, context.canvas.width, context.canvas.height);
    source = imageData.data;
  } else {
    imageData = new ((window.wrappedJSObject || window).ImageData)(context.canvas.width, context.canvas.height);
    source = new Uint8Array(imageData.data.length);
    const originalFuncRefName = context instanceof window.WebGLRenderingContext ? 'readPixels' : 'readPixels2';
    original[originalFuncRefName].call(
      context,
      0, 0, context.canvas.width, context.canvas.height,
      context.RGBA, context.UNSIGNED_BYTE,
      source
    );
  }
  return { imageData, source };
}

const canvasCache = Object.create(null);

function getFakeCanvas(originalCanvas) {
  try {
    let originalDataURL;
    if (prefs('useCanvasCache')) {
      originalDataURL = original.toDataURL.call(originalCanvas);
      const cached = canvasCache[originalDataURL];
      if (cached) {
        return cached;
      }
    }
    // original may not be a canvas -> we must not leak an error
    let context = getContext(originalCanvas);
    const { imageData, source } = getImageData(context);
    const desc = imageData.data;
    const length = desc.length;

    let ignoredColors = {};
    let statistic;
    if (prefs('ignoreFrequentColors')) {
      statistic = colorStatistics.compute(source);
      ignoredColors = statistic.getMaxColors(prefs('ignoreFrequentColors'));
    }
    if (prefs('minColors')) {
      if (!colorStatistics.hasMoreColors(source, prefs('minColors'), statistic)) {
        return originalCanvas;
      }
    }

    const fakeAlphaChannel = prefs('fakeAlphaChannel');
    const rng = getPixelRng(ignoredColors);
    for (let i = 0; i < length; i += 4) {
      const [r, g, b, a] = rng(
        source[i + 0],
        source[i + 1],
        source[i + 2],
        source[i + 3],
        i / 4
      );
      desc[i + 0] = r;
      desc[i + 1] = g;
      desc[i + 2] = b;
      desc[i + 3] = fakeAlphaChannel ? a : source[i + 3];
    }
    const canvas = originalCanvas.cloneNode(true);
    context = window.HTMLCanvasElement.prototype.getContext.call(canvas, '2d');
    context.putImageData(imageData, 0, 0);
    if (prefs('useCanvasCache')) {
      canvasCache[originalDataURL] = canvas;
      canvasCache[original.toDataURL.call(canvas)] = canvas;
    }
    return canvas;
  } catch (e) {
    console.error('Error while faking:', e);
    return originalCanvas;
  }
}

function randomMixImageData(imageData1, imageData2) {
  const data1 = imageData1.data;
  const data2 = imageData2.data;
  const l = data1.length;
  if (l === data2.length) {
    const rng = getPixelRng(l);

    for (let i = 0; i < l; i += 4) {
      const signR = data1[i + 0] > data2[i + 0] ? -1 : 1;
      const signG = data1[i + 1] > data2[i + 1] ? -1 : 1;
      const signB = data1[i + 2] > data2[i + 2] ? -1 : 1;
      const signA = data1[i + 3] > data2[i + 3] ? -1 : 1;

      const [deltaR, deltaG, deltaB, deltaA] = rng(
        signR * (data2[i + 0] - data1[i + 0]),
        signG * (data2[i + 1] - data1[i + 1]),
        signB * (data2[i + 2] - data1[i + 2]),
        signA * (data2[i + 3] - data1[i + 3]),
        i / 4
      );
      data2[i + 0] = data1[i + 0] + signR * deltaR;
      data2[i + 1] = data1[i + 1] + signG * deltaG;
      data2[i + 2] = data1[i + 2] + signB * deltaB;
      data2[i + 3] = data1[i + 3] + signA * deltaA;
    }
  }
  return imageData2;
}

function mixOnInputCallback(originalName, context, args) {
  let oldImageData;
  try {
    // "this" is not trustable - it may be not a context
    oldImageData = getImageData(context).imageData;
  } catch (error) {
    // nothing to do here
  }
  // if "this" is not a correct context the next line will throw an error
  const ret = original[originalName].call(context, ...args);
  const newImageData = getImageData(context).imageData;
  context.putImageData(randomMixImageData(oldImageData, newImageData), 0, 0);
  return ret;
}

function getRng(b = bitSet) {
  const bitSetLength = b.length;
  return function (i) {
    return b[i % bitSetLength];
  };
}

function getBitRng(b = bitSet) {
  return function (value, i) {
    // use the last 7 bits from the value for the index of the
    // random number
    const index = value & 0x7F;

    // use the last 3 bits from the position and the first bit from
    // from the value to get bit to use from the random number
    const bitIndex = ((i & 0x03) << 1) | (value >>> 7);

    // extract the bit
    return (b[index] >>> bitIndex) & 0x01;
  };
}

function getValueRng() {
  const rng = getBitRng();
  return function (value, i) {
    const rnd = rng(value, i);

    // XOR the last bit to alter it... or not
    return value ^ (rnd & 0x01);
  };
}

function getPixelRng(ignoredColors) {
  const rng = getValueRng();
  return function (r, g, b, a, i) {
    const index = String.fromCharCode(r, g, b, a);
    if (ignoredColors[index]) {
      return [r, g, b, a];
    }
    const baseIndex = i * 4;
    return [
      rng(r, baseIndex + 0),
      rng(g, baseIndex + 1),
      rng(b, baseIndex + 2),
      rng(a, baseIndex + 3)
    ];
  };
}

module.exports = { set };
