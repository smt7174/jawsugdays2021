import * as fs from 'fs';

import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import S3, { GetObjectRequest, GetObjectOutput } from 'aws-sdk/clients/s3';
import dynamoDbData from './tower-of-druaga-jawsugdays.json';
const itemList:DocumentClient.ItemList = dynamoDbData as DocumentClient.ItemList;

import * as awsMock from 'aws-sdk-mock';
import * as aws from 'aws-sdk';
awsMock.setSDKInstance(aws);

// aws-sdk-mockのMock関数を定義
awsMock.mock('DynamoDB.DocumentClient', 'scan', async function(params) {
    // console.info(`[filtered] ${JSON.stringify(itemList.filter(x => x.Floor % 2 === 0))}`);
    const filtered:DocumentClient.ItemList = itemList.filter(x => x.Floor % 2 === 0) as DocumentClient.ItemList;
    return {Items:filtered};
});

const s3Contents:string = fs.readFileSync('./bucket/jawsugdays2021/tower-of-druaga-jawsugdays.json._S3rver_object', 'utf-8');
const s3ContentsMock = {
    Body: Buffer.from(JSON.stringify([{Type:"treasure",Floor:25,Detail:[{Condition:"なし",Effect:"なし",Memo:"なし",Name:""}]}]))
};

awsMock.mock('S3', 'getObject', async function(params) {
    return s3ContentsMock;
});

import {
    scanDynamoDbItems,
    getS3ObjectContents
} from './get';

process.env.NODE_ENV='test'

interface IDetail {
    Condition: string,
    Effect: string,
    Memo: string,
    Name: string
};

interface IFloor {
    Type: string,
    Floor: number,
    Detail: IDetail[]
}

let dc:DocumentClient = null;
let s3: S3 = null;

beforeAll(() =>{
    dc = new aws.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000',
    });

    s3 = new aws.S3({
        s3ForcePathStyle: true,
        accessKeyId: 'S3RVER', // This specific key is required when working offline
        secretAccessKey: 'S3RVER',
        endpoint: new aws.Endpoint('http://localhost:4569'),
    });
});

// このテストは、Serverless OfflineとServerless-DynamoDB-Localを起動して実施して下さい。
// これらを起動しないと、「aws-sdk-mockを使用する場合のテスト」がTimeoutになります。
describe('get.tsのテスト', () => {
    describe('aws-sdk-mockを使用する場合のテスト', () => {
        // こちらはaws-sdk-mockが有効になるので、AWSの各メソッドは
        // Mock関数の内容を返す。
        afterAll(() => {
            // こちらはaws-sdk-mockのmock化を無効化する
            awsMock.restore('DynamoDB.DocumentClient', 'scan');
            awsMock.restore('S3', 'getObject');
        });
        test('scanDynamoDbItems関数がServerless-DynamoDB-Localのデータを返すこと。', async () => {
            const items:DocumentClient.ItemList = await scanDynamoDbItems(dc);
            expect(items).toEqual(itemList.filter(x => x.Floor % 2 === 0));
        });

        test('getS3ObjectContents関数がServerless-S3-Localのバケットキーの内容を返すこと。', async () => {
            const contents:IFloor = await getS3ObjectContents(s3);
            expect(JSON.stringify(contents)).toBe(s3ContentsMock.Body.toString());
        });
    })

    describe('aws-sdk-mockを使用しない場合のテスト', () => {
        // こちらはaws-sdk-mockが無効になるので、AWSの各メソッドは
        // 生リソースの値を返す。
        // (DynamoDB.DocumentClient.scanはseed値のtower-of-druaga-jawsugdays.jsonの値を、
        // S3.getObjectはtower-of-druaga-jawsugdays.json._S3rver_objectの内容を返す)
        test('scanDynamoDbItems関数がServerless-DynamoDB-Localのデータを返すこと。', async () => {
            const items:DocumentClient.ItemList = await scanDynamoDbItems(dc);
            expect(items).toEqual(itemList);
        });

        test('getS3ObjectContents関数がServerless-S3-Localのバケットキーの内容を返すこと。', async () => {
            const contents:IFloor = await getS3ObjectContents(s3);
            expect(JSON.stringify(contents)).toBe(s3Contents);
        });
    })
});

