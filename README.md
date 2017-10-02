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

This will install all dependencies for the nodedeploy and nodedeploy-server.

---

# Server Usage

### Configuration

If you want to change the port the nodedeploy-server listens on, you can either change the `NODE_DEPLOY_PORT` 
environment variable, or modify `/bin/nodedeploy-server`. The default port is `3333`.

---

### Running the Server

`cd` into the project directory, and run:

```bash
./bin/nodedeploy-server
```

This will start the HTTP nodedeploy-server.

If you get a permission denied error, you need to add executable permission first:

```bash
chmod +x ./bin/nodedeploy-server
```

Then try again.

---

# Client Usage

To see the help menu, run the nodedeploy without any parameters:

```bash
./bin/nodedeploy
```

---

### Remote Setup

```bash
./bin/nodedeploy setup
```

This will start the menu flow, which will prompt for everything it needs from you. Your input 
gets sent to the nodedeploy-server, which creates credentials and other default settings.

---

### Project Creation

```bash
./bin/nodedeploy create --id [project-id] --remote [remote-uri]
```

`[project-id]`: An identifier for your project, cannot have spaces, or a few other special characters (which you will find out as you try it out).
`[remote-uri]`: A remote Git repo SSH URL, used to download the project on the remote nodedeploy-server.

This will clone the project onto the remote nodedeploy-server.

---

### Project Listing

```bash
./bin/nodedeploy list
```

This will retrieve a simple list of project IDs that exist on the nodedeploy-server.

---

### Project Updating

```bash
./bin/nodedeploy update [project-id] [commit-msg]
```

`[project-id]`: The identifier of the project to update.
`[commit-msg]`: The commit message used to commit local changes to Git before contacting the nodedeploy-server.

This will commit and push updates to Git, then pull them into the project on the remote nodedeploy-server.

---

### Project Starting

```bash
./bin/nodedeploy start [project-id]
```

`[project-id]`: The identifier of the project to start.

This will execute the runner (`./bin/nodedeploy-server` or `app.js`) on the remote nodedeploy-server for this project. Output 
will be logged into the project directory. 

---

### Project Deploying

```bash
./bin/nodedeploy deploy [project-id]
```

`[project-id]`: The identifier of the project to deploy.

This is a combination of update and start; changes will be pulled and it will be executed.

---

### Project Stopping

```bash
./bin/nodedeploy stop [project-id]
```

`[project-id]`: The identifier of the project to stop.

This will kill a started instance of the project.

---

### Project Destruction

```bash
./bin/nodedeploy destroy [project-id]
```

`[project-id]`: The identifier of the project to destroy.

This will destroy (delete) the project folder on the remote nodedeploy-server.