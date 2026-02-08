import { Field, InternalFieldName } from 'react-hook-form';

type ConvexIssue = {
  path?: (string | number)[];
  message: string;
  code?: string;
};

type ConvexValidationResult<T> =
  | { success: true; value: T }
  | { success: false; issues: ConvexIssue[] };

type ConvexSchema<Input, Output> = {
  validate: (
    value: Input,
  ) => ConvexValidationResult<Output> | Promise<ConvexValidationResult<Output>>;
};

export type SchemaInput = {
  username?: string;
  password?: string;
  repeatPassword?: string;
  accessToken?: string | number;
  birthYear?: number;
  email?: string;
  tags?: (string | number)[];
  enabled?: boolean;
  like?: {
    id?: number | string;
    name?: string;
  };
};

export type SchemaOutput = Required<
  Omit<SchemaInput, 'repeatPassword' | 'like'> & {
    like: { id: number; name: string };
  }
>;

export const schema: ConvexSchema<SchemaInput, SchemaOutput> = {
  validate(value) {
    const issues: ConvexIssue[] = [];

    if (typeof value.username !== 'string' || value.username.length === 0) {
      issues.push({
        path: ['username'],
        message: 'username field is required',
        code: 'required',
      });
    }
    if (
      typeof value.username === 'string' &&
      value.username.length > 0 &&
      value.username.length < 2
    ) {
      issues.push({
        path: ['username'],
        message: 'Too short',
        code: 'minLength',
      });
    }

    if (typeof value.password !== 'string' || value.password.length === 0) {
      issues.push({
        path: ['password'],
        message: 'New Password is required',
        code: 'required',
      });
    }
    if (
      typeof value.password === 'string' &&
      value.password.length > 0 &&
      value.password.length < 8
    ) {
      issues.push({
        path: ['password'],
        message: 'Must be at least 8 characters in length',
        code: 'minLength',
      });
    }

    if (typeof value.email !== 'string' || value.email.length === 0) {
      issues.push({
        path: ['email'],
        message: 'Invalid email address',
        code: 'email',
      });
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.email)) {
      issues.push({
        path: ['email'],
        message: 'Invalid email address',
        code: 'email',
      });
    }

    if (typeof value.birthYear !== 'number') {
      issues.push({
        path: ['birthYear'],
        message: 'Please enter your birth year',
        code: 'type',
      });
    } else if (value.birthYear < 1900 || value.birthYear > 2013) {
      issues.push({
        path: ['birthYear'],
        message: 'Invalid birth year',
        code: 'range',
      });
    }

    if (!Array.isArray(value.tags)) {
      issues.push({
        path: ['tags'],
        message: 'Tags should be strings',
        code: 'type',
      });
    } else {
      for (let i = 0; i < value.tags.length; i++) {
        if (typeof value.tags[i] !== 'string') {
          issues.push({
            path: ['tags', i],
            message: 'Tags should be strings',
            code: 'type',
          });
        }
      }
    }

    if (typeof value.enabled !== 'boolean') {
      issues.push({
        path: ['enabled'],
        message: 'enabled must be a boolean',
        code: 'type',
      });
    }

    const like = value.like || {};
    if (typeof like.id !== 'number') {
      issues.push({
        path: ['like', 'id'],
        message: 'Like id is required',
        code: 'type',
      });
    }
    if (typeof like.name !== 'string') {
      issues.push({
        path: ['like', 'name'],
        message: 'Like name is required',
        code: 'required',
      });
    } else if ((like.name as string).length < 4) {
      issues.push({
        path: ['like', 'name'],
        message: 'Too short',
        code: 'minLength',
      });
    }

    if (issues.length > 0) {
      return { success: false, issues };
    }

    return {
      success: true,
      value: {
        username: value.username!,
        password: value.password!,
        accessToken: value.accessToken!,
        birthYear: value.birthYear!,
        email: value.email!,
        tags: (value.tags as string[])!,
        enabled: value.enabled!,
        like: { id: like.id as number, name: like.name as string },
      },
    } as const;
  },
};

export const validData: SchemaInput = {
  username: 'Doe',
  password: 'Password123_',
  repeatPassword: 'Password123_',
  birthYear: 2000,
  email: 'john@doe.com',
  tags: ['tag1', 'tag2'],
  enabled: true,
  accessToken: 'accessToken',
  like: {
    id: 1,
    name: 'name',
  },
};

export const invalidData: SchemaInput = {
  password: '___',
  email: '',
  birthYear: undefined as any,
  like: { id: 'z' as any },
  tags: [1, 2, 3] as any,
};

export const fields: Record<InternalFieldName, Field['_f']> = {
  username: {
    ref: { name: 'username' },
    name: 'username',
  },
  password: {
    ref: { name: 'password' },
    name: 'password',
  },
  email: {
    ref: { name: 'email' },
    name: 'email',
  },
  birthday: {
    ref: { name: 'birthday' },
    name: 'birthday',
  },
};
