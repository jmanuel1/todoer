import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import { promises as fs } from 'fs';

import jsDOMGlobal from 'jsdom-global';
jsDOMGlobal();

import Help from '../../../lib/ui/help/help';

describe("The Help component", function () {
  beforeEach(function () {
    // QUESTION: Can I make beforeEach async so that the test functions don't
    // have to be?
    this.component = new Promise(resolve => {
      const component = ReactTestUtils.renderIntoDocument(
        <Help onHelpLoad={() => {
          const helpElement = ReactTestUtils.scryRenderedDOMComponentsWithTag(
            component, 'section')[0];
          this.helpElement = helpElement;
          resolve(component);
        }}/>
      );
    });
  });

  it("should render into the page", async function () {
    expect(await this.component).toBeDefined();
  });

  it("should contain the usage document", async function () {
    await this.component;
    expect(this.helpElement.textContent).toContain("How to use todoer");
  });
});
