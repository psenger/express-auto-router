
Thanks for contributing! 😁 Here are some rules that will make your change to
markdown-fences fruitful.

### Rules

* Raise a ticket to the feature or bug can be discussed
* Pull requests are welcome, but must be accompanied by a ticket approved by the repo owner
* You are expected to add a unit test or two to cover the proposed changes.
* Please run the tests and make sure tests are all passing before submitting your pull request
* Do as the Romans do and stick with existing whitespace and formatting conventions (i.e., tabs instead of spaces, etc)
  * we have provided the following: `.editorconfig` and `.eslintrc`
  * Don't tamper with or change `.editorconfig` and `.eslintrc`
* Please consider adding an example under examples/ that demonstrates any new functionality

### Commit Message

This module uses [release-please](https://github.com/googleapis/release-please) which
needs commit messages to look like the following [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

```
<type>[optional scope]: <description>

[optional body]

```

**type** is typically `fix`, `feat`. When **type** ends with a `!` or is `BREAKING CHANGE` it indicates this is a breaking change.

**type** should be followed by a short description, **<description>**

**optional body** can have more detail

### Testing

* All tests are expected to work
* Tests are based off of `dist/index.js` **NOT** your src code. Therefore, you should BUILD it first.
* Coverage should not go down, and I acknowledge it is very difficult to get the tests to 100%
