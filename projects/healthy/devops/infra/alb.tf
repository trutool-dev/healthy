# ── ALB — Application Load Balancer ───────────────────────────────────────────

# Certificado ACM para el dominio de la API (eu-west-1, no us-east-1)
# El ALB no es CloudFront, por eso el certificado va en eu-west-1
resource "aws_acm_certificate" "api" {
  domain_name               = "api${var.environment == "production" ? "" : "-${var.environment}"}.healthy.app"
  subject_alternative_names = ["api${var.environment == "production" ? "" : "-${var.environment}"}.healthy.app"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "healthy-${var.environment}-api-cert"
  }
}

# Registro DNS para validar el certificado ACM
resource "aws_route53_record" "api_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.api.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = var.route53_zone_id
}

resource "aws_acm_certificate_validation" "api" {
  certificate_arn         = aws_acm_certificate.api.arn
  validation_record_fqdns = [for record in aws_route53_record.api_cert_validation : record.fqdn]
}

# Application Load Balancer
resource "aws_lb" "api" {
  name               = "healthy-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = [aws_subnet.public_1a.id, aws_subnet.public_1b.id]

  # Protección contra borrado accidental en producción
  enable_deletion_protection = var.environment == "production"

  # Logs de acceso en S3 (útil para auditoría y debugging)
  access_logs {
    bucket  = "healthy-alb-logs-${var.environment}"
    prefix  = "api"
    enabled = var.environment == "production"
  }

  tags = {
    Name = "healthy-${var.environment}-alb"
  }
}

# Target Group para el backend Node.js
resource "aws_lb_target_group" "api" {
  name        = "healthy-${var.environment}-api-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip" # Obligatorio para Fargate

  health_check {
    enabled             = true
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }

  # Deregistration delay: esperar 30s antes de sacar instancias (graceful shutdown)
  deregistration_delay = 30

  tags = {
    Name = "healthy-${var.environment}-api-tg"
  }
}

# Listener HTTPS :443 → target group
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.api.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06" # Solo TLS 1.2+
  certificate_arn   = aws_acm_certificate_validation.api.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

# Listener HTTP :80 → redirect a HTTPS
resource "aws_lb_listener" "http_redirect" {
  load_balancer_arn = aws_lb.api.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# Registro DNS Route 53 para el ALB
resource "aws_route53_record" "api" {
  zone_id = var.route53_zone_id
  name    = "api${var.environment == "production" ? "" : "-${var.environment}"}.healthy.app"
  type    = "A"

  alias {
    name                   = aws_lb.api.dns_name
    zone_id                = aws_lb.api.zone_id
    evaluate_target_health = true
  }
}
