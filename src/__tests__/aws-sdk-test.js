/* @flow */

import AWS from 'aws-sdk';

describe('aws-sdk', () => {
  describe('check s3', () => {
    it('should provide services', () => {
      expect(Object.keys(AWS.apiLoader.services)).toContain('s3');
    });

    it('should provide versions', () => {
      expect(Object.keys(AWS.apiLoader.services.s3)).toEqual(['2006-03-01']);
    });

    it('should contain config', () => {
      expect(Object.keys(AWS.apiLoader.services.s3['2006-03-01'])).toEqual([
        'version',
        'metadata',
        'operations',
        'shapes',
        'paginators',
        'waiters',
      ]);

      // console.log(AWS.apiLoader.services.s3['2006-03-01'].operations);
      // console.log(Object.keys(AWS));
    });
  });
});
