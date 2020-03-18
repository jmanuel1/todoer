const Flux = require('reflux')

// Actions

const setTodoFilePath = Flux.createAction();

// Stores

// console.log(FluxStore.Store);

export default class SettingsService extends Flux.Store {
  injectInto(Component) {
    return(props) => {
      return <Component settingsService={this} {...props}/>;
    };
  }

  constructor(config, keypath = 'todoer.todoFilePath') {
    super();
    this._config = config;
    this._keypath = keypath;
    this._subscribers = [];
    this._configSubscription = config.observe(keypath,
      path => this.todoFilePath = path);
    this.state = { todoFilePath: '' };
    this.listenTo(setTodoFilePath, (path) => this.todoFilePath = path);
  }

  set todoFilePath(path) {
    // console.log('path', path);
    if (path !== this.state.todoFilePath && path !== undefined) {
      this._config.set(this._keypath, path);
      this.setState({ todoFilePath: path });
    }

    this._trigger();
  }

  get todoFilePath() {
    return this.state.todoFilePath;
  }

  _trigger() {
    for (const subscriber of this._subscribers) {
      subscriber();
    }
  }

  destroy() {
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