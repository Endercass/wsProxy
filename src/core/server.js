/**
 * Dependencies
 */
import { createServer as createHttpServer } from "http";
import { createServer as createHttpsServer } from "https";
import { readFileSync } from "fs";
import { WebSocketServer } from "ws";

/**
 * Proxy constructor
 */
import Proxy from "./proxy.js";

class Server {
  config;

  /**
   * Constructor for Server
   * @param {Object} config
   */
  constructor(config) {
    this.config = config;
  }

  /**
   * Before estabilishing a connection
   */
  onRequestConnect(info, callback) {
    // Once we get a response from our modules, pass it through
    this.config.modules.verify(this.config.logger, info, (res) => {
      callback(res);
    });
  }

  /**
   * Connection passed through verify, lets initiate a proxy
   */
  onConnection(ws, req) {
    this.config.modules.connect(this.config.logger, ws, (res) => {
      //All modules have processed the connection, lets start the proxy
      new Proxy(ws, req, this.config);
    });
  }

  /**
   * Start the server
   */
  listen() {
    let opts = {
      clientTracking: false,
      verifyClient: this.onRequestConnect.bind(this),
    };

    if (this.config.ssl) {
      opts.server = createHttpsServer(
        {
          key: readFileSync(this.config.key),
          cert: readFileSync(this.config.cert),
        },
        function (req, res) {
          res.writeHead(200);
          res.end("Secure wsProxy running...\n");
        }
      );
    } else {
      opts.server = createHttpServer(function (req, res) {
        res.writeHead(200);
        res.end("wsProxy running...\n");
      });
    }

    opts.server.listen(this.config.port);

    this.config.logger.status(
      "Starting wsProxy on port %s...",
      this.config.port
    );

    const wss = new WebSocketServer(opts);

    wss.on("connection", this.onConnection.bind(this));
  }
}

/**
 * Exports
 */
export default Server;
