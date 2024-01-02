// Logs
import { info as _info } from "../../core/message.js";

// Allowed IP:HOST to proxy to.
import allowed_ip from "./config.js";

// This method will check if this websocket can proxy to this server
// next(boolean) will expect a true or false
//
// @param {Object}
// @param {Function} next module to execute from stack
function checkAllowed(info, next) {
  var target = info.req.url.substr(1);
  var from = info.req.connection.remoteAddress;

  // Reject
  if (allowed_ip.length && allowed_ip.indexOf(target) < 0) {
    _info("Reject requested connection from '%s' to '%s'.", from, target);
    next(false);
  }

  next(true);
}

// Exports methods
export const verify = checkAllowed;
