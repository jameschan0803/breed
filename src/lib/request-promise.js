

const request = require('request-promise')

module.exports = (paramsX, ctx = null) => {

  var params = JSON.parse(JSON.stringify(paramsX));

  if (params.qs) {
      delete params.qs.password
      delete params.qs.login
  }
  if (params.form){
       delete params.form.password
       delete params.form.login
   }
   if (params.body){
       if (params.body.user)
         delete params.body.user.password
    }

  console.log(`:${params.method || 'GET'} request - ${params.uri || params.url} - ${JSON.stringify(params.qs || params.body || params.form || '').replace('password', '')}`)
  return request(paramsX);
}
