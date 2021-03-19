# このファイルについて
このファイルは、2021/3/20(土)開催の JAWS DAYS 2021 -re:Connect- の私のセッション「AWS Lambdaのテストで役立つ各種ツール」の参考ソースです。

https://jawsdays2021.jaws-ug.jp/

## 参考資料(登壇資料)
https://www.slideshare.net/MasakiSuzuki3/20210320jawsdays2021reconnect

※Serverless DynamoDB Local, Serverless S3 Localの一部情報について「参考情報その1～2」にまとめてありますので、何かあった際に参照ください。

## 重要なファイル一覧
- bucket/jawsdays2021：serverless-s3-localで使用するS3バケットフォルダ。
- scripts/install-dynamo.js：「npm run install-dynamo」コマンドで使用するインストール用jsファイル。
- restClient.http：restClient用のファイルです。(Serverless Offline使用時にリクエストを送ると、レスポンスが返ります。)
- serverless.ts：Serverless Frameworkのテンプレートファイルです。ここでDynamoDB-Localの初期データ(seed)設定やserverless-s3-localのバケット(ローカルフォルダ)設定を行っています。
- tower-of-druaga-jawadays.json：DynamoDB Localの初期データ(seed)設定です。
- get.test.js：テスト用ファイルです。

## ソースについて
このソースは、主にaws-sdk-mock, Serverless Offline, Serverless DynamoDB Local, Serverless S3 Localを使用する際のソースの参考としてください。


## (実際に動作させる場合)実行方法
- npm installして、各種npmモジュールをインストールする
- npm run install-dynamoコマンドでDynamoDB Localをインストールする
- serverless offlineコマンドでServerless Offlineを起動する
- serverless dynamodb startコマンドでServerless DynamoDB Local を起動する
- npm run testコマンドでテストを実施する

※動作確認はしていますが、動作させる場合は自己責任でお願いします。

## その他
その他事項は、ソース内のコメントや先述の登壇資料を参照してください。

## 注意点
- 動作には、Serverless Framework, 及びJestも必要です
- Serverless Framework, 及びJestはこのGitHubのソースには含まれていません。各自インストールをお願いします。

## DynamoDB, S3のデータについて
DynamoDB, S3のデータは、2021/1/6(水)に行われたServerless Meetup Virtualでの私の発表で使用した「ドルアーガの塔 宝箱情報取得Lambda」をベースにしています。

https://www.youtube.com/watch?v=XkQL5j8tqgs

※「ドルアーガの塔」が分からない人は、「ドルアーガの塔」や「ドルアーガの塔 宝箱」などで調べてもらうとわかると思います