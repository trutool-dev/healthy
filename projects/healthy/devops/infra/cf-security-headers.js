// Runtime: cloudfront-js-2.0
// Evento: viewer-response
// Añade cabeceras de seguridad a todas las respuestas salientes de CloudFront.
function handler(event) {
  var response = event.response;
  var headers = response.headers;

  headers["strict-transport-security"] = {
    value: "max-age=63072000; includeSubDomains; preload",
  };
  headers["x-frame-options"] = { value: "DENY" };
  headers["x-content-type-options"] = { value: "nosniff" };
  headers["referrer-policy"] = { value: "strict-origin-when-cross-origin" };
  headers["permissions-policy"] = {
    value: "camera=(), microphone=(), geolocation=(self)",
  };
  headers["content-security-policy"] = {
    value:
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data:; " +
      "font-src 'self'; " +
      "connect-src 'self' https://api.healthy.app",
  };

  return response;
}
