import React, { Component } from 'react';
import OverlayTriggerButtonGroupComponent from './OverlayTriggerButtonGroupComponent';

class ProficiencyChoiceComponent extends Component {
  render() {
  	const proficiencyChoicesArray = this.props.proficiencyChoicesArray;
  	const skills = this.props.skills;

    return (
			<OverlayTriggerButtonGroupComponent 
				buttonText={proficiencyChoicesArray.choices} 
				triggerText={skills} 
				headerText={'I can pick ' + proficiencyChoicesArray.choose + ' more proficiencies below:'} 
			/>
    );
  }
}

export default ProficiencyChoiceComponent;
