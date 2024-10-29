export const verticSchema = {
  openapi: "3.0.0",
  servers: [
    {
      url: "{baseUrl}",
      variables: {
        baseUrl: {
          default: "https://api.skyfire.xyz/v1/receivers/vetric",
        },
      },
    },
  ],
  paths: {
    "/twitter/top": {
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
    "/linkedin/people-search": {
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
  },
};
