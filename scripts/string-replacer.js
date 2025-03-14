module.exports = class StringReplacer {
  constructor(input) {
    this.content = input
  }
  replace(regex, replacement) {
    const match = this.content.match(regex)
    if (!match || match.length === 0) {
      return this
    }
    this.content = this.content.replace(match[0], replacement)
    return this
  }
  toString() {
    return this.content
  }
}
