import { Transform } from 'class-transformer';

export function TransformToUpperCase() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toUpperCase();
    }
    if (Array.isArray(value)) {
      return value.map((v) => (typeof v === 'string' ? v.toUpperCase() : v));
    }
    return value;
  });
}
