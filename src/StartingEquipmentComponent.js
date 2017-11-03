import React, { Component } from 'react';
import ButtonGroupWithHeaderComponent from './ButtonGroupWithHeaderComponent';

class StartingEquipmentComponent extends Component {
  render() {
    const startingEquipmentArray = this.props.startingEquipmentArray;
    const buttonComponent = startingEquipmentArray.length > 0 ?
      <ButtonGroupWithHeaderComponent headerText={'I start with: '} buttonText={startingEquipmentArray}/>: 
      <ButtonGroupWithHeaderComponent headerText={'I start with: '} altButtonText={'No equipments'}/>;

    return (
        buttonComponent
    );
  }
}

export default StartingEquipmentComponent;
