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
    yarn install  && \
    yarn compile && \
    yarn lint

ARG BUILD_ID

RUN yum update -y && \

    yum upgrade -y && \

    yum autoremove -y && \

    yum clean all && \

    rm -rf /var/cache/yum

USER nobody
