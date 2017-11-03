import React, { Component } from 'react';
import _ from 'lodash'
import { Tab, Row, Col, Nav, NavItem } from 'react-bootstrap';
import ButtonGroupComponent from './ButtonGroupComponent';

class ChoiceComponent extends Component {
  render() {
  	const data = this.props.data;
    let numChoices = _.map(data, function(v, index) {
      let optionIndex = index+1;
      return (
        <NavItem eventKey={"choices_"+optionIndex}> {'Choice ' + optionIndex} </NavItem>
      );
    });

    let choiceOptions = _.map(data, function(v, index) {
      let choiceIndex = index+1;

      let buttonText = _.map(v, function(o) {
        return o.item + " x" + o.quantity;
      });

      return (
        <Tab.Pane eventKey={"choices_"+choiceIndex}>
          <p className='equipmentChoicePickText'>Pick: {v.choose} </p>
          <ButtonGroupComponent buttonText={buttonText} />
        </Tab.Pane>
      )
    });

    return (
      <div>
        <Tab.Container id="left-tabs-example" defaultActiveKey="choices_1">
          <Row className="clearfix">
            <Col sm={3}>
              <Nav bsStyle="pills" stacked>
                {numChoices}
              </Nav>
            </Col>
            <Col sm={9}>
              <Tab.Content animation>
                {choiceOptions}
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </div>
    );
  }
}

export default ChoiceComponent;
