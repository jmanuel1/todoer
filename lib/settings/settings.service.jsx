export default class SettingsService {
  injectInto(Component, React) {
    const that = this;
    return class extends React.Component {
      constructor(props) {
        super(props);
      }
      render() {
        return <Component settingsService={that} {...this.props}/>;
      }
    }
  }

  constructor(config, keypath = 'todoer.todoFilePath') {
    if (this.constructor._instance !== undefined) {
      return this.constructor._instance;
    }
    this.constructor._instance = this;
    this._config = config;
    this._keypath = keypath;
    this._subscribers = [];
    this._configSubscription = config.observe(
      keypath,
      path => this.todoFilePath = path);
  }

  set todoFilePath(path) {
    if (path !== this._todoFilePath && this._todoFilePath !== undefined) {
      this._config.set(this._keypath, path);
    }
    this._todoFilePath = path;
    this._trigger();
  }

  get todoFilePath() {
    return this._todoFilePath;
  }

  _trigger() {
    for (const subscriber of this._subscribers) {
      subscriber();
    }
  }

  destroy() {
    this.constructor._instance = undefined;
    this._configSubscription.dispose();
  }

  listen(subscriber) {
    this._subscribers = (this._subscribers || []).concat([subscriber]);
    const index = this._subscribers.length - 1;
    return() => {
      this._subscribers.splice(index, 1);
    };
  }
}