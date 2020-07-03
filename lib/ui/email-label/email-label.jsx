let React;
try {
  React = require('mailspring-exports').React;
} catch (e) {
  React = require('react');
}
import { GeneralizedLabel, starredLabel } from '../../models/generalized-label';

/* TODO: It seems Mailspring has its own CategorySelection component for this.
/* However, it's in an internal package. I should see if I can access it. */
export default class EmailLabel extends React.Component {

  constructor(props) {
    super(props);
    this._unlistenToSettingsService = props.settingsService.listen(() => this.forceUpdate(), 'emailLabel');
  }

  componentDidMount() {
  }

  componentWillUnmount() {
    this._unlistenToSettingsService();
  }

  _setLabelFromTextArea = (event) => {
    const label = event.target.value;
    this.props.settingsService.emailLabel = new GeneralizedLabel(label);
  }

  _setStarredLabelFromCheckbox = (event) => {
    const flag = event.target.checked;
    if (flag) {
      this.props.settingsService.emailLabel = starredLabel;
      return;
    }
    this.props.settingsService.emailLabel = this.props.settingsService.previousNormalLabel();
  }

  render() {
    const useStars = this.props.settingsService.emailLabel.equals(starredLabel);
    const labelAsString = (useStars ? this.props.settingsService.previousNormalLabel() : this.props.settingsService.emailLabel).toString();
    return (<>
      <div>
        <input type='checkbox' name='starred-or-label' checked={useStars} onChange={this._setStarredLabelFromCheckbox}/>
        Watch starred emails
      </div>
      <div>
        Watch the given label
        <input type='textarea' placeholder='Email label name' value={labelAsString} onChange={this._setLabelFromTextArea} disabled={useStars}/>
      </div>
    </>);
  }
}

// Providing container styles tells the app how to constrain
// the column your component is being rendered in. The min and
// max size of the column are chosen automatically based on
// these values.
EmailLabel.containerStyles = {
  order: 1,
  flexShrink: 0
};
