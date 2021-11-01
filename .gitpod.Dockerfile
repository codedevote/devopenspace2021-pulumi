FROM gitpod/workspace-full:latest

# install pulumi
RUN curl -fsSL https://get.pulumi.com | sh -s

# add pulumi to PATH
ENV PATH "$PATH:/home/gitpod/.pulumi/bin"

# install azure cli
RUN curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash 

# install kubectl
RUN sudo apt-get update \ 
    && sudo apt-get install -y apt-transport-https ca-certificates curl \
    && sudo curl -fsSLo /usr/share/keyrings/kubernetes-archive-keyring.gpg https://packages.cloud.google.com/apt/doc/apt-key.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list \
    && sudo apt-get update \ 
    && sudo apt-get install -y kubectl

USER gitpod