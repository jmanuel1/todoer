import React from '../../react';
import TodoFilePath from '../todo-file-path/todo-file-path';
import EmailLabel from '../email-label/email-label';
import Help from '../help/help';
import About from '../about/about';

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
      <Help/>
      <TodoFilePath settingsService={this.props.settingsService}/>
      <EmailLabel settingsService={this.props.settingsService}/>
      <About/>
    </div>);
  }
}
