variable "acm_certificate_arn" {
  description = "ARN del certificado ACM en us-east-1 para CloudFront"
  type        = string
}

variable "cloudfront_distribution_id" {
  description = "ID de la distribución CloudFront (disponible tras el primer apply)"
  type        = string
  default     = ""
}

variable "aws_region" {
  description = "Región AWS principal para los recursos (excepto ACM y CloudFront que son globales/us-east-1)"
  type        = string
  default     = "eu-west-1"
}
