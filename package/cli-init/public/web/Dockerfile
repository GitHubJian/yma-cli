FROM nginx:1.23.2-alpine
WORKDIR /home/work

COPY output/dist/ /home/work/web
COPY output/nginx.conf /etc/nginx/nginx.conf

RUN mkdir /home/work/logs
ENTRYPOINT cd /\
    && sed -i "s|\${HOST_WEB_API}|${HOST_WEB_API}|g" /etc/nginx/nginx.conf\
    && sh docker-entrypoint.sh nginx -g "daemon off;"