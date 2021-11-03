# Lab 2 - Docker Container lokal deployen

## Überblick

In der zweiten Übung werden wir einen Docker Container in unserer lokalen Entwicklungsumgebung (gitpod.io) deployen.

## Aufgaben

### Neues Projekt erstellen

1. Ein neues Pulumi Typescript Projektmit Namen `lab2` erstellen
2. Einen neuen Stack `dev` hinzufügen.
3. Das Paket `@pulumi/docker` hinzufügen
4. Im Terminal überprüfen, dass docker verfügbar ist

### Nginx Container deployen

Zuerst das neu hinzugefügte `@pulumi/docker` Paket importieren.

```ts
import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";
```

Um in Pulumi ein Docker-Image zu referenzieren, verwendet man am einfachsten eine [RemoteImage](https://www.pulumi.com/docs/reference/pkg/docker/remoteimage/) Resource.

```ts
const image = new docker.RemoteImage("nginx", {
   name: "nginx"
});
```

Um einen Container mit diesem Image zu erzeugen, verwendet man eine [Container](https://www.pulumi.com/docs/reference/pkg/docker/container/) Resource.

```ts
const container = new docker.Container("nginx", {
   image: image.latest
});
```

Wir exportieren den Containernamen als Output unseres Pulumi Programms:

```ts
export const containerName = container.name;
```

:muscle: **Führe `pulumi up` aus und überprüfe, dass ein Container mit entsprechendem Namen existiert.**

### Container-Image konfigurierbar machen

1. Füge dem Stack einen Config-Parameter `imageName` mit Wert `nginx` hinzu und verwende diesen Parameter im Programm.
2. Führe `pulumi up` aus. Was ist das erwartete Ergebnis?
3. Ändere den Wert des Parameters `imageName` zu `nginx:1.21.0-alpine`. 
4. Führe `pulumi up` aus. Was ist das erwartete Ergebnis?

Der Zugriff via http auf den Container funktioniert noch nicht. Es fehlt ein Port-Mapping. 

### Port-Mapping hinzufügen

Wir fügen dem Container ein Port-Mapping hinzu, Host-Port 8080 auf Container-Port 80.

```ts
const container = new docker.Container("nginx", {
   image: image.latest,
   ports: [{
      internal: 80,
      external: 8080
   }]
});
```

Nach Ausführung von `pulumi up` überprüfen wir, dass der Container nun erreichbar ist:
 
```bash
curl localhost:8080
```