# VidiCore Face Training Theme

See [Knowledge Base](https://vidispine.atlassian.net/wiki/spaces/IES/pages/) for more information on the initial setup.

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

## Enable S3 CORS Policy

This must be set on the S3 bucket to allow playback of media using signed URLs.
```
<CORSConfiguration>
 <CORSRule>
   <AllowedOrigin>*</AllowedOrigin>
   <AllowedMethod>GET</AllowedMethod>
 </CORSRule>
</CORSConfiguration>
```
