resource "aws_cloudfront_origin_access_control" "landing" {
  name                              = "healthy-landing-oac"
  description                       = "OAC para bucket S3 healthy-landing-prod"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "landing" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"
  aliases             = ["healthy.app", "www.healthy.app"]

  origin {
    domain_name              = aws_s3_bucket.landing.bucket_regional_domain_name
    origin_id                = "S3-healthy-landing-prod"
    origin_access_control_id = aws_cloudfront_origin_access_control.landing.id
  }

  default_cache_behavior {
    target_origin_id       = "S3-healthy-landing-prod"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    default_ttl = 86400
    max_ttl     = 31536000
    min_ttl     = 0

    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.security_headers.arn
    }
  }

  # 404 y 403 se redirigen a index.html para que el router SPA gestione la ruta
  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 300
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 300
  }

  viewer_certificate {
    acm_certificate_arn      = var.acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}
