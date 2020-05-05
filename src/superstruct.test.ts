import { struct } from 'superstruct';
import { superstructResolver } from './superstruct';

const Article = struct({
  id: 'number',
  title: 'string',
  is_published: 'boolean?',
  tags: ['string'],
  author: {
    id: 'number',
  },
});

describe('superstructResolver', () => {
  it('should return correct value', async () => {
    const data = {
      id: 2,
      title: 'test',
      tags: ['news', 'features'],
      author: {
        id: 1,
      },
    };
    expect(await superstructResolver(Article)(data)).toEqual({
      values: data,
      errors: {},
    });
  });

  it('should return errors', async () => {
    const data = {
      id: '2',
      title: 2,
      tags: [2, 3],
      author: {
        id: 'test',
      },
    };
    expect(await superstructResolver(Article)(data)).toMatchSnapshot();
  });
});
