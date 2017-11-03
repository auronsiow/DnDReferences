import React, { Component } from 'react';
import _ from 'lodash'
import { MenuItem, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import './Component.css';

class NavComponent extends Component {
  render() {
    const classType = this.props.classType;
    const scrollToClassType = this.props.scrollToClassType;
    const pageHasLoaded = this.props.pageHasLoaded;
    const className = pageHasLoaded ? '' : 'navbar-custom';

    const menuItemList = _.map(classType, function(c, index) {
      let eventKeyIndex = 1 + (index+1)/10;
      return (<MenuItem onSelect={scrollToClassType.bind(this, c)} eventKey={eventKeyIndex}>{c}</MenuItem>)
    });

    return (
        <Navbar inverse collapseOnSelect fixedTop className={className}>
          <Navbar.Header>
            <Navbar.Brand>
              <a>DnD Class References</a>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav>
              <NavDropdown eventKey={1} title="Classes" id="basic-nav-dropdown">
                {
                  pageHasLoaded && 
                  menuItemList
                }
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
    )
  }
}

export default NavComponent;
