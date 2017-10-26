import React, { Component } from 'react';
import axios from 'axios';
import _ from 'lodash'
// import logo from './logo.svg';
// import './App.css';

// Bug: Observed that Wizard's starting equipment choices to make is 4 but only 3 are available

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      skill: []
    }
  }

  isDefined(variable) { 
    return typeof variable !== 'undefined';
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
      // console.log("Detailed Results:", response.data)
      var data = response.data;

      var obj = {};
      obj['name'] = data.name;
      obj['hits'] = data.hit_die;
      obj['proficiency'] = _.map(data.proficiencies, 'name')
      obj['subclass'] = _.map(data.subclasses, 'name')
      obj['savingThrows'] = _.map(data.saving_throws, 'name')

      self.setState({
        [data.name]: obj
      });

      self.isDefined(data.spellcasting) && self.fetchSpelling(data.spellcasting.url);
      self.fetchStarting(data.starting_equipment.url, data.name)
      // data.spellcasting && 

      
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
      var obj = self.state[data.class.name]
      obj['spellcasting'] = spelling
      self.setState({
        [data.class.name]: obj
      });
    })
    .catch((error) => { console.log(error); });
  }

  fetchStarting(url, inname) {
    var self = this;
    axios
    .get(url)
    .then((response) => {
      var data = response.data;

      var obj = self.state[data.class.name]
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

      self.setState({
        [data.class.name]: obj
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

    
    // axios({
    //   method: 'get',
    //   url: 'https://www.dnd5eapi.co/api/classes/',
    // }).then(function(response) {
    //   console.log(response)
    // })
  }

  componentDidMount() {
    this.fetchClasses();
    this.fetchTooltips()
  }

  render() {

    let liList = []
    _.forEach(this.state.classType,  function(v) {
      liList.push(<p>{v}</p>)
    })

    // console.log("State", this.state)

    return (
      <div className="App">
        {/*<header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
  */}
        <div>
        </div>
      </div>
    );
  }
}

export default App;
