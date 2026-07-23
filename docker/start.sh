#!/bin/bash
set -e

# Railway pode injetar mpm_event no start â†’ conflito com mpm_prefork (mod_php)
a2dismod mpm_event 2>/dev/null || true
a2dismod mpm_worker 2>/dev/null || true
rm -f /etc/apache2/mods-enabled/mpm_event.load /etc/apache2/mods-enabled/mpm_event.conf 2>/dev/null || true
rm -f /etc/apache2/mods-enabled/mpm_worker.load /etc/apache2/mods-enabled/mpm_worker.conf 2>/dev/null || true
a2enmod mpm_prefork

PORT="${PORT:-80}"
sed -i "s/Listen 80/Listen ${PORT}/" /etc/apache2/ports.conf || true
sed -i "s/:80/:${PORT}/g" /etc/apache2/sites-available/000-default.conf || true

exec apache2-foreground
