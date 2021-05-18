#example
package headers

default allow = false

has{
	contains(input.uid.roles, "pippo")
}

allow {
  has
  contains(["GET"], input.req.method)
}

hasAdmin{
  contains(input.uid.roles, "admin")
}

allow {
	hasAdmin
  contains(["POST", "PUT", "PATCH", "DELETE"], input.req.method)
}

contains(array, elem) {
  array[_] = elem
}
