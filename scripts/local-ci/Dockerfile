# Linux environment for the ubuntu-latest legs of .github/workflows, run by scripts/local-ci/run.js
FROM node:24-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      ca-certificates curl git jq make procps \
      xvfb xauth dbus dbus-x11 xdotool x11-utils \
      imagemagick libmagickcore-6.q16-6-extra \
      libfuse2 libgtk2.0-0 libgtk-3-0 libgbm1 libnotify4 libnss3 libxss1 libasound2 \
      libxtst6 libsecret-1-0 libatspi2.0-0 xdg-utils fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

# Named cache volumes inherit this ownership when Docker first populates them.
RUN mkdir -p /work /home/node/.cache /home/node/.npm \
    && chown -R node:node /work /home/node

USER node
ENV PATH="/home/node/.local/bin:${PATH}" \
    UV_PYTHON=3.12 \
    UV_PYTHON_PREFERENCE=only-managed \
    UV_LINK_MODE=copy \
    CI=true
RUN uv python install 3.12 \
    && uv tool install pylint
WORKDIR /work
