let React;
try {
  React = require('mailspring-exports').React;
} catch (e) {
  React = require('react');
}
import { version } from '../../../package.json';

export default function About() {
  return (<section>
    <h6>About</h6>
    <dl>
      <dt>Version</dt>
      <dd>{version}</dd>
      <dt>Authors</dt>
      <dd>
        <a href='http://jason-manuel.com'>Jason Manuel</a>
        ... and <a href='https://github.com/jmanuel1/todoer'>contributors</a>?
      </dd>
      <dt>Copyright</dt>
      <dd>2019-2021, Jason Manuel and Todoer Contributors</dd>
      <dt>License</dt>
      <dd>
        <a href={`https://github.com/jmanuel1/todoer/blob/v${version}/LICENSE.md`}>
          MIT
        </a>
      </dd>
    </dl>
  </section>);
}
