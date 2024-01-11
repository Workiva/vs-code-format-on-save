FROM amazonlinux:2

WORKDIR /usr/src/extension

COPY . .

RUN yum install -y \
    gzip \
    tar

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash && \
    . ~/.nvm/nvm.sh && \
    nvm install 17 && \
    npm install yarn -g && \
    yarn install