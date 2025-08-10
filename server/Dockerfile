# Pull base image
FROM python:3.13

# Set the working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never \
    UV_PROJECT_ENVIRONMENT=/app/.venv

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends netcat-traditional

# Install uv
COPY --from=ghcr.io/astral-sh/uv:0.8.0 /uv /uvx /bin/

# Since there's no point in shipping lock files, we move them
# into a directory that is NOT copied into the runtime image.
# The trailing slash makes COPY create `/_lock/` automagically.
COPY pyproject.toml uv.lock /_lock/

# Synchronize dependencies.
# This layer is cached until uv.lock or pyproject.toml change.
RUN --mount=type=cache,target=/root/.cache \
    cd /_lock && \
    uv sync \
    --frozen \
    --no-install-project

# Copy entrypoint.sh
COPY ./entrypoint.sh .
RUN sed -i "s/\r$//g" /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Copy entrypoint.sh
COPY . .

# Run entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]
