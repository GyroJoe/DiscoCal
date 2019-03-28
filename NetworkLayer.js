const https = require('https')

class NetworkLayer 
{
	static async CreateHTTPSRequest(options, body)
	{
        return new Promise((resolve, reject) => {
            const req = https.request(options, (resp) => 
            {
             var data = ''
    
              resp.on('data', (chunk) => 
              {
                data += chunk
              })
    
              resp.on('end', () => 
              {
                  resolve(JSON.parse(data))
              })
    
            }).on("error", (err) => 
            {
                reject("Error: " + err.message)
            })
            
            req.write(body)
            req.end()
        })
	}
}

module.exports = NetworkLayer