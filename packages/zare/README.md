<p align="center"><img src="https://github.com/IsmailBinMujeeb/zare/blob/v2/assets/icon.png?raw=true" width="200px" /></p>
<p align="center"><img alt="NPM Version" src="https://img.shields.io/npm/v/zare"> <img src="https://img.shields.io/npm/dm/zare"/> <a href="https://x.com/ZareJs"><img src="https://img.shields.io/badge/X-000000?logo=x&logoColor=white"/></a> <a href="https://discord.gg/HB63mRPVZt"><img src="https://img.shields.io/badge/Discord-5865F2?logo=discord&logoColor=white"/></a> <a href="https://www.reddit.com/r/Zare/"><img src="https://img.shields.io/badge/Reddit-FF4500?logo=reddit&logoColor=white"/></a></p>

# Zare⚡

A file-based component-based template engine for making your frontend more modular.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Installation

### Install Using NPM

```bash
npm install zare
```

## Usage

To start using the project, follow these steps:

1. Install packages

   ```bash
   npm i express zare
   ```

2. Express Setup with Zare

   ```js
   "/app.js";
   import express from "express";

   const app = express();
   const port = 3000;

   app.set("view engine", "zare");

   app.get("/", (req, res) => {
     res.render("index", { text: "World" });
   });

   app.listen(port, () => console.log("Running at http://localhost:3000"));
   ```

3. Create a index.zare file in views folder and paste

   ```zare
   // views/index.zare
   serve (
       <h1>Hello, @(text)</h1>
   )
   ```

4. Run express app

   ```bash
   node app.js
   ```

5. Open any browser and navigate to

   <a href="http://localhost:3000/">http://localhost:3000/</a>

## Example

```zare
    serve (
        <p>Welcome To Zare</p>
    )
```

## Contributing

- Fork the repo.
- Create a new branch (`git checkout -b feature-name`).
- Make changes and commit them (`git commit -am 'Add new feature'`).
- Push the branch to your fork (`git push origin feature-name`).
- Open a pull request to the `main` branch with a detailed description of your changes.
- If you found an issue, please open a GitHub issue before creating a PR.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
