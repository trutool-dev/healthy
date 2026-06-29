data "aws_route53_zone" "healthy_app" {
  name         = "healthy.app."
  private_zone = false
}

resource "aws_route53_record" "apex" {
  zone_id = data.aws_route53_zone.healthy_app.zone_id
  name    = "healthy.app"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.landing.domain_name
    zone_id                = aws_cloudfront_distribution.landing.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.healthy_app.zone_id
  name    = "www.healthy.app"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.landing.domain_name
    zone_id                = aws_cloudfront_distribution.landing.hosted_zone_id
    evaluate_target_health = false
  }
}
