# Lab 7 - Kubernetes Cluster (AKS)

## Überblick

In dieser Übung werden wir einen Managed Kubernetes Cluster (AKS) in Azure deployen. Ziel der Übung ist es, dass wir einen funktionsfähigen AKS Cluster haben, auf den wir in den nächsten Übungen Workloads deployen können.

### Neues Projekt erstellen

1. Ein neues Pulumi Azure-Native Typescript Projektmit Namen `lab7` erstellen. Bei Auswahl der Azure-Region `WestEurope` verwenden.
2. Einen neuen Stack `dev` hinzufügen.

### Azure Resourcen

1. Definiert eine Resourcengruppe, deren Name aus Stack- und Projektname gebildet wird.
2. Definiert einen AKS Cluster, siehe nachfolgenden Code. 
3. Macht die `agentPoolProfiles.count` und `kubernetesVersion` konfigurierbar.
4. Verwendet die Funktion `listManagedClusterUserCredentials`, um die kubeConfig des erstellten Clusters abzurufen und exportiert diese als ein Secret.

```ts
const managedCluster = new ManagedCluster("managedCluster", {
    agentPoolProfiles: [{
        count: 1,
        name: "nodepool",
        osType: OSType.Linux,
        type: AgentPoolType.VirtualMachineScaleSets, 
        vmSize: VirtualMachineSizeTypes.Standard_D2s_v3,
        mode: AgentPoolMode.System,
    }],
    kubernetesVersion: "1.19.9",
    dnsPrefix: stackName,
    resourceGroupName: resourceGroup.name,
    resourceName: "akscluster",
    identity: {
        type: ResourceIdentityType.SystemAssigned
    }
});
```