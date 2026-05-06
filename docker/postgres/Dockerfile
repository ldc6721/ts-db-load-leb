FROM postgres:16-alpine

ENV POSTGRES_DB=postgres
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=password

COPY init/ /docker-entrypoint-initdb.d/

EXPOSE 5432
