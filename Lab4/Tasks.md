# Lab 4 - Deploy-Check-Destroy Lab3

## Überblick

In dieser Übung werden wir einen Integration Test für unser Pulumi Programm aus Lab3 schreiben. Man nennt das auch "Deploy-Check-Destroy" Tests, weil wir mit Hilfe von Pulumi unsere Infrastruktur in ein vergängliches (ephemeral) Environment deployen, gegen dieses Environment unsere Tests ausführen und danach dieses Deployment wieder zerstören.  

Bis April 2021 war es nur möglich, diese Art von Tests für Pulumi in Go mit dem dafür existierenden Integration-Testing Framework zu schreiben. Seit im April 2021 mit Pulumi 3.0 auch die Pulumi Automation API released wurde, können wir für die Integration Tests in unserer "gewohnten" Typescript Umgebung bleiben und Test-Frameworks und Tools aus diesem Ökosystem nutzen.

### Neues Projekt erstellen

1. Ein neues Pulumi Typescript Projekt mit Namen `lab4` erstellen.
2. Einen neuen Stack `dev` hinzufügen.
3. Dependencies hinzufügen:

```bash
npm i --save-dev chai cheerio mocha superagent ts-node
```

### Test-Treiber mit Pulumi Automation API
Als erstes implementieren wir unseren Test-Treiber. Die Pulumi Automation API erlaubt uns verinfacht gesagt, genau das in Programmcode zu machen, was die pulumi CLI macht, also **up**, **destroy** usw.

Wir erstellen eine neue Datei ***test-automation.ts*** in unserem Projektverzeichnis.

Im ersten Schritt erstellen wir `LocalProgramArgs`, über diese können wir einen Stacknamen angeben und den Pfad zum Pulumi Programm, welches wir ausführen wollen. Der Stackname bekommt als Suffix einen zufällig generierten String.

```ts
import { LocalProgramArgs, LocalWorkspace, OutputMap } from "@pulumi/pulumi/automation";
import * as crypto from "crypto";
import * as upath from "upath";

const randomString = crypto.randomBytes(8).toString('hex');

const args: LocalProgramArgs = {
    stackName: `integration-tests-${randomString}`,
    workDir: upath.joinSafe(__dirname, "..", "Lab3-Snapshot"),
};
```

Als nächstes implementieren wir die Pendants zu `pulumi up` und `pulumi destroy`.
```ts

export async function deploy(): Promise<OutputMap> {
    
    const stack = await LocalWorkspace.createOrSelectStack(args);
    console.log(`deploying stack ${stack.name}`);
    
    // Konfiguration für den Stack setzen
    await stack.setConfig("azure-native:location", { value: "WestEurope" });

    const up = await stack.up({ onOutput: console.log });

    return up.outputs;
}

export async function destroy() {

    const stack = await LocalWorkspace.createOrSelectStack(args);
    console.log(`destroying stack ${stack.name}`);

    await stack.destroy({ onOutput: console.log });
}
```

Zuletzt implementieren wir noch den ZUgriff auf die Outputs des Stacks.

```ts
export async function getOutputs(): Promise<OutputMap> {
    
    const stack = await LocalWorkspace.createOrSelectStack(args);

    var outputs = stack.outputs();

    return outputs;
}

export default { deploy, getOutputs, destroy };
```

### Implementierung der Integration Tests

Wir implementieren einen `before` und `after` Hook, in dem wir unseren Test-Treiber aufrufen und dafür sorgen, dass das Deployment vor Ausführung der Tests durchgeführt und nach Abschluss der Tests wieder zerstört wird.

```ts
import { expect } from "chai";
import * as automation from "./test-automation";
import * as superagent from "superagent";
import * as cheerio from "cheerio";

before(async () => {
    await automation.deploy();
});

after(async () => {
    await automation.destroy();
});
```

Dann schreiben wir zwei einfache Tests. Einer soll überprüfen, dass ein Http Request mit der Url `websiteUrl`, die in Lab3 als Output des Pulumi Programms exportiert wird, eine Http Response 200 OK liefert. Der andere prüft das HTML, welches unter `websiteUrl` abgerufen wird.

```ts
describe("Deploying a static website", () => {

    it("should return 200", async () => {
        await automation
            .getOutputs()
            .then((result) => result.websiteUrl.value)
            .then((url) => {
                expect(url).to.be.a("string");
                return superagent.get(url);
            })
            .then((response) => expect(response.statusCode).to.equal(200))
        });
    
    it("should return expected html", async () => {
        await automation
            .getOutputs()
            .then((result) => result.websiteUrl.value)
            .then((url) => {
                expect(url).to.be.a("string");
                return superagent.get(url);
            })
            .then((response) => response.text)
            .then((html) => {
                const dom = cheerio.load(html);
                expect(dom("title").text()).to.equal("Pulumi Workshop Static Website");
            });
    });    
});
```

### Test Script 
Um unsere Tests ausführen zu können, müssen wir noch ein Test Script Command in der `package.json` hinzufügen:
```json
"scripts": {
    "test": "./node_modules/mocha/bin/mocha --timeout=120000 -r ts-node/register ./test.ts"
}
```

### Deploy, check, destroy in Aktion
```bash
npm run test
```