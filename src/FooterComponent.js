import React, { Component } from 'react';

class FooterComponent extends Component {
  render() {
    const pageHasLoaded = this.props.pageHasLoaded;
    return (
      <div>
        {
          pageHasLoaded &&
          <footer>
            <p>Created by: Auron Siow</p>
            <p>Contact info: <a href='mailto:quicklimebluessaliva@hotmail.com'>quicklimebluessaliva@hotmail.com</a></p>
          </footer>
        }
      </div>
        
    )
  }
}

export default FooterComponent;
