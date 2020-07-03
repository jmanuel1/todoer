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
    return (<>
      <TodoFilePath settingsService={this.props.settingsService}/>
      <EmailLabel settingsService={this.props.settingsService}/>
    </>);
  }
}

// Providing container styles tells the app how to constrain
// the column your component is being rendered in. The min and
// max size of the column are chosen automatically based on
// these values.
Settings.containerStyles = {
  order: 1,
  flexShrink: 0
};
