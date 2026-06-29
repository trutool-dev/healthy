resource "aws_s3_bucket" "landing" {
  bucket = "healthy-landing-prod"
}

resource "aws_s3_bucket_versioning" "landing" {
  bucket = aws_s3_bucket.landing.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_website_configuration" "landing" {
  bucket = aws_s3_bucket.landing.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

# Solo se desactivan los bloqueos que impiden la bucket policy pública.
# upload_objects y acls permanecen bloqueados: solo el rol IAM de CI puede escribir.
resource "aws_s3_bucket_public_access_block" "landing" {
  bucket = aws_s3_bucket.landing.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "landing" {
  bucket = aws_s3_bucket.landing.id

  # La policy debe aplicarse después de que el bloqueo de política pública esté desactivado
  depends_on = [aws_s3_bucket_public_access_block.landing]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontServicePrincipalRead"
        Effect    = "Allow"
        Principal = { Service = "cloudfront.amazonaws.com" }
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.landing.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.landing.arn
          }
        }
      }
    ]
  })
}

# Rol IAM utilizado por GitHub Actions para los deploys desde CI
resource "aws_iam_role" "ci_deploy" {
  name = "healthy-landing-ci-deploy"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "ec2.amazonaws.com" }
        Action    = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy" "ci_deploy_s3" {
  name = "healthy-landing-s3-write"
  role = aws_iam_role.ci_deploy.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3LandingWrite"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.landing.arn,
          "${aws_s3_bucket.landing.arn}/*"
        ]
      },
      {
        Sid    = "CloudFrontInvalidate"
        Effect = "Allow"
        Action = "cloudfront:CreateInvalidation"
        Resource = aws_cloudfront_distribution.landing.arn
      }
    ]
  })
}
