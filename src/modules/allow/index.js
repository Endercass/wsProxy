// Logs
import { info as _info } from "../../core/message.js";

// Allowed IP:HOST to proxy to.
import config from "./config.js";

/** This method will check if this websocket can proxy to this server
 * next(boolean) will expect a true or false
 *
 * @param {Object}
 * @param {Function} - next module to execute from stack
 */
function verify(info, next) {
  var target = info.req.url.substring(1);
  var from = info.req.connection.remoteAddress;

  // Reject
  if (config.allowed_ip.length && config.allowed_ip.indexOf(target) < 0) {
    _info("Reject requested connection from '%s' to '%s'.", from, target);
    next(false);
  }

  next(true);
}

// Exports
export { config, verify };
