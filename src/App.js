import React, { Component } from 'react';
import axios from 'axios';
import _ from 'lodash'
import scrollToElement from 'scroll-to-element'
import { Grid, Row } from 'react-bootstrap';
import NavComponent from './NavComponent';
import CharacterComponent from './CharacterComponent';
import FooterComponent from './FooterComponent';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      skill: {}, classType: {}
    }
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

      var profChoices = _.filter(data.proficiency_choices, function(o) { return o.type==="proficiencies"; })
      
      if (profChoices.length > 1) {
        profChoices = _.filter(profChoices, function(o) {
          return (_.includes(o.from[0].name, "Skill:"));
        });
      }
      profChoices = profChoices[0];

      var profChoicesMap = _.map(profChoices.from, function(p) {
        return _.replace(p.name, "Skill: ", "")
      })

      obj['proficiencyChoices'] = { choices: profChoicesMap, choose: profChoices.choose}
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

  getAbilityMapping() {
    var self = this;
    axios
    .get('http://www.dnd5eapi.co/api/ability-scores/')
    .then((response) => {
      let promises = [];
      _.forEach(response.data.results, function(v) {
        promises.push(self.getAbilityDescription(v.url));
      });

      axios.all(promises)
      .then(axios.spread((...args) => {
        self.setState({
          abilities: args
        });
      }));
    })
    .catch((error) => { console.log(error); });
  }

  getAbilityDescription(url) {
    return axios
    .get(url)
    .then((response) => {
      var obj = { name: response.data.name, fullname: response.data.full_name, desc: _.map(response.data.desc).join(', ')}
      return obj
    })
    .catch((error) => { console.log(error); });
  }

  componentWillMount() {
    axios.all([this.getClasses(), this.getToolTips(), this.getAbilityMapping()]);
  }

  scrollToClassType(name) {
    scrollToElement('#jumbo_'+name);
  }

  render() {
    const pageLoaded = this.state.classType.length;
    const divId = pageLoaded ? '' : 'loader'
    const classType = _.map(this.state.classType, "name");

    return (
      <div id={divId}>
        {
          !pageLoaded &&
          <p className='loaderText'>Fetching details...</p>
        }
        <NavComponent classType={classType} scrollToClassType={this.scrollToClassType}/>
        <Grid className='GridComponent'>    
          <Row>
            <CharacterComponent classType={this.state.classType} abilities={this.state.abilities} skills={this.state.skills} />
          </Row>
        </Grid>
        <FooterComponent pageHasLoaded={pageLoaded}/>
      </div>
    );
  }
}

export default App;
