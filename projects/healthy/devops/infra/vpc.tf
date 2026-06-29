# ── VPC — Red principal del proyecto Healthy ──────────────────────────────────

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "healthy-${var.environment}-vpc"
  }
}

# ── Subnets públicas (ALB, NAT Gateway) ───────────────────────────────────────

resource "aws_subnet" "public_1a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.subnet_public_1a_cidr
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "healthy-${var.environment}-public-1a"
    Tier = "public"
  }
}

resource "aws_subnet" "public_1b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.subnet_public_1b_cidr
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true

  tags = {
    Name = "healthy-${var.environment}-public-1b"
    Tier = "public"
  }
}

# ── Subnets privadas (ECS Fargate tasks) ──────────────────────────────────────

resource "aws_subnet" "private_1a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.subnet_private_1a_cidr
  availability_zone = "${var.aws_region}a"

  tags = {
    Name = "healthy-${var.environment}-private-1a"
    Tier = "private"
  }
}

resource "aws_subnet" "private_1b" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.subnet_private_1b_cidr
  availability_zone = "${var.aws_region}b"

  tags = {
    Name = "healthy-${var.environment}-private-1b"
    Tier = "private"
  }
}

# ── Subnets privadas — Base de datos (RDS) ────────────────────────────────────

resource "aws_subnet" "db_1a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.subnet_db_1a_cidr
  availability_zone = "${var.aws_region}a"

  tags = {
    Name = "healthy-${var.environment}-db-1a"
    Tier = "database"
  }
}

resource "aws_subnet" "db_1b" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.subnet_db_1b_cidr
  availability_zone = "${var.aws_region}b"

  tags = {
    Name = "healthy-${var.environment}-db-1b"
    Tier = "database"
  }
}

# ── Subnets privadas — Caché (ElastiCache) ────────────────────────────────────

resource "aws_subnet" "cache_1a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.subnet_cache_1a_cidr
  availability_zone = "${var.aws_region}a"

  tags = {
    Name = "healthy-${var.environment}-cache-1a"
    Tier = "cache"
  }
}

resource "aws_subnet" "cache_1b" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.subnet_cache_1b_cidr
  availability_zone = "${var.aws_region}b"

  tags = {
    Name = "healthy-${var.environment}-cache-1b"
    Tier = "cache"
  }
}

# ── Internet Gateway ──────────────────────────────────────────────────────────

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "healthy-${var.environment}-igw"
  }
}

# ── Elastic IPs para NAT Gateway ──────────────────────────────────────────────

resource "aws_eip" "nat_1a" {
  domain = "vpc"

  tags = {
    Name = "healthy-${var.environment}-nat-eip-1a"
  }
}

# En producción se recomienda un NAT Gateway por AZ para alta disponibilidad.
# En staging se usa uno solo para reducir costes.
resource "aws_eip" "nat_1b" {
  count  = var.environment == "production" ? 1 : 0
  domain = "vpc"

  tags = {
    Name = "healthy-${var.environment}-nat-eip-1b"
  }
}

# ── NAT Gateways ──────────────────────────────────────────────────────────────

resource "aws_nat_gateway" "nat_1a" {
  allocation_id = aws_eip.nat_1a.id
  subnet_id     = aws_subnet.public_1a.id

  depends_on = [aws_internet_gateway.main]

  tags = {
    Name = "healthy-${var.environment}-nat-1a"
  }
}

resource "aws_nat_gateway" "nat_1b" {
  count         = var.environment == "production" ? 1 : 0
  allocation_id = aws_eip.nat_1b[0].id
  subnet_id     = aws_subnet.public_1b.id

  depends_on = [aws_internet_gateway.main]

  tags = {
    Name = "healthy-${var.environment}-nat-1b"
  }
}

# ── Route Tables — públicas ────────────────────────────────────────────────────

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "healthy-${var.environment}-rt-public"
  }
}

resource "aws_route_table_association" "public_1a" {
  subnet_id      = aws_subnet.public_1a.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_1b" {
  subnet_id      = aws_subnet.public_1b.id
  route_table_id = aws_route_table.public.id
}

# ── Route Tables — privadas (ECS, RDS, Cache via NAT) ─────────────────────────

resource "aws_route_table" "private_1a" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_1a.id
  }

  tags = {
    Name = "healthy-${var.environment}-rt-private-1a"
  }
}

resource "aws_route_table" "private_1b" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = var.environment == "production" ? aws_nat_gateway.nat_1b[0].id : aws_nat_gateway.nat_1a.id
  }

  tags = {
    Name = "healthy-${var.environment}-rt-private-1b"
  }
}

resource "aws_route_table_association" "private_1a" {
  subnet_id      = aws_subnet.private_1a.id
  route_table_id = aws_route_table.private_1a.id
}

resource "aws_route_table_association" "private_1b" {
  subnet_id      = aws_subnet.private_1b.id
  route_table_id = aws_route_table.private_1b.id
}

resource "aws_route_table_association" "db_1a" {
  subnet_id      = aws_subnet.db_1a.id
  route_table_id = aws_route_table.private_1a.id
}

resource "aws_route_table_association" "db_1b" {
  subnet_id      = aws_subnet.db_1b.id
  route_table_id = aws_route_table.private_1b.id
}

resource "aws_route_table_association" "cache_1a" {
  subnet_id      = aws_subnet.cache_1a.id
  route_table_id = aws_route_table.private_1a.id
}

resource "aws_route_table_association" "cache_1b" {
  subnet_id      = aws_subnet.cache_1b.id
  route_table_id = aws_route_table.private_1b.id
}

# ── Security Groups ───────────────────────────────────────────────────────────

# ALB — tráfico web público
resource "aws_security_group" "alb" {
  name        = "healthy-${var.environment}-sg-alb"
  description = "Trafico web publico hacia el ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTPS publico"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP publico (redirect a HTTPS)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description     = "Reenvio al backend ECS"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  tags = {
    Name = "healthy-${var.environment}-sg-alb"
  }
}

# ECS — solo desde el ALB
resource "aws_security_group" "ecs" {
  name        = "healthy-${var.environment}-sg-ecs"
  description = "Trafico al backend Node.js solo desde el ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Puerto backend desde ALB"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "Salida a internet (ECR pull, Claude API, Supabase)"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description     = "PostgreSQL"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.rds.id]
  }

  egress {
    description     = "Redis"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.redis.id]
  }

  tags = {
    Name = "healthy-${var.environment}-sg-ecs"
  }
}

# RDS — solo desde ECS
resource "aws_security_group" "rds" {
  name        = "healthy-${var.environment}-sg-rds"
  description = "Acceso a PostgreSQL solo desde ECS"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL desde ECS"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  tags = {
    Name = "healthy-${var.environment}-sg-rds"
  }
}

# Redis — solo desde ECS
resource "aws_security_group" "redis" {
  name        = "healthy-${var.environment}-sg-redis"
  description = "Acceso a Redis solo desde ECS"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Redis desde ECS"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  tags = {
    Name = "healthy-${var.environment}-sg-redis"
  }
}
