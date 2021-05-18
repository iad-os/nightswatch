package http

import input.req

showMehtod := req.method

GET {
	req.method == "GET"
}

POST {
	req.method == "POST"
}

DELETE {
	req.method == "DELETE"
}

PUT {
	req.method == "PUT"
}
