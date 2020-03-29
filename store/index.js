import {
  FeathersVuex,
  initAuth,
  hydrateApi,
  makeAuthPlugin,
  models
} from "../plugins/feathers-client";
import Vuex from "vuex";
import Vue from "vue";
Vue.use(Vuex);

// AWS Cognito
import Amplify from 'aws-amplify'

Amplify.configure({
    Auth: {

        // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
        identityPoolId: 'us-east-2:e2338de4-6c26-464d-a1f8-bea30907b715',

        // REQUIRED - Amazon Cognito Region
        region: 'us-east-2',

        // OPTIONAL - Amazon Cognito Federated Identity Pool Region
        // Required only if it's different from Amazon Cognito Region
        identityPoolRegion: 'us-east-2',

        // OPTIONAL - Amazon Cognito User Pool ID
        userPoolId: 'us-east-2_AGCA6XBTP',

        // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
        userPoolWebClientId: '6kf592aqhqdjqvgvnpd9boq07d',

        authenticationFlowType: 'USER_PASSWORD_AUTH',

    },
    API: {
        endpoints: [
            {
                name: "dev-covid19-et",
                endpoint: "https://ethiopia-covid19.auth.us-east-2.amazoncognito.com",
            },
        ]
    }
})


const requireModule = require.context(
  // The path where the service modules live
  "../services",
  // Whether to look in subfolders
  false,
  // Only include .js files (prevents duplicate imports`)
  /.js$/
);
const servicePlugins = requireModule
  .keys()
  .map(modulePath => requireModule(modulePath).default);

export const modules = {
  // Custom modules
};

export const state = () => ({
  // Custom state
  user: null,
});

const user = new Vuex.Store({
  state: {
    user: null,
  },
  mutations: {
    setUser(state, user) {
      console.log("set user index.js")
      state.user = user
    }
  },
  getters: {
    currentUser() {
      return state.user
    }
  }
})

export const mutations = {
  // Custom mutations
  setUser(state, user) {
    console.log("set user index.js")
    state.user = user
  }
};

export const actions = {
  // Custom actions
  nuxtServerInit({ commit, dispatch }, { req }) {
    return initAuth({
      commit,
      dispatch,
      req,
      moduleName: "auth",
      cookieName: "feathers-jwt"
    });
  },
  nuxtClientInit({ state, dispatch, commit }, context) {
    hydrateApi({ api: models.api });
    if (state.auth.accessToken) {
      return dispatch("auth/onInitAuth", state.auth.payload);
    }
  }
};

export const getters = {
  // Custom getters
  currentUser() {
    return state.user
  }
};

const oldAuth = makeAuthPlugin({
  userService: "admins",
  state: {
    publicPages: ["login", "index"]
  },
  actions: {
    // Handles initial authentication
    onInitAuth({ state, dispatch }, payload) {
      if (payload) {
        dispatch("authenticate", {
          strategy: "jwt",
          accessToken: state.accessToken
        })
          .then(result => {
            // handle success like a boss
            console.log("logged in");
          })
          .catch(error => {
            // handle error like a boss
            console.log("logged out");
            console.log(error, "payload", payload);
          });
      }
    }
  }
});

export const plugins = [...servicePlugins, oldAuth];
