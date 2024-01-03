import path from "path";

class ModuleLoader {
  base;

  /**
   * Modules method stack
   * Array of functions to execute before by each method
   */
  stack = {
    verify: [], //executes before connect
    connect: [], //executes once passed through connect
  };

  /**
   * Modules configs
   * Every key is a module folder name
   * Every value is an object containing the config object for that module
   * and a hide boolean (this should be used only by the module itself, and for the special "!cfg" path)
   * Note: the module should export a hideConfig variable if it wants to hide this config
   * from the client, for example if any sort of sensitive data is in it
   */
  configs = {};

  /**
   * Verify connection by going through all modules with a verify method
   * This will keep iterating through the modules until one returns false,
   * at which point it will stop and return false. If all modules return true,
   * then the connection will be accepted.
   */
  verify(logger, info, callback) {
    const fnc = (i) => {
      this.runModule("verify", i, [logger, info], (bool) => {
        // Check if it returned false, stop here if it did
        if (bool === false) {
          callback(false);
          return;
        }
        // If next < moduleStack, then we passed through all verify modules without an single return false
        if (i >= this.stack["verify"].length) {
          callback(true);
          return;
        }
        fnc(i + 1);
      });
    };

    fnc(0);
  }
  /**
   * This method allows modules to do additional processing on the websocket connection
   */
  connect(logger, ws, callback) {
    const fnc = (i) => {
      this.runModule("connect", i, [logger, ws], () => {
        // Finished stack, lets return
        if (i >= this.stack["connect"].length) {
          callback();
          return;
        }

        fnc(i + 1);
      });
    };

    fnc(0);
  }

  /**
   * Register new module
   * @param {path.ParsedPath} folder
   */
  load(folder) {
    import(`${this.base}/${folder}/index.js`).then((module) => {
      this.configs[folder] = {
        config: module["config"] || {},
        hide: !!module["hideConfig"],
      };

      for (var method in this.stack) {
        if (typeof module[method] === "function") {
          this.stack[method].push(module[method]);
        }
      }
    });
  }

  /**
   * Run a module
   */
  runModule(method, index, _arguments, next) {
    if (this.stack[method].length <= index) {
      //No more modules to execute
      next();
      return;
    }

    _arguments.push(next); //Push next function

    this.stack[method][index].apply(null, _arguments);
  }

  /**
   * Creates a module loader with a base path
   * @param {string} base
   */
  constructor(base) {
    this.base = base;
  }
}

/**
 * Exports
 */
export default ModuleLoader;
