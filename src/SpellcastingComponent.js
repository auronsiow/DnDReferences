import React, { Component } from 'react';
import ButtonGroupWithHeaderComponent from './ButtonGroupWithHeaderComponent';

class SpellcastingComponent extends Component {
  render() {
    const spellcastingArray = this.props.spellcastingArray;
    const buttonComponent = spellcastingArray.length > 0 ?
      <ButtonGroupWithHeaderComponent headerText={'Spells I cast: '} buttonText={spellcastingArray}/>: 
      <ButtonGroupWithHeaderComponent headerText={'Spells I cast: '} altButtonText={'None'}/>;

    return (
        buttonComponent
    );
  }
}

export default SpellcastingComponent;
