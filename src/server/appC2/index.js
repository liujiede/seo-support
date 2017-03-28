import React, { Component, PropTypes } from 'react';
import fetch from '../../utils/fetch.js';
import C2_0 from '../appC2_0';
export default class C2 extends Component {
  constructor(props) {
    super(props);
    this.state = { name: 'c2', txt: 'c2' }
  }
  componentWillMount() {
    var _this = this;
    fetch('https://m.elong.com/hotelwxxcx/getserverdate/').then(function (data) {
      _this.setState({ time: Object.keys(data)[0] + ":::" + data[Object.keys(data)[0]] });
    });
  }
  render() {

    return (
      <div>
        <h1>hello {this.state.name} time : {this.state.time}</h1>
        <C2_0 index='0' />
      </div>
    );
  }
}