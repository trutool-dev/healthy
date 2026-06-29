FROM postgres:16-alpine

# Copia scripts de inicialización (se ejecutan en orden alfabético al crear el contenedor)
COPY init/ /docker-entrypoint-initdb.d/

# Configuración de rendimiento básica para desarrollo
RUN echo "shared_preload_libraries = 'pg_stat_statements'" >> /usr/share/postgresql/postgresql.conf.sample

EXPOSE 5432
