import { convertArrayToPathName } from '..';

describe('convertArrayToPathName', () => {
  it('should convert into path name', () => {
    expect(convertArrayToPathName(['test', 2])).toEqual('test[2]');
    expect(convertArrayToPathName(['test', 2, 'test'])).toEqual('test[2].test');
    expect(convertArrayToPathName(['test', 2, 'test', 4, 'data'])).toEqual(
      'test[2].test[4].data',
    );
  });
});
