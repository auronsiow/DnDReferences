import React, { Component } from 'react';
import _ from 'lodash'
import { Tab, Row, Col, Nav, NavItem, ButtonGroup, Button } from 'react-bootstrap';

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
      let options = _.map(v, function(o, index) { 
        return (
          <Button bsStyle="default">{o.item} x {o.quantity}</Button>
        );
      });
      return (
        <Tab.Pane eventKey={"choices_"+choiceIndex}>
          <p>Pick: {v.choose} </p>
          <ButtonGroup> {options} </ButtonGroup> 
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
