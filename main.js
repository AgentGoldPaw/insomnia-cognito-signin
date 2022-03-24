// For help writing plugins, visit the documentation to get started:
//   https://support.insomnia.rest/article/26-plugins

// TODO: Add plugin code here...

const { Amplify } = require("@aws-amplify/core");
const { Auth } = require("@aws-amplify/auth");
const isSignedIn =  async function () {
  try {
    await Auth.currentSession();
    return true
  } catch (error) {
    return false
  }
}


const run = async (
  context,
  Username,
  Password,
  Region,
  ClientId,
  UserPoolId,
  TokenType,
  IdentityId
) => {
  if (!Username) {
    throw new Error("Username attribute is required");
  }
  if (!Password) {
    throw new Error("Password attribute is required");
  }
  if (!Region) {
    throw new Error("Region attribute is required");
  }
  if (!ClientId) {
    throw new Error("ClientId attribute is required");
  }

  if (!UserPoolId) {
    throw new Error("Invalid User PoolId");
  }

  if (!TokenType) {
    TokenType = "access";
  }

  const configObject = {
    Auth: {
      region: Region,
      identityPoolRegion: Region,
      userPoolId: UserPoolId,
      userPoolWebClientId: ClientId,
    },
  };

  if (IdentityId && IdentityId.length > 0) {
    configObject.Auth.identityPoolId = IdentityId;
  }

  Amplify.configure(configObject);
  await Auth.signOut()
  try {
    if (!(await isSignedIn())) {
      const response = await Auth.signIn(Username, Password);
      console.log(response);
      console.log("signed-in")
    }
    try {
      const session = await Auth.currentSession();
      console.log(session)
      let jwt;
      if (TokenType === "id") {
        console.log("id")
        jwt = session.getIdToken().getJwtToken();
      } else {
        jwt = session.accessIdToken().getJwtToken();
      }
      return `Bearer ${jwt}`;
    } catch (error) {
      throw new Error(error.code)
    }
  } catch (error) {
    if (
      error.code === "NotAuthorizedException" ||
      error.code === "UserNotFoundException"
    ) {
      throw new Error("Invalud username or password");
    }
    throw new Error(error)
  }
};

module.exports.templateTags = module.exports.templateTags = [
  {
    name: "AWSCognitoJWT",
    displayName: "AWSCognitJWT",
    description: "Plugin for Insomnia to provide Cognito JWT token from AWS",
    args: [
      {
        displayName: "Username",
        type: "string",
        validate: (arg) => (arg ? "" : "Required"),
      },
      {
        displayName: "Password",
        type: "string",
        validate: (arg) => (arg ? "" : "Required"),
      },
      {
        displayName: "Region",
        type: "string",
        validate: (arg) => (arg ? "" : "Required"),
      },
      {
        displayName: "ClientId",
        type: "string",
        validate: (arg) => (arg ? "" : "Required"),
      },
      {
        displayName: "UserPoolId",
        type: "string",
        validate: (arg) => (arg ? "" : "Required"),
      },
      {
        displayName: "TokenType",
        type: "enum",
        defaultValue: "access",
        options: [
          {
            displayName: "access",
            value: "access",
          },
          {
            displayName: "id",
            value: "id",
          },
          {
            displayName: "Raw Request",
            value: "raw_request",
          },
        ],
      },
      {
        displayName: "IdentityId",
        type: "string",
      },
    ],
    run,
  },
];
