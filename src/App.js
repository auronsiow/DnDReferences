import React, { Component } from 'react';
import axios from 'axios';
import _ from 'lodash'

// import './App.css';

import './Component.css';
import { Grid, Row, Jumbotron, Nav, Navbar, NavDropdown, MenuItem } from 'react-bootstrap';
import EquipmentChoiceComponent from './EquipmentChoiceComponent'
import ButtonGroupWithHeaderComponent from './ButtonGroupWithHeaderComponent';

// Bug: Observed that Wizard's starting equipment choices to make is 4 but only 3 are available
class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      skill: {}, classType: {}, loaded: false
    }
    this.constant = []
  }

  isDefined(variable) { 
    return typeof variable !== 'undefined';
  }

  getClasses() {
    var self = this;
    axios
    .get('http://www.dnd5eapi.co/api/classes/')
    .then((response) => {
      let promises = [];
      _.forEach(response.data.results, function(v) {
        promises.push(self.getClassDetails(v.url));
      });

      axios.all(promises)
      .then(axios.spread((...args) => {
        // console.log("Classes", args)
        self.setState({
          classType: args,
          loaded: true
        });
      }));
    })
    .catch((error) => { console.log(error); });
  }

  getClassDetails(url) {
    var self = this;
    return axios
    .get(url)
    .then((response) => {
      var data = response.data;

      var obj = {};
      obj['name'] = data.name;
      obj['hits'] = data.hit_die;
      obj['proficiency'] = _.map(data.proficiencies, 'name')
      obj['subclass'] = _.map(data.subclasses, 'name')
      obj['savingThrows'] = _.map(data.saving_throws, 'name')
      let spellUrl = self.isDefined(data.spellcasting) ? data.spellcasting.url : '';
      let startingEquipmentUrl = data.starting_equipment.url;

      return { obj: obj, spellUrl: spellUrl, startingEquipmentUrl: startingEquipmentUrl }
    })
    .then((res) => {
      let promises = [];
      promises.push(self.getStarting(res.startingEquipmentUrl));
      promises.push(self.getSpelling(res.spellUrl));
      return axios.all(promises)
      .then(axios.spread((equipment, spell) => {
        if (!_.isEmpty(spell)) 
          res.obj['spellcasting'] = spell
        res.obj['startingEquipment'] = equipment.startingEquipment
        res.obj['startingEquipmentOptions'] = equipment.startingEquipmentOptions
        return res.obj;
      }))
    })
    .catch((error) => { console.log(error); });
  }

  getSpelling(url) {
    if (url === '')
      return {};

    return axios
    .get(url)
    .then((response) => {
      var data = response.data;
      var spelling = _.map(data.info, 'name')
      return spelling;
    })
    .catch((error) => { console.log(error); });
  }

  getStarting(url) {
    return axios
    .get(url)
    .then((response) => {
      var data = response.data;
      var obj = {}
      obj['startingEquipment'] = _.map(data.starting_equipment, function(e) {
        return { item: e.item.name, quantity: e.quantity }
      });

      var choices = _.pickBy(data, function(value, key) {
        return _.startsWith(key, "choice_");
      });
      
      obj['startingEquipmentOptions'] = _.map(choices, function(choice) {
        return _.map(choice, function(c) {
          var tempo = _.map(c.from, function(i) {
            return { item: i.item.name, quantity: i.quantity }
          });
          tempo['choose'] = c.choose;
          return tempo;
        });
      });
      return obj
    })
    .catch((error) => { console.log(error); });
  }

  getToolTips() {
    var self = this;
    axios
    .get('http://www.dnd5eapi.co/api/skills/')
    .then((response) => {
      let promises = [];
      _.forEach(response.data.results, function(v) {
        promises.push(self.getSkillDescription(v.url));
      });

      axios.all(promises)
      .then(axios.spread((...args) => {
        // console.log("Skills ", args)
        self.setState({
          skills: args
        });
      }));
    })
    .catch((error) => { console.log(error); });
  }

  getSkillDescription(url) {
    return axios
    .get(url)
    .then((response) => {
      var obj = { name: response.data.name, desc: _.map(response.data.desc).join(', ')}
      return obj
    })
    .catch((error) => { console.log(error); });
  }

  componentWillMount() {
    axios.defaults.baseURL = '';
    axios.all([this.getClasses(), this.getToolTips()]);
  }

  render() {

    let liList = []

    _.forOwn(this.state.classType, function(value, key) { 
      let throws = _.join(value.savingThrows, ' ');

      const startingEquipmentButtonText = _.map(value.startingEquipment, function(s) {
        return s.item + " x" + s.quantity;
      });

      const startingEquipmentComponent = startingEquipmentButtonText.length > 0 ?
      <ButtonGroupWithHeaderComponent headerText={'I start with: '} buttonText={startingEquipmentButtonText}/>: 
      <ButtonGroupWithHeaderComponent headerText={'I start with: '} altButtonText={'No equipment'}/>;

      const spellCastingComponent = value.spellcasting ?
      <ButtonGroupWithHeaderComponent headerText={'Spells I cast: '} buttonText={value.spellcasting}/>: 
      <ButtonGroupWithHeaderComponent headerText={'Spells I cast: '} altButtonText={'None'}/>;


      liList.push(
        <Jumbotron>
          <h1>{value.name} ({value.subclass})</h1>
          <h2>Stats: {throws}</h2>
          <h3>Health: {value.hits}</h3>

          <ButtonGroupWithHeaderComponent headerText={'I\'m good with: '} buttonText={value.proficiency}/>
          
          {spellCastingComponent}

          {startingEquipmentComponent}
          
          <EquipmentChoiceComponent data={value.startingEquipmentOptions}/>
        </Jumbotron>
      );
    });

    const menuItemList = _.map(this.state.classType, function(c, index) {
      let eventKeyIndex = 1 + (index+1)/10;
      return (<MenuItem eventKey={eventKeyIndex}>{c.name}</MenuItem>)
    });

    const dummyNavComponent = (
      <Navbar inverse collapseOnSelect fixedTop className='navbar-custom'>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="#">DnD Class References</a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            <NavDropdown eventKey={1} title="Classes" id="basic-nav-dropdown">
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );

    const navigationComponent = (
      <Navbar inverse collapseOnSelect fixedTop>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="#">DnD Class References</a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            <NavDropdown eventKey={1} title="Classes" id="basic-nav-dropdown">
              {menuItemList}
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );

    const loaderComponent = (<div id='loader'>{dummyNavComponent}</div>);

    if (!this.state.loaded) {
      return loaderComponent;
    }
    
    return (
      <div>
        {navigationComponent}
        <Grid className='GridComponent'>
          <Row>
          {liList}
          </Row>
        </Grid>
      </div>
    );
  }
}

export default App;
