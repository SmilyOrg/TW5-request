(function () {

  /*jslint node: true, browser: true */
  /*global $tw: false */
  "use strict";

  let parsers;

  exports.name = "request";

  exports.after = ["rootwidget"];

  exports.startup = function () {
    $tw.rootWidget.addEventListener("request", request);
    parsers = $tw.modules.getModulesByTypeAsHashmap("requestparser");
  }

  function request(event, operation) {

    let targetTiddler = event.paramObject.targetTiddler || event.tiddlerTitle;
    const statusTiddler = event.paramObject.statusTiddler;

    function status(msg) {
      if (!statusTiddler) return;
      $tw.wiki.setText(statusTiddler, undefined, undefined, msg);
    }

    let url;
    const urlStr = event.paramObject.url;
    if (!urlStr) return status("Missing url field");
    try {
      url = new URL(urlStr);
    } catch (error) {
      return status("Invalid url");
    }

    const parser = parsers[url.host];
    if (!parser) {
      status("Unsupported");
      return;
    }

    console.log(event);

    status("Loading");

    let corsProxy = null;
    try {
      const corsProxyStr = $tw.wiki.getTiddlerText("$:/plugins/smilyorg/request/settings/proxy");
      if (corsProxyStr) {
        corsProxy = new URL(corsProxyStr);
      }
    } catch (error) {
      return status("Invalid proxy");
    }
    const proxied = (corsProxy ? corsProxy.href : '') + url.href;

    const req = new XMLHttpRequest();
    req.onreadystatechange = function () {

      if (req.readyState != 4) return;
      if (req.status != 200) {
        console.error(req);
        status("Error " + req.status);
        return;
      }

      const mime = req.getResponseHeader("Content-Type").replace(/;.*$/, "");
      status("Loaded");
      const text = req.responseText;

      const domParser = new DOMParser();
      const doc = domParser.parseFromString(text, mime);
      const parsed = parser.parse(doc);
      if (!parsed) {
        status("Parsed empty");
        return;
      }
      if (parsed.error) {
        status(parsed.error);
        return;
      }
      if (parsed.title) {
        if ($tw.wiki.getTiddler(targetTiddler).isDraft()) {
          parsed["draft.title"] = parsed.title;
        } else {
          $tw.wiki.renameTiddler(targetTiddler, parsed.title);
          targetTiddler = parsed.title;
        }
        delete parsed.title;
      }
      for (const paramName in parsed) {
        let value = parsed[paramName];
        if (Array.isArray(value)) {
          value = value
            .map(item => "[[" + item + "]]")
            .join(" ");
        }
        $tw.wiki.setText(targetTiddler, paramName, undefined, value);
      }
      status("");
    }

    req.open("GET", proxied, true);
    req.setRequestHeader("X-Requested-With", "tw5-request");
    req.send(null);

  };

})();