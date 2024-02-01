'use strict'
const log = require('logger')
const express = require('express')
const bodyParser = require('body-parser');
const compression = require('compression');
const PORT = +process.env.PORT || 3000
const cache = require('./cache')
const app = express()

app.use(bodyParser.json({
  limit: '1000MB',
  verify: (req, res, buf)=>{
    req.rawBody = buf.toString()
  }
}))
app.use(compression())
app.get('/get/*', (req, res)=>{
  handleGet(req, res)
})
app.post('/set/*', (req, res)=>{
  handleSet(req, res)
})
const server = app.listen(PORT, ()=>{
  log.info(`file-cache server is listening on ${server.address().port}`)
})
const handleGet = async(req, res)=>{
  try{
    let result
    let args = req.path?.toLowerCase()?.replace('/get/', '')?.split('/')
    if(args?.length === 2) result = await cache.get(args[0], args[1])
    if(result){
      res.json(result)
    }else{
      res.sendStatus(404)
    }
  }catch(e){
    log.error(e)
    res.sendStatus(400)
  }
}
const handleSet = async(req, res)=>{
  try{
    let result
    let args = req.path?.toLowerCase()?.replace('/set/', '')?.split('/')
    if(args?.length === 2 && req.body) result = await cache.set(args[0], args[1], req.body.data, req.body.ttl)
    if(result){
      res.sendStatus(200)
    }else{
      res.sendStatus(400)
    }
  }catch(e){
    log.error(e);
    res.sendStatus(400)
  }
}
