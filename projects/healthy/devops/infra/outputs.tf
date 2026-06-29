output "cloudfront_domain_name" {
  description = "Dominio asignado por CloudFront (usado en los registros DNS alias)"
  value       = aws_cloudfront_distribution.landing.domain_name
}

output "cloudfront_distribution_id" {
  description = "ID de la distribución CloudFront (necesario para invalidaciones desde CI)"
  value       = aws_cloudfront_distribution.landing.id
}

output "s3_bucket_name" {
  description = "Nombre del bucket S3 de la landing"
  value       = aws_s3_bucket.landing.bucket
}

output "s3_website_endpoint" {
  description = "Endpoint de website estático del bucket S3 (sin SSL — usar CloudFront en producción)"
  value       = aws_s3_bucket_website_configuration.landing.website_endpoint
}
