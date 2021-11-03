# Lab 12 - Helm Charts

## Überblick

In dieser Übung werden wir eine Wordpress Instanz via Helm Chart deployen. Helm ist recht populär und man findet viele Workloads als Helm Charts. Die Verwendung in Pulumi Programmen ist recht einfach und hat den Vorteil, dass wiederum Outputs anderer Resourcen wieder direkt als Inputs in den Helm Chart einfließen können.

### Neues Projekt erstellen

1. Ein neues Pulumi Projekt mit Namen `lab12` erstellen: `pulumi new kubernetes-typescript`
2. Das npm Paket `@pulumi/random` hinzufügen

### Aufgaben

1. KubeConfig aus Lab7 benutzen und KubernetesProvider erstellen.
2. Kubernetes Namespace `lab12` erstellen.
3. Ein `RandomPassword` erstellen, das initial für den Wordpress Admin User gesetzt wird.
4. Helm-Chart erstellen. Siehe nachfolgendes Codegerüst.

```ts

const wordpress = password.result.apply(pw => new k8s.helm.v3.Chart("wp", {
    version: "11.0.9",
    namespace: namespace.metadata.name,
    chart: "wordpress",
    fetchOpts: {
        repo: "https://charts.bitnami.com/bitnami",
    },
    values: {
        wordpressUsername: "rooty",
        wordpressPassword: ... // das zuvor erzeugte Random Password
    }
}));

const frontend = wordpress.apply(x => x.getResourceProperty("v1/Service", "lab12", "wp-wordpress", "status"));
const ingress = frontend.loadBalancer.ingress[0];

export const frontendIp = ... // ingress IP als Output
export const wpUser = ... // als normalen Output!
export const wpPassword = ... // als pulumi Secret !
```

:muscle: Führe `pulumi up` aus und prüfe, ob unter `frontendIp` eine Wordpress Instanz erreichbar ist. Logge dich ins Admin Menü ein.
