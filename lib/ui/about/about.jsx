let React;
try {
  React = require('mailspring-exports').React;
} catch (e) {
  React = require('react');
}
import { version } from '../../../package.json';

export default function About() {
  return (<dl>
    <dt>Version</dt>
    <dd>{version}</dd>
  </dl>);
}
