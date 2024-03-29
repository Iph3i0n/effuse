﻿using System.Collections.Specialized;
using System.Net;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Web;
using Effuse.Core.Handlers.Contracts;
using Effuse.Core.Utilities;

namespace Effuse.Core.Local;

public static class Utilities
{
  public static Dictionary<string, string> GetQueryString(this Uri? uri)
  {
    if (uri == null) return new Dictionary<string, string>();

    var queryString = uri.Query;
    var queryParts = System.Web.HttpUtility.ParseQueryString(queryString);
    return queryParts.ToDictionary();
  }

  public static Dictionary<string, string> ToDictionary(this NameValueCollection? collection)
  {
    var result = new Dictionary<string, string>();

    if (collection == null) return result;

    foreach (var key in collection.AllKeys)
    {
      if (key == null) continue;
      var input = collection[key];
      if (input is string s)
        result[key] = s;
    }

    return result;
  }

  public static async Task<string?> GetBody(this HttpListenerRequest request)
  {
    if (!request.HasEntityBody)
    {
      return null;
    }

    using Stream body = request.InputStream;
    using var reader = new StreamReader(body, request.ContentEncoding);
    return await reader.ReadToEndAsync();
  }

  public static async Task<HandlerProps> HandlerProps(this HttpListenerRequest req, Route route, Guid connectionId)
  {
    if (req.Url == null) throw new Exception("This should not be reachable");

    return new HandlerProps(
      path: req.Url.AbsolutePath,
      method: req.HttpMethod,
      connectionId: connectionId.ToString(),
      pathParameters: route.PathParameters(req.Url.AbsolutePath).UrlDecodeValues(),
      queryParameter: req.Url.GetQueryString().ToLowerCaseKeys().UrlDecodeValues(),
      headers: req.Headers.ToDictionary().ToLowerCaseKeys(),
      body: await req.GetBody() ?? string.Empty
    );
  }

  public static async Task ApplyResponse(this HttpListenerResponse? res, HandlerResponse response)
  {
    if (res == null) return;

    byte[] data;
    if (response.Body is MemoryStream ms)
    {
      if (!response.Headers.TryGetValue("Content-Type", out string? contentType))
        throw new Exception("A Content-Type header is required for memory repsonses");

      data = ms.ToArray();
      res.ContentType = contentType;
    }
    else
    {
      data = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(response.Body ?? new { }));
      res.ContentType = "application/json";
      res.ContentEncoding = Encoding.UTF8;
    }

    res.ContentLength64 = data.LongLength;
    foreach (var (key, value) in response.Headers)
    {
      res.AddHeader(key, value);
    }

    res.AddHeader("Access-Control-Allow-Origin", Env.GetEnv("UI_URL"));
    res.AddHeader("Access-Control-Allow-Methods", "OPTIONS, GET, PUT, POST, DELETE");
    res.AddHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

    res.StatusCode = response.StatusCode;

    await res.OutputStream.WriteAsync(data);
    res.Close();
  }

  public static Task GetContextAsync(this HttpListener listener)
  {
    return Task.Factory.FromAsync(listener.BeginGetContext, listener.EndGetContext, TaskCreationOptions.None);
  }

  public static async Task<string> ReadMessage(this WebSocket ws)
  {
    using var ms = new MemoryStream();

    WebSocketReceiveResult result;
    do
    {
      var messageBuffer = WebSocket.CreateClientBuffer(1024, 16);
      result = await ws.ReceiveAsync(messageBuffer, CancellationToken.None);
      ms.Write(messageBuffer.Array ?? [], messageBuffer.Offset, result.Count);
    }
    while (!result.EndOfMessage);

    if (result.MessageType != WebSocketMessageType.Text)
      throw new Exception("Invalid websocket message type");

    return Encoding.UTF8.GetString(ms.ToArray());
  }

  public static async Task SendJson(this WebSocket ws, object data)
  {
    await ws.SendAsync(
      Encoding.UTF8.GetBytes(
        JsonSerializer.Serialize(data)),
      WebSocketMessageType.Text,
      true,
      CancellationToken.None);
  }

  public static Dictionary<string, string> UrlDecodeValues(this IDictionary<string, string> self)
  {
    var result = new Dictionary<string, string>();
    foreach (var (k, v) in self ?? new Dictionary<string, string>())
    {
      result[k] = HttpUtility.UrlDecode(v);
    }

    return result;
  }
}
