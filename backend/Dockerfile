FROM php:8.2-fpm-alpine  
RUN docker-php-ext-install pdo pdo_mysql 
RUN curl -sS https://getcomposer.org/installer | php -- \ --install-dir=/usr/local/bin --filename=composer  
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
EXPOSE 8000
WORKDIR /app 
COPY . . 
RUN composer install 
RUN composer update
RUN chmod +x /app/start.sh
CMD ["/app/start.sh"]