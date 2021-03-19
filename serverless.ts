import type { Serverless } from 'serverless/aws';

// serverless offlineなど
const serverlessConfiguration: Serverless = {
  service: 'jawsugdays-2021-sample',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    },
    dynamodb:{
      // If you only want to use DynamoDB Local in some stages, declare them here
      stages:[
        'dev',
        'test'
      ],
      start :{
        port: 8000,
        inMemory: true,
        // dbPath: 'dynamo/',
        heapInitial: '200m',
        heapMax: '1g',
        migrate: true,
        seed: true,
        convertEmptyValues: true
      },
      seed: {
        tower_of_druaga: {
          sources: [
            {
              table: 'tower-of-druaga-jawsugdays',
              sources: ['./tower-of-druaga-jawsugdays.json']
            }
          ]
        },
      }
      // Uncomment only if you already have a DynamoDB running locally
      // noStart: true
    },
    s3: {
      host: 'localhost',
      directory: './bucket',
      port: 4569
    }
  },
  // Add the serverless-webpack plugin
  // serverless-dynamodb-local must be above than serverless-offline
  // serverless-dynamodb-local has to be installed by 'serverlss dynamodb install --localPath ./bin'
  // if installed without --localPath option, spawn java ENOENT Error Occurs.
  // https://github.com/99x/serverless-dynamodb-local/issues/195
  // https://github.com/99x/serverless-dynamodb-local/issues/195#issuecomment-455587789
  plugins: [
    'serverless-webpack',
    'serverless-dynamodb-local',
    'serverless-s3-local',
    'serverless-offline'
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    profile: 'default',
    region: 'ap-northeast-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 'dynamodb:*',
        Resource: '*'
      },
      {
        Effect: 'Allow',
        Action: 's3:*',
        Resource: '*'
      }
    ]
  },
  functions: {
    get: {
      handler: 'get.handler',
      events: [
        {
          http: {
            method: 'get',
            path: 'get',
          }
        }
      ]
    },
    trigger: {
      handler: 'trigger.handler',
      events: [
        {
          s3: {
            bucket: 'jawsugdays2021',
            event: 's3:ObjectCreated:*'
          }
        },
        {
          stream: {
            type: 'dynamodb',
            arn: {
              "Ref": ['TowerOfDruagaTableStreamArn']
            }
          }
        }
      ]
    },
    // post: {
    //   handler: 'post.handler',
    //   events: [
    //     {
    //       http: {
    //         method: 'post',
    //         path: 'post',
    //       }
    //     }
    //   ]
    // }
  },
  resources: {
    Resources:{
      TowerOfDruagaTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'tower-of-druaga-jawsugdays',
          AttributeDefinitions:[
            {
              AttributeName: "Type",
              AttributeType: "S"
            },
            {
              AttributeName: "Floor",
              AttributeType: "N"
            }
          ],
          KeySchema:[
            {
              AttributeName: "Type",
              KeyType: "HASH"
            },
            {
              AttributeName: "Floor",
              KeyType: "RANGE"
            }
          ],
          BillingMode: 'PAY_PER_REQUEST',
          StreamSpecification: {
            StreamViewType: 'NEW_AND_OLD_IMAGES'
          }
        }
      },
    }
  }
}

module.exports = serverlessConfiguration;
