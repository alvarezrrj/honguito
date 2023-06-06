# Honguito 🍄

This was my first ever fullstack project. It is a webapp built with React, Express and MongoDB on a Raspberry Pi that displays live data (via websocket) from a mushroom incubator (temperature, heater status, incubation time and current mycelium stage). 

It also leaverages IFTTT to send mobile notifications when the teperature is not cozy enough for the old shrooms.

I don't think it would work if one tried to deploy it in its current state given it has been subject to experiments and non-tested changes over time as one learned new things and came up with new ideas.

This repo is only kept alive for nostalgic reasons.

## Built with

- React
- Express.js
- MongoDB
- Raspberry Pi

## Acknowledgments

- Big shout out to the RPI community. 
- CodeCademy for teaching me the basics needed to spark up the interest into the wonderfull world of the internet (of things) 🙌.



## How to run it

Run the following from the root directory
```
$ node server.js
```
```
$ mongod --dbpath ./data'
```
