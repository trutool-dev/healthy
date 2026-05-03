terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Reemplazar bucket/key/region con los valores reales antes del primer apply
  backend "s3" {
    bucket         = "healthy-terraform-state"
    key            = "landing/terraform.tfstate"
    region         = "eu-west-1"
    encrypt        = true
    dynamodb_table = "healthy-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "healthy"
      Environment = "production"
      ManagedBy   = "terraform"
    }
  }
}

# Provider secundario en us-east-1 obligatorio para CloudFront y ACM
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = "healthy"
      Environment = "production"
      ManagedBy   = "terraform"
    }
  }
}
