FROM php:8.1-apache

COPY . /var/www/html/

RUN a2dismod mpm_event 2>/dev/null || true \
    && a2dismod mpm_worker 2>/dev/null || true \
    && a2enmod mpm_prefork \
    && (grep -q '^ServerName ' /etc/apache2/apache2.conf || echo 'ServerName localhost' >> /etc/apache2/apache2.conf)

# Railway deste serviço usa Target port 80 — não forçar 8080
CMD ["bash", "-lc", "a2dismod mpm_event mpm_worker 2>/dev/null || true; rm -f /etc/apache2/mods-enabled/mpm_event.* /etc/apache2/mods-enabled/mpm_worker.*; a2enmod mpm_prefork; PORT=${PORT:-80}; printf 'Listen %s\\n' \"$PORT\" > /etc/apache2/ports.conf; sed -ri \"s/<VirtualHost \\*:[0-9]+>/<VirtualHost *:${PORT}>/g\" /etc/apache2/sites-available/000-default.conf; echo Starting Apache on PORT=$PORT; apache2ctl -t; exec apache2-foreground"]
