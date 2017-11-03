import React, { Component } from 'react';
import _ from 'lodash'
import { Jumbotron } from 'react-bootstrap';
import ButtonGroupWithHeaderComponent from './ButtonGroupWithHeaderComponent';
import AbilityComponent from './AbilityComponent';
import EquipmentChoiceComponent from './EquipmentChoiceComponent';
import SpellcastingComponent from './SpellcastingComponent';
import StartingEquipmentComponent from './StartingEquipmentComponent';
import ProficiencyChoiceComponent from './ProficiencyChoiceComponent';

class CharacterComponent extends Component {
  render() {
    let liList = [];

    const classType = this.props.classType;
    const abilities = this.props.abilities;
    const skills = this.props.skills;

    _.forOwn(classType, function(value, key) { 
      const startingEquipmentArray = _.map(value.startingEquipment, function(s) {
        return s.item + " x" + s.quantity;
      });

      const spellcastingArray = value.spellcasting ? value.spellcasting : [];

      liList.push(
        <Jumbotron id={'jumbo_'+value.name}>
          <h1>{value.name}</h1>
          <h3>Health: {value.hits}</h3>
          <AbilityComponent headerText={'Abilities: '} buttonText={value.savingThrows} triggerText={abilities} />
          <ButtonGroupWithHeaderComponent headerText={'I\'m proficient with: '} buttonText={value.proficiency}/>
          <ProficiencyChoiceComponent proficiencyChoicesArray={value.proficiencyChoices} skills={skills} />
          <SpellcastingComponent spellcastingArray={spellcastingArray} />
          <StartingEquipmentComponent startingEquipmentArray={startingEquipmentArray} />
          <EquipmentChoiceComponent data={value.startingEquipmentOptions}/>
        </Jumbotron>
      );
    });
    return (
      liList
    );
  }
}

export default CharacterComponent;
