export default class MessageContent {
  constructor(data) {
    this.data = data;
  }

  toMsg() {
    return this.data;
  }


  static embed(embed, data) {
    return new MessageContent({ ...data, embeds: [embed] });
  }
  static embeds(embeds, data) {
    return new MessageContent({ ...data, embeds });
  }
  static content(content, data) {
    return new MessageContent({ ...data, content });
  }
}