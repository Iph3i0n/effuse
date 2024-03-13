import { PropsWithChildren } from "react";
import { Image } from "react-native";
import DataUrl from "../utils/data-url";

type Props = {
  icon: string;
  area: string;
  type?: "line" | "fill";
  size?: number;
};

export default (props: PropsWithChildren<Props>) => (
  <Image
    source={{
      uri: new DataUrl(
        require(`remixicon/icons/${props.area}/${props.icon}-${
          props.type ?? "line"
        }.svg`),
        "image/svg+xml",
        "utf8"
      ).Uri,
      width: props.size ?? 24,
      height: props.size ?? 25,
    }}
  />
);