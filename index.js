'use strict';

module.exports = Provider;

var composites = require('composites');
var f = require('util').format;
var path = require('path');
var dirname = path.dirname;
var Program = composites.Program;
var CompositeString = composites.CompositeString;
var chromedriverPath = dirname(require('selenium-binaries').chromedriver);

function Provider(argv){
  argv = argv || {};
  var program = new Program();

  var currentScope = program;
  var lastLine;

  program
    .push('var driverMap = {')
    .push(' android: "android",')
    .push(' chrome:  "chrome",')
    .push(' ff:      "firefox",')
    .push(' html:    "htmlunit",')
    .push(' ie:      "ie",')
    .push(' ipad:    "ipad",')
    .push(' iphone:  "iphone",')
    .push(' opera:   "opera",')
    .push(' phantom: "phantomjs",')
    .push(' safari:  "safari"')
    .push('};')
    .push('var path = require("path");')
    .push(f('process.env.PATH="%s" + path.delimiter + process.env.PATH;', chromedriverPath))
    .push('var wd = require("selenium-webdriver");')
    .push('var By = wd.By;')
    .push('var f  = require("util").format;')
    .push('var seleniumBinaries = require("selenium-binaries");')
    .push('var seleniumJar = seleniumBinaries.seleniumserver;')
    .push('var SeleniumServer = require("selenium-webdriver/remote").SeleniumServer;')
    .push('var browser = process.env.BROWSER || "chrome";')
    .push('var builder = new wd.Builder();')
    .push('var server;')
    .push('if(browser !== "chrome"){')
    .push('  server = new SeleniumServer(seleniumJar, {port: 4444});')
    .push('  server.start();')
    .push('  builder.usingServer(server.address());')
    .push('}')
    .push('var driver = builder')
    .push('    .withCapabilities(wd.Capabilities[driverMap[browser]]())')
    .push('    .build();')
    .push('var lastLine;')
    .push('function handleError(err){')
    .push('  if(lastLine){')
    .push('    console.error("The following error occured while executing");')
    .push('    console.error(lastLine.text);')
    .push('    console.error(f("Line %s", lastLine.number));')
    .push('    console.error(f("File %s", lastLine.file));')
    .push('  }')
    .push('  if(driver.session_)driver.quit();')
    .push('  setTimeout(function(){')
    .push('    console.error(err.message);')
    .push('    console.error(err.stack);')
    .push('    process.exit(1);')
    .push('  }, 1000);')
    .push('}')
    .push('process.on("uncaughtException", handleError);')
    .push('var lastElement;');

  this.click = function(args, line, spec){
    if(args.query)
      currentScope.push(f('driver.findElement(By.css("%s")).click()', args.query));
    else
      currentScope.push('lastElement.click()');
    addExceptionHandler(line);
  };

  this.close = function(args, line, spec){
    currentScope.push('driver.close()');
    addExceptionHandler(line);
  };

  this.find = function(args, line, spec){
    currentScope.push(f('lastElement = driver.findElement(By.css("%s"));', args.query));
    currentScope.push('lastElement');
    addExceptionHandler(line);
  };

  this.get = function(args, line, spec){
    if(!lastLine)currentScope.push(getLineAssignment(line));
    currentScope.push(f('driver.get("%s")', args.url));
    addExceptionHandler(line);
  };

  this.quit = function(args, line, spec){
    currentScope.push('driver.quit()');
    addExceptionHandler(line);
  };

  this.refresh = function(args, line, spec){
    currentScope.push('driver.navigate().refresh()');
    addExceptionHandler(line);
  };

  this.sleep = function(args, line, spec){
    currentScope.push(f('driver.sleep(%s)', args.amount * 1000));
    addExceptionHandler(line);
  };

  this.submit = function(args, line, spec){
    if(args.query)
      currentScope.push(f('driver.findElement(By.css("%s")).submit()', args.query));
    else
      currentScope.push('lastElement.submit()');
    addExceptionHandler(line);
  };

  this.type = function(args, line, spec){
    if(args.query)
      currentScope.push(f('driver.findElement(By.css("%s")).sendKeys("%s")', args.query, args.text));
    else
      currentScope.push(f('lastElement.sendKeys("%s")', args.text));
    addExceptionHandler(line);
  };

  this.toString = program.join;

  function getLineAssignment(line){
    return f('lastLine = %s;', JSON.stringify(line));
  }

  function addExceptionHandler(line){
    var verboseLogger = 'null';
    if(argv.verbose) verboseLogger = f('function(){console.log(%s);}', JSON.stringify(line));
    if(lastLine)lastLine.push(getLineAssignment(line));
    lastLine = new CompositeString();
    currentScope
      .push('  .then(')
      .push('    function(){')
      .push('    ', lastLine)
      .push(f('    %s', verboseLogger))
      .push('    },')
      .push('    function(err){')
      .push('      return handleError(err);')
      .push('    }')
      .push('  )');
  }
}

