import { dest } from 'gulp';
import ProjectConfig from '../../config/ProjectConfig';
import Transformer, { TransformDirection } from '../transform/Transformer';
import MappingTransformer from '../../transform/Mapping';

/**
 * A stream that transforms read {@link ReadStream.ReadResult}s and stores the on the filesystem.
 */
export default class PullStream {

  /**
   * Creates a new PullStream based on a stream that writes {@link ReadStream.ReadResult} which may
   * be an instance of {@link ReadStream}.
   * @param {Stream} readStream The stream to read from.
   */
  constructor(readStream) {
    let pulled = 0;

    readStream
      .on('data', () => pulled++);
    const mappingStream = new MappingTransformer({ direction: TransformDirection.FromDB });

    const printProgress = setInterval(() => {
      process.stdout.write(`\rPulled: ${pulled}`);
    }, 1000);

    return Transformer.applyTransformers(
      readStream
        .pipe(mappingStream),
      ProjectConfig.useTransformers,
      TransformDirection.FromDB
    )
      .pipe(dest('./src'))
      .on('data', () => {}) // Unpipe readable stream
      .on('end', () => {
        process.stdout.clearLine();
        process.stdout.write('\r');
        clearInterval(printProgress);
      });
  }

}