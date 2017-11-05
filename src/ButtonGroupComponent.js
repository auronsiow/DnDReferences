import React, { Component } from 'react';
import _ from 'lodash'
import { ButtonGroup, Button } from 'react-bootstrap';

class ButtonGroupComponent extends Component {
  render() {
  	const buttonText = this.props.buttonText;

    let buttons = _.map(buttonText, function(o) { 
      return (
        <Button key={'key_'+o} bsStyle="default">{o}</Button>
      );
    });

    return (
        <ButtonGroup> {buttons} </ButtonGroup> 
    )
  }
}

export default ButtonGroupComponent;
