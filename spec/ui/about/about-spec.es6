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
    const dds = ReactTestUtils.scryRenderedDOMComponentsWithTag(
      this.component, 'dd');
    this.dds = dds;
  });

  it("should render into the page", function () {
    expect(this.component).toBeDefined();
  });

  it("should contain the current version of the plugin", function () {
    let versionExists = this.dds.some(dd => dd.textContent.includes(version));
    expect(versionExists).toBeTrue();
  });

  it("should contain the authors of the plugin", function () {
    const authors = ['jason manuel', 'contributors'];
    let authorsExist = this.dds.some(dd =>
      authors.every(author => dd.textContent.toLowerCase().includes(author)));
    expect(authorsExist).toBeTrue();
  });

  it("should contain a copyright notice", function () {
    const copyright = '2021, jason manuel and todoer contributors';
    let copyrightExists = this.dds.some(dd =>
      dd.textContent.toLowerCase().includes(copyright));
    expect(copyrightExists).toBeTrue();
  });

  it("should contain the license", function () {
    const license = 'MIT';
    const licenseLink =
      `https://github.com/jmanuel1/todoer/blob/v${version}/LICENSE.md`;
    let licenseAndLinkExist = this.dds.some(dd => {
      let licenseExists = dd.textContent.includes(license);
      let licenseLinkExists = dd.innerHTML.includes(licenseLink);
      return licenseExists && licenseLinkExists;
    });
    expect(licenseAndLinkExist).toBeTrue();
  });
});
