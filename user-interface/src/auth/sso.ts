import { z } from "zod";
import { Fetch } from "../utils/fetch";
import { Session } from "../utils/system/storage";
import { createContext, useContext } from "react";

export const Auth = z.object({
  AdminToken: z.string(),
  ServerToken: z.string(),
  UserId: z.string(),
  RefreshToken: z.string(),
  Expires: z.date(),
});

const EmptyAuth = {
  AdminToken: "",
  ServerToken: "",
  UserId: "",
  RefreshToken: "",
  Expires: new Date(),
};

export class Sso {
  readonly #admin_token: string;
  readonly #server_token: string;
  readonly #user_id: string;
  readonly #refresh_token: string;
  readonly #expires: Date;

  constructor(dto: z.infer<typeof Auth>) {
    this.#admin_token = dto.AdminToken;
    this.#server_token = dto.ServerToken;
    this.#user_id = dto.UserId;
    this.#refresh_token = dto.RefreshToken;
    this.#expires = new Date(dto.Expires);
  }

  get #expires_in_seconds() {
    return (this.#expires.getTime() - new Date().getTime()) / 1000;
  }

  get ShouldRefresh() {
    return this.#expires_in_seconds <= 60;
  }

  get IsExpired() {
    return this.#expires_in_seconds <= 0;
  }

  get AdminToken() {
    return this.#admin_token;
  }

  get ServerToken() {
    return this.#server_token;
  }

  get RefreshToken() {
    return this.#refresh_token;
  }

  get UserId() {
    return this.#user_id;
  }

  static get Stored() {
    return new Sso(Auth.parse(Session.auth ?? EmptyAuth));
  }

  static get Empty() {
    return new Sso(Auth.parse(EmptyAuth));
  }
}
