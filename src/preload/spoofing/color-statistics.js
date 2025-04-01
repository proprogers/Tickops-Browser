class Statistic {
  constructor() {
    this.colors = Object.create(null);
    this.numberOfColors = 0;

    this.minBoundary = { count: Number.NEGATIVE_INFINITY };
    this.maxBoundary = { count: Number.POSITIVE_INFINITY, previousColor: this.minBoundary };
    this.minBoundary.nextColor = this.maxBoundary;
  }

  addColor(r, g, b, a) {
    const index = String.fromCharCode(r, g, b, a);
    let color = this.colors[index];
    if (!color) {
      color = {
        index,
        color: [r, g, b, a],
        count: 0,
        previousColor: this.minBoundary,
        nextColor: this.minBoundary.nextColor
      };
      this.numberOfColors += 1;
      this.minBoundary.nextColor = color;
      color.nextColor.previousColor = color;
      this.colors[index] = color;
    }
    color.count += 1;
    if (color.count > color.nextColor.count) {
      // swap colors to remain in right order
      // a_ -> b_ -> c -> d becomes a_ -> c -> b_ -> d
      const a_ = color.previousColor;
      const b_ = color;
      const c = color.nextColor;
      const d = color.nextColor.nextColor;

      a_.nextColor = c;
      c.previousColor = a_;

      c.nextColor = b_;
      b_.previousColor = c;

      b_.nextColor = d;
      d.previousColor = b_;
    }
  }

  getMaxColors(n) {
    n = Math.min(n, this.numberOfColors);
    const colors = Object.create(null);
    let current = this.maxBoundary;
    for (; n && current; n -= 1) {
      current = current.previousColor;
      colors[current.index] = current;
    }
    return colors;
  }
}

const compute = function computeColorStatistics(rawData) {
  const statistic = new Statistic();
  for (let i = 0, l = rawData.length; i < l; i += 4) {
    statistic.addColor(
      rawData[i + 0],
      rawData[i + 1],
      rawData[i + 2],
      rawData[i + 3]
    );
  }
  return statistic;
};
const hasMoreColors = function hasMoreColors(rawData, threshold, statistic) {
  if (statistic) {
    return statistic.numberOfColors > threshold;
  } else {
    const colors = Object.create(null);
    let count = 0;
    for (let i = 0, l = rawData.length; i < l; i += 4) {
      const index = String.fromCharCode(
        rawData[i + 0],
        rawData[i + 1],
        rawData[i + 2],
        rawData[i + 3]
      );
      if (!Object.prototype.hasOwnProperty.call(colors, index)) {
        colors[index] = true;
        count += 1;
        if (count > threshold) {
          return true;
        }
      }
    }
    return count > threshold;
  }
}

module.exports = { compute, hasMoreColors };
