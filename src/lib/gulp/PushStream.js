import readline from 'readline';
import Logger from 'gulplog';
import ProjectConfig from '../../config/ProjectConfig';
import Transformer, { TransformDirection } from '../transform/Transformer';
import MappingTransformer from '../../transform/Mapping';
import CombinedStream from 'combined-stream';
import WriteStream from '../server/WriteStream';
import NodeFileStream from '../server/NodeFileStream';
import CreateNodeStream from '../server/CreateNodeStream';
import AddReferenceStream from '../server/AddReferenceStream';
import filter from 'gulp-filter';

/**
 * A stream that transforms read {@link vinyl~File}s and pushes them to atvise server.
 */
export default class PushStream {

  /**
   * Creates a new PushSteam based on a source file stream.
   * @param {Stream} srcStream The file stream to read from.
   */
  constructor(srcStream) {
    const combinedStream = new CombinedStream;
    const mappingStream = new MappingTransformer({ direction: TransformDirection.FromFilesystem });
    const writeStream = new WriteStream();
    const nodeFileStream = new NodeFileStream();
    const createNodeStream = new CreateNodeStream();
    const addReferenceStream = new AddReferenceStream();
    const typeDefinitionFilter = filter(file => !file.isTypeDefinition, { restore: true });
    const atvReferenceFilter = filter(file => !file.isAtviseReferenceConfig, { restore: true });

    this.printProgress = setInterval(() => {
      Logger.info(
      `Pushed: ${writeStream._processed} (${writeStream.opsPerSecond.toFixed(1)} ops/s)`
      );

      if (Logger.listenerCount('info') > 0) {
        readline.cursorTo(process.stdout, 0);
        readline.moveCursor(process.stdout, 0, -1);
      }
    }, 1000);


    const pushStream = Transformer.applyTransformers(
      srcStream
        .pipe(mappingStream)
        .pipe(typeDefinitionFilter)
        .pipe(atvReferenceFilter),
      ProjectConfig.useTransformers,
      TransformDirection.FromFilesystem
      )
      .pipe(typeDefinitionFilter.restore)
      .pipe(nodeFileStream)
      .pipe(writeStream)
      .pipe(createNodeStream)

      pushStream.once('finish', () => {
        Logger.debug('Writing and creating nodes finished. Adding references...');

        if (atvReferenceFilter.restore._readableState.buffer.length > 0) {
          pushStream.pipe(atvReferenceFilter.restore)
            .pipe(addReferenceStream)
            .on('finish', () => this.endPushTask());
        } else {
          this.endPushTask();
        }
      });

    return pushStream;
  }

  /**
   * Stops the print progress when push stream has finished and stops the push task process
   */
  endPushTask() {
    if (Logger.listenerCount('info') > 0) {
      readline.cursorTo(process.stdout, 0);
      readline.clearLine(process.stdout);
    }

    clearInterval(this.printProgress);
    process.exit();
  }
}