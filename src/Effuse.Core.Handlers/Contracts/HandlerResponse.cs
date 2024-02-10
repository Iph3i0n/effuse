using System.Runtime.InteropServices;

namespace Effuse.Core.Handlers.Contracts;

public class HandlerResponse<TBody>
{
  public HandlerResponse
    (
      int statusCode,
      [Optional] TBody? body,
      [Optional] IDictionary<string, string>? headers 
    )
  {
    this.StatusCode = statusCode;
    this.Body = body;
    this.Headers = headers ?? new Dictionary<string, string>();
  }

  public int StatusCode { get; }

  public IDictionary<string, string> Headers { get; }

  public TBody? Body { get; }
}