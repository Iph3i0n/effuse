import UseChannels, { Channel } from "../data/use-channels";
import { PropsWithChildren, useState } from "react";
import Icon from "../atoms/icon";
import ChannelView from "./channel-view";
import UseServer from "../data/use-server";
import Button from "../atoms/button";
import Modal from "../atoms/modal";
import { Form } from "../atoms/form";
import Submitter from "../atoms/submitter";
import Textbox from "../atoms/textbox";
import Checkbox from "../atoms/checkbox";
import useServerMetadata from "../data/use-server-metadata";
import UseOrientation from "../utils/orientation";
import TopBar from "../atoms/top-bar";
import ResponsiveModal from "../molecules/responsive-modal";
import ServerAdmin from "./server-admin";
import { Pressable, View, Text, ScrollView } from "../atoms/native";

const ChannelListItem = (
  props: PropsWithChildren<{ channel: Channel; on_open: () => void }>
) => {
  return (
    <Pressable onPress={props.on_open}>
      <View class="card row container">
        <Icon area="Communication" icon="chat-3" class="body-text" />
        <Text class="body_text">{props.channel.Name}</Text>
      </View>
    </Pressable>
  );
};

export default (props: { open: boolean; blur: () => void }) => {
  const server = UseServer();
  const {
    state: channels,
    actions: { create_channel, update_channel },
  } = UseChannels();
  const { state: metadata } = useServerMetadata();
  const [open_channel, set_open_channel] = useState<Channel | null>(null);
  const [configuring, set_configuring] = useState(false);
  const [creating, set_creating] = useState(false);
  const orientation = UseOrientation();

  return (
    <ResponsiveModal class="row fill no_gap" open={props.open}>
      <Modal open={creating} set_open={set_creating} title="Create a Channel">
        <Form
          fetcher={create_channel}
          on_submit={() => set_creating(false)}
          class="column"
        >
          <Textbox name="Name">Channel Name</Textbox>
          <Checkbox name="Public">Is Public</Checkbox>
          <View class="row">
            <Submitter>Create Channel</Submitter>
            <Button on_click={() => set_creating(false)} colour="Danger">
              Cancel
            </Button>
          </View>
        </Form>
      </Modal>

      <View
        class="colour-body fill border-right"
        style={{
          ...(orientation === "portrait"
            ? !open_channel
              ? {
                  width: "100%",
                  borderRightWidth: 0,
                }
              : {
                  width: 0,
                  overflow: "hidden",
                  borderRightWidth: 0,
                }
            : {
                width: 220,
              }),
        }}
      >
        <TopBar click={props.blur} title={metadata?.ServerName}>
          {server.IsAdmin && (
            <Pressable
              onPress={() => {
                set_open_channel(null);
                set_configuring(true);
              }}
            >
              <Icon area="System" icon="settings-2" class="body-text" />
            </Pressable>
          )}
        </TopBar>
        <ScrollView class="flex-fill">
          <View class="column edge-container">
            {channels?.map((c) => (
              <ChannelListItem
                key={c.ChannelId}
                channel={c}
                on_open={() => set_open_channel(c)}
              />
            ))}
          </View>
        </ScrollView>

        {server?.IsAdmin && (
          <Button
            on_click={() => set_creating(true)}
            colour="Secondary"
            class="spacer"
          >
            +
          </Button>
        )}
      </View>

      <ResponsiveModal
        class="flex-fill fill"
        open={!!open_channel || configuring}
        colour="Body"
      >
        {open_channel ? (
          <ChannelView
            channel={open_channel}
            update={update_channel}
            blur={() => set_open_channel(null)}
          />
        ) : configuring ? (
          <ServerAdmin
            blur={() => set_configuring(false)}
            url={server.BaseUrl}
          />
        ) : (
          <></>
        )}
      </ResponsiveModal>
    </ResponsiveModal>
  );
};
