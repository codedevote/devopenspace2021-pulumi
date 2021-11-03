# Lab 8 - Den ersten Pod deployen

## Überblick

In dieser Übung werden wir unseren ersten Pod in unseren zuvor erstellten Managed Kubernetes Cluster (AKS) in Azure deployen. Ziel der Übung ist es, dass wir einen **nginx** Container in unseren AKS Cluster deployen. Da wir uns in dieser Übung keinerlei Gedanken um eine public-facing IP für unseren Pod machen, werden wir mit kubectl ein Port-Forwarding konfigurieren, um auf unseren Pod zuzugreifen.

### Neues Projekt erstellen

1. Ein neues Pulumi Kubernetes Typescript Projekt mit Namen `lab8` erstellen.
2. Einen neuen Stack `dev` hinzufügen.

### StackReference zu Lab7

Da wir unseren Cluster mit einem anderen Pulumi Programm (Lab7) deployed haben, müssen wir den Stack im anderen Projekt referenzieren, um die `kubeConfig` abzufragen. Diese brauchen wir, um den Pulumi Kubernetes Provider zu konfigurieren, so dass die Kubernetes Resourcen, die wir erzeugen, auch im richtigen Cluster landen.

```ts
var stackName = pulumi.getStack();

var lab7Ref = new pulumi.StackReference("lab7reference", {
    name: `codedevote/Lab7/${stackName}`
});

var kubeConfig = lab7Ref.requireOutput("kubeConfig");
```

Als nächstes erzeugen wir einen Kubernetes Provider mit der gerade abgefragten `kubeConfig` und verpacken das in Pulumi `CustomResourceOptions`. Das ist etwas einfacher und prägnanter, statt diese Optionen bei jeder Resource neu zu erzeugen. Wir sehen das gleich im weiteren Verlauf.

```ts
const k8sProvider = new k8s.Provider("aksprovider", {
    kubeconfig: kubeConfig
});

const opts: pulumi.CustomResourceOptions = {
    provider: k8sProvider
};
```

Die erste Kubenertes Resource, die wir erzeugen, ist ein Namespace:
```ts
const namespace = new k8s.core.v1.Namespace("lab8-ns", {
    metadata: {
        name: "lab8"
    }
}, opts);
```

:muscle: Als nächstes erzeugt Ihr einen [Pod](https://www.pulumi.com/docs/reference/pkg/kubernetes/core/v1/pod/):
```ts 
const pod = new k8s.core.v1.Pod...
```

:muscle: Nach Aufruf von `pulumi up` steht der Pod im Cluster zur Verfügung.

### Verbindung zum Pod via kubectl port-forward

Wir verwenden die Portforwarding Funktion von kubectl, um einen Tunnel zu unserem eben erstellten Pod herzustellen. Der Podname und Namespace könnten bei Euch variieren:

```bash
# Namen des Pods raussuchen:
kubectl get pods --namespace lab8

# Tunnel zum Pod herstellen
kubectl port-forward pod/firstpod :80 --namespace lab8
```