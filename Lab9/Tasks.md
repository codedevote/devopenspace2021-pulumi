# Lab 9 - Property-Test für Lab8

## Überblick

In dieser Übung werden wir eine Policy erstellen, die uns das direkte Deployment eines Pods (wie wir es in Lab8 getan haben) verbietet. 


### Neues Projekt erstellen

1. Ein neues Pulumi Policy Projekt mit Namen `lab9` erstellen: `pulumi policy new kubernetes-typescript`
2. Da das Projekt-Template noch nicht den neuen `azure-native` Provider verwendet, aktualisieren wir die package.json selbst.

### Die "No-Pod" Policy

Das Projekttemplate erstellt eine index.ts mit folgendem Inhalt:

```ts
import * as k8s from "@pulumi/kubernetes";
import { PolicyPack, validateResourceOfType } from "@pulumi/policy";

new PolicyPack("kubernetes-typescript", {
    policies: [{
        name: "no-public-services",
        description: "Kubernetes Services should be cluster-private.",
        enforcementLevel: "mandatory",
        validateResource: validateResourceOfType(k8s.core.v1.Service, (svc, args, reportViolation) => {
            if (svc.spec && svc.spec.type === "LoadBalancer") {
                reportViolation("Kubernetes Services cannot be of type LoadBalancer, which are exposed to " +
                    "anything that can reach the Kubernetes cluster. This likely including the " +
                    "public Internet.");
            }
        }),
    }],
});
```

:muscle: Ändere den generierten Code so ab, dass verhindert wird, dass ein `Pod` erzeugt wird. 

### Die Policy in Aktion

Wechselt ins Verzeichnis von Lab8 und gebt beim Aufruf `pulumi preview` das Policy-Pack mit an:
```bash
pulumi preview --policy-pack ../Lab9
```
