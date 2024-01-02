import { connect } from "net";
import { info, status } from "./message.js";
import { WebSocket } from "ws";
import { IncomingMessage } from "http";

/**
 * This class will handle the proxying of tcp over websockets for a given connection
 */
class Proxy {
  ws;
  tcp;
  from;
  to;

  /**
   * Constructor for Proxy
   *
   * @param {WebSocket} ws
   * @param {IncomingMessage} req
   */
  constructor(ws, req) {
    this.ws = ws;
    this.from = req.socket.remoteAddress;
    this.to = req.url.substring(1);

    // Bind data
    this.ws.on("message", this.clientData.bind(this));
    this.ws.on("close", this.close.bind(this));
    this.ws.on("error", this.close.bind(this));

    // Initialize proxy
    var args = this.to.split(":");

    // Connect to server
    info(
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
   * OnClose
   * Clean up events/sockets
   */
  close() {
    if (this.tcp) {
      info("Connection closed from '%s'.", this.to);

      this.tcp.removeListener("close", this.close.bind(this));
      this.tcp.removeListener("error", this.close.bind(this));
      this.tcp.removeListener("data", this.serverData.bind(this));
      this.tcp.end();
    }

    if (this.ws) {
      info("Connection closed from '%s'.", this.from);

      this.ws.removeListener("close", this.close.bind(this));
      this.ws.removeListener("error", this.close.bind(this));
      this.ws.removeListener("message", this.clientData.bind(this));
      this.ws.close();
    }
  }
  /**
   * On server accepts connection
   */
  connectAccept() {
    status("Connection accepted from '%s'.", this.to);
  }
}

/**
 * Exports
 */
export default Proxy;
