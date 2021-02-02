import { FieldError } from 'react-hook-form';
import { toNestObject } from '../toNestObject';

test('transforms flat object to nested object', () => {
  const flatObject: Record<string, FieldError> = {
    name: { type: 'st', message: 'first message' },
    'test.0.name': { type: 'nd', message: 'second message' },
    'n.test': { type: 'rd', message: 'third message' },
  };

  expect(toNestObject(flatObject)).toMatchInlineSnapshot(`
    Object {
      "n": Object {
        "test": Object {
          "message": "third message",
          "type": "rd",
        },
      },
      "name": Object {
        "message": "first message",
        "type": "st",
      },
      "test": Array [
        Object {
          "name": Object {
            "message": "second message",
            "type": "nd",
          },
        },
      ],
    }
  `);
});
