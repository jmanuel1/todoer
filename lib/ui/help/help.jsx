import React from '../../react';
import ReactMarkdown from 'react-markdown';
import { version } from '../../../package.json';
import { promises as fs } from 'fs';
import * as path from 'path';

export default class Help extends React.Component {
  constructor(props) {
    super(props);
    this.state = { help: 'Loading help...' };
    this.HELP_PATH = path.join(__dirname, '../../../docs/USAGE.md');
  }

  componentDidMount() {
    fs.readFile(this.HELP_PATH, 'utf-8').then(content => this.setState(s =>
      ({ ...s, help: content })));
  }

  render() {
    return (<section className='todoer-help'>
      <details>
        <summary><h6>Help</h6></summary>
        <p>
          <a href={`https://github.com/jmanuel1/todoer/blob/v${version}/docs/USAGE.md`}>
            Online edition of usage information
          </a>
        </p>
        <ReactMarkdown transformImageUri={Help.transformImageUri}>
          {this.state.help}
        </ReactMarkdown>
      </details>
    </section>);
  }

  static transformImageUri(src, alt, title) {
    return `file:///${__dirname}/../../../docs/${src}`;
  }
}
