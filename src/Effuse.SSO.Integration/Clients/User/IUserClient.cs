using AppDomain = Effuse.SSO.Domain;

namespace Effuse.SSO.Integration.Clients.User;

public class ProfilePicture(MemoryStream data, string mime)
{
  public MemoryStream Data => data;

  public string Mime => mime;
}

public interface IUserClient
{
  Task<AppDomain.User> GetUser(Guid userId);

  Task<AppDomain.User> GetUserByEmail(string email);

  Task CreateUser(AppDomain.User user);

  Task UpdateUser(AppDomain.User user);

  Task DeleteUser(AppDomain.User user);

  Task<ProfilePicture> GetProfilePicture(AppDomain.User user);

  Task UploadProfilePicture(AppDomain.User user, MemoryStream imageData, string mime);

  IAsyncEnumerable<AppDomain.User> AllUsers();
}