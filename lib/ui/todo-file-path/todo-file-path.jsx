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
    return (<label>
      Path to todo.txt file:
      <input value={this.state.todoFilePath} onChange={this._onFormChange}/>
    </label>);
  }
}

// Providing container styles tells the app how to constrain
// the column your component is being rendered in. The min and
// max size of the column are chosen automatically based on
// these values.
TodoFilePath.containerStyles = {
  order: 1,
  flexShrink: 0
};
