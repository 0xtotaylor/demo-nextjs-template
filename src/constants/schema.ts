export const verticSchema = {
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
        operationId: "topTweets",
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
            description: "The text query for searching users",
          },
        ],
        description:
          "This endpoint searches for Facebook users based on the provided text query.",
        operationId: "searchFacebookUsers",
      },
    },
  },
};
