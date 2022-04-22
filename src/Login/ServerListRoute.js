import React from 'react';
import { user as UserApi, noauth as NoAuthApi } from '@vidispine/vdt-api';
import { VidispineApi } from '@vidispine/vdt-react';
import { BrowserRouter as Router } from 'react-router-dom';

import { pathToRegexp } from 'path-to-regexp';
import { withCookies } from 'react-cookie';

import ServerList from './ServerList';

const { PUBLIC_URL: publicUrl } = process.env;
let basename = publicUrl || '/';
if (basename.startsWith('http')) {
  const p = new URL(basename);
  basename = p.pathname;
}

const cookieOptions = {
  maxAge: 604800,
  path: basename,
  sameSite: 'strict',
};

const VIDISPINE_SERVERS = 'VIDISPINE-SERVERS';
const VIDISPINE_TOKEN = 'VIDISPINE-TOKEN';

const decodeJsonCookie = (encodedJsonCookie) => {
  if (!encodedJsonCookie) return undefined;
  const stringJsonCookie = atob(encodedJsonCookie);
  const parsedJsonCookie = JSON.parse(stringJsonCookie);
  return parsedJsonCookie;
};

const encodeJsonCookie = (decodedJsonCookie) => {
  if (!decodedJsonCookie) return undefined;
  const stringJsonCookie = JSON.stringify(decodedJsonCookie);
  const encodedJsonCookie = btoa(stringJsonCookie);
  return encodedJsonCookie;
};

const getApiServerFromPathname = (pathname) => {
  // match on '//vdt-react-videolibrary/server/https%3A%2F%2Ftest.myvidispine.com/item/'
  let match = pathToRegexp('/server/:serverUrl/:any*').exec(pathname);
  // match on '//vdt-react-videolibrary/server/https%3A%2F%2Ftest.myvidispine.com'
  if (!match) match = pathToRegexp('/server/:serverUrl', [], { strict: true }).exec(pathname);
  // match on '/server/https%3A%2F%2Ftest.myvidispine.com'
  if (!match) match = pathToRegexp('/server/:serverUrl/:any*').exec(pathname);
  if (!match) return undefined;
  try {
    const uriEncodedserverUrl = match[1];
    const serverUrl = decodeURIComponent(uriEncodedserverUrl);
    return serverUrl;
  } catch (e) {
    if (e instanceof URIError) return undefined;
    throw e;
  }
};

const redirectUnencodedPathname = (pathname) => {
  const match = pathToRegexp('/:basename/server/(.*)', [], { strict: true }).exec(pathname);
  if (match && match[2]) {
    try {
      // will throw if not a valid url
      const wildcardUrl = new URL(match[2]);
      // only match the origin as cannot know if path is part of the server or app
      const { origin } = wildcardUrl;
      if (!origin) return;
      const serverUrl = encodeURIComponent(origin);
      const newPathname = pathname.replace(origin, serverUrl);
      window.history.pushState({}, document.title, newPathname);
      window.location.reload();
    } catch (error) {
      // dont redirect when catching
    }
  }
};

class ServerListRoute extends React.Component {
  constructor(props) {
    super(props);
    this.onChangeServer = this.onChangeServer.bind(this);
    this.onAddServer = this.onAddServer.bind(this);
    this.onRemoveServer = this.onRemoveServer.bind(this);
    this.onUpdateCookie = this.onUpdateCookie.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.onLogout = this.onLogout.bind(this);
    const { cookies } = props;
    const serversCookie = cookies.get(VIDISPINE_SERVERS);
    const token = cookies.get(VIDISPINE_TOKEN);
    const servers = decodeJsonCookie(serversCookie);
    const { pathname } = window.location;
    const serverUrl = getApiServerFromPathname(pathname);
    this.state = {
      servers,
      token,
    };
    if (props.serverUrl && serverUrl !== props.serverUrl) {
      const apiServer = { serverUrl: props.serverUrl, userName: '' };
      this.state.apiServer = apiServer;
      this.state.servers = [apiServer];
    } else if (serverUrl) {
      if (servers) {
        const apiServer = servers.find((thisServer) => thisServer.serverUrl === serverUrl);
        if (apiServer) {
          this.state.apiServer = apiServer;
        } else {
          // we have a token but has been this url removed from list of servers
          this.state.apiServer = { serverUrl };
          this.state.token = undefined;
        }
      } else {
        this.state.apiServer = { serverUrl };
        this.state.token = undefined;
      }
    } else {
      redirectUnencodedPathname(pathname);
    }
  }

  onChangeServer(newServer) {
    let newPathname = basename;
    if (newServer) {
      newPathname = `${publicUrl.replace(/\/+$/, '')}/server/${encodeURIComponent(newServer)}/`;
    }
    window.history.pushState({}, document.title, newPathname);
    const { servers = [] } = this.state;
    const apiServer = servers.find((thisServer) => thisServer.serverUrl === newServer) || {};
    if (apiServer.hasToken) {
      window.location.reload();
    } else {
      this.setState({ apiServer });
    }
  }

  onAddServer(newServerUrl) {
    const serverUrl = newServerUrl.replace(/^(.+?)\/*?$/, '$1');
    const { servers: prevServersList = [] } = this.state;
    const servers = [{ serverUrl }, ...prevServersList];
    this.setState({ servers });
    this.onUpdateCookie(servers);
  }

  onRemoveServer(serverUrl) {
    const { servers: prevServersList = [] } = this.state;
    const servers = prevServersList.filter((thisServer) => thisServer.serverUrl !== serverUrl);
    this.setState({ servers });
    this.onUpdateCookie(servers);
  }

  onUpdateCookie(servers) {
    const { cookies } = this.props;
    const serversCookie = encodeJsonCookie(servers);
    cookies.set(VIDISPINE_SERVERS, serversCookie, cookieOptions);
  }

  onLogin(values, form, callback = () => null) {
    const { userName, password, serverUrl } = values;
    callback();
    if (!userName || !password || !serverUrl) {
      callback({ password: 'Form Incomplete' });
      return;
    }
    UserApi.getToken({
      userName,
      queryParams: { seconds: 2592000, autoRefresh: 'true' },
      headers: { password, username: userName },
      baseURL: serverUrl,
    })
      .then(({ data: token }) => {
        const apiServer = { serverUrl, userName, hasToken: true };
        const { cookies, serverUrl: defaultServerUrl } = this.props;
        cookies.set(VIDISPINE_TOKEN, token, {
          ...cookieOptions,
          path: defaultServerUrl
            ? '/'
            : `${basename.replace(/\/+$/, '')}/server/${encodeURIComponent(serverUrl)}`,
        });
        const { servers: prevServersList = [] } = this.state;
        const servers = [...prevServersList];
        const serverIdx = servers.findIndex((thisServer) => thisServer.serverUrl === serverUrl);
        if (serverIdx > -1) {
          const prevServer = servers[serverIdx];
          servers[serverIdx] = { ...prevServer, ...apiServer };
        } else {
          servers.push(apiServer);
        }
        this.onUpdateCookie(servers);
        this.setState({ token, servers, apiServer });
      })
      .catch(() => {
        NoAuthApi.getSelfTest({ baseURL: serverUrl })
          .then(() => callback({ password: 'Incorrect Username/Password' }))
          .catch(() => callback({ password: 'Offline or CORS not configured' }));
      });
  }

  onLogout() {
    const { cookies, serverUrl: defaultServerUrl } = this.props;
    const { apiServer, servers: prevServersList = [] } = this.state;
    const { serverUrl } = apiServer;
    cookies.remove(VIDISPINE_TOKEN, {
      ...cookieOptions,
      path: defaultServerUrl
        ? '/'
        : `${basename.replace(/\/+$/, '')}/server/${encodeURIComponent(serverUrl)}`,
    });
    this.setState({ token: undefined });
    const servers = [...prevServersList];
    const serverIdx = servers.findIndex((thisServer) => thisServer.serverUrl === serverUrl);
    if (serverIdx > -1) {
      const prevServer = servers[serverIdx];
      servers[serverIdx] = { ...prevServer, hasToken: false };
      this.setState({ servers });
      this.onUpdateCookie(servers);
    }
    this.onUpdateCookie(servers);
  }

  render() {
    const { serverUrl: defaultServerUrl } = this.props;
    const { apiServer = {}, servers = [], token } = this.state;
    const { userName, serverUrl } = apiServer;
    const serverList = servers.map((server) => server.serverUrl);
    const {
      AppComponent,
      AppProps = {},
      LoginComponent,
      LoginProps = {},
      AppTitleComponent,
    } = this.props;
    const routerBasename = defaultServerUrl
      ? '/'
      : `${basename.replace(/\/+$/, '')}/server/${encodeURIComponent(serverUrl)}`;
    return serverUrl ? (
      <>
        {token ? (
          <Router basename={routerBasename}>
            <VidispineApi token={token} username={userName} serverUrl={serverUrl}>
              <AppComponent
                onLogout={this.onLogout}
                AppTitleComponent={AppTitleComponent}
                onLogin={this.onLogin}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...AppProps}
              />
            </VidispineApi>
          </Router>
        ) : (
          <LoginComponent
            AppTitleComponent={AppTitleComponent}
            userName={userName}
            serverUrl={serverUrl}
            onBack={defaultServerUrl ? undefined : this.onChangeServer}
            onLogin={this.onLogin}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...LoginProps}
          />
        )}
      </>
    ) : (
      <ServerList
        AppTitleComponent={AppTitleComponent}
        onClickServer={this.onChangeServer}
        onAddServer={this.onAddServer}
        onRemoveServer={this.onRemoveServer}
        serverList={serverList}
      />
    );
  }
}

export default withCookies(ServerListRoute);
