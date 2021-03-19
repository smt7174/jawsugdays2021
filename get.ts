import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import { Context } from 'vm';
import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import S3, { GetObjectRequest, GetObjectOutput } from 'aws-sdk/clients/s3';

const TABLE_NAME = "tower-of-druaga-jawsugdays";
const BUCKET_NAME = "jawsugdays2021";
const FILE_NAME = `${TABLE_NAME}.json`;

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

export async function handler(event:APIGatewayProxyEvent, _context:Context):Promise<APIGatewayProxyResult>{
  // console.log(`[event] ${JSON.stringify(event)}`);

  const response:APIGatewayProxyResult = await main();
  return response;
}

export async function main():Promise<APIGatewayProxyResult> {

  let response:APIGatewayProxyResult = null;

  try {
    const dc:DocumentClient = createDocumentClientObject();
    const s3:S3 = createS3Object();

    // await putS3ObjectContents(s3);

    const promises:any[] = [scanDynamoDbItems(dc), getS3ObjectContents(s3)];
    const results: any[] = await Promise.all(promises);

    const items: DocumentClient.ItemList = results[0];
    const contents:IFloor = results[1];
    response = createResponse(200, "", items, contents);
  } catch(error) {
    response = createResponse(500, error.message);
  }

  return response
}

export async function scanDynamoDbItems(_dc:DocumentClient):Promise<DocumentClient.ItemList> {

  const param: DocumentClient.ScanInput = {
    TableName: TABLE_NAME
  };

  const data: DocumentClient.ScanOutput = await _dc.scan(param).promise();
  // console.info(`[data] ${JSON.stringify(data)}`);

  return data.Items;
}

export async function getS3ObjectContents(_s3:S3):Promise<IFloor> {

  const param: GetObjectRequest = {
    Bucket: BUCKET_NAME,
    Key: FILE_NAME,
  };

  // console.log('getS3ObjectContents params: ' + JSON.stringify(param));

  const data:GetObjectOutput = await _s3.getObject(param).promise();
  const contents:string = data.Body.toString()
  // console.log('getS3ObjectContents contents: ' + contents);

  const result = JSON.parse(contents) as IFloor;
  return result;
}

/**
 * DynamoDB.DocumentClientインスタンスを生成する。
 * @return {DocumentClient} DynamoDB.DocumentClientインスタンス
 */
export function createDocumentClientObject():DocumentClient {
  let documentClient: DocumentClient = null;

  if(process.env.IS_OFFLINE) {
    console.info("[getDynamoDbItems] IS_OFFLINE is true.");
    documentClient = new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000',
    });
  } else {
    console.info("[getDynamoDbItems] IS_OFFLINE is false.");
    documentClient = new AWS.DynamoDB.DocumentClient();
  }

  return documentClient;
}

export function createS3Object():S3 {

  let s3:S3 = null;
  if(process.env.IS_OFFLINE) {
    console.info("[createS3Object] IS_OFFLINE is true.");
    s3 = new AWS.S3({
      s3ForcePathStyle: true,
      accessKeyId: 'S3RVER', // This specific key is required when working offline
      secretAccessKey: 'S3RVER',
      endpoint: new AWS.Endpoint('http://localhost:4569'),
    });
  } else {
    console.info("[createS3Object] IS_OFFLINE is false.");
    s3 = new AWS.S3();
  }

  return s3;
}

export function createResponse(_code:number, _message:string, _items?:DocumentClient.AttributeMap, _contents?: IFloor): APIGatewayProxyResult {
  const response:APIGatewayProxyResult = {
    statusCode: _code,
    body: JSON.stringify({
      message: _message,
      items: _items,
      contents: _contents
    })
  };

  return response;
}

/*
// S3バケットにファイルを作成する用の関数
export async function putS3ObjectContents(_s3:S3):Promise<void> {

  const contents = [
    {
      "Type": "treasure",
      "Floor": 58,
      "Detail": [
        {
          "Condition": "左から10列目の、上から8行目，2行目，5行目の順に下向きに通過する。",
          "Effect": "クリアに必要",
          "Memo": "60階の順所と同じ",
          "Name": "ブルークリスタルロッド"
        }
      ]
    },
    {
      "Type": "treasure",
      "Floor": 59,
      "Detail": [
        {
          "Condition": "",
          "Effect": "",
          "Memo": "",
          "Name": "なし"
        }
      ]
    },
    {
      "Type": "treasure",
      "Floor": 60,
      "Detail": [
        {
          "Condition": "",
          "Effect": "",
          "Memo": "順番は58階と同じ",
          "Name": "なし"
        }
      ]
    }
  ];

  const param: S3.PutObjectRequest = {
    Bucket: BUCKET_NAME,
    Key: "put_" + FILE_NAME,
    Body: JSON.stringify(contents)
  };

  console.log('putS3ObjectContents params: ' + JSON.stringify(param));

  const data:S3.PutObjectOutput = await _s3.putObject(param).promise();
  console.log('puS3ObjectContents data: ' + JSON.stringify(data));
  return;
}
*/

export const exportFuncs = {
  scanDynamoDbItems:scanDynamoDbItems,
  getS3ObjectContents: getS3ObjectContents
};

