# Pre Auth Proxy Debugger

![Deploy Diagram](../../diagrams/sc005-pre-auth-debugger.png)

## Installazione

Per eseguire lo strumento di debug occorre installare [NodeJS](https://nodejs.org/it/download/)

da riga di comando all'interno della cartella di questo file:

```shell

$ npm install
...

```

## Configurazione

Per configurare lo strumento si possono definire le seguenti variabili d'ambiente:

| Variable | Desc      | DEFAULT               |
| -------- | --------- | --------------------- |
| PORT     | porta tcp | 3001                  |
| TARGET   | url       | http://localhost:9090 |

Si può utilizzare anche il file [`dotenv` (.env)](https://github.com/motdotla/dotenv), il file `example.env` contiene i valori di default e può essere utilizzato come template:

```shell
$ cp example.env .env
...
```

### Impostazione degli header da inserire nella request (AUTH headers)

All'interno del file [`header_inject.js`](./header_inject.js) sono definiti gli header aggiunti alle request.

```js
const headers = [
  ['x-auth-token', 'eyJhb...TRUNKATED'],
  ['authorization', 'Bearer eyJhb...TRUNKATED'],
  ['x-auth-username', 'demo.super'],
  ['x-auth-groups', ''],
  ['x-auth-subject', '3b02c78a-6567-401a-b656-a5bc3d382189'],
  ['x-auth-email', ''],
  ['x-auth-audience', 'sc005-resource-server,account'],
  ['x-auth-roles', 'demo:read,demo:admin'],
  ['x-auth-userid', 'demo.super'],
  ['x-auth-expiresin', '2019-05-02 10:22:51 +0000 UTC'],
];

module.exports = headers;
```

aggiungere o rimuovere un header significa modificare l'array headers.

> 👍🏻 **Appena viene salvato il file lo strumenti si riavvia automaticamente**

## Utilizzo

Per eseguire l pre-auth-proxy :

```shell
$ npm run start
...
[winston] Attempt to write logs with no transports {"message":"[HPM] Proxy created: **  ->  http://localhost:9090","level":"info"}
[winston] Attempt to write logs with no transports {"message":"[HPM] Subscribed to http-proxy events:  [ 'error', 'proxyReq', 'close' ]","level":"debug"}
Pre Auth Proxy Debugger is running on

http://localhost:3001
          V
      is proxying
          V
http://localhost:9090


```
