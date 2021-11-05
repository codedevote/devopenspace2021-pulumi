import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { QuickService } from "./quickservice";

const projectName = pulumi.getProject();
const stackName = pulumi.getStack();

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

const namespace = new k8s.core.v1.Namespace("lab11-ns", {

    metadata: {
        name: "lab11"
    }

}, opts);

const appLabels = { 
    app: projectName,
    env: stackName
};

const echoserver = new QuickService("echoserver", {

    image: "ealen/echo-server",
    labels: appLabels,
    name: "echoserver",
    namespace: namespace.metadata.name,
    port: 80,
    targetPort:80,
    replicaCount: 1

}, opts);

export const echoServerIp = echoserver.serviceIp;