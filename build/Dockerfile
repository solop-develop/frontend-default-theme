FROM node:12-alpine

LABEL maintainer="ySenih@erpya.com; EdwinBetanc0urt@outlook.com;" \
	description="ADempiere Vue Default Theme"


# Add system dependencies
RUN apk update && \
	apk upgrade musl && \
	apk add \
		--virtual .build-deps \
		ca-certificates \
		curl \
		g++ \
		git \
		make \
		python \
		wget \
		unzip


# App prerequisites
RUN
	# Enable https to install packages
	git config --global url."https://".insteadOf git:// && \
	# Create theme work dir
	mkdir -p /var/www/adv-default-theme/


# Init ENV with default values
ENV VS_ENV=prod \
	REPOSITORY_PATH="/var/www/adempiere-vue" \
	REPOSITORY_NAME="adv-default-theme" \
	REPOSITORY_BRANCH="experimental" \
	URL_BASE_REPOSITORY="https://github.com/solop-develop/frontend-core.git" \
	SERVER_PORT="9527" \
	SERVER_HOST="localhost" \
	API_URL="http:\/\/localhost:8085" \
	MEMORY_RESTART="1G" \
	EXEC_INSTANCES="1"


COPY dist-app/ /var/www/adv-default-theme/


RUN
	# Install npm packages
	yarn ci && \
	echo "Downloading... $URL_BASE_REPOSITORY to $REPOSITORY_PATH" && \
	git clone -b $REPOSITORY_BRANCH $URL_BASE_REPOSITORY $REPOSITORY_PATH && \
	cd $REPOSITORY_PATH && \
	git submodule add /var/www/adv-default-theme ./src/themes/default && \
	git submodule update --init ./src/themes/default && \
	# Install npm packages
	yarn ci && \
	yarn build:prod && \
	chmod -R 777 $REPOSITORY_PATH


# Copy Default files
COPY build/default.json $REPOSITORY_PATH/config/
COPY build/start.sh $REPOSITORY_PATH


WORKDIR $REPOSITORY_PATH


# Start app
CMD	'sh' 'start.sh'
