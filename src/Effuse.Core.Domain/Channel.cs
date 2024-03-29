﻿namespace Effuse.Core.Domain;

public class Channel
{
  public Channel(Guid channelId, ChannelType type, string name, bool @public)
  {
    ChannelId = channelId;
    Type = type;
    Name = name;
    Public = @public;
  }

  public Guid ChannelId { get; }

  public ChannelType Type { get; }

  public string Name { get; }

  public bool Public { get; }

  public Channel WithName(string name)
  {
    return new Channel(this.ChannelId, this.Type, name, this.Public);
  }

  public Channel WithPublicity(bool @public)
  {
    return new Channel(this.ChannelId, this.Type, this.Name, @public);
  }
}
