# Lab 10 - Kubernetes Deployment & Service

## Überblick

In dieser Übung werden wir ein Kubernetes Deployment und einen Service erstellen und damit den Pod ablösen, den wir in einer vorherigen Übung erstellt haben.

### Neues Projekt erstellen

1. Ein neues Pulumi Projekt mit Namen `lab10` erstellen: `pulumi new kubernetes-typescript`

### Pulumi & Kubernetes YAML

Die Nutzung von Kubernets Resourcen in Pulumi unterscheidet sich eigentlich nur in der verwendeten Sprache vom 'herkömmlichen' Definieren von Kubernets Resourcen in YAML. Es gibt auch ein Tool names [kube2pulumi](https://www.pulumi.com/kube2pulumi/), mit dem vorhandenes YAML in ein Pulumi Programm übersetzt werden kann.

### Aufgaben

1. KubeConfig aus Lab7 benutzen und KubernetesProvider erstellen.
2. Kubernetes Namespace `lab10` erstellen.
3. Deployment und Service erstellen. Siehe nachfolgendes Codegerüst.

```ts
const appLabels = { 
    // key: value
    ...
};

const deployment = new k8s.apps.v1.Deployment("echoserver", {
    metadata: {
        namespace: ...
    },
    spec: {
        selector: { 
            matchLabels: appLabels 
        },
        replicas: 1,
        template: {
            metadata: { 
                labels: appLabels 
            },
            spec: { 
                // echoserver container image nutzen
                ...
            }
        }
    }
}, opts);

const service = new k8s.core.v1.Service("echoserver", {
    metadata: {
        namespace: ...
    },
    spec: {
        selector: appLabels,
        ports: [{
            // tcp Port 80 auf Containerport 80
            ...
        }],
        type: k8s.core.v1.ServiceSpecType.LoadBalancer  // wir verzichten im Beispiel auf einen Ingress Controller und verwenden direkt einen Loadbalancer für den Service
    }
}, opts);

export const echoServerIp = ... // Tip: Lässt sich über den Status des Kubernetes Service abfragen.
```

:muscle: Führe `pulumi up` aus und prüfe, ob der Service unter `choServerIp` erreichbar ist.
