# Lab 5 - Docker Container in ACI

## Überblick

In dieser Übung werden wir einen Docker Container nach [Azure Container Instances](https://docs.microsoft.com/en-us/azure/container-instances/container-instances-overview) (ACI) deployen. ACI ist eine gute Option, um Container-Workloads schnell in der Cloud bereitzustellen. 

### Neues Projekt erstellen

1. Ein neues Pulumi Azure-Native Typescript Projektmit Namen `lab5` erstellen. Bei Auswahl der Azure-Region wie bisher `WestEurope` verwenden.
2. Einen neuen Stack `dev` hinzufügen.

### Docker Container in ACI starten

1. Zuerst eine ResourceGroup analog Lab3 erstellen.
2. ACI kennt auf oberster Ebene nur eine ContainerGroup, also potentiell mehr als einen Container (man kann es sich vage als ein docker-compose in der Cloud vorstellen). Deshalb erstellen wir eine `azure.containerinstance.ContainerGroup`.
3. Als Startpunkt könnt Ihr neben der [Doku](https://www.pulumi.com/docs/reference/pkg/azure-native/containerinstance/containergroup/) auch das folgende Gerüst verwenden, und dabei folgende Anforderungen berücksichtigen:
a. Die Container-Group soll natürlich Teil unserer zuvor erstellten ResourceGroup sein.
b. Wir wollen das Docker-Image [ealen/echo-server](https://hub.docker.com/r/ealen/echo-server) deployen.
c. Im ersten Schritt ist nur wichtig, den Container zu deployen. Um die Konnektivität mit dem Container kümmern wir uns später.

```ts
const containerGroup = new azure.containerinstance.ContainerGroup("???", {
    containerGroupName: "???",
    containers: [{
        command: [],
        environmentVariables: [],
        image: "???",
        name: "???",
    }],
    osType: "Linux",    // den String hier mit einem Enum ersetzen
    resourceGroupName: ???
});
```

### Eine Public IP für unseren Container

Der zuvor gestartete Container ist nicht über das Internet erreichbar. Deshalb definieren wir für den Container selbst einen Port 80 und für die `ContainerGroup` eine `ipAddress`:


```ts
const containerGroup = new azure.containerinstance.ContainerGroup("???", {
    containerGroupName: "???",
    containers: [{
        command: [],
        environmentVariables: [],
        image: "???",
        name: "???",
        ports: [{
            port: 80, 
        }],
    }],
    ipAddress: {
        type: azure.containerinstance.ContainerGroupIpAddressType.Public, 
        ports: [
            {
                port: 80, 
                protocol: azure.containerinstance.ContainerGroupNetworkProtocol.TCP,
            }
        ]
    },
    osType: "Linux",    // den String hier mit einem Enum ersetzen
    resourceGroupName: ???
});
```

Zu guter Letzt fragen wir die IP Adresse der ContainerGroup ab und exportieren diese als Output:
```ts
const containerGroupInfo = pulumi.all([containerGroup.name, resourceGroup.name]).apply(([cgn, rgn]) => 
    azure.containerinstance.getContainerGroup({
        containerGroupName: cgn, 
        resourceGroupName: rgn
    }
));

export const containerPublicIp = containerGroupInfo.ipAddress?.apply(x => x?.ip);
```

Nach Ausführung von `pulumi up` können wir unter der `containerPublicIp` unseren Echo-Server erreichen. 