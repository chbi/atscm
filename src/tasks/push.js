import { src } from 'gulp';
import ProjectConfig from '../config/ProjectConfig';
import Transformer, { TransformDirection } from '../lib/transform/Transformer';
import MappingTransformer from '../transform/Mapping';
import WriteStream from '../lib/server/WriteStream';

/**
 * Pushes {@link AtviseFile}s to atvise server.
 */
export default function push() {
  let uploaded = 0;

  const mappingStream = new MappingTransformer({ direction: TransformDirection.FromFilesystem });
  const writeStream = new WriteStream()
    .on('data', () => uploaded++);

  const printProgress = setInterval(() => {
    process.stdout.write(`\rUploaded: ${uploaded}`);
  }, 1000);

  return Transformer.applyTransformers(
    src('./src/**/*.*')
      .pipe(mappingStream),
    ProjectConfig.useTransformers,
    TransformDirection.FromFilesystem
  )
    .pipe(writeStream)
    .on('end', () => {
      process.stdout.clearLine();
      process.stdout.write('\r');
      clearInterval(printProgress);
    });
}

push.description = 'Push all stored nodes to atvise server';
