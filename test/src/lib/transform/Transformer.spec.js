import { Stream } from 'stream';
import { stub } from 'sinon';
import expect from '../../../expect';

import Transformer, { TransformDirection } from '../../../../src/lib/transform/Transformer';

/** @test {Transformer} */
describe('Transformer', function() {
  /** @test {Transformer#constructor} */
  describe('#constructor', function() {
    it('should throw with invalid direction', function() {
      expect(() => (new Transformer({ direction: 'asdf' })),
        'to throw', 'Invalid direction');
    });

    it('should store direction', function() {
      expect((new Transformer({ direction: TransformDirection.FromDB })).direction,
        'to equal', TransformDirection.FromDB);
    });
  });

  /** @test {Transformer#withDirection} */
  describe('#withDirection', function() {
    let transformer;

    beforeEach(() => (transformer = new Transformer()));

    it('should throw without direction', function() {
      expect(() => transformer.withDirection(), 'to throw', 'Invalid direction');
    });

    it('should throw with invalid direction', function() {
      expect(() => transformer.withDirection('asdf'), 'to throw', 'Invalid direction');
    });

    it('should return self with direction set', function() {
      const directed = transformer.withDirection(TransformDirection.FromDB);

      expect(directed, 'to be a', Transformer);
      expect(directed.direction, 'to equal', TransformDirection.FromDB);
    });
  });

  /** @test {Transformer#_transform} */
  describe('#_transform', function() {
    let transformer;

    beforeEach(() => {
      transformer = new Transformer();
      stub(transformer, 'transformFromDB', (c, e, cb) => cb(null));
      stub(transformer, 'transformFromFilesystem', (c, e, cb) => cb(null));
    });

    it('should fail without direction', function() {
      return expect(cb => transformer._transform({}, 'utf8', cb),
        'to call the callback with error', 'Transformer has no direction');
    });

    it('should call transformFromDB with direction FromDB', function() {
      transformer.withDirection(TransformDirection.FromDB)._transform({}, 'utf8', () => {});

      return expect(transformer.transformFromDB, 'was called');
    });

    it('should call transformFromFilesystem with direction FromFilesystem', function() {
      transformer.withDirection(TransformDirection.FromFilesystem)._transform({}, 'utf8', () => {});

      return expect(transformer.transformFromFilesystem, 'was called');
    });
  });

  /** @test {Transformer#transformFromDB} */
  describe('#transformFromDB', function() {
    const transformer = new Transformer();

    it('should fail if not overridden', function() {
      return expect(cb => transformer.transformFromDB({}, 'utf8', cb),
        'to call the callback with error', /must be overridden/);
    });
  });

  /** @test {Transformer#transformFromFilesystem} */
  describe('#transformFromFilesytem', function() {
    const transformer = new Transformer();

    it('should fail if not overridden', function() {
      return expect(cb => transformer.transformFromFilesystem({}, 'utf8', cb),
        'to call the callback with error', /must be overridden/);
    });
  });
  
  /** @test {Transformer.applyTransformers} */
  describe('.applyTransformers', function() {
    it('should throw on invalid direction', function() {
      expect(() => Transformer.applyTransformers([], 'asdf'), 'to throw error', 'Direction is invalid');
    });

    it('should return directed transformer if only one is passed', function() {
      const firstTransformer = new Transformer();
      const result = Transformer.applyTransformers([firstTransformer], TransformDirection.FromDB);

      expect(result, 'to be', firstTransformer);
      expect(firstTransformer.direction, 'to equal', TransformDirection.FromDB);
    });

    it('should return last transformer piped to previous', function() {
      const firstTransformer = new Transformer();
      const lastTransformer = new Transformer();
      const result = Transformer.applyTransformers([
        firstTransformer,
        lastTransformer,
      ], TransformDirection.FromDB);

      expect(result, 'to be', lastTransformer);
      expect(firstTransformer.direction, 'to equal', TransformDirection.FromDB);
      expect(lastTransformer.direction, 'to equal', TransformDirection.FromDB);
    });

    it('should reverse transformers if called with "FromFilesystem"', function() {
      const firstTransformer = new Transformer();
      const lastTransformer = new Transformer();
      const result = Transformer.applyTransformers([
        firstTransformer,
        lastTransformer,
      ], TransformDirection.FromFilesystem);

      expect(result, 'to be', firstTransformer);
      expect(firstTransformer.direction, 'to equal', TransformDirection.FromFilesystem);
      expect(lastTransformer.direction, 'to equal', TransformDirection.FromFilesystem);
    });

    it('should work with empty array as argument', function() {
      expect(Transformer.applyTransformers([], TransformDirection.FromDB), 'to be a', Stream);
    });
  });
});