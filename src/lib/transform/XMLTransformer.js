import { EOL } from 'os';
import { parseString as parseXML, Builder as XMLBuilder } from 'xml2js';
import { TransformDirection } from './Transformer';
import SplittingTransformer from './SplittingTransformer';

/**
 * A special token used to encode CData section beginnings.
 * @type {String}
 */
const START_CDATA = 'STARTCDATA';

/**
 * A special token used to encode CData section endings.
 * @type {String}
 */
const END_CDATA = 'ENDCDATA';

/**
 * A transformer used to transform XML documents.
 */
export default class XMLTransformer extends SplittingTransformer {

  /**
   * Creates a new XMLTransformer based on some options.
   * @param {Object} options The options to use.
   */
  constructor(options) {
    super(options);

    /**
     * The builder to use with direction {@link TransformDirection.FromDB}.
     * @type {xml2js~Builder}
     */
    this._fromDBBuilder = new XMLBuilder({
      cdata: false,
      newline: EOL,
    });

    /**
     * The builder to use with direction {@link TransformDirection.FromFilesystem}.
     * @type {xml2js~Builder}
     */
    this._fromFilesystemBuilder = new XMLBuilder({
      renderOpts: {
        pretty: true,
        indent: ' ',
        newline: '\r\n',
      },
      xmldec: {
        version: '1.0',
        encoding: 'UTF-8',
        standalone: false,
      },
      cdata: true,
    });
  }

  /**
   * Returns the XML builder instance to use base on the current {@link Transformer#direction}.
   * @type {xml2js~Builder}
   */
  get builder() {
    return this.direction === TransformDirection.FromDB ?
      this._fromDBBuilder :
      this._fromFilesystemBuilder;
  }

  /**
   * Parses XML in a file's contents.
   * @param {AtviseFile} file The file to process.
   * @param {function(err: ?Error, result: ?Object)} callback Called with the parsed document or the
   * parse error that occurred.
   */
  decodeContents(file, callback) {
    parseXML(file.contents, callback);
  }

  /**
   * Builds an XML string from an object.
   * @param {Object} object The object to encode.
   * @param {function(err: ?Error, result: ?String)} callback Called with the resulting string or
   * the error that occurred while building.
   */
  encodeContents(object, callback) {
    try {
      callback(null,
        this.builder.buildObject(object)
          .replace(new RegExp(`(<!\\[CDATA\\[)?${START_CDATA}`), '<![CDATA[')
          .replace(new RegExp(`${END_CDATA}(\\]\\]>)?`), ']]>')
      );
    } catch (e) {
      callback(e);
    }
  }

  /**
   * Helper function: Returns `true` if the given tag exists and is not empty.
   * @param {Object} tag A tag in a parsed xml document.
   * @return {boolean} `true` if the given tag exists and is not empty.
   */
  tagNotEmpty(tag) {
    return Boolean(tag && tag.length > 0);
  }

  /**
   * Forces `string`, when assigned as textContent to a node, to be wrapped in a CDATA-section.
   * @param {string} string The string to force a CDATA-section for.
   * @return {string} The string to assign as textContent to a node.
   */
  static forceCData(string) {
    return `${START_CDATA}${string}${END_CDATA}`;
  }

}
