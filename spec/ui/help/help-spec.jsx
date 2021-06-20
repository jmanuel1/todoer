import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import { promises as fs } from 'fs';

import jsDOMGlobal from 'jsdom-global';
jsDOMGlobal();

import Help from '../../../lib/ui/help/help';

describe('The Help component', function () {
  beforeEach(function () {
    return new Promise(resolve => {
      const component = ReactTestUtils.renderIntoDocument(
        <Help onHelpLoad={() => {
          const helpElement = ReactTestUtils.scryRenderedDOMComponentsWithTag(
            component, 'section')[0];
          this.component = component;
          this.helpElement = helpElement;
          resolve();
        }}/>
      );
    });
  });

  it('should render into the page', function () {
    expect(this.component).toBeDefined();
  });

  it('should contain the usage document', function () {
    expect(this.helpElement.textContent).toContain('How to use todoer');
  });

  it(
    'should have <img> URLs that all exist on the file system',
    async function () {
      for (let img of this.helpElement.querySelectorAll('img')) {
        let src = img.src;
        // Remove file:///
        let match = null;
        if (match = src.match(/^file:\/\/\/(.*)/)) {
          src = match[1];
        }
        const accessPromise = new Promise(resolve => resolve(fs.access(src)));
        await expectAsync(accessPromise).toBeResolved();
      }
    }
  );
});
