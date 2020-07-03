import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

import jsDOMGlobal from 'jsdom-global';
jsDOMGlobal();

import EmailLabel from '../../../lib/ui/email-label/email-label';
import { starredLabel } from '../../../lib/models/generalized-label';

describe("The EmailLabel component", function () {
  beforeEach(function () {
    this.settingsService = {
      listen(cb) { cb(); },
      todoFilePath: "a/path",
      emailLabel: starredLabel,
      previousNormalLabel() { return 'label'; }
    }
    spyOn(this.settingsService, 'listen');
    this.component = ReactTestUtils.renderIntoDocument(
      <EmailLabel settingsService={this.settingsService} />
    );
  });

  it("should render into the page", function () {
    expect(this.component).toBeDefined();
  });

  it('should listen to the settings service', function () {
    expect(this.settingsService.listen).toHaveBeenCalled();
  });
});
