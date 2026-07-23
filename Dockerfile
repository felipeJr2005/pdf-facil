FROM php:8.1-apache

COPY . /var/www/html/

RUN chown -R www-data:www-data /var/www/html/ \
    && find /var/www/html/ -type d -exec chmod 755 {} \; \
    && find /var/www/html/ -type f -exec chmod 644 {} \; \
    && mkdir -p /var/www/html/investimento/data/ \
    && chmod 777 /var/www/html/investimento/data/

EXPOSE 80
CMD ["apache2-foreground"]
