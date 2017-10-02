# Node Deploy

Node Deploy is a app deployment solution that allows you to easily update and execute remote Node.js 
applications on your nodedeploy-server using a CLI.

---

# Project Setup

You will need Node.js. For Windows and Mac, you can [use the installer](https://nodejs.org/en/download/). 
For Linux distributions, follow [these simple instructions](https://nodejs.org/en/download/package-manager/). Now...

`cd` into the project directory, and run:

```bash
npm install
```

This will install all dependencies for client and server.

### Installation

You should add `/bin/nodedeploy` and `/bin/nodedeploy-server` to your `PATH` so you can use them 
anywhere without having to reference the whole path. Node Deploy will interact with Git so you 
should be within project folders while you use it.

---

# Server Usage

`cd` into the project directory, and run:

```bash
nodedeploy-server [port]
```

This will start the HTTP server that receives client connections. You can specify an optional listen 
port as an argument; this defaults to `3333`.

If you get a permission denied error, you need to add executable permission first:

```bash
chmod +x nodedeploy-server
```

Then try again.

---

# Client Usage

To see the help menu, run `nodedeploy` without any parameters or pass the `--help` argument.

```bash
nodedeploy --help
```

---

### Remote Setup

```bash
nodedeploy setup
```

This will start the menu flow, which will prompt for everything it needs from you. Your input 
gets sent to the nodedeploy-server, which creates credentials and other default settings.

---

### Project Creation

```bash
nodedeploy create --id [project-id] --remote [remote-uri] --branch [git-branch]
```

* `[--id/-i]`: An identifier for your project, cannot have spaces, or a few other special characters (which you will find out as you try it out).
* `[--remote/-r]`: A remote Git repo SSH URL, used to download the project on the remote nodedeploy-server.
* `[--branch/-b]`: (*Optional*) Changes the branch that's cloned to the server.

This will clone the project onto the remote server.

---

### Project Listing

```bash
nodedeploy list
```

This will retrieve a simple list of project IDs that exist on the nodedeploy-server.

---

### Project Updating

```bash
nodedeploy update [project-id] --message [commit-msg] --branch [git-branch]
```

* `[project-id]`: The identifier of the project to update.
* `[--message/-m]`: The commit message used to commit local changes to Git before contacting the server.
* `[--branch/-b]`: (*Optional*) The branch that is used to pull changes on the remote server. Defaults to master.

This will commit and push local changes to Git, then pull them into the project on the remote server.

---

### Project Starting

```bash
nodedeploy start [project-id]
```

* `[project-id]`: The identifier of the project to start.

This will execute the runner (`nodedeploy-server` or `app.js`) on the remote nodedeploy-server for this project. Output 
will be logged into the project directory. 

---

### Project Deploying

```bash
nodedeploy deploy [project-id] --message [commit-msg] --branch [git-branch]
```

* `[project-id]`: The identifier of the project to deploy.
* `[--message/-m]`: The commit message used to commit local changes to Git before contacting the server.
* `[--branch/-b]`: (*Optional*) The branch that is used to pull changes on the remote server. Defaults to master.

This is a combination of update and start; changes will be pulled and it will be executed.

---

### Project Stopping

```bash
nodedeploy stop [project-id]
```

* `[project-id]`: The identifier of the project to stop.

This will kill a started instance of the project.

---

### Project Destruction

```bash
nodedeploy destroy [project-id]
```

* `[project-id]`: The identifier of the project to destroy.

This will destroy (delete) the project folder on the remote nodedeploy-server.