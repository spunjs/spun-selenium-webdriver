'use strict';

var fs = require('fs');
var read = fs.readFileSync;
var fork = require('child_process').fork;
var Provider = require('..');
var once = require('once');
var handleError = once(function(err){
  if(typeof err === 'number' && err){
    err = new Error('exited with ' + err);
  }
  if(err) throw err;
});

process.env.BROWSER = process.env.BROWSER || 'chrome';

var currentLine = 1;
var lines = [];
var addLine = function(line){
  line.number = currentLine++;
  line.file = 'sample.js';
  line.text = line.command;
  lines.push(line);
};

addLine({command: 'get', args: {url: 'http://google.com'}});
addLine({command: 'find', args: {query: '[name=q]'}});
addLine({command: 'type', args: {text: 'where are the dinosaurs?'}});
addLine({command: 'submit', args: {}});
addLine({command: 'sleep', args: {amount: 1}});
addLine({command: 'refresh', args: {}});
addLine({command: 'sleep', args: {amount: 1}});
addLine({command: 'click', args: {query: '#ires a'}});
addLine({command: 'close', args: {}});
addLine({command: 'quit', args: {}});

var provider = new Provider();
lines.forEach(function(line){
  provider[line.command](line.args, line, {lines: lines});
});
fs.writeFileSync('sample.js', provider.toString());
var proc = fork('sample.js');
proc.on('error', handleError);
proc.on('exit', handleError);

