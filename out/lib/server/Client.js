'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nodeOpcua = require('node-opcua');

var _ProjectConfig = require('../../config/ProjectConfig');

var _ProjectConfig2 = _interopRequireDefault(_ProjectConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A wrapper around {@link node-opcua~OPCUAClient} used to connect to atvise server.
 */
class Client {

  /**
   * Creates and connects a new instance of {@link node-opcua~OPCUAClient}.
   * @return {Promise<node-opcua~OPCUAClient, Error>} Fulfilled with an already connected
   * {@link node-opcua~OPCUAClient} instance, rejected if an error occured.
   */
  static create() {
    const client = new _nodeOpcua.OPCUAClient({
      requestedSessionTimeout: 600000,
      keepSessionAlive: true
    });

    return new Promise((resolve, reject) => {
      const endpoint = `opc.tcp://${_ProjectConfig2.default.host}:${_ProjectConfig2.default.port.opc}`;

      setTimeout(() => reject(new Error(`Unable to connect to ${endpoint}: Connection timed out`)), 5000);

      client.connect(endpoint, err => {
        if (err) {
          reject(new Error(`Unable to connect to ${endpoint}: ${err.message}`));
        } else {
          resolve(client);
        }
      });
    });
  }

}
exports.default = Client;
//# sourceMappingURL=Client.js.map