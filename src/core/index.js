import cluster from "cluster";
import Server from "./server.js";
/**
 * Module
 */
export default function Init(config) {
  /**
   * Invoke workers
   */
  if (cluster.isMaster) {
    for (var i = 0; i < config.workers; i++) {
      forkWorker(config);
    }

    return;
  }

  /**
   * Server constructor
   */

  var server = new Server(config);

  /**
   * Fork new worker
   */
  function forkWorker(config) {
    var worker = cluster.fork({
      isWorker: true,
    });
  }
}
