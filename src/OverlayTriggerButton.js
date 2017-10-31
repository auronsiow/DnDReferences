import React, { Component } from 'react';
import { OverlayTrigger, Button, Popover } from 'react-bootstrap';

class OverlayTriggerButton extends Component {
  render() {
  	const buttonText = this.props.buttonText;
    const titleText = this.props.titleText;
    const triggerText = this.props.triggerText;

    const triggerClickOverlay = (
      <Popover id="popover-trigger-click-root-close" title={titleText}>
        {triggerText}
      </Popover>
    );

    return (
        <OverlayTrigger trigger="click" placement="bottom" overlay={triggerClickOverlay}>
          <Button>{buttonText}</Button>
        </OverlayTrigger>
    )
  }
}

export default OverlayTriggerButton;
