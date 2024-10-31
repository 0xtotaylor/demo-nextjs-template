export const vetricSchema = {
  openapi: "3.0.0",
  servers: [
    {
      url: "{baseUrl}",
      variables: {
        baseUrl: {
          default: "https://api-qa.skyfire.xyz",
        },
      },
    },
  ],
  paths: {
    "/v1/receivers/vetric/twitter/top": {
      get: {
        deprecated: false,
        parameters: [
          {
            name: "query",
            in: "query",
            required: true,
            schema: {
              type: "string",
            },
            description: "The search query for retrieving top tweets",
          },
        ],
        description:
          "This endpoint retrieves the top results for a given query, making it ideal for finding the most popular tweets related to a specific keyword or topic.",
        operationId: "topTweets",
      },
    },
    "/v1/receivers/vetric/linkedin/people-search": {
      get: {
        deprecated: false,
        parameters: [
          {
            name: "query",
            in: "query",
            required: true,
            schema: {
              type: "string",
            },
            description: "The search query for retrieving top tweets",
          },
        ],
        description:
          "This endpoint retrieves the top results for a given query, making it ideal for finding the most popular tweets related to a specific keyword or topic.",
        operationId: "linkedinPeopleSearch",
      },
    },
    "/v1/receivers/vetric/instagram/people-search": {
      get: {
        deprecated: false,
        parameters: [
          {
            name: "query",
            in: "query",
            required: true,
            schema: {
              type: "string",
            },
            description: "The search query for retrieving Instagram profile",
          },
        ],
        description:
          "This endpoint returns Instagram users based on a specified search query.",
        operationId: "instagramPeopleSearch",
      },
    },
    "/proxy/vetric-facebook/facebook/v1/search/users": {
      post: {
        deprecated: false,
        parameters: [
          {
            name: "typed_query",
            in: "query",
            required: true,
            schema: {
              type: "string",
            },
            description: "The text query for searching users.",
          },
        ],
        description:
          "This endpoint retrieves the top results for a given query, making it ideal for finding the most popular tweets related to a specific keyword or topic.",
        operationId: "searchFacebookUsers",
      },
    },
  },
}
