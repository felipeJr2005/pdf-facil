#!/bin/bash
set -e

PORT="${PORT:-80}"

sed -i "s/Listen 80/Listen ${PORT}/" /etc/apache2/ports.conf || true
sed -i "s/:80/:${PORT}/g" /etc/apache2/sites-available/000-default.conf || true

exec apache2-foreground