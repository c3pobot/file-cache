'use strict'
const baseDir = __dirname;
const fs = require('fs')
const path = require('path')
const keys = {}
let cacheTypes = ['player', 'guild']

if(process.env.CACHE_TYPES) cacheTypes = JSON.parse(process.evn.CACHE_TYPES)
const init = ()=>{
  try{
    for(let i in cacheTypes){
      let dirPath = path.join(baseDir, 'data', cacheTypes[i])
      if(!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, {recursive: true})
      keys[cacheTypes[i]] = {}
      altKeys[cacheTypes[i]] = {}
    }
  }catch(e){
    console.error(e);
  }
}
const removeCache = (cache, id)=>{
  try{
    fs.unlinkSync(path.join(baseDir, 'data', cache, `${id}.json`))
  }catch(e){
    console.error(e);
  }
}
const saveCache = (cache, id, data, ttl)=>{
  try{
    if(!keys[cache]) return
    let expireTime
    if(ttl > 0) expireTime = Date.now() + (ttl + 1000)
    if(expireTime) data.ttl = expireTime
    fs.writeFileSync(path.join(baseDir, 'data', cache, `${id}.json`), JSON.stringify(data))
    if(expireTime) keys[cache][id] = { ttl: expireTime }
    if(altId){
      fs.writeFileSync(path.join(baseDir, 'data', cache, `${altId}.json`), JSON.stringify(data))
      if(expireTime) keys[cache][altId] = { ttl: expireTime }
    }
    return true
  }catch(e){
    console.error(e);
  }
}
const getCache = (cache, id)=>{
  try{
    let timeNow = Date.now()
    let obj = fs.readFileSync(path.join(baseDir, 'data', cache, `${id}.json`))
    if(obj) obj = JSON.parse(obj)
    if(obj?.ttl && timeNow > obj?.ttl){
      removeCache(cache, id)
      return
    }
    if(obj) return obj
  }catch(e){
    console.error(e);
  }
}
init()
module.exports.set = saveCache
module.exports.get = getCache
