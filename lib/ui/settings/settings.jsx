let React;
try {
  React = require('mailspring-exports').React;
} catch (e) {
  React = require('react');
}
import TodoFilePath from '../todo-file-path/todo-file-path';
import EmailLabel from '../email-label/email-label';

export default class Settings extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  render() {
    return (<div className='todoer-settings-container'>
      <TodoFilePath settingsService={this.props.settingsService}/>
      <EmailLabel settingsService={this.props.settingsService}/>
    </div>);
  }
}
