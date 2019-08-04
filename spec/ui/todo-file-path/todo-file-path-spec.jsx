import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

import jsDOMGlobal from 'jsdom-global';
jsDOMGlobal();

import TodoFilePath from '../../../lib/ui/todo-file-path/todo-file-path';

describe("The TodoFilePath component", function () {
  beforeEach(function () {
    this.settingsService = {
      listen() { }, todoFilePath: "a/path"
    }
    spyOn(this.settingsService, 'listen');
    this.component = ReactTestUtils.renderIntoDocument(
      <TodoFilePath settingsService={this.settingsService} />
    );
  });

  it("should render into the page", function () {
    expect(this.component).toBeDefined();
  });

  it("should listen to the passed in SettingsService", function () {
    expect(this.settingsService.listen).toHaveBeenCalled();
  });

  it("should get the todo.txt file path from the SettingsService", function () {
    expect(this.component.state.todoFilePath).toEqual("a/path");
  });
});
