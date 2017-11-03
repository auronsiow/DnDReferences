import React, { Component } from 'react';
import ButtonGroupComponent from './ButtonGroupComponent';

class ButtonGroupWithHeaderComponent extends Component {
  render() {
  	const buttonText = this.props.buttonText;
    const headerText = this.props.headerText;
    const altButtonText = this.props.altButtonText;
    return (
	  	<div>
	      <h3>{headerText}</h3>
	      {
	      	buttonText && 
	      	<ButtonGroupComponent buttonText={buttonText} />
	      }
	      {
	      	altButtonText && 
	      	<p className='small-size'>{altButtonText}</p>
	      }
      </div>
    )
  }
}

export default ButtonGroupWithHeaderComponent;
