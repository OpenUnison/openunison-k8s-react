FROM ubuntu:22.04

RUN apt update;DEBIAN_FRONTEND=noninteractive apt install -y  nginx;apt -y upgrade;apt clean;rm -rf /var/lib/apt/lists/* \
    rm -rf /var/www/html/index.nginx-debian.html 
COPY build /var/www/html
COPY nginx.conf /etc/nginx
RUN chmod -R 755 /var/www

USER www-data


CMD ["/usr/sbin/nginx"]