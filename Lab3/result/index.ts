import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";
import * as storage from "@pulumi/azure-native/storage";

const stackName = pulumi.getStack();
const projectName = pulumi.getProject();

// Create an Azure Resource Group
const resourceGroup = new resources.ResourceGroup(`${stackName}-${projectName}`);

// Create an Azure resource (Storage Account)
const storageAccount = new storage.StorageAccount("sa", {
    resourceGroupName: resourceGroup.name,
    sku: {
        name: storage.SkuName.Standard_LRS,
    },
    kind: storage.Kind.StorageV2,
    allowBlobPublicAccess: true
});

const container = new storage.BlobContainer("images" ,{
    resourceGroupName: resourceGroup.name,
    accountName: storageAccount.name,
    publicAccess: storage.PublicAccess.Container,
    containerName: pulumi.interpolate `${storageAccount.name}-images`
});

const imageBlob = new storage.Blob("pulumipus", {
    resourceGroupName: resourceGroup.name,
    accountName: storageAccount.name,
    containerName: container.name,
    type: storage.BlobType.Block,
    blobName: "pulumipus.svg",
    contentType: "image/svg+xml",
    source: new pulumi.asset.FileAsset("pulumipus.svg")
});

const htmlBlob = new storage.Blob("staticsite", {
    resourceGroupName: resourceGroup.name,
    accountName: storageAccount.name,
    containerName: container.name,
    type: storage.BlobType.Block,
    blobName: "index.html",
    contentType: "text/html",
    source: new pulumi.asset.FileAsset("index.html")
});

export const imageUrl = imageBlob.url;
export const htmlUrl = htmlBlob.url;

// Export the primary key of the Storage Account
// const storageAccountKeys = pulumi.all([resourceGroup.name, storageAccount.name]).apply(([resourceGroupName, accountName]) =>
//     storage.listStorageAccountKeys({ resourceGroupName, accountName }));
// export const primaryStorageKey = storageAccountKeys.keys[0].value;
