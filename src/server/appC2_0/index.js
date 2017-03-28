import React, { Component, PropTypes } from 'react';
import fetch from '../../utils/fetch.js';
export default class C2_0 extends Component {
  constructor(props) {
    super(props);
    this.state = { name: 'c2_0', txt: 'c2_0' }
  }
  componentWillMount() {
    var _this = this;
    fetch('/c2_0').then(function (data) {
      _this.setState({ time: Object.keys(data)[0] + ":::" + data[Object.keys(data)[0]] });
    });
  }
  render() {

    return (
      <div>
        <h1>hello {this.state.name} time : {this.state.time}</h1>
      </div>
    );
  }
}