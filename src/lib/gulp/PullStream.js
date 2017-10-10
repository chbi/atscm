import readline from 'readline';
import { dest } from 'gulp';
import Logger from 'gulplog';
import UaNodeToAtviseFileTransformer from '../../transform/UaNodeToAtviseFileTransformer';

/**
 * A stream that transforms read {@link ReadStream.ReadResult}s and stores the on the filesystem.
 */
export default class PullStream {

  /**
   * Creates a new PullStream based on the given options.
   * @param {Object} options The stream configuration options.
   * @param {NodeId[]} [options.nodesToPull] The nodes to push.
   */
  constructor(options = {}) {

    /**
     * The nodes to pull
     * @type {NodeId[]}
     */
    const nodesToPull = options.nodesToPull || [];

    const fileTransformer = new UaNodeToAtviseFileTransformer({nodesToTransform: nodesToPull});
    const readStream = fileTransformer.readStream;

    const printProgress = setInterval(() => {
      Logger.info(`Pulled: ${readStream.processed} (${readStream.opsPerSecond.toFixed(1)} ops/s)`);

      if (Logger.listenerCount('info') > 0) {
        readline.cursorTo(process.stdout, 0);
        readline.moveCursor(process.stdout, 0, -1);
      }
    }, 1000);

    return fileTransformer.stream
      .pipe(dest('./src'))
      .on('finish', () => {
        if (Logger.listenerCount('info') > 0) {
          readline.clearLine(process.stdout, 0);
          readline.cursorTo(process.stdout, 0);
        }

        clearInterval(printProgress);
      });
  }

}
