import React from '../../react';
import ReactMarkdown from 'react-markdown';
import { version } from '../../../package.json';
import { promises as fs } from 'fs';
import * as path from 'path';

export default class Help extends React.Component {
  static defaultProps = {
    onHelpLoad() {}
  };

  constructor(props) {
    super(props);
    this.state = { help: 'Loading help...' };
  }

  componentDidMount() {
    fs.readFile(Help.HELP_PATH, 'utf-8').then(content => {
      this.setState(
        s => ({ help: content }),
        this.props.onHelpLoad
      );
    });
  }

  render() {
    return (<section className='todoer-help'>
      <h6>Help</h6>
      <details>
        <summary>Usage</summary>
        <p>
          <a href={`https://github.com/jmanuel1/todoer/blob/v${version}/docs/USAGE.md`}>
            Online edition of usage information
          </a>
        </p>
        <ReactMarkdown
          transformImageUri={Help.transformImageUri}
          components={Help.components}
        >
          {this.state.help}
        </ReactMarkdown>
      </details>
    </section>);
  }

  static HELP_PATH = path.join(__dirname, '../../../docs/USAGE.md');

  static components = {
    'a': 'span'
  };

  static transformImageUri(src, alt, title) {
    return `file:///${path.join(__dirname, '/../../../docs/', src)}`;
  }
}
