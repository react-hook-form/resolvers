export const convertArrayToPathName = (paths: (string | number)[]): string =>
  paths
    .reduce(
      (previous, path: string | number, index): string =>
        `${previous}${
          typeof path === 'string'
            ? `${index > 0 ? '.' : ''}${path}`
            : `[${path}]`
        }`,
      '',
    )
    .toString();
