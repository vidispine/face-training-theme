# VidiCore Face Training Theme

See [Knowledge Base](https://support.vidispine.com/space/CKB/2237825191/DeepVA+Face+Training+Theme+for+VidiCore) for more information on the initial setup.

## Quick Start

Clone the repository and navigate to the root. Start the application by running:
```
yarn install
yarn start
```
Then open http://localhost:3000/ to see your app. Any change made to the code will automatically update the application.


## Build

Compile the application locally.
```
yarn build
```

### Enable S3 CORS Policy

This must be set on the S3 bucket to allow playback of media using signed URLs. This can be done either via the AWS console or the AWS website.
```
<CORSConfiguration>
 <CORSRule>
   <AllowedOrigin>http://localhost:3000</AllowedOrigin>
   <AllowedMethod>GET</AllowedMethod>
 </CORSRule>
</CORSConfiguration>
```

### Enable VidiCore CORS Policy

This must be set on the VidiCore instance your application is running on. This can be done in the console of you choice or via Postman.
`PUT /API/configuration/cors`
```
<CORSConfigurationDocument xmlns="http://xml.vidispine.com/schema/vidispine">
 <entry>
  <request>
   <origin>http://localhost:3000</origin>
  </request>
  <response>
   <allowOrigin>http://localhost:3000</allowOrigin>
   <allowMethods>OPTIONS,GET,HEAD,POST,PUT,DELETE</allowMethods>
   <allowHeaders>accept,content-type,authorization,index,size,runas</allowHeaders>
   <allowMaxAge>600</allowMaxAge>
 </response>
</entry>
```
