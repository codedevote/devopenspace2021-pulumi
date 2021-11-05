import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";

const config = new pulumi.Config();
const imageName = config.require("imageName");

const image = new docker.RemoteImage("nginx", {
    name: imageName
});

for(let i = 0; i < 5; i++) {
    const container = new docker.Container(`nginx-container-${i}`, {
        image: image.name,
        ports: [{
            internal: 80,
            external: 8080 + i
        }]
    });
}


// export const containerName = container.name;