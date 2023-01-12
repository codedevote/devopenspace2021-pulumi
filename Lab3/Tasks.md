# Lab 3 - Erstes Azure Deployment

## Überblick

In dieser Übung werden wir einen Storage Account in Azure deployen. Unser Ziel ist es, eine lokal verfügbare HTML Datei als Blob in Azure Blobstorage zu deployen.


### Neues Projekt erstellen

1. Ein neues Pulumi Azure-Native Typescript Projekt mit Namen `lab3` erstellen. Bei Auswahl der Azure-Region `WestEurope`verwenden.
2. Einen neuen Stack `dev` hinzufügen.
3. Im Terminal überprüfen, dass die azure-cli verfügbar ist: `az version`
4. Führe `az login` aus und melde Dich mit Deinem Azure Account an. Solltest Du mehrere Subscriptions haben, kannst Du mit `az account list` alle anzeigen lassen und mit `az account set -s <subscriptionId>` auswählen.

### Statische Website via BlobStorage zur Verfügung stellen

Wir wollen eine HTML-Datei als statische Website in Azure BlobStorage zur Verfügung stellen und die Url der neu deployten Website als Output unseres Pulumi Programms exportieren. Verwendet einfach dieses simple HTML Snippet und fügt es in eine `index.html` ins Projektverzeichnis ein.

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

StorageAccount, BlobContainer und HTML-Blob in dieser ResourceGroup erstellen ([Azure BlobStorage](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction)).

```ts
const storageAccount = new azure.storage.StorageAccount("storage", {
    kind: azure.storage.Kind.StorageV2, 
    resourceGroupName: ..., 
    sku: {
        name: azure.storage.SkuName.Standard_LRS
    }, 
    allowBlobPublicAccess: ...
});

const storageContainer = new azure.storage.BlobContainer("content", {
    containerName: ... // ContainerName soll {storageAccountName}-content sein
    accountName: ...,
    publicAccess: enums.storage.PublicAccess.Container, 
    resourceGroupName: ...
});

const myImage = new azure.storage.Blob("pulumipus", {
    ... // Tip: Für die source könnt Ihr ein pulumi.asset.FileAsset verwenden
});
```

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

const website = new azure.storage.Blob("website", {
    ... // Tip: Für die source könnt Ihr ein pulumi.asset.FileAsset verwenden
});
```

Die Url des HTML-Blobs wird als Output exportiert.

```ts
export const websiteUrl =  website.url;
```

:muscle: **Aufgaben**
    1. Vervollständige das Codegerüst und erzeuge einen Blob mit der zuvor erstellten `index.html`.
    2. Führe `pulumi up` aus und überprüfe, dass unter der ausgegebenen Url das HTML abrufbar ist.
    2. Überprüfe außerdem im Azure-Portal, welche Resourcen erzeugt wurden und wie deren Namen lauten.
    3. Ändere die HTML Datei und deploye ein Update.
