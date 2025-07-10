TITLE: Running Project Locally with npm and Convex Dev
DESCRIPTION: This snippet outlines the steps to set up and run the project locally. It involves installing dependencies in both the root and example directories, and then starting the Convex development server for local development.
SOURCE: https://github.com/get-convex/agent/blob/main/CONTRIBUTING.md#_snippet_0

LANGUAGE: sh
CODE:

```
npm i
cd example
npm i
npx convex dev
```

---

TITLE: Testing Project Components with npm Scripts
DESCRIPTION: This snippet details the testing workflow for the project. It includes cleaning the build directory, rebuilding the project, running type checks, executing tests, and linting the example application to ensure code quality.
SOURCE: https://github.com/get-convex/agent/blob/main/CONTRIBUTING.md#_snippet_1

LANGUAGE: sh
CODE:

```
rm -rf dist/ && npm run build
npm run typecheck
npm run test
cd example
npm run lint
cd ..
```

---

TITLE: Building a One-Off npm Package
DESCRIPTION: This snippet demonstrates how to create a single, distributable npm package for the project. It involves cleaning the build directory, rebuilding the project, and then packaging it into a `.tgz` file suitable for distribution.
SOURCE: https://github.com/get-convex/agent/blob/main/CONTRIBUTING.md#_snippet_2

LANGUAGE: sh
CODE:

```
rm -rf dist/ && npm run build
npm pack
```

---

TITLE: Deploying a New Version with npm and Git
DESCRIPTION: This snippet outlines the standard process for deploying a new version of the package. It includes updating the version number, performing a dry run publish for verification, publishing the package to npm, and pushing Git tags for version control.
SOURCE: https://github.com/get-convex/agent/blob/main/CONTRIBUTING.md#_snippet_3

LANGUAGE: sh
CODE:

```
# this will change the version and commit it (if you run it in the root directory)
npm version patch
npm publish --dry-run
# sanity check files being included
npm publish
git push --tags
```

---

TITLE: Publishing an Alpha Release with npm
DESCRIPTION: This snippet shows how to publish a pre-release (alpha) version of the package. It involves setting the version to a prerelease identifier and publishing with the 'alpha' tag, allowing early access to new features.
SOURCE: https://github.com/get-convex/agent/blob/main/CONTRIBUTING.md#_snippet_4

LANGUAGE: sh
CODE:

```
npm version prerelease --preid alpha
npm publish --tag alpha
```

---

TITLE: Run Convex Agent Examples
DESCRIPTION: This command allows you to run the provided examples for the Convex Agent component after cloning the repository. It's a quick way to explore its functionalities.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_0

LANGUAGE: sh
CODE:

```
npm run example
```

---

TITLE: Convex Agent Core Usage: Define, Create, and Continue Threads
DESCRIPTION: This TypeScript example demonstrates the fundamental usage of the Convex Agent component. It covers defining an AI agent with instructions and tools, initiating a new chat thread with a user prompt, and continuing an existing thread while automatically preserving message history. It showcases integration with OpenAI models and Convex actions.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_1

LANGUAGE: ts
CODE:

```
// Define an agent similarly to the AI SDK
const supportAgent = new Agent(components.agent, {
  chat: openai.chat("gpt-4o-mini"),
  textEmbedding: openai.embedding("text-embedding-3-small"),
  instructions: "You are a helpful assistant.",
  tools: { accountLookup, fileTicket, sendEmail },
});

// Use the agent from within a normal action:
export const createThreadAndPrompt = action({
  args: { prompt: v.string() },
  handler: async (ctx, { prompt }) => {
    const userId = await getUserId(ctx);
    // Start a new thread for the user.
    const { threadId, thread } = await supportAgent.createThread(ctx, { userId});
    // Creates a user message with the prompt, and an assistant reply message.
    const result = await thread.generateText({ prompt });
    return { threadId, text: result.text };
  },
});

// Pick up where you left off, with the same or a different agent:
export const continueThread = action({
  args: { prompt: v.string(), threadId: v.string() },
  handler: async (ctx, { prompt, threadId }) => {
    // Continue a thread, picking up where you left off.
    const { thread } = await anotherAgent.continueThread(ctx, { threadId });
    // This includes previous message history from the thread automatically.
    const result = await thread.generateText({ prompt });
    return result.text;
  },
});
```

---

TITLE: Install Convex Agent Component Package
DESCRIPTION: This command installs the `@convex-dev/agent` npm package, which is the primary dependency for integrating the Convex Agent component into your Convex project. It's the first step in setting up the component.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_2

LANGUAGE: sh
CODE:

```
npm install @convex-dev/agent
```

---

TITLE: Configure Convex Agent Component in convex.config.ts
DESCRIPTION: This TypeScript snippet demonstrates how to integrate the `@convex-dev/agent` component into your Convex application. By importing the agent's configuration and using it with `app.use()`, you make the component's functionalities available within your Convex backend.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_3

LANGUAGE: ts
CODE:

```
// convex/convex.config.ts
import { defineApp } from "convex/server";
import agent from "@convex-dev/agent/convex.config";

const app = defineApp();
app.use(agent);

export default app;
```

---

TITLE: Initialize Convex AI Agent
DESCRIPTION: Configures an AI agent using `@convex-dev/agent`, specifying the chat model, default instructions, and integrating both Convex-specific and standard AI SDK tools. It also covers embedding models, context, storage options, and retry limits.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_4

LANGUAGE: ts
CODE:

```
import { tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { Agent, createTool } from "@convex-dev/agent";
import { components } from "./_generated/api";

// Define an agent similarly to the AI SDK
const supportAgent = new Agent(components.agent, {
  // The chat completions model to use for the agent.
  chat: openai.chat("gpt-4o-mini"),
  // The default system prompt if not overriden.
  instructions: "You are a helpful assistant.",
  tools: {
    // Convex tool
    myConvexTool: createTool({
      description: "My Convex tool",
      args: z.object({...}),
      // Note: annotate the return type of the handler to avoid type cycles.
      handler: async (ctx, args): Promise<string> => {
        return "Hello, world!";
      },
    }),
    // Standard AI SDK tool
    myTool: tool({ description, parameters, execute: () => {}}),
  },
  // Embedding model to power vector search of message history (RAG).
  textEmbedding: openai.embedding("text-embedding-3-small"),
  // Used for fetching context messages. See [below](#configuring-the-context-of-messages)
  contextOptions,
  // Used for storing messages. See [below](#configuring-the-storage-of-messages)
  storageOptions,
  // Used for limiting the number of steps when tool calls are involved.
  // NOTE: if you want tool calls to happen automatically with a single call,
  // you need to set this to something greater than 1 (the default).
  maxSteps: 1,
  // Used for limiting the number of retries when a tool call fails. Default: 3.
  maxRetries: 3,
  // Used for tracking token usage. See [below](#tracking-token-usage)
  usageHandler: async (ctx, { model, usage }) => {
    // ... log, save usage to your database, etc.
  },
});
```

---

TITLE: Start New Agent Thread in Convex Mutation
DESCRIPTION: Demonstrates how to create a new conversation thread with the AI agent from within a Convex mutation. This allows associating the thread with a user ID for persistent message history and future retrieval.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_5

LANGUAGE: ts
CODE:

```
// Use the agent from within a normal action:
export const createThread = mutation({
  args: {},
  handler: async (ctx): Promise<{ threadId: string }> => {
    const userId = await getUserId(ctx);
    // Start a new thread for the user.
    const { threadId } = await supportAgent.createThread(ctx, { userId });
    return { threadId };
  },
});
```

---

TITLE: Continue Existing Agent Thread in Convex Action
DESCRIPTION: Illustrates how to resume an ongoing AI agent conversation thread from a Convex action. It enables the agent to access and build upon previous message history, facilitating continuous dialogue and context-aware responses.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_6

LANGUAGE: ts
CODE:

```
// Pick up where you left off:
export const continueThread = action({
  args: { prompt: v.string(), threadId: v.string() },
  handler: async (ctx, { prompt, threadId }): Promise<string> => {
    await authorizeThreadAccess(ctx, threadId);
    // This includes previous message history from the thread automatically.
+   const { thread } = await supportAgent.continueThread(ctx, { threadId });
    const result = await thread.generateText({ prompt });
    return result.text;
  },
});
```

---

TITLE: Generate Text with Agent Thread
DESCRIPTION: Shows how to use the agent's thread to generate natural language text. It automatically utilizes the agent's pre-configured chat model, simplifying the process of obtaining AI-generated responses.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_7

LANGUAGE: ts
CODE:

```
const { thread } = await supportAgent.createThread(ctx);
// OR
const { thread } = await supportAgent.continueThread(ctx, { threadId });

const result = await thread.generateText({ prompt });
```

---

TITLE: Generate Structured Object with Agent Thread
DESCRIPTION: Demonstrates generating a structured JSON object using the agent's thread and a Zod schema. This method leverages the agent's default chat model to produce schema-validated output, similar to AI SDK's object generation.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_8

LANGUAGE: ts
CODE:

```
import { z } from "zod";

const result = await thread.generateObject({
  prompt: "Generate a plan based on the conversation so far",
  schema: z.object({...}),
});
```

---

TITLE: Fetch Thread Messages (Server-side)
DESCRIPTION: This server-side Convex query demonstrates how to retrieve messages for a specific thread. It utilizes `paginationOptsValidator` for paginated results and returns `MessageDoc` types, allowing for further filtering or modification of documents before returning.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_9

LANGUAGE: ts
CODE:

```
import type { MessageDoc } from "@convex-dev/agent";
import { paginationOptsValidator, type PaginationResult } from "convex/server";

export const listThreadMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    //... other arguments you want
  },
  handler: async (
    ctx, { threadId, paginationOpts },
  ): PaginationResult<MessageDoc> => {
    // await authorizeThreadAccess(ctx, threadId);
    const paginated = await agent.listMessages(ctx, {
      threadId,
      paginationOpts,
    });
    // Here you could filter out / modify the documents
    return paginated;
  }
});
```

---

TITLE: Display Thread Messages (Client-side)
DESCRIPTION: This client-side React component illustrates how to fetch and display thread messages using the `@convex-dev/agent/react` hooks. It uses `useThreadMessages` to retrieve paginated messages and `toUIMessages` to convert them into a format suitable for UI rendering.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_10

LANGUAGE: tsx
CODE:

```
import { api } from "../convex/_generated/api";
import { useThreadMessages, toUIMessages } from "@convex-dev/agent/react";

function MyComponent({ threadId }: { threadId: string }) {
  const messages = useThreadMessages(
    api.chatBasic.listThreadMessages,
    { threadId },
    { initialNumItems: 10 }
  );
  return (
    <div>
      {toUIMessages(messages.results ?? []).map((message) => (
        <div key={message.key}>{message.content}</div>
      ))}
    </div>
  );
}
```

---

TITLE: Configure Message Generation Context
DESCRIPTION: This configuration snippet demonstrates how to customize the historical context provided to the LLM during message generation via `contextOptions`. It allows control over excluding tool messages, including recent messages, and configuring search options (limit, text/vector search, message range) and cross-thread searching.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_11

LANGUAGE: ts
CODE:

```
const result = await thread.generateText({ prompt }, {
  // Values shown are the defaults.
  contextOptions: {
    // Whether to exclude tool messages in the context.
    excludeToolMessages: true,
    // How many recent messages to include. These are added after the search
    // messages, and do not count against the search limit.
    recentMessages: 100,
    // Options for searching messages via text and/or vector search.
    searchOptions: {
      limit: 10, // The maximum number of messages to fetch.
      textSearch: false, // Whether to use text search to find messages.
      vectorSearch: false, // Whether to use vector search to find messages.
      // Note, this is after the limit is applied.
      // E.g. this will quadruple the number of messages fetched.
      // (two before, and one after each message found in the search)
      messageRange: { before: 2, after: 1 }
    },
    // Whether to search across other threads for relevant messages.
    // By default, only the current thread is searched.
    searchOtherThreads: false
  }
});
```

---

TITLE: Configure Message Storage Options
DESCRIPTION: This example illustrates how to control the saving behavior of input and output messages using `storageOptions` during text generation. It provides options to save all messages, no messages, or only the prompt and output messages, useful for scenarios where only specific messages need to be persisted.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_12

LANGUAGE: ts
CODE:

```
const result = await thread.generateText({ messages }, {
  storageOptions: {
    saveMessages: "all" | "none" | "promptAndOutput";
  }
});
```

---

TITLE: Creating a Convex Agent Tool using createTool
DESCRIPTION: Demonstrates how to create a tool with access to the Convex context using the `createTool` wrapper. The handler function receives a context object (`ctx`) with properties like `userId`, `threadId`, `messageId`, `runQuery`, `runMutation`, and `runAction`, enabling interaction with Convex backend functions.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_13

LANGUAGE: ts
CODE:

```
export const ideaSearch = createTool({
  description: "Search for ideas in the database",
  args: z.object({ query: z.string() }),
  handler: async (ctx, args): Promise<Array<Idea>> => {
    // ctx has userId, threadId, messageId, runQuery, runMutation, and runAction
    const ideas = await ctx.runQuery(api.ideas.searchIdeas, { query: args.query });
    console.log("found ideas", ideas);
    return ideas;
  },
});
```

---

TITLE: Defining Convex Agent Tools at Runtime
DESCRIPTION: Illustrates how to define tools dynamically within a specific context, allowing for the injection of variables like `teamId`. This method uses the AI SDK's `tool` function directly, providing flexibility for tool creation based on runtime conditions.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_14

LANGUAGE: ts
CODE:

```
async function createTool(ctx: ActionCtx, teamId: Id<"teams">) {
  const myTool = tool({
    description: "My tool",
    parameters: z.object({...}),
    execute: async (args, options) => {
      return await ctx.runQuery(internal.foo.bar, args);
    },
  });
}
```

---

TITLE: Convex Agent Tool Provisioning Options
DESCRIPTION: Describes the various points at which tools can be provided to a Convex Agent, including during agent construction, thread creation, thread continuation, and within thread functions. It also clarifies the hierarchy for tool resolution, where more specific tool definitions overwrite defaults.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_15

LANGUAGE: APIDOC
CODE:

```
Agent Constructor: new Agent(components.agent, { tools: {...} })
Creating a Thread: createThread(ctx, { tools: {...} })
Continuing a Thread: continueThread(ctx, { tools: {...} })
On Thread Functions: thread.generateText({ tools: {...} })
Outside of a Thread: supportAgent.generateText(ctx, {}, { tools: {...} })

Tool Resolution Order: args.tools ?? thread.tools ?? agent.options.tools
```

---

TITLE: Saving Messages in Convex Mutation for Asynchronous Generation
DESCRIPTION: Demonstrates a Convex mutation (`sendMessage`) that saves a user's prompt message. It sets up optimistic UI updates and then schedules an asynchronous action (`myAsyncAction`) to handle further processing, such as embedding generation, after the message is saved.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_16

LANGUAGE: ts
CODE:

```
export const sendMessage = mutation({
  args: { threadId: v.id("threads"), prompt: v.string() },
  handler: async (ctx, { threadId, prompt }) => {
    const userId = await getUserId(ctx);
    const { messageId } = await agent.saveMessage(ctx, {
      threadId, userId, prompt,
      skipEmbeddings: true,
    });
    await ctx.scheduler.runAfter(0, internal.example.myAsyncAction, {
      threadId, promptMessageId: messageId,
    });
  }
});
```

---

TITLE: Asynchronous Message Processing and Embedding Generation in Convex
DESCRIPTION: Presents an internal action (`myAsyncAction`) designed to be run asynchronously. This action is responsible for generating and saving embeddings for a specified prompt message and then continuing the agent's thread, enabling background processing after initial message saving.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_17

LANGUAGE: ts
CODE:

```
export const myAsyncAction = internalAction({
  args: { threadId: v.string(), promptMessageId: v.string() },
  handler: async (ctx, { threadId, promptMessageId }) => {
    // Generate embeddings for the prompt message
    await supportAgent.generateAndSaveEmbeddings(ctx, { messageIds: [promptMessageId] });
    const { thread } = await supportAgent.continueThread(ctx, { threadId });
    await thread.generateText({ promptMessageId });
  },
});
```

---

TITLE: Fetching Context Messages for Convex Agent
DESCRIPTION: Illustrates how to manually fetch messages for a user and/or thread using `supportAgent.fetchContextMessages`. This function accepts `ContextOptions` to filter messages (e.g., `excludeToolMessages`, `searchOptions`) and can fetch messages before a specific `messageId`.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_18

LANGUAGE: ts
CODE:

```
import type { MessageDoc } from "@convex-dev/agent";

const messages: MessageDoc[] = await supportAgent.fetchContextMessages(ctx, {
  threadId, messages: [{ role, content }], contextOptions
});
```

---

TITLE: Listing Convex Agent Threads by User ID
DESCRIPTION: Provides an example of how to query and retrieve a list of threads associated with a specific user ID. It demonstrates the use of `ctx.runQuery` with pagination options for efficient data retrieval.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_19

LANGUAGE: ts
CODE:

```
const threads = await ctx.runQuery(components.agent.threads.listThreadsByUserId, {
  userId,
  order: "desc",
  paginationOpts: { cursor: null, numItems: 10 }
});
```

---

TITLE: Retrieving a Convex Agent Thread by ID
DESCRIPTION: Shows a simple method to fetch a single thread document using its unique identifier (`threadId`) via `ctx.runQuery`.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_20

LANGUAGE: ts
CODE:

```
const thread = await ctx.runQuery(components.agent.threads.getThread, {
  threadId,
});
```

---

TITLE: Updating Convex Agent Thread Metadata
DESCRIPTION: Demonstrates how to modify the metadata of an existing thread, such as its `title`, `summary`, or `status`, by using `ctx.runMutation`.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_21

LANGUAGE: ts
CODE:

```
await ctx.runMutation(components.agent.threads.updateThread, {
  threadId,
  { title, summary, status }
});
```

---

TITLE: Convex Agent Playground UI Usage
DESCRIPTION: Provides instructions and resources for using the Playground UI, a tool for testing, debugging, and developing with the Convex Agent. It includes links to configuration guides, the hosted version, and a command for local execution.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_22

LANGUAGE: APIDOC
CODE:

```
Configuration: Refer to ./playground/README.md
Hosted Version: https://get-convex.github.io/agent/
Local Run Command: npx @convex-dev/agent-playground
```

---

TITLE: Exposing Convex Agent Capabilities as Actions
DESCRIPTION: Demonstrates how to expose various functionalities of the Convex Agent, such as creating threads, generating text, generating structured objects, and saving messages, as Convex actions or mutations for use in workflows or standalone operations.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_23

LANGUAGE: ts
CODE:

```
export const createThread = supportAgent.createThreadMutation();
```

LANGUAGE: ts
CODE:

```
export const getSupport = supportAgent.asTextAction({
  maxSteps: 10,
});
```

LANGUAGE: ts
CODE:

```
export const getStructuredSupport = supportAgent.asObjectAction({
  schema: z.object({
    analysis: z.string().describe("A detailed analysis of the user's request."),
    suggestion: z.string().describe("A suggested action to take.")
  }),
});
```

LANGUAGE: ts
CODE:

```
export const saveMessages = supportAgent.asSaveMessagesMutation();
```

---

TITLE: Defining a Durable Workflow with Convex Agent Actions
DESCRIPTION: Illustrates how to define a durable workflow using the Convex Workflow component, integrating previously exposed Convex Agent actions. This workflow handles a support request by creating a thread, generating a text suggestion, extracting structured data, and sending a user message, ensuring resilience against failures.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_24

LANGUAGE: ts
CODE:

```
const workflow = new WorkflowManager(components.workflow);

export const supportAgentWorkflow = workflow.define({
  args: { prompt: v.string(), userId: v.string() },
  handler: async (step, { prompt, userId }) => {
    const { threadId } = await step.runMutation(internal.example.createThread, {
      userId, title: "Support Request",
    });
    const suggestion = await step.runAction(internal.example.getSupport, {
      threadId, userId, prompt,
    });
    const { object } = await step.runAction(internal.example.getStructuredSupport, {
      userId, message: suggestion,
    });
    await step.runMutation(internal.example.sendUserMessage, {
      userId, message: object.suggestion,
    });
  },
});
```

---

TITLE: Generate Text Directly (No Thread)
DESCRIPTION: Shows how to generate text using the Convex Agent directly, without needing to associate it with an existing thread. This is useful for one-off text generation tasks.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_25

LANGUAGE: ts
CODE:

```
const result = await supportAgent.generateText(ctx, { userId }, { prompt });
```

---

TITLE: Manually Save Messages to Database
DESCRIPTION: Provides an example of how to explicitly save messages to the database using the Convex Agent's `saveMessages` function. This allows for fine-grained control over message persistence, including associated metadata.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_26

LANGUAGE: ts
CODE:

```
const { lastMessageId, messageIds} = await agent.saveMessages(ctx, {
  threadId, userId,
  messages: [{ role, content }],
  metadata: [{ reasoning, usage, ... }] // See MessageWithMetadata type
});
```

---

TITLE: Generate Embeddings for Messages
DESCRIPTION: Demonstrates how to generate vector embeddings for a list of messages using the Convex Agent. These embeddings can be used for semantic search or other AI-driven features.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_27

LANGUAGE: ts
CODE:

```
const embeddings = await supportAgent.generateEmbeddings([
  { role: "user", content: "What is love?" },
]);
```

---

TITLE: Paginate and Query Embeddings
DESCRIPTION: Shows how to paginate and query existing vector embeddings stored in the Convex database. This is useful for retrieving batches of embeddings, for example, during migrations or analysis.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_28

LANGUAGE: ts
CODE:

```
const messages = await ctx.runQuery(
  components.agent.vector.index.paginate,
  { vectorDimension: 1536, cursor: null, limit: 10 }
);
```

---

TITLE: Update Batch of Embeddings
DESCRIPTION: Illustrates how to update a batch of existing vector embeddings in the Convex database. This is particularly useful when migrating to a new embedding model or updating embedding values.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_29

LANGUAGE: ts
CODE:

```
const messages = await ctx.runQuery(components.agent.vector.index.updateBatch, {
  vectors: [
    { model: "gpt-4o-mini", vector: embedding, id: msg.embeddingId },
  ],
});
```

---

TITLE: Delete Batch of Embeddings
DESCRIPTION: Provides an example of how to delete a batch of vector embeddings from the Convex database by their IDs. This is useful for cleanup or managing data lifecycle.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_30

LANGUAGE: ts
CODE:

```
await ctx.runMutation(components.agent.vector.index.deleteBatch, {
  ids: [embeddingId1, embeddingId2],
});
```

---

TITLE: Insert Batch of Embeddings
DESCRIPTION: Demonstrates how to insert a batch of new vector embeddings into the Convex database. This includes specifying the vector dimension and optional metadata like `messageId` for linking.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_31

LANGUAGE: ts
CODE:

```
const ids = await ctx.runMutation(
  components.agent.vector.index.insertBatch, {
    vectorDimension: 1536,
    vectors: [
      {
        model: "gpt-4o-mini",
        table: "messages",
        userId: "123",
        threadId: "123",
        vector: embedding,
        // Optional, if you want to update the message with the embeddingId
        messageId: messageId,
      },
    ],
  }
);
```

---

TITLE: Install Convex Agent Package
DESCRIPTION: Provides the command to install the `@convex-dev/agent` package using npm, which is required to use the Convex Agent functionalities.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_32

LANGUAGE: sh
CODE:

```
npm i @convex-dev/agent
```

---

TITLE: Track Agent Token Usage with usageHandler
DESCRIPTION: Demonstrates how to provide a `usageHandler` to the Agent constructor to track token usage. The handler receives details like `userId`, `threadId`, `agentName`, `model`, `provider`, and `usage` for logging or saving to a database.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_33

LANGUAGE: ts
CODE:

```
const supportAgent = new Agent(components.agent, {
  ...
  usageHandler: async (ctx, args) => {
    const {
      // Who used the tokens
      userId, threadId, agentName,
      // What LLM was used
      model, provider,
      // How many tokens were used (extra info is available in providerMetadata)
      usage, providerMetadata
    } = args;
    // ... log, save usage to your database, etc.
  },
});
```

---

TITLE: Log Raw LLM Requests and Responses with rawRequestResponseHandler
DESCRIPTION: Illustrates how to configure a `rawRequestResponseHandler` for the Agent to log the raw request and response payloads from the LLM. This can be used for debugging, logging to a table, or streaming to external services.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_34

LANGUAGE: ts
CODE:

```
const supportAgent = new Agent(components.agent, {
  ...
  rawRequestResponseHandler: async (ctx, { request, response }) => {
    console.log("request", request);
    console.log("response", response);
  },
});
```

---

TITLE: Fix Circular Dependencies by Explicitly Typing Workflow and Function Returns
DESCRIPTION: Shows how to resolve circular dependencies in Convex functions by explicitly adding return types to `workflow.define` handlers and regular `action` handlers. This prevents issues arising from `internal.foo.bar` function references.
SOURCE: https://github.com/get-convex/agent/blob/main/README.md#_snippet_35

LANGUAGE: diff
CODE:

```
 export const supportAgentWorkflow = workflow.define({
   args: { prompt: v.string(), userId: v.string(), threadId: v.string() },
+  handler: async (step, { prompt, userId, threadId }): Promise<string> => {
     // ...
   },
 });

 // And regular functions too:
 export const myFunction = action({
   args: { prompt: v.string() },
+  handler: async (ctx, { prompt }): Promise<string> => {
     // ...
   },
 });
```

---

TITLE: Implement Basic RAG with Convex Agent
DESCRIPTION: This TypeScript snippet demonstrates a straightforward RAG implementation. It shows how to use `rag.search` to retrieve relevant context based on a user query and then incorporate that context directly into the prompt for text generation. This approach is suitable when context is consistently beneficial for user queries.
SOURCE: https://github.com/get-convex/agent/blob/main/example/convex/rag/README.md#_snippet_0

LANGUAGE: ts
CODE:

```
const { thread } = await agent.continueThread(ctx, { threadId });
const context = await rag.search(ctx, {
    namespace: "global",
    query: userPrompt,
    limit: 10,
    chunkContext: { before: 1, after: 1 }
});

const result = await thread.generateText({
    prompt: `# Context:\n\n ${context.text}\n\n---\n\n# Question:\n\n"""${rawPrompt}\n"""`
});
```

---

TITLE: Implement Tool-based RAG with Convex Agent
DESCRIPTION: This TypeScript snippet illustrates how to define a `searchContext` tool for an AI agent. In this advanced RAG approach, the agent dynamically decides when to invoke this tool to search for and retrieve context. The tool's handler uses `rag.search` to fetch information, enabling more intelligent and adaptive context retrieval during conversations.
SOURCE: https://github.com/get-convex/agent/blob/main/example/convex/rag/README.md#_snippet_1

LANGUAGE: ts
CODE:

```
searchContext: createTool({
  description: "Search for context related to this user prompt",
  args: z.object({ query: z.string().describe("Describe the context you're looking for") }),
    handler: async (ctx, { query }) => {
    const context = await rag.search(ctx, { namespace: userId, query });
    return context.text;
  }
})
```

---

TITLE: Run Convex RAG Examples
DESCRIPTION: This bash command executes the provided RAG examples, launching a demo user interface. The UI includes an interactive chat, context management features, the ability to browse document chunks in the RAG component, search result visualization, and real-time streaming responses.
SOURCE: https://github.com/get-convex/agent/blob/main/example/convex/rag/README.md#_snippet_2

LANGUAGE: bash
CODE:

```
npm run example
```

---

TITLE: Define Server-Side Query for Paginating Thread Messages in Convex
DESCRIPTION: This TypeScript code defines a Convex query `listThreadMessages` that retrieves paginated messages for a given `threadId`. It uses `paginationOptsValidator` for robust pagination and `agent.listMessages` to fetch messages, allowing for optional filtering or modification of the documents before returning them.
SOURCE: https://github.com/get-convex/agent/blob/main/examples/chat-basic/README.md#_snippet_0

LANGUAGE: ts
CODE:

```
import { paginationOptsValidator } from "convex/server";

export const listThreadMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    //... other arguments you want
  },
  handler: async (
    ctx,
    { threadId, paginationOpts },
  ): PaginationResult<MessageDoc> => {
    // await authorizeThreadAccess(ctx, threadId);
    const paginated = await agent.listMessages(ctx, {
      threadId,
      paginationOpts,
    });
    // Here you could filter out / modify the documents
    return paginated;
  },
});
```

---

TITLE: Use `useThreadMessages` Hook for Client-Side Message Display in React
DESCRIPTION: This React TypeScript (TSX) component demonstrates how to use the `useThreadMessages` hook from `@convex-dev/agent/react` to fetch and display chat messages. It takes a `threadId`, calls the server-side `listThreadMessages` query, and renders the messages using `toUIMessages` for proper UI formatting.
SOURCE: https://github.com/get-convex/agent/blob/main/examples/chat-basic/README.md#_snippet_1

LANGUAGE: tsx
CODE:

```
import { api } from "../convex/_generated/api";
import { useThreadMessages, toUIMessages } from "@convex-dev/agent/react";

function MyComponent({ threadId }: { threadId: string }) {
  const messages = useThreadMessages(
    api.chatBasic.listThreadMessages,
    { threadId },
    { initialNumItems: 10 },
  );
  return (
    <div>
      {toUIMessages(messages.results ?? []).map((message) => (
        <div key={message.key}>{message.content}</div>
      ))}
    </div>
  );
}
```

---

TITLE: Implement Optimistic Updates for Sending Messages with `optimisticallySendMessage`
DESCRIPTION: This TypeScript snippet shows how to integrate `optimisticallySendMessage` with a Convex mutation. It wraps the `generateResponse` mutation, automatically inserting an ephemeral message into the message list until the server mutation completes, providing immediate UI feedback to the user.
SOURCE: https://github.com/get-convex/agent/blob/main/examples/chat-basic/README.md#_snippet_2

LANGUAGE: ts
CODE:

```
const sendMessage = useMutation(
  api.chatBasic.generateResponse,
).withOptimisticUpdate(
  optimisticallySendMessage(api.chatBasic.listThreadMessages),
);
```

---

TITLE: Custom Optimistic Update for Sending Messages with `optimisticallySendMessage`
DESCRIPTION: This TypeScript example demonstrates a more flexible use of `optimisticallySendMessage` within a custom optimistic update function. It allows mapping custom mutation arguments (e.g., `args`) to the `threadId` and `prompt` required by `optimisticallySendMessage`, which is useful when the mutation arguments don't directly match the expected signature.
SOURCE: https://github.com/get-convex/agent/blob/main/examples/chat-basic/README.md#_snippet_3

LANGUAGE: ts
CODE:

```
import { optimisticallySendMessage } from "@convex-dev/agent/react";

const sendMessage = useMutation(
  api.chatBasic.generateResponse,
).withOptimisticUpdate(
  (store, args) => {
    optimisticallySendMessage(api.chatBasic.listThreadMessages)(store, {
      threadId: /* get the threadId from your args / context */,
      prompt: /* change your args into the user prompt. */,
    })
  }
);
```

---

TITLE: Run Basic Chat Example Application
DESCRIPTION: These shell commands provide instructions on how to set up and run the basic chat example application. It involves navigating to the example directory, installing necessary dependencies, and starting the development server to launch the application.
SOURCE: https://github.com/get-convex/agent/blob/main/examples/chat-basic/README.md#_snippet_4

LANGUAGE: sh
CODE:

```
npm run setup
cd examples/chat-basic
npm i
npm run dev
```

---

TITLE: Convex Server Query for Streaming Chat Messages
DESCRIPTION: Defines a Convex query `listThreadMessages` that paginates over messages and integrates real-time streams using `syncStreams` from `@convex-dev/agent`. It accepts `threadId`, `paginationOpts`, and `streamArgs` to manage message retrieval and streaming deltas.
SOURCE: https://github.com/get-convex/agent/blob/main/examples/chat-streaming/README.md#_snippet_0

LANGUAGE: TypeScript
CODE:

```
import { paginationOptsValidator } from "convex/server";
import { vStreamArgs } from "@convex-dev/agent/react";

 export const listThreadMessages = query({
   args: {
     threadId: v.string(),
     paginationOpts: paginationOptsValidator,
     streamArgs: vStreamArgs,
     //... other arguments you want
   },
   handler: async (ctx, { threadId, paginationOpts, streamArgs }) => {
     // await authorizeThreadAccess(ctx, threadId);
     const paginated = await agent.listMessages(ctx, { threadId, paginationOpts });
     const streams = await agent.syncStreams(ctx, { threadId, streamArgs });
     // Here you could filter out / modify the documents & stream deltas.
     return { ...paginated, streams };
   },
 });
```

---

TITLE: React Hook for Consuming Streaming Thread Messages
DESCRIPTION: Illustrates the client-side usage of `useThreadMessages` from `@convex-dev/agent/react` to fetch and stream messages for a given `threadId`. The `stream: true` option enables real-time updates, allowing the component to react to incoming message deltas.
SOURCE: https://github.com/get-convex/agent/blob/main/examples/chat-streaming/README.md#_snippet_1

LANGUAGE: TypeScript
CODE:

```
import { useThreadMessages } from "@convex-dev/agent/react";

// in the component
  const messages = useThreadMessages(
    api.streaming.listThreadMessages,
    { threadId },
    { initialNumItems: 10, stream: true },
  );
```

---

TITLE: React Hook for Smoothing Streamed Text
DESCRIPTION: Shows how to use the `useSmoothText` hook from `@convex-dev/agent/react` to progressively display streamed text content, providing a smoother user experience. This hook can be configured for initial characters per second and adapts over time to match the incoming text speed.
SOURCE: https://github.com/get-convex/agent/blob/main/examples/chat-streaming/README.md#_snippet_2

LANGUAGE: TypeScript
CODE:

```
import { useSmoothText } from "@convex-dev/agent/react";

// in the component
  const [visibleText] = useSmoothText(message.content);
```

---

TITLE: Optimistic Update for Sending Messages (Direct Integration)
DESCRIPTION: Demonstrates using `optimisticallySendMessage` directly with `useMutation` to immediately display a sent message in the UI before the server mutation completes. This helper function automatically inserts the ephemeral message at the top of the specified query's message list.
SOURCE: https://github.com/get-convex/agent/blob/main/examples/chat-streaming/README.md#_snippet_3

LANGUAGE: TypeScript
CODE:

```
const sendMessage = useMutation(api.streaming.streamStoryAsynchronously)
  .withOptimisticUpdate(optimisticallySendMessage(api.streaming.listThreadMessages));
```

---

TITLE: Optimistic Update for Sending Messages (Custom Argument Mapping)
DESCRIPTION: Provides an example of integrating `optimisticallySendMessage` into a `useMutation`'s `withOptimisticUpdate` when the mutation arguments don't directly match the expected `{ threadId, prompt }` structure. It requires manually mapping the arguments within a custom optimistic update function.
SOURCE: https://github.com/get-convex/agent/blob/main/examples/chat-streaming/README.md#_snippet_4

LANGUAGE: TypeScript
CODE:

```
import { optimisticallySendMessage } from "@convex-dev/agent/react";

const sendMessage = useMutation(
  api.chatStreaming.streamStoryAsynchronously,
).withOptimisticUpdate(
  (store, args) => {
    optimisticallySendMessage(api.chatStreaming.listThreadMessages)(store, {
      threadId: /* get the threadId from your args / context */,
      prompt: /* change your args into the user prompt. */,
    })
  }
);
```

---

TITLE: Running the Streaming Chat Example Locally
DESCRIPTION: Instructions for setting up and running the streaming chat application example locally. This involves installing project dependencies and starting the development server to observe the streaming functionality.
SOURCE: https://github.com/get-convex/agent/blob/main/examples/chat-streaming/README.md#_snippet_5

LANGUAGE: Shell
CODE:

```
npm run setup
cd examples/chat-streaming
npm i
npm run dev
```

---

TITLE: Asynchronous Image/File Upload and LLM Response Generation in Convex
DESCRIPTION: Demonstrates the standard four-step process for handling images and files with `@convex-dev/agent`, involving initial file upload, sending a message with the file reference, asynchronously generating an LLM response, and querying thread messages. This approach optimizes client-side responsiveness with optimistic updates.
SOURCE: https://github.com/get-convex/agent/blob/main/examples/files-images/README.md#_snippet_0

LANGUAGE: ts
CODE:

```
    const { file } = await storeFile(
      ctx,
      components.agent,
      new Blob([bytes], { type: mimeType }),
      filename,
      sha256,
    );
    const { fileId, url, storageId } = file;
```

LANGUAGE: ts
CODE:

```
// in your mutation
    const { filePart, imagePart } = await getFile(
      ctx,
      components.agent,
      fileId,
    );
    const { messageId } = await fileAgent.saveMessage(ctx, {
      threadId,
      message: {
        role: "user",
        content: [
          imagePart ?? filePart, // if it's an image, prefer that kind.
          { type: "text", text: "What is this image?" }
        ],
      },
      metadata: { fileIds: [fileId] }, // IMPORTANT: this tracks the file usage.
    });
```

LANGUAGE: ts
CODE:

```
// in an action
await thread.generateText({ promptMessageId: messageId });
```

LANGUAGE: ts
CODE:

```
// in a query
const messages = await agent.listMessages(ctx, { threadId, paginationOpts });
```

---

TITLE: Inline Image/File Saving during LLM Text Generation in Convex
DESCRIPTION: Illustrates how to directly include image or file data within the `message` argument when calling `generateText` in a Convex action. This method automatically handles saving the file to storage if its size exceeds 64KB, associating a file ID with the message.
SOURCE: https://github.com/get-convex/agent/blob/main/examples/files-images/README.md#_snippet_1

LANGUAGE: ts
CODE:

```
await thread.generateText({
  message: {
    role: "user",
    content: [
      { type: "image", image: imageBytes, mimeType: "image/png" },
      { type: "text", text: "What is this image?" }
    ]
  }
});
```

---

TITLE: Passing Custom Stored File URLs to LLM for Image/File Processing
DESCRIPTION: Shows how to use a pre-stored file's URL directly in the `message` content when generating text with an LLM. This allows for integration with custom file storage solutions, leveraging Convex's `ctx.storage` to obtain public URLs.
SOURCE: https://github.com/get-convex/agent/blob/main/examples/files-images/README.md#_snippet_2

LANGUAGE: ts
CODE:

```
const storageId = await ctx.storage.store(blob)
const url = await ctx.storage.getUrl(storageId);

await thread.generateText({
  message: {
    role: "user",
    content: [
      { type: "image", data: url, mimeType: blob.type },
      { type: "text", text: "What is this image?" }
    ]
  }
});
```

---

TITLE: Generating and Saving Images with OpenAI DALL-E 2 via Convex Action
DESCRIPTION: Provides a command-line example demonstrating how to trigger an action in Convex (`filesImages:generateImageOneShot`) to generate an image using OpenAI's DALL-E 2 based on a given prompt, and then save the resulting image to a thread.
SOURCE: https://github.com/get-convex/agent/blob/main/examples/files-images/README.md#_snippet_3

LANGUAGE: sh
CODE:

```
npx convex run filesImages:generateImageOneShot '{prompt: "make a picture of a cat" }'
```

---

TITLE: Running the Convex Files and Images Example Locally
DESCRIPTION: Outlines the steps required to set up and run the Convex files and images example application locally, including installing dependencies and starting the development server. Notes the need for `ngrok` or similar for local development with public storage URLs.
SOURCE: https://github.com/get-convex/agent/blob/main/examples/files-images/README.md#_snippet_4

LANGUAGE: sh
CODE:

```
npm run setup
cd examples/chat-streaming
npm i
npm run dev
```

---

TITLE: Configure Fixed Window Rate Limiting for Messages
DESCRIPTION: Defines a fixed window rate limiting strategy for messages, allowing 1 message every 5 seconds per user with a burst capacity of 2 messages. This prevents spam and rapid-fire requests.
SOURCE: https://github.com/get-convex/agent/blob/main/examples/rate-limiting/README.md#_snippet_0

LANGUAGE: typescript
CODE:

```
sendMessage: { kind: "fixed window", period: 5 * SECOND, rate: 1, capacity: 2 }
```

---

TITLE: Configure Token Bucket Rate Limiting for Token Usage
DESCRIPTION: Defines a token bucket rate limiting strategy for token usage, allowing 1000 tokens per minute per user. This provides burst capacity while controlling overall usage and helps manage API costs for LLM calls.
SOURCE: https://github.com/get-convex/agent/blob/main/examples/rate-limiting/README.md#_snippet_1

LANGUAGE: typescript
CODE:

```
tokenUsage: { kind: "token bucket", period: 1 * MINUTE, rate: 1000 }
```

---

TITLE: Perform Pre-flight Rate Limit Checks
DESCRIPTION: Demonstrates how to check message frequency and estimated token usage before processing a request. It uses rateLimiter.limit for message frequency and rateLimiter.check for token usage, throwing an error if limits are exceeded.
SOURCE: https://github.com/get-convex/agent/blob/main/examples/rate-limiting/README.md#_snippet_2

LANGUAGE: typescript
CODE:

```
await rateLimiter.limit(ctx, "sendMessage", {
  key: userId,
  throws: true,
});
await rateLimiter.check(ctx, "tokenUsage", {
  key: userId,
  count: estimateTokens(args.question),
  throws: true,
});
```

---

TITLE: Track Token Usage After AI Response Generation
DESCRIPTION: Shows how to record actual token usage after the AI generates a response. The reserve: true option allows temporary negative balances, preventing future requests until the 'debt' is paid off.
SOURCE: https://github.com/get-convex/agent/blob/main/examples/rate-limiting/README.md#_snippet_3

LANGUAGE: typescript
CODE:

```
await rateLimiter.limit(ctx, "tokenUsage", {
  key: userId,
  count: usage.totalTokens,
  reserve: true,
});
```

---

TITLE: Estimate Tokens from Question Length
DESCRIPTION: A simple function to estimate tokens based on the length of the question, assuming roughly 4 characters per token. This is a basic example; production systems might require more sophisticated estimation.
SOURCE: https://github.com/get-convex/agent/blob/main/examples/rate-limiting/README.md#_snippet_4

LANGUAGE: typescript
CODE:

```
function estimateTokens(question: string) {
  // Assume roughly 4 characters per token
  return question.length / 4;
}
```

---

TITLE: Run the Rate Limiting Example Locally
DESCRIPTION: Instructions for setting up and running the rate limiting example project using npm commands. This involves initial setup, navigating to the example directory, installing dependencies, and starting the development server.
SOURCE: https://github.com/get-convex/agent/blob/main/examples/rate-limiting/README.md#_snippet_5

LANGUAGE: shell
CODE:

```
npm run setup
cd examples/rate-limiting
npm i
npm run dev
```

---

TITLE: Install Convex Agent Playground Package
DESCRIPTION: Install the `@convex-dev/agent-playground` npm package, which provides the frontend application for interacting with your Convex agent backend.
SOURCE: https://github.com/get-convex/agent/blob/main/playground/README.md#_snippet_0

LANGUAGE: Shell
CODE:

```
npm i @convex-dev/agent-playground
```

---

TITLE: Define and Expose Convex Agent Playground API
DESCRIPTION: Create `convex/playground.ts` to define and expose the necessary API endpoints for the frontend playground. This setup uses `definePlaygroundAPI` to link your agent components and handles authorization via API keys, which can be generated using `npx convex run --component agent apiKeys:issue`.
SOURCE: https://github.com/get-convex/agent/blob/main/playground/README.md#_snippet_1

LANGUAGE: TypeScript
CODE:

````
import { definePlaygroundAPI } from "@convex-dev/agent-playground";
import { components } from "./_generated/api";
import { weatherAgent, fashionAgent } from "./example";

/**
 * Here we expose the API so the frontend can access it.
 * Authorization is handled by passing up an apiKey that can be generated
 * on the dashboard or via CLI via:
 * ```
 * npx convex run --component agent apiKeys:issue
 * ```
 */
export const {
  isApiKeyValid,
  listAgents,
  listUsers,
  listThreads,
  listMessages,
  createThread,
  generateText,
  fetchPromptContext,
} = definePlaygroundAPI(components.agent, {
  agents: [weatherAgent, fashionAgent],
});
````

---

TITLE: Issue API Key for Convex Agent Backend
DESCRIPTION: Generate an API key from your project's repository to securely communicate with the Convex backend. Provide a unique name for each key; using the same name will revoke and reissue the key.
SOURCE: https://github.com/get-convex/agent/blob/main/playground/README.md#_snippet_2

LANGUAGE: Shell
CODE:

```
npx convex run --component agent apiKeys:issue '{name:"..."}'
```

---

TITLE: Run Convex Agent Playground Frontend
DESCRIPTION: Start the Agent Playground application. It typically uses the `VITE_CONVEX_URL` environment variable from `.env.local` and allows configuration of the API key and the path to the `playground.ts` file.
SOURCE: https://github.com/get-convex/agent/blob/main/playground/README.md#_snippet_3

LANGUAGE: Shell
CODE:

```
npx @convex-dev/agent-playground
```
