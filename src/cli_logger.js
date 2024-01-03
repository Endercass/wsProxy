/**
 * Dependencies
 */
import { format } from "util";
import Logger from "./core/logger.js";

export default new Logger(info, status, error, warning);

/**
 * Info
 */
function info() {
  var mes = format.apply(null, wrap(arguments));

  console.log("\x1b[1;37m[%s]:\x1b[0m %s", "Info", mes);
}

/**
 * Status
 */
function status() {
  var mes = format.apply(null, wrap(arguments));

  console.log("\x1b[1;32m[%s]:\x1b[0m %s", "Status", mes);
}

/**
 * Error
 */
function error() {
  var mes = format.apply(null, wrap(arguments));

  console.log("\x1b[1;31m[%s]:\x1b[0m %s", "Error", mes);
}

/**
 * Warning
 */
function warning() {
  var mes = format.apply(null, wrap(arguments));

  console.log("\x1b[1;33m[%s]:\x1b[0m %s", "Warn", mes);
}

/**
 * Wrap arguments in a cool white color :)
 */
function wrap() {
  var args = [];

  args.push(arguments[0][0]);
  for (var i = 1; i < arguments[0].length; i++) {
    //Start at index 1, index 1 doesnt need to be modified;
    args.push("\x1b[1;37m" + arguments[0][i] + "\x1b[0m");
  }

  return args;
}
