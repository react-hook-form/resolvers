import Nope from 'nope-validator';
import { nopeResolver } from './nope';

const Article = Nope.object().shape({
  id: Nope.number().required(),
  title: Nope.string().required(),
  isPublished: Nope.string(),
  tags: Nope.array().of(Nope.string()).required(),
  author: Nope.object().shape({
    id: Nope.number().required(),
  }),
});

describe('nopeResolver', () => {
  it('should return correct value', async () => {
    const data = {
      id: 2,
      title: 'test',
      tags: ['news', 'features'],
      author: {
        id: 1,
      },
    };
    expect(await nopeResolver(Article)(data)).toEqual({
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
    expect(await nopeResolver(Article)(data)).toMatchSnapshot();
  });
});
