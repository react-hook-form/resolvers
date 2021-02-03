import { Field, FieldError, InternalFieldName } from 'react-hook-form';
import { toNestError } from '../toNestError';

test('transforms flat object to nested object', () => {
  const flatObject: Record<string, FieldError> = {
    name: { type: 'st', message: 'first message' },
    'test.0.name': { type: 'nd', message: 'second message' },
    'n.test': { type: 'rd', message: 'third message' },
  };

  const fields = ({
    name: {
      ref: 'nameRef',
    },
    n: {
      test: {
        ref: 'testRef',
      },
    },
    unused: {
      ref: 'unusedRef',
    },
  } as any) as Record<InternalFieldName, Field['_f']>;

  expect(toNestError(flatObject, fields)).toMatchInlineSnapshot(`
    Object {
      "n": Object {
        "test": Object {
          "message": "third message",
          "ref": "testRef",
          "type": "rd",
        },
      },
      "name": Object {
        "message": "first message",
        "ref": "nameRef",
        "type": "st",
      },
      "test": Array [
        Object {
          "name": Object {
            "message": "second message",
            "ref": undefined,
            "type": "nd",
          },
        },
      ],
    }
  `);
});
