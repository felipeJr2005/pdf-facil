FROM php:8.1-apache

COPY . /var/www/html/
COPY docker/start.sh /usr/local/bin/start.sh

RUN chmod +x /usr/local/bin/start.sh \
    && a2dismod mpm_event 2>/dev/null || true \
    && a2dismod mpm_worker 2>/dev/null || true \
    && a2enmod mpm_prefork

EXPOSE 80
CMD ["/usr/local/bin/start.sh"]
