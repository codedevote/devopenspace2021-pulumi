import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";
import * as container from "@pulumi/azure-native/containerservice";
import {VirtualMachineSizeTypes} from "@pulumi/azure-native/compute";
import { listManagedClusterUserCredentials } from "@pulumi/azure-native/containerservice";

const stackName = pulumi.getStack();
const projectName = pulumi.getProject();

const config = new pulumi.Config();
const nodeCount = config.requireNumber("nodeCount");
const kubernetesVersion = config.require("kubernetesVersion");

const resourceGroup = new resources.ResourceGroup(`${stackName}-${projectName}`);

const k8sCluster = new container.ManagedCluster("managedCluster", {
    agentPoolProfiles: [{
        count: nodeCount,
        name: "nodepool",
        osType: container.OSType.Linux,
        type: container.AgentPoolType.VirtualMachineScaleSets,
        vmSize: VirtualMachineSizeTypes.Standard_D2s_v3,
        mode: container.AgentPoolMode.System
    }],
    kubernetesVersion: kubernetesVersion,
    dnsPrefix: stackName,
    resourceGroupName: resourceGroup.name,
    resourceName: "akscluster",
    identity: {
        type: container.ResourceIdentityType.SystemAssigned
    }
});

const credentials = 
    pulumi
        .all([k8sCluster.name, resourceGroup.name])
        .apply(([clusterName, rgName]) => {
            return listManagedClusterUserCredentials({
                resourceGroupName: rgName,
                resourceName: clusterName
            })
});

const encoded = credentials.kubeconfigs[0].value;

export const kubeConfig = 
    pulumi.secret(encoded.apply(enc => Buffer.from(enc, "base64").toString() ));
