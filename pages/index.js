const http = require("http")
const fs = require('fs');
const dataTablePath = './dataTable.json'

http.createServer(Service).listen(4399)

function parseLeapRequest(pathname) {
    const fetched = require(dataTablePath)[0][pathname]
    console.log("leaping to " + fetched)
    return fetched
}

function Service(request, response) {
    switch (request.method) {
        case "GET":
            new Promise((resolve, reject) => {
                if (typeof request.url !== "string") reject(401)
                resolve(parseLeapRequest(request.url))
            }).then((fetch) => {
                if (fetch === undefined) throw 404
                response.writeHead(301, {'Location': fetch});
                response.end()
            }).catch((error) => {
                switch (error) {
                    case 404: console.warn("Not found")
                        fs.readFile("./fallback/missing.html", ((err, data) => {
                            if (err) {console.error(err)} else {
                                response.writeHead(200, {'Content-Type': 'text/html'})
                                response.write(data.toString())
                                response.end()
                            }
                        }))
                        break;
                    case 401: console.error("Type error")
                        break;
                }
            })
            break;
        case "POST":
            const headers = request.headers
            console.log(headers.token)
            if (headers.token !== "youTakeIt") {
                response.writeHead(401)
                response.end()
                break;
            }
            if (headers.alias === undefined || headers.original === undefined) {
                response.writeHead(403)
                response.end()
                break;
            }
            new Promise(((resolve) => {resolve(require(dataTablePath))})).then((table) => {
                table[headers.alias] = headers.original
                fs.writeFile(dataTablePath, JSON.stringify(table), (error) => {if (error) throw error})
                response.writeHead(200, {'Content-Type': 'text/plain'})
                response.end("Good")
                console.log(headers.alias + "->" + headers.original)
            }).catch((error) => console.error(error))
            break;
    }
}