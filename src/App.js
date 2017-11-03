import React, { Component } from 'react';
import axios from 'axios';
import _ from 'lodash'
import scrollToElement from 'scroll-to-element'
import { Grid, Row } from 'react-bootstrap';
import NavComponent from './NavComponent';
import CharacterComponent from './CharacterComponent';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      skill: {}, classType: {}, loaded: false
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
    /*
    this.setState(
      {"skill":{},"classType":[{"name":"Barbarian","hits":12,"proficiency":["Light armor","Medium armor","Shields","Simple weapons","Martial weapons"],"proficiencyChoices":{"choices":["Animal Handling","Athletics","Intimidation","Nature","Perception","Survival"],"choose":2},"subclass":["Berserker"],"savingThrows":["STR","CON"],"startingEquipment":[{"item":"Explorer's Pack","quantity":1},{"item":"Javelin","quantity":4}],"startingEquipmentOptions":[[[{"item":"Greataxe","quantity":1}],[{"item":"Battleaxe","quantity":1},{"item":"Flail","quantity":1},{"item":"Glaive","quantity":1},{"item":"Greataxe","quantity":1},{"item":"Greatsword","quantity":1},{"item":"Halberd","quantity":1},{"item":"Lance","quantity":1},{"item":"Longsword","quantity":1},{"item":"Maul","quantity":1},{"item":"Morningstar","quantity":1},{"item":"Pike","quantity":1},{"item":"Rapier","quantity":1},{"item":"Scimitar","quantity":1},{"item":"Shortsword","quantity":1},{"item":"Trident","quantity":1},{"item":"War pick","quantity":1},{"item":"Warhammer","quantity":1},{"item":"Whip","quantity":1}]],[[{"item":"Handaxe","quantity":2}],[{"item":"Club","quantity":1},{"item":"Dagger","quantity":1},{"item":"Greatclub","quantity":1},{"item":"Handaxe","quantity":1},{"item":"Javelin","quantity":1},{"item":"Light hammer","quantity":1},{"item":"Mace","quantity":1},{"item":"Quarterstaff","quantity":1},{"item":"Sickle","quantity":1},{"item":"Spear","quantity":1},{"item":"Crossbow, light","quantity":1},{"item":"Dart","quantity":1},{"item":"Shortbow","quantity":1},{"item":"Sling","quantity":1}]]]},{"name":"Bard","hits":8,"proficiency":["Light armor","Simple weapons","Longswords","Rapiers","Shortswords","Crossbows, hand"],"proficiencyChoices":{"choices":["Acrobatics","Animal Handling","Arcana","Athletics","Deception","History","Insight","Intimidation","Investigation","Medicine","Nature","Perception","Performance","Persuasion","Religion","Sleight of Hand","Stealth","Survival"],"choose":3},"subclass":["Lore"],"savingThrows":["DEX","CHA"],"spellcasting":["Cantrips","Spell Slots","Spells Known of 1st Level and Higher","Spellcasting Ability","Ritual Casting","Spellcasting Focus"],"startingEquipment":[{"item":"Leather","quantity":1},{"item":"Dagger","quantity":1}],"startingEquipmentOptions":[[[{"item":"Rapier","quantity":1}],[{"item":"Longsword","quantity":1}],[{"item":"Club","quantity":1},{"item":"Dagger","quantity":1},{"item":"Greatclub","quantity":1},{"item":"Handaxe","quantity":1},{"item":"Javelin","quantity":1},{"item":"Light hammer","quantity":1},{"item":"Mace","quantity":1},{"item":"Quarterstaff","quantity":1},{"item":"Sickle","quantity":1},{"item":"Spear","quantity":1},{"item":"Crossbow, light","quantity":1},{"item":"Dart","quantity":1},{"item":"Shortbow","quantity":1},{"item":"Sling","quantity":1}]],[[{"item":"Diplomat's Pack","quantity":1}],[{"item":"Entertainer's Pack","quantity":1}]],[[{"item":"Lute","quantity":1}],[{"item":"Bagpipes","quantity":1},{"item":"Drum","quantity":1},{"item":"Dulcimer","quantity":1},{"item":"Flute","quantity":1},{"item":"Lute","quantity":1},{"item":"Lyre","quantity":1},{"item":"Horn","quantity":1},{"item":"Pan flute","quantity":1},{"item":"Shawm","quantity":1},{"item":"Viol","quantity":1}]]]},{"name":"Cleric","hits":8,"proficiency":["Light armor","Medium armor","Shields","Simple weapons"],"proficiencyChoices":{"choices":["History","Insight","Medicine","Persuasion","Religion"],"choose":2},"subclass":["Life"],"savingThrows":["WIS","CHA"],"spellcasting":["Cantrips","Preparing and Casting Spells","Spellcasting Ability","Ritual Casting","Spellcasting Focus"],"startingEquipment":[{"item":"Shield","quantity":1}],"startingEquipmentOptions":[[[{"item":"Mace","quantity":1}],[{"item":"Warhammer","quantity":1}]],[[{"item":"Scale Mail","quantity":1}],[{"item":"Leather","quantity":1}],[{"item":"Chain Mail","quantity":1}]],[[{"item":"Crossbow, light","quantity":1},{"item":"Crossbow bolt","quantity":20}],[{"item":"Club","quantity":1},{"item":"Dagger","quantity":1},{"item":"Greatclub","quantity":1},{"item":"Handaxe","quantity":1},{"item":"Javelin","quantity":1},{"item":"Light hammer","quantity":1},{"item":"Mace","quantity":1},{"item":"Quarterstaff","quantity":1},{"item":"Sickle","quantity":1},{"item":"Spear","quantity":1},{"item":"Crossbow, light","quantity":1},{"item":"Dart","quantity":1},{"item":"Shortbow","quantity":1},{"item":"Sling","quantity":1}]],[[{"item":"Priest's Pack","quantity":1}],[{"item":"Explorer's Pack","quantity":1}]],[[{"item":"Amulet","quantity":1},{"item":"Emblem","quantity":1},{"item":"Reliquary","quantity":1}]]]},{"name":"Druid","hits":8,"proficiency":["Light armor","Medium armor","Shields","Clubs","Daggers","Javelins","Maces","Quarterstaffs","Sickles","Spears","Darts","Slings","Scimitars","Herbalism Kit"],"proficiencyChoices":{"choices":["Animal Handling","Arcana","Insight","Medicine","Nature","Perception","Religion","Survival"],"choose":2},"subclass":["Land"],"savingThrows":["INT","WIS"],"spellcasting":["Cantrips","Preparing and Casting Spells","Spellcasting Ability","Ritual Casting","Spellcasting Focus"],"startingEquipment":[{"item":"Leather","quantity":1},{"item":"Explorer's Pack","quantity":1}],"startingEquipmentOptions":[[[{"item":"Shield","quantity":1}],[{"item":"Club","quantity":1},{"item":"Dagger","quantity":1},{"item":"Greatclub","quantity":1},{"item":"Handaxe","quantity":1},{"item":"Javelin","quantity":1},{"item":"Light hammer","quantity":1},{"item":"Mace","quantity":1},{"item":"Quarterstaff","quantity":1},{"item":"Sickle","quantity":1},{"item":"Spear","quantity":1},{"item":"Crossbow, light","quantity":1},{"item":"Dart","quantity":1},{"item":"Shortbow","quantity":1},{"item":"Sling","quantity":1}]],[[{"item":"Scimitar","quantity":1}],[{"item":"Club","quantity":1},{"item":"Dagger","quantity":1},{"item":"Greatclub","quantity":1},{"item":"Handaxe","quantity":1},{"item":"Javelin","quantity":1},{"item":"Light hammer","quantity":1},{"item":"Mace","quantity":1},{"item":"Quarterstaff","quantity":1},{"item":"Sickle","quantity":1},{"item":"Spear","quantity":1}]],[[{"item":"Sprig of mistletoe","quantity":1},{"item":"Totem","quantity":1},{"item":"Wooden staff","quantity":1},{"item":"Yew wand","quantity":1}]]]},{"name":"Fighter","hits":10,"proficiency":["All armor","Shields","Simple weapons","Martial weapons"],"proficiencyChoices":{"choices":["Acrobatics","Animal Handling","Athletics","History","Insight","Intimidation","Perception","Survival"],"choose":2},"subclass":["Champion"],"savingThrows":["STR","CON"],"startingEquipment":[],"startingEquipmentOptions":[[[{"item":"Chain Mail","quantity":1}],[{"item":"Leather","quantity":1},{"item":"Longbow","quantity":1},{"item":"Arrow","quantity":20}]],[[{"item":"Shield","quantity":1}],[{"item":"Battleaxe","quantity":1},{"item":"Flail","quantity":1},{"item":"Glaive","quantity":1},{"item":"Greataxe","quantity":1},{"item":"Greatsword","quantity":1},{"item":"Halberd","quantity":1},{"item":"Lance","quantity":1},{"item":"Longsword","quantity":1},{"item":"Maul","quantity":1},{"item":"Morningstar","quantity":1},{"item":"Pike","quantity":1},{"item":"Rapier","quantity":1},{"item":"Scimitar","quantity":1},{"item":"Shortsword","quantity":1},{"item":"Trident","quantity":1},{"item":"War pick","quantity":1},{"item":"Warhammer","quantity":1},{"item":"Whip","quantity":1},{"item":"Blowgun","quantity":1},{"item":"Crossbow, hand","quantity":1},{"item":"Crossbow, heavy","quantity":1},{"item":"Longbow","quantity":1},{"item":"Net","quantity":1}]],[[{"item":"Crossbow, light","quantity":1},{"item":"Crossbow bolt","quantity":20}],[{"item":"Handaxe","quantity":2}]],[[{"item":"Dungeoneer's Pack","quantity":1}],[{"item":"Explorer's Pack","quantity":1}]],[[{"item":"Battleaxe","quantity":1},{"item":"Flail","quantity":1},{"item":"Glaive","quantity":1},{"item":"Greataxe","quantity":1},{"item":"Greatsword","quantity":1},{"item":"Halberd","quantity":1},{"item":"Lance","quantity":1},{"item":"Longsword","quantity":1},{"item":"Maul","quantity":1},{"item":"Morningstar","quantity":1},{"item":"Pike","quantity":1},{"item":"Rapier","quantity":1},{"item":"Scimitar","quantity":1},{"item":"Shortsword","quantity":1},{"item":"Trident","quantity":1},{"item":"War pick","quantity":1},{"item":"Warhammer","quantity":1},{"item":"Whip","quantity":1},{"item":"Blowgun","quantity":1},{"item":"Crossbow, hand","quantity":1},{"item":"Crossbow, heavy","quantity":1},{"item":"Longbow","quantity":1},{"item":"Net","quantity":1}]]]},{"name":"Monk","hits":8,"proficiency":["Simple weapons","Shortswords"],"proficiencyChoices":{"choices":["Acrobatics","Athletics","History","Insight","Religion","Stealth"],"choose":2},"subclass":["Open Hand"],"savingThrows":["STR","DEX"],"startingEquipment":[{"item":"Dart","quantity":10}],"startingEquipmentOptions":[[[{"item":"Shortsword","quantity":1}],[{"item":"Club","quantity":1},{"item":"Dagger","quantity":1},{"item":"Greatclub","quantity":1},{"item":"Handaxe","quantity":1},{"item":"Javelin","quantity":1},{"item":"Light hammer","quantity":1},{"item":"Mace","quantity":1},{"item":"Quarterstaff","quantity":1},{"item":"Sickle","quantity":1},{"item":"Spear","quantity":1},{"item":"Crossbow, light","quantity":1},{"item":"Dart","quantity":1},{"item":"Shortbow","quantity":1},{"item":"Sling","quantity":1}]],[[{"item":"Dungeoneer's Pack","quantity":1}],[{"item":"Explorer's Pack","quantity":1}]]]},{"name":"Paladin","hits":10,"proficiency":["All armor","Shields","Simple weapons","Martial weapons"],"proficiencyChoices":{"choices":["Athletics","Insight","Intimidation","Medicine","Persuasion","Religion"],"choose":2},"subclass":["Devotion"],"savingThrows":["WIS","CHA"],"spellcasting":["Preparing and Casting Spells","Spellcasting Ability","Spellcasting Focus"],"startingEquipment":[{"item":"Chain Mail","quantity":1}],"startingEquipmentOptions":[[[{"item":"Shield","quantity":1}],[{"item":"Battleaxe","quantity":1},{"item":"Flail","quantity":1},{"item":"Glaive","quantity":1},{"item":"Greataxe","quantity":1},{"item":"Greatsword","quantity":1},{"item":"Halberd","quantity":1},{"item":"Lance","quantity":1},{"item":"Longsword","quantity":1},{"item":"Maul","quantity":1},{"item":"Morningstar","quantity":1},{"item":"Pike","quantity":1},{"item":"Rapier","quantity":1},{"item":"Scimitar","quantity":1},{"item":"Shortsword","quantity":1},{"item":"Trident","quantity":1},{"item":"War pick","quantity":1},{"item":"Warhammer","quantity":1},{"item":"Whip","quantity":1},{"item":"Blowgun","quantity":1},{"item":"Crossbow, hand","quantity":1},{"item":"Crossbow, heavy","quantity":1},{"item":"Longbow","quantity":1},{"item":"Net","quantity":1}]],[[{"item":"Javelin","quantity":5}],[{"item":"Club","quantity":1},{"item":"Dagger","quantity":1},{"item":"Greatclub","quantity":1},{"item":"Handaxe","quantity":1},{"item":"Javelin","quantity":1},{"item":"Light hammer","quantity":1},{"item":"Mace","quantity":1},{"item":"Quarterstaff","quantity":1},{"item":"Sickle","quantity":1},{"item":"Spear","quantity":1},{"item":"Crossbow, light","quantity":1},{"item":"Dart","quantity":1},{"item":"Shortbow","quantity":1},{"item":"Sling","quantity":1}]],[[{"item":"Priest's Pack","quantity":1}],[{"item":"Explorer's Pack","quantity":1}]],[[{"item":"Amulet","quantity":1},{"item":"Emblem","quantity":1},{"item":"Reliquary","quantity":1}]],[[{"item":"Battleaxe","quantity":1},{"item":"Flail","quantity":1},{"item":"Glaive","quantity":1},{"item":"Greataxe","quantity":1},{"item":"Greatsword","quantity":1},{"item":"Halberd","quantity":1},{"item":"Lance","quantity":1},{"item":"Longsword","quantity":1},{"item":"Maul","quantity":1},{"item":"Morningstar","quantity":1},{"item":"Pike","quantity":1},{"item":"Rapier","quantity":1},{"item":"Scimitar","quantity":1},{"item":"Shortsword","quantity":1},{"item":"Trident","quantity":1},{"item":"War pick","quantity":1},{"item":"Warhammer","quantity":1},{"item":"Whip","quantity":1},{"item":"Blowgun","quantity":1},{"item":"Crossbow, hand","quantity":1},{"item":"Crossbow, heavy","quantity":1},{"item":"Longbow","quantity":1},{"item":"Net","quantity":1}]]]},{"name":"Ranger","hits":10,"proficiency":["Light armor","Medium armor","Shields","Simple weapons","Martial weapons"],"proficiencyChoices":{"choices":["Animal Handling","Athletics","Insight","Investigation","Nature","Perception","Stealth","Survival"],"choose":3},"subclass":["Hunter"],"savingThrows":["STR","DEX"],"spellcasting":["Spell Slots","Spells Known of 1st Level and Higher","Spellcasting Ability"],"startingEquipment":[{"item":"Longbow","quantity":1},{"item":"Arrow","quantity":20}],"startingEquipmentOptions":[[[{"item":"Scale Mail","quantity":1}],[{"item":"Shortsword","quantity":1}]],[[{"item":"Dungeoneer's Pack","quantity":2}],[{"item":"Club","quantity":1},{"item":"Dagger","quantity":1},{"item":"Greatclub","quantity":1},{"item":"Handaxe","quantity":1},{"item":"Javelin","quantity":1},{"item":"Light hammer","quantity":1},{"item":"Mace","quantity":1},{"item":"Quarterstaff","quantity":1},{"item":"Sickle","quantity":1},{"item":"Spear","quantity":1}]],[[{"item":"Dungeoneer's Pack","quantity":1}],[{"item":"Explorer's Pack","quantity":1}]]]},{"name":"Rogue","hits":8,"proficiency":["Light armor","Simple weapons","Longswords","Rapiers","Shortswords","Crossbows, hand","Thieves' Tools"],"proficiencyChoices":{"choices":["Acrobatics","Athletics","Deception","Insight","Intimidation","Investigation","Perception","Performance","Persuasion","Sleight of Hand","Stealth"],"choose":4},"subclass":["Thief"],"savingThrows":["DEX","INT"],"startingEquipment":[{"item":"Leather","quantity":1},{"item":"Dagger","quantity":2},{"item":"Thieves’ tools","quantity":1}],"startingEquipmentOptions":[[[{"item":"Rapier","quantity":1}],[{"item":"Shortsword","quantity":1}]],[[{"item":"Shortbow","quantity":1},{"item":"Arrow","quantity":20}],[{"item":"Shortsword","quantity":1}]],[[{"item":"Burglar's Pack","quantity":1}],[{"item":"Dungeoneer's Pack","quantity":1}],[{"item":"Explorer's Pack","quantity":1}]]]},{"name":"Sorcerer","hits":6,"proficiency":["Daggers","Quarterstaffs","Darts","Slings"],"proficiencyChoices":{"choices":["Arcana","Deception","Insight","Intimidation","Persuasion","Religion"],"choose":2},"subclass":["Draconic"],"savingThrows":["CON","CHA"],"spellcasting":["Cantrips","Spell Slots","Spells Known of 1st Level and Higher","Spellcasting Ability","Spellcasting Focus"],"startingEquipment":[{"item":"Dagger","quantity":2}],"startingEquipmentOptions":[[[{"item":"Crossbow, light","quantity":1},{"item":"Crossbow bolt","quantity":20}],[{"item":"Club","quantity":1},{"item":"Dagger","quantity":1},{"item":"Greatclub","quantity":1},{"item":"Handaxe","quantity":1},{"item":"Javelin","quantity":1},{"item":"Light hammer","quantity":1},{"item":"Mace","quantity":1},{"item":"Quarterstaff","quantity":1},{"item":"Sickle","quantity":1},{"item":"Spear","quantity":1},{"item":"Crossbow, light","quantity":1},{"item":"Dart","quantity":1},{"item":"Shortbow","quantity":1},{"item":"Sling","quantity":1}]],[[{"item":"Component pouch","quantity":2}],[{"item":"Crystal","quantity":1},{"item":"Orb","quantity":1},{"item":"Rod","quantity":1},{"item":"Staff","quantity":1},{"item":"Wand","quantity":1}]],[[{"item":"Dungeoneer's Pack","quantity":1}],[{"item":"Explorer's Pack","quantity":1}]]]},{"name":"Warlock","hits":8,"proficiency":["Light armor","Simple weapons"],"proficiencyChoices":{"choices":["Arcana","Deception","History","Intimidation","Investigation","Nature","Religion"],"choose":2},"subclass":["Fiend"],"savingThrows":["WIS","CHA"],"spellcasting":["Cantrips","Spell Slots","Spells Known of 1st Level and Higher","Spellcasting Ability","Spellcasting Focus"],"startingEquipment":[{"item":"Dagger","quantity":2},{"item":"Leather","quantity":1}],"startingEquipmentOptions":[[[{"item":"Crossbow, light","quantity":1},{"item":"Crossbow bolt","quantity":20}],[{"item":"Club","quantity":1},{"item":"Dagger","quantity":1},{"item":"Greatclub","quantity":1},{"item":"Handaxe","quantity":1},{"item":"Javelin","quantity":1},{"item":"Light hammer","quantity":1},{"item":"Mace","quantity":1},{"item":"Quarterstaff","quantity":1},{"item":"Sickle","quantity":1},{"item":"Spear","quantity":1},{"item":"Crossbow, light","quantity":1},{"item":"Dart","quantity":1},{"item":"Shortbow","quantity":1},{"item":"Sling","quantity":1}]],[[{"item":"Component pouch","quantity":2}],[{"item":"Crystal","quantity":1},{"item":"Orb","quantity":1},{"item":"Rod","quantity":1},{"item":"Staff","quantity":1},{"item":"Wand","quantity":1}]],[[{"item":"Scholar's Pack","quantity":1}],[{"item":"Dungeoneer's Pack","quantity":1}]],[[{"item":"Club","quantity":1},{"item":"Dagger","quantity":1},{"item":"Greatclub","quantity":1},{"item":"Handaxe","quantity":1},{"item":"Javelin","quantity":1},{"item":"Light hammer","quantity":1},{"item":"Mace","quantity":1},{"item":"Quarterstaff","quantity":1},{"item":"Sickle","quantity":1},{"item":"Spear","quantity":1},{"item":"Crossbow, light","quantity":1},{"item":"Dart","quantity":1},{"item":"Shortbow","quantity":1},{"item":"Sling","quantity":1}]]]},{"name":"Wizard","hits":6,"proficiency":["Daggers","Quarterstaffs","Darts","Slings"],"proficiencyChoices":{"choices":["Arcana","History","Insight","Investigation","Medicine","Religion"],"choose":2},"subclass":["Evocation"],"savingThrows":["INT","WIS"],"spellcasting":["Cantrips","Spellbook","Preparing and Casting Spells","Spellcasting Ability","Ritual Casting","Spellcasting Focus"],"startingEquipment":[{"item":"Spellbook","quantity":1}],"startingEquipmentOptions":[[[{"item":"Dagger","quantity":1}],[{"item":"Quarterstaff","quantity":1}]],[[{"item":"Component pouch","quantity":2}],[{"item":"Crystal","quantity":1},{"item":"Orb","quantity":1},{"item":"Rod","quantity":1},{"item":"Staff","quantity":1},{"item":"Wand","quantity":1}]],[[{"item":"Scholar's Pack","quantity":1}],[{"item":"Dungeoneer's Pack","quantity":1}]]]}],"loaded":true,"skills":[{"name":"Acrobatics","desc":"Your Dexterity (Acrobatics) check covers your attempt to stay on your feet in a tricky situation, such as when you’re trying to run across a sheet of ice, balance on a tightrope, or stay upright on a rocking ship’s deck. The GM might also call for a Dexterity (Acrobatics) check to see if you can perform acrobatic stunts, including dives, rolls, somersaults, and flips."},{"name":"Animal Handling","desc":"When there is any question whether you can calm down a domesticated animal, keep a mount from getting spooked, or intuit an animal’s intentions, the GM might call for a Wisdom (Animal Handling) check. You also make a Wisdom (Animal Handling) check to control your mount when you attempt a risky maneuver."},{"name":"Arcana","desc":"Your Intelligence (Arcana) check measures your ability to recall lore about spells, magic items, eldritch symbols, magical traditions, the planes of existence, and the inhabitants of those planes."},{"name":"Athletics","desc":"Your Strength (Athletics) check covers difficult situations you encounter while climbing, jumping, or swimming."},{"name":"Deception","desc":"Your Charisma (Deception) check determines whether you can convincingly hide the truth, either verbally or through your actions. This deception can encompass everything from misleading others through ambiguity to telling outright lies. Typical situations include trying to fast- talk a guard, con a merchant, earn money through gambling, pass yourself off in a disguise, dull someone’s suspicions with false assurances, or maintain a straight face while telling a blatant lie."},{"name":"History","desc":"Your Intelligence (History) check measures your ability to recall lore about historical events, legendary people, ancient kingdoms, past disputes, recent wars, and lost civilizations."},{"name":"Insight","desc":"Your Wisdom (Insight) check decides whether you can determine the true intentions of a creature, such as when searching out a lie or predicting someone’s next move. Doing so involves gleaning clues from body language, speech habits, and changes in mannerisms."},{"name":"Intimidation","desc":"When you attempt to influence someone through overt threats, hostile actions, and physical violence, the GM might ask you to make a Charisma (Intimidation) check. Examples include trying to pry information out of a prisoner, convincing street thugs to back down from a confrontation, or using the edge of a broken bottle to convince a sneering vizier to reconsider a decision."},{"name":"Investigation","desc":"When you look around for clues and make deductions based on those clues, you make an Intelligence (Investigation) check. You might deduce the location of a hidden object, discern from the appearance of a wound what kind of weapon dealt it, or determine the weakest point in a tunnel that could cause it to collapse. Poring through ancient scrolls in search of a hidden fragment of knowledge might also call for an Intelligence (Investigation) check."},{"name":"Medicine","desc":"A Wisdom (Medicine) check lets you try to stabilize a dying companion or diagnose an illness."},{"name":"Nature","desc":"Your Intelligence (Nature) check measures your ability to recall lore about terrain, plants and animals, the weather, and natural cycles."},{"name":"Perception","desc":"Your Wisdom (Perception) check lets you spot, hear, or otherwise detect the presence of something. It measures your general awareness of your surroundings and the keenness of your senses. For example, you might try to hear a conversation through a closed door, eavesdrop under an open window, or hear monsters moving stealthily in the forest. Or you might try to spot things that are obscured or easy to miss, whether they are orcs lying in ambush on a road, thugs hiding in the shadows of an alley, or candlelight under a closed secret door."},{"name":"Performance","desc":"Your Charisma (Performance) check determines how well you can delight an audience with music, dance, acting, storytelling, or some other form of entertainment."},{"name":"Persuasion","desc":"When you attempt to influence someone or a group of people with tact, social graces, or good nature, the GM might ask you to make a Charisma (Persuasion) check. Typically, you use persuasion when acting in good faith, to foster friendships, make cordial requests, or exhibit proper etiquette. Examples of persuading others include convincing a chamberlain to let your party see the king, negotiating peace between warring tribes, or inspiring a crowd of townsfolk."},{"name":"Religion","desc":"Your Intelligence (Religion) check measures your ability to recall lore about deities, rites and prayers, religious hierarchies, holy symbols, and the practices of secret cults."},{"name":"Sleight of Hand","desc":"Whenever you attempt an act of legerdemain or manual trickery, such as planting something on someone else or concealing an object on your person, make a Dexterity (Sleight of Hand) check. The GM might also call for a Dexterity (Sleight of Hand) check to determine whether you can lift a coin purse off another person or slip something out of another person’s pocket."},{"name":"Stealth","desc":"Make a Dexterity (Stealth) check when you attempt to conceal yourself from enemies, slink past guards, slip away without being noticed, or sneak up on someone without being seen or heard."},{"name":"Survival","desc":"The GM might ask you to make a Wisdom (Survival) check to follow tracks, hunt wild game, guide your group through frozen wastelands, identify signs that owlbears live nearby, predict the weather, or avoid quicksand and other natural hazards."}],"abilities":[{"name":"STR","fullname":"Strength","desc":"Strength measures bodily power, athletic training, and the extent to which you can exert raw physical force., A Strength check can model any attempt to lift, push, pull, or break something, to force your body through a space, or to otherwise apply brute force to a situation. The Athletics skill reflects aptitude in certain kinds of Strength checks."},{"name":"DEX","fullname":"Dexterity","desc":"Dexterity measures agility, reflexes, and balance., A Dexterity check can model any attempt to move nimbly, quickly, or quietly, or to keep from falling on tricky footing. The Acrobatics, Sleight of Hand, and Stealth skills reflect aptitude in certain kinds of Dexterity checks."},{"name":"CON","fullname":"Constitution","desc":"Constitution measures health, stamina, and vital force., Constitution checks are uncommon, and no skills apply to Constitution checks, because the endurance this ability represents is largely passive rather than involving a specific effort on the part of a character or monster."},{"name":"INT","fullname":"Intelligence","desc":"Intelligence measures mental acuity, accuracy of recall, and the ability to reason., An Intelligence check comes into play when you need to draw on logic, education, memory, or deductive reasoning. The Arcana, History, Investigation, Nature, and Religion skills reflect aptitude in certain kinds of Intelligence checks."},{"name":"WIS","fullname":"Wisdom","desc":"Wisdom reflects how attuned you are to the world around you and represents perceptiveness and intuition., A Wisdom check might reflect an effort to read body language, understand someone’s feelings, notice things about the environment, or care for an injured person. The Animal Handling, Insight, Medicine, Perception, and Survival skills reflect aptitude in certain kinds of Wisdom checks."},{"name":"CHA","fullname":"Charisma","desc":"Charisma measures your ability to interact effectively with others. It includes such factors as confidence and eloquence, and it can represent a charming or commanding personality., A Charisma check might arise when you try to influence or entertain others, when you try to make an impression or tell a convincing lie, or when you are navigating a tricky social situation. The Deception, Intimidation, Performance, and Persuasion skills reflect aptitude in certain kinds of Charisma checks."}]}
    )
    */
  }

  scrollToClassType(name) {
    scrollToElement('#jumbo_'+name);
  }

  render() {
    const divId = this.state.loaded ? '' : 'loader'
    const classType = _.map(this.state.classType, "name");
    return (
      <div id={divId}>
        <NavComponent classType={classType} scrollToClassType={this.scrollToClassType} pageHasLoaded={this.state.loaded}/>
        <Grid className='GridComponent'>
          <Row>
            <CharacterComponent classType={this.state.classType} abilities={this.state.abilities} skills={this.state.skills} />
          </Row>
        </Grid>
      </div>
    );
  }
}

export default App;
