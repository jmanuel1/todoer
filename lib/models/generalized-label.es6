export class GeneralizedLabel {
  static starred = Symbol('starred');

  constructor(label) {
    this._label = label;
  }

  equals(generalizedLabel) {
    return this._label === generalizedLabel._label;
  }

  toString() {
    if (this._label === this.starred) {
      throw new TypeError('label is starredLabel');
    }
    return this._label;
  }
}

export const starredLabel = new GeneralizedLabel(GeneralizedLabel.starred);