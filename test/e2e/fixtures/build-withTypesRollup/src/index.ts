import { foo } from './foo/foo';
import { bar } from './bar/bar';
import { FooBar } from './types';

export default function fooBar(x: number, y: number): FooBar {
  return { foo: foo(x, y), bar: bar(x, y) };
}
