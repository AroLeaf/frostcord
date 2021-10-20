export default class MessageContent {
  constructor(data, options) {
    this.data = data;
    this.options = options;
  }

  toMsg() {
    return this.data;
  }


  static embed(data, options) {
    return new MessageContent({ embeds: [data] }, options);
  }
  static embeds(data, options) {
    return new MessageContent({ embeds: data }, options);
  }
  static content(data, options) {
    return new MessageContent({ content: data }, options);
  }
}