import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

import jsDOMGlobal from 'jsdom-global';
jsDOMGlobal();

import Help from '../../../lib/ui/help/help';

class Wrapper extends React.Component {
  render() {
    return <>{this.props.children}</>;
  }
}

describe("The Help component", function () {
  beforeEach(function () {
    this.component = ReactTestUtils.renderIntoDocument(
      // See https://stackoverflow.com/a/36682433/3455228. Basically,
      // renderIntoDocument doesn't support functional components, so it needs
      // to be wrapped in a class component
      <Wrapper><Help /></Wrapper>
    );
    const pre = ReactTestUtils.scryRenderedDOMComponentsWithTag(
      this.component, 'pre')[0];
    this.pre = pre;
  });

  it("should render into the page", function () {
    expect(this.component).toBeDefined();
  });

  it("should contain the usage document", function () {
    expect(this.pre.textContent).toContain("How to use todoer");
  });
});
