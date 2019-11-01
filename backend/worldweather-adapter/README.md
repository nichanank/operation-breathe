# Chainlink World Weather Adapter

This adapter allows nodes to support the [World Weather Online API](https://www.worldweatheronline.com/developer/api/). This was built using the [Chainlink NodeJS Template](https://github.com/thodges-gh/CL-EA-NodeJS-Template).

The adapter currently supports `lat` and `lon` as parameters.

## Setup

### Install dependencies
`npm install`

### Run
`npm run server`
- The app should now be live on `localhost:8080`

### Test
`npm test`

### Create Zip
`zip -r airvisual-ea.zip`

## Install to AWS Lambda
* In Lambda Functions, create function
  * On the Create function page:
  * Give the function a name
  * Use Node.js 8.10 for the runtime
  * Choose an existing role or create a new one
  * Click Create Function
* Under Function code, select "Upload a .zip file" from the Code entry type drop-down
* Click Upload and select the cl-ea.zip file
* Handler should remain index.handler
* Add the environment variable (repeat for all environment variables):
  * Key: API_KEY
  * Value: Your_API_key
* Save

## Install to GCP
* In Functions, create a new function, choose to ZIP upload
* Click Browse and select the cl-ea.zip file
* Select a Storage Bucket to keep the zip in
* Function to execute: gcpservice
* Click More, Add variable (repeat for all environment variables)
  * NAME: API_KEY
  * VALUE: Your_API_key