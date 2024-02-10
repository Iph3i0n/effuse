using Effuse.Core.Handlers.Contracts;
using Effuse.SSO.Handlers.Models.Login;
using Effuse.SSO.Services;

namespace Effuse.SSO.Handlers.Controllers;


public class Login : IHandler<object, LoginResponse>
{
  private readonly AuthService authService;

  public Login(AuthService authService)
  {
    this.authService = authService;
  }

  public async Task<HandlerResponse<LoginResponse>> Handle(HandlerProps<object> props)
  {
    var email = props.QueryParameters["email"];
    var password = props.QueryParameters["password"];

    var response = await this.authService.Login(email, password);

    return new(200, new LoginResponse()
    {
      AdminToken = response.UserToken,
      ServerToken = response.ServerToken,
      UserId = response.UserId.ToString()
    });
  }
}