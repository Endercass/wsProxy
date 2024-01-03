import { connect } from "net";
import { WebSocket } from "ws";
import { IncomingMessage } from "http";

/**
 * The configuration for the proxy
 * @typedef {Object} ProxyConfig
 * @property {boolean} failOnError - Whether to close the connection on errors.
 */

/**
 * This class will handle the proxying of tcp over websockets for a given connection
 */
class SocketProxy {
  ws;
  tcp;
  from;
  to;

  config;
  /**
   * Constructor for Proxy
   *
   * @param {WebSocket} ws
   * @param {IncomingMessage} req
   * @param {ProxyConfig} config
   */
  constructor(ws, req, config) {
    this.ws = ws;
    this.config = config;

    this.from = req.socket.remoteAddress;
    this.to = req.url.substring(1);

    /**
     * Special config display mode
     * This will display the config to the client, without
     * proxying anything. It can be accessed by using the
     * destination "!cfg" (e.g. ws://localhost:5999/!cfg)
     * The reason that the exclamation mark is used is to
     * prevent any conflicts domain names.
     */
    if (this.to === "!cfg") {
      let safeConfig = {
        port: config.port,
        ssl_enabled: config.ssl,
        modules: {},
      };

      // Only show the presence of ssl keys if ssl is enabled
      // Even if ssl is enabled, don't show the keys themselves
      if (config.ssl) {
        safeConfig.ssl_key = "[hidden]";
        safeConfig.ssl_cert = "[hidden]";
      }

      // Populate the config display with the modules that are enabled
      Object.keys(this.config.modules.configs).forEach((module_name) => {
        let module = this.config.modules.configs[module_name];
        if (!module.hide) {
          safeConfig.modules[module_name] = module.config;
        }
      });

      this.ws.on("message", () => {
        this.ws.send(JSON.stringify(safeConfig));
      });

      return; // Don't do anything else, we're just displaying the config
    }

    // Bind data
    this.ws.on("message", this.clientData.bind(this));
    this.ws.on("close", this.close.bind(this));
    this.ws.on("error", this.close.bind(this));

    // Initialize proxy
    var args = this.to.split(":");

    // Connect to server
    this.config.logger.info(
      "Requested connection from '%s' to '%s' [ACCEPTED].",
      this.from,
      this.to
    );
    this.tcp = connect(args[1], args[0]);

    // Disable nagle algorithm
    this.tcp.setTimeout(0);
    this.tcp.setNoDelay(true);

    this.tcp.on("data", this.serverData.bind(this));
    this.tcp.on("close", this.close.bind(this));
    this.tcp.on("error", function (error) {
      console.log(error);
    });

    this.tcp.on("connect", this.connectAccept.bind(this));
  }

  /**
   * OnClientData
   * Client -> Server
   */
  clientData(data) {
    if (!this.tcp) {
      throw new Error(
        "TCP socket does not exist. Have you initialized the proxy?"
      );
    }

    try {
      this.tcp.write(data);
    } catch (e) {
      throw new Error("TCP socket write error: " + e);
    }
  }

  /**
   * OnServerData
   * Server -> Client
   */
  serverData(data) {
    if (this.ws.protocol == "binary")
      this.ws.send(data, function (error) {
        /*
              if (error !== null) {
                  OnClose();
              }
              */
      });
    else
      this.ws.send(data.toString("base64"), function (error) {
        /*
              if (error !== null) {
                  OnClose();
              }
              */
      });
  }
  /**
   * This function is called when the connection is closed.
   * It will close the tcp and websocket connections, and
   * clean up the listeners.
   */
  close() {
    if (this.tcp) {
      this.config.logger.info("Connection closed from '%s'.", this.to);

      this.tcp.removeListener("close", this.close.bind(this));
      this.tcp.removeListener("error", this.close.bind(this));
      this.tcp.removeListener("data", this.serverData.bind(this));
      this.tcp.end();
    }

    if (this.ws) {
      this.config.logger.info("Connection closed from '%s'.", this.from);

      this.ws.removeListener("close", this.close.bind(this));
      this.ws.removeListener("error", this.close.bind(this));
      this.ws.removeListener("message", this.clientData.bind(this));
      this.ws.close();
    }
  }
  /**
   * This function is called when the connection to the server is accepted.
   */
  connectAccept() {
    this.config.logger.status("Connection accepted from '%s'.", this.to);
  }
}

/**
 * Export SocketProxy
 */
export default SocketProxy;
