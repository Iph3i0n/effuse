using System.Collections.Generic;
using System.IO;
using Amazon.CDK;
using Amazon.CDK.AWS.Apigatewayv2;
using Amazon.CDK.AWS.DynamoDB;
using Amazon.CDK.AWS.S3;
using Constructs;
using Effuse.Core.AWS.Infrastructure.Utilities;

namespace Effuse.AWS.Infrastructure.Stacks;

public class EffuseSSO : Stack
{
  internal EffuseSSO(Construct scope, string id, IStackProps props = null) : base(scope, id, props)
  {
    _ = new Lambda(this, "inviter", new LambdaProps
    {
      Handler = "Invite",
      Area = "SSO"
    });

    var usersTable = new Table(this, "users", new TableProps
    {
      PartitionKey = new Attribute
      {
        Name = "UserId",
        Type = AttributeType.STRING
      }
    });

    var emailIndexName = "EmailIndex";

    usersTable.AddGlobalSecondaryIndex(new GlobalSecondaryIndexProps
    {
      IndexName = emailIndexName,
      PartitionKey = new Attribute
      {
        Name = "Email",
        Type = AttributeType.STRING
      }
    });

    var assetsBucket = new Bucket(this, "assets-bucket", new BucketProps { });

    _ = new Parameter(this, "jwt-parameter", new (){
      Name = "JWT_SECRET",
      Value = File.ReadAllText(Config.ProjectPath("../resources/private_key.pem"))
    });

    _ = new WebApi(this, "core-services", new ()
    {
      Description = "The core services API",
      Environment = new Dictionary<string, string>()
      {
        ["BUCKET_NAME"] = assetsBucket.BucketName,
        ["USER_TABLE_NAME"] = usersTable.TableName,
        ["USER_TABLE_EMAIL_INDEX"] = emailIndexName,
        ["APP_PREFIX"] = Config.AppPrefix
      },
      Routes = new Route[] {
        new() {
          Method = HttpMethod.GET,
          Path = "/api/v1/heartbeat",
          Handler = "HeartBeat",
          Area = "SSO"
        },
        new() {
          Method = HttpMethod.POST,
          Path = "/api/v1/users",
          Handler = "Register",
          Area = "SSO"
        },
        new() {
          Method = HttpMethod.GET,
          Path = "/api/v1/users/{userId}/profile",
          Handler = "GetPublicProfile",
          Area = "SSO"
        },
        new() {
          Method = HttpMethod.GET,
          Path = "/api/v1/user/profile",
          Handler = "GetProfile",
          Area = "SSO"
        },
        new() {
          Method = HttpMethod.PUT,
          Path = "/api/v1/user/profile",
          Handler = "UpdateProfile",
          Area = "SSO"
        },
        new() {
          Method = HttpMethod.POST,
          Path = "/api/v1/user/servers",
          Handler = "JoinServer",
          Area = "SSO"
        },
        new() {
          Method = HttpMethod.GET,
          Path = "/api/v1/auth/token",
          Handler = "Login",
          Area = "SSO"
        }
      }
    });
  }
}
