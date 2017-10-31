import React, { Component } from 'react';
import _ from 'lodash'
import { ButtonGroup } from 'react-bootstrap';
import OverlayTriggerButton from './OverlayTriggerButton';

class OverlayTriggerButtonGroupComponent extends Component {
  render() {
  	const buttonText = this.props.buttonText;
    const triggerTextArr = this.props.triggerText;
    const headerText = this.props.headerText;

    // console.log("ARR", triggerTextArr);

    let overlayTriggerButtons = _.map(buttonText, function(d) { 
      const triggerText = _.find(triggerTextArr, {name: d});
      return (
        <OverlayTriggerButton bsStyle="default" buttonText={d} titleText={d} triggerText={triggerText.desc} />
      );
    });
    return (
      <div>
        <h3>{headerText}</h3>
        <ButtonGroup> {overlayTriggerButtons} </ButtonGroup> 
      </div>
    )
  }
}

export default OverlayTriggerButtonGroupComponent;
