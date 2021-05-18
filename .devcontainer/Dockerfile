# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.140.1/containers/typescript-node/.devcontainer/base.Dockerfile

ARG VARIANT="14"

FROM io.iad2.cloud/devtools/ts-node-docker:${VARIANT}

RUN curl -L -o opa "https://openpolicyagent.org/downloads/latest/opa_linux_amd64" && chmod 755 ./opa && mv ./opa  /usr/local/bin/opa

WORKDIR /workspace

# [Optional] Uncomment this section to install additional OS packages.
#RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#    && apt-get -y install --no-install-recommends git-lfs
#RUN curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
# [Optional] Uncomment if you want to install an additional version of node using nvm
ARG EXTRA_NODE_VERSION=14
RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node packages
RUN sudo -u node npm install -g npm
