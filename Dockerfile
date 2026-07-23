FROM php:8.1-apache

# mod_php exige mpm_prefork — evita "More than one MPM loaded"
RUN a2dismod mpm_event 2>/dev/null || true \
    && a2dismod mpm_worker 2>/dev/null || true \
    && a2enmod mpm_prefork \
    && apache2ctl -t

COPY . /var/www/html/

EXPOSE 80
CMD ["apache2-foreground"]
