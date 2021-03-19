import dayjs, { Dayjs } from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import * as childPc from 'child_process'

dayjs.extend(utc)
dayjs.extend(timezone)
// dayjs.tz.setDefault('Asia/Tokyo');

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import { Context } from 'vm';
import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import S3, { GetObjectRequest, GetObjectOutput, PutObjectRequest} from 'aws-sdk/clients/s3';

const TABLE_NAME = "tower-of-druaga";
const TABLE_PARTITION_KEY = "treasure";
const BUCKET_NAME = "suzukima-s3-local-test-bucket";
const FILE_NAME = `${TABLE_NAME}.json`;

export async function handler(event:APIGatewayProxyEvent, _context:Context):Promise<APIGatewayProxyResult>{
  console.log(`[event] ${JSON.stringify(event)}`);
  const floor:number = parseInt(event.queryStringParameters['floor']);

  // const dateTime:string = getDate();
  // const nodeVer: string = getNodeJsVersion();

  const treasure:DocumentClient.AttributeMap = await getDynamoDbItems(floor);
  // await putAndGetS3Object(treasure);
  await putS3ObjectContents(treasure);
  // const promiseS3:string = putAndGetS3Object(treasure);

  // const [items, latestDateTime]:[DocumentClient.ItemList, string] = await Promise.all([promiseDynamo, promiseS3]);

  const response:APIGatewayProxyResult = {
    statusCode: 200,
    body: JSON.stringify({
      treasure: treasure
      // items: items,
      // dateTime: dateTime,
      // latestDateTime: latestDateTime,
      // nodeVer: nodeVer
    })
  };

  return response;
}
export function getDate(dateTime?:string | number, format?:string): string {
  const moment:Dayjs = (function():Dayjs {
    const momentInterim:Dayjs = dateTime ? dayjs(dateTime) : dayjs();
    return momentInterim.tz('Asia/Tokyo');
  })();

  const momentString:string = format ? moment.format(format) : moment.format();
  return momentString;
}

export function getNodeJsVersion():string {
    const execSync = childPc.execSync;
    const stdout:string = execSync("node -v").toString();
    console.log(stdout);
    return stdout;
}

export async function getDynamoDbItems(floor:number):Promise<DocumentClient.AttributeMap> {

  let documentClient: DocumentClient = createDocumentClientObject();

  const param: DocumentClient.GetItemInput = {
    TableName: TABLE_NAME,
    Key: {
      Type: TABLE_PARTITION_KEY,
      Floor: floor
    }
  };

  const data: DocumentClient.GetItemOutput = await documentClient.get(param).promise();
  console.info(`[data] ${JSON.stringify(data)}`);

  return data.Item;
}

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

export async function putAndGetS3Object(treasure:DocumentClient.AttributeMap):Promise<string> {
  const s3 = createS3Object();

  await putS3ObjectContents(treasure, s3);
  return;
  // const dateTimeLatest = await getS3ObjectContents(s3);
  // return dateTimeLatest;
}

export async function putS3ObjectContents(treasure:DocumentClient.AttributeMap, s3:S3 = null):Promise<void> {

  console.log('putS3ObjectContents called');

  let s3Obj = s3 ? s3 : createS3Object();
  const param: PutObjectRequest = {
    Bucket: BUCKET_NAME,
    Key: FILE_NAME,
    Body: JSON.stringify(treasure)
  };

  console.log('putS3ObjectContents params: ' + JSON.stringify(param));

  await s3Obj.putObject(param).promise();
  return;
}

export async function getS3ObjectContents(s3:S3):Promise<string> {

  console.log('getS3ObjectContents called');

  const param: GetObjectRequest = {
    Bucket: BUCKET_NAME,
    Key: FILE_NAME,
  };

  console.log('getS3ObjectContents params: ' + JSON.stringify(param));

  const data:GetObjectOutput = await s3.getObject(param).promise();
  console.log('getS3ObjectContents data: ' + JSON.stringify(data));
  return data.Body.toString();
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

/*
export const exportFuncs = {
  hello:hello,
  main: main,
  getDate: getDate,
  getNodeJsVersion: getNodeJsVersion
};
*/
