import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './app';
import template from './template';
import fetch from '../utils/fetch.js';

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
  res.json(req.url)
});
server.get('/c1', (req, res) => {
  res.json(req.url)
});
server.get('/c2', (req, res) => {
  res.json(req.url)
});
server.get('/c2_0', (req, res) => {
  res.json(req.url)
});
server.get('/c3', (req, res) => {
  res.json(req.url)
});
//监听请求
server.get('/*.html', (req, res) => {
  fetch.list = [];//清空即不缓存相同页面请求
  var domStr = '';
  try {
    domStr = renderToString(<App />);//bus.Main(req.url))
  } catch (e) {
    console.error("render error :: ", JSON.stringify(e));
  }
  var render = (domStr) => {
    res.send(template({
      body: domStr,
      title: 'Hello World from the server'
    }));
  };
  if (fetch.list.length) {//判断是否有网络请求
    Promise.all(fetch.list.map(function (item) {
      return fetch.get(item);
    })).then(() => render(renderToString(<App />)));
  } else {
    render(domStr);
  }
});

server.listen(8080);
console.log('listening');
