import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

import jsDOMGlobal from 'jsdom-global';
jsDOMGlobal();

import Settings from '../../../lib/ui/settings/settings';

describe("The Settings component", function () {
  beforeEach(function () {
    this.settingsService = {
      listen() { }, todoFilePath: "a/path"
    }
    spyOn(this.settingsService, 'listen');
    this.component = ReactTestUtils.renderIntoDocument(
      <Settings settingsService={this.settingsService} />
    );
  });

  it("should render into the page", function () {
    expect(this.component).toBeDefined();
  });
});
