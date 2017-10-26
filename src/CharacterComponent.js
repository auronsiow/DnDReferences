import React, { Component } from 'react';
import axios from 'axios';
import _ from 'lodash'
import 'whatwg-fetch'

class CharacterComponent extends Component {
  componentWillMount() {
    axios.defaults.baseURL = '';

    axios.get(this.props.data.url)
      .then( (response) => {
          // var temp = _.map(response.data.results, 'name');
          const data = response.data
console.log(data)
          this.setState({
            hits: data.hit_die,
            proficiencies: _.map(data.proficiencies, 'name')
          });
      })
      .catch( (error) => {
        console.log(error);
      });
  }

  render() {
  	const data = this.props.data;
  	const name = data.name;
    return (
      <div>
         <p>{name}</p>
         {
         	this.state && 
         	<div>
         		<p>Dead by {this.state.hits}</p>
         		<p>Good at {this.state.proficiencies}</p>
         	</div>
         }
         
      </div>
    );
  }
}

export default CharacterComponent;
