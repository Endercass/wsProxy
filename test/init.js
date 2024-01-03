import Server from "../src/core/server.js";
import cli_logger from "../src/cli_logger.js";
import ModuleLoader from "../src/core/modules.js";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("wsProxy", function () {
  it("Start server", function (done) {
    const config = {
      port: 5999,
      ssl: false,
      logger: cli_logger,
      modules: new ModuleLoader(`${__dirname}/../src/modules`),
    };
    try {
      let server = new Server(config);
      server.listen();
    } catch (e) {
      done(e);
    }

    setTimeout(function () {
      done();
    }, 1000);
  });
});
