# ── ElastiCache Redis 7 ───────────────────────────────────────────────────────

# Subnet group: ambas AZs para failover automático
resource "aws_elasticache_subnet_group" "redis" {
  name       = "healthy-${var.environment}-redis-subnet-group"
  subnet_ids = [aws_subnet.cache_1a.id, aws_subnet.cache_1b.id]

  tags = {
    Name = "healthy-${var.environment}-redis-subnet-group"
  }
}

# Parameter group con configuraciones de seguridad y rendimiento
resource "aws_elasticache_parameter_group" "redis7" {
  name   = "healthy-${var.environment}-redis7"
  family = "redis7"

  # Persistencia AOF para recuperación ante reinicios
  parameter {
    name  = "appendonly"
    value = "yes"
  }

  # Política de evicción: eliminar claves menos usadas cuando se llena la memoria
  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }
}

# Cluster Redis (modo replication group para futuro escalado)
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id = "healthy-${var.environment}-redis"
  description          = "Redis para cache de planes IA, sesiones JWT y busqueda de alimentos"

  # Motor
  engine               = "redis"
  engine_version       = "7.1"
  node_type            = var.redis_node_type
  parameter_group_name = aws_elasticache_parameter_group.redis7.name
  port                 = 6379

  # Nodos: 1 en staging, 2 en producción (primary + replica)
  num_cache_clusters = var.environment == "production" ? 2 : 1

  # Multi-AZ solo en producción
  multi_az_enabled           = var.environment == "production"
  automatic_failover_enabled = var.environment == "production"

  # Red y seguridad
  subnet_group_name  = aws_elasticache_subnet_group.redis.name
  security_group_ids = [aws_security_group.redis.id]

  # Cifrado en tránsito y en reposo
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                 = var.redis_auth_token # Inyectar desde secrets

  # Backups automáticos (snapshots diarios)
  snapshot_retention_limit = 3
  snapshot_window          = "02:00-03:00"
  maintenance_window       = "sun:05:00-sun:06:00"

  # Aplicar cambios en la ventana de mantenimiento (evitar downtime)
  apply_immediately = var.environment != "production"

  tags = {
    Name = "healthy-${var.environment}-redis"
  }
}
