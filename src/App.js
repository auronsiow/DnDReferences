import React, { Component } from 'react';
import axios from 'axios';
import _ from 'lodash'
// import logo from './logo.svg';
// import './App.css';
import { Grid, Row, Jumbotron } from 'react-bootstrap';
import EquipmentChoiceComponent from './EquipmentChoiceComponent'
import ButtonGroupWithHeaderComponent from './ButtonGroupWithHeaderComponent';

// Bug: Observed that Wizard's starting equipment choices to make is 4 but only 3 are available
class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      skill: {}, classType: {}
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
        console.log("Classes", args)
        self.setState({
          classType: args
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
        console.log("Skills ", args)
        self.setState({
          skills: args
        });
      }));
    })
    .catch((error) => { console.log(error); });
  }

  getSkillDescription(url) {
    var self = this;
    return axios
    .get(url)
    .then((response) => {
      var obj = { name: response.data.name, desc: _.map(response.data.desc).join(', ')}
      return obj
    })
    .catch((error) => { console.log(error); });
  }

  fetchClasses() {
    var self = this;
    axios
    .get('http://www.dnd5eapi.co/api/classes/')
    .then((response) => {
      _.forEach(response.data.results, function(v) {
        self.fetchClassDetails(v.url);
      });
    })
    .catch((error) => { console.log(error); });
  }

  fetchClassDetails(url) {
    var self = this;
    axios
    .get(url)
    .then((response) => {
      var data = response.data;

      var obj = {};
      obj['name'] = data.name;
      obj['hits'] = data.hit_die;
      obj['proficiency'] = _.map(data.proficiencies, 'name')
      obj['subclass'] = _.map(data.subclasses, 'name')
      obj['savingThrows'] = _.map(data.saving_throws, 'name')

      var classTypeState = self.state.classType;

      classTypeState[data.name] = obj

      self.setState({
        classType: classTypeState
      });

      self.isDefined(data.spellcasting) && self.fetchSpelling(data.spellcasting.url);
      self.fetchStarting(data.starting_equipment.url)      
    })
    .catch((error) => { console.log(error); });
  }

  fetchSpelling(url) {
    var self = this;
    axios
    .get(url)
    .then((response) => {
      var data = response.data;
      var spelling = _.map(data.info, 'name')
      var obj = self.state.classType[data.class.name]
      obj['spellcasting'] = spelling

      var classTypeState = self.state.classType;
      classTypeState[data.name] = obj

      self.setState({
        classType: classTypeState
      });
    })
    .catch((error) => { console.log(error); });
  }

  fetchStarting(url) {
    var self = this;
    axios
    .get(url)
    .then((response) => {
      var data = response.data;

      var obj = self.state.classType[data.class.name]
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

      // console.log(data.class.name, obj['startingEquipmentOptions'][0][0])
      // console.log(data.class.name, JSON.stringify(obj['startingEquipmentOptions'], null, 2))

      var classTypeState = self.state.classType;
      classTypeState[data.name] = obj

      self.setState({
        classType: classTypeState
      });
    })
    .catch((error) => { console.log(error); });
  }

  fetchTooltips() {
    var self = this;
    axios
    .get('http://www.dnd5eapi.co/api/skills/')
    .then((response) => {
      for(var i=1; i <= response.data.count; i++) {
        self.fetchSkillsDescription('http://www.dnd5eapi.co/api/skills/'+i)
      }
    })
    .catch((error) => { console.log(error); });
  }

  fetchSkillsDescription(url) {
    var self = this;
    axios
    .get(url)
    .then((response) => {
      var obj = { name: response.data.name, desc: _.map(response.data.desc).join(', ')}
      var skillState = self.state.skill;
      skillState[response.data.name] = obj
      self.setState({
        skill: skillState
      });
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
    
    return (
      <Grid>
        <Row>
        {liList}
        </Row>
      </Grid>
      );
  }
}

export default App;
