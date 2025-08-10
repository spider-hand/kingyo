#!/bin/sh

if [ "$DATABASE" = "postgres" ]
then
    echo "Waiting for postgres..."

    while ! nc -z $DB_HOST $DB_PORT; do
      sleep 0.1
    done

    echo "PostgreSQL started"
fi

echo "Running migrations..."
uv run manage.py makemigrations
uv run manage.py migrate

if [ "$DEBUG" = "True" ]
then
    echo "Generating seed data..."
    uv run manage.py seed
fi

exec "$@"
