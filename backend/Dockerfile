FROM mongo:latest

ENV MONGO_INITDB_ROOT_USERNAME=dbuser
ENV MONGO_INITDB_ROOT_PASSWORD=secretpassword

EXPOSE 27017

CMD ["mongod", "--auth"]
