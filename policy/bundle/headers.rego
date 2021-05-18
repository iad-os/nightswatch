#example
package headers

default allow = false

hasAdmin {
	contains(input.me.roules, "admin")
}

allow {
  input.uid.email == "nikola.vurchio@iad2.it"
  contains(["GET"], input.req.method)
}

allow {
	hasAdmin
  contains(["POST", "PUT", "PATCH", "DELETE"], input.req.method)
}

contains(array, elem) {
  array[_] = elem
}
