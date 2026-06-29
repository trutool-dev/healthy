# ── RDS PostgreSQL 15 ──────────────────────────────────────────────────────────

# Subnet group: incluye ambas AZs para posible Multi-AZ en producción
resource "aws_db_subnet_group" "main" {
  name       = "healthy-${var.environment}-rds-subnet-group"
  subnet_ids = [aws_subnet.db_1a.id, aws_subnet.db_1b.id]

  tags = {
    Name = "healthy-${var.environment}-rds-subnet-group"
  }
}

# Parameter group con configuraciones recomendadas para la app
resource "aws_db_parameter_group" "postgres15" {
  name   = "healthy-${var.environment}-pg15"
  family = "postgres15"

  # Habilitar logs de queries lentas (>1s) para optimización
  parameter {
    name  = "log_min_duration_statement"
    value = "1000"
  }

  # Conexiones máximas (ajustar según tipo de instancia)
  parameter {
    name  = "max_connections"
    value = var.environment == "production" ? "200" : "100"
  }

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  tags = {
    Name = "healthy-${var.environment}-pg15-params"
  }
}

# Instancia RDS principal
resource "aws_db_instance" "main" {
  identifier = "healthy-${var.environment}"

  # Motor
  engine         = "postgres"
  engine_version = "15.6"

  # Sizing según entorno
  instance_class    = var.rds_instance_class
  allocated_storage = var.rds_allocated_storage
  storage_type      = "gp3"
  storage_encrypted = true

  # Base de datos inicial
  db_name  = "healthy"
  username = var.rds_username
  password = var.rds_password # Inyectar desde secrets, nunca hardcodear

  # Red y seguridad
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false

  # Alta disponibilidad (solo en producción)
  multi_az = var.environment == "production"

  # Parameter group personalizado
  parameter_group_name = aws_db_parameter_group.postgres15.name

  # Backups automáticos: 7 días de retención, ventana nocturna UTC
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:30-Mon:05:30"

  # Protección contra borrado accidental (solo producción)
  deletion_protection = var.environment == "production"

  # Snapshot final al destruir (para recuperación de emergencia)
  skip_final_snapshot       = var.environment != "production"
  final_snapshot_identifier = var.environment == "production" ? "healthy-prod-final-snapshot" : null

  # Performance Insights (gratis 7 días, útil para debugging)
  performance_insights_enabled          = true
  performance_insights_retention_period = 7

  # Monitorización mejorada (métricas del SO cada 60s)
  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_monitoring.arn

  tags = {
    Name = "healthy-${var.environment}-rds"
  }
}

# IAM Role para Enhanced Monitoring de RDS
resource "aws_iam_role" "rds_monitoring" {
  name = "healthy-${var.environment}-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "monitoring.rds.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}
