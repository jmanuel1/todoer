import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

import jsDOMGlobal from 'jsdom-global';
jsDOMGlobal();

import About from '../../../lib/ui/about/about';
import { version } from '../../../package.json';

class Wrapper extends React.Component {
  render() {
    return <>{this.props.children}</>;
  }
}

describe("The About component", function () {
  beforeEach(function () {
    this.component = ReactTestUtils.renderIntoDocument(
      // See https://stackoverflow.com/a/36682433/3455228. Basically,
      // renderIntoDocument doesn't support functional components, so it needs
      // to be wrapped in a class component
      <Wrapper><About /></Wrapper>
    );
  });

  it("should render into the page", function () {
    expect(this.component).toBeDefined();
  });

  it("should contain the current version of the plugin", function () {
    const dds = ReactTestUtils.scryRenderedDOMComponentsWithTag(this.component, 'dd');
    let versionExists = false;
    for (let dd of dds) {
      versionExists = versionExists || dd.textContent.includes(version);
    }
    expect(versionExists).toBeTrue();
  })
});
