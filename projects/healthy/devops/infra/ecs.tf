# ── ECS — Cluster, Task Definition, Service y ECR ────────────────────────────

# Repositorio ECR para las imágenes del backend
resource "aws_ecr_repository" "api" {
  name                 = "healthy-api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true # Escanear vulnerabilidades en cada push
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Name = "healthy-api-ecr"
  }
}

# Política de ciclo de vida: mantener solo las últimas 10 imágenes por tag
resource "aws_ecr_lifecycle_policy" "api" {
  repository = aws_ecr_repository.api.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Mantener las ultimas 10 imagenes tagged"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["develop-", "v"]
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = { type = "expire" }
      },
      {
        rulePriority = 2
        description  = "Eliminar imagenes untagged despues de 7 dias"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 7
        }
        action = { type = "expire" }
      }
    ]
  })
}

# Cluster ECS
resource "aws_ecs_cluster" "main" {
  name = "healthy-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled" # Métricas detalladas en CloudWatch
  }

  tags = {
    Name = "healthy-${var.environment}-cluster"
  }
}

# Log group en CloudWatch para los logs del backend
resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/healthy-api"
  retention_in_days = 30

  tags = {
    Name = "healthy-${var.environment}-api-logs"
  }
}

# IAM Role para las tareas ECS (permisos para ECR, CloudWatch, Secrets Manager)
resource "aws_iam_role" "ecs_task_execution" {
  name = "healthy-${var.environment}-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_policy" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# IAM Role para la aplicación dentro del contenedor (acceso a S3, etc.)
resource "aws_iam_role" "ecs_task" {
  name = "healthy-${var.environment}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

# Permitir al backend escribir y leer fotos de progreso en S3
resource "aws_iam_role_policy" "ecs_task_s3" {
  name = "healthy-${var.environment}-ecs-s3-policy"
  role = aws_iam_role.ecs_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject"
        ]
        Resource = "arn:aws:s3:::healthy-progress-photos-${var.environment}/*"
      }
    ]
  })
}

# Task Definition
resource "aws_ecs_task_definition" "api" {
  family                   = "healthy-api-${var.environment}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.ecs_cpu
  memory                   = var.ecs_memory

  execution_role_arn = aws_iam_role.ecs_task_execution.arn
  task_role_arn      = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name  = "healthy-api"
      image = "${aws_ecr_repository.api.repository_url}:${var.api_image_tag}"

      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]

      # Variables de entorno inyectadas desde secretos (nunca hardcodeadas)
      environment = [
        { name = "NODE_ENV", value = var.environment },
        { name = "PORT", value = "3000" },
        { name = "AWS_REGION", value = var.aws_region }
      ]

      secrets = [
        { name = "DATABASE_URL", valueFrom = "arn:aws:secretsmanager:${var.aws_region}:${var.aws_account_id}:secret:healthy/${var.environment}/DATABASE_URL" },
        { name = "REDIS_URL", valueFrom = "arn:aws:secretsmanager:${var.aws_region}:${var.aws_account_id}:secret:healthy/${var.environment}/REDIS_URL" },
        { name = "JWT_SECRET", valueFrom = "arn:aws:secretsmanager:${var.aws_region}:${var.aws_account_id}:secret:healthy/${var.environment}/JWT_SECRET" },
        { name = "JWT_REFRESH_SECRET", valueFrom = "arn:aws:secretsmanager:${var.aws_region}:${var.aws_account_id}:secret:healthy/${var.environment}/JWT_REFRESH_SECRET" },
        { name = "ANTHROPIC_API_KEY", valueFrom = "arn:aws:secretsmanager:${var.aws_region}:${var.aws_account_id}:secret:healthy/${var.environment}/ANTHROPIC_API_KEY" },
        { name = "SUPABASE_URL", valueFrom = "arn:aws:secretsmanager:${var.aws_region}:${var.aws_account_id}:secret:healthy/${var.environment}/SUPABASE_URL" },
        { name = "SUPABASE_KEY", valueFrom = "arn:aws:secretsmanager:${var.aws_region}:${var.aws_account_id}:secret:healthy/${var.environment}/SUPABASE_KEY" },
        { name = "SMTP_HOST", valueFrom = "arn:aws:secretsmanager:${var.aws_region}:${var.aws_account_id}:secret:healthy/${var.environment}/SMTP_HOST" },
        { name = "SMTP_PORT", valueFrom = "arn:aws:secretsmanager:${var.aws_region}:${var.aws_account_id}:secret:healthy/${var.environment}/SMTP_PORT" },
        { name = "SMTP_USER", valueFrom = "arn:aws:secretsmanager:${var.aws_region}:${var.aws_account_id}:secret:healthy/${var.environment}/SMTP_USER" },
        { name = "SMTP_PASS", valueFrom = "arn:aws:secretsmanager:${var.aws_region}:${var.aws_account_id}:secret:healthy/${var.environment}/SMTP_PASS" }
      ]

      # Health check: llamada al endpoint /health del backend
      healthCheck = {
        command     = ["CMD-SHELL", "wget -qO- http://localhost:3000/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.api.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = {
    Name = "healthy-${var.environment}-api-task"
  }
}

# ECS Service
resource "aws_ecs_service" "api" {
  name            = "healthy-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.ecs_desired_count
  launch_type     = "FARGATE"

  # Asegurar que siempre hay al menos una tarea corriendo durante el deploy
  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200

  network_configuration {
    subnets          = [aws_subnet.private_1a.id, aws_subnet.private_1b.id]
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "healthy-api"
    container_port   = 3000
  }

  # Esperar a que el ALB esté listo antes de crear el servicio
  depends_on = [aws_lb_listener.https]

  tags = {
    Name = "healthy-${var.environment}-api-service"
  }

  lifecycle {
    # Ignorar cambios en task_definition para que Terraform no revierta deploys
    # realizados por GitHub Actions (aws ecs update-service)
    ignore_changes = [task_definition, desired_count]
  }
}

# Auto Scaling para el servicio ECS (solo en producción)
resource "aws_appautoscaling_target" "ecs" {
  count              = var.environment == "production" ? 1 : 0
  max_capacity       = 10
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.api.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "ecs_cpu" {
  count              = var.environment == "production" ? 1 : 0
  name               = "healthy-prod-ecs-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs[0].resource_id
  scalable_dimension = aws_appautoscaling_target.ecs[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs[0].service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 70.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}
