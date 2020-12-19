process.env.NODE_ENV='test'

import {
    hello,
    main,
    getDate,
    getNodeJsVersion
  } from './handler';

describe('hello.tsのテスト', () => {

    describe.skip('main()のテスト', () => {
        test('DynamoDB.localが正しく動いていること。', async() => {
            const items = await main();
            const expected = [];

            expect(items.length).toBe(0);
        });
    })

    describe('getDate()のテスト', () => {
        test('ISO形式の文字列で時間指定した場合、正しくその時間が返ること', () => {
            expect(getDate('2020-11-28T09:00:00+09:00')).toBe('2020-11-28T09:00:00+09:00');
        });

        test('UNIX数値(ミリ秒)で時間指定した場合も、正しくその時間が返ること', () => {
            expect(getDate(1606521600000)).toBe('2020-11-28T09:00:00+09:00');
        });
    })
});

