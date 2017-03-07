'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _through = require('through2');

var _Session = require('./Session');

var _Session2 = _interopRequireDefault(_Session);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * An object transform stream connected to atvise server.
 */
class Stream extends (0, _through.ctor)({ objectMode: true }) {

  /**
   * Creates a new Stream and starts opening a new session to atvise server.
   * @emits {Session} Emits an `session-open` event once the session is open, passing the Session
   * instance.
   */
  constructor() {
    super();

    _Session2.default.create().then(session => this.session = session).then(session => this.emit('session-open', session)).catch(err => this.emit('error', err));
  }

  /**
   * Called just before the stream is closed: Closes the open session.
   * @param {function(err: ?Error, data: Object)} callback Called once the session is closed.
   */
  _flush(callback) {
    if (this.session) {
      _Session2.default.close(this.session).then(() => callback()).catch(err => callback(err));
    } else {
      callback();
    }
  }

}
exports.default = Stream;