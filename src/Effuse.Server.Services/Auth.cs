﻿using Effuse.Core.Integration;
using Effuse.Core.Integration.Contracts;
using Effuse.Server.Domain;
using Effuse.Server.Integrations;
using Effuse.Server.Integrations.Contracts;

namespace Effuse.Server.Services;

public class Auth
{
  private struct UserGrant
  {
    public string UserId { get; set; }
  }

  private readonly ISsoClient ssoClient;

  private readonly IUserClient userClient;
  private readonly IJwtClient jwtClient;
  private readonly IParameters parameters;

  public Auth(ISsoClient ssoClient, IUserClient userClient, IJwtClient jwtClient, IParameters parameters)
  {
    this.ssoClient = ssoClient;
    this.userClient = userClient;
    this.jwtClient = jwtClient;
    this.parameters = parameters;
  }

  public async Task<string> Authenticate(string ssoToken, string password)
  {
    var userId = await this.ssoClient.GetUserId(ssoToken);
    var existing = await this.userClient.FindUser(userId);
    if (existing == null)
    {
      var serverPassword = await this.parameters.GetParameter(ParameterName.SERVER_PASSWORD);
      if (serverPassword != password)
        throw new AuthException("Invalid password");
      await this.userClient.RegisterUser(userId);
    }

    return await this.jwtClient.CreateJwt(new UserGrant
    {
      UserId = userId.ToString()
    }, TimeSpan.FromHours(12));
  }

  public async Task<User> GetUser(string localToken)
  {
    var grant = await this.jwtClient.DecodeJwt<UserGrant>(localToken);

    var user = await this.userClient.GetUser(Guid.Parse(grant.UserId));
    if (user.Banned) throw new Exception("User is banned");
    return user;
  }

  public async Task RequireAdmin(string localToken)
  {
    var user = await this.GetUser(localToken);
    if (!user.Admin) throw new AuthException("Admin required");
  }
}
