const DateOrig = Date;
const origTimezone = {
  name: Intl.DateTimeFormat().resolvedOptions().timeZone,
  value: new Date().getTimezoneOffset()
};

const {
  getDate, getFullYear, getYear, getMonth, getDay, getHours, getMinutes, getSeconds, getMilliseconds,
  toString, toLocaleString, toLocaleTimeString, toLocaleDateString, toTimeString, toDateString, getTimezoneOffset
} = Date.prototype;

function convertToGMT(offset) {
  const format = (number) => (number < 10 ? '0' : '') + number;
  const sign = offset <= 0 ? '+' : '-';
  return sign + format(Math.abs(offset) / 60 | 0) + format(Math.abs(offset) % 60);
}

function clean({ value, offset, timezone }) {
  return value
    .replace(convertToGMT(offset), convertToGMT(timezone.value))
    .replace(/\(.*\)/, '(' + timezone.name.replace(/\//g, ' ') + ' Standard Time)');
}

function set(timezone) {
  const resolvedOptions = Intl.DateTimeFormat().resolvedOptions();

  Object.defineProperties(Date.prototype, {
    _offset: {
      configurable: true,
      get() {
        return getTimezoneOffset.call(this);
      }
    },
    _date: {
      configurable: true,
      get() {
        return this._nd === undefined
          ? new DateOrig(this.getTime() + (this._offset - timezone.value) * 60 * 1000)
          : this._nd;
      }
    },
    getDay: {
      value: function () {
        return getDay.call(this._date);
      }
    },
    getDate: {
      value: function () {
        return getDate.call(this._date);
      }
    },
    getYear: {
      value: function () {
        return getYear.call(this._date);
      }
    },
    getTimezoneOffset: {
      value: function () {
        return Number(timezone.value);
      }
    },
    getMonth: {
      value: function () {
        return getMonth.call(this._date);
      }
    },
    getHours: {
      value: function () {
        return getHours.call(this._date);
      }
    },
    getMinutes: {
      value: function () {
        return getMinutes.call(this._date);
      }
    },
    getSeconds: {
      value: function () {
        return getSeconds.call(this._date);
      }
    },
    getFullYear: {
      value: function () {
        return getFullYear.call(this._date);
      }
    },
    toDateString: {
      value: function () {
        return toDateString.call(this._date);
      }
    },
    toLocaleString: {
      value: function () {
        return toLocaleString.call(this._date);
      }
    },
    getMilliseconds: {
      value: function () {
        return getMilliseconds.call(this._date);
      }
    },
    toLocaleTimeString: {
      value: function () {
        return toLocaleTimeString.call(this._date);
      }
    },
    toLocaleDateString: {
      value: function () {
        return toLocaleDateString.call(this._date);
      }
    },
    toTimeString: {
      value: function () {
        return clean({
          value: toTimeString.call(this._date),
          offset: this._offset,
          timezone
        });
      }
    },
    toString: {
      value: function () {
        return clean({
          value: toString.call(this._date),
          offset: this._offset,
          timezone
        });
      }
    },
  });

  Object.defineProperty(Intl.DateTimeFormat.prototype, 'resolvedOptions', {
    'value': function () {
      return Object.assign(resolvedOptions, { 'timeZone': timezone.name });
    }
  });

  // eslint-disable-next-line no-global-assign
  Date = function () {
    const date = new DateOrig(...arguments);
    return arguments.length > 1 || typeof (arguments[0]) === 'string'
      ? new DateOrig(date.getTime() - (date._offset - timezone.value) * 60 * 1000)
      : date;
  };
  Object.setPrototypeOf(DateOrig.prototype, Date.prototype);
  Date.UTC = DateOrig.UTC;
  Date.now = DateOrig.now;
  Date.parse = DateOrig.parse;
}

function unset() {
  // eslint-disable-next-line no-global-assign
  Date = DateOrig;

  const resolvedOptions = Intl.DateTimeFormat().resolvedOptions();

  Object.defineProperties(Date.prototype, {
    getDay: {
      value: getDay
    },
    getDate: {
      value: getDate
    },
    getYear: {
      value: getYear
    },
    getTimezoneOffset: {
      value: getTimezoneOffset
    },
    getMonth: {
      value: getMonth
    },
    getHours: {
      value: getHours
    },
    getMinutes: {
      value: getMinutes
    },
    getSeconds: {
      value: getSeconds
    },
    getFullYear: {
      value: getFullYear
    },
    toDateString: {
      value: toDateString
    },
    toLocaleString: {
      value: toLocaleString
    },
    getMilliseconds: {
      value: getMilliseconds
    },
    toLocaleTimeString: {
      value: toLocaleTimeString
    },
    toLocaleDateString: {
      value: toLocaleDateString
    },
    toTimeString: {
      value: toTimeString
    },
    toString: {
      value: toString
    },
  });

  Object.defineProperty(Intl.DateTimeFormat.prototype, 'resolvedOptions', {
    'value': function () {
      return Object.assign(resolvedOptions, { 'timeZone': origTimezone.name });
    }
  });
}

module.exports = { set, unset };
