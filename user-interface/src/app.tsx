import { useEffect, useState } from "react";
import ServerList from "./constructs/server-list";
import Authenticate from "./constructs/authenticate";
import Server from "./constructs/server";
import UseSso, { SsoProvider, UseSsoControls } from "./data/use-sso";
import { ServerProvider } from "./data/use-server";
import useProfile from "./data/use-profile";
import UseOrientation from "./utils/orientation";
import Loading from "./atoms/loading";
import Button from "./atoms/button";
import Icon from "./atoms/icon";
import Modal from "./atoms/modal";
import { Form } from "./atoms/form";
import ImageUpload from "./atoms/image-upload";
import Submitter from "./atoms/submitter";
import Textbox from "./atoms/textbox";
import SsoAsset from "./utils/sso-asset";
import { View } from "./atoms/native";

const MainPanel = () => {
  const profile = useProfile();
  const [open, set_open] = useState("");
  const [updating_profile, set_updating_profile] = useState(false);
  const orientation = UseOrientation();

  return (
    <View class="row fill no_overflow no_gap">
      <View
        class="highlight border_right fill"
        style={{
          ...(orientation === "landscape"
            ? {}
            : {
                width: "100%",
                borderRightWidth: 0,
                overflow: "hidden",
              }),
        }}
      >
        <View class="fill column">
          <ServerList on_open={set_open} profile={profile} />
          <Button on_click={() => set_updating_profile(true)}>
            <Icon area="User & Faces" icon="user" />
          </Button>
        </View>
      </View>
      <View class="flex_fill fill">
        {profile.state?.Servers.map((s) => (
          <ServerProvider key={s.Url} url={s.Url}>
            <Server open={open === s.Url} blur={() => set_open("")} />
          </ServerProvider>
        ))}
      </View>

      <Modal
        open={updating_profile}
        set_open={set_updating_profile}
        title="My Profile"
      >
        <Form fetcher={profile.actions.update_profile} class="column">
          <Textbox name="UserName" default_value={profile.state?.UserName}>
            User Name
          </Textbox>
          <Textbox
            name="Biography"
            multiline
            default_value={profile.state?.Biography}
          >
            Biography
          </Textbox>
          <ImageUpload
            name="Picture"
            default={
              new SsoAsset("/profile/pictures/:user_id", {
                user_id: profile.state?.UserId,
              })
            }
          >
            Profile Picture
          </ImageUpload>
          <Submitter>Update Profile</Submitter>
          <Button on_click={() => set_updating_profile(false)} colour="Danger">
            Close
          </Button>
        </Form>
      </Modal>
    </View>
  );
};

const Main = () => {
  const auth = UseSso();
  const { refresh } = UseSsoControls();

  useEffect(() => {
    const interval = setInterval(() => {
      if (auth.AdminToken && auth.IsExpired)
        refresh({ token: auth.RefreshToken });
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [auth]);

  if (auth.AdminToken && auth.IsExpired) return <Loading />;
  if (!auth.AdminToken) return <Authenticate />;

  return <MainPanel />;
};

export default () => {
  return (
    <SsoProvider>
      <Main />
    </SsoProvider>
  );
};
