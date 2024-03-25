import * as O from "react-native";
import { Class, Render } from "../styles/theme";

type Props<T> = T & {
  class?: Class;
  ref?: any;
};

export const View = (props: Props<O.ViewProps>) => (
  <O.View
    {...props}
    style={{
      ...Render(props.class),
      ...(typeof props.style === "object" ? props.style : {}),
    }}
  />
);

export const Text = (props: Props<O.TextProps>) => (
  <O.Text
    {...props}
    style={{
      ...Render(props.class),
      ...(typeof props.style === "object" ? props.style : {}),
    }}
  />
);

export const Pressable = (props: Props<O.PressableProps>) => (
  <O.Pressable
    {...props}
    style={{
      ...Render(props.class),
      ...(typeof props.style === "object" ? props.style : {}),
    }}
  />
);

export const ScrollView = (props: Props<O.ScrollViewProps>) => (
  <O.ScrollView
    {...props}
    style={{
      ...Render(props.class),
      ...(typeof props.style === "object" ? props.style : {}),
    }}
  />
);

export const Image = (props: Props<O.ImageProps>) => (
  <O.Image
    {...props}
    style={{
      ...Render(props.class),
      ...(typeof props.style === "object" ? props.style : {}),
    }}
  />
);

export const Modal = (props: Props<O.ModalProps>) => (
  <O.Modal
    {...props}
    style={{
      ...Render(props.class),
      ...(typeof props.style === "object" ? props.style : {}),
    }}
  />
);

export const TextInput = (props: Props<O.TextInputProps>) => (
  <O.TextInput
    {...props}
    style={{
      ...Render(props.class),
      ...(typeof props.style === "object" ? props.style : {}),
    }}
  />
);