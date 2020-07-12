let React;
try {
  React = require('mailspring-exports').React;
} catch (e) {
  React = require('react');
}

export default class TodoFilePath extends React.Component {

  constructor(props) {
    super(props);
    this.state = this._getStateFromStores();
  }

  componentDidMount() {
    this._unsubscribeFromSettings = this.props.settingsService.listen(
      this._onSettingsChange);
  }

  componentWillUnmount() {
    this._unsubscribeFromSettings();
  }

  _onSettingsChange = () => {
    this.setState(this._getStateFromStores());
  }

  _getStateFromStores = () => {
    return {todoFilePath: this.props.settingsService.todoFilePath};
  }

  _onFormChange = (event) => {
    this.props.settingsService.todoFilePath = event.target.value;
  }

  render() {
    return (<section>
      <h6>todo.txt Path</h6>
      <label className='todoer-settings-label'>
        Path to todo.txt file:
        <input value={this.state.todoFilePath} onChange={this._onFormChange}
          className='todoer-settings-input'/>
      </label>
    </section>);
  }
}
