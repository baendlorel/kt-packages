import { createPrivatifyTransformer } from './core/transformer.js';
import type {
  PrivatifyMode,
  RollupTypescriptPrivatifyOptions,
  TypescriptPrivatifyTransformers,
} from './types/global.js';

export type { PrivatifyMode, RollupTypescriptPrivatifyOptions, TypescriptPrivatifyTransformers };
export { createPrivatifyTransformer };

export default function typescriptPrivatify(
  options: RollupTypescriptPrivatifyOptions = {}
): TypescriptPrivatifyTransformers {
  return {
    before: [createPrivatifyTransformer(options)],
  };
}
