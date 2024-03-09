import { PropsWithChildren, createContext, useContext, useState } from "react";
import { Auth, Sso } from "../auth/sso";
import UseFetcher, { Fetcher } from "../utils/fetch";
import { Session } from "../utils/storage";

const SsoContext = createContext(Sso.Stored);

const SsoControlContext = createContext<{
  refresh: Fetcher<unknown>;
  login: Fetcher<unknown>;
  register: Fetcher<unknown>;
}>(null as any);

export default function UseSso() {
  return useContext(SsoContext);
}

export function UseSsoControls() {
  return useContext(SsoControlContext);
}

export const SsoProvider = (props: PropsWithChildren) => {
  const [auth, set_auth] = useState(Sso.Stored);

  const refresh = UseFetcher("/api/v1/auth/refresh-token", {
    method: "GET",
    expect: Auth,
    area: "sso",
    on_success(_, d) {
      set_auth(new Sso(d));
      Session.auth = d;
    },
  });

  const login = UseFetcher("/api/v1/auth/token", {
    area: "sso",
    method: "GET",
    expect: Auth,
    on_success(_, d) {
      set_auth(new Sso(d));
      Session.auth = d;
    },
  });

  const register = UseFetcher("/api/v1/users", {
    method: "POST",
    area: "sso",
    expect: Auth,
    on_success(_, d) {
      set_auth(new Sso(d));
      Session.auth = d;
    },
  });

  return (
    <SsoControlContext.Provider
      value={{
        refresh,
        login,
        register,
      }}
    >
      <SsoContext.Provider value={auth}>{props.children}</SsoContext.Provider>
    </SsoControlContext.Provider>
  );
};
