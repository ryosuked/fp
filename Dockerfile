FROM node:12.18.0-alpine
ENV LANG C.UTF-8

RUN mkdir /myapp
WORKDIR /myapp

RUN npm install 

# Alias
RUN echo 'alias ll="ls -laG"' >> /root/.bashrc
RUN echo 'alias e="vim"' >> /root/.bashrc


