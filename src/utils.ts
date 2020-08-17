import { TypeStorage } from 'graphql-compose';

const typeStorage = new TypeStorage();

export function getTypeName(name: string, opts?: { prefix?: string; postfix?: string }): string {
  return `${opts?.prefix || 'Elastic'}${name}${opts?.postfix || ''}`;
}

export function getOrSetType<T>(typeName: string, typeOrThunk: (() => T) | T): T {
  const type: any = typeStorage.getOrSet(typeName, typeOrThunk);
  return type;
}

// Remove newline multiline in descriptions
export function desc(str: string): string {
  return str.replace(/\n\s+/gi, ' ').replace(/^\s+/, '');
}
