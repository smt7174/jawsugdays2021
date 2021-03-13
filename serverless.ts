import type { Serverless } from 'serverless/aws';

// serverless offlineなど
const serverlessConfiguration: Serverless = {
  /*
  service: {
    name: 'serverless-typescript-test',
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
  },
  */
  service: 'serverless-typescript-test',
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
              table: 'tower-of-druaga',
              sources: ['./tower_of_druaga.json']
            }
          ]
        },
        // nature_remo: {
        //   sources: [
        //     {
        //       table: 'nature-remo-events-history',
        //       sources: ['./nature_remo.json']
        //     }
        //   ]
        // },
      }
      // Uncomment only if you already have a DynamoDB running locally
      // noStart: true
    },
    s3: {
      host: 'localhost',
      directory: './buckets',
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
    hello: {
      handler: 'handler.hello',
      events: [
        {
          http: {
            method: 'get',
            path: 'hello',
          }
        }
      ]
    }
  },
  resources: {
    Resources:{
      // usersTable: {
      //   Type: 'AWS::DynamoDB::Table',
      //   Properties: {
      //     TableName: 'nature-remo-events-history',
      //     AttributeDefinitions: [
      //       {
      //         AttributeName: 'app_name',
      //         AttributeType: 'S'
      //       },
      //       {
      //         AttributeName: 'date_time_num',
      //         AttributeType: 'N'
      //       }
      //     ],
      //     KeySchema: [
      //       {
      //         AttributeName: 'app_name',
      //         KeyType: 'HASH'
      //       },
      //       {
      //         AttributeName: 'date_time_num',
      //         KeyType: 'RANGE'
      //       }
      //     ],
      //     ProvisionedThroughput: {
      //       ReadCapacityUnits: 1,
      //       WriteCapacityUnits: 1
      //     }
      //   }
      // },
      TowerOfDruagaTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'tower-of-druaga',
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
          BillingMode: 'PAY_PER_REQUEST'
        }
      },
      SuzukimaS3LocalBucketTest: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: 'suzukima-s3-local-test-bucket'
        }
      }
    }
  }
}

module.exports = serverlessConfiguration;
