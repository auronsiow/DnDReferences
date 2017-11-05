import React, { Component } from 'react';
import _ from 'lodash'
import { Accordion, Panel } from 'react-bootstrap';
import ChoiceComponent from './ChoiceComponent';

class EquipmentChoiceComponent extends Component {
  render() {
  	const data = this.props.data;
    const panels = _.map(data, function(v, index) {
      var choiceIndex = index + 1;
      return (
        <Panel key={'key_panel_'+choiceIndex} header={"Equipment Set #"+choiceIndex} eventKey={""+choiceIndex}>
          <ChoiceComponent data={v} />
        </Panel>
      );
    })
    return (
      <div>
        <h3>Additional Starting Equipments:</h3>
        <Accordion>
          {panels}
        </Accordion>
      </div>
    );
  }
}

export default EquipmentChoiceComponent;
