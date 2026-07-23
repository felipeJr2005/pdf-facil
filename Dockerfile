FROM php:8.1-apache

COPY . /var/www/html/

RUN a2dismod mpm_event 2>/dev/null || true \
    && a2dismod mpm_worker 2>/dev/null || true \
    && a2enmod mpm_prefork \
    && (grep -q '^ServerName ' /etc/apache2/apache2.conf || echo 'ServerName localhost' >> /etc/apache2/apache2.conf) \
    && printf 'Listen 80\n' > /etc/apache2/ports.conf \
    && sed -ri 's/<VirtualHost \*:[0-9]+>/<VirtualHost *:80>/g' /etc/apache2/sites-available/000-default.conf

# Target port do serviço = 80. Ignora $PORT do ambiente para não divergir do proxy.
CMD ["bash", "-lc", "a2dismod mpm_event mpm_worker 2>/dev/null || true; rm -f /etc/apache2/mods-enabled/mpm_event.* /etc/apache2/mods-enabled/mpm_worker.*; a2enmod mpm_prefork; printf 'Listen 80\\n' > /etc/apache2/ports.conf; sed -ri 's/<VirtualHost \\*:[0-9]+>/<VirtualHost *:80>/g' /etc/apache2/sites-available/000-default.conf; echo Starting Apache on port 80; apache2ctl -S; exec apache2-foreground"]
