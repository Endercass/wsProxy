#!/usr/bin/env node

// Imports
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { dirname } from "path";
import { fileURLToPath } from "url";

import Server from "./core/server.js";
import ModuleLoader from "./core/modules.js";

const args = yargs(hideBin(process.argv)).argv;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Arguments
if (args.h || args.help) {
  console.log("Example usage:");
  console.log("wsproxy -p 5999");
  console.log("-p, --port port to run wsProxy on. [Default: 5999]");
  console.log(
    "-a, --allow list of allowed ip:port to proxy to (comma separated) [Default: none] [Example: 127.0.0.1:6900,127.0.0.1:5121,127.0.0.1:6121]"
  );
  console.log("-s, --ssl enable ssl.");
  console.log("-k, --key path to ssl key file. [Default: ./default.key]");
  console.log("-c, --cert path to ssl cert file. [Default: ./default.crt]");
  process.exit(0);
}

let loader = new ModuleLoader(`${__dirname}/modules`);

// Load modules
loader.load("allow");

// Parse allowed ip:port option into array
// Overrides the default allowed.js file
// TODO: remove this allowed.js file, and write a standard way to handle this allowed_ip option.
if (args.a || args.allow) {
  allowed = (args.a || args.allow).split(",");
}

// Init
let config = {
  port: args.port || args.p || process.env.PORT || 5999,
  ssl: args.ssl || args.s || false,
  key: args.key || args.k || "./default.key",
  cert: args.cert || args.c || "./default.crt",
  modules: loader,
};

let server = new Server(config);
server.listen();
