import dayjs, { Dayjs } from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import * as childPc from 'child_process'

dayjs.extend(utc)
dayjs.extend(timezone)
// dayjs.tz.setDefault('Asia/Tokyo');

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
// import { mainModule } from 'process';
import 'source-map-support/register';
import { Context } from 'vm';
import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

// import { DynamoDbSettings } from 'aws-sdk/clients/dms';
// import * as DynamoDB from 'aws-sdk/clients/dynamodb';

// interface NatureRemoEventsHistoryTableItems {
//   app_name: string,
//   date_time_num: number,
//   absolute_humidity?: number
// };

// const hello:APIGatewayProxyHandler = async(event: APIGatewayProxyEvent, _context: Context):Promise<APIGatewayProxyResult> => {}
export async function hello(event:APIGatewayProxyEvent, _context:Context):Promise<APIGatewayProxyResult>{
  console.log(`[event] ${JSON.stringify(event)}`);
  // const name: string = event.queryStringParameters['name'];
  let response: APIGatewayProxyResult = null;

  const items:DocumentClient.ItemList = await main();
  const dateTime:string = getDate();
  const nodeVer: string = getNodeJsVersion();

  response = {
    statusCode: 200,
    body: JSON.stringify({
      items: items,
      dateTime: dateTime,
      nodeVer: nodeVer
    })
  };

  /*
  if(name) {
    response = {
      statusCode: 200,
      body: JSON.stringify({
        message: `Hi ${name}! Your typescript function executed successfully!`
      })
    };
  } else {
    response = {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Your name is empty.'
      })
    };
  }
  */

  return response;
}

export async function main():Promise<DocumentClient.ItemList> {

  const documentClient: DocumentClient = new AWS.DynamoDB.DocumentClient();
  const param: DocumentClient.QueryInput = {
    TableName: 'nature-remo-events-history',
    KeyConditionExpression: 'app_name = :app_name and date_time_num = :date_time_num',
    ExpressionAttributeValues: {
      ':app_name': 'NatureRemoTest',
      ':date_time_num': 20201122073504
    }
  };

  const data: DocumentClient.QueryOutput = await documentClient.query(param).promise();
  console.info(`[data] ${JSON.stringify(data)}`);

  return data.Items;
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

/*
export const exportFuncs = {
  hello:hello,
  main: main,
  getDate: getDate,
  getNodeJsVersion: getNodeJsVersion
};
*/
