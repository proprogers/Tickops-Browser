/* global window, navigator, location, MimeType, MimeTypeArray Plugin, PluginArray, HTMLAudioElement, HTMLVideoElement, MediaDevices, NavigatorUAData */
const TimezoneSetter = require('./timezone-setter');
const CanvasSetter = require('./canvas-setter');
const ScreenSetter = require('./screen-setter');
const { NEW_TAB } = require('@/common/consts');
const deviceMap = require('./device-setup');

const spoofedFunctionsMap = new Map();

function set(data, proxyDevice) {
  // if (!data.partition) return;
  delete Object.getPrototypeOf(navigator).webdriver;
  proxyDevice = "macos"
  const deviceKey = proxyDevice.toLowerCase();
  const deviceConfig = deviceMap[deviceKey] || deviceMap.windows;
  Object.defineProperty(navigator, 'userAgent', {
    get: () => deviceConfig.userAgent
  });

  Object.defineProperty(navigator, 'platform', {
    get: () => deviceConfig.platform
  });

  Object.defineProperty(navigator, 'hardwareConcurrency', {
    get: () => 8
  });

  Object.defineProperty(navigator, 'deviceMemory', {
    get: () => 16
  });

  Object.defineProperty(navigator, 'vendor', {
    get: () => deviceConfig.vendor
  });
  Object.defineProperty(screen, 'colorDepth', {
    get: () => 24
  });

  Object.defineProperty(navigator, 'maxTouchPoints', {
    get: () => 0
  });

  Object.defineProperty(navigator, 'plugins', {
    get: () => [
      { name: 'Chrome PDF Viewer' },
      { name: 'WebRTC Plug-in' }
    ]
  });

  Object.defineProperty(navigator, 'userAgentData', {
    get() {
      const lowEntropyValues = {
        brands: [
          { brand: 'Chromium', version: '130' },
          { brand: 'Not_A Brand', version: '99' },
          { brand: 'Google Chrome', version: '130' }
        ],
        mobile: false
      };

      const highEntropyValues = {
        ...lowEntropyValues,
        architecture: data.architecture || 'x86_64',
        uaFullVersion: data.uaFullVersion || '130.0.6723.152',
        platform: deviceConfig.userAgentDataPlatform,
        bitness: data.bitness || '64',
        model: ''
      };

      return {
        ...lowEntropyValues,
        getHighEntropyValues: async (array) => {
          if (!Array.isArray(array)) {
            throw new TypeError(`Failed to execute 'getHighEntropyValues': Invalid argument.`);
          }
          return array.reduce((acc, name) => {
            acc[name] = highEntropyValues[name];
            return acc;
          }, {});
        },
        toJSON: () => lowEntropyValues
      };
    }
  });

  // Object.defineProperty(screen, 'availHeight', {
  //     get: () => 1080
  // });

  Object.defineProperty(screen, 'width', {
    get: () => 1920
  });

  Object.defineProperty(screen, 'height', {
    get: () => 1080
  });

  Object.defineProperty(screen, 'availWidth', {
    get: () => 1920
  });

  Object.defineProperty(screen, 'availHeight', {
    get: () => 1080
  });

  // Object.defineProperty(screen, 'colorDepth', {
  //   get: () => 24
  // });

  const spoofWebGL = () => {
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(param) {
      if (param === 37446) return 'Google Inc.';
      if (param === 37445) return 'ANGLE (Intel, Intel(R) UHD Graphics, D3D11)';
      return getParameter.call(this, param);
    };
  };
  spoofWebGL();

  const canvas = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function() {
    return canvas.call(this).replace('data:image/png;base64,', 'data:image/jpeg;base64,');
  };

  const enumerateDevices = () => {
      return new Promise((resolve) => {
          setTimeout(() => resolve(data.devices || []), 100);
      });
  };

  if (navigator.mediaDevices) {
      Object.defineProperty(MediaDevices.prototype, 'enumerateDevices', {
          value: enumerateDevices
      });
      spoofedFunctionsMap.set(enumerateDevices, true);
  }

  const originalToString = Function.prototype.toString;
  if (spoofedFunctionsMap.size) {
    Object.defineProperty(Function.prototype, 'toString', {
      value: function toString() {
        const nativeString = '{ [native code] }';
        return spoofedFunctionsMap.has(this) ? `function ${this.name}() ${nativeString}` : originalToString.call(this);
      }
    });
  }

  if (data.timezone) {
    TimezoneSetter.set(data.timezone);
  }

  if (data.canvasSeed) {
    CanvasSetter.set(data.canvasSeed);
  }

  ScreenSetter.set(data);

  if (data.timezone) {
      TimezoneSetter.set(data.timezone);
  }

  if (data.canvasSeed) {
      CanvasSetter.set(data.canvasSeed);
  }

  ScreenSetter.set(data);

  const cwGetter = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow').get;
  Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', {
      get() {
          const contentWindow = cwGetter.call(this, arguments);
          return contentWindow;
      }
  });
}

module.exports = { set };