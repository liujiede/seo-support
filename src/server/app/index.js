import React, { Component, PropTypes } from 'react';
import fetch from '../../utils/fetch.js';
import C1 from '../appC1';
import C2 from '../appC2';
import C3 from '../appC3';
export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = { name: '666', txt: '666' }
  }
  componentWillMount() {
    var _this = this;
    fetch('/666?name=123').then(function (data) {
      _this.setState({ time: Object.keys(data)[0] + ":::" + data[Object.keys(data)[0]] });
    });
  }
  render() {
    return (
      <div>
        <h1>hello {this.state.name} time : {this.state.time}</h1>
        <C1 index='0' />
        <C2 index='0' />
        <C3 index='0' />
      </div>
    );
  }
}