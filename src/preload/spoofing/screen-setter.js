/* global window, MediaQueryList, Screen */
const { BROWSER_TOP_BORDER_HEIGHT_PX } = require('@/common/consts');

const original = {
  matches: Object.getOwnPropertyDescriptor(MediaQueryList.prototype, 'matches').get,
};

const physical = {
  width: Math.round(window.screen.width * window.devicePixelRatio),
  height: Math.round(window.screen.height * window.devicePixelRatio)
};

if (!window.matchMedia(`(device-width: ${physical.width / window.devicePixelRatio}px`).matches) {
  let minWidth = Math.ceil((window.screen.width - 0.5) * window.devicePixelRatio);
  let maxWidth = Math.floor((window.screen.width + 0.5) * window.devicePixelRatio);
  for (let width = minWidth; width <= maxWidth; width += 1) {
    if (window.matchMedia(`(device-width: ${width / window.devicePixelRatio}px`).matches) {
      physical.width = width;
      break;
    }
  }
}
if (!window.matchMedia(`(device-height: ${physical.height / window.devicePixelRatio}px`).matches) {
  let minHeight = Math.ceil((window.screen.height - 0.5) * window.devicePixelRatio);
  let maxHeight = Math.floor((window.screen.height + 0.5) * window.devicePixelRatio);
  for (let height = minHeight; height <= maxHeight; height += 1) {
    if (window.matchMedia(`(device-height: ${height / window.devicePixelRatio}px`).matches) {
      physical.height = height;
      break;
    }
  }
}

function set({ screenResolutions, os }) {
  if (os === 'mac') {
    const screenDimensions = getScreenDimensions(screenResolutions);
    const roundedWidth = Math.round(screenDimensions.width);
    const roundedHeight = Math.round(screenDimensions.height);

    Object.defineProperties(Screen.prototype, {
      width: {
        get: Object.getOwnPropertyDescriptor({
          get width() {
            return roundedWidth;
          }
        }, 'width').get,
      },
      height: {
        get: Object.getOwnPropertyDescriptor({
          get height() {
            return roundedHeight;
          }
        }, 'height').get,
      },
      availWidth: {
        get: Object.getOwnPropertyDescriptor({
          get availWidth() {
            return roundedWidth;
          }
        }, 'availWidth').get,
      },
      availHeight: {
        get: Object.getOwnPropertyDescriptor({
          get availHeight() {
            return roundedHeight;
          }
        }, 'availHeight').get,
      },
      availLeft: {
        get: Object.getOwnPropertyDescriptor({
          get availLeft() {
            return 0;
          }
        }, 'availLeft').get,
      },
      availTop: {
        get: Object.getOwnPropertyDescriptor({
          get availTop() {
            return 0;
          }
        }, 'availTop').get,
      },
    });

    Object.defineProperty(MediaQueryList.prototype, 'matches', {
      get: Object.getOwnPropertyDescriptor({
        get matches() {
          const originalValue = original.matches.call(this, ...arguments);
          const originalMedia = this.media;
          const alteredMedia = getAlteredMedia(originalMedia, screenDimensions);
          if (alteredMedia !== originalMedia) {
            const alteredQuery = window.matchMedia(alteredMedia);
            return original.matches.call(alteredQuery);
          }
          return originalValue;
        }
      }, 'matches').get,
    });
  }

  Object.defineProperties(window, {
    outerWidth: {
      get: Object.getOwnPropertyDescriptor({
        get outerWidth() {
          return window.innerWidth;
        }
      }, 'outerWidth').get,
    },
    outerHeight: {
      get: Object.getOwnPropertyDescriptor({
        get outerHeight() {
          return window.innerHeight + BROWSER_TOP_BORDER_HEIGHT_PX;
        }
      }, 'outerHeight').get,
    },
  });
}

function getScreenDimensions(screenResolutions) {
  // subtract 0.5 to adjust for potential rounding errors
  const innerWidth = (window.innerWidth - 0.5) * window.devicePixelRatio;
  const innerHeight = (window.innerHeight - 0.5) * window.devicePixelRatio;
  for (let resolution of screenResolutions) {
    if (resolution.width >= innerWidth && resolution.height >= innerHeight) {
      return {
        width: resolution.width / window.devicePixelRatio,
        height: resolution.height / window.devicePixelRatio
      };
    }
  }
  return window.screen;
}

function getAlteredMedia(originalMedia, dimensions) {
  return originalMedia.replace(
    /\(\s*(?:(min|max)-)?device-(width|height):\s+(\d+\.?\d*)px\s*\)/,
    function (m, type, dimension, value) {
      value = parseFloat(value);
      let newCompareValue;
      switch (type) {
        case 'min':
          if (value <= dimensions[dimension]) {
            newCompareValue = 0;
          } else {
            newCompareValue = 2 * physical[dimension];
          }
          break;
        case 'max':
          if (value >= dimensions[dimension]) {
            newCompareValue = 2 * physical[dimension];
          } else {
            newCompareValue = 0;
          }
          break;
        default:
          if (
            Math.round(value * 100) ===
            Math.round(dimensions[dimension] * 100)
          ) {
            newCompareValue = physical[dimension];
          } else {
            newCompareValue = 0;
          }
      }
      return `(${type ? type + '-' : ''}device-${dimension}: ${newCompareValue / window.devicePixelRatio}px)`;
    }
  );
}

module.exports = { set };
