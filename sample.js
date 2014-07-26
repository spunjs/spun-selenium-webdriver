var driverMap = {
 android: "android",
 chrome:  "chrome",
 ff:      "firefox",
 html:    "htmlunit",
 ie:      "ie",
 ipad:    "ipad",
 iphone:  "iphone",
 opera:   "opera",
 phantom: "phantomjs",
 safari:  "safari"
};
var wd = require("selenium-webdriver");
var By = wd.By;
var f  = require("util").format;
var seleniumBinaries = require("selenium-binaries");
var seleniumJar = seleniumBinaries.seleniumserver;
var SeleniumServer = require("selenium-webdriver/remote").SeleniumServer;
var browser = process.env.BROWSER || "chrome";
var builder = new wd.Builder();
var server;
if(browser !== "chrome"){
  server = new SeleniumServer(seleniumJar, {port: 4444});
  server.start();
  builder.usingServer(server.address());
}
var driver = builder
    .withCapabilities(wd.Capabilities[driverMap[browser]]())
    .build();
var lastLine;
function handleError(err){
  if(lastLine){
    console.error("The following error occured while executing");
    console.error(lastLine.text);
    console.error(f("Line %s", lastLine.number));
    console.error(f("File %s", lastLine.file));
  }
  if(driver.session_)driver.quit();
  setTimeout(function(){
    console.error(err.message);
    console.error(err.stack);
    process.exit(1);
  }, 1000);
}
process.on("uncaughtException", handleError);
var lastElement;
lastLine = {"command":"get","args":{"url":"http://google.com"},"number":1,"file":"sample.js","text":"get"};
driver.get("http://google.com")
  .then(
    function(){
    lastLine = {"command":"find","args":{"query":"[name=q]"},"number":2,"file":"sample.js","text":"find"};
    null
    },
    function(err){
      return handleError(err);
    }
  )
lastElement = driver.findElement(By.css("[name=q]"));
lastElement
  .then(
    function(){
    lastLine = {"command":"type","args":{"text":"where are the dinosaurs?"},"number":3,"file":"sample.js","text":"type"};
    null
    },
    function(err){
      return handleError(err);
    }
  )
lastElement.sendKeys("where are the dinosaurs?")
  .then(
    function(){
    lastLine = {"command":"submit","args":{},"number":4,"file":"sample.js","text":"submit"};
    null
    },
    function(err){
      return handleError(err);
    }
  )
lastElement.submit()
  .then(
    function(){
    lastLine = {"command":"sleep","args":{"amount":1},"number":5,"file":"sample.js","text":"sleep"};
    null
    },
    function(err){
      return handleError(err);
    }
  )
driver.sleep(1000)
  .then(
    function(){
    lastLine = {"command":"refresh","args":{},"number":6,"file":"sample.js","text":"refresh"};
    null
    },
    function(err){
      return handleError(err);
    }
  )
driver.navigate().refresh()
  .then(
    function(){
    lastLine = {"command":"sleep","args":{"amount":1},"number":7,"file":"sample.js","text":"sleep"};
    null
    },
    function(err){
      return handleError(err);
    }
  )
driver.sleep(1000)
  .then(
    function(){
    lastLine = {"command":"click","args":{"query":"#ires a"},"number":8,"file":"sample.js","text":"click"};
    null
    },
    function(err){
      return handleError(err);
    }
  )
driver.findElement(By.css("#ires a")).click()
  .then(
    function(){
    lastLine = {"command":"close","args":{},"number":9,"file":"sample.js","text":"close"};
    null
    },
    function(err){
      return handleError(err);
    }
  )
driver.close()
  .then(
    function(){
    lastLine = {"command":"quit","args":{},"number":10,"file":"sample.js","text":"quit"};
    null
    },
    function(err){
      return handleError(err);
    }
  )
driver.quit()
  .then(
    function(){
    
    null
    },
    function(err){
      return handleError(err);
    }
  )
