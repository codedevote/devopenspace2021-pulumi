# Lab 3 - Erstes Azure Deployment

## Überblick

In dieser Übung werden wir einen Storage Account in Azure deployen. Unser erstes Ziel ist es, eine lokal verfügbare Bilddatei als Blob in Azure BlobStorage zur Verfügung zu stellen. Das zweite Ziel ist es, eine lokal verfügbare HTML Datei als statische Website in Azure Blobstorage zu deployen.


### Neues Projekt erstellen

1. Ein neues Pulumi Azure-Native Typescript Projekt mit Namen `lab3` erstellen. Bei Auswahl der Azure-Region `WestEurope`verwenden.
2. Einen neuen Stack `dev` hinzufügen.
3. Im Terminal überprüfen, dass die azure-cli verfügbar ist: `az version`
4. Führe `az login` aus und melde Dich mit Deinem Azure Account an. Solltest Du mehrere Subscriptions haben, kannst Du mit `az account list` alle anzeigen lassen und mit `az account set -s <subscriptionId>` auswählen.

### Bilddatei in Azure Blobstorage zur Verfügung stellen

Dem Projektverzeichnis eine beliebige Bilddatei hinzufügen, z.B. den [Pulumipus](https://www.pulumi.com/logos/brand/pulumipus-8bit.svg).

Imports hinzufügen und Projekt- und Stackname abfragen:
```ts
import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";
import { enums } from "@pulumi/azure-native/types";

const stackName = ...;
const projectName = ...;
```

Eine Azure [ResourceGroup](https://www.pulumi.com/docs/reference/pkg/azure-native/resources/resourcegroup/) erstellen.

```ts
const resourceGroup = new azure.resources.ResourceGroup(`${stackName}-${projectName}`);
```

StorageAccount, BlobContainer und Bild-Blob in dieser ResourceGroup erstellen ([Azure BlobStorage](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction)).

```ts
const storageAccount = new azure.storage.StorageAccount("storage", {
    kind: azure.storage.Kind.StorageV2, 
    resourceGroupName: ..., 
    sku: {
        name: azure.storage.SkuName.Standard_LRS
    }, 
    allowBlobPublicAccess: ...
});

const storageContainer = new azure.storage.BlobContainer("images", {
    containerName: ... // ContainerName soll {storageAccountName}-images sein
    accountName: ...,
    publicAccess: enums.storage.PublicAccess.Container, 
    resourceGroupName: ...
});

const myImage = new azure.storage.Blob("pulumipus", {
    ... // Tip: Für die source könnt Ihr ein pulumi.asset.FileAsset verwenden
});
```

Die Url des Bild-Blobs wird als Output exportiert.

```ts
export const imageUrl =  myImage.url;
```

:muscle: **Weitere Aufgaben**
    1. Führe `pulumi up` aus und überprüfe, dass unter der ausgegebenen Url das Bild abrufbar ist.
    2. Überprüfe außerdem im Azure-Portal, welche Resourcen erzeugt wurden und wie deren Namen lauten.
    3. Füge dem Projekt ein weiteres Bild hinzu, ändere das FileAsset im Pulumi-Programm ab, und stelle das neue Bild als Blob zur Verfügung.

### Statische Website via BlobStorage zur Verfügung stellen

Als nächstes stellen wir eine HTML-Datei (via FileAsset wie das Bild zuvor) als statische Website in Azure BlobStorage zur Verfügung und exportieren die Url der neu deployten Website als Output unseres Pulumi Programms. Verwendet einfach dieses simple HTML und fügt es in eine `index.html` ins Projektverzeichnis ein.

```html
<!DOCTYPE html>
<html>

<head>
    <title>Pulumi Workshop Static Website</title>
    <meta charset="utf-8">
</head>

<body>
    <h1>Static website deployed with pulumi!</h1>
</body>

</html>
```

Pulumi stellt m.E. recht umfangreiche Doku zur Verfügung, hier z.B. zur [StorageAccountStaticWebsite](https://www.pulumi.com/docs/reference/pkg/azure-native/storage/storageaccountstaticwebsite/). Diese gibt einem nochmal einen guten Überblick über einzelne Resourcen, wenn das Intellisense in VS Code nicht ausreichend ist.

```ts
const websiteIndex = new azure.storage.Blob(...

const staticWebsite = new azure.storage.StorageAccountStaticWebsite(...

export const websiteUrl = ...;
```
:muscle: **Aufgaben**
    1. Vervollständige das Codegerüst und erzeuge einen Blob mit der zuvor erstellten `index.html`.
    2. Erstelle - auch unter Zuhilfenahme der Doku - die `StorageAccountStaticWebsite` Resource und exportiere die Url der Website als Output.
    3. Führe `pulumi up` aus und überprüfe, dass unter der ausgegebenen Url die Website abrufbar ist.
