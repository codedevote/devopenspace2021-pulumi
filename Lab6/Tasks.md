# Lab 6 - Property Test für Lab 5

## Überblick

In dieser Übung werden wir einen Property Test für Lab5 schreiben. Ein Property-Test (oder auch Policy-as-Code) befähigt uns, Tests zu schreiben, die **während** einem Deployment ausgeführt werden. Falls man sich einen Pulumi-Enterprise Account leisten möchte, kann man solche Policies auch über die gesamte Organisation hin erzwingen. Diese Art von Tests ermöglicht uns, Richtlinien zu erzwingen. So z.B. "die 'größte' erlaubte VM hat 16 CPUs und 128 GB RAM". Oder "ein Container in ACI darf keine PublicIP verwenden". Letzteres soll Ziel dieser Übung sein.

### Neues Projekt erstellen

1. Ein neues Pulumi Policy Projekt mit Namen `lab6` erstellen: `pulumi policy new azure-typescript`
2. Da das Projekt-Template noch nicht den neuen `azure-native` Provider verwendet, aktualisieren wir die package.json selbst.

### Die "No-Public-IP" Policy

Das Projekttemplate erstellt eine index.ts mit folgendem Inhalt:

```ts
import * as azure from "@pulumi/azure";
import { PolicyPack, validateResourceOfType } from "@pulumi/policy";

new PolicyPack("azure-typescript", {
    policies: [{
        name: "storage-container-no-public-read",
        description: "Prohibits setting the public permission on Azure Storage Blob Containers.",
        enforcementLevel: "mandatory",
        validateResource: validateResourceOfType(azure.storage.Container, (container, args, reportViolation) => {
            if (container.containerAccessType === "blob" || container.containerAccessType === "container") {
                reportViolation(
                    "Azure Storage Container must not have blob or container access set. " +
                    "Read more about read access here: " +
                    "https://docs.microsoft.com/en-us/azure/storage/blobs/storage-manage-access-to-resources");
            }
        }),
    }],
});
```

:muscle: Benutze den `azure-native` Provider und ändere den generierten Code so ab, dass verhindert wird, dass eine `ContainerGroup` eine PublicIp hat. 

### Die Policy in Aktion

Wechselt ins Verzeichnis von Lab5 und gebt beim Aufruf `pulumi preview` das Policy-Pack mit an:
```bash
pulumi preview --policy-pack ../Lab6
```
