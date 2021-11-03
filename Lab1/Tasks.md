# Lab 1 - Pulumi Grundlagen

## Überblick

In der ersten Übung werden wir uns mit den Grundlagen von Pulumi vertraut machen. Hierzu gehört

- der Umgang mit der Pulumi CLI,
- das Erstellen eines Projekts und Stacks,
- das Hinzufügen von Konfiguration und Secrets
- und das Exportieren eines Outputs.

## Pulumi CLI

### Login

Jeder sollte vor Teilnahme bereits ein Pulumi Konto erzeugt haben (falls nicht, nun hier schnell nachholen: <https://app.pulumi.com/> und am Einfachsten direkt Euren GitHub Login verwenden).

```bash
pulumi login
```

Es gibt die Möglichkeit, sich interaktiv via Browser anzumelden oder ein AccessToken in der Pulumi Konsole zu generieren und dieses für den Login auf der Kommandozeile zu verwenden.  
Eine nicht-interaktive Anmeldung wird ebenfalls unterstützt, in dem ein AccessToken über die Environment-Variable `PULUMI_ACCESS_TOKEN` angegeben wird. Ich selbst verwende im Workshop ein AccessToken.

```bash
pulumi whoami  # zeigt den derzeit angemeldeten User an
```

### Erstes Projekt

Wir erzeugen nun unser erstes Pulumi Projekt mit unserem ersten Stack. Dazu führen wir folgenden Befehl aus:

```bash
pulumi new
```

Wir wählen `typescript` als Template für das Projekt, und belassen die weiteren Einstellungen wie sie sind. Als Ergebnis erhalten wir einen neuen Pulumi Stack `lab1/dev`.
Dies lässt sich leicht überprüfen, in dem wir die Stacks auflisten:

```bash
pulumi stack ls
```

:bulb: Nehmt Euch kurz Zeit und schaut Euch die Dateien im erzeugten Pulumi Projekt an.

:mag: Das erzeugte Projekt ist letztlich ein ganz normales **Typescript** Projekt mit vielen Bekannten: `.gitignore, tsconfig.json, package.json, index.ts, ...` Die einzige zusätzliche Datei ist `Pulumi.yaml`, diese enthält Informationen zum aktuellen Projekt:

```yaml
name: lab1
runtime: nodejs
description: A minimal TypeScript Pulumi program
```

---

Nun erzeugen wir zwei weitere Stacks:

```bash
pulumi stack init staging  # erzeugt Stack lab1/staging
pulumi stack init prod     # erzeugt Stack lab1/prod
```

Wir wechseln zwischen den Stacks:

```bash
pulumi stack select dev
pulumi stack select staging
pulumi stack select prod
pulumi stack select dev
```

:mag: Obwohl wir mehrere Stacks erzeugt haben, hat sich keine Datei verändert bzw. ist eine neue Datei im Projekt hinzugekommen. Dies liegt daran, dass die Information über die Stacks selbst vom Pulumi Service verwaltet werden.

:bulb: Ähnlich wie bei Terraform gibt es die Möglichkeit, das State-Management ohne den Pulumi-Service zu betreiben (und den State z.B. auf AWS S3 oder Azure BlobStorage abzulegen). Es gibt hierzu nicht wirklich viel Information im Netz, ein guter Ansatz wird von Sam Cogan [hier](https://samcogan.com/storing-pulumi-state-in-azure/) in seinem Blogpost beschrieben.

### Konfiguration eines Stacks

Es können unabhängig für jeden Stack Konfigurationsparameter und Secrets verwaltet werden. Das ist insofern interessant, als dass man damit für unterschiedliche Umgebungen andere Parametersätze verwenden kann. In einer DEV Umgebung reichen vielleicht weniger und kleinere VMs, als in einer PROD Umgebung. Stacks kann man also als Strukturelement verwenden, um verschiedene Environments zu modellieren.

#### Konfiguration

Im ersten Schritt legen wir einen Config-Parameter im Stack `lab1/dev` an:

```bash
pulumi stack select dev
pulumi config set myname Florian-dev
```

:bulb: Durch das Festlegen eines Config-Parameters ist im Projektverzeichnis eine neu Datei entstanden.

:muscle: **Lege für die anderen Stacks ebenfalls einen solchen Config-Parameter an!**

#### Secrets

Im zweiten Schritt legen wir nun ein Secret im Stack `lab1/dev` an:

```bash
pulumi stack select dev
pulumi config set mysecret secret-dev --secret
```

:bulb: Das erstellte Secret wird verschlüsselt in der Stack-Konfigurationsdatei gespeichert (hier `Pulumi.dev.yaml`).

:muscle: **Lege für die anderen Stacks ebenfalls ein solches Secret an!**

### Nutzung der Konfiguration im Pulumi Programm

Wir schreiben nun zum ersten Mal Code für unser Pulumi Programm, und zwar in die `index.ts`:

```ts
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

const myname = config.require("myname");
const mysecret = config.requireSecret("mysecret");

const optionalConfigParameter = config.get("optional") || "defaultValue";

export const name = myname;
export const secret = mysecret;
```

Im Terminal führen wir nun den wohl wichtigsten Pulumi Befehl aus:

```bash
pulumi up  # 'pulumi up -y' um ohne Nachfrage auszuführen
```

Dieser Aufruf veranlasst Pulumi unser Programm auszuführen, den
**desired state**
daraus abzuleiten und anschließend dafür zu sorgen, dass
**desired state == actual state**

Nach Beendigung des Befehls sehen wir, dass Pulumi zwei Outputs erzeugt hat:

```bash
name  : "Florian"
secret: "[secret]"
```

Diese können wir uns auch gezielt anzeigen lassen:

```bash
pulumi stack output
```

Um die Secrets in Plaintext sehen zu können:

```bash
pulumi stack output --show-secrets
```

:muscle: **Weitere Aufgaben**

1. Führe `pulumi up` auch für die anderen Stacks durch.
2. Füge den optionalen Parameter in einem Stack hinzu.
3. Entferne einen der benötigten Parameter aus einem Stack und provoziere damit einen Fehler.
