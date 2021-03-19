const dynamodbLocal = require('dynamodb-localhost');
dynamodbLocal.install(() => {
  console.log('------- Finish -------');
}, '../../../.dynamodb')