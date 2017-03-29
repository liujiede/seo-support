import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './app';
import template from './template';
import fetch from '../utils/fetch.js';//将来是 bus.Fetch

const server = express();

function mockRequest(tag) {
  return new Promise(function (res, rej) {
    var random = Math.ceil(Math.random() * 1000);
    console.log('request ', tag, '=>', random);
    setTimeout(function () {
      res(random);
    }, random);
  });
}
server.get('/666', (req, res) => {
  res.json({ [req.url]: Math.random() })
});
server.get('/c1', (req, res) => {
  res.json({ [req.url]: Math.random() })
});
server.get('/c11', (req, res) => {
  res.json({ [req.url]: Math.random() })
});
server.get('/c2', (req, res) => {
  res.json({ [req.url]: Math.random() })
});
server.get('/c2_0', (req, res) => {
  res.json({ [req.url]: Math.random() })
});
server.get('/c3', (req, res) => {
  res.json({ [req.url]: Math.random() })
});

//监听请求
server.get('/*.html', (req, res) => {
  //var bus = __business__(loader.extend());
  (function render() {
    fetch.list = [];
    var domStr = '';
    try {
      domStr = renderToString(<App />);//bus.Main(req.url))
    } catch (e) {
      console.error("render error :: ", JSON.stringify(e));
    }
    console.log(fetch.list.length);
    if (fetch.list.length) {//判断是否有网络请求
      fetch.all().then(render);
    } else {
      response(res, domStr);
    }
  })();
});

server.listen(8080);
console.log('listening');

function response(res, domStr) {
  res.send(template({
    body: domStr,
    title: 'Hello World from the server'
  }));
};