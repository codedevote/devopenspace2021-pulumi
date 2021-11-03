# Lab 11 - ComponentResource für Kubernetes Deployment & Service

## Überblick

In dieser Übung werden wir eine Pulumi ComponentResource erstellen, die uns ein Kubernetes Deployment zusammen mit einem Service kapselt und als neue Resource in unserem Pulumi Programm zur Verfügung stehen wird. Ziel dieser Übung ist es, das Deployment und den Service aus Lab10 komfortabler nutzen zu können:

```ts
const echoServer = new QuickService("echoserver", {
    image: "ealen/echo-server",
    labels: appLabels,
    name: "echoserver",
    namespace: namespace.metadata.name,
    port: 80,
    targetPort: 80, 
    replicaCount: 1
}, opts);
```

Das Beispiel soll zeigen, dass man durch Verwendung einer ordentlichen Programmiersprache in der Lage ist, sich selbst Infrastruktur-Bibliotheken aufzubauen. 

### Neues Projekt erstellen

1. Ein neues Pulumi Projekt mit Namen `lab11` erstellen: `pulumi new kubernetes-typescript`
2. Eine neue Datei `quickservice.ts` im Projektverzeichnis erstellen.

### Die ResourceArgs unserer Komponente

Da jede Pulumi Resource demsleben Muster folgt, greifen wir dieses hier natürlich ebenfalls auf. Wir definieren hierzu ein `interface` namens `QuickServiceArgs` und fügen alle gewünschten Parameter hinzu:

```ts
export interface QuickServiceArgs {
    labels: pulumi.Input<{ [key: string]: pulumi.Input<string>; }>;
    namespace: ...;
    name: ...;
    image: ...;
    port: ...,
    targetPort: ...,
    replicaCount: ...;
};
```

:muscle: Versucht, die notwendigen Typen zu ergänzen, in dem Ihr die Deployment und Service Resourcen, die wir in Lab10 verwendet haben, genauer untersucht.

### QuickService ComponentResource

Unser `QuickService` erweitert eine `pulumi.ComponentResource`. Die Outputs einer Komponente werden als Property angegeben und müssen zum Schluss mit einem Aufruf `this.registerOutputs()` registriert werden. Wir verwenden die übergebenen `pulumi.ComponentResourceOptions` und erstellen daraus eine neue Version, die zusätzlich die `parent` Property auf `this` (also die QuickService Komponente) setzt. Das führt dazu, dass die im weiteren Verlauf erzeugten Resourcen als Kindresourcen unserer Komponente gesehen werden. 

```ts
export class QuickService extends pulumi.ComponentResource {

    public serviceIp: pulumi.Output<string>;    // Ein Output unserer Komponente

    constructor(name: string,
        args: QuickServiceArgs,
        opts: pulumi.ComponentResourceOptions = {}) {

        super("spartakiade:codedevote:QuickService", name, args, opts);

        const parentOpts = { parent: this, ...opts };

        const deployment = new k8s.apps.v1.Deployment(..., {
            ...
        }, parentOpts);
        
        const service = new k8s.core.v1.Service(..., {
            ...
        }, parentOpts);
        
        this.serviceIp = ...;

        // erforderlicher Aufruf am Ende, um die definierten Outputs der Komponente zu registrieren
        this.registerOutputs();     
    }
}
```

:muscle: Fülle die Lücken im Code aus.

### Die Komponente in Aktion

Vervollständige nun das Pulumi Programm und nutze den `QuickService`.
