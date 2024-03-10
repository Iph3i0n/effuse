import { z } from "zod";
import UseRemoteState from "../utils/remote-state";

const Channel = z.object({
  ChannelId: z.string(),
  Type: z.string(),
  Name: z.string(),
});

export default UseRemoteState(
  "/api/v1/channels",
  {
    method: "GET",
    expect: z.array(Channel),
    area: "server",
  },
  {
    create_channel: [
      "/api/v1/channels",
      {
        method: "POST",
        area: "server",
      },
    ],
  }
);
