# Pengulingo - Back End
This is a repository for the back end code of Pengulingo.

## Architecture
Pengulingo's backend is modeled off the Kahoots API short assignment. There are two MongoDB schemas, player and room, each with a respective controller. We use Express.js to manage routing.

## Setup

To connect to a local MongoDB server, you will need to have MongoDB installed on your device. Use Compass, the MongoDB GUI, or the mongo shell to create a new database called pengulingo. Then run ```npm start```.

To connect to a remote MongoDB cluster, you will need an existing database on MongoDB Atlas. First, create a ```.env``` file in the root folder. Then, follow the instructions [here](https://www.mongodb.com/docs/manual/reference/connection-string/) to get your database's connection string. Save your connection string in your ```.env``` file as ```MONGODB_URI=$YOUR_CONNECTION_STRING```.

## Deployment

The RESTapi is deployed on render at https://pengulingo-api.onrender.com. 

To deploy, enter the following:

* Build command: ```npm install && npm run build```
* Publish directory: ```dist```

Add the following environment variable, following the instructions above to get your connection string:
* ```MONGODB_URI=$YOUR_CONNECTION_STRING```

## Authors

Daisy Li, Selena Zhou, Jamie Nicholson, Luke Cargill

## Acknowledgments

Prof. Tim Tregubov and all our wonderful TAs!
