import React, { Component, PropTypes } from 'react';
import fetch from '../../utils/fetch.js';
export default class C1 extends Component {
  constructor(props) {
    super(props);
    this.state = { name: 'c1', txt: 'c1' }
  }
  componentWillMount() {
    var _this = this;
    fetch('/c1').then(function (data) {
    _this.setState({ time: data });
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
