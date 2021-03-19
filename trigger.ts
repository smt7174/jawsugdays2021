export async function handler(event:any, _context:Context):Promise<any>{
  console.log(`[event] ${JSON.stringify(event)}`);
  console.log("trigger.ts called");
  // const response:APIGatewayProxyResult = await main();
  return;
}
