import { GeneralizedLabel, starredLabel } from '../models/generalized-label';

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

  constructor(config, keypath = 'todoer') {
    console.log('CURRENT INSTANCE', this.constructor._instance);
    if (this.constructor._instance !== undefined) {
      return this.constructor._instance;
    }
    this.constructor._instance = this;
    this._config = config;
    this._keypath = keypath;
    this._subscribers = [];
    this._configSubscription = config.observe(
      keypath,
      ({todoFilePath: path, emailLabel, useStarsForLabel}) => {
        path && (this.todoFilePath = path);
        emailLabel && (this.emailLabel = new GeneralizedLabel(emailLabel));
        useStarsForLabel && (this.emailLabel = starredLabel);
      });
  }

  set todoFilePath(path) {
    if (path !== this._todoFilePath && this._todoFilePath !== undefined) {
      this._config.set(this._keypath + '.todoFilePath', path);
    }
    this._todoFilePath = path;
    this._trigger('todoFilePath');
  }

  get todoFilePath() {
    return this._todoFilePath;
  }

  set emailLabel(label) {
    if (this._emailLabel !== undefined && label.equals(this._emailLabel)) {
      if (label.equals(starredLabel)) {
        this._config.set(this._keypath + '.useStarsForLabel', true);
      } else {
        this._config.set(this._keypath + '.useStarsForLabel', false);
        this._config.set(this._keypath + '.emailLabel', label.toString());
      }
    }
    this._emailLabel = label;
    this._trigger('emailLabel');
  }

  get emailLabel() {
    return this._emailLabel;
  }

  previousNormalLabel() {
    return new GeneralizedLabel(
      this._config.get(this._keypath + '.emailLabel'));
  }

  _trigger(triggeredPath) {
    for (const {subscriber, keypath} of this._subscribers) {
      if (keypath == triggeredPath) {
        subscriber();
      }
    }
  }

  // NOTE: idempotent
  static destroy() {
    this._instance && this._instance._configSubscription && this._instance._configSubscription.dispose();
    this._instance = undefined;
  }

  listen(subscriber, keypath = 'todoFilePath') {
    this._subscribers = (this._subscribers || []).concat(
      [{subscriber, keypath}]);
    return() => {
      const index = this._subscribers.map(({subscriber}) => subscriber).indexOf(
        subscriber);
      if (index >= 0) {
        this._subscribers.splice(index, 1);
      }
    };
  }
}