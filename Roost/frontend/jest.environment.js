const JSDOMEnvironment = require('jest-environment-jsdom').default;

module.exports = class MswJSDOMEnvironment extends JSDOMEnvironment {
  constructor(config, context) {
    super(config, context);
    const g = this.global;
    g.TextEncoder ??= TextEncoder;
    g.TextDecoder ??= TextDecoder;
    g.ReadableStream ??= ReadableStream;
    g.WritableStream ??= WritableStream;
    g.TransformStream ??= TransformStream;
    g.BroadcastChannel ??= BroadcastChannel;
    g.structuredClone ??= structuredClone;
    g.fetch ??= fetch;
    g.Request ??= Request;
    g.Response ??= Response;
    g.Headers ??= Headers;
    g.FormData ??= FormData;
    g.Blob ??= Blob;
  }
};
