FROM node:12

COPY src /opt/app/

WORKDIR /opt/app/
RUN npm install

EXPOSE 2205

CMD ["node", "/opt/app/auditor.js"]
