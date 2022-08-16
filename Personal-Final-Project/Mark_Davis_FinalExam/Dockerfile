# ------------------------------------------------------------------------------
# Multi-Stage Node Build.
# This Dockerfile is meant for production builds, but can also be used for dev
# ------------------------------------------------------------------------------
# ------------------------------------------------------------------------------
# pin images for reproducability
# ------------------------------------------------------------------------------

FROM node@sha256:0ae1a6a3a8a61e2bcf7f826b2562eb865f9a3095acf41bc6f184773ab66f3007 AS base
WORKDIR /app

# ------------------------------------------------------------------------------
# Setup prod dependencies first.
# ------------------------------------------------------------------------------

FROM base AS prod_dependencies
COPY package*.json ./
RUN npm install --production --silent

# ------------------------------------------------------------------------------
# Install remaining dev dependencies.
# ------------------------------------------------------------------------------

FROM prod_dependencies AS dev_dependencies
RUN npm install

# ------------------------------------------------------------------------------
# Setup tests
# ------------------------------------------------------------------------------

FROM base as test
RUN npm install mocha
COPY . .
CMD ["npm","run","testandrun","--verbose"]

# ------------------------------------------------------------------------------
# Setup dev target.
# ------------------------------------------------------------------------------

FROM dev_dependencies AS devapp
RUN mkdir /app/src
# USER node
WORKDIR /app
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ------------------------------------------------------------------------------
# Setup production target (/prodapp)
# ------------------------------------------------------------------------------

FROM node:12-alpine AS prodapp

# Create prodapp directory
WORKDIR /prodapp
COPY --from=prod_dependencies /app ./
COPY src /prodapp/src

# ------------------------------------------------------------------------------
# Run node as non-root user for production.
# run as non-root user
# ------------------------------------------------------------------------------

# USER node
WORKDIR /prodapp
EXPOSE 3000
ENV \
  NODE_ENV='production'

CMD ["npm", "start"]


# FROM dev_dependencies as test
# RUN npm ci
# COPY . .
# CMD [ "npm", "run", "testandrun" ]

# FROM devapp as test
# RUN npm ci
# COPY . .
# RUN npm run test

# FROM dev_dependencies AS test
# RUN mkdir /app/src
# USER node
# WORKDIR /app
# EXPOSE 3000
# CMD ["npm", "run", "test"]

# FROM dev_dependencies AS test
# ADD . /
# USER node
# WORKDIR /app/test
# EXPOSE 3000
# CMD [ "npm", "run", "test" ]

# FROM base as test
# RUN npm install mocha --save-dev
# COPY . .
# CMD ["npm", "start", "&&", "npm", "test"]

# FROM base as test
# RUN npm ci
# COPY . .
# RUN npm run test

