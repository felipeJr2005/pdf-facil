#!/bin/bash
set -e

a2dismod mpm_event 2>/dev/null || true
a2dismod mpm_worker 2>/dev/null || true
rm -f /etc/apache2/mods-enabled/mpm_event.load /etc/apache2/mods-enabled/mpm_event.conf 2>/dev/null || true
rm -f /etc/apache2/mods-enabled/mpm_worker.load /etc/apache2/mods-enabled/mpm_worker.conf 2>/dev/null || true
a2enmod mpm_prefork >/dev/null 2>&1 || true

# Alinhado ao Target port 80 do Railway deste serviço
PORT="${PORT:-80}"
printf 'Listen %s\n' "$PORT" > /etc/apache2/ports.conf
sed -ri "s/<VirtualHost \*:[0-9]+>/<VirtualHost *:${PORT}>/g" /etc/apache2/sites-available/000-default.conf || true
grep -q '^ServerName ' /etc/apache2/apache2.conf || echo 'ServerName localhost' >> /etc/apache2/apache2.conf

echo "Starting Apache on PORT=${PORT}"
apache2ctl -t
exec apache2-foreground
