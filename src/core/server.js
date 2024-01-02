/**
 * Dependencies
 */
import { createServer } from "http";
import { createServer as _createServer } from "https";
import { readFileSync } from "fs";
import { WebSocketServer } from "ws";
import modules from "./modules.js";
import { status } from "./message.js";

/**
 * Proxy constructor
 */
import Proxy from "./proxy.js";

/**
 * Initiate a server
 */
var Server = function Init(config) {
  var opts = {
    clientTracking: false,
    verifyClient: onRequestConnect,
  };

  if (config.ssl) {
    opts.server = _createServer(
      {
        key: readFileSync(config.key),
        cert: readFileSync(config.cert),
      },
      function (req, res) {
        res.writeHead(200);
        res.end("Secure wsProxy running...\n");
      }
    );

    opts.server.listen(config.port);

    status("Starting a secure wsProxy on port %s...", config.port);
  } else {
    opts.server = createServer(function (req, res) {
      res.writeHead(200);
      res.end("wsProxy running...\n");
    });

    opts.server.listen(config.port);

    status("Starting wsProxy on port %s...", config.port);
  }

  var server = new WebSocketServer(opts);

  server.on("connection", onConnection);

  return this;
};

/**
 * Before estabilishing a connection
 */
function onRequestConnect(info, callback) {
  // Once we get a response from our modules, pass it through
  modules.method.verify(info, function (res) {
    callback(res);
  });
}

/**
 * Connection passed through verify, lets initiate a proxy
 */
function onConnection(ws, req) {
  modules.method.connect(ws, function (res) {
    //All modules have processed the connection, lets start the proxy
    new Proxy(ws, req);
  });
}

/**
 * Exports
 */
export default Server;
