resource "aws_cloudfront_function" "security_headers" {
  name    = "healthy-landing-security-headers"
  runtime = "cloudfront-js-2.0"
  comment = "Añade cabeceras de seguridad HTTP a cada respuesta de la landing"
  publish = true
  code    = file("${path.module}/cf-security-headers.js")
}
