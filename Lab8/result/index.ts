import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

var stackName = pulumi.getStack();

var lab7Ref = new pulumi.StackReference("lab7reference", {
    name: `codedevote/lab7/${stackName}`
});

var kubeConfig = lab7Ref.getOutput("kubeConfig");

var k8sProvider = new k8s.Provider("aksProvider", {
    kubeconfig: kubeConfig
});

const opts: pulumi.ComponentResourceOptions = {
     provider: k8sProvider 
};

const namespace = new k8s.core.v1.Namespace("lab8-namespace", {
    metadata: {
        name: "lab8"
    }
}, opts);

const pod = new k8s.core.v1.Pod("firstpod", {
    metadata: {
        name: "firstpod",
        namespace: namespace.metadata.name
    },
    spec: {
        containers: [{
            name: "nginx",
            image: "nginx"
        }]
    }
}, opts);