'use strict';

const config = {
  observe(keypath, subscriber) {
    this._subscriber = subscriber;
    return { dispose() { } };
  },
  fire(obj) {
    this._subscriber(obj);
  },
  set() { }
};

export default config;
